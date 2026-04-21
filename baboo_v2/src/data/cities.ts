// 12 villes marocaines couvertes par Baboo. Données statiques, utilisées
// comme source unique pour le seed Prisma, le sitemap et les pages ville.

export interface Neighborhood {
  slug: string;
  name: string;
}

export interface City {
  slug: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  cover: string;        // URL photo Unsplash (architecture/ville sans gens)
  tagline: string;
  neighborhoods: Neighborhood[];
}

export const CITIES: City[] = [
  {
    slug: "casablanca",
    name: "Casablanca",
    region: "Casablanca-Settat",
    lat: 33.5731,
    lng: -7.5898,
    cover:
      "https://images.unsplash.com/photo-1577398131039-d11fd1b28cd9?auto=format&fit=crop&w=800&q=80",
    tagline: "Le poumon économique du Maroc.",
    neighborhoods: [
      { slug: "anfa", name: "Anfa" },
      { slug: "maarif", name: "Maârif" },
      { slug: "gauthier", name: "Gauthier" },
      { slug: "bourgogne", name: "Bourgogne" },
      { slug: "ain-diab", name: "Aïn Diab" },
      { slug: "racine", name: "Racine" },
      { slug: "californie", name: "Californie" },
      { slug: "cil", name: "CIL" },
    ],
  },
  {
    slug: "rabat",
    name: "Rabat",
    region: "Rabat-Salé-Kénitra",
    lat: 34.0209,
    lng: -6.8416,
    cover:
      "https://images.unsplash.com/photo-1553095066-5014bc7b7f2d?auto=format&fit=crop&w=800&q=80",
    tagline: "La capitale, posée et résidentielle.",
    neighborhoods: [
      { slug: "agdal", name: "Agdal" },
      { slug: "souissi", name: "Souissi" },
      { slug: "hassan", name: "Hassan" },
      { slug: "hay-riad", name: "Hay Riad" },
      { slug: "medina", name: "Médina" },
      { slug: "orangers", name: "Les Orangers" },
    ],
  },
  {
    slug: "marrakech",
    name: "Marrakech",
    region: "Marrakech-Safi",
    lat: 31.6295,
    lng: -7.9811,
    cover:
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=80",
    tagline: "Ville ocre, entre palmeraie et médina.",
    neighborhoods: [
      { slug: "hivernage", name: "Hivernage" },
      { slug: "gueliz", name: "Guéliz" },
      { slug: "medina", name: "Médina" },
      { slug: "palmeraie", name: "Palmeraie" },
      { slug: "targa", name: "Targa" },
      { slug: "agdal", name: "Agdal" },
    ],
  },
  {
    slug: "tanger",
    name: "Tanger",
    region: "Tanger-Tétouan-Al Hoceïma",
    lat: 35.7595,
    lng: -5.834,
    cover:
      "https://images.unsplash.com/photo-1570996906126-bfe42a8f69c7?auto=format&fit=crop&w=800&q=80",
    tagline: "La porte du détroit.",
    neighborhoods: [
      { slug: "malabata", name: "Malabata" },
      { slug: "centre-ville", name: "Centre-ville" },
      { slug: "iberia", name: "Iberia" },
      { slug: "californie", name: "Californie" },
      { slug: "boubana", name: "Boubana" },
    ],
  },
  {
    slug: "agadir",
    name: "Agadir",
    region: "Souss-Massa",
    lat: 30.4278,
    lng: -9.5981,
    cover:
      "https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?auto=format&fit=crop&w=800&q=80",
    tagline: "Océan, lumière, large front de mer.",
    neighborhoods: [
      { slug: "secteur-touristique", name: "Secteur Touristique" },
      { slug: "founty", name: "Founty" },
      { slug: "talborjt", name: "Talborjt" },
      { slug: "hay-mohammadi", name: "Hay Mohammadi" },
    ],
  },
  {
    slug: "fes",
    name: "Fès",
    region: "Fès-Meknès",
    lat: 34.0181,
    lng: -5.0078,
    cover:
      "https://images.unsplash.com/photo-1570104622521-ec5c4f4c72ff?auto=format&fit=crop&w=800&q=80",
    tagline: "La ville impériale et artisane.",
    neighborhoods: [
      { slug: "fes-el-bali", name: "Fès el Bali" },
      { slug: "ville-nouvelle", name: "Ville Nouvelle" },
      { slug: "route-immouzer", name: "Route d'Immouzer" },
      { slug: "narjiss", name: "Narjiss" },
    ],
  },
  {
    slug: "meknes",
    name: "Meknès",
    region: "Fès-Meknès",
    lat: 33.8935,
    lng: -5.5547,
    cover:
      "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80",
    tagline: "La discrète, entre Fès et Rabat.",
    neighborhoods: [
      { slug: "hamria", name: "Hamria" },
      { slug: "ville-nouvelle", name: "Ville Nouvelle" },
      { slug: "medina", name: "Médina" },
      { slug: "bel-air", name: "Bel Air" },
    ],
  },
  {
    slug: "tetouan",
    name: "Tétouan",
    region: "Tanger-Tétouan-Al Hoceïma",
    lat: 35.5889,
    lng: -5.3626,
    cover:
      "https://images.unsplash.com/photo-1590156474728-64ef1a86cb0d?auto=format&fit=crop&w=800&q=80",
    tagline: "La colombe blanche, douce et andalouse.",
    neighborhoods: [
      { slug: "mhannech", name: "M'Hannech" },
      { slug: "centre-ville", name: "Centre-ville" },
      { slug: "medina", name: "Médina" },
    ],
  },
  {
    slug: "oujda",
    name: "Oujda",
    region: "Oriental",
    lat: 34.6805,
    lng: -1.9076,
    cover:
      "https://images.unsplash.com/photo-1624813743954-d1a4ea3fffc5?auto=format&fit=crop&w=800&q=80",
    tagline: "À l'est, proche de la Méditerranée.",
    neighborhoods: [
      { slug: "sidi-yahya", name: "Sidi Yahya" },
      { slug: "el-qods", name: "El Qods" },
      { slug: "centre-ville", name: "Centre-ville" },
    ],
  },
  {
    slug: "el-jadida",
    name: "El Jadida",
    region: "Casablanca-Settat",
    lat: 33.2316,
    lng: -8.5007,
    cover:
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=800&q=80",
    tagline: "La cité portugaise, au bord de l'Atlantique.",
    neighborhoods: [
      { slug: "cite-portugaise", name: "Cité Portugaise" },
      { slug: "el-haouzia", name: "El Haouzia" },
      { slug: "centre-ville", name: "Centre-ville" },
    ],
  },
  {
    slug: "kenitra",
    name: "Kénitra",
    region: "Rabat-Salé-Kénitra",
    lat: 34.2610,
    lng: -6.5802,
    cover:
      "https://images.unsplash.com/photo-1568057373810-bd4bf43f6dbb?auto=format&fit=crop&w=800&q=80",
    tagline: "Entre forêt de la Maâmora et océan.",
    neighborhoods: [
      { slug: "centre-ville", name: "Centre-ville" },
      { slug: "bir-rami", name: "Bir Rami" },
      { slug: "mimosas", name: "Mimosas" },
    ],
  },
  {
    slug: "mohammedia",
    name: "Mohammedia",
    region: "Casablanca-Settat",
    lat: 33.6866,
    lng: -7.3833,
    cover:
      "https://images.unsplash.com/photo-1542879437-3a51ad292076?auto=format&fit=crop&w=800&q=80",
    tagline: "La ville des fleurs, entre Rabat et Casa.",
    neighborhoods: [
      { slug: "centre-ville", name: "Centre-ville" },
      { slug: "el-alia", name: "El Alia" },
      { slug: "rue-de-fes", name: "Rue de Fès" },
    ],
  },
];

export function findCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function findNeighborhood(
  citySlug: string,
  nSlug: string,
): Neighborhood | undefined {
  return findCity(citySlug)?.neighborhoods.find((n) => n.slug === nSlug);
}
