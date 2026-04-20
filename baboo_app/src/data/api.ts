import { getSupabase } from "@/lib/supabase";
import { LISTINGS, type Listing, type Source, type Transaction } from "@/data/listings";

// Rangée Supabase telle qu'elle sort de la table `Listing`. On garde un mapper
// vers le type `Listing` de l'app pour isoler le schema DB des vues.
type SupabaseListingRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  transaction: "SALE" | "RENT";
  propertyType: string;
  price: number;
  surface: number;
  bedrooms: number | null;
  bathrooms: number | null;
  coverImage: string;
  citySlug: string;
  lat: number;
  lng: number;
  featured: boolean;
  parking: boolean;
  elevator: boolean;
  furnished: boolean;
  terrace: boolean;
  balcony: boolean;
  garden: boolean;
  pool: boolean;
  seaView: boolean;
  agencyId: string | null;
  city: { name: string } | null;
  neighborhood: { name: string } | null;
};

function rowToListing(r: SupabaseListingRow): Listing {
  const type: Transaction = r.transaction === "RENT" ? "LOCATION" : "VENTE";
  const unit = type === "LOCATION" ? "MAD/MOIS" : "MAD";
  const source: Source = r.agencyId ? "PRO" : "PARTICULIER";
  const cityName = r.city?.name ?? r.citySlug;
  const neighborhoodName = r.neighborhood?.name ?? "";

  const extras: string[] = [];
  if (r.pool) extras.push("PISCINE");
  if (r.garden) extras.push("JARDIN");
  if (r.terrace) extras.push("TERRASSE");
  if (r.balcony) extras.push("BALCON");
  if (r.seaView) extras.push("VUE MER");
  if (r.parking) extras.push("PARKING");
  if (r.furnished) extras.push("MEUBLÉ");
  if (r.elevator) extras.push("ASCENSEUR");

  return {
    ref: `BB-${r.slug.slice(-4).toUpperCase()}`,
    type,
    price: new Intl.NumberFormat("fr-FR").format(r.price),
    priceRaw: r.price,
    unit,
    title: r.propertyType,
    location: `${cityName.toUpperCase()}${neighborhoodName ? ` — ${neighborhoodName.toUpperCase()}` : ""}`,
    city: cityName,
    neighborhood: neighborhoodName,
    rooms: r.bedrooms != null ? `${r.bedrooms} CH` : "—",
    roomsN: r.bedrooms ?? 0,
    bathrooms: r.bathrooms ?? 0,
    area: `${r.surface} M²`,
    areaN: r.surface,
    extras,
    source,
    verified: true,
    premium: r.featured,
    label: r.propertyType,
    cover: r.coverImage,
    gallery: [r.coverImage],
    description: r.description,
    agency: r.agencyId
      ? { name: "Agence partenaire", phone: "+212522000000", verified: true }
      : undefined,
  };
}

const LISTING_SELECT = `
  id, slug, title, description, transaction, propertyType, price, surface,
  bedrooms, bathrooms, coverImage, citySlug, lat, lng, featured,
  parking, elevator, furnished, terrace, balcony, garden, pool, seaView, agencyId,
  city:City(name),
  neighborhood:Neighborhood(name)
`;

/**
 * Liste des annonces. Utilise Supabase si configuré, sinon fallback sur la
 * data mock locale pour que l'app tourne sans backend.
 */
export async function fetchListings(): Promise<Listing[]> {
  const sb = getSupabase();
  if (!sb) return LISTINGS;

  const { data, error } = await sb
    .from("Listing")
    .select(LISTING_SELECT)
    .eq("status", "PUBLISHED")
    .order("publishedAt", { ascending: false })
    .limit(50);

  if (error || !data) {
    console.warn("[api.fetchListings] fallback on mock:", error?.message);
    return LISTINGS;
  }
  return (data as unknown as SupabaseListingRow[]).map(rowToListing);
}

export async function fetchListing(ref: string): Promise<Listing | null> {
  const sb = getSupabase();
  if (!sb) return LISTINGS.find((l) => l.ref === ref) ?? null;

  // Ref = "BB-XXXX", on retrouve l'annonce via la fin de son slug.
  const slugEnd = ref.replace(/^BB-/, "").toLowerCase();

  const { data, error } = await sb
    .from("Listing")
    .select(LISTING_SELECT)
    .ilike("slug", `%${slugEnd}`)
    .eq("status", "PUBLISHED")
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return LISTINGS.find((l) => l.ref === ref) ?? null;
  }
  return rowToListing(data as unknown as SupabaseListingRow);
}
