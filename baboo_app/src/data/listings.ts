// Mock listings — suffisant pour alimenter le Feed V2 sans API.
// Format pensé pour l'affichage brutaliste (prix en string formaté, meta en array).

export type Transaction = "VENTE" | "LOCATION";
export type Source = "PRO" | "PARTICULIER";

export interface Listing {
  ref: string;
  type: Transaction;
  price: string;
  priceRaw: number;
  unit: string;
  title: string;
  location: string;
  city: string;
  neighborhood: string;
  rooms: string;
  roomsN: number;
  bathrooms: number;
  area: string;
  areaN: number;
  extras: string[];
  source: Source;
  verified: boolean;
  premium?: boolean;
  label: string;
  cover: string;
  gallery: string[];
  description: string;
  lat?: number;
  lng?: number;
  agency?: {
    name: string;
    phone: string;
    verified: boolean;
  };
}

// Approximation des coordonnées par ville, utilisée pour la carte quand
// l'API ne remonte pas de lat/lng précises.
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Casablanca: { lat: 33.5731, lng: -7.5898 },
  Rabat: { lat: 34.0209, lng: -6.8416 },
  Marrakech: { lat: 31.6295, lng: -7.9811 },
  Tanger: { lat: 35.7595, lng: -5.8339 },
  Agadir: { lat: 30.4278, lng: -9.5981 },
  Fès: { lat: 34.0181, lng: -5.0078 },
  Tétouan: { lat: 35.5786, lng: -5.3684 },
};

export function coordsFor(city: string): { lat: number; lng: number } {
  return CITY_COORDS[city] ?? CITY_COORDS.Casablanca;
}

const P = (url: string) => `${url}?auto=format&fit=crop&w=1600&q=75`;

const APT = [
  P("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"),
  P("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"),
  P("https://images.unsplash.com/photo-1484154218962-a197022b5858"),
  P("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"),
];
const VILLA = [
  P("https://images.unsplash.com/photo-1613977257363-707ba9348227"),
  P("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"),
  P("https://images.unsplash.com/photo-1600585154340-be6161a56a0c"),
  P("https://images.unsplash.com/photo-1580587771525-78b9dba3b914"),
];
const RIAD = [
  P("https://images.unsplash.com/photo-1587620962725-abab7fe55159"),
  P("https://images.unsplash.com/photo-1548013146-72479768bada"),
  P("https://images.unsplash.com/photo-1578683010236-d716f9a3f461"),
];
const STUDIO = [
  P("https://images.unsplash.com/photo-1493809842364-78817add7ffb"),
  P("https://images.unsplash.com/photo-1540518614846-7eded433c457"),
];

export const LISTINGS: Listing[] = [
  {
    ref: "BB-4201",
    type: "VENTE",
    price: "4 200 000",
    priceRaw: 4_200_000,
    unit: "MAD",
    title: "RIAD",
    location: "MARRAKECH — MÉDINA",
    city: "Marrakech",
    neighborhood: "Médina",
    rooms: "3 CH",
    roomsN: 3,
    bathrooms: 2,
    area: "220 M²",
    areaN: 220,
    extras: ["PATIO", "TERRASSE"],
    source: "PRO",
    verified: true,
    label: "RIAD · MÉDINA",
    cover: RIAD[0],
    gallery: RIAD,
    description:
      "Riad authentique de 220 m² au cœur de la médina de Marrakech. Distribution traditionnelle autour d'un patio central, 3 chambres dont une suite, salon zellige, terrasse avec vue sur l'Atlas. Rénové avec soin dans les règles de l'art.",
    agency: { name: "Medina Properties", phone: "+212522000000", verified: true },
  },
  {
    ref: "BB-0951",
    type: "LOCATION",
    price: "9 500",
    priceRaw: 9_500,
    unit: "MAD/MOIS",
    title: "APPT.",
    location: "CASABLANCA — MAÂRIF",
    city: "Casablanca",
    neighborhood: "Maârif",
    rooms: "2 CH",
    roomsN: 2,
    bathrooms: 1,
    area: "85 M²",
    areaN: 85,
    extras: ["MEUBLÉ", "ASCENSEUR"],
    source: "PRO",
    verified: true,
    label: "APPARTEMENT",
    cover: APT[0],
    gallery: APT,
    description:
      "Appartement meublé de 85 m² au 4e étage d'une résidence sécurisée de Maârif. Salon double, 2 chambres, cuisine équipée, ascenseur, parking en sous-sol. Disponible immédiatement.",
    agency: { name: "Oasis Immobilier", phone: "+212522000001", verified: true },
  },
  {
    ref: "BB-1280",
    type: "VENTE",
    price: "12 800 000",
    priceRaw: 12_800_000,
    unit: "MAD",
    title: "VILLA",
    location: "RABAT — SOUISSI",
    city: "Rabat",
    neighborhood: "Souissi",
    rooms: "5 CH",
    roomsN: 5,
    bathrooms: 4,
    area: "480 M²",
    areaN: 480,
    extras: ["PISCINE", "JARDIN", "GARAGE"],
    source: "PRO",
    verified: true,
    premium: true,
    label: "VILLA · PISCINE",
    cover: VILLA[0],
    gallery: VILLA,
    description:
      "Villa contemporaine d'exception à Souissi. 5 chambres, 4 salles de bain, bureau, cinéma, piscine chauffée, jardin paysager de 1200 m², garage 3 voitures. Domotique, sécurité 24/7.",
    agency: { name: "Capital Homes", phone: "+212537000000", verified: true },
  },
  {
    ref: "BB-2750",
    type: "VENTE",
    price: "2 750 000",
    priceRaw: 2_750_000,
    unit: "MAD",
    title: "DUPLEX",
    location: "TANGER — MALABATA",
    city: "Tanger",
    neighborhood: "Malabata",
    rooms: "3 CH",
    roomsN: 3,
    bathrooms: 2,
    area: "140 M²",
    areaN: 140,
    extras: ["VUE MER"],
    source: "PARTICULIER",
    verified: true,
    label: "DUPLEX",
    cover: APT[2],
    gallery: APT,
    description:
      "Duplex traversant avec vue panoramique sur la baie de Tanger. 3 chambres dont une suite parentale, terrasse de 25 m², cave, parking. Résidence avec piscine et concierge.",
  },
  {
    ref: "BB-0620",
    type: "LOCATION",
    price: "6 200",
    priceRaw: 6_200,
    unit: "MAD/MOIS",
    title: "STUDIO",
    location: "CASABLANCA — GAUTHIER",
    city: "Casablanca",
    neighborhood: "Gauthier",
    rooms: "1 CH",
    roomsN: 1,
    bathrooms: 1,
    area: "42 M²",
    areaN: 42,
    extras: ["NEUF"],
    source: "PARTICULIER",
    verified: false,
    label: "STUDIO NEUF",
    cover: STUDIO[0],
    gallery: STUDIO,
    description:
      "Studio neuf de 42 m² à Gauthier. Jamais habité, finitions premium, cuisine équipée, balcon, climatisation. Proche tramway et commerces.",
  },
  {
    ref: "BB-1850",
    type: "VENTE",
    price: "1 850 000",
    priceRaw: 1_850_000,
    unit: "MAD",
    title: "APPT.",
    location: "FÈS — SAÏSS",
    city: "Fès",
    neighborhood: "Saïss",
    rooms: "3 CH",
    roomsN: 3,
    bathrooms: 2,
    area: "110 M²",
    areaN: 110,
    extras: ["PARKING"],
    source: "PRO",
    verified: true,
    label: "APPARTEMENT",
    cover: APT[3],
    gallery: APT,
    description:
      "Appartement familial de 110 m² dans une résidence récente à Saïss. 3 chambres, 2 salles de bain, grand salon, terrasse 12 m², parking en sous-sol, ascenseur.",
    agency: { name: "Atlas Realty", phone: "+212522000003", verified: true },
  },
  {
    ref: "BB-3350",
    type: "LOCATION",
    price: "18 000",
    priceRaw: 18_000,
    unit: "MAD/MOIS",
    title: "VILLA",
    location: "MARRAKECH — PALMERAIE",
    city: "Marrakech",
    neighborhood: "Palmeraie",
    rooms: "4 CH",
    roomsN: 4,
    bathrooms: 3,
    area: "310 M²",
    areaN: 310,
    extras: ["PISCINE", "MEUBLÉE"],
    source: "PRO",
    verified: true,
    label: "VILLA · PALMERAIE",
    cover: VILLA[1],
    gallery: VILLA,
    description:
      "Villa meublée dans un domaine sécurisé de la Palmeraie. 4 chambres, piscine chauffée, jardin de 800 m², domotique. Location minimum 6 mois.",
    agency: { name: "Medina Properties", phone: "+212524000000", verified: true },
  },
  {
    ref: "BB-5500",
    type: "VENTE",
    price: "5 500 000",
    priceRaw: 5_500_000,
    unit: "MAD",
    title: "VILLA",
    location: "AGADIR — FOUNTY",
    city: "Agadir",
    neighborhood: "Founty",
    rooms: "4 CH",
    roomsN: 4,
    bathrooms: 3,
    area: "280 M²",
    areaN: 280,
    extras: ["VUE MER", "JARDIN"],
    source: "PARTICULIER",
    verified: true,
    label: "VILLA · FOUNTY",
    cover: VILLA[2],
    gallery: VILLA,
    description:
      "Villa de plain-pied avec vue imprenable sur l'océan. Architecture contemporaine, 4 chambres, 3 salles de bain, jardin arboré. À 5 min de la plage.",
  },
];

export const TOTAL_LISTINGS = 2847;

export function findListing(ref: string): Listing | undefined {
  return LISTINGS.find((l) => l.ref === ref);
}
