"use server";

// Server actions — dossier locataire et candidatures.
//
// Différence-clé avec le KYC bailleur : l'attribution du rôle LOCATAIRE
// est **self-service** (pas de validation admin). Dès qu'un user
// soumet un profil complet, il reçoit le grant. La vérification des
// documents est faite par chaque bailleur qui reçoit la candidature.
//
// Une candidature est figée au submit : on snapshot revenus + loyer +
// score. Toute évolution ultérieure du profil ne change pas le score
// des candidatures déjà soumises — le bailleur voit l'état au moment
// de la postulation.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ApplicationStatus,
  EmploymentType,
  GuarantorType,
  UserRole,
} from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { grantRole } from "@/lib/roles";
import { rateLimit } from "@/lib/rate-limit";
import { scoreTenantApplication } from "@/lib/tenant-score";

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
  return { error: "Formulaire invalide.", fieldErrors };
}

const profileSchema = z.object({
  employment: z.nativeEnum(EmploymentType),
  employer: z.string().trim().max(140).optional().or(z.literal("")),
  position: z.string().trim().max(140).optional().or(z.literal("")),
  monthlyIncome: z.coerce
    .number()
    .int()
    .min(0, "Revenus invalides.")
    .max(10_000_000, "Revenus invalides."),
  contractStartDate: z.coerce.date().optional().or(z.literal("")),
  contractEndDate: z.coerce.date().optional().or(z.literal("")),
  householdSize: z.coerce.number().int().min(1).max(20),
  hasChildren: z
    .union([z.literal("on"), z.literal("true"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
  smoker: z
    .union([z.literal("on"), z.literal("true"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
  hasPets: z
    .union([z.literal("on"), z.literal("true"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
  targetCitySlug: z
    .string()
    .trim()
    .max(60)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  maxBudget: z.coerce
    .number()
    .int()
    .min(0)
    .max(10_000_000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (typeof v === "number" && v > 0 ? v : null)),
  moveInDate: z
    .coerce
    .date()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v instanceof Date ? v : null)),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
});

/**
 * Soumet (ou met à jour) le dossier locataire. Dès que le profil est
 * « complet » (revenus + emploi remplis), on grant LOCATAIRE en
 * self-service pour donner accès au flux candidature.
 */
export async function submitTenantProfile(form: FormData): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Veuillez vous connecter." };
  }
  if (!hasDb()) {
    return { ok: false, error: "Base indisponible." };
  }

  const rl = await rateLimit({
    key: `tenant-profile:${session.user.id}`,
    limit: 20,
    windowSec: 3600,
  });
  if (!rl.success) {
    return { ok: false, error: "Trop de modifications. Réessayez plus tard." };
  }

  const parsed = profileSchema.safeParse({
    employment: form.get("employment") ?? undefined,
    employer: form.get("employer") ?? "",
    position: form.get("position") ?? "",
    monthlyIncome: form.get("monthlyIncome") ?? 0,
    contractStartDate: form.get("contractStartDate") ?? "",
    contractEndDate: form.get("contractEndDate") ?? "",
    householdSize: form.get("householdSize") ?? 1,
    hasChildren: form.get("hasChildren") ?? "",
    smoker: form.get("smoker") ?? "",
    hasPets: form.get("hasPets") ?? "",
    targetCitySlug: form.get("targetCitySlug") ?? "",
    maxBudget: form.get("maxBudget") ?? "",
    moveInDate: form.get("moveInDate") ?? "",
    bio: form.get("bio") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, ...flattenZod(parsed.error) };
  }
  const d = parsed.data;

  // Un profil est considéré « complet » dès qu'il est soumis et
  // validé par le schéma — à minima emploi + taille foyer. La qualité
  // du dossier (revenus, garants) est reflétée dans le scoring côté
  // candidature, pas dans ce flag binaire.
  const completed = true;

  const data = {
    employment: d.employment,
    employer: d.employer ? d.employer : null,
    position: d.position ? d.position : null,
    monthlyIncome: d.monthlyIncome,
    contractStartDate: d.contractStartDate instanceof Date ? d.contractStartDate : null,
    contractEndDate: d.contractEndDate instanceof Date ? d.contractEndDate : null,
    householdSize: d.householdSize,
    hasChildren: d.hasChildren,
    smoker: d.smoker,
    hasPets: d.hasPets,
    targetCitySlug: d.targetCitySlug,
    maxBudget: d.maxBudget,
    moveInDate: d.moveInDate,
    bio: d.bio ? d.bio : null,
    completed,
    completedAt: completed ? new Date() : null,
  };

  const profile = await db.tenantProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  // Grant LOCATAIRE au premier profil complet.
  if (completed) {
    try {
      await grantRole(session.user.id, UserRole.LOCATAIRE, {
        reason: "Dossier locataire renseigné",
      });
    } catch (err) {
      console.warn(
        "[tenant-profile] grantRole LOCATAIRE failed:",
        (err as Error).message,
      );
    }
  }

  revalidatePath("/locataire/dossier");
  revalidatePath("/locataire/candidatures");
  return { ok: true, id: profile.id };
}

const guarantorSchema = z.object({
  type: z.nativeEnum(GuarantorType),
  fullName: z.string().trim().min(2).max(140),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  relationship: z.string().trim().max(80).optional().or(z.literal("")),
  monthlyIncome: z.coerce
    .number()
    .int()
    .min(0)
    .max(10_000_000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (typeof v === "number" && v > 0 ? v : null)),
  employment: z
    .nativeEnum(EmploymentType)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? (v as EmploymentType) : null)),
  employer: z.string().trim().max(140).optional().or(z.literal("")),
});

export async function addGuarantor(form: FormData): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const profile = await db.tenantProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return {
      ok: false,
      error: "Complétez d'abord votre dossier locataire.",
    };
  }

  const parsed = guarantorSchema.safeParse({
    type: form.get("type") ?? undefined,
    fullName: form.get("fullName") ?? "",
    email: form.get("email") ?? "",
    phone: form.get("phone") ?? "",
    relationship: form.get("relationship") ?? "",
    monthlyIncome: form.get("monthlyIncome") ?? "",
    employment: form.get("employment") ?? "",
    employer: form.get("employer") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, ...flattenZod(parsed.error) };
  }
  const d = parsed.data;

  const g = await db.guarantor.create({
    data: {
      tenantProfileId: profile.id,
      type: d.type,
      fullName: d.fullName,
      email: d.email ? d.email : null,
      phone: d.phone ? d.phone : null,
      relationship: d.relationship ? d.relationship : null,
      monthlyIncome: d.monthlyIncome,
      employment: d.employment,
      employer: d.employer ? d.employer : null,
    },
    select: { id: true },
  });

  revalidatePath("/locataire/dossier");
  return { ok: true, id: g.id };
}

export async function deleteGuarantor(guarantorId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const g = await db.guarantor.findUnique({
    where: { id: guarantorId },
    select: { tenantProfile: { select: { userId: true } } },
  });
  if (!g || g.tenantProfile.userId !== session.user.id) {
    return { ok: false, error: "Accès refusé." };
  }
  await db.guarantor.delete({ where: { id: guarantorId } });
  revalidatePath("/locataire/dossier");
  return { ok: true };
}

/**
 * Postulation à une annonce. Vérifications :
 *   - user authentifié avec profil complet
 *   - annonce publiée et transaction = RENT
 *   - pas déjà postulé (unique [listingId, tenantUserId])
 *   - user n'est pas le propriétaire lui-même
 * Snapshot le scoring à la soumission.
 */
export async function applyToListing(
  listingId: string,
  message: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Connectez-vous." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };
  const userId = session.user.id;

  const rl = await rateLimit({
    key: `apply:${userId}`,
    limit: 20,
    windowSec: 3600,
  });
  if (!rl.success) {
    return { ok: false, error: "Trop de candidatures en peu de temps." };
  }

  const [listing, profile] = await Promise.all([
    db.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        transaction: true,
        status: true,
        price: true,
        charges: true,
        ownerId: true,
      },
    }),
    db.tenantProfile.findUnique({
      where: { userId },
      include: { guarantors: true },
    }),
  ]);

  if (!listing) return { ok: false, error: "Annonce introuvable." };
  if (listing.transaction !== "RENT") {
    return { ok: false, error: "Candidature réservée aux locations." };
  }
  if (listing.status !== "PUBLISHED") {
    return { ok: false, error: "Cette annonce n'accepte plus de candidatures." };
  }
  if (listing.ownerId === userId) {
    return { ok: false, error: "Vous ne pouvez pas candidater à votre propre annonce." };
  }
  if (!profile?.completed) {
    return {
      ok: false,
      error: "Complétez votre dossier locataire avant de candidater.",
    };
  }

  const existing = await db.tenantApplication.findUnique({
    where: {
      listingId_tenantUserId: { listingId, tenantUserId: userId },
    },
    select: { id: true, status: true },
  });
  if (existing && existing.status !== ApplicationStatus.WITHDRAWN) {
    return { ok: false, error: "Vous avez déjà candidaté à cette annonce." };
  }

  const totalRent = listing.price + (listing.charges ?? 0);
  const score = scoreTenantApplication({
    monthlyIncome: profile.monthlyIncome,
    rent: totalRent,
    employment: profile.employment,
    contractEndDate: profile.contractEndDate,
    guarantors: profile.guarantors.map((g) => ({
      monthlyIncome: g.monthlyIncome,
      employment: g.employment,
      type: g.type,
    })),
  });

  const cleanedMessage = message.trim().slice(0, 2000);

  const baseData = {
    status: ApplicationStatus.PENDING,
    message: cleanedMessage || null,
    score: score.score,
    scoreLabel: score.label,
    scoreReasons: score.reasons,
    snapshotIncome: profile.monthlyIncome,
    snapshotRent: totalRent,
    snapshotRatio: score.ratio,
    submittedAt: new Date(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
  };

  let app;
  if (existing) {
    app = await db.tenantApplication.update({
      where: { id: existing.id },
      data: baseData,
      select: { id: true },
    });
  } else {
    app = await db.tenantApplication.create({
      data: {
        listingId,
        tenantUserId: userId,
        tenantProfileId: profile.id,
        ...baseData,
      },
      select: { id: true },
    });
  }

  revalidatePath("/locataire/candidatures");
  revalidatePath("/bailleur/candidatures");
  return { ok: true, id: app.id };
}

export async function withdrawApplication(applicationId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const app = await db.tenantApplication.findUnique({
    where: { id: applicationId },
    select: { tenantUserId: true },
  });
  if (!app || app.tenantUserId !== session.user.id) {
    return { ok: false, error: "Accès refusé." };
  }

  await db.tenantApplication.update({
    where: { id: applicationId },
    data: {
      status: ApplicationStatus.WITHDRAWN,
    },
  });

  revalidatePath("/locataire/candidatures");
  revalidatePath("/bailleur/candidatures");
  return { ok: true };
}

const statusUpdate = z.object({
  status: z.nativeEnum(ApplicationStatus),
  reason: z.string().trim().max(500).optional(),
});

/**
 * Le bailleur met à jour le statut d'une candidature reçue sur une de
 * ses annonces. Accès : owner ou agencyId-match.
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  reason?: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const parsed = statusUpdate.safeParse({ status, reason });
  if (!parsed.success) {
    return { ok: false, error: "Statut invalide." };
  }

  const app = await db.tenantApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      listing: { select: { ownerId: true, agencyId: true } },
    },
  });
  if (!app) return { ok: false, error: "Candidature introuvable." };
  const canReview =
    app.listing.ownerId === session.user.id ||
    (session.user.agencyId && app.listing.agencyId === session.user.agencyId);
  if (!canReview) return { ok: false, error: "Accès refusé." };

  await db.tenantApplication.update({
    where: { id: applicationId },
    data: {
      status: parsed.data.status,
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
      rejectionReason:
        parsed.data.status === ApplicationStatus.REJECTED
          ? parsed.data.reason?.trim() || null
          : null,
    },
  });

  revalidatePath("/bailleur/candidatures");
  revalidatePath("/locataire/candidatures");
  return { ok: true };
}
