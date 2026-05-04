import { describe, it, expect } from "vitest";
import { buildSearchMatchWhere } from "../search-match";

describe("buildSearchMatchWhere", () => {
  const base = {
    transaction: "RENT" as const,
    propertyType: "APARTMENT",
    citySlug: "casablanca",
    budgetMax: 10000,
  };

  it("génère la base sans filtres optionnels", () => {
    expect(buildSearchMatchWhere(base)).toEqual({
      status: "PUBLISHED",
      transaction: "RENT",
      propertyType: "APARTMENT",
      citySlug: "casablanca",
      price: { lte: 10000 },
    });
  });

  it("ajoute bedrooms quand minBedrooms > 0", () => {
    const w = buildSearchMatchWhere({ ...base, minBedrooms: 2 });
    expect(w.bedrooms).toEqual({ gte: 2 });
  });

  it("ignore minBedrooms quand 0 ou null", () => {
    expect(buildSearchMatchWhere({ ...base, minBedrooms: 0 }).bedrooms).toBeUndefined();
    expect(buildSearchMatchWhere({ ...base, minBedrooms: null }).bedrooms).toBeUndefined();
  });

  it("ajoute surface quand minSurface > 0", () => {
    const w = buildSearchMatchWhere({ ...base, minSurface: 70 });
    expect(w.surface).toEqual({ gte: 70 });
  });

  it("active furnished uniquement si true (pas si false ou null)", () => {
    expect(buildSearchMatchWhere({ ...base, furnished: true }).furnished).toBe(true);
    expect(buildSearchMatchWhere({ ...base, furnished: false }).furnished).toBeUndefined();
    expect(buildSearchMatchWhere({ ...base, furnished: null }).furnished).toBeUndefined();
  });

  it("ajoute neighborhoodId quand au moins un quartier fourni", () => {
    const w = buildSearchMatchWhere({
      ...base,
      neighborhoodIds: ["a", "b"],
    });
    expect(w.neighborhoodId).toEqual({ in: ["a", "b"] });
  });

  it("ignore neighborhoodId quand tableau vide", () => {
    const w = buildSearchMatchWhere({ ...base, neighborhoodIds: [] });
    expect(w.neighborhoodId).toBeUndefined();
  });

  it("compose tous les filtres ensemble", () => {
    const w = buildSearchMatchWhere({
      ...base,
      transaction: "SALE",
      propertyType: "VILLA",
      budgetMax: 5_000_000,
      minBedrooms: 4,
      minSurface: 250,
      neighborhoodIds: ["palmeraie"],
    });
    expect(w).toEqual({
      status: "PUBLISHED",
      transaction: "SALE",
      propertyType: "VILLA",
      citySlug: "casablanca",
      price: { lte: 5_000_000 },
      bedrooms: { gte: 4 },
      surface: { gte: 250 },
      neighborhoodId: { in: ["palmeraie"] },
    });
  });
});
