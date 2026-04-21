export const PROPERTY_TYPES = [
  "APARTMENT",
  "VILLA",
  "RIAD",
  "HOUSE",
  "DUPLEX",
  "STUDIO",
  "OFFICE",
  "LAND",
  "COMMERCIAL",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  APARTMENT: "Appartement",
  VILLA: "Villa",
  RIAD: "Riad",
  HOUSE: "Maison",
  DUPLEX: "Duplex",
  STUDIO: "Studio",
  OFFICE: "Bureau",
  LAND: "Terrain",
  COMMERCIAL: "Local commercial",
};

export const PROPERTY_TYPE_LABEL_PLURAL: Record<PropertyType, string> = {
  APARTMENT: "Appartements",
  VILLA: "Villas",
  RIAD: "Riads",
  HOUSE: "Maisons",
  DUPLEX: "Duplex",
  STUDIO: "Studios",
  OFFICE: "Bureaux",
  LAND: "Terrains",
  COMMERCIAL: "Locaux commerciaux",
};

export const TRANSACTION_VERB = {
  SALE: "à vendre",
  RENT: "à louer",
} as const;

export const AMENITIES = [
  { key: "parking", label: "Parking" },
  { key: "elevator", label: "Ascenseur" },
  { key: "furnished", label: "Meublé" },
  { key: "terrace", label: "Terrasse" },
  { key: "balcony", label: "Balcon" },
  { key: "garden", label: "Jardin" },
  { key: "pool", label: "Piscine" },
  { key: "seaView", label: "Vue mer" },
  { key: "airConditioning", label: "Climatisation" },
] as const;
export type AmenityKey = (typeof AMENITIES)[number]["key"];

export const AMENITY_LABEL: Record<string, string> = Object.fromEntries(
  AMENITIES.map((a) => [a.key, a.label]),
);

export const SORT_OPTIONS = [
  { value: "newest", label: "Plus récent" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "surface_desc", label: "Surface (grand)" },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]["value"];
