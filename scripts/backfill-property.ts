/* eslint-disable no-console */
// Backfill : crée un Property pour chaque Listing legacy qui n'en a pas
// encore, puis rattache le Listing via propertyId.
//
// Stratégie :
//   - Un Property = un Listing (1:1 initial). Des Listings ultérieurs
//     pour le même bien physique pourront être regroupés manuellement
//     via un script de consolidation (hors scope Brique 1).
//   - Idempotent : tourne sans effet si tous les Listings ont déjà un
//     propertyId.
//   - Copie depuis Listing → Property les champs qui existent sur les
//     deux (propertyType, surface, citySlug, etc.).
//
// Exécution :
//   pnpm tsx scripts/backfill-property.ts
//
// Pré-requis :
//   - DATABASE_URL et DIRECT_URL définis (dotenv ou shell).
//   - Schéma poussé (prisma db push) avec Property + Listing.propertyId.

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const total = await db.listing.count({ where: { propertyId: null } });
  console.log(`[backfill-property] ${total} listings à migrer.`);
  if (total === 0) {
    console.log("[backfill-property] rien à faire. 🎉");
    return;
  }

  const BATCH = 50;
  let processed = 0;
  let created = 0;
  let skipped = 0;

  while (processed < total) {
    const batch = await db.listing.findMany({
      where: { propertyId: null },
      take: BATCH,
      select: {
        id: true,
        ownerId: true,
        title: true,
        propertyType: true,
        surface: true,
        landSurface: true,
        bedrooms: true,
        bathrooms: true,
        floor: true,
        totalFloors: true,
        yearBuilt: true,
        citySlug: true,
        neighborhoodId: true,
        addressLine: true,
        lat: true,
        lng: true,
      },
    });
    if (batch.length === 0) break;

    for (const l of batch) {
      try {
        const property = await db.property.create({
          data: {
            ownerId: l.ownerId,
            label: l.title.slice(0, 60),
            propertyType: l.propertyType,
            surface: l.surface,
            landSurface: l.landSurface,
            bedrooms: l.bedrooms,
            bathrooms: l.bathrooms,
            floor: l.floor,
            totalFloors: l.totalFloors,
            yearBuilt: l.yearBuilt,
            citySlug: l.citySlug,
            neighborhoodId: l.neighborhoodId,
            addressLine: l.addressLine,
            lat: l.lat,
            lng: l.lng,
          },
          select: { id: true },
        });
        await db.listing.update({
          where: { id: l.id },
          data: { propertyId: property.id },
        });
        created += 1;
      } catch (err) {
        skipped += 1;
        console.warn(
          `[backfill-property] skip listing ${l.id} (${(err as Error).message})`,
        );
      }
    }

    processed += batch.length;
    console.log(
      `[backfill-property] ${processed}/${total} (created=${created}, skipped=${skipped})`,
    );
  }

  console.log(
    `[backfill-property] done. created=${created}, skipped=${skipped}.`,
  );
}

main()
  .catch((err) => {
    console.error("[backfill-property] fatal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
