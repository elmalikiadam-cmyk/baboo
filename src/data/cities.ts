export interface CityInfo {
  slug: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  neighborhoods: { slug: string; name: string }[];
  cover: string;
  tagline: string;
}

export const CITIES: CityInfo[] = [
  {
    slug: "casablanca",
    name: "Casablanca",
    region: "Casablanca-Settat",
    lat: 33.5731,
    lng: -7.5898,
    cover:
      "https://images.unsplash.com/photo-1577334928618-2ad68bfe0fb1?auto=format&fit=crop&w=1600&q=75",
    tagline: "La capitale économique, vibrante et cosmopolite.",
    neighborhoods: [
      { slug: "anfa", name: "Anfa" },
      { slug: "bourgogne", name: "Bourgogne" },
      { slug: "gauthier", name: "Gauthier" },
      { slug: "racine", name: "Racine" },
      { slug: "maarif", name: "Maârif" },
      { slug: "californie", name: "Californie" },
      { slug: "cil", name: "CIL" },
      { slug: "ain-diab", name: "Aïn Diab" },
      { slug: "oasis", name: "Oasis" },
      { slug: "sidi-maarouf", name: "Sidi Maârouf" },
    ],
  },
  {
    slug: "rabat",
    name: "Rabat",
    region: "Rabat-Salé-Kénitra",
    lat: 34.0209,
    lng: -6.8416,
    cover:
      "https://images.unsplash.com/photo-1553603228-0f9e0c57a1a3?auto=format&fit=crop&w=1600&q=75",
    tagline: "La capitale administrative, élégante et verdoyante.",
    neighborhoods: [
      { slug: "agdal", name: "Agdal" },
      { slug: "hay-riad", name: "Hay Riad" },
      { slug: "souissi", name: "Souissi" },
      { slug: "hassan", name: "Hassan" },
      { slug: "orangers", name: "Les Orangers" },
      { slug: "aviation", name: "Aviation" },
    ],
  },
  {
    slug: "marrakech",
    name: "Marrakech",
    region: "Marrakech-Safi",
    lat: 31.6295,
    lng: -7.9811,
    cover:
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1600&q=75",
    tagline: "La ville ocre, entre tradition et art de vivre.",
    neighborhoods: [
      { slug: "hivernage", name: "Hivernage" },
      { slug: "gueliz", name: "Guéliz" },
      { slug: "palmeraie", name: "Palmeraie" },
      { slug: "targa", name: "Targa" },
      { slug: "agdal", name: "Agdal" },
      { slug: "medina", name: "Médina" },
      { slug: "route-de-l-ourika", name: "Route de l'Ourika" },
    ],
  },
  {
    slug: "tanger",
    name: "Tanger",
    region: "Tanger-Tétouan-Al Hoceïma",
    lat: 35.7595,
    lng: -5.8339,
    cover:
      "https://images.unsplash.com/photo-1541769740-098e0e0cd04e?auto=format&fit=crop&w=1600&q=75",
    tagline: "La porte de l'Afrique, entre deux mers.",
    neighborhoods: [
      { slug: "malabata", name: "Malabata" },
      { slug: "iberia", name: "Iberia" },
      { slug: "california", name: "California" },
      { slug: "achakar", name: "Achakar" },
      { slug: "cap-spartel", name: "Cap Spartel" },
      { slug: "centre-ville", name: "Centre-ville" },
    ],
  },
  {
    slug: "agadir",
    name: "Agadir",
    region: "Souss-Massa",
    lat: 30.4278,
    lng: -9.5981,
    cover:
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=75",
    tagline: "Soleil, océan et qualité de vie.",
    neighborhoods: [
      { slug: "founty", name: "Founty" },
      { slug: "sonaba", name: "Sonaba" },
      { slug: "hay-mohammadi", name: "Hay Mohammadi" },
      { slug: "talborjt", name: "Talborjt" },
      { slug: "cite-dakhla", name: "Cité Dakhla" },
    ],
  },
  {
    slug: "fes",
    name: "Fès",
    region: "Fès-Meknès",
    lat: 34.0181,
    lng: -5.0078,
    cover:
      "https://images.unsplash.com/photo-1559564484-e48b5c8a7e7c?auto=format&fit=crop&w=1600&q=75",
    tagline: "La capitale spirituelle, riche d'histoire.",
    neighborhoods: [
      { slug: "ville-nouvelle", name: "Ville Nouvelle" },
      { slug: "saiss", name: "Saïss" },
      { slug: "route-d-immouzer", name: "Route d'Immouzer" },
      { slug: "medina", name: "Médina" },
    ],
  },
  {
    slug: "meknes",
    name: "Meknès",
    region: "Fès-Meknès",
    lat: 33.8935,
    lng: -5.5473,
    cover:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1600&q=75",
    tagline: "La cité impériale paisible.",
    neighborhoods: [
      { slug: "hamria", name: "Hamria" },
      { slug: "bel-air", name: "Bel Air" },
      { slug: "marjane", name: "Marjane" },
    ],
  },
  {
    slug: "oujda",
    name: "Oujda",
    region: "Oriental",
    lat: 34.6814,
    lng: -1.9086,
    cover:
      "https://images.unsplash.com/photo-1580752300928-6f4003f6cb6a?auto=format&fit=crop&w=1600&q=75",
    tagline: "La capitale de l'Oriental.",
    neighborhoods: [
      { slug: "al-qods", name: "Al Qods" },
      { slug: "el-qods", name: "El Qods" },
      { slug: "hay-andalous", name: "Hay Andalous" },
    ],
  },
  {
    slug: "tetouan",
    name: "Tétouan",
    region: "Tanger-Tétouan-Al Hoceïma",
    lat: 35.5786,
    lng: -5.3684,
    cover:
      "https://images.unsplash.com/photo-1580500550469-6fbf3e2e9a9f?auto=format&fit=crop&w=1600&q=75",
    tagline: "La colombe blanche.",
    neighborhoods: [
      { slug: "mhannech", name: "M'hannech" },
      { slug: "wilaya", name: "Wilaya" },
    ],
  },
  {
    slug: "el-jadida",
    name: "El Jadida",
    region: "Casablanca-Settat",
    lat: 33.2316,
    lng: -8.5007,
    cover:
      "https://images.unsplash.com/photo-1598977054780-2dc700fdc9d3?auto=format&fit=crop&w=1600&q=75",
    tagline: "La douceur de la côte atlantique.",
    neighborhoods: [
      { slug: "centre", name: "Centre" },
      { slug: "el-haouzia", name: "El Haouzia" },
      { slug: "sidi-bouzid", name: "Sidi Bouzid" },
    ],
  },
  {
    slug: "kenitra",
    name: "Kénitra",
    region: "Rabat-Salé-Kénitra",
    lat: 34.261,
    lng: -6.5802,
    cover:
      "https://images.unsplash.com/photo-1542124948-dc391252a940?auto=format&fit=crop&w=1600&q=75",
    tagline: "Dynamique et proche de la capitale.",
    neighborhoods: [
      { slug: "maamora", name: "Maâmora" },
      { slug: "bir-rami", name: "Bir Rami" },
    ],
  },
  {
    slug: "mohammedia",
    name: "Mohammedia",
    region: "Casablanca-Settat",
    lat: 33.6861,
    lng: -7.3829,
    cover:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=75",
    tagline: "L'échappée balnéaire entre Casa et Rabat.",
    neighborhoods: [
      { slug: "alia", name: "Alia" },
      { slug: "parc", name: "Le Parc" },
      { slug: "el-bahia", name: "El Bahia" },
    ],
  },
];

export const FEATURED_CITY_SLUGS = ["casablanca", "rabat", "marrakech", "tanger", "agadir", "fes"];

export function findCity(slug: string) {
  return CITIES.find((c) => c.slug === slug);
}
