"use server";

import { revalidatePath } from "next/cache";
import { DepositReturnStatus } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

type Retention = { label: string; amount: number };
type Result = { ok: true; id: string } | { ok: false; error: string };

/**
 * Initialise ou met à jour la restitution du dépôt de garantie d'un
 * bail TERMINATED. Bailleur-only.
 */
export async function upsertSecurityDepositReturn(
  leaseId: string,
  retentions: Retention[],
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      depositAmount: true,
      landlordUserId: true,
      tenantUserId: true,
      propertyAddress: true,
      listing: { select: { agencyId: true } },
    },
  });
  if (!lease) return { ok: false, error: "Bail introuvable." };
  const isLandlord =
    lease.landlordUserId === session.user.id ||
    (!!session.user.agencyId && lease.listing?.agencyId === session.user.agencyId);
  if (!isLandlord) return { ok: false, error: "Accès refusé." };

  if (lease.status !== "TERMINATED" && lease.status !== "EXPIRED") {
    return {
      ok: false,
      error: "La restitution ne s'effectue qu'après résiliation du bail.",
    };
  }

  const totalRetentions = retentions.reduce((s, r) => s + (r.amount || 0), 0);
  const amountReturned = Math.max(0, lease.depositAmount - totalRetentions);

  const existing = await db.securityDepositReturn.findUnique({
    where: { leaseId },
    select: { id: true, status: true },
  });

  if (existing && existing.status === DepositReturnStatus.SENT) {
    return { ok: false, error: "La restitution a déjà été transmise." };
  }

  const record = await db.securityDepositReturn.upsert({
    where: { leaseId },
    create: {
      leaseId,
      depositTotal: lease.depositAmount,
      retentions: retentions as unknown as object,
      amountReturned,
      processedById: session.user.id,
    },
    update: {
      retentions: retentions as unknown as object,
      amountReturned,
      status: DepositReturnStatus.DRAFT,
    },
    select: { id: true },
  });

  revalidatePath(`/bailleur/baux/${leaseId}`);
  revalidatePath(`/locataire/baux/${leaseId}`);
  return { ok: true, id: record.id };
}

export async function finalizeSecurityDepositReturn(
  leaseId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const record = await db.securityDepositReturn.findUnique({
    where: { leaseId },
    include: {
      lease: {
        select: {
          landlordUserId: true,
          tenantUserId: true,
          propertyAddress: true,
          listing: { select: { agencyId: true } },
        },
      },
    },
  });
  if (!record) return { ok: false, error: "Aucune restitution brouillon." };
  const isLandlord =
    record.lease.landlordUserId === session.user.id ||
    (!!session.user.agencyId && record.lease.listing?.agencyId === session.user.agencyId);
  if (!isLandlord) return { ok: false, error: "Accès refusé." };

  await db.securityDepositReturn.update({
    where: { id: record.id },
    data: {
      status: DepositReturnStatus.FINALIZED,
      sentAt: new Date(),
    },
  });

  await createNotification({
    userId: record.lease.tenantUserId,
    type: "SYSTEM",
    title: "Restitution du dépôt de garantie",
    body: `${record.amountReturned.toLocaleString("fr-FR")} MAD vous sont restitués. Versement à venir.`,
    linkUrl: `/locataire/baux/${leaseId}`,
    entityType: "Lease",
    entityId: leaseId,
  });

  revalidatePath(`/bailleur/baux/${leaseId}`);
  revalidatePath(`/locataire/baux/${leaseId}`);
  return { ok: true, id: record.id };
}

export async function markSecurityDepositSent(
  leaseId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const record = await db.securityDepositReturn.findUnique({
    where: { leaseId },
    include: {
      lease: {
        select: {
          landlordUserId: true,
          tenantUserId: true,
          listing: { select: { agencyId: true } },
        },
      },
    },
  });
  if (!record) return { ok: false, error: "Introuvable." };
  const isLandlord =
    record.lease.landlordUserId === session.user.id ||
    (!!session.user.agencyId && record.lease.listing?.agencyId === session.user.agencyId);
  if (!isLandlord) return { ok: false, error: "Accès refusé." };

  await db.securityDepositReturn.update({
    where: { id: record.id },
    data: { status: DepositReturnStatus.SENT, sentAt: new Date() },
  });

  revalidatePath(`/bailleur/baux/${leaseId}`);
  revalidatePath(`/locataire/baux/${leaseId}`);
  return { ok: true, id: record.id };
}
