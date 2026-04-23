"use server";

// Server actions — gestion locative.
//
// Génération mensuelle paresseuse : au chargement de la page bail,
// on appelle `ensureRentPeriods()` qui crée les RentPeriod manquantes
// jusqu'à +2 mois dans le futur. Pas de cron nécessaire pour la V1 —
// Brique 8 pourra migrer vers une tâche QStash mensuelle.
//
// Déclaration de paiement : le bailleur ou le locataire enregistre un
// Payment. Le statut de la RentPeriod est recalculé à chaque
// modification de paiement (insertion, suppression). Quand la somme
// des paiements ≥ amountTotal, status = PAID.
//
// Quittance : le bailleur génère le PDF une fois la période PAID.
// Stocké dans le bucket privé, consultable par le locataire.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  PaymentMethod,
  RentPeriodStatus,
} from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import {
  isPrivateStorageEnabled,
  uploadToPrivateStorage,
} from "@/lib/storage";
import { ReceiptPdfDocument, type ReceiptPdfData } from "@/lib/receipt-pdf";

type ErrResult = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
};
type Result = { ok: true } | ErrResult;
type ResultWith<T> = ({ ok: true } & T) | ErrResult;

const LATE_THRESHOLD_DAYS = 5;

function firstOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function lastOfMonth(d: Date): Date {
  // Dernier jour du mois, à 23:59:59 UTC.
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59));
}

function addMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}

function dueDateFor(periodStart: Date, paymentDay: number): Date {
  const clamped = Math.min(Math.max(paymentDay, 1), 28);
  return new Date(Date.UTC(
    periodStart.getUTCFullYear(),
    periodStart.getUTCMonth(),
    clamped,
    12, 0, 0,
  ));
}

async function canAccessLease(
  userId: string,
  agencyId: string | null | undefined,
  leaseId: string,
): Promise<"LANDLORD" | "TENANT" | null> {
  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    select: {
      landlordUserId: true,
      tenantUserId: true,
      listing: { select: { agencyId: true } },
    },
  });
  if (!lease) return null;
  if (
    lease.landlordUserId === userId ||
    (!!agencyId && lease.listing?.agencyId === agencyId)
  ) return "LANDLORD";
  if (lease.tenantUserId === userId) return "TENANT";
  return null;
}

/**
 * Recalcule le statut d'une période à partir des paiements reçus.
 * Retourne le nouveau statut pour logs éventuels.
 */
async function recomputePeriodStatus(
  rentPeriodId: string,
): Promise<RentPeriodStatus> {
  const period = await db.rentPeriod.findUnique({
    where: { id: rentPeriodId },
    include: { payments: { select: { amount: true } } },
  });
  if (!period) return RentPeriodStatus.DUE;

  const total = period.payments.reduce((s, p) => s + p.amount, 0);
  let status: RentPeriodStatus;
  if (period.status === RentPeriodStatus.WAIVED) {
    status = RentPeriodStatus.WAIVED; // on ne touche pas à un mois offert
  } else if (total >= period.amountTotal) {
    status = RentPeriodStatus.PAID;
  } else if (total > 0) {
    status = RentPeriodStatus.PARTIALLY_PAID;
  } else {
    const now = Date.now();
    const lateCutoff =
      period.dueDate.getTime() + LATE_THRESHOLD_DAYS * 24 * 3600 * 1000;
    status = now > lateCutoff ? RentPeriodStatus.LATE : RentPeriodStatus.DUE;
  }

  await db.rentPeriod.update({
    where: { id: rentPeriodId },
    data: { status },
  });
  return status;
}

/**
 * Crée les RentPeriod manquantes pour un bail ACTIVE ou TERMINATED.
 * Idempotent grâce au @@unique([leaseId, periodStart]).
 *
 * Horizon :
 *   - Démarre à `startDate` (aligné au premier du mois).
 *   - Va jusqu'au min(endDate, today + 2 mois).
 */
export async function ensureRentPeriods(leaseId: string): Promise<Result> {
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      monthlyRent: true,
      monthlyCharges: true,
      paymentDay: true,
      terminatedAt: true,
    },
  });
  if (!lease) return { ok: false, error: "Bail introuvable." };
  if (lease.status !== "ACTIVE" && lease.status !== "TERMINATED" && lease.status !== "EXPIRED") {
    // Pas encore actif : rien à générer silencieusement.
    return { ok: true };
  }

  const firstPeriod = firstOfMonth(lease.startDate);
  // Horizon : endDate bail / terminatedAt / today + 2 mois, selon le min.
  const today = new Date();
  let horizon = addMonths(firstOfMonth(today), 2);
  if (lease.endDate && lease.endDate < horizon) {
    horizon = firstOfMonth(lease.endDate);
  }
  if (lease.terminatedAt && lease.terminatedAt < horizon) {
    horizon = firstOfMonth(lease.terminatedAt);
  }

  const existing = await db.rentPeriod.findMany({
    where: { leaseId },
    select: { periodStart: true },
  });
  const existingKeys = new Set(
    existing.map((p) => p.periodStart.toISOString()),
  );

  const toCreate: Array<{
    leaseId: string;
    periodStart: Date;
    periodEnd: Date;
    dueDate: Date;
    amountRent: number;
    amountCharges: number;
    amountTotal: number;
  }> = [];
  let cursor = firstPeriod;
  let safety = 0;
  while (cursor <= horizon && safety < 120) {
    safety += 1;
    if (!existingKeys.has(cursor.toISOString())) {
      toCreate.push({
        leaseId,
        periodStart: cursor,
        periodEnd: lastOfMonth(cursor),
        dueDate: dueDateFor(cursor, lease.paymentDay),
        amountRent: lease.monthlyRent,
        amountCharges: lease.monthlyCharges,
        amountTotal: lease.monthlyRent + lease.monthlyCharges,
      });
    }
    cursor = addMonths(cursor, 1);
  }

  if (toCreate.length > 0) {
    await db.rentPeriod.createMany({
      data: toCreate,
      skipDuplicates: true,
    });
  }

  // Ré-évalue le statut LATE sur les périodes passées non payées.
  // Update en bulk plutôt qu'une boucle : tout ce qui est DUE et
  // dueDate < today - 5j → LATE.
  const lateCutoff = new Date(
    Date.now() - LATE_THRESHOLD_DAYS * 24 * 3600 * 1000,
  );
  await db.rentPeriod.updateMany({
    where: {
      leaseId,
      status: RentPeriodStatus.DUE,
      dueDate: { lt: lateCutoff },
    },
    data: { status: RentPeriodStatus.LATE },
  });

  revalidatePath(`/bailleur/baux/${leaseId}`);
  revalidatePath(`/locataire/baux/${leaseId}`);
  return { ok: true };
}

const paymentSchema = z.object({
  amount: z.coerce.number().int().positive().max(10_000_000),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  paidAt: z.coerce.date(),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function recordPayment(
  rentPeriodId: string,
  form: FormData,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const period = await db.rentPeriod.findUnique({
    where: { id: rentPeriodId },
    select: { leaseId: true, status: true },
  });
  if (!period) return { ok: false, error: "Période introuvable." };

  const role = await canAccessLease(
    session.user.id,
    session.user.agencyId,
    period.leaseId,
  );
  if (!role) return { ok: false, error: "Accès refusé." };
  if (period.status === RentPeriodStatus.WAIVED) {
    return { ok: false, error: "Période abandonnée, paiement impossible." };
  }

  const parsed = paymentSchema.safeParse({
    amount: form.get("amount") ?? 0,
    method: form.get("method") ?? PaymentMethod.BANK_TRANSFER,
    reference: form.get("reference") ?? "",
    paidAt: form.get("paidAt") ?? "",
    notes: form.get("notes") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, error: "Données invalides.", fieldErrors };
  }

  await db.payment.create({
    data: {
      rentPeriodId,
      declaredById: session.user.id,
      declaredByRole: role,
      amount: parsed.data.amount,
      method: parsed.data.method,
      reference: parsed.data.reference ? parsed.data.reference : null,
      paidAt: parsed.data.paidAt,
      notes: parsed.data.notes ? parsed.data.notes : null,
    },
  });

  await recomputePeriodStatus(rentPeriodId);

  revalidatePath(`/bailleur/baux/${period.leaseId}`);
  revalidatePath(`/locataire/baux/${period.leaseId}`);
  return { ok: true };
}

export async function deletePayment(paymentId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    select: {
      declaredById: true,
      rentPeriod: { select: { leaseId: true, id: true } },
    },
  });
  if (!payment) return { ok: false, error: "Paiement introuvable." };

  // Seul l'auteur du paiement peut le supprimer, OU le bailleur du bail
  // (ne peut pas supprimer un paiement déclaré par le locataire
  // lui-même sans son accord — on restreint pour éviter les abus).
  const role = await canAccessLease(
    session.user.id,
    session.user.agencyId,
    payment.rentPeriod.leaseId,
  );
  if (!role) return { ok: false, error: "Accès refusé." };

  if (payment.declaredById !== session.user.id && role !== "LANDLORD") {
    return { ok: false, error: "Seul l'auteur peut supprimer ce paiement." };
  }

  await db.payment.delete({ where: { id: paymentId } });
  await recomputePeriodStatus(payment.rentPeriod.id);

  revalidatePath(`/bailleur/baux/${payment.rentPeriod.leaseId}`);
  revalidatePath(`/locataire/baux/${payment.rentPeriod.leaseId}`);
  return { ok: true };
}

/**
 * Marque une période comme WAIVED (loyer offert). Strictement
 * bailleur-only, pas réversible simplement (il faut modifier le
 * statut manuellement pour revenir en DUE).
 */
export async function waiveRentPeriod(
  rentPeriodId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const period = await db.rentPeriod.findUnique({
    where: { id: rentPeriodId },
    select: { leaseId: true },
  });
  if (!period) return { ok: false, error: "Période introuvable." };
  const role = await canAccessLease(
    session.user.id,
    session.user.agencyId,
    period.leaseId,
  );
  if (role !== "LANDLORD") return { ok: false, error: "Accès refusé." };

  await db.rentPeriod.update({
    where: { id: rentPeriodId },
    data: { status: RentPeriodStatus.WAIVED },
  });
  revalidatePath(`/bailleur/baux/${period.leaseId}`);
  revalidatePath(`/locataire/baux/${period.leaseId}`);
  return { ok: true };
}

/**
 * Génère la quittance PDF pour une période PAID. Bailleur-only.
 * Le PDF est stocké dans le bucket privé et référencé dans
 * DocumentVault. Régénérer remplace la version précédente.
 */
export async function generateReceipt(
  rentPeriodId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };
  if (!isPrivateStorageEnabled()) {
    return { ok: false, error: "Espace documents privé indisponible." };
  }

  const rl = await rateLimit({
    key: `receipt:${session.user.id}`,
    limit: 100,
    windowSec: 3600,
  });
  if (!rl.success) return { ok: false, error: "Trop de générations." };

  const period = await db.rentPeriod.findUnique({
    where: { id: rentPeriodId },
    include: {
      payments: { orderBy: { paidAt: "asc" }, select: { paidAt: true, amount: true } },
      lease: {
        select: {
          propertyAddress: true,
          propertyCity: true,
          landlordUserId: true,
          tenantUserId: true,
          listing: { select: { agencyId: true } },
          landlordUser: { select: { name: true, email: true } },
          tenantUser: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!period) return { ok: false, error: "Période introuvable." };

  const role = await canAccessLease(
    session.user.id,
    session.user.agencyId,
    period.lease ? (period as unknown as { leaseId: string }).leaseId : "",
  );
  // Re-check le role directement via la période (le lease est inclus)
  const canGenerate =
    period.lease.landlordUserId === session.user.id ||
    (!!session.user.agencyId && period.lease.listing?.agencyId === session.user.agencyId);
  if (!canGenerate || role === "TENANT") {
    return { ok: false, error: "Seul le bailleur peut émettre la quittance." };
  }

  if (period.status !== RentPeriodStatus.PAID) {
    return {
      ok: false,
      error: "La période doit être entièrement payée avant de générer la quittance.",
    };
  }

  const paidOn =
    period.payments.length > 0
      ? period.payments[period.payments.length - 1].paidAt
      : new Date();

  const data: ReceiptPdfData = {
    receiptNumber: `Q-${period.id.slice(-8).toUpperCase()}`,
    landlord: {
      name: period.lease.landlordUser.name ?? period.lease.landlordUser.email,
    },
    tenant: {
      name: period.lease.tenantUser.name ?? period.lease.tenantUser.email,
    },
    property: {
      address: period.lease.propertyAddress,
      city: period.lease.propertyCity,
    },
    period: {
      start: period.periodStart,
      end: period.periodEnd,
    },
    amounts: {
      rent: period.amountRent,
      charges: period.amountCharges,
      total: period.amountTotal,
    },
    paidOn,
    issuedAt: new Date(),
  };

  const { renderToBuffer } = await import("@react-pdf/renderer");
  const element = ReceiptPdfDocument({ data });
  const buffer = await renderToBuffer(element);

  const path = `receipts/${period.leaseId}/${rentPeriodId}-${Date.now()}.pdf`;
  try {
    await uploadToPrivateStorage({
      objectPath: path,
      body: buffer,
      contentType: "application/pdf",
    });
  } catch (err) {
    console.error("[receipt/generate] upload failed:", (err as Error).message);
    return { ok: false, error: "Upload échoué." };
  }

  const doc = await db.documentVault.create({
    data: {
      userId: session.user.id,
      category: "RECEIPT",
      path,
      filename: `quittance-${data.receiptNumber}.pdf`,
      mimeType: "application/pdf",
      size: buffer.byteLength,
      relatedEntityId: period.id,
    },
    select: { id: true },
  });

  await db.rentPeriod.update({
    where: { id: period.id },
    data: {
      receiptDocId: doc.id,
      receiptGeneratedAt: new Date(),
    },
  });

  revalidatePath(`/bailleur/baux/${period.leaseId}`);
  revalidatePath(`/locataire/baux/${period.leaseId}`);
  return { ok: true };
}
