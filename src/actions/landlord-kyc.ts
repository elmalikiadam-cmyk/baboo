"use server";

// Server actions — dossier KYC bailleur.
//
// Flux :
//   1. Le bailleur potentiel remplit `/bailleur/onboarding` et soumet.
//      `submitLandlordKyc()` crée ou met à jour un LandlordVerification
//      en statut PENDING, stocke les 3 documents (CIN recto, CIN verso,
//      preuve de droit) dans le bucket privé Supabase, persistant la
//      référence dans DocumentVault.
//   2. Un ADMIN consulte `/admin/kyc`, ouvre le dossier, approuve ou
//      rejette.
//   3. À l'approbation : `grantRole(userId, BAILLEUR)` — le user reçoit
//      le droit de publier via `/pro/listings/new`.
//
// Sécurité :
//   - Rate-limit sur submit (évite un bot qui mitraille d'uploads).
//   - Taille max 8 Mo / fichier, types restreints (image ou PDF).
//   - Les URLs des docs ne sont JAMAIS persistées — on garde seulement
//     le `path` dans le bucket privé. Les signed URLs sont émises à la
//     demande par l'admin via /admin/kyc.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { KycIdType, KycOwnershipType, UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { grantRole } from "@/lib/roles";
import { rateLimit } from "@/lib/rate-limit";
import {
  isPrivateStorageEnabled,
  uploadToPrivateStorage,
} from "@/lib/storage";

type Result =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
]);

const submitSchema = z.object({
  idType: z.nativeEnum(KycIdType),
  idNumber: z
    .string()
    .trim()
    .min(4, "Numéro d'identité trop court.")
    .max(40, "Numéro d'identité trop long.")
    .optional()
    .or(z.literal("")),
  ownershipType: z.nativeEnum(KycOwnershipType),
  attestation: z
    .literal("on")
    .or(z.literal("true"))
    .transform(() => true),
  ibanLast4: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "4 chiffres attendus.")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function extFromMime(mime: string): string {
  if (mime === "application/pdf") return "pdf";
  const sub = mime.split("/")[1] ?? "bin";
  return sub === "jpeg" ? "jpg" : sub;
}

async function validateFile(
  file: unknown,
  fieldName: string,
): Promise<{ ok: true; file: File } | { ok: false; error: string; field: string }> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Fichier requis.", field: fieldName };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Format non supporté (JPEG/PNG/WebP/PDF).",
      field: fieldName,
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      error: "Fichier trop volumineux (max 8 Mo).",
      field: fieldName,
    };
  }
  return { ok: true, file };
}

/**
 * Soumission (ou re-soumission après rejet) du dossier KYC bailleur.
 */
export async function submitLandlordKyc(form: FormData): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Veuillez vous connecter." };
  }
  if (!hasDb()) {
    return { ok: false, error: "Base de données indisponible." };
  }
  if (!isPrivateStorageEnabled()) {
    return {
      ok: false,
      error:
        "L'espace sécurisé documents n'est pas encore provisionné. Réessayez plus tard ou contactez l'équipe Baboo.",
    };
  }

  const userId = session.user.id;

  // Rate-limit — max 5 soumissions par user par heure.
  const rl = await rateLimit({
    key: `kyc-submit:${userId}`,
    limit: 5,
    windowSec: 3600,
  });
  if (!rl.success) {
    return {
      ok: false,
      error: "Trop de tentatives. Réessayez plus tard.",
    };
  }

  // Parse champs texte
  const parsed = submitSchema.safeParse({
    idType: form.get("idType") ?? undefined,
    idNumber: form.get("idNumber") ?? "",
    ownershipType: form.get("ownershipType") ?? undefined,
    attestation: form.get("attestation") ?? undefined,
    ibanLast4: form.get("ibanLast4") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { ok: false, error: "Formulaire invalide.", fieldErrors };
  }
  if (!parsed.data.attestation) {
    return {
      ok: false,
      error: "Vous devez attester être habilité à louer ce bien.",
      fieldErrors: { attestation: "Attestation obligatoire." },
    };
  }

  // Fichiers
  const idFront = await validateFile(form.get("idFront"), "idFront");
  if (!idFront.ok) {
    return { ok: false, error: idFront.error, fieldErrors: { [idFront.field]: idFront.error } };
  }
  const idBack = await validateFile(form.get("idBack"), "idBack");
  if (!idBack.ok) {
    return { ok: false, error: idBack.error, fieldErrors: { [idBack.field]: idBack.error } };
  }
  const ownership = await validateFile(form.get("ownership"), "ownership");
  if (!ownership.ok) {
    return {
      ok: false,
      error: ownership.error,
      fieldErrors: { [ownership.field]: ownership.error },
    };
  }
  // RIB optionnel
  const ribRaw = form.get("rib");
  const rib =
    ribRaw instanceof File && ribRaw.size > 0
      ? await validateFile(ribRaw, "rib")
      : null;
  if (rib && !rib.ok) {
    return { ok: false, error: rib.error, fieldErrors: { [rib.field]: rib.error } };
  }

  // Upload dans le bucket privé. Chemin structuré pour faciliter audit /
  // purge : kyc/<userId>/<timestamp>-<random>.<ext>
  async function persist(
    file: File,
    category:
      | "KYC_ID"
      | "KYC_OWNERSHIP"
      | "KYC_RIB",
  ) {
    const ext = extFromMime(file.type);
    const path = `kyc/${userId}/${Date.now()}-${randomId()}.${ext}`;
    const buf = await file.arrayBuffer();
    await uploadToPrivateStorage({
      objectPath: path,
      body: buf,
      contentType: file.type,
    });
    const doc = await db.documentVault.create({
      data: {
        userId,
        category,
        path,
        filename: file.name.slice(0, 200),
        mimeType: file.type,
        size: file.size,
      },
      select: { id: true },
    });
    return doc.id;
  }

  let idFrontDocId: string;
  let idBackDocId: string;
  let ownershipDocId: string;
  let ribDocId: string | null = null;
  try {
    idFrontDocId = await persist(idFront.file, "KYC_ID");
    idBackDocId = await persist(idBack.file, "KYC_ID");
    ownershipDocId = await persist(ownership.file, "KYC_OWNERSHIP");
    if (rib && rib.ok) {
      ribDocId = await persist(rib.file, "KYC_RIB");
    }
  } catch (err) {
    console.error("[kyc/submit] upload failed:", (err as Error).message);
    return {
      ok: false,
      error: "Upload échoué. Réessayez dans un instant.",
    };
  }

  // Upsert — si une soumission précédente existe (REJECTED), on la
  // réouvre en PENDING. On garde l'id stable pour l'historique.
  await db.landlordVerification.upsert({
    where: { userId },
    create: {
      userId,
      status: "PENDING",
      idType: parsed.data.idType,
      idNumber: parsed.data.idNumber || null,
      idFrontDocId,
      idBackDocId,
      ownershipType: parsed.data.ownershipType,
      ownershipDocId,
      attestation: true,
      ribDocId,
      ibanLast4: parsed.data.ibanLast4,
      submittedAt: new Date(),
    },
    update: {
      status: "PENDING",
      idType: parsed.data.idType,
      idNumber: parsed.data.idNumber || null,
      idFrontDocId,
      idBackDocId,
      ownershipType: parsed.data.ownershipType,
      ownershipDocId,
      attestation: true,
      ribDocId,
      ibanLast4: parsed.data.ibanLast4,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
    },
  });

  revalidatePath("/bailleur/onboarding");
  revalidatePath("/bailleur/onboarding/status");
  revalidatePath("/admin/kyc");
  return { ok: true };
}

/**
 * Approbation d'un dossier par un admin. Déclenche grantRole(BAILLEUR).
 */
export async function approveLandlordKyc(
  verificationId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (session.user.role !== "ADMIN") {
    return { ok: false, error: "Accès refusé." };
  }
  if (!hasDb()) return { ok: false, error: "DB indisponible." };

  const v = await db.landlordVerification.findUnique({
    where: { id: verificationId },
    select: { id: true, userId: true, status: true },
  });
  if (!v) return { ok: false, error: "Dossier introuvable." };
  if (v.status === "APPROVED") {
    return { ok: true }; // idempotent
  }

  await db.landlordVerification.update({
    where: { id: v.id },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
      rejectionReason: null,
    },
  });

  await grantRole(v.userId, UserRole.BAILLEUR, {
    grantedBy: session.user.id,
    reason: "KYC bailleur approuvé",
  });

  revalidatePath("/admin/kyc");
  revalidatePath("/bailleur/onboarding/status");
  return { ok: true };
}

/**
 * Rejet d'un dossier avec raison (affichée au bailleur).
 */
export async function rejectLandlordKyc(
  verificationId: string,
  reason: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (session.user.role !== "ADMIN") {
    return { ok: false, error: "Accès refusé." };
  }
  if (!hasDb()) return { ok: false, error: "DB indisponible." };

  const cleaned = reason.trim().slice(0, 500);
  if (cleaned.length < 5) {
    return {
      ok: false,
      error: "Raison trop courte (min. 5 caractères).",
    };
  }

  const v = await db.landlordVerification.findUnique({
    where: { id: verificationId },
    select: { id: true, userId: true },
  });
  if (!v) return { ok: false, error: "Dossier introuvable." };

  await db.landlordVerification.update({
    where: { id: v.id },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
      rejectionReason: cleaned,
    },
  });

  revalidatePath("/admin/kyc");
  revalidatePath("/bailleur/onboarding/status");
  return { ok: true };
}
