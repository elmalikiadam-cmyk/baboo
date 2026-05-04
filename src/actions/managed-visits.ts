"use server";

// Phase 2.5 + 2.6 — server actions pour l'agent :
// confirm mission, submit rapport post-visite, cancel.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ManagedVisitStatus } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

type Result = { ok: true } | { ok: false; error: string };

async function loadMission(missionId: string, userId: string) {
  if (!hasDb()) return null;
  const mv = await db.managedVisit.findUnique({
    where: { id: missionId },
    select: {
      id: true,
      agentUserId: true,
      status: true,
      packId: true,
      booking: {
        select: {
          id: true,
          listing: { select: { ownerId: true, title: true, slug: true } },
          slot: { select: { startsAt: true } },
        },
      },
    },
  });
  if (!mv) return null;
  if (mv.agentUserId !== userId) return null;
  return mv;
}

export async function confirmMission(missionId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  const mv = await loadMission(missionId, session.user.id);
  if (!mv) return { ok: false, error: "Mission introuvable." };

  if (mv.status === ManagedVisitStatus.CONFIRMED) return { ok: true };
  if (mv.status !== ManagedVisitStatus.ASSIGNED) {
    return { ok: false, error: "État invalide." };
  }

  await db.managedVisit.update({
    where: { id: missionId },
    data: {
      status: ManagedVisitStatus.CONFIRMED,
      confirmedAt: new Date(),
    },
  });

  await createNotification({
    userId: mv.booking.listing.ownerId,
    type: "VISIT_CONFIRMED",
    title: "Visite confirmée par l'agent",
    body: `${mv.booking.listing.title} — ${mv.booking.slot.startsAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}`,
    linkUrl: `/bailleur/visites-managees`,
    entityType: "ManagedVisit",
    entityId: missionId,
  });

  revalidatePath(`/agent/mission/${missionId}`);
  revalidatePath("/agent");
  return { ok: true };
}

const reportSchema = z.object({
  missionId: z.string().min(1),
  candidatePresented: z.coerce.boolean(),
  candidatePhoneVerified: z.coerce.boolean(),
  candidateEmploymentVerified: z.coerce.boolean(),
  candidateScore: z.coerce.number().int().min(1).max(5),
  candidateNotes: z.string().trim().min(10).max(4000),
  propertyConditionNotes: z.string().trim().max(4000).optional().or(z.literal("")),
  internalNotes: z.string().trim().max(4000).optional().or(z.literal("")),
  recommendForLandlord: z.coerce.boolean(),
});

export async function submitVisitReport(form: FormData): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  const mv = await loadMission(String(form.get("missionId")), session.user.id);
  if (!mv) return { ok: false, error: "Mission introuvable." };

  if (mv.status === ManagedVisitStatus.COMPLETED) {
    return { ok: false, error: "Rapport déjà soumis." };
  }

  const parsed = reportSchema.safeParse({
    missionId: form.get("missionId") ?? "",
    candidatePresented: form.get("candidatePresented") === "on",
    candidatePhoneVerified: form.get("candidatePhoneVerified") === "on",
    candidateEmploymentVerified: form.get("candidateEmploymentVerified") === "on",
    candidateScore: form.get("candidateScore") ?? 3,
    candidateNotes: form.get("candidateNotes") ?? "",
    propertyConditionNotes: form.get("propertyConditionNotes") ?? "",
    internalNotes: form.get("internalNotes") ?? "",
    recommendForLandlord: form.get("recommendForLandlord") === "on",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Champs invalides.",
    };
  }
  const d = parsed.data;

  const noShow = !d.candidatePresented;

  await db.$transaction([
    db.managedVisit.update({
      where: { id: mv.id },
      data: {
        status: noShow
          ? ManagedVisitStatus.NO_SHOW
          : ManagedVisitStatus.COMPLETED,
        reportSubmittedAt: new Date(),
        completedAt: noShow ? null : new Date(),
        candidatePresented: d.candidatePresented,
        candidatePhoneVerified: d.candidatePhoneVerified,
        candidateEmploymentVerified: d.candidateEmploymentVerified,
        candidateScore: d.candidateScore,
        candidateNotes: d.candidateNotes,
        propertyConditionNotes: d.propertyConditionNotes || null,
        internalNotes: d.internalNotes || null,
        recommendForLandlord: d.recommendForLandlord,
      },
    }),
    db.visitAgentProfile.update({
      where: { userId: session.user.id },
      data: {
        completedVisits: { increment: noShow ? 0 : 1 },
        totalVisits: { increment: 1 },
      },
    }),
  ]);

  await createNotification({
    userId: mv.booking.listing.ownerId,
    type: "VISIT_REPORT_READY",
    title: noShow ? "Candidat absent — visite managée" : "Rapport de visite disponible",
    body: `${mv.booking.listing.title} — ${noShow ? "no-show" : `score candidat ${d.candidateScore}/5`}`,
    linkUrl: `/bailleur/visites-managees/${mv.id}`,
    entityType: "ManagedVisit",
    entityId: mv.id,
  });

  revalidatePath(`/agent/mission/${mv.id}`);
  revalidatePath("/agent");
  revalidatePath("/bailleur/visites-managees");
  return { ok: true };
}

export async function cancelMission(
  missionId: string,
  reason: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  const mv = await loadMission(missionId, session.user.id);
  if (!mv) return { ok: false, error: "Mission introuvable." };
  if (mv.status === ManagedVisitStatus.COMPLETED) {
    return { ok: false, error: "Mission déjà finalisée." };
  }

  await db.$transaction([
    db.managedVisit.update({
      where: { id: missionId },
      data: {
        status: ManagedVisitStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason.slice(0, 500),
      },
    }),
    // On rembourse un crédit si la mission est annulée
    db.visitPack.update({
      where: { id: mv.packId },
      data: { creditsUsed: { decrement: 1 } },
    }),
  ]);

  await createNotification({
    userId: mv.booking.listing.ownerId,
    type: "VISIT_CANCELLED",
    title: "Visite managée annulée",
    body: `L'agent a annulé : ${reason.slice(0, 100)}`,
    linkUrl: `/bailleur/visites-managees`,
    entityType: "ManagedVisit",
    entityId: missionId,
  });

  revalidatePath("/agent");
  return { ok: true };
}
