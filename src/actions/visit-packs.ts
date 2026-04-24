"use server";

// Achat de packs visites (Phase 2.2).
// Génère une session de paiement via src/lib/payment.ts (CMI/Youcan).
// Si aucun gateway configuré, retombe en mode MANUAL : le pack est
// créé en status PENDING_PAYMENT avec paymentProvider=manual, l'admin
// pourra l'activer à la main via /admin/visit-packs.

import { z } from "zod";
import {
  VisitPackType,
  VisitPackStatus,
} from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import {
  createCheckoutSession,
  isPaymentEnabled,
} from "@/lib/payment";
import { absoluteUrl } from "@/lib/resend";
import { createNotification } from "@/lib/notifications";

type Result =
  | { ok: true; packId: string; redirectUrl?: string; manual?: boolean }
  | { ok: false; error: string };

const PACK_SPECS: Record<
  VisitPackType,
  { credits: number; price: number; label: string }
> = {
  DECOUVERTE_3: { credits: 3, price: 400, label: "Découverte 3 visites" },
  LOCATION_10: { credits: 10, price: 1200, label: "Location 10 visites" },
  LOCATION_25: { credits: 25, price: 2500, label: "Location 25 visites" },
  VENTE_5: { credits: 5, price: 2500, label: "Vente 5 visites" },
  VENTE_10: { credits: 10, price: 4500, label: "Vente 10 visites" },
};

const schema = z.object({
  listingId: z.string().min(1),
  packType: z.nativeEnum(VisitPackType),
});

export async function initiateVisitPackPurchase(
  listingId: string,
  packType: VisitPackType,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const parsed = schema.safeParse({ listingId, packType });
  if (!parsed.success) return { ok: false, error: "Paramètres invalides." };

  const rl = await rateLimit({
    key: `visit-pack-buy:${session.user.id}`,
    limit: 20,
    windowSec: 3600,
  });
  if (!rl.success) return { ok: false, error: "Trop de tentatives." };

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      ownerId: true,
      agencyId: true,
      transaction: true,
    },
  });
  if (!listing) return { ok: false, error: "Annonce introuvable." };
  const canBuy =
    listing.ownerId === session.user.id ||
    (!!session.user.agencyId && listing.agencyId === session.user.agencyId);
  if (!canBuy) return { ok: false, error: "Accès refusé." };

  const spec = PACK_SPECS[packType];
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // Créer le pack en PENDING_PAYMENT
  const pack = await db.visitPack.create({
    data: {
      userId: session.user.id,
      listingId,
      type: packType,
      status: VisitPackStatus.PENDING_PAYMENT,
      creditsTotal: spec.credits,
      creditsUsed: 0,
      amountPaid: spec.price,
      paymentProvider: isPaymentEnabled() ? "gateway" : "manual",
      paymentReference: "",
      expiresAt,
    },
    select: { id: true },
  });

  // Si paiement configuré → checkout session
  if (isPaymentEnabled()) {
    const checkout = await createCheckoutSession({
      amount: spec.price,
      referenceId: pack.id,
      successUrl: absoluteUrl(
        `/publier/${listingId}/pack-visites?paid=${pack.id}`,
      ),
      cancelUrl: absoluteUrl(`/publier/${listingId}/pack-visites`),
      customerEmail: session.user.email ?? "",
      description: `${spec.label} — ${listing.title}`,
    });
    if (checkout.ok) {
      return { ok: true, packId: pack.id, redirectUrl: checkout.checkoutUrl };
    }
    // En cas d'erreur gateway, on reste en PENDING_PAYMENT manuel
  }

  // Mode manuel : admin active à la main depuis /admin/visit-packs
  await createNotification({
    userId: session.user.id,
    type: "SYSTEM",
    title: "Pack visites en attente d'activation",
    body: "Notre équipe vous contactera pour finaliser le paiement sous 24 h.",
    linkUrl: `/publier/${listingId}/pack-visites`,
  });

  return { ok: true, packId: pack.id, manual: true };
}

/** Admin-only : active un pack en PENDING_PAYMENT après encaissement manuel. */
export async function activateManualPack(
  packId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (session.user.role !== "ADMIN") return { ok: false, error: "Accès refusé." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  await db.visitPack.update({
    where: { id: packId },
    data: {
      status: VisitPackStatus.ACTIVE,
      paidAt: new Date(),
    },
  });
  return { ok: true };
}
