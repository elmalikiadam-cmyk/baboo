"use server";

import { db, hasDb } from "@/lib/db";

/**
 * Récupère les annonces correspondant à une liste de slugs (max 50 par appel).
 * Utilisé par la page Favoris qui lit les slugs en localStorage côté client
 * puis demande au serveur les données complètes pour afficher les cartes.
 */
export async function getListingsBySlugs(slugs: string[]) {
  if (!hasDb() || slugs.length === 0) return [];
  const capped = slugs.slice(0, 50);
  try {
    return await db.listing.findMany({
      where: { slug: { in: capped }, status: "PUBLISHED" },
      include: {
        city: true,
        neighborhood: true,
        agency: { select: { id: true, slug: true, name: true, verified: true, logo: true } },
      },
    });
  } catch {
    return [];
  }
}
