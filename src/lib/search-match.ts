// Builder pur pour la clause WHERE de matching SearchRequest → Listing.
// Extrait pour test unitaire (zéro dépendance Prisma au runtime).

export type SearchMatchInput = {
  transaction: "RENT" | "SALE";
  propertyType: string;
  citySlug: string;
  budgetMax: number;
  minBedrooms?: number | null;
  minSurface?: number | null;
  furnished?: boolean | null;
  neighborhoodIds?: string[];
};

export type SearchMatchWhere = {
  status: "PUBLISHED";
  transaction: "RENT" | "SALE";
  propertyType: string;
  citySlug: string;
  price: { lte: number };
  bedrooms?: { gte: number };
  surface?: { gte: number };
  furnished?: true;
  neighborhoodId?: { in: string[] };
};

export function buildSearchMatchWhere(
  input: SearchMatchInput,
): SearchMatchWhere {
  const where: SearchMatchWhere = {
    status: "PUBLISHED",
    transaction: input.transaction,
    propertyType: input.propertyType,
    citySlug: input.citySlug,
    price: { lte: input.budgetMax },
  };
  if (input.minBedrooms != null && input.minBedrooms > 0) {
    where.bedrooms = { gte: input.minBedrooms };
  }
  if (input.minSurface != null && input.minSurface > 0) {
    where.surface = { gte: input.minSurface };
  }
  if (input.furnished === true) {
    where.furnished = true;
  }
  if (input.neighborhoodIds && input.neighborhoodIds.length > 0) {
    where.neighborhoodId = { in: input.neighborhoodIds };
  }
  return where;
}
