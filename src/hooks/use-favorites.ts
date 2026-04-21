"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readStorage, writeStorage } from "@/lib/client-storage";
import { toggleFavoriteAction, importFavoritesAction } from "@/actions/favorites";
import { useFavoritesInitial } from "@/components/favorites/favorites-provider";

const KEY = "baboo.favorites.v1";

function readLocal(): string[] {
  return readStorage<string[]>(KEY, []);
}

/**
 * Hook favoris avec double backend :
 *  - Non connecté : localStorage (clé `baboo.favorites.v1`)
 *  - Connecté    : DB via server actions. Au premier mount, on migre les
 *                  slugs locaux vers la DB puis on vide le localStorage.
 * Le mode est déterminé par `FavoritesProvider` en racine de page : si
 * `initial` est un tableau, on est en mode serveur ; si null, mode local.
 */
export function useFavorites() {
  const initialServer = useFavoritesInitial();
  const serverMode = initialServer !== null;
  const [favorites, setFavorites] = useState<string[]>(initialServer ?? []);
  const [hydrated, setHydrated] = useState(serverMode);
  const migrated = useRef(false);

  useEffect(() => {
    if (serverMode) {
      if (!migrated.current) {
        migrated.current = true;
        const local = readLocal();
        if (local.length > 0) {
          importFavoritesAction(local).then((res) => {
            if (res.ok) {
              writeStorage<string[]>(KEY, []);
              setFavorites((prev) => Array.from(new Set([...local, ...prev])));
            }
          });
        }
      }
      return;
    }

    setFavorites(readLocal());
    setHydrated(true);

    function onStorage(e: StorageEvent) {
      if (e.key !== KEY) return;
      setFavorites(readLocal());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [serverMode]);

  const toggle = useCallback(
    async (slug: string) => {
      if (serverMode) {
        const wasFav = favorites.includes(slug);
        setFavorites((prev) =>
          wasFav ? prev.filter((s) => s !== slug) : [slug, ...prev],
        );
        const res = await toggleFavoriteAction(slug);
        if (!res.ok) {
          setFavorites((prev) =>
            wasFav ? [slug, ...prev] : prev.filter((s) => s !== slug),
          );
        }
        return;
      }
      const current = readLocal();
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      writeStorage(KEY, next);
      setFavorites(next);
    },
    [serverMode, favorites],
  );

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  );

  const clear = useCallback(async () => {
    if (serverMode) {
      const slugs = [...favorites];
      setFavorites([]);
      for (const s of slugs) {
        await toggleFavoriteAction(s);
      }
      return;
    }
    writeStorage<string[]>(KEY, []);
    setFavorites([]);
  }, [serverMode, favorites]);

  return { favorites, toggle, isFavorite, clear, hydrated };
}

