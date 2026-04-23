import { NextResponse } from "next/server";
import { db, hasDb } from "@/lib/db";
import { verifyQStashSignature } from "@/lib/qstash";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook QStash — envoi d'un rappel WhatsApp 24 h avant une visite.
 * Vérifie la signature Upstash puis fait un best-effort sur le rappel.
 * Idempotent : si déjà envoyé (reminderSentAt), on no-op.
 *
 * Configuré côté Upstash via QStash_TOKEN + QSTASH_CURRENT_SIGNING_KEY.
 * Sans ces variables, le endpoint refuse toute requête (mode parano).
 */
export async function POST(req: Request): Promise<NextResponse> {
  const raw = await req.text();
  const signature = req.headers.get("upstash-signature");

  if (!(await verifyQStashSignature(raw, signature))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { bookingId?: string };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { bookingId } = payload;
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }

  if (!hasDb()) {
    return NextResponse.json({ ok: false, skipped: "no-db" });
  }

  const booking = await db.visitBooking.findUnique({
    where: { id: bookingId },
    include: {
      slot: { select: { startsAt: true } },
      listing: { select: { title: true } },
      visitorUser: { select: { phone: true, name: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ ok: true, skipped: "not-found" });
  }
  // Silencieux sur cas normaux (annulée, déjà envoyé, trop tôt/tard).
  if (booking.status === "CANCELLED") {
    return NextResponse.json({ ok: true, skipped: "cancelled" });
  }
  if (booking.reminderSentAt) {
    return NextResponse.json({ ok: true, skipped: "already-sent" });
  }
  if (booking.slot.startsAt < new Date()) {
    return NextResponse.json({ ok: true, skipped: "past" });
  }
  if (!booking.visitorUser.phone) {
    await db.visitBooking.update({
      where: { id: bookingId },
      data: { reminderSentAt: new Date() },
    });
    return NextResponse.json({ ok: true, skipped: "no-phone" });
  }

  const when = booking.slot.startsAt.toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Casablanca",
  });
  await sendWhatsAppTemplate({
    to: booking.visitorUser.phone,
    template: "visit_reminder",
    locale: "fr",
    variables: [booking.listing.title, when],
  });

  await db.visitBooking.update({
    where: { id: bookingId },
    data: { reminderSentAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
