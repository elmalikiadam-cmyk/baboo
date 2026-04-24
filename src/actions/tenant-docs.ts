"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import {
  isPrivateStorageEnabled,
  uploadToPrivateStorage,
  deleteFromPrivateStorage,
} from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";

type Result = { ok: true; id?: string } | { ok: false; error: string };

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

function randId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Upload d'un justificatif locataire (fiche de paie, avis d'imposition,
 * attestation CAF, pièce ID). Stocké dans DocumentVault avec category
 * TENANT_DOSSIER et relatedEntityId = tenantProfileId. Visible par le
 * bailleur quand la candidature est ACCEPTED (via signed URL).
 */
export async function uploadTenantDocument(
  form: FormData,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };
  if (!isPrivateStorageEnabled()) {
    return {
      ok: false,
      error: "Espace documents privé indisponible.",
    };
  }
  const rl = await rateLimit({
    key: `tenant-doc:${session.user.id}`,
    limit: 30,
    windowSec: 3600,
  });
  if (!rl.success) return { ok: false, error: "Trop d'uploads récents." };

  const profile = await db.tenantProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return {
      ok: false,
      error: "Remplissez d'abord votre dossier locataire.",
    };
  }

  const file = form.get("file");
  const label = String(form.get("label") ?? "").slice(0, 120);
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Fichier manquant." };
  }
  if (!ALLOWED.has(file.type)) {
    return { ok: false, error: "Format non supporté." };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "Fichier trop volumineux (max 10 Mo)." };
  }

  const ext = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1] ?? "bin";
  const path = `tenant-dossier/${session.user.id}/${Date.now()}-${randId()}.${ext}`;
  try {
    const buf = await file.arrayBuffer();
    await uploadToPrivateStorage({
      objectPath: path,
      body: buf,
      contentType: file.type,
    });
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const doc = await db.documentVault.create({
    data: {
      userId: session.user.id,
      category: "TENANT_DOSSIER",
      path,
      filename: label || file.name.slice(0, 200) || `doc-${Date.now()}`,
      mimeType: file.type,
      size: file.size,
      relatedEntityId: profile.id,
    },
    select: { id: true },
  });

  revalidatePath("/locataire/dossier");
  return { ok: true, id: doc.id };
}

export async function deleteTenantDocument(
  docId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const doc = await db.documentVault.findUnique({
    where: { id: docId },
    select: { userId: true, path: true, category: true },
  });
  if (!doc || doc.userId !== session.user.id || doc.category !== "TENANT_DOSSIER") {
    return { ok: false, error: "Accès refusé." };
  }
  await deleteFromPrivateStorage(doc.path);
  await db.documentVault.delete({ where: { id: docId } });
  revalidatePath("/locataire/dossier");
  return { ok: true };
}
