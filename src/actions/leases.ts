"use server";

// Server actions — génération & workflow bail.
//
// Workflow :
//   DRAFT (édition des clauses)
//     → generateLeasePdf → GENERATED (PDF dans bucket privé)
//     → uploadSignedLease → SIGNED_UPLOADED (PDF signé remplace)
//     → activateLease → ACTIVE (déclenche la gestion locative)
//     → terminateLease → TERMINATED (fin anticipée)
//
// Aucune signature électronique en V1. Le bailleur et le locataire
// téléchargent le PDF, le signent physiquement (noir/blanc, A4), le
// re-scannent en un seul PDF, puis l'un des deux (indifféremment)
// l'uploade via l'action dédiée.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LeaseStatus, LeaseFurnishing } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import {
  isPrivateStorageEnabled,
  uploadToPrivateStorage,
} from "@/lib/storage";
import { LeasePdfDocument, type LeasePdfData } from "@/lib/lease-pdf";
import {
  isYousignEnabled,
  createSignatureProcedure,
  cancelSignatureProcedure,
} from "@/lib/yousign";
import {
  sendEmail,
} from "@/lib/resend";
import {
  leaseReadyForSignatureEmail,
  leaseActivatedEmail,
} from "@/lib/email-templates";
import { createNotification } from "@/lib/notifications";

type Result =
  | { ok: true; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function flattenZod(err: z.ZodError): {
  error: string;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    fieldErrors[issue.path.join(".")] = issue.message;
  }
  return { error: "Données invalides.", fieldErrors };
}

async function assertLandlord(
  userId: string,
  agencyId: string | null | undefined,
  landlordUserId: string,
  listingAgencyId: string | null,
): Promise<boolean> {
  if (landlordUserId === userId) return true;
  if (agencyId && listingAgencyId === agencyId) return true;
  return false;
}

const FURNISHING_VALUES = ["FURNISHED", "UNFURNISHED", "SEMI_FURNISHED"] as const;

const draftSchema = z.object({
  monthlyRent: z.coerce.number().int().min(0).max(10_000_000),
  monthlyCharges: z.coerce.number().int().min(0).max(10_000_000).default(0),
  depositAmount: z.coerce.number().int().min(0).max(20_000_000),
  paymentDay: z.coerce.number().int().min(1).max(28).default(1),
  startDate: z.coerce.date(),
  endDate: z
    .union([z.coerce.date(), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v instanceof Date ? v : null)),
  noticePeriodDays: z.coerce.number().int().min(30).max(365).default(90),
  furnishing: z.enum(FURNISHING_VALUES),
  propertyAddress: z.string().trim().min(5).max(400),
  propertyCity: z.string().trim().min(2).max(100),
  propertySurface: z.coerce.number().int().min(1).max(10_000),
  specialClauses: z.string().trim().max(10_000).optional().or(z.literal("")),
});

/**
 * Crée un Lease DRAFT à partir d'une candidature ACCEPTED. Idempotent
 * via Application.lease (unique) — un second appel retourne l'existant.
 */
export async function createLeaseFromApplication(
  applicationId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const app = await db.tenantApplication.findUnique({
    where: { id: applicationId },
    include: {
      listing: {
        select: {
          id: true,
          ownerId: true,
          agencyId: true,
          title: true,
          price: true,
          charges: true,
          surface: true,
          addressLine: true,
          propertyId: true,
          city: { select: { name: true } },
        },
      },
      lease: { select: { id: true } },
    },
  });
  if (!app) return { ok: false, error: "Candidature introuvable." };

  const canCreate = await assertLandlord(
    session.user.id,
    session.user.agencyId,
    app.listing.ownerId,
    app.listing.agencyId,
  );
  if (!canCreate) return { ok: false, error: "Accès refusé." };
  if (app.status !== "ACCEPTED") {
    return {
      ok: false,
      error: "La candidature doit être acceptée avant de générer un bail.",
    };
  }

  // Idempotence — retourne le bail déjà créé pour cette candidature.
  if (app.lease) {
    return { ok: true, id: app.lease.id };
  }

  // Valeurs par défaut : démarrage dans 15 jours, durée 1 an, caution
  // = 2 mois de loyer (pratique standard Maroc), paiement au 1er.
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 15);
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const monthlyRent = app.listing.price;
  const monthlyCharges = app.listing.charges ?? 0;
  const depositAmount = monthlyRent * 2;

  const addressFull = [
    app.listing.addressLine,
    app.listing.city.name,
  ]
    .filter(Boolean)
    .join(", ");

  const lease = await db.lease.create({
    data: {
      listingId: app.listing.id,
      propertyId: app.listing.propertyId,
      landlordUserId: app.listing.ownerId,
      tenantUserId: app.tenantUserId,
      applicationId: app.id,
      status: LeaseStatus.DRAFT,
      monthlyRent,
      monthlyCharges,
      depositAmount,
      paymentDay: 1,
      startDate,
      endDate,
      noticePeriodDays: 90,
      furnishing: LeaseFurnishing.UNFURNISHED,
      propertyAddress: addressFull || app.listing.title,
      propertyCity: app.listing.city.name,
      propertySurface: app.listing.surface,
    },
    select: { id: true },
  });

  revalidatePath("/bailleur/baux");
  revalidatePath(`/bailleur/candidatures/${app.id}`);
  return { ok: true, id: lease.id };
}

export async function updateLeaseDraft(
  leaseId: string,
  form: FormData,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      landlordUserId: true,
      listing: { select: { agencyId: true } },
    },
  });
  if (!lease) return { ok: false, error: "Bail introuvable." };
  const canEdit = await assertLandlord(
    session.user.id,
    session.user.agencyId,
    lease.landlordUserId,
    lease.listing?.agencyId ?? null,
  );
  if (!canEdit) return { ok: false, error: "Accès refusé." };
  if (lease.status !== LeaseStatus.DRAFT) {
    return {
      ok: false,
      error: "Le bail n'est plus modifiable à ce stade.",
    };
  }

  const parsed = draftSchema.safeParse({
    monthlyRent: form.get("monthlyRent") ?? 0,
    monthlyCharges: form.get("monthlyCharges") ?? 0,
    depositAmount: form.get("depositAmount") ?? 0,
    paymentDay: form.get("paymentDay") ?? 1,
    startDate: form.get("startDate") ?? "",
    endDate: form.get("endDate") ?? "",
    noticePeriodDays: form.get("noticePeriodDays") ?? 90,
    furnishing: form.get("furnishing") ?? "UNFURNISHED",
    propertyAddress: form.get("propertyAddress") ?? "",
    propertyCity: form.get("propertyCity") ?? "",
    propertySurface: form.get("propertySurface") ?? 0,
    specialClauses: form.get("specialClauses") ?? "",
  });
  if (!parsed.success) return { ok: false, ...flattenZod(parsed.error) };
  const d = parsed.data;

  await db.lease.update({
    where: { id: leaseId },
    data: {
      monthlyRent: d.monthlyRent,
      monthlyCharges: d.monthlyCharges,
      depositAmount: d.depositAmount,
      paymentDay: d.paymentDay,
      startDate: d.startDate,
      endDate: d.endDate,
      noticePeriodDays: d.noticePeriodDays,
      furnishing: d.furnishing as LeaseFurnishing,
      propertyAddress: d.propertyAddress,
      propertyCity: d.propertyCity,
      propertySurface: d.propertySurface,
      specialClauses: d.specialClauses ? d.specialClauses : null,
    },
  });

  revalidatePath(`/bailleur/baux/${leaseId}`);
  return { ok: true };
}

/**
 * Génère le PDF et l'uploade dans le bucket privé. Rend le bail en
 * statut GENERATED — plus modifiable via updateLeaseDraft.
 */
export async function generateLeasePdf(leaseId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };
  if (!isPrivateStorageEnabled()) {
    return {
      ok: false,
      error:
        "L'espace documents privé n'est pas encore provisionné. Réessayez plus tard.",
    };
  }

  const rl = await rateLimit({
    key: `lease-pdf:${session.user.id}`,
    limit: 30,
    windowSec: 3600,
  });
  if (!rl.success) return { ok: false, error: "Trop de générations." };

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    include: {
      listing: { select: { agencyId: true } },
      landlordUser: { select: { name: true, email: true } },
      tenantUser: { select: { name: true, email: true } },
    },
  });
  if (!lease) return { ok: false, error: "Bail introuvable." };
  const canGenerate = await assertLandlord(
    session.user.id,
    session.user.agencyId,
    lease.landlordUserId,
    lease.listing?.agencyId ?? null,
  );
  if (!canGenerate) return { ok: false, error: "Accès refusé." };
  if (
    lease.status !== LeaseStatus.DRAFT &&
    lease.status !== LeaseStatus.GENERATED
  ) {
    return {
      ok: false,
      error: "Génération impossible à ce stade du workflow.",
    };
  }

  // Récupère les pièces d'identité depuis KYC bailleur si dispo, pour
  // enrichir le PDF. Le locataire n'a pas de KYC obligatoire — on
  // laisse vide si inexistant.
  const landlordKyc = await db.landlordVerification.findUnique({
    where: { userId: lease.landlordUserId },
    select: { idNumber: true },
  });

  const pdfData: LeasePdfData = {
    leaseId: lease.id,
    landlord: {
      name: lease.landlordUser.name ?? lease.landlordUser.email,
      idNumber: landlordKyc?.idNumber ?? null,
      address: lease.propertyCity, // pas d'adresse personnelle en DB — on met la ville par défaut
    },
    tenant: {
      name: lease.tenantUser.name ?? lease.tenantUser.email,
      idNumber: null,
      address: lease.propertyCity,
    },
    property: {
      address: lease.propertyAddress,
      city: lease.propertyCity,
      surface: lease.propertySurface,
      furnishing: lease.furnishing,
    },
    terms: {
      startDate: lease.startDate,
      endDate: lease.endDate,
      monthlyRent: lease.monthlyRent,
      monthlyCharges: lease.monthlyCharges,
      depositAmount: lease.depositAmount,
      paymentDay: lease.paymentDay,
      noticePeriodDays: lease.noticePeriodDays,
    },
    specialClauses: lease.specialClauses,
    generatedAt: new Date(),
  };

  // Import dynamique côté serveur pour éviter d'inclure @react-pdf
  // dans le bundle client.
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const element = LeasePdfDocument({ data: pdfData });
  const buffer: Buffer = await renderToBuffer(element);

  const path = `leases/${lease.id}/${Date.now()}-generated.pdf`;
  try {
    await uploadToPrivateStorage({
      objectPath: path,
      body: buffer,
      contentType: "application/pdf",
    });
  } catch (err) {
    console.error("[leases/generate] upload failed:", (err as Error).message);
    return { ok: false, error: "Stockage indisponible — réessayez." };
  }

  const doc = await db.documentVault.create({
    data: {
      userId: session.user.id,
      category: "LEASE",
      path,
      filename: `bail-${lease.id.slice(-8)}.pdf`,
      mimeType: "application/pdf",
      size: buffer.byteLength,
      relatedEntityId: lease.id,
    },
    select: { id: true },
  });

  await db.lease.update({
    where: { id: lease.id },
    data: {
      status: LeaseStatus.GENERATED,
      generatedDocId: doc.id,
      generatedAt: new Date(),
      // Si on régénère, on invalide la version signée précédente
      // (cas rare, mais safe).
      signedDocId: null,
      signedUploadedAt: null,
    },
  });

  revalidatePath(`/bailleur/baux/${lease.id}`);
  revalidatePath(`/locataire/baux/${lease.id}`);
  return { ok: true };
}

const MAX_SIGNED_SIZE = 20 * 1024 * 1024; // 20 MB

/**
 * Upload de la version signée par les deux parties. Autorisé au
 * bailleur OU au locataire (pratique : le premier qui la scanne
 * l'uploade).
 */
export async function uploadSignedLease(
  leaseId: string,
  form: FormData,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };
  if (!isPrivateStorageEnabled()) {
    return { ok: false, error: "Espace documents privé indisponible." };
  }

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      landlordUserId: true,
      tenantUserId: true,
      listing: { select: { agencyId: true } },
    },
  });
  if (!lease) return { ok: false, error: "Bail introuvable." };

  const isLandlord = await assertLandlord(
    session.user.id,
    session.user.agencyId,
    lease.landlordUserId,
    lease.listing?.agencyId ?? null,
  );
  const isTenant = lease.tenantUserId === session.user.id;
  if (!isLandlord && !isTenant) {
    return { ok: false, error: "Accès refusé." };
  }

  if (
    lease.status !== LeaseStatus.GENERATED &&
    lease.status !== LeaseStatus.SIGNED_UPLOADED
  ) {
    return {
      ok: false,
      error: "Générez d'abord le PDF avant d'uploader la version signée.",
    };
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Fichier requis." };
  }
  if (file.type !== "application/pdf") {
    return { ok: false, error: "Seuls les PDF sont acceptés." };
  }
  if (file.size > MAX_SIGNED_SIZE) {
    return { ok: false, error: "Fichier trop volumineux (max 20 Mo)." };
  }

  const path = `leases/${lease.id}/${Date.now()}-signed.pdf`;
  try {
    const buf = await file.arrayBuffer();
    await uploadToPrivateStorage({
      objectPath: path,
      body: buf,
      contentType: "application/pdf",
    });
  } catch (err) {
    console.error("[leases/signed] upload failed:", (err as Error).message);
    return { ok: false, error: "Upload échoué." };
  }

  const doc = await db.documentVault.create({
    data: {
      userId: session.user.id,
      category: "LEASE",
      path,
      filename: `bail-${lease.id.slice(-8)}-signed.pdf`,
      mimeType: "application/pdf",
      size: file.size,
      relatedEntityId: lease.id,
    },
    select: { id: true },
  });

  await db.lease.update({
    where: { id: lease.id },
    data: {
      status: LeaseStatus.SIGNED_UPLOADED,
      signedDocId: doc.id,
      signedUploadedAt: new Date(),
    },
  });

  revalidatePath(`/bailleur/baux/${lease.id}`);
  revalidatePath(`/locataire/baux/${lease.id}`);
  return { ok: true };
}

/**
 * Activation — bailleur valide que le bail est bien signé des deux
 * côtés et que la location commence. Déclenche l'archivage de la
 * candidature gagnante côté UI (Brique 3) et prépare la gestion
 * locative (Brique 7).
 */
export async function activateLease(leaseId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      landlordUserId: true,
      listing: { select: { agencyId: true, id: true } },
    },
  });
  if (!lease) return { ok: false, error: "Bail introuvable." };
  const canActivate = await assertLandlord(
    session.user.id,
    session.user.agencyId,
    lease.landlordUserId,
    lease.listing?.agencyId ?? null,
  );
  if (!canActivate) return { ok: false, error: "Accès refusé." };

  if (lease.status === LeaseStatus.ACTIVE) return { ok: true };
  if (lease.status !== LeaseStatus.SIGNED_UPLOADED) {
    return {
      ok: false,
      error:
        "Uploadez la version signée des deux parties avant d'activer le bail.",
    };
  }

  await db.lease.update({
    where: { id: lease.id },
    data: {
      status: LeaseStatus.ACTIVE,
      activatedAt: new Date(),
      activatedBy: session.user.id,
    },
  });

  // Email + notif locataire — best-effort, non bloquant.
  try {
    const full = await db.lease.findUnique({
      where: { id: lease.id },
      select: {
        propertyAddress: true,
        propertyCity: true,
        startDate: true,
        tenantUserId: true,
        tenantUser: { select: { name: true, email: true } },
      },
    });
    if (full) {
      const tpl = leaseActivatedEmail({
        tenantName: full.tenantUser.name ?? full.tenantUser.email.split("@")[0],
        listingTitle: `${full.propertyAddress}, ${full.propertyCity}`,
        leaseId: lease.id,
        startDate: full.startDate.toLocaleDateString("fr-FR", { dateStyle: "long" }),
      });
      await sendEmail({
        to: full.tenantUser.email,
        subject: tpl.subject,
        html: tpl.html,
      });
      await createNotification({
        userId: full.tenantUserId,
        type: "LEASE_ACTIVATED",
        title: "Votre bail est activé",
        body: `${full.propertyAddress} — le bail démarre le ${full.startDate.toLocaleDateString("fr-FR")}`,
        linkUrl: `/locataire/baux/${lease.id}`,
        entityType: "Lease",
        entityId: lease.id,
      });
    }
  } catch {
    /* best-effort */
  }

  revalidatePath(`/bailleur/baux/${lease.id}`);
  revalidatePath(`/locataire/baux/${lease.id}`);
  revalidatePath("/bailleur/baux");
  revalidatePath("/locataire/baux");
  return { ok: true };
}

/**
 * Envoie le PDF généré pour signature électronique via Yousign.
 * Si Yousign n'est pas configuré, renvoie un message explicite et le
 * bailleur garde l'option d'upload manuel. Si envoi OK, lease passe
 * à signatureStatus=PENDING, lease.status reste GENERATED jusqu'au
 * callback.
 */
export async function sendLeaseForSignature(
  leaseId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };
  if (!isYousignEnabled()) {
    return {
      ok: false,
      error:
        "Signature électronique non configurée. Utilisez l'upload manuel.",
    };
  }

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    include: {
      landlordUser: { select: { id: true, name: true, email: true, phone: true } },
      tenantUser: { select: { id: true, name: true, email: true, phone: true } },
      listing: { select: { agencyId: true } },
      generatedDoc: { select: { path: true, filename: true } },
    },
  });
  if (!lease) return { ok: false, error: "Bail introuvable." };
  const canSend = await assertLandlord(
    session.user.id,
    session.user.agencyId,
    lease.landlordUserId,
    lease.listing?.agencyId ?? null,
  );
  if (!canSend) return { ok: false, error: "Accès refusé." };
  if (lease.status !== LeaseStatus.GENERATED) {
    return {
      ok: false,
      error: "Générez d'abord le PDF avant l'envoi en signature.",
    };
  }
  if (!lease.generatedDoc) {
    return { ok: false, error: "PDF source introuvable." };
  }

  // On récupère le PDF depuis Supabase Storage pour le re-uploader à
  // Yousign. On utilise signedUrl + fetch binaire.
  const { signedUrlForPrivate } = await import("@/lib/storage");
  const signedUrl = await signedUrlForPrivate(
    lease.generatedDoc.path,
    300,
  ).catch(() => null);
  if (!signedUrl) {
    return { ok: false, error: "Impossible de lire le PDF généré." };
  }
  const resPdf = await fetch(signedUrl);
  if (!resPdf.ok) return { ok: false, error: "Lecture PDF échouée." };
  const pdfBuffer = Buffer.from(await resPdf.arrayBuffer());

  const [llFirst, ...llRest] = (lease.landlordUser.name ?? "Bailleur")
    .split(" ");
  const [tnFirst, ...tnRest] = (lease.tenantUser.name ?? "Locataire")
    .split(" ");

  const result = await createSignatureProcedure({
    name: `Bail ${lease.id.slice(-8).toUpperCase()}`,
    pdfBuffer,
    signers: [
      {
        firstName: llFirst,
        lastName: llRest.join(" ") || llFirst,
        email: lease.landlordUser.email,
        phone: lease.landlordUser.phone ?? undefined,
        role: "landlord",
      },
      {
        firstName: tnFirst,
        lastName: tnRest.join(" ") || tnFirst,
        email: lease.tenantUser.email,
        phone: lease.tenantUser.phone ?? undefined,
        role: "tenant",
      },
    ],
    metadata: { leaseId: lease.id },
  });

  if (!result.ok) {
    if ("skipped" in result) {
      return { ok: false, error: result.reason };
    }
    return { ok: false, error: result.error };
  }

  await db.lease.update({
    where: { id: lease.id },
    data: {
      signatureProvider: "yousign",
      signatureProviderId: result.signatureRequestId,
      signatureStatus: "PENDING",
      signatureRequestedAt: new Date(),
    },
  });

  // Email + notif locataire
  const tpl = leaseReadyForSignatureEmail({
    tenantName: lease.tenantUser.name ?? lease.tenantUser.email.split("@")[0],
    listingTitle: `${lease.propertyAddress}, ${lease.propertyCity}`,
    leaseId: lease.id,
    hasESignature: true,
  });
  await sendEmail({
    to: lease.tenantUser.email,
    subject: tpl.subject,
    html: tpl.html,
  });
  await createNotification({
    userId: lease.tenantUserId,
    type: "LEASE_GENERATED",
    title: "Votre bail est à signer",
    body: "Cliquez pour signer électroniquement votre bail.",
    linkUrl: `/locataire/baux/${lease.id}`,
    entityType: "Lease",
    entityId: lease.id,
  });

  revalidatePath(`/bailleur/baux/${lease.id}`);
  revalidatePath(`/locataire/baux/${lease.id}`);
  return { ok: true };
}

export async function cancelLeaseSignature(
  leaseId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      signatureProviderId: true,
      landlordUserId: true,
      listing: { select: { agencyId: true } },
    },
  });
  if (!lease) return { ok: false, error: "Bail introuvable." };
  const canCancel = await assertLandlord(
    session.user.id,
    session.user.agencyId,
    lease.landlordUserId,
    lease.listing?.agencyId ?? null,
  );
  if (!canCancel) return { ok: false, error: "Accès refusé." };

  if (lease.signatureProviderId) {
    await cancelSignatureProcedure(lease.signatureProviderId);
  }
  await db.lease.update({
    where: { id: lease.id },
    data: {
      signatureStatus: "NONE",
      signatureProviderId: null,
      signatureProvider: null,
      signatureRequestedAt: null,
    },
  });
  revalidatePath(`/bailleur/baux/${lease.id}`);
  return { ok: true };
}

export async function terminateLease(
  leaseId: string,
  reason: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const cleaned = reason.trim().slice(0, 2000);
  if (cleaned.length < 5) {
    return { ok: false, error: "Motif trop court (min. 5 caractères)." };
  }

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      landlordUserId: true,
      listing: { select: { agencyId: true } },
    },
  });
  if (!lease) return { ok: false, error: "Bail introuvable." };
  const canTerminate = await assertLandlord(
    session.user.id,
    session.user.agencyId,
    lease.landlordUserId,
    lease.listing?.agencyId ?? null,
  );
  if (!canTerminate) return { ok: false, error: "Accès refusé." };
  if (lease.status !== LeaseStatus.ACTIVE) {
    return { ok: false, error: "Seul un bail actif peut être résilié." };
  }

  await db.lease.update({
    where: { id: lease.id },
    data: {
      status: LeaseStatus.TERMINATED,
      terminatedAt: new Date(),
      terminationReason: cleaned,
    },
  });

  revalidatePath(`/bailleur/baux/${lease.id}`);
  revalidatePath(`/locataire/baux/${lease.id}`);
  return { ok: true };
}
