"use server";

// Phase 3.6 — server actions pour les agences partenaires externes :
// création (admin), déblocage d'un SearchRequest (self-service, débite
// le creditBalance), top-up (admin manuel).
//
// Note V1 : on n'expose pas d'auth dédiée pour les partenaires ; on
// considère que l'accès passe par un lien magique envoyé par l'équipe.
// Le contrôle d'accès se fait par partnerId + email match.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

type Result = { ok: true } | { ok: false; error: string };

const LEAD_PRICE = 500; // MAD par lead débloqué (V1, à affiner par ville)

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== "ADMIN") return null;
  return session;
}

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().email(),
  contactPhone: z.string().trim().max(40).optional().or(z.literal("")),
  citySlugs: z.array(z.string().min(1)).min(1),
  initialCredit: z.coerce.number().int().min(0).default(0),
});

export async function createPartnerAgency(form: FormData): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Accès refusé." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const parsed = createSchema.safeParse({
    name: form.get("name") ?? "",
    contactName: form.get("contactName") ?? "",
    contactEmail: form.get("contactEmail") ?? "",
    contactPhone: form.get("contactPhone") ?? "",
    citySlugs: form.getAll("citySlugs").map(String).filter(Boolean),
    initialCredit: form.get("initialCredit") ?? 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalide." };
  }
  const d = parsed.data;

  const existing = await db.partnerAgency.findUnique({
    where: { contactEmail: d.contactEmail.toLowerCase() },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "Email déjà enregistré." };
  }

  await db.partnerAgency.create({
    data: {
      name: d.name,
      contactName: d.contactName,
      contactEmail: d.contactEmail.toLowerCase(),
      contactPhone: d.contactPhone || null,
      citySlugs: d.citySlugs,
      creditBalance: d.initialCredit,
      active: true,
    },
  });

  revalidatePath("/admin/partners");
  return { ok: true };
}

export async function topUpPartner(
  partnerId: string,
  amount: number,
): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Accès refusé." };
  if (amount <= 0) return { ok: false, error: "Montant invalide." };

  await db.partnerAgency.update({
    where: { id: partnerId },
    data: { creditBalance: { increment: Math.floor(amount) } },
  });

  revalidatePath("/admin/partners");
  return { ok: true };
}

export async function unlockSearchRequest(
  partnerId: string,
  searchRequestId: string,
): Promise<Result> {
  // V1 : simple vérif email du user connecté = email partenaire.
  const session = await auth();
  if (!session?.user?.email) return { ok: false, error: "Connectez-vous." };

  const partner = await db.partnerAgency.findUnique({
    where: { id: partnerId },
    select: {
      id: true,
      contactEmail: true,
      creditBalance: true,
      active: true,
    },
  });
  if (!partner || !partner.active) {
    return { ok: false, error: "Compte partenaire inactif." };
  }
  if (partner.contactEmail !== session.user.email.toLowerCase()) {
    return { ok: false, error: "Accès refusé." };
  }
  if (partner.creditBalance < LEAD_PRICE) {
    return {
      ok: false,
      error: `Solde insuffisant. Débloquer un lead coûte ${LEAD_PRICE} MAD — rechargez votre compte.`,
    };
  }

  const sr = await db.searchRequest.findUnique({
    where: { id: searchRequestId },
    select: { id: true },
  });
  if (!sr) return { ok: false, error: "Demande introuvable." };

  // Idempotent : si déjà débloqué, on ne redebite pas.
  const already = await db.partnerLeadUnlock.findUnique({
    where: {
      partnerId_searchRequestId: {
        partnerId: partner.id,
        searchRequestId: sr.id,
      },
    },
    select: { id: true },
  });
  if (already) return { ok: true };

  await db.$transaction([
    db.partnerLeadUnlock.create({
      data: {
        partnerId: partner.id,
        searchRequestId: sr.id,
        pricePaid: LEAD_PRICE,
      },
    }),
    db.partnerAgency.update({
      where: { id: partner.id },
      data: {
        creditBalance: { decrement: LEAD_PRICE },
        totalSpent: { increment: LEAD_PRICE },
      },
    }),
    db.searchRequest.update({
      where: { id: sr.id },
      data: {
        status: "ROUTED",
        routingRevenue: { increment: LEAD_PRICE },
      },
    }),
  ]);

  revalidatePath("/partners/inbox");
  revalidatePath("/partners/billing");
  return { ok: true };
}
