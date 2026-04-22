import { db, hasDb } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { SearchFilters } from "@/lib/search-params";

const PAGE_SIZE = 18;

const LISTING_INCLUDE = {
  city: true,
  neighborhood: true,
  agency: {
    select: {
      id: true,
      slug: true,
      name: true,
      verified: true,
      logo: true,
    },
  },
} as const;

export async function findListings(f: SearchFilters) {
  const where: Prisma.ListingWhereInput = {
    status: "PUBLISHED",
    transaction: f.transaction,
    ...(f.citySlug ? { citySlug: f.citySlug } : {}),
    ...(f.neighborhoodSlug
      ? { neighborhood: { slug: f.neighborhoodSlug } }
      : {}),
    ...(f.propertyTypes.length ? { propertyType: { in: f.propertyTypes } } : {}),
    ...(f.priceMin || f.priceMax
      ? {
          price: {
            ...(f.priceMin ? { gte: f.priceMin } : {}),
            ...(f.priceMax ? { lte: f.priceMax } : {}),
          },
        }
      : {}),
    ...(f.surfaceMin || f.surfaceMax
      ? {
          surface: {
            ...(f.surfaceMin ? { gte: f.surfaceMin } : {}),
            ...(f.surfaceMax ? { lte: f.surfaceMax } : {}),
          },
        }
      : {}),
    ...(f.bedroomsMin ? { bedrooms: { gte: f.bedroomsMin } } : {}),
    ...(f.bathroomsMin ? { bathrooms: { gte: f.bathroomsMin } } : {}),
    ...(f.featuredOnly ? { featured: true } : {}),
    ...(f.keyword
      ? {
          OR: [
            { title: { contains: f.keyword, mode: "insensitive" } },
            { description: { contains: f.keyword, mode: "insensitive" } },
          ],
        }
      : {}),
    ...Object.fromEntries(f.amenities.map((a) => [a, true])),
  };

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    f.sort === "price_asc"
      ? { price: "asc" }
      : f.sort === "price_desc"
        ? { price: "desc" }
        : f.sort === "surface_desc"
          ? { surface: "desc" }
          : { publishedAt: "desc" };

  if (!hasDb()) {
    return { items: [], total: 0, page: f.page, pageSize: PAGE_SIZE, totalPages: 1 };
  }

  try {
    const [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy,
        skip: (f.page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: LISTING_INCLUDE,
      }),
      db.listing.count({ where }),
    ]);

    return {
      items,
      total,
      page: f.page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
  } catch {
    return { items: [], total: 0, page: f.page, pageSize: PAGE_SIZE, totalPages: 1 };
  }
}

export type ListingWithRelations = Awaited<
  ReturnType<typeof findListings>
>["items"][number];

/** Récupère l'annonce éditoriale mise en avant pour le hero home V3. */
export async function getFeaturedListing(): Promise<ListingWithRelations | null> {
  if (!hasDb()) return null;
  try {
    // Priorité : coupDeCoeur > exclusive > featured > plus récent.
    const candidates = await Promise.all([
      db.listing.findFirst({
        where: { status: "PUBLISHED", coupDeCoeur: true },
        orderBy: { publishedAt: "desc" },
        include: LISTING_INCLUDE,
      }),
      db.listing.findFirst({
        where: { status: "PUBLISHED", exclusive: true },
        orderBy: { publishedAt: "desc" },
        include: LISTING_INCLUDE,
      }),
      db.listing.findFirst({
        where: { status: "PUBLISHED", featured: true },
        orderBy: { publishedAt: "desc" },
        include: LISTING_INCLUDE,
      }),
    ]);
    return candidates.find((c) => c != null) ?? null;
  } catch {
    return null;
  }
}

/** Stats home : total annonces, nb d'agences vérifiées, nb villes couvertes. */
export async function getPlatformStats(): Promise<{
  total: number;
  agencies: number;
  cities: number;
}> {
  if (!hasDb()) return { total: 0, agencies: 0, cities: 12 };
  try {
    const [total, agencies, cities] = await Promise.all([
      db.listing.count({ where: { status: "PUBLISHED" } }),
      db.agency.count({ where: { verified: true } }),
      db.city.count(),
    ]);
    return { total, agencies, cities };
  } catch {
    return { total: 0, agencies: 0, cities: 12 };
  }
}

/** N dernières annonces, triées par date de publication desc. Pour la home. */
export async function getLatestListings(limit = 4): Promise<ListingWithRelations[]> {
  if (!hasDb()) return [];
  try {
    return await db.listing.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: LISTING_INCLUDE,
    });
  } catch {
    return [];
  }
}
