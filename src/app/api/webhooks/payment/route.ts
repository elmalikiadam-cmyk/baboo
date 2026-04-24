import { NextResponse } from "next/server";
import { db, hasDb } from "@/lib/db";
import { verifyPaymentWebhook, paymentGateway } from "@/lib/payment";
import { createNotification } from "@/lib/notifications";
import { RentPeriodStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook unifié CMI / Youcan. Reçoit le payload selon le gateway,
 * vérifie la signature, crée le Payment correspondant et recompute
 * le status de la RentPeriod.
 *
 * CMI envoie form-urlencoded. Youcan envoie JSON. On détecte via
 * Content-Type.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const raw = await req.text();
  const gw = paymentGateway();
  if (!gw) {
    return NextResponse.json({ error: "no-gateway" }, { status: 400 });
  }

  if (!(await verifyPaymentWebhook(raw, req.headers))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!hasDb()) {
    return NextResponse.json({ ok: false, skipped: "no-db" });
  }

  let rentPeriodId: string | null = null;
  let amount = 0;
  let transactionId: string | null = null;
  let success = false;

  if (gw === "youcan") {
    const payload = JSON.parse(raw) as {
      id: string;
      status: string;
      amount: number; // centimes
      order_id: string;
    };
    success = payload.status === "paid" || payload.status === "completed";
    rentPeriodId = payload.order_id;
    amount = Math.round(payload.amount / 100);
    transactionId = payload.id;
  } else if (gw === "cmi") {
    const params = new URLSearchParams(raw);
    const response = params.get("Response");
    success = response === "Approved";
    const oid = params.get("oid") ?? "";
    rentPeriodId = oid.split("-")[0] ?? null;
    amount = Number(params.get("amount") ?? 0);
    transactionId = params.get("TransId") ?? params.get("HostRefNum");
  }

  if (!rentPeriodId || !success || amount <= 0) {
    return NextResponse.json({ ok: true, processed: "skipped" });
  }

  const period = await db.rentPeriod.findUnique({
    where: { id: rentPeriodId },
    include: {
      lease: { select: { tenantUserId: true, landlordUserId: true, id: true } },
    },
  });
  if (!period) {
    return NextResponse.json({ ok: true, processed: "no-period" });
  }

  // Idempotence : si on a déjà un Payment avec ce transactionId,
  // on ne dédouble pas.
  if (transactionId) {
    const existing = await db.payment.findFirst({
      where: { gatewayTransactionId: transactionId },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ ok: true, processed: "duplicate" });
    }
  }

  const feePct = Number(process.env.PAYMENT_FEE_PCT ?? "0");
  const fee = Math.round(amount * (feePct / 100));
  const netAmount = amount - fee;

  await db.payment.create({
    data: {
      rentPeriodId: period.id,
      declaredById: period.lease.tenantUserId,
      declaredByRole: "TENANT",
      amount,
      method: "STANDING_ORDER", // paiement en ligne rattaché à cet enum V1
      reference: transactionId,
      paidAt: new Date(),
      gateway: gw,
      gatewayTransactionId: transactionId,
      gatewayFeePct: feePct,
      netAmount,
    },
  });

  // Recompute status
  const periodFull = await db.rentPeriod.findUnique({
    where: { id: period.id },
    include: { payments: { select: { amount: true } } },
  });
  if (periodFull) {
    const total = periodFull.payments.reduce((s, p) => s + p.amount, 0);
    const status =
      total >= periodFull.amountTotal
        ? RentPeriodStatus.PAID
        : RentPeriodStatus.PARTIALLY_PAID;
    await db.rentPeriod.update({
      where: { id: period.id },
      data: { status },
    });
  }

  // Notifications
  await createNotification({
    userId: period.lease.landlordUserId,
    type: "RENT_RECEIVED",
    title: "Loyer reçu",
    body: `${amount.toLocaleString("fr-FR")} MAD encaissés en ligne.`,
    linkUrl: `/bailleur/baux/${period.lease.id}`,
    entityType: "Lease",
    entityId: period.lease.id,
  });
  await createNotification({
    userId: period.lease.tenantUserId,
    type: "RENT_RECEIVED",
    title: "Paiement reçu",
    body: `Votre loyer a bien été enregistré.`,
    linkUrl: `/locataire/baux/${period.lease.id}`,
    entityType: "Lease",
    entityId: period.lease.id,
  });

  return NextResponse.json({ ok: true, processed: "paid" });
}
