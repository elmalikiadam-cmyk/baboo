// Dispatcher simple de visites managées (Phase 2.4).
//
// Algorithme V1 :
//   1. Charger le ManagedVisit + le slot + le listing associé
//   2. Filtrer agents ACTIVE couvrant la ville du bien + speciality
//      compatible avec listing.transaction
//   3. Trier par charge de travail (moins de missions en cours d'abord)
//      puis par rating descendant
//   4. Assigner au top candidat, envoyer WhatsApp + notif in-app
//
// Si aucun agent disponible : laisse le statut REQUESTED et envoie une
// alerte Slack à l'équipe ops via SLACK_OPS_WEBHOOK_URL si défini.

import { ManagedVisitStatus } from "@prisma/client";
import { db, hasDb } from "@/lib/db";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";
import { createNotification } from "@/lib/notifications";
import { absoluteUrl } from "@/lib/resend";

type AssignResult =
  | { ok: true; agentUserId: string; agentName: string }
  | { ok: false; reason: "no-agent" | "not-found" | "db-error" };

/**
 * Tri pur des candidats agents : charge asc puis rating desc.
 * Extrait pour pouvoir être testé sans Prisma.
 */
export function rankAgentCandidates<T>(
  cands: ReadonlyArray<{
    userId: string;
    load: number;
    avgRating: number | null;
    raw: T;
  }>,
): ReadonlyArray<{ userId: string; raw: T }> {
  return [...cands]
    .sort((a, b) => {
      if (a.load !== b.load) return a.load - b.load;
      return (b.avgRating ?? 0) - (a.avgRating ?? 0);
    })
    .map((c) => ({ userId: c.userId, raw: c.raw }));
}

async function notifyOps(message: string): Promise<void> {
  const url = process.env.SLACK_OPS_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
  } catch {
    /* silencieux */
  }
}

export async function assignVisitToAgent(
  managedVisitId: string,
): Promise<AssignResult> {
  if (!hasDb()) return { ok: false, reason: "db-error" };

  const mv = await db.managedVisit.findUnique({
    where: { id: managedVisitId },
    include: {
      booking: {
        select: {
          listing: { select: { citySlug: true, transaction: true, title: true } },
          slot: { select: { startsAt: true } },
          visitorUser: { select: { name: true, email: true, phone: true } },
        },
      },
    },
  });
  if (!mv) return { ok: false, reason: "not-found" };

  const citySlug = mv.booking.listing.citySlug;
  const transaction = mv.booking.listing.transaction;
  const wantedSpeciality = transaction === "RENT" ? "LOCATION" : "VENTE";

  const candidates = await db.visitAgentProfile.findMany({
    where: {
      status: "ACTIVE",
      cityCoverage: { has: citySlug },
      OR: [{ speciality: wantedSpeciality }, { speciality: "BOTH" }],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          managedVisitsAsAgent: {
            where: {
              status: {
                in: [
                  ManagedVisitStatus.REQUESTED,
                  ManagedVisitStatus.ASSIGNED,
                  ManagedVisitStatus.CONFIRMED,
                ],
              },
            },
            select: { id: true },
          },
        },
      },
    },
  });

  if (candidates.length === 0) {
    await notifyOps(
      `[baboo] ⚠ Visite managée ${managedVisitId} sans agent disponible à ${citySlug}. ${mv.booking.visitorUser.name ?? mv.booking.visitorUser.email} attend confirmation.`,
    );
    return { ok: false, reason: "no-agent" };
  }

  const ranked = rankAgentCandidates(
    candidates.map((c) => ({
      userId: c.user.id,
      load: c.user.managedVisitsAsAgent.length,
      avgRating: c.avgRating,
      raw: c,
    })),
  );
  const best = ranked[0]!.raw;

  // Assigner
  const now = new Date();
  await db.managedVisit.update({
    where: { id: managedVisitId },
    data: {
      agentUserId: best.user.id,
      status: ManagedVisitStatus.ASSIGNED,
      assignedAt: now,
    },
  });

  // Notif agent
  await createNotification({
    userId: best.user.id,
    type: "INTERVENTION_ASSIGNED",
    title: "Nouvelle mission visite assignée",
    body: `${mv.booking.listing.title} — ${mv.booking.slot.startsAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}`,
    linkUrl: `/agent/mission/${managedVisitId}`,
    entityType: "ManagedVisit",
    entityId: managedVisitId,
  });

  if (best.user.phone) {
    await sendWhatsAppTemplate({
      to: best.user.phone,
      template: "visit_mission_assigned",
      locale: "fr",
      variables: [
        mv.booking.listing.title,
        mv.booking.slot.startsAt.toLocaleString("fr-FR", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Africa/Casablanca",
        }),
        absoluteUrl(`/agent/mission/${managedVisitId}`),
      ],
    });
  }

  return {
    ok: true,
    agentUserId: best.user.id,
    agentName: best.user.name ?? best.user.email,
  };
}
