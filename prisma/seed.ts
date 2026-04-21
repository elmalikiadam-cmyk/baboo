import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CITIES } from "../src/data/cities";

const prisma = new PrismaClient();

// Mots de passe de démo pour tester l'authentification.
// À changer avant tout vrai lancement.
const DEMO_PASSWORD = "baboo-demo-2026";
const demoHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

// Diverse bank of real-estate photos from Unsplash (interiors, exteriors,
// terraces, kitchens, bedrooms). Each category has 6-10 options so the seed
// doesn't feel repetitive.
const PHOTO_BANK = {
  apartment: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1600&q=75",
  ],
  villa: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=75",
  ],
  riad: [
    "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1519974719765-e6559eac2575?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=75",
  ],
  office: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1600&q=75",
  ],
  commercial: [
    "https://images.unsplash.com/photo-1555529771-7888783a18d3?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=75",
  ],
  land: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=75",
  ],
  house: [
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1549517045-bc93de075e53?auto=format&fit=crop&w=1600&q=75",
  ],
};

const AGENCIES = [
  { slug: "atlas-realty", name: "Atlas Realty", city: "casablanca", tagline: "Agence de référence à Casablanca.", description: "Atlas Realty accompagne acquéreurs et bailleurs sur Casablanca depuis 15 ans. Appartements, villas et projets neufs.", verified: true, logoSeed: 1 },
  { slug: "medina-properties", name: "Medina Properties", city: "marrakech", tagline: "Riads, villas et investissements à Marrakech.", description: "Spécialiste des biens d'exception à Marrakech : riads authentiques, villas en Palmeraie, résidences de golf.", verified: true, logoSeed: 2 },
  { slug: "capital-homes", name: "Capital Homes", city: "rabat", tagline: "Votre partenaire immobilier dans la capitale.", description: "Agence indépendante, implantée à Agdal et Hay Riad. Nous privilégions les mandats exclusifs et le service sur mesure.", verified: true, logoSeed: 3 },
  { slug: "detroit-immobilier", name: "Détroit Immobilier", city: "tanger", tagline: "Le nord du Maroc en exclusivité.", description: "Tanger, Tétouan, Mdiq, Martil. Nous couvrons le détroit avec une équipe franco-marocaine.", verified: false, logoSeed: 4 },
  { slug: "souss-home", name: "Souss Home", city: "agadir", tagline: "Vivre au soleil, investir sereinement.", description: "Biens résidentiels et locations saisonnières sur le Grand Agadir.", verified: true, logoSeed: 5 },
  { slug: "oasis-immobilier", name: "Oasis Immobilier", city: "casablanca", tagline: "Spécialiste des appartements familiaux.", description: "Oasis Immobilier se concentre sur les appartements 3-5 pièces dans le sud de Casablanca : Oasis, Maârif, CIL.", verified: true, logoSeed: 6 },
];

const DEVELOPERS = [
  { slug: "anfa-residences", name: "Anfa Résidences", tagline: "Promoteur haut de gamme à Casablanca.", description: "Anfa Résidences développe depuis 2008 des résidences contemporaines dans les quartiers premium de Casablanca." },
  { slug: "prestigia-developpement", name: "Prestigia Développement", tagline: "Stations balnéaires et résidences golf.", description: "Projets résidentiels de grande envergure sur le littoral atlantique et les parcours de golf du royaume." },
  { slug: "marina-atlantic", name: "Marina Atlantic", tagline: "Résidences vue mer sur la côte atlantique.", description: "Marina Atlantic livre des résidences pieds dans l'eau à Mohammedia, Bouznika et Dar Bouazza." },
];

const PROJECTS = [
  {
    slug: "anfa-skyline",
    name: "Anfa Skyline",
    developerSlug: "anfa-residences",
    city: "casablanca",
    addressLine: "Boulevard d'Anfa, Casablanca",
    description: "Tour résidentielle contemporaine de 18 étages au cœur du nouveau quartier d'affaires. Appartements de 2 à 5 pièces, duplex terrasse, espaces communs premium.",
    cover: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=75",
    lat: 33.5867, lng: -7.6315,
    deliveryYear: 2027,
    status: "SELLING" as const,
    units: [
      { label: "2P Type A", type: "APARTMENT" as const, bedrooms: 1, surface: 72, price: 1_950_000 },
      { label: "3P Type B", type: "APARTMENT" as const, bedrooms: 2, surface: 98, price: 2_650_000 },
      { label: "4P Type C", type: "APARTMENT" as const, bedrooms: 3, surface: 130, price: 3_750_000 },
      { label: "Duplex 5P", type: "APARTMENT" as const, bedrooms: 4, surface: 210, price: 6_800_000 },
    ],
  },
  {
    slug: "marina-lagoon",
    name: "Marina Lagoon",
    developerSlug: "marina-atlantic",
    city: "mohammedia",
    addressLine: "Corniche de Mohammedia",
    description: "Résidence balnéaire de standing, pieds dans l'eau. Piscine lagon, plage privée, spa, restaurant. Livraison T4 2026.",
    cover: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=75",
    lat: 33.6895, lng: -7.3725,
    deliveryYear: 2026,
    status: "SELLING" as const,
    units: [
      { label: "Studio vue mer", type: "APARTMENT" as const, bedrooms: 1, surface: 48, price: 1_350_000 },
      { label: "2P terrasse", type: "APARTMENT" as const, bedrooms: 1, surface: 75, price: 2_100_000 },
      { label: "3P vue mer", type: "APARTMENT" as const, bedrooms: 2, surface: 105, price: 3_250_000 },
    ],
  },
  {
    slug: "palmeraie-golf-club",
    name: "Palmeraie Golf Club Residences",
    developerSlug: "prestigia-developpement",
    city: "marrakech",
    addressLine: "Palmeraie, Marrakech",
    description: "Villas individuelles sur le parcours du golf. Architecture contemporaine marocaine, 3 à 6 chambres, jardins privatifs, piscine optionnelle.",
    cover: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=75",
    lat: 31.6745, lng: -7.9612,
    deliveryYear: 2025,
    status: "NEARLY_SOLD" as const,
    units: [
      { label: "Villa 3 CH", type: "VILLA" as const, bedrooms: 3, surface: 240, price: 5_800_000 },
      { label: "Villa 4 CH piscine", type: "VILLA" as const, bedrooms: 4, surface: 320, price: 8_400_000 },
      { label: "Villa 6 CH signature", type: "VILLA" as const, bedrooms: 6, surface: 480, price: 14_500_000 },
    ],
  },
  {
    slug: "hay-riad-garden",
    name: "Hay Riad Garden",
    developerSlug: "anfa-residences",
    city: "rabat",
    addressLine: "Hay Riad, Rabat",
    description: "Petite copropriété de 24 appartements familiaux, jardin commun, parking souterrain. Une adresse calme à deux pas du centre administratif.",
    cover: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=75",
    lat: 34.0138, lng: -6.8498,
    deliveryYear: 2026,
    status: "SELLING" as const,
    units: [
      { label: "3P Type A", type: "APARTMENT" as const, bedrooms: 2, surface: 92, price: 2_250_000 },
      { label: "4P Type B", type: "APARTMENT" as const, bedrooms: 3, surface: 118, price: 2_900_000 },
    ],
  },
  {
    slug: "tanger-bay-view",
    name: "Tanger Bay View",
    developerSlug: "marina-atlantic",
    city: "tanger",
    addressLine: "Malabata, Tanger",
    description: "Résidence en front de mer. Appartements traversants avec vues panoramiques sur la baie de Tanger et le détroit.",
    cover: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=75",
    lat: 35.7795, lng: -5.7968,
    deliveryYear: 2027,
    status: "PRE_LAUNCH" as const,
    units: [
      { label: "2P vue baie", type: "APARTMENT" as const, bedrooms: 1, surface: 68, price: 1_450_000 },
      { label: "3P terrasse", type: "APARTMENT" as const, bedrooms: 2, surface: 95, price: 2_150_000 },
      { label: "Penthouse 4P", type: "APARTMENT" as const, bedrooms: 3, surface: 165, price: 4_800_000 },
    ],
  },
];

// Tiny abstract PNG-free agency logos : solid color SVG with initials, served as data URLs.
// Generates a circular avatar with the agency name initial.
function agencyLogoUrl(seed: number): string {
  const palettes = [
    ["#0a0a0a", "#f2efe8"],
    ["#1a3a2b", "#f2efe8"],
    ["#2d2d5a", "#f2efe8"],
    ["#5a2d2d", "#f2efe8"],
    ["#2d5a5a", "#f2efe8"],
    ["#5a4b2d", "#f2efe8"],
  ];
  const [bg, fg] = palettes[seed % palettes.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="${bg}"/><text x="50%" y="54%" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="32" font-stretch="75%" fill="${fg}">BB</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const CONDITIONS = ["NEW", "GOOD", "TO_RENOVATE"] as const;

type GenParams = {
  citySlug: string;
  neighborhoodSlug: string;
  neighborhoodName: string;
  cityName: string;
  type: "APARTMENT" | "VILLA" | "RIAD" | "HOUSE" | "OFFICE" | "COMMERCIAL" | "LAND";
  transaction: "SALE" | "RENT";
  index: number;
};

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function photos(type: GenParams["type"]): string[] {
  switch (type) {
    case "VILLA": return PHOTO_BANK.villa;
    case "RIAD": return PHOTO_BANK.riad;
    case "OFFICE": return PHOTO_BANK.office;
    case "COMMERCIAL": return PHOTO_BANK.commercial;
    case "LAND": return PHOTO_BANK.land;
    case "HOUSE": return PHOTO_BANK.house;
    default: return PHOTO_BANK.apartment;
  }
}

function listingTitle(p: GenParams): string {
  const noun = {
    APARTMENT: "Appartement",
    VILLA: "Villa",
    RIAD: "Riad",
    HOUSE: "Maison",
    OFFICE: "Bureau",
    COMMERCIAL: "Local commercial",
    LAND: "Terrain",
  }[p.type];
  const descriptorsByType: Record<GenParams["type"], string[]> = {
    APARTMENT: ["lumineux", "rénové", "moderne", "avec terrasse", "traversant", "neuf", "meublé", "au calme"],
    VILLA: ["avec piscine", "avec jardin", "contemporaine", "d'architecte", "de plain-pied", "vue mer"],
    RIAD: ["au cœur de la médina", "avec patio", "rénové", "de charme", "avec piscine"],
    HOUSE: ["de famille", "avec jardin", "rénovée", "traditionnelle", "de plain-pied"],
    OFFICE: ["open space", "équipé", "sur plateau", "en rez-de-chaussée", "avec parking"],
    COMMERCIAL: ["bien placé", "avec vitrine", "en centre-ville", "avec réserve"],
    LAND: ["constructible", "viabilisé", "avec vue", "en zone résidentielle"],
  };
  const descriptors = descriptorsByType[p.type];
  return `${noun} ${pick(descriptors, p.index)}, ${p.neighborhoodName}`;
}

function listingPrice(p: GenParams): number {
  const base: Record<GenParams["type"], number> = {
    APARTMENT: p.transaction === "SALE" ? 1_800_000 : 9_000,
    VILLA: p.transaction === "SALE" ? 6_500_000 : 28_000,
    RIAD: p.transaction === "SALE" ? 4_200_000 : 22_000,
    HOUSE: p.transaction === "SALE" ? 2_400_000 : 12_000,
    OFFICE: p.transaction === "SALE" ? 3_200_000 : 18_000,
    COMMERCIAL: p.transaction === "SALE" ? 2_800_000 : 15_000,
    LAND: p.transaction === "SALE" ? 2_000_000 : 0,
  };
  const cityFactor: Record<string, number> = {
    casablanca: 1.3, rabat: 1.25, marrakech: 1.15, tanger: 1.0, agadir: 0.9, fes: 0.85, meknes: 0.8,
    tetouan: 0.85, "el-jadida": 0.85, kenitra: 0.8, mohammedia: 1.0, oujda: 0.75,
  };
  const factor = cityFactor[p.citySlug] ?? 1;
  const variance = 0.75 + (((p.index * 131) % 100) / 100) * 0.6;
  return Math.round((base[p.type] * factor * variance) / 1000) * 1000;
}

function listingSurface(p: GenParams): number {
  const base: Record<GenParams["type"], number> = {
    APARTMENT: 110, VILLA: 320, RIAD: 280, HOUSE: 180, OFFICE: 140, COMMERCIAL: 90, LAND: 500,
  };
  const variance = 0.7 + (((p.index * 53) % 100) / 100) * 0.7;
  return Math.round((base[p.type] * variance) / 5) * 5;
}

function listingDescription(p: GenParams): string {
  const type = {
    APARTMENT: "Cet appartement",
    VILLA: "Cette villa",
    RIAD: "Ce riad",
    HOUSE: "Cette maison",
    OFFICE: "Ce bureau",
    COMMERCIAL: "Ce local commercial",
    LAND: "Ce terrain",
  }[p.type];
  const paras = [
    `${type} se trouve au cœur du quartier ${p.neighborhoodName}, à ${p.cityName}, dans un environnement recherché pour sa tranquillité et ses commodités.`,
    `Le bien offre une distribution intelligente, une belle exposition, et des finitions soignées. Les espaces de vie sont généreux et baignés de lumière naturelle.`,
    `Proche des écoles, commerces, transports et axes principaux, il constitue une opportunité ${p.transaction === "SALE" ? "d'investissement ou de résidence principale" : "de location de qualité"} à saisir rapidement.`,
    `Visites sur rendez-vous. Dossier complet disponible auprès de notre conseiller.`,
  ];
  return paras.join("\n\n");
}

async function main() {
  console.log("🌱 Seeding Baboo database...");

  // Cities + neighborhoods
  for (const city of CITIES) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: {
        name: city.name,
        region: city.region,
        lat: city.lat,
        lng: city.lng,
        cover: city.cover,
        tagline: city.tagline,
      },
      create: {
        slug: city.slug,
        name: city.name,
        region: city.region,
        lat: city.lat,
        lng: city.lng,
        cover: city.cover,
        tagline: city.tagline,
      },
    });

    for (const n of city.neighborhoods) {
      await prisma.neighborhood.upsert({
        where: { citySlug_slug: { citySlug: city.slug, slug: n.slug } },
        update: { name: n.name },
        create: { citySlug: city.slug, slug: n.slug, name: n.name },
      });
    }
  }
  console.log(`  ✓ ${CITIES.length} cities seeded`);

  // Demo owner + agencies (mot de passe commun : voir DEMO_PASSWORD ci-dessus)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@baboo.ma" },
    update: { passwordHash: demoHash },
    create: {
      email: "admin@baboo.ma",
      name: "Baboo Admin",
      role: "ADMIN",
      passwordHash: demoHash,
    },
  });

  // Particulier de démo pour tester le flow non-pro.
  await prisma.user.upsert({
    where: { email: "demo@baboo.ma" },
    update: { passwordHash: demoHash },
    create: {
      email: "demo@baboo.ma",
      name: "Sofia Bennani",
      role: "USER",
      passwordHash: demoHash,
    },
  });

  const agencyRecords: Array<{ id: string; slug: string; citySlug: string }> = [];
  for (const a of AGENCIES) {
    const user = await prisma.user.upsert({
      where: { email: `${a.slug}@baboo.ma` },
      update: { role: "AGENCY", name: a.name, passwordHash: demoHash },
      create: {
        email: `${a.slug}@baboo.ma`,
        name: a.name,
        role: "AGENCY",
        passwordHash: demoHash,
      },
    });
    const agency = await prisma.agency.upsert({
      where: { slug: a.slug },
      update: {
        name: a.name,
        tagline: a.tagline,
        description: a.description,
        verified: a.verified,
        citySlug: a.city,
        logo: agencyLogoUrl(a.logoSeed),
      },
      create: {
        userId: user.id,
        slug: a.slug,
        name: a.name,
        tagline: a.tagline,
        description: a.description,
        verified: a.verified,
        citySlug: a.city,
        logo: agencyLogoUrl(a.logoSeed),
        phone: "+212 5 22 00 00 00",
        email: `contact@${a.slug}.ma`,
        website: `https://${a.slug}.ma`,
      },
    });
    agencyRecords.push({ id: agency.id, slug: agency.slug, citySlug: a.city });
  }
  console.log(`  ✓ ${AGENCIES.length} agencies seeded`);

  // Developers + projects
  const developerRecords: Array<{ id: string; slug: string }> = [];
  for (const d of DEVELOPERS) {
    const user = await prisma.user.upsert({
      where: { email: `${d.slug}@baboo.ma` },
      update: { role: "DEVELOPER", name: d.name },
      create: { email: `${d.slug}@baboo.ma`, name: d.name, role: "DEVELOPER" },
    });
    const dev = await prisma.developer.upsert({
      where: { slug: d.slug },
      update: { name: d.name, description: d.description, verified: true },
      create: {
        userId: user.id,
        slug: d.slug,
        name: d.name,
        description: d.description,
        verified: true,
        website: `https://${d.slug}.ma`,
      },
    });
    developerRecords.push({ id: dev.id, slug: dev.slug });
  }
  console.log(`  ✓ ${DEVELOPERS.length} developers seeded`);

  await prisma.projectUnit.deleteMany();
  await prisma.project.deleteMany();
  for (const p of PROJECTS) {
    const dev = developerRecords.find((d) => d.slug === p.developerSlug)!;
    const project = await prisma.project.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        cover: p.cover,
        developerId: dev.id,
        citySlug: p.city,
        addressLine: p.addressLine,
        lat: p.lat,
        lng: p.lng,
        deliveryYear: p.deliveryYear,
        status: p.status,
      },
    });
    await prisma.projectUnit.createMany({
      data: p.units.map((u) => ({
        projectId: project.id,
        label: u.label,
        propertyType: u.type,
        bedrooms: u.bedrooms,
        surface: u.surface,
        price: u.price,
      })),
    });
  }
  console.log(`  ✓ ${PROJECTS.length} projects seeded`);

  // Generate ~60 listings across cities
  const plan: GenParams[] = [];
  let i = 0;
  const typeMix: GenParams["type"][] = ["APARTMENT", "APARTMENT", "APARTMENT", "VILLA", "VILLA", "RIAD", "HOUSE", "OFFICE", "COMMERCIAL"];
  for (const city of CITIES) {
    const perCity = ["casablanca", "rabat", "marrakech"].includes(city.slug) ? 8 : 4;
    for (let k = 0; k < perCity; k++) {
      const type = pick(typeMix, i + k);
      const transaction = (i + k) % 3 === 0 ? "RENT" : "SALE";
      const n = pick(city.neighborhoods, i + k);
      plan.push({
        citySlug: city.slug,
        cityName: city.name,
        neighborhoodSlug: n.slug,
        neighborhoodName: n.name,
        type,
        transaction,
        index: i + k,
      });
    }
    i += perCity;
  }

  // Idempotence : on remet à zéro les annonces (et leur média) avant de les
  // recréer. Les Lead attachés sont préservés (listingId devient null grâce
  // à onDelete: SetNull). Les favoris clients vivent en localStorage côté
  // navigateur, aucun impact côté base.
  await prisma.listingMedia.deleteMany();
  await prisma.listing.deleteMany();

  let created = 0;
  for (const p of plan) {
    // Every 3rd listing is posted directly by an individual (no agency).
    const isIndividual = (p.index + created) % 3 === 0;
    const agencyForCity = isIndividual
      ? null
      : (agencyRecords.find((a) => a.citySlug === p.citySlug) ?? agencyRecords[created % agencyRecords.length]);
    const price = listingPrice(p);
    const surface = listingSurface(p);
    const bedrooms = ["APARTMENT", "VILLA", "RIAD", "HOUSE"].includes(p.type) ? 2 + ((p.index * 7) % 4) : null;
    const bathrooms = bedrooms ? Math.max(1, bedrooms - 1) : null;
    const photoList = photos(p.type);
    const cover = photoList[p.index % photoList.length];
    const slug = `${p.type.toLowerCase()}-${p.transaction.toLowerCase()}-${p.neighborhoodSlug}-${p.citySlug}-${created + 1}`;
    const title = listingTitle(p);
    const city = CITIES.find((c) => c.slug === p.citySlug)!;
    const neighborhood = await prisma.neighborhood.findFirst({
      where: { citySlug: p.citySlug, slug: p.neighborhoodSlug },
    });

    const jitter = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280 - 0.5;

    const listing = await prisma.listing.create({
      data: {
        slug,
        title,
        description: listingDescription(p),
        transaction: p.transaction,
        propertyType: p.type,
        status: "PUBLISHED",
        price,
        charges: p.transaction === "RENT" && p.type !== "LAND" ? Math.round(price * 0.08 / 100) * 100 : null,
        surface,
        landSurface: ["VILLA", "RIAD", "HOUSE", "LAND"].includes(p.type) ? surface + 150 + ((p.index * 11) % 500) : null,
        bedrooms,
        bathrooms,
        floor: p.type === "APARTMENT" ? ((p.index * 3) % 8) + 1 : null,
        totalFloors: p.type === "APARTMENT" ? 10 : null,
        condition: pick(CONDITIONS, p.index),
        yearBuilt: 2005 + ((p.index * 5) % 19),
        parking: p.index % 2 === 0,
        elevator: p.type === "APARTMENT" && p.index % 3 !== 0,
        furnished: p.transaction === "RENT" && p.index % 2 === 0,
        terrace: p.index % 3 === 0,
        balcony: p.type === "APARTMENT" && p.index % 2 === 1,
        garden: ["VILLA", "RIAD", "HOUSE"].includes(p.type),
        pool: p.type === "VILLA" && p.index % 2 === 0,
        security: p.index % 2 === 0,
        seaView: ["casablanca", "tanger", "agadir", "mohammedia", "el-jadida", "tetouan"].includes(p.citySlug) && p.index % 4 === 0,
        airConditioning: p.index % 2 === 0,
        concierge: p.type === "APARTMENT" && p.index % 5 === 0,
        citySlug: p.citySlug,
        neighborhoodId: neighborhood?.id ?? null,
        addressHidden: true,
        lat: city.lat + jitter(p.index + 1) * 0.05,
        lng: city.lng + jitter(p.index + 2) * 0.05,
        coverImage: cover,
        ownerId: adminUser.id,
        agencyId: agencyForCity?.id ?? null,
        featured: created < 8,
        exclusive: p.index % 7 === 0,
        publishedAt: new Date(Date.now() - (p.index * 86_400_000) / 3),
      },
    });

    await prisma.listingMedia.createMany({
      data: photoList.map((url, k) => ({ listingId: listing.id, url, position: k, alt: `${title} — photo ${k + 1}` })),
    });

    created++;
  }

  // Update denormalized city counts
  const cityCounts = await prisma.listing.groupBy({
    by: ["citySlug"],
    where: { status: "PUBLISHED" },
    _count: true,
  });
  for (const c of cityCounts) {
    await prisma.city.update({
      where: { slug: c.citySlug },
      data: { listingCount: c._count },
    });
  }

  console.log(`  ✓ ${created} listings seeded`);
  console.log("✅ Seed complete.");
  console.log("");
  console.log("🔑 Comptes de démo (mot de passe commun) :");
  console.log(`   Password     : ${DEMO_PASSWORD}`);
  console.log(`   Admin        : admin@baboo.ma`);
  console.log(`   Particulier  : demo@baboo.ma`);
  AGENCIES.forEach((a) => {
    console.log(`   Agence       : ${a.slug}@baboo.ma  (${a.name})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
