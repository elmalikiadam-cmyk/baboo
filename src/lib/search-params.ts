import type { Transaction, PropertyType, SortKey } from "@/data/taxonomy";
import { PROPERTY_TYPES, SORT_OPTIONS } from "@/data/taxonomy";

export interface SearchFilters {
  transaction: Transaction;
  citySlug?: string;
  neighborhoodSlug?: string;
  propertyTypes: PropertyType[];
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  bedroomsMin?: number;
  bathroomsMin?: number;
  amenities: string[];
  keyword?: string;
  featuredOnly?: boolean;
  sort: SortKey;
  page: number;
}

const AMENITY_KEYS = [
  "parking", "elevator", "furnished", "terrace", "balcony", "garden",
  "pool", "security", "seaView", "airConditioning", "concierge",
] as const;

function toInt(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function parseSearchParams(sp: Record<string, string | string[] | undefined>): SearchFilters {
  const get = (k: string): string | undefined => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const getAll = (k: string): string[] => {
    const v = sp[k];
    if (Array.isArray(v)) return v;
    if (typeof v === "string" && v.length > 0) return v.split(",");
    return [];
  };

  const transactionRaw = get("t");
  const transaction: Transaction = transactionRaw === "rent" ? "RENT" : "SALE";

  const types = getAll("type")
    .map((x) => x.toUpperCase())
    .filter((x): x is PropertyType => PROPERTY_TYPES.includes(x as PropertyType));

  const amenities = getAll("a").filter((x) => (AMENITY_KEYS as readonly string[]).includes(x));

  const sortRaw = get("sort");
  const sort: SortKey = SORT_OPTIONS.some((s) => s.value === sortRaw) ? (sortRaw as SortKey) : "newest";

  const pageRaw = toInt(get("p"));
  const page = pageRaw && pageRaw > 0 ? pageRaw : 1;

  return {
    transaction,
    citySlug: get("city") || undefined,
    neighborhoodSlug: get("n") || undefined,
    propertyTypes: types,
    priceMin: toInt(get("pmin")),
    priceMax: toInt(get("pmax")),
    surfaceMin: toInt(get("smin")),
    surfaceMax: toInt(get("smax")),
    bedroomsMin: toInt(get("br")),
    bathroomsMin: toInt(get("ba")),
    amenities,
    keyword: get("q")?.trim() || undefined,
    featuredOnly: get("featured") === "1",
    sort,
    page,
  };
}

export function filtersToQueryString(f: Partial<SearchFilters>): string {
  const params = new URLSearchParams();
  if (f.transaction === "RENT") params.set("t", "rent");
  if (f.citySlug) params.set("city", f.citySlug);
  if (f.neighborhoodSlug) params.set("n", f.neighborhoodSlug);
  if (f.propertyTypes && f.propertyTypes.length) params.set("type", f.propertyTypes.join(","));
  if (f.priceMin) params.set("pmin", String(f.priceMin));
  if (f.priceMax) params.set("pmax", String(f.priceMax));
  if (f.surfaceMin) params.set("smin", String(f.surfaceMin));
  if (f.surfaceMax) params.set("smax", String(f.surfaceMax));
  if (f.bedroomsMin) params.set("br", String(f.bedroomsMin));
  if (f.bathroomsMin) params.set("ba", String(f.bathroomsMin));
  if (f.amenities && f.amenities.length) params.set("a", f.amenities.join(","));
  if (f.keyword) params.set("q", f.keyword);
  if (f.featuredOnly) params.set("featured", "1");
  if (f.sort && f.sort !== "newest") params.set("sort", f.sort);
  if (f.page && f.page > 1) params.set("p", String(f.page));
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function buildSearchHref(f: Partial<SearchFilters>): string {
  return `/recherche${filtersToQueryString(f)}`;
}
