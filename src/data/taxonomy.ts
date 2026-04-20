export type Transaction = "SALE" | "RENT";

export type PropertyType =
  | "APARTMENT"
  | "VILLA"
  | "RIAD"
  | "HOUSE"
  | "OFFICE"
  | "COMMERCIAL"
  | "LAND"
  | "INDUSTRIAL"
  | "BUILDING";

export const TRANSACTION_LABEL: Record<Transaction, string> = {
  SALE: "Achat",
  RENT: "Location",
};

export const TRANSACTION_VERB: Record<Transaction, string> = {
  SALE: "à vendre",
  RENT: "à louer",
};

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  APARTMENT: "Appartement",
  VILLA: "Villa",
  RIAD: "Riad",
  HOUSE: "Maison",
  OFFICE: "Bureau",
  COMMERCIAL: "Local commercial",
  LAND: "Terrain",
  INDUSTRIAL: "Local industriel",
  BUILDING: "Immeuble",
};

export const PROPERTY_TYPE_LABEL_PLURAL: Record<PropertyType, string> = {
  APARTMENT: "Appartements",
  VILLA: "Villas",
  RIAD: "Riads",
  HOUSE: "Maisons",
  OFFICE: "Bureaux",
  COMMERCIAL: "Locaux commerciaux",
  LAND: "Terrains",
  INDUSTRIAL: "Locaux industriels",
  BUILDING: "Immeubles",
};

export const PROPERTY_TYPES: PropertyType[] = [
  "APARTMENT",
  "VILLA",
  "RIAD",
  "HOUSE",
  "OFFICE",
  "COMMERCIAL",
  "LAND",
  "INDUSTRIAL",
  "BUILDING",
];

export const AMENITIES = [
  { key: "parking", label: "Parking" },
  { key: "elevator", label: "Ascenseur" },
  { key: "furnished", label: "Meublé" },
  { key: "terrace", label: "Terrasse" },
  { key: "balcony", label: "Balcon" },
  { key: "garden", label: "Jardin" },
  { key: "pool", label: "Piscine" },
  { key: "security", label: "Sécurité 24/7" },
  { key: "seaView", label: "Vue sur mer" },
  { key: "airConditioning", label: "Climatisation" },
  { key: "concierge", label: "Conciergerie" },
] as const;

export type AmenityKey = (typeof AMENITIES)[number]["key"];

export const CONDITION_LABEL = {
  NEW: "Neuf",
  GOOD: "Bon état",
  TO_RENOVATE: "À rénover",
  UNDER_CONSTRUCTION: "En construction",
} as const;

export type Condition = keyof typeof CONDITION_LABEL;

export const SORT_OPTIONS = [
  { value: "newest", label: "Plus récentes" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "surface_desc", label: "Surface décroissante" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];
