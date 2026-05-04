"use server";

// Lead routing /je-cherche (Phase 3.5).
//
// Workflow :
//   1. Visiteur (ouvert ou connecté) remplit le wizard
//   2. On crée une SearchRequest + on cherche les annonces matching
//   3. Si matches ≥ 1 : status=MATCHED, email visiteur avec les annonces
//      + notification des bailleurs concernés
//   4. Si matches = 0 : queue QStash pour routing agences externes J+2
//
// Aucune PII externalisée sans consentement explicite — le lead n'est
// jamais vendu aux /partners si le visiteur n'a pas coché la case.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PropertyType, Transaction } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, absoluteUrl } from "@/lib/resend";
import { renderEmailLayout } from "@/lib/resend";
import { sendSearchRequestConfirmation } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { buildSearchMatchWhere } from "@/lib/search-match";
import { CITIES } from "@/data/cities";

type Result =
  | { ok: true; id: string; matchCount: number }
  | { ok: false; error: string };

const schema = z.object({
  transaction: z.nativeEnum(Transaction),
  propertyType: z.nativeEnum(PropertyType),
  citySlug: z.string().trim().min(1),
  neighborhoodSlugs: z.array(z.string()).default([]),
  minBedrooms: z.coerce.number().int().min(0).optional().nullable(),
  minSurface: z.coerce.number().int().min(0).optional().nullable(),
  furnished: z.boolean().optional(),
  budgetMax: z.coerce.number().int().min(0),
  timeline: z.enum(["month", "quarter", "flexible"]),
  contactName: z.string().trim().min(2).max(140),
  contactEmail: z.string().trim().email().max(200),
  contactPhone: z.string().trim().min(6).max(40),
  consent: z.literal("on").or(z.literal("true")),
});

export async function createSearchRequest(
  form: FormData,
): Promise<Result> {
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  // Rate-limit par email (évite les bots)
  const email = String(form.get("contactEmail") ?? "");
  const rl = await rateLimit({
    key: `search-request:${email}`,
    limit: 10,
    windowSec: 3600,
  });
  if (!rl.success) {
    return { ok: false, error: "Trop de demandes récentes." };
  }

  const neighborhoodsRaw = form.getAll("neighborhoodSlugs");
  const furnishedRaw = form.get("furnished");

  const parsed = schema.safeParse({
    transaction: form.get("transaction") ?? Transaction.RENT,
    propertyType: form.get("propertyType") ?? PropertyType.APARTMENT,
    citySlug: form.get("citySlug") ?? "",
    neighborhoodSlugs: neighborhoodsRaw.map((n) => String(n)).filter(Boolean),
    minBedrooms: form.get("minBedrooms") ?? undefined,
    minSurface: form.get("minSurface") ?? undefined,
    furnished:
      furnishedRaw === "on" || furnishedRaw === "true" ? true : undefined,
    budgetMax: form.get("budgetMax") ?? 0,
    timeline: form.get("timeline") ?? "flexible",
    contactName: form.get("contactName") ?? "",
    contactEmail: form.get("contactEmail") ?? "",
    contactPhone: form.get("contactPhone") ?? "",
    consent: form.get("consent") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: "Formulaire invalide." };
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  // Chercher des matches immédiats — on résout d'abord les quartiers
  // (slug → id) puis on délègue à la fonction pure buildSearchMatchWhere.
  let neighborhoodIds: string[] = [];
  if (parsed.data.neighborhoodSlugs.length > 0) {
    const ns = await db.neighborhood.findMany({
      where: {
        citySlug: parsed.data.citySlug,
        slug: { in: parsed.data.neighborhoodSlugs },
      },
      select: { id: true },
    });
    neighborhoodIds = ns.map((n) => n.id);
  }

  const matchWhere = buildSearchMatchWhere({
    transaction: parsed.data.transaction,
    propertyType: parsed.data.propertyType,
    citySlug: parsed.data.citySlug,
    budgetMax: parsed.data.budgetMax,
    minBedrooms: parsed.data.minBedrooms,
    minSurface: parsed.data.minSurface,
    furnished: parsed.data.furnished,
    neighborhoodIds,
  });

  const matches = await db.listing.findMany({
    // SearchMatchWhere typing matches at runtime ; cast pour aider Prisma
    // qui veut ses enums fortement typés.
    where: matchWhere as never,
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      coverImage: true,
      surface: true,
      ownerId: true,
      city: { select: { name: true } },
    },
  });

  const request = await db.searchRequest.create({
    data: {
      userId,
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone,
      transaction: parsed.data.transaction,
      propertyType: parsed.data.propertyType,
      citySlug: parsed.data.citySlug,
      neighborhoodSlugs: parsed.data.neighborhoodSlugs,
      minBedrooms: parsed.data.minBedrooms ?? null,
      minSurface: parsed.data.minSurface ?? null,
      furnished: parsed.data.furnished ?? null,
      budgetMax: parsed.data.budgetMax,
      timeline: parsed.data.timeline,
      status: matches.length > 0 ? "MATCHED" : "ACTIVE",
      matchedListingIds: matches.map((m) => m.id),
    },
    select: { id: true },
  });

  // Confirmation visiteur — toujours envoyée, qu'il y ait des matches
  // ou pas. Donne au candidat la confirmation que sa demande a bien
  // été enregistrée et un lien pour la gérer.
  const cityName =
    CITIES.find((c) => c.slug === parsed.data.citySlug)?.name ??
    parsed.data.citySlug;
  await sendSearchRequestConfirmation({
    to: parsed.data.contactEmail,
    contactName: parsed.data.contactName,
    matchCount: matches.length,
    city: cityName,
    transaction: parsed.data.transaction,
    manageUrl: absoluteUrl("/compte/recherches"),
  }).catch(() => null);

  // Email au visiteur avec les matches HTML détaillé (si ≥ 1)
  if (matches.length > 0) {
    const listRows = matches
      .slice(0, 5)
      .map(
        (m) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #ebe3d1;">
              <a href="${absoluteUrl(`/annonce/${m.slug}`)}" style="font-weight:600;color:#1a2540;text-decoration:none;">${m.title}</a>
              <p style="margin:4px 0 0;font-size:12px;color:#5a6478;">${m.city.name} · ${m.surface} m² · <span style="color:#c04e2e;">${m.price.toLocaleString("fr-FR")} MAD</span></p>
            </td>
          </tr>`,
      )
      .join("");

    await sendEmail({
      to: parsed.data.contactEmail,
      subject: `${matches.length} annonce${matches.length > 1 ? "s" : ""} correspondent à votre recherche`,
      html: renderEmailLayout({
        title: `Nous avons trouvé ${matches.length} bien${matches.length > 1 ? "s" : ""} pour vous`,
        body: `
          <p>Bonjour ${parsed.data.contactName},</p>
          <p>Voici les annonces qui correspondent à votre recherche sur Baboo :</p>
          <table role="presentation" width="100%">${listRows}</table>
        `,
        cta: {
          label: "Voir les annonces →",
          href: absoluteUrl(
            `/recherche?t=${parsed.data.transaction === "RENT" ? "rent" : "sale"}&city=${parsed.data.citySlug}`,
          ),
        },
      }),
    });

    // Notifier les bailleurs concernés
    const uniqueOwners = Array.from(new Set(matches.map((m) => m.ownerId)));
    for (const ownerId of uniqueOwners) {
      await createNotification({
        userId: ownerId,
        type: "SAVED_SEARCH_MATCH",
        title: "Un candidat a une recherche qui vous concerne",
        body: `${parsed.data.contactName} cherche ${parsed.data.transaction === "RENT" ? "à louer" : "à acheter"} à ${parsed.data.citySlug}.`,
        linkUrl: "/bailleur/candidatures",
      });
    }
  }

  revalidatePath("/je-cherche");
  return { ok: true, id: request.id, matchCount: matches.length };
}
