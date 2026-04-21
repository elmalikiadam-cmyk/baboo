// Seed Baboo V2 — 30 annonces réalistes au Maroc, photo-first.
// Les images pointent sur Unsplash (architecture / intérieurs épurés, pas de personnes).

import { PrismaClient, Transaction, PropertyType, PublisherType } from "@prisma/client";
import { CITIES } from "../src/data/cities";

const db = new PrismaClient();

// Helper : normalise un slug FR
function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Pool de photos Unsplash (architecture marocaine, intérieurs épurés).
const PHOTOS = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210492493-0946911123c4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687126-8a3414349a0e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1200&q=80",
];

// Noms publieurs marocains — mix pros et particuliers.
const PROS = [
  "Atlas Immobilier",
  "Médina Estates",
  "Casa Properties",
  "Côte Atlantique Immo",
  "Oasis Realty",
  "Sherrata Immobilier",
  "Bab Invest",
];
const PARTICULIERS = [
  "Mohammed A.",
  "Salma E.",
  "Karim B.",
  "Nadia Z.",
  "Youssef R.",
  "Fatima K.",
  "Omar S.",
  "Leïla M.",
];

interface Seed {
  title: string;
  description: string;
  transaction: Transaction;
  propertyType: PropertyType;
  price: number;
  surface: number;
  landSurface?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  citySlug: string;
  neighborhoodSlug?: string;
  amenities: Partial<
    Record<
      | "parking" | "elevator" | "furnished" | "terrace" | "balcony"
      | "garden" | "pool" | "seaView" | "airConditioning",
      boolean
    >
  >;
  featured?: boolean;
  pro?: boolean;
  verified?: boolean;
}

const LISTINGS: Seed[] = [
  // Casablanca
  {
    title: "Appartement lumineux 3 chambres",
    description:
      "Appartement au 4e étage avec ascenseur, lumière traversante, rénové il y a deux ans. Proche des commerces du boulevard Anfa, parking résident.",
    transaction: "SALE",
    propertyType: "APARTMENT",
    price: 2_150_000,
    surface: 145,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2018,
    citySlug: "casablanca",
    neighborhoodSlug: "anfa",
    amenities: { parking: true, elevator: true, balcony: true, airConditioning: true },
    featured: true,
    pro: true,
    verified: true,
  },
  {
    title: "Appartement 2 chambres à Maârif",
    description:
      "Beau 2 chambres meublé en plein cœur de Maârif, balcon donnant sur rue calme. Idéal jeune couple ou cadre en mobilité.",
    transaction: "RENT",
    propertyType: "APARTMENT",
    price: 9_500,
    surface: 85,
    bedrooms: 2,
    bathrooms: 1,
    yearBuilt: 2015,
    citySlug: "casablanca",
    neighborhoodSlug: "maarif",
    amenities: { furnished: true, balcony: true, elevator: true },
    pro: false,
  },
  {
    title: "Villa avec piscine à Californie",
    description:
      "Villa familiale sur 400 m² de terrain, piscine, patio ombragé, quatre chambres en suite, garage double. Calme et sécurisé.",
    transaction: "SALE",
    propertyType: "VILLA",
    price: 8_800_000,
    surface: 320,
    landSurface: 400,
    bedrooms: 4,
    bathrooms: 4,
    yearBuilt: 2012,
    citySlug: "casablanca",
    neighborhoodSlug: "californie",
    amenities: { parking: true, pool: true, garden: true, terrace: true, airConditioning: true },
    pro: true,
    verified: true,
  },
  {
    title: "Studio meublé CIL",
    description:
      "Studio récent, entièrement meublé et équipé. Idéal étudiant ou professionnel de passage. Bail court ou long accepté.",
    transaction: "RENT",
    propertyType: "STUDIO",
    price: 5_200,
    surface: 34,
    bedrooms: 0,
    bathrooms: 1,
    yearBuilt: 2020,
    citySlug: "casablanca",
    neighborhoodSlug: "cil",
    amenities: { furnished: true, elevator: true, airConditioning: true },
    pro: false,
  },
  {
    title: "Duplex Gauthier avec terrasse",
    description:
      "Duplex 4 chambres dernier étage avec terrasse de 40 m². Cuisine ouverte équipée, deux places de parking en sous-sol.",
    transaction: "SALE",
    propertyType: "DUPLEX",
    price: 3_900_000,
    surface: 190,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2019,
    citySlug: "casablanca",
    neighborhoodSlug: "gauthier",
    amenities: { parking: true, elevator: true, terrace: true, airConditioning: true },
    pro: true,
    verified: true,
  },
  // Rabat
  {
    title: "Villa contemporaine à Souissi",
    description:
      "Villa d'architecte récente, cinq chambres, piscine à débordement, jardin paysager. Quartier résidentiel prisé.",
    transaction: "SALE",
    propertyType: "VILLA",
    price: 12_800_000,
    surface: 480,
    landSurface: 800,
    bedrooms: 5,
    bathrooms: 4,
    yearBuilt: 2020,
    citySlug: "rabat",
    neighborhoodSlug: "souissi",
    amenities: { parking: true, pool: true, garden: true, terrace: true, airConditioning: true },
    featured: true,
    pro: true,
    verified: true,
  },
  {
    title: "Appartement Agdal 3 chambres",
    description:
      "Appartement traversant dans résidence sécurisée, salon spacieux, cuisine séparée, trois chambres dont une suite.",
    transaction: "RENT",
    propertyType: "APARTMENT",
    price: 12_000,
    surface: 140,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2016,
    citySlug: "rabat",
    neighborhoodSlug: "agdal",
    amenities: { parking: true, elevator: true, balcony: true, airConditioning: true },
    pro: true,
    verified: true,
  },
  {
    title: "Appartement Hay Riad",
    description:
      "2 chambres dans immeuble récent, proche du tramway. Meublé avec goût, cuisine équipée.",
    transaction: "RENT",
    propertyType: "APARTMENT",
    price: 8_500,
    surface: 92,
    bedrooms: 2,
    bathrooms: 1,
    yearBuilt: 2018,
    citySlug: "rabat",
    neighborhoodSlug: "hay-riad",
    amenities: { furnished: true, parking: true, elevator: true },
    pro: false,
  },
  // Marrakech
  {
    title: "Riad rénové dans la Médina",
    description:
      "Riad authentique rénové au cœur de la Médina, à cinq minutes à pied de la place Jemaa el-Fna. Patio central avec fontaine traditionnelle, zelliges d'origine, terrasse avec vue sur la Koutoubia. Trois chambres spacieuses dont une suite parentale.",
    transaction: "SALE",
    propertyType: "RIAD",
    price: 4_200_000,
    surface: 220,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 1920,
    citySlug: "marrakech",
    neighborhoodSlug: "medina",
    amenities: { terrace: true, garden: true, airConditioning: true },
    featured: true,
    pro: true,
    verified: true,
  },
  {
    title: "Villa palmeraie avec piscine",
    description:
      "Villa de charme dans la palmeraie, grand terrain arboré, piscine chauffée, quatre chambres avec terrasses privatives.",
    transaction: "SALE",
    propertyType: "VILLA",
    price: 6_500_000,
    surface: 380,
    landSurface: 1200,
    bedrooms: 4,
    bathrooms: 4,
    yearBuilt: 2014,
    citySlug: "marrakech",
    neighborhoodSlug: "palmeraie",
    amenities: { parking: true, pool: true, garden: true, terrace: true, airConditioning: true },
    pro: true,
    verified: true,
  },
  {
    title: "Appartement Guéliz avec terrasse",
    description:
      "Bel appartement au 3e étage dans immeuble soigné, terrasse plein sud, deux chambres dont une suite.",
    transaction: "RENT",
    propertyType: "APARTMENT",
    price: 7_800,
    surface: 110,
    bedrooms: 2,
    bathrooms: 2,
    yearBuilt: 2017,
    citySlug: "marrakech",
    neighborhoodSlug: "gueliz",
    amenities: { furnished: true, terrace: true, elevator: true, airConditioning: true },
    pro: true,
    verified: false,
  },
  {
    title: "Riad à rénover dans la Médina",
    description:
      "Opportunité : riad de 180 m² avec patio et deux étages, à rafraîchir. Potentiel pour maison d'hôtes.",
    transaction: "SALE",
    propertyType: "RIAD",
    price: 1_750_000,
    surface: 180,
    bedrooms: 4,
    bathrooms: 2,
    yearBuilt: 1905,
    citySlug: "marrakech",
    neighborhoodSlug: "medina",
    amenities: { terrace: true },
    pro: false,
  },
  // Tanger
  {
    title: "Appartement vue mer à Malabata",
    description:
      "Appartement avec vue imprenable sur le détroit. Deux chambres, cuisine équipée, balcon.",
    transaction: "SALE",
    propertyType: "APARTMENT",
    price: 1_600_000,
    surface: 95,
    bedrooms: 2,
    bathrooms: 2,
    yearBuilt: 2019,
    citySlug: "tanger",
    neighborhoodSlug: "malabata",
    amenities: { parking: true, elevator: true, balcony: true, seaView: true, airConditioning: true },
    featured: true,
    pro: true,
    verified: true,
  },
  {
    title: "Villa Boubana vue panoramique",
    description:
      "Villa de standing avec vue sur la baie, piscine, garage trois voitures, dépendance indépendante.",
    transaction: "SALE",
    propertyType: "VILLA",
    price: 9_500_000,
    surface: 420,
    landSurface: 1000,
    bedrooms: 5,
    bathrooms: 5,
    yearBuilt: 2015,
    citySlug: "tanger",
    neighborhoodSlug: "boubana",
    amenities: { parking: true, pool: true, garden: true, terrace: true, seaView: true, airConditioning: true },
    pro: true,
    verified: true,
  },
  {
    title: "Appartement centre-ville meublé",
    description:
      "Bel appartement meublé proche Place de France, deux chambres, lumineux, immeuble entretenu.",
    transaction: "RENT",
    propertyType: "APARTMENT",
    price: 7_200,
    surface: 88,
    bedrooms: 2,
    bathrooms: 1,
    yearBuilt: 2010,
    citySlug: "tanger",
    neighborhoodSlug: "centre-ville",
    amenities: { furnished: true, elevator: true, balcony: true },
    pro: false,
  },
  // Agadir
  {
    title: "Appartement front de mer Founty",
    description:
      "Studio vue océan, balcon plein ouest, accès direct à la plage. Idéal investissement locatif saisonnier.",
    transaction: "SALE",
    propertyType: "STUDIO",
    price: 950_000,
    surface: 42,
    bedrooms: 1,
    bathrooms: 1,
    yearBuilt: 2021,
    citySlug: "agadir",
    neighborhoodSlug: "founty",
    amenities: { furnished: true, elevator: true, balcony: true, seaView: true, pool: true, airConditioning: true },
    pro: true,
    verified: true,
  },
  {
    title: "Villa Secteur Touristique",
    description:
      "Villa moderne à cinq minutes de la plage, trois chambres, jardin avec piscine privée.",
    transaction: "SALE",
    propertyType: "VILLA",
    price: 4_800_000,
    surface: 260,
    landSurface: 550,
    bedrooms: 3,
    bathrooms: 3,
    yearBuilt: 2019,
    citySlug: "agadir",
    neighborhoodSlug: "secteur-touristique",
    amenities: { parking: true, pool: true, garden: true, terrace: true, airConditioning: true },
    pro: true,
    verified: true,
  },
  {
    title: "Appartement Talborjt 2 chambres",
    description:
      "Appartement familial dans résidence calme, balcon, parking. Deux chambres, salon double.",
    transaction: "RENT",
    propertyType: "APARTMENT",
    price: 4_800,
    surface: 78,
    bedrooms: 2,
    bathrooms: 1,
    yearBuilt: 2013,
    citySlug: "agadir",
    neighborhoodSlug: "talborjt",
    amenities: { parking: true, balcony: true },
    pro: false,
  },
  // Fès
  {
    title: "Maison traditionnelle Fès el Bali",
    description:
      "Maison marocaine au cœur de la médina classée. Trois patios, quatre chambres, terrasse avec vue sur les minarets.",
    transaction: "SALE",
    propertyType: "HOUSE",
    price: 2_100_000,
    surface: 240,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 1890,
    citySlug: "fes",
    neighborhoodSlug: "fes-el-bali",
    amenities: { terrace: true, garden: true },
    pro: true,
    verified: true,
  },
  {
    title: "Appartement Ville Nouvelle",
    description:
      "3 chambres dans immeuble récent, cuisine équipée, lumineux, proche universités.",
    transaction: "RENT",
    propertyType: "APARTMENT",
    price: 6_000,
    surface: 115,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2016,
    citySlug: "fes",
    neighborhoodSlug: "ville-nouvelle",
    amenities: { parking: true, elevator: true, balcony: true },
    pro: false,
  },
  // Meknès
  {
    title: "Appartement Hamria",
    description:
      "Appartement 3 chambres dans résidence soignée. Terrasse, parking, ascenseur.",
    transaction: "SALE",
    propertyType: "APARTMENT",
    price: 1_350_000,
    surface: 120,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2018,
    citySlug: "meknes",
    neighborhoodSlug: "hamria",
    amenities: { parking: true, elevator: true, terrace: true },
    pro: true,
    verified: false,
  },
  {
    title: "Maison Médina",
    description:
      "Maison traditionnelle rénovée, trois étages, patio central, idéal résidence secondaire ou maison d'hôtes.",
    transaction: "SALE",
    propertyType: "HOUSE",
    price: 1_100_000,
    surface: 160,
    bedrooms: 4,
    bathrooms: 2,
    yearBuilt: 1930,
    citySlug: "meknes",
    neighborhoodSlug: "medina",
    amenities: { terrace: true },
    pro: false,
  },
  // Tétouan
  {
    title: "Appartement M'Hannech vue montagne",
    description:
      "Appartement 2 chambres avec grand balcon, vue sur les monts du Rif. Proche université.",
    transaction: "RENT",
    propertyType: "APARTMENT",
    price: 4_200,
    surface: 82,
    bedrooms: 2,
    bathrooms: 1,
    yearBuilt: 2014,
    citySlug: "tetouan",
    neighborhoodSlug: "mhannech",
    amenities: { elevator: true, balcony: true },
    pro: false,
  },
  // Oujda
  {
    title: "Villa familiale Sidi Yahya",
    description:
      "Villa quatre chambres sur terrain de 300 m². Salon traditionnel + salon moderne, garage.",
    transaction: "SALE",
    propertyType: "VILLA",
    price: 2_800_000,
    surface: 220,
    landSurface: 300,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2010,
    citySlug: "oujda",
    neighborhoodSlug: "sidi-yahya",
    amenities: { parking: true, garden: true, terrace: true },
    pro: true,
    verified: true,
  },
  // El Jadida
  {
    title: "Villa pied dans l'eau El Haouzia",
    description:
      "Villa trois chambres avec accès direct à la plage. Terrasse, jardin, piscine à deux pas.",
    transaction: "SALE",
    propertyType: "VILLA",
    price: 3_400_000,
    surface: 210,
    landSurface: 400,
    bedrooms: 3,
    bathrooms: 3,
    yearBuilt: 2017,
    citySlug: "el-jadida",
    neighborhoodSlug: "el-haouzia",
    amenities: { parking: true, garden: true, terrace: true, seaView: true, airConditioning: true },
    pro: true,
    verified: true,
  },
  // Kénitra
  {
    title: "Appartement Mimosas 2 chambres",
    description:
      "Bel appartement 2 chambres, balcon, proche commerces, parking. Idéal premier achat.",
    transaction: "SALE",
    propertyType: "APARTMENT",
    price: 780_000,
    surface: 85,
    bedrooms: 2,
    bathrooms: 1,
    yearBuilt: 2019,
    citySlug: "kenitra",
    neighborhoodSlug: "mimosas",
    amenities: { parking: true, elevator: true, balcony: true },
    pro: true,
    verified: false,
  },
  // Mohammedia
  {
    title: "Duplex centre-ville Mohammedia",
    description:
      "Duplex quatre chambres dernier étage, deux terrasses, vue ville. Proche gare TGV.",
    transaction: "SALE",
    propertyType: "DUPLEX",
    price: 2_600_000,
    surface: 180,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2016,
    citySlug: "mohammedia",
    neighborhoodSlug: "centre-ville",
    amenities: { parking: true, elevator: true, terrace: true, balcony: true, airConditioning: true },
    pro: true,
    verified: true,
  },
  // Casablanca supplémentaires
  {
    title: "Bureau plateau Maârif",
    description:
      "Plateau de 120 m² à aménager, 6e étage, vue dégagée. Deux places de parking en sous-sol.",
    transaction: "RENT",
    propertyType: "OFFICE",
    price: 18_000,
    surface: 120,
    bedrooms: 0,
    bathrooms: 2,
    yearBuilt: 2015,
    citySlug: "casablanca",
    neighborhoodSlug: "maarif",
    amenities: { parking: true, elevator: true, airConditioning: true },
    pro: true,
    verified: true,
  },
  {
    title: "Terrain viabilisé Aïn Diab",
    description:
      "Terrain de 600 m² en zone R+3, proche corniche. Viabilisation complète, titre individuel.",
    transaction: "SALE",
    propertyType: "LAND",
    price: 5_400_000,
    surface: 600,
    bedrooms: 0,
    bathrooms: 0,
    citySlug: "casablanca",
    neighborhoodSlug: "ain-diab",
    amenities: {},
    pro: true,
    verified: true,
  },
  {
    title: "Local commercial Racine",
    description:
      "Local en rez-de-chaussée, vitrine sur boulevard, double accès, 80 m².",
    transaction: "RENT",
    propertyType: "COMMERCIAL",
    price: 16_500,
    surface: 80,
    bedrooms: 0,
    bathrooms: 1,
    yearBuilt: 2010,
    citySlug: "casablanca",
    neighborhoodSlug: "racine",
    amenities: {},
    pro: true,
    verified: true,
  },
];

async function main() {
  console.log("🌱 Seed Baboo V2 — en cours…");

  // Villes + quartiers : on reconstruit la table depuis cities.ts
  for (const city of CITIES) {
    await db.city.upsert({
      where: { slug: city.slug },
      create: {
        slug: city.slug,
        name: city.name,
        region: city.region,
        lat: city.lat,
        lng: city.lng,
        cover: city.cover,
        tagline: city.tagline,
      },
      update: {
        name: city.name,
        region: city.region,
        lat: city.lat,
        lng: city.lng,
        cover: city.cover,
        tagline: city.tagline,
      },
    });
    for (const n of city.neighborhoods) {
      await db.neighborhood.upsert({
        where: { citySlug_slug: { citySlug: city.slug, slug: n.slug } },
        create: { slug: n.slug, name: n.name, citySlug: city.slug },
        update: { name: n.name },
      });
    }
  }
  console.log(`✓ ${CITIES.length} villes + quartiers synchronisés`);

  // Purge listings existants (seed est destructif côté annonces).
  await db.listingMedia.deleteMany();
  await db.listing.deleteMany();

  let i = 0;
  for (const L of LISTINGS) {
    const city = CITIES.find((c) => c.slug === L.citySlug);
    if (!city) {
      console.warn(`⚠ ville inconnue : ${L.citySlug}`);
      continue;
    }
    const neighborhood = L.neighborhoodSlug
      ? await db.neighborhood.findUnique({
          where: { citySlug_slug: { citySlug: L.citySlug, slug: L.neighborhoodSlug } },
        })
      : null;

    const baseSlug = slugify(`${L.title} ${city.slug}`).slice(0, 60);
    let slug = baseSlug;
    let tries = 2;
    // Gère les collisions de slug (sécurité).
    while (await db.listing.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${tries++}`;
      if (tries > 50) break;
    }

    const pro = L.pro ?? false;
    const publisherName = pro
      ? PROS[i % PROS.length]
      : PARTICULIERS[i % PARTICULIERS.length];

    const cover = PHOTOS[i % PHOTOS.length];
    const extras = [
      PHOTOS[(i + 1) % PHOTOS.length],
      PHOTOS[(i + 2) % PHOTOS.length],
      PHOTOS[(i + 3) % PHOTOS.length],
    ];

    const createdDaysAgo = Math.floor(Math.random() * 30);
    const publishedAt = new Date(Date.now() - createdDaysAgo * 86_400_000);

    await db.listing.create({
      data: {
        slug,
        title: L.title,
        description: L.description,
        transaction: L.transaction,
        propertyType: L.propertyType,
        status: "PUBLISHED",
        price: L.price,
        surface: L.surface,
        landSurface: L.landSurface ?? null,
        bedrooms: L.bedrooms ?? null,
        bathrooms: L.bathrooms ?? null,
        yearBuilt: L.yearBuilt ?? null,
        parking: !!L.amenities.parking,
        elevator: !!L.amenities.elevator,
        furnished: !!L.amenities.furnished,
        terrace: !!L.amenities.terrace,
        balcony: !!L.amenities.balcony,
        garden: !!L.amenities.garden,
        pool: !!L.amenities.pool,
        seaView: !!L.amenities.seaView,
        airConditioning: !!L.amenities.airConditioning,
        citySlug: L.citySlug,
        neighborhoodId: neighborhood?.id ?? null,
        lat: city.lat + (Math.random() - 0.5) * 0.02,
        lng: city.lng + (Math.random() - 0.5) * 0.02,
        publisherType: pro ? PublisherType.PRO : PublisherType.PARTICULIER,
        publisherName,
        publisherVerified: !!L.verified,
        publisherPhone: pro ? "+212 5 22 00 00 00" : "+212 6 12 34 56 78",
        coverImage: cover,
        featured: !!L.featured,
        publishedAt,
        images: {
          create: extras.map((url, idx) => ({ url, position: idx, alt: L.title })),
        },
      },
    });
    i += 1;
  }
  console.log(`✓ ${LISTINGS.length} annonces créées`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
