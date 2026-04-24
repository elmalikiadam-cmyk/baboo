"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TerminationInitiator, TerminationStatus } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

type Result = { ok: true } | { ok: false; error: string };

const requestSchema = z.object({
  reason: z.string().trim().min(10).max(2000),
});

// Préavis loi 67-12 habitation — 3 mois bailleur, 1 mois locataire.
const NOTICE_DAYS = {
  LANDLORD: 90,
  TENANT: 30,
};

export async function requestTermination(
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
      tenantUserId: true,
      propertyAddress: true,
      listing: { select: { agencyId: true } },
    },
  });
  if (!lease) return { ok: false, error: "Bail introuvable." };
  if (lease.status !== "ACTIVE") {
    return { ok: false, error: "Le bail doit être actif." };
  }

  const isLandlord =
    lease.landlordUserId === session.user.id ||
    (!!session.user.agencyId && lease.listing?.agencyId === session.user.agencyId);
  const isTenant = lease.tenantUserId === session.user.id;
  if (!isLandlord && !isTenant) return { ok: false, error: "Accès refusé." };

  const initiator: TerminationInitiator = isLandlord
    ? TerminationInitiator.LANDLORD
    : TerminationInitiator.TENANT;

  const existing = await db.leaseTerminationRequest.findUnique({
    where: { leaseId },
    select: { id: true, status: true },
  });
  if (existing && existing.status === TerminationStatus.REQUESTED) {
    return { ok: false, error: "Demande déjà en cours." };
  }

  const parsed = requestSchema.safeParse({
    reason: form.get("reason") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: "Motif requis (10 caractères min)." };
  }

  const noticeDays = NOTICE_DAYS[initiator];
  const effectiveDate = new Date();
  effectiveDate.setDate(effectiveDate.getDate() + noticeDays);

  await db.leaseTerminationRequest.upsert({
    where: { leaseId },
    create: {
      leaseId,
      initiator,
      requestedById: session.user.id,
      reason: parsed.data.reason,
      effectiveDate,
      status: TerminationStatus.REQUESTED,
    },
    update: {
      initiator,
      requestedById: session.user.id,
      reason: parsed.data.reason,
      effectiveDate,
      status: TerminationStatus.REQUESTED,
      respondedAt: null,
      respondedById: null,
      responseNotes: null,
    },
  });

  await db.lease.update({
    where: { id: leaseId },
    data: {
      // On ne change pas le statut tant que c'est REQUESTED, juste
      // l'empreinte pour les requêtes.
      // status reste ACTIVE jusqu'à acceptation + passage en TERMINATED.
    },
  });

  // Notifier l'autre partie
  const recipientId = initiator === "LANDLORD" ? lease.tenantUserId : lease.landlordUserId;
  await createNotification({
    userId: recipientId,
    type: "SYSTEM",
    title: "Demande de résiliation du bail",
    body: `${lease.propertyAddress} — effet le ${effectiveDate.toLocaleDateString("fr-FR")}.`,
    linkUrl:
      initiator === "LANDLORD"
        ? `/locataire/baux/${leaseId}`
        : `/bailleur/baux/${leaseId}`,
    entityType: "Lease",
    entityId: leaseId,
  });

  revalidatePath(`/bailleur/baux/${leaseId}`);
  revalidatePath(`/locataire/baux/${leaseId}`);
  return { ok: true };
}

export async function respondTermination(
  leaseId: string,
  decision: "ACCEPTED" | "REJECTED",
  notes?: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    include: { terminationRequest: true, listing: { select: { agencyId: true } } },
  });
  if (!lease) return { ok: false, error: "Bail introuvable." };
  if (!lease.terminationRequest) return { ok: false, error: "Aucune demande." };

  const tr = lease.terminationRequest;
  // Seule l'autre partie (pas l'initiateur) peut répondre.
  const isLandlord =
    lease.landlordUserId === session.user.id ||
    (!!session.user.agencyId && lease.listing?.agencyId === session.user.agencyId);
  const isTenant = lease.tenantUserId === session.user.id;
  if (!isLandlord && !isTenant) return { ok: false, error: "Accès refusé." };
  const initiatedByMe =
    (tr.initiator === "LANDLORD" && isLandlord) ||
    (tr.initiator === "TENANT" && isTenant);
  if (initiatedByMe) {
    return { ok: false, error: "Vous êtes l'initiateur." };
  }

  await db.leaseTerminationRequest.update({
    where: { id: tr.id },
    data: {
      status:
        decision === "ACCEPTED"
          ? TerminationStatus.ACCEPTED
          : TerminationStatus.REJECTED,
      respondedById: session.user.id,
      respondedAt: new Date(),
      responseNotes: notes?.trim().slice(0, 1000) ?? null,
    },
  });

  if (decision === "ACCEPTED") {
    // On ne passe pas immédiatement en TERMINATED — attente de
    // l'effectiveDate, mais on peut marquer le statut comme résilié
    // aujourd'hui si la demande est acceptée + effectiveDate <= today.
    if (tr.effectiveDate <= new Date()) {
      await db.lease.update({
        where: { id: leaseId },
        data: {
          status: "TERMINATED",
          terminatedAt: new Date(),
          terminationReason: tr.reason,
        },
      });
    }
  }

  revalidatePath(`/bailleur/baux/${leaseId}`);
  revalidatePath(`/locataire/baux/${leaseId}`);
  return { ok: true };
}
