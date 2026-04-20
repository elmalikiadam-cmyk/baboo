import { PrismaClient } from "@prisma/client";
import { CITIES } from "../src/data/cities";

const prisma = new PrismaClient();

// A small bank of realistic listing photos from Unsplash (real-estate interior/exterior).
const PHOTO_BANK = {
  apartment: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=75",
  ],
  villa: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=75",
  ],
  riad: [
    "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=75",
  ],
  office: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=75",
  ],
  commercial: [
    "https://images.unsplash.com/photo-1555529771-7888783a18d3?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1600&q=75",
  ],
  land: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=75",
  ],
  house: [
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=75",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=75",
  ],
};

const AGENCIES = [
  { slug: "atlas-realty", name: "Atlas Realty", city: "casablanca", tagline: "L'immobilier haut de gamme à Casablanca.", verified: true },
  { slug: "medina-properties", name: "Medina Properties", city: "marrakech", tagline: "Riads, villas et investissements à Marrakech.", verified: true },
  { slug: "capital-homes", name: "Capital Homes", city: "rabat", tagline: "Votre partenaire immobilier dans la capitale.", verified: true },
  { slug: "detroit-immobilier", name: "Détroit Immobilier", city: "tanger", tagline: "Le nord du Maroc en exclusivité.", verified: false },
  { slug: "souss-home", name: "Souss Home", city: "agadir", tagline: "Vivre au soleil, investir sereinement.", verified: true },
];

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
  const typeLabel = {
    APARTMENT: "Appartement",
    VILLA: "Villa",
    RIAD: "Riad",
    HOUSE: "Maison",
    OFFICE: "Bureau",
    COMMERCIAL: "Local commercial",
    LAND: "Terrain",
  }[p.type];
  const verb = p.transaction === "SALE" ? "à vendre" : "à louer";
  const descriptors = ["élégant", "lumineux", "rénové", "moderne", "de standing", "avec terrasse", "avec jardin", "vue dégagée"];
  return `${typeLabel} ${verb} — ${pick(descriptors, p.index)}, ${p.neighborhoodName}`;
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

  // Demo owner + agencies
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@baboo.ma" },
    update: {},
    create: { email: "admin@baboo.ma", name: "Baboo Admin", role: "ADMIN" },
  });

  const agencyRecords: Array<{ id: string; slug: string; citySlug: string }> = [];
  for (const a of AGENCIES) {
    const user = await prisma.user.upsert({
      where: { email: `${a.slug}@baboo.ma` },
      update: { role: "AGENCY", name: a.name },
      create: { email: `${a.slug}@baboo.ma`, name: a.name, role: "AGENCY" },
    });
    const agency = await prisma.agency.upsert({
      where: { slug: a.slug },
      update: { name: a.name, tagline: a.tagline, verified: a.verified, citySlug: a.city },
      create: {
        userId: user.id,
        slug: a.slug,
        name: a.name,
        tagline: a.tagline,
        verified: a.verified,
        citySlug: a.city,
        phone: "+212 6 00 00 00 00",
        email: `contact@${a.slug}.ma`,
      },
    });
    agencyRecords.push({ id: agency.id, slug: agency.slug, citySlug: a.city });
  }
  console.log(`  ✓ ${AGENCIES.length} agencies seeded`);

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

  // Wipe existing listings for idempotent reseeds
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
