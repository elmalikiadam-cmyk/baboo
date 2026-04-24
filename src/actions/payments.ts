"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { createCheckoutSession, isPaymentEnabled } from "@/lib/payment";
import { absoluteUrl } from "@/lib/resend";

type Result = { ok: true; checkoutUrl: string } | { ok: false; error: string };

/**
 * Démarre une session de paiement CMI/Youcan pour une RentPeriod. Le
 * locataire est redirigé vers le checkout gateway, le webhook CMI /
 * Youcan confirme le paiement.
 */
export async function startPaymentCheckout(
  rentPeriodId: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };
  if (!isPaymentEnabled()) {
    return {
      ok: false,
      error:
        "Paiement en ligne non encore activé. Contactez votre bailleur pour régler par virement.",
    };
  }

  const period = await db.rentPeriod.findUnique({
    where: { id: rentPeriodId },
    include: {
      payments: { select: { amount: true } },
      lease: {
        select: {
          tenantUserId: true,
          propertyAddress: true,
          tenantUser: { select: { email: true } },
        },
      },
    },
  });
  if (!period) return { ok: false, error: "Période introuvable." };
  if (period.lease.tenantUserId !== session.user.id) {
    return { ok: false, error: "Accès refusé." };
  }
  if (period.status === "PAID" || period.status === "WAIVED") {
    return { ok: false, error: "Aucun solde dû sur cette période." };
  }

  const paid = period.payments.reduce((s, p) => s + p.amount, 0);
  const amount = period.amountTotal - paid;
  if (amount <= 0) {
    return { ok: false, error: "Montant nul." };
  }

  const periodLabel = period.periodStart.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const res = await createCheckoutSession({
    amount,
    referenceId: rentPeriodId,
    successUrl: absoluteUrl(`/locataire/baux/${period.leaseId}?paid=${rentPeriodId}`),
    cancelUrl: absoluteUrl(`/locataire/baux/${period.leaseId}`),
    customerEmail: period.lease.tenantUser.email,
    description: `Loyer ${periodLabel} — ${period.lease.propertyAddress}`,
  });

  if (!res.ok) {
    return {
      ok: false,
      error: "skipped" in res ? res.reason : res.error,
    };
  }
  return { ok: true, checkoutUrl: res.checkoutUrl };
}

/**
 * Redirect-to-checkout helper (server action → redirect). Utile pour
 * un formulaire server action simple.
 */
export async function redirectToCheckout(
  rentPeriodId: string,
): Promise<void> {
  const res = await startPaymentCheckout(rentPeriodId);
  if (res.ok) {
    redirect(res.checkoutUrl);
  }
  // Sinon on retombe sur la page, la server action ne renvoie rien.
}
