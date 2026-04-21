import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db, hasDb } from "@/lib/db";
import { parseSearchParams } from "@/lib/search-params";
import { sendSavedSearchDigest, hasEmailProvider } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fréquences vers intervalle minimum entre deux runs.
const INTERVAL_MS: Record<string, number> = {
  instant: 5 * 60_000, // 5 min — pour un vrai instant il faudrait un worker
  daily: 23 * 3600_000, // -1h pour éviter les dérives
  weekly: 6.8 * 86_400_000,
};

function authorize(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${expected}`;
}

/**
 * Cron digest des recherches sauvegardées. À câbler sur Vercel Cron
 * (ex. every 5 minutes) — l'endpoint choisit lui-même quelles recherches
 * sont dues grâce au champ `lastRunAt` et à la fréquence.
 */
export async function GET(req: Request): Promise<NextResponse> {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!hasDb()) {
    return NextResponse.json({ ok: true, skipped: "no-db", processed: 0 });
  }
  if (!hasEmailProvider()) {
    return NextResponse.json({ ok: true, skipped: "no-email", processed: 0 });
  }

  const now = new Date();
  const searches = await db.savedSearch.findMany({
    include: { user: { select: { email: true, name: true } } },
  });

  let processed = 0;
  let sent = 0;

  for (const s of searches) {
    const frequency = s.frequency in INTERVAL_MS ? s.frequency : "daily";
    const minInterval = INTERVAL_MS[frequency];
    if (s.lastRunAt && now.getTime() - s.lastRunAt.getTime() < minInterval) continue;

    processed += 1;
    const filters = parseSearchParams(parseQueryString(s.query));
    const since = s.lastRunAt ?? new Date(now.getTime() - 24 * 3600_000);

    const where = buildWhere(filters, since);

    try {
      const listings = await db.listing.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: 10,
        include: { city: { select: { name: true } } },
      });

      if (listings.length > 0 && s.user.email) {
        await sendSavedSearchDigest({
          to: s.user.email,
          name: s.user.name,
          searchName: s.name,
          listings: listings.map((l) => ({
            title: l.title,
            slug: l.slug,
            city: l.city.name,
            price: l.price,
          })),
        });
        sent += 1;
      }
      await db.savedSearch.update({
        where: { id: s.id },
        data: { lastRunAt: now },
      });
    } catch (err) {
      console.error("[cron/saved-searches]", s.id, (err as Error).message);
    }
  }

  return NextResponse.json({ ok: true, processed, sent });
}

function parseQueryString(q: string): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  const cleaned = q.replace(/^\?/, "");
  if (!cleaned) return out;
  const usp = new URLSearchParams(cleaned);
  for (const [k, v] of usp.entries()) {
    const existing = out[k];
    if (existing === undefined) out[k] = v;
    else if (Array.isArray(existing)) existing.push(v);
    else out[k] = [existing, v];
  }
  return out;
}

function buildWhere(filters: ReturnType<typeof parseSearchParams>, since: Date): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {
    status: "PUBLISHED",
    publishedAt: { gt: since },
    transaction: filters.transaction,
    ...(filters.citySlug ? { citySlug: filters.citySlug } : {}),
    ...(filters.neighborhoodSlug ? { neighborhood: { slug: filters.neighborhoodSlug } } : {}),
    ...(filters.propertyTypes.length ? { propertyType: { in: filters.propertyTypes } } : {}),
    ...(filters.priceMin || filters.priceMax
      ? {
          price: {
            ...(filters.priceMin ? { gte: filters.priceMin } : {}),
            ...(filters.priceMax ? { lte: filters.priceMax } : {}),
          },
        }
      : {}),
    ...(filters.surfaceMin || filters.surfaceMax
      ? {
          surface: {
            ...(filters.surfaceMin ? { gte: filters.surfaceMin } : {}),
            ...(filters.surfaceMax ? { lte: filters.surfaceMax } : {}),
          },
        }
      : {}),
    ...(filters.bedroomsMin ? { bedrooms: { gte: filters.bedroomsMin } } : {}),
    ...(filters.bathroomsMin ? { bathrooms: { gte: filters.bathroomsMin } } : {}),
    ...Object.fromEntries(filters.amenities.map((a) => [a, true])),
  };
  return where;
}
