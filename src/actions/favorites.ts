"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

/**
 * Toggle un favori pour l'utilisateur connecté. Le front continue d'appeler
 * cette action indifféremment — si pas connecté, on retourne `ok: false` et
 * le composant tombe sur le mode localStorage.
 */
export async function toggleFavoriteAction(
  slug: string,
): Promise<{ ok: boolean; favorited?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };
  try {
    const listing = await db.listing.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!listing) return { ok: false, error: "Annonce inconnue." };

    const existing = await db.favorite.findUnique({
      where: { userId_listingId: { userId: session.user.id, listingId: listing.id } },
      select: { id: true },
    });
    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
    } else {
      await db.favorite.create({
        data: { userId: session.user.id, listingId: listing.id },
      });
    }
    revalidatePath("/favoris");
    return { ok: true, favorited: !existing };
  } catch (err) {
    console.error("[toggleFavoriteAction] failed:", (err as Error).message);
    return { ok: false, error: "Action impossible." };
  }
}

/**
 * Migration one-shot : importe une liste de slugs (typiquement issue du
 * localStorage) dans les favoris de l'utilisateur. Idempotent.
 */
export async function importFavoritesAction(
  slugs: string[],
): Promise<{ ok: boolean; imported?: number }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  if (!hasDb()) return { ok: false };
  if (!slugs.length) return { ok: true, imported: 0 };
  try {
    const listings = await db.listing.findMany({
      where: { slug: { in: slugs.slice(0, 200) } },
      select: { id: true },
    });
    if (!listings.length) return { ok: true, imported: 0 };
    const rows = listings.map((l) => ({ userId: session.user!.id, listingId: l.id }));
    const result = await db.favorite.createMany({ data: rows, skipDuplicates: true });
    revalidatePath("/favoris");
    return { ok: true, imported: result.count };
  } catch (err) {
    console.error("[importFavoritesAction] failed:", (err as Error).message);
    return { ok: false };
  }
}

export async function getFavoriteSlugs(userId: string): Promise<string[]> {
  if (!hasDb()) return [];
  try {
    const rows = await db.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { listing: { select: { slug: true } } },
    });
    return rows.map((r) => r.listing.slug);
  } catch {
    return [];
  }
}
