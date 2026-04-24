"use server";

// Server actions — planificateur visites.
//
// Côté bailleur : créer / supprimer des créneaux sur ses annonces,
// confirmer ou annuler des réservations, marquer no-show / completed.
// Côté candidat : réserver un créneau, annuler.
//
// Intégrations optionnelles :
//   - WhatsApp template (confirmation, rappel)
//   - QStash scheduled reminder (24 h avant le créneau)
//   Aucune n'est bloquante : si les env ne sont pas configurées,
//   le booking est créé sans notification externe.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { VisitBookingStatus, ManagedVisitStatus } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";
import { schedulePost, cancelScheduled, isQStashEnabled } from "@/lib/qstash";
import { assignVisitToAgent } from "@/lib/visit-dispatcher";
import { isFeatureEnabled } from "@/lib/features";

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

function publicBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

async function canManageListing(
  userId: string,
  agencyId: string | null | undefined,
  listingId: string,
): Promise<boolean> {
  if (!hasDb()) return false;
  const l = await db.listing.findUnique({
    where: { id: listingId },
    select: { ownerId: true, agencyId: true },
  });
  if (!l) return false;
  return l.ownerId === userId || (!!agencyId && l.agencyId === agencyId);
}

const createSlotSchema = z
  .object({
    listingId: z.string().min(1),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    maxBookings: z.coerce.number().int().min(1).max(20).default(1),
    internalNote: z.string().trim().max(1000).optional().or(z.literal("")),
    managedByBaboo: z
      .union([z.string(), z.boolean(), z.undefined()])
      .transform((v) => v === "1" || v === "true" || v === true)
      .default(false),
  })
  .refine((v) => v.endsAt > v.startsAt, {
    message: "Fin après début.",
    path: ["endsAt"],
  })
  .refine((v) => v.startsAt > new Date(Date.now() - 60_000), {
    message: "Le créneau doit être dans le futur.",
    path: ["startsAt"],
  });

export async function createVisitSlot(form: FormData): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const rl = await rateLimit({
    key: `visit-slot:${session.user.id}`,
    limit: 100,
    windowSec: 3600,
  });
  if (!rl.success) return { ok: false, error: "Trop de créations récentes." };

  const parsed = createSlotSchema.safeParse({
    listingId: form.get("listingId") ?? "",
    startsAt: form.get("startsAt") ?? "",
    endsAt: form.get("endsAt") ?? "",
    maxBookings: form.get("maxBookings") ?? 1,
    internalNote: form.get("internalNote") ?? "",
    managedByBaboo: form.get("managedByBaboo") ?? "",
  });
  if (!parsed.success) return { ok: false, ...flattenZod(parsed.error) };
  const d = parsed.data;

  const can = await canManageListing(
    session.user.id,
    session.user.agencyId,
    d.listingId,
  );
  if (!can) return { ok: false, error: "Accès refusé." };

  // Feature flag : si les visites managées sont désactivées en prod,
  // on ignore silencieusement le toggle (le bailleur garde la main).
  if (d.managedByBaboo && !isFeatureEnabled("managedVisits")) {
    d.managedByBaboo = false;
  }

  // Si le bailleur veut un créneau managé, vérifier qu'un pack actif
  // avec des crédits disponibles existe. Les visites managées sont
  // toujours 1 candidat / créneau (un agent = un candidat).
  if (d.managedByBaboo) {
    const pack = await db.visitPack.findFirst({
      where: {
        listingId: d.listingId,
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
      },
      select: { id: true, creditsTotal: true, creditsUsed: true },
      orderBy: { createdAt: "asc" },
    });
    if (!pack || pack.creditsUsed >= pack.creditsTotal) {
      return {
        ok: false,
        error:
          "Aucun pack visites actif sur cette annonce. Achetez un pack pour activer le mode managé.",
      };
    }
    if (d.maxBookings > 1) {
      return {
        ok: false,
        error: "Les créneaux managés sont limités à 1 candidat par visite.",
        fieldErrors: { maxBookings: "Managé = 1 candidat." },
      };
    }
  }

  // Pas de chevauchement de créneaux sur la même annonce (on empêche
  // de créer deux slots qui se chevauchent à l'identique, mais on
  // laisse des créneaux adjacents).
  const overlap = await db.visitSlot.findFirst({
    where: {
      listingId: d.listingId,
      startsAt: { lt: d.endsAt },
      endsAt: { gt: d.startsAt },
    },
    select: { id: true },
  });
  if (overlap) {
    return {
      ok: false,
      error: "Ce créneau chevauche un créneau existant.",
      fieldErrors: { startsAt: "Chevauchement avec un créneau existant." },
    };
  }

  const slot = await db.visitSlot.create({
    data: {
      listingId: d.listingId,
      startsAt: d.startsAt,
      endsAt: d.endsAt,
      maxBookings: d.maxBookings,
      internalNote: d.internalNote ? d.internalNote : null,
      managedByBaboo: d.managedByBaboo,
      createdBy: session.user.id,
    },
    select: { id: true },
  });

  revalidatePath(`/bailleur/listings/${d.listingId}/visites`);
  revalidatePath("/bailleur/visites");
  return { ok: true, id: slot.id };
}

export async function deleteVisitSlot(slotId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const slot = await db.visitSlot.findUnique({
    where: { id: slotId },
    select: {
      listingId: true,
      listing: { select: { ownerId: true, agencyId: true } },
      _count: { select: { bookings: true } },
    },
  });
  if (!slot) return { ok: false, error: "Créneau introuvable." };
  const can =
    slot.listing.ownerId === session.user.id ||
    (!!session.user.agencyId && slot.listing.agencyId === session.user.agencyId);
  if (!can) return { ok: false, error: "Accès refusé." };

  // Si des réservations existent, on les annule en cascade. Le
  // delete cascade du schema s'en charge, mais on prévient QStash
  // avant pour ne pas laisser des rappels orphelins.
  if (slot._count.bookings > 0) {
    const bookings = await db.visitBooking.findMany({
      where: { slotId },
      select: { reminderScheduledId: true },
    });
    await Promise.allSettled(
      bookings
        .map((b) => b.reminderScheduledId)
        .filter((id): id is string => !!id)
        .map((id) => cancelScheduled(id)),
    );
  }

  await db.visitSlot.delete({ where: { id: slotId } });

  revalidatePath(`/bailleur/listings/${slot.listingId}/visites`);
  revalidatePath("/bailleur/visites");
  return { ok: true };
}

const bookSchema = z.object({
  slotId: z.string().min(1),
  message: z.string().trim().max(1000).optional(),
});

export async function bookVisit(
  slotId: string,
  message: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Connectez-vous." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };
  const userId = session.user.id;

  const rl = await rateLimit({
    key: `visit-book:${userId}`,
    limit: 20,
    windowSec: 3600,
  });
  if (!rl.success) return { ok: false, error: "Trop de réservations en peu de temps." };

  const parsed = bookSchema.safeParse({ slotId, message });
  if (!parsed.success) return { ok: false, ...flattenZod(parsed.error) };

  const slot = await db.visitSlot.findUnique({
    where: { id: slotId },
    include: {
      listing: {
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          ownerId: true,
          city: { select: { name: true } },
        },
      },
      _count: {
        select: {
          bookings: {
            where: {
              status: { in: [VisitBookingStatus.BOOKED, VisitBookingStatus.CONFIRMED] },
            },
          },
        },
      },
    },
  });
  const slotManaged = slot?.managedByBaboo ?? false;
  if (!slot) return { ok: false, error: "Créneau introuvable." };
  if (slot.startsAt < new Date()) {
    return { ok: false, error: "Créneau passé." };
  }
  if (slot.listing.status !== "PUBLISHED") {
    return { ok: false, error: "Cette annonce n'est plus active." };
  }
  if (slot.listing.ownerId === userId) {
    return { ok: false, error: "Vous ne pouvez pas réserver votre propre bien." };
  }
  if (slot._count.bookings >= slot.maxBookings) {
    return { ok: false, error: "Créneau complet." };
  }

  const existing = await db.visitBooking.findUnique({
    where: { slotId_visitorUserId: { slotId, visitorUserId: userId } },
    select: { id: true, status: true },
  });
  if (existing && existing.status !== VisitBookingStatus.CANCELLED) {
    return { ok: false, error: "Vous avez déjà réservé ce créneau." };
  }

  const baseData = {
    status: VisitBookingStatus.BOOKED,
    message: parsed.data.message ? parsed.data.message : null,
    confirmedAt: null,
    confirmedBy: null,
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
    reminderSentAt: null,
  };

  let booking;
  if (existing) {
    booking = await db.visitBooking.update({
      where: { id: existing.id },
      data: baseData,
      select: { id: true },
    });
  } else {
    booking = await db.visitBooking.create({
      data: {
        slotId,
        listingId: slot.listing.id,
        visitorUserId: userId,
        ...baseData,
      },
      select: { id: true },
    });
  }

  // Si créneau managé : créer ManagedVisit + consommer un crédit pack +
  // dispatcher à un agent. On best-effort : si rien ne matche, le booking
  // reste valide mais le bailleur sera notifié.
  if (slotManaged && isFeatureEnabled("managedVisits")) {
    const pack = await db.visitPack.findFirst({
      where: {
        listingId: slot.listing.id,
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
      },
      select: { id: true, creditsTotal: true, creditsUsed: true },
      orderBy: { createdAt: "asc" },
    });
    if (pack && pack.creditsUsed < pack.creditsTotal) {
      const [managedVisit] = await db.$transaction([
        db.managedVisit.upsert({
          where: { bookingId: booking.id },
          create: {
            packId: pack.id,
            bookingId: booking.id,
            status: ManagedVisitStatus.REQUESTED,
          },
          update: {},
          select: { id: true },
        }),
        db.visitPack.update({
          where: { id: pack.id },
          data: { creditsUsed: { increment: 1 } },
        }),
      ]);
      // Dispatcher async ; ne bloque pas la réponse si l'assignation échoue
      await assignVisitToAgent(managedVisit.id).catch(() => null);
    }
  }

  // Planifie un rappel 24 h avant le créneau (best-effort).
  const remindAt = new Date(slot.startsAt.getTime() - 24 * 3600 * 1000);
  const delaySec = Math.max(60, Math.floor((remindAt.getTime() - Date.now()) / 1000));
  if (isQStashEnabled() && delaySec > 60) {
    const callbackUrl = `${publicBaseUrl()}/api/webhooks/qstash/visit-reminder`;
    const res = await schedulePost({
      callbackUrl,
      payload: { bookingId: booking.id },
      delaySec,
      deduplicationId: `visit-reminder:${booking.id}`,
    });
    if (res.ok) {
      await db.visitBooking.update({
        where: { id: booking.id },
        data: { reminderScheduledId: res.messageId },
      });
    }
  }

  // Confirmation WhatsApp au visiteur si provisionné + téléphone connu.
  const visitor = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  if (visitor?.phone) {
    const when = slot.startsAt.toLocaleString("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Africa/Casablanca",
    });
    await sendWhatsAppTemplate({
      to: visitor.phone,
      template: "visit_booked",
      locale: "fr",
      variables: [slot.listing.title, when],
    });
  }

  revalidatePath(`/annonce/${slot.listing.slug}/visiter`);
  revalidatePath(`/annonce/${slot.listing.slug}`);
  revalidatePath("/locataire/visites");
  revalidatePath("/bailleur/visites");
  revalidatePath(`/bailleur/listings/${slot.listing.id}/visites`);
  return { ok: true, id: booking.id };
}

/**
 * Annulation d'une réservation. Autorisée par le visiteur OU par le
 * bailleur / agence. Si `reason` fourni, stocké pour l'autre partie.
 */
export async function cancelBooking(
  bookingId: string,
  reason?: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const booking = await db.visitBooking.findUnique({
    where: { id: bookingId },
    include: {
      slot: { select: { startsAt: true } },
      listing: { select: { ownerId: true, agencyId: true, slug: true, id: true } },
    },
  });
  if (!booking) return { ok: false, error: "Réservation introuvable." };

  const isVisitor = booking.visitorUserId === session.user.id;
  const isOwner =
    booking.listing.ownerId === session.user.id ||
    (!!session.user.agencyId && booking.listing.agencyId === session.user.agencyId);
  if (!isVisitor && !isOwner) {
    return { ok: false, error: "Accès refusé." };
  }

  if (booking.status === VisitBookingStatus.CANCELLED) {
    return { ok: true }; // idempotent
  }

  await db.visitBooking.update({
    where: { id: bookingId },
    data: {
      status: VisitBookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelledBy: session.user.id,
      cancellationReason: reason?.trim().slice(0, 500) || null,
    },
  });

  // Annule le rappel QStash s'il y en a un.
  if (booking.reminderScheduledId) {
    await cancelScheduled(booking.reminderScheduledId);
  }

  revalidatePath("/locataire/visites");
  revalidatePath("/bailleur/visites");
  revalidatePath(`/bailleur/listings/${booking.listing.id}/visites`);
  revalidatePath(`/annonce/${booking.listing.slug}/visiter`);
  return { ok: true };
}

/**
 * Confirmation par le bailleur après pré-sélection du candidat.
 */
export async function confirmBooking(bookingId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const booking = await db.visitBooking.findUnique({
    where: { id: bookingId },
    include: {
      listing: { select: { ownerId: true, agencyId: true, id: true } },
    },
  });
  if (!booking) return { ok: false, error: "Introuvable." };
  const can =
    booking.listing.ownerId === session.user.id ||
    (!!session.user.agencyId && booking.listing.agencyId === session.user.agencyId);
  if (!can) return { ok: false, error: "Accès refusé." };

  if (booking.status === VisitBookingStatus.CANCELLED) {
    return { ok: false, error: "Réservation annulée." };
  }
  if (booking.status === VisitBookingStatus.CONFIRMED) return { ok: true };

  await db.visitBooking.update({
    where: { id: bookingId },
    data: {
      status: VisitBookingStatus.CONFIRMED,
      confirmedAt: new Date(),
      confirmedBy: session.user.id,
    },
  });

  revalidatePath("/bailleur/visites");
  revalidatePath("/locataire/visites");
  revalidatePath(`/bailleur/listings/${booking.listing.id}/visites`);
  return { ok: true };
}

/**
 * Marquage post-visite par le bailleur : NO_SHOW ou COMPLETED. Simple
 * transition de statut, pas de logique métier dépendante en V1.
 */
export async function markBookingOutcome(
  bookingId: string,
  outcome: "NO_SHOW" | "COMPLETED",
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const booking = await db.visitBooking.findUnique({
    where: { id: bookingId },
    include: {
      listing: { select: { ownerId: true, agencyId: true, id: true } },
    },
  });
  if (!booking) return { ok: false, error: "Introuvable." };
  const can =
    booking.listing.ownerId === session.user.id ||
    (!!session.user.agencyId && booking.listing.agencyId === session.user.agencyId);
  if (!can) return { ok: false, error: "Accès refusé." };

  await db.visitBooking.update({
    where: { id: bookingId },
    data: {
      status:
        outcome === "NO_SHOW"
          ? VisitBookingStatus.NO_SHOW
          : VisitBookingStatus.COMPLETED,
    },
  });

  revalidatePath("/bailleur/visites");
  revalidatePath(`/bailleur/listings/${booking.listing.id}/visites`);
  return { ok: true };
}
