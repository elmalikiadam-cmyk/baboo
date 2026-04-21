import { db, hasDb } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { SearchFilters } from "@/lib/search-params";

const PAGE_SIZE = 18;

export async function findListings(f: SearchFilters) {
  const where: Prisma.ListingWhereInput = {
    status: "PUBLISHED",
    transaction: f.transaction,
    ...(f.citySlug ? { citySlug: f.citySlug } : {}),
    ...(f.neighborhoodSlug
      ? { neighborhood: { slug: f.neighborhoodSlug } }
      : {}),
    ...(f.propertyTypes.length
      ? { propertyType: { in: f.propertyTypes } }
      : {}),
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
        include: {
          city: true,
          neighborhood: true,
        },
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

export async function findLatestListings(limit = 5) {
  if (!hasDb()) return [];
  try {
    return await db.listing.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: { city: true, neighborhood: true },
    });
  } catch {
    return [];
  }
}

export async function findListingBySlug(slug: string) {
  if (!hasDb()) return null;
  try {
    return await db.listing.findUnique({
      where: { slug },
      include: {
        city: true,
        neighborhood: true,
        images: { orderBy: { position: "asc" } },
      },
    });
  } catch {
    return null;
  }
}

export async function findSimilarListings(opts: {
  excludeId: string;
  transaction: "SALE" | "RENT";
  citySlug: string;
  propertyType: string;
  limit?: number;
}) {
  if (!hasDb()) return [];
  try {
    return await db.listing.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: opts.excludeId },
        transaction: opts.transaction,
        citySlug: opts.citySlug,
        propertyType: opts.propertyType as Prisma.ListingWhereInput["propertyType"],
      },
      orderBy: { publishedAt: "desc" },
      take: opts.limit ?? 4,
      include: { city: true, neighborhood: true },
    });
  } catch {
    return [];
  }
}
