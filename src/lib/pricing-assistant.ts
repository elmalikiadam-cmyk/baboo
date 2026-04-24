// Assistant prix — suggère une fourchette de prix basée sur les
// listings comparables publiés dans la même ville + type +
// surface ±20%.
//
// Algorithme :
//   1. Query Prisma : same city, same type, same transaction,
//      surface ±20%, status PUBLISHED, publishedAt non null
//   2. Priorité au même quartier si disponible, fallback ville entière
//   3. Calcule percentiles 25/50/75 du prix/m², multiplie par surface
//   4. Retourne confidence basée sur sampleSize

import { PropertyType, Transaction } from "@prisma/client";
import { db, hasDb } from "@/lib/db";

export type PricingSuggestion = {
  low: number;
  median: number;
  high: number;
  confidence: "high" | "medium" | "low";
  sampleSize: number;
  pricePerSqmMedian: number;
};

export type PricingInput = {
  citySlug: string;
  neighborhoodSlug?: string | null;
  propertyType: PropertyType;
  surface: number;
  transaction: Transaction;
};

const MIN_SURFACE_RATIO = 0.8;
const MAX_SURFACE_RATIO = 1.2;

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export async function suggestPrice(
  input: PricingInput,
): Promise<PricingSuggestion | null> {
  if (!hasDb() || input.surface <= 0) return null;

  const surfaceMin = Math.floor(input.surface * MIN_SURFACE_RATIO);
  const surfaceMax = Math.ceil(input.surface * MAX_SURFACE_RATIO);

  async function fetchComparables(includeNeighborhood: boolean) {
    const where: Record<string, unknown> = {
      citySlug: input.citySlug,
      propertyType: input.propertyType,
      transaction: input.transaction,
      status: "PUBLISHED",
      surface: { gte: surfaceMin, lte: surfaceMax },
    };
    if (includeNeighborhood && input.neighborhoodSlug) {
      const n = await db.neighborhood.findFirst({
        where: {
          citySlug: input.citySlug,
          slug: input.neighborhoodSlug,
        },
        select: { id: true },
      });
      if (n) where.neighborhoodId = n.id;
    }
    return db.listing.findMany({
      where,
      select: { price: true, surface: true },
      take: 200,
    });
  }

  let comparables = input.neighborhoodSlug
    ? await fetchComparables(true)
    : [];
  if (comparables.length < 3) {
    // fallback ville entière
    comparables = await fetchComparables(false);
  }

  if (comparables.length === 0) return null;

  const pricesPerSqm = comparables
    .filter((l) => l.surface > 0)
    .map((l) => l.price / l.surface)
    .sort((a, b) => a - b);

  const q25 = percentile(pricesPerSqm, 0.25);
  const q50 = percentile(pricesPerSqm, 0.5);
  const q75 = percentile(pricesPerSqm, 0.75);

  const low = Math.round(q25 * input.surface);
  const median = Math.round(q50 * input.surface);
  const high = Math.round(q75 * input.surface);

  const confidence: PricingSuggestion["confidence"] =
    comparables.length >= 10
      ? "high"
      : comparables.length >= 3
        ? "medium"
        : "low";

  return {
    low,
    median,
    high,
    confidence,
    sampleSize: comparables.length,
    pricePerSqmMedian: Math.round(q50),
  };
}
