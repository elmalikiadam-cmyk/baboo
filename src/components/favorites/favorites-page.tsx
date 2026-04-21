"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";
import { ListingCard } from "@/components/listing/listing-card";
import { Button } from "@/components/ui/button";
import { getListingsBySlugs } from "@/actions/listings";
import type { ListingWithRelations } from "@/lib/listings-query";

export function FavoritesPage() {
  const { favorites, clear, hydrated } = useFavorites();
  const [items, setItems] = useState<ListingWithRelations[] | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (favorites.length === 0) {
      setItems([]);
      return;
    }
    let cancelled = false;
    getListingsBySlugs(favorites).then((data) => {
      if (!cancelled) {
        // Préserve l'ordre du localStorage (plus récent en premier)
        const bySlug = new Map(data.map((l) => [l.slug, l]));
        const ordered = favorites
          .map((s) => bySlug.get(s))
          .filter((l): l is ListingWithRelations => Boolean(l));
        setItems(ordered);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [favorites, hydrated]);

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        <span className="mx-2">·</span>
        <span>Favoris</span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-foreground/15 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">
            {!hydrated ? "…" : favorites.length} bien{favorites.length > 1 ? "s" : ""} sauvegardé{favorites.length > 1 ? "s" : ""}
          </p>
          <h1 className="display-xl mt-2 text-4xl md:text-6xl">Mes favoris.</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Vos favoris sont stockés localement dans ce navigateur. Pas besoin de compte.
          </p>
        </div>
        {hydrated && favorites.length > 0 && (
          <Button variant="outline" onClick={clear}>Tout retirer</Button>
        )}
      </div>

      {!hydrated || items === null ? (
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-md bg-foreground/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-16 rounded-md border border-dashed border-foreground/25 bg-paper-2/40 p-10 text-center">
          <p className="eyebrow">Aucun favori</p>
          <h2 className="display-xl mt-2 text-2xl">Commencez votre sélection.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Parcourez les annonces et cliquez sur le cœur pour les enregistrer ici.
          </p>
          <Link
            href="/recherche"
            className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            Voir les annonces
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
