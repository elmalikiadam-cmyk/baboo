// Mock listings — suffisant pour alimenter le Feed V2 sans API.
// Format pensé pour l'affichage brutaliste (prix en string formaté, meta en array).

export type Transaction = "VENTE" | "LOCATION";
export type Source = "PRO" | "PARTICULIER";

export interface Listing {
  ref: string;
  type: Transaction;
  price: string;
  unit: string;
  title: string;
  location: string;
  rooms: string;
  area: string;
  extras: string[];
  source: Source;
  verified: boolean;
  premium?: boolean;
  label: string;
}

export const LISTINGS: Listing[] = [
  {
    ref: "BB-4201",
    type: "VENTE",
    price: "4 200 000",
    unit: "MAD",
    title: "RIAD",
    location: "MARRAKECH — MÉDINA",
    rooms: "3 CH",
    area: "220 M²",
    extras: ["PATIO", "TERRASSE"],
    source: "PRO",
    verified: true,
    label: "RIAD · MÉDINA",
  },
  {
    ref: "BB-0951",
    type: "LOCATION",
    price: "9 500",
    unit: "MAD/MOIS",
    title: "APPT.",
    location: "CASABLANCA — MAÂRIF",
    rooms: "2 CH",
    area: "85 M²",
    extras: ["MEUBLÉ", "ASCENSEUR"],
    source: "PRO",
    verified: true,
    label: "APPARTEMENT",
  },
  {
    ref: "BB-1280",
    type: "VENTE",
    price: "12 800 000",
    unit: "MAD",
    title: "VILLA",
    location: "RABAT — SOUISSI",
    rooms: "5 CH",
    area: "480 M²",
    extras: ["PISCINE", "JARDIN", "GARAGE"],
    source: "PRO",
    verified: true,
    premium: true,
    label: "VILLA · PISCINE",
  },
  {
    ref: "BB-2750",
    type: "VENTE",
    price: "2 750 000",
    unit: "MAD",
    title: "DUPLEX",
    location: "TANGER — MALABATA",
    rooms: "3 CH",
    area: "140 M²",
    extras: ["VUE MER"],
    source: "PARTICULIER",
    verified: true,
    label: "DUPLEX",
  },
  {
    ref: "BB-0620",
    type: "LOCATION",
    price: "6 200",
    unit: "MAD/MOIS",
    title: "STUDIO",
    location: "CASABLANCA — GAUTHIER",
    rooms: "1 CH",
    area: "42 M²",
    extras: ["NEUF"],
    source: "PARTICULIER",
    verified: false,
    label: "STUDIO NEUF",
  },
  {
    ref: "BB-1850",
    type: "VENTE",
    price: "1 850 000",
    unit: "MAD",
    title: "APPT.",
    location: "FÈS — SAÏSS",
    rooms: "3 CH",
    area: "110 M²",
    extras: ["PARKING"],
    source: "PRO",
    verified: true,
    label: "APPARTEMENT",
  },
  {
    ref: "BB-3350",
    type: "LOCATION",
    price: "18 000",
    unit: "MAD/MOIS",
    title: "VILLA",
    location: "MARRAKECH — PALMERAIE",
    rooms: "4 CH",
    area: "310 M²",
    extras: ["PISCINE", "MEUBLÉE"],
    source: "PRO",
    verified: true,
    label: "VILLA · PALMERAIE",
  },
  {
    ref: "BB-5500",
    type: "VENTE",
    price: "5 500 000",
    unit: "MAD",
    title: "VILLA",
    location: "AGADIR — FOUNTY",
    rooms: "4 CH",
    area: "280 M²",
    extras: ["VUE MER", "JARDIN"],
    source: "PARTICULIER",
    verified: true,
    label: "VILLA · FOUNTY",
  },
];

export const TOTAL_LISTINGS = 2847;
