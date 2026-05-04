"use server";

// Admin moderation pour SearchRequest. V1 simple : marquer expirée
// (au-delà de 60 j sans action) ou rouvrir. La conversion réelle se
// trace via PartnerLeadUnlock + l'évolution `status`.

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== "ADMIN") return null;
  return session;
}

export async function expireSearchRequest(id: string): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Accès refusé." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  await db.searchRequest.update({
    where: { id },
    data: { status: "EXPIRED", expiresAt: new Date() },
  });
  revalidatePath("/admin/search-requests");
  return { ok: true };
}

export async function reopenSearchRequest(id: string): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Accès refusé." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  await db.searchRequest.update({
    where: { id },
    data: { status: "ACTIVE", expiresAt: null },
  });
  revalidatePath("/admin/search-requests");
  return { ok: true };
}

/** Self-service côté locataire : annuler / supprimer sa propre demande. */
export async function cancelMyOwnSearchRequest(
  id: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const sr = await db.searchRequest.findUnique({
    where: { id },
    select: { userId: true, contactEmail: true },
  });
  if (!sr) return { ok: false, error: "Demande introuvable." };

  const isOwner =
    sr.userId === session.user.id ||
    sr.contactEmail === session.user.email?.toLowerCase();
  if (!isOwner) return { ok: false, error: "Accès refusé." };

  await db.searchRequest.update({
    where: { id },
    data: { status: "EXPIRED", expiresAt: new Date() },
  });
  revalidatePath("/compte/recherches");
  return { ok: true };
}
