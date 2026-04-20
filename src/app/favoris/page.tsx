import Link from "next/link";
import type { Metadata } from "next";
import { db, hasDb } from "@/lib/db";
import { ListingCard } from "@/components/listing/listing-card";
import { Button } from "@/components/ui/button";
import { HeartIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Mes favoris" };

async function getFavorites() {
  if (!hasDb()) return [];
  try {
    // Demo: take the first 6 featured listings as mock favorites
    const listings = await db.listing.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 6,
      include: {
        city: true,
        neighborhood: true,
        agency: { select: { id: true, slug: true, name: true, verified: true, logo: true } },
      },
    });
    return listings;
  } catch {
    return [];
  }
}

export default async function FavoritesPage() {
  const favorites = await getFavorites();

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/compte" className="hover:text-foreground">Mon compte</Link>
        <span className="mx-2">·</span>
        <span>Favoris</span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-foreground/15 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{favorites.length} biens sauvegardés</p>
          <h1 className="display-xl mt-2 text-4xl md:text-6xl">Mes favoris.</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Retrouvez ici les annonces que vous avez enregistrées. Vous êtes alerté(e) dès qu'elles changent de statut.
          </p>
        </div>
        <Button variant="outline">Tout désélectionner</Button>
      </div>

      {favorites.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-foreground/25 bg-paper-2/40 p-10 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-foreground/20">
            <HeartIcon className="h-6 w-6" />
          </span>
          <p className="eyebrow mt-5">Aucun favori</p>
          <h2 className="display-xl mt-2 text-2xl">Commencez votre sélection.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Parcourez les annonces et cliquez sur le cœur pour les enregistrer ici.
          </p>
          <Link href="/recherche" className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
            Voir les annonces
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
