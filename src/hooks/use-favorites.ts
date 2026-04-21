"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "@/lib/client-storage";

const KEY = "baboo.favorites.v1";

function readFavorites(): string[] {
  return readStorage<string[]>(KEY, []);
}

/**
 * Hook favoris — stocke les slugs d'annonces en localStorage. Pas d'auth
 * nécessaire. Les favoris survivent aux refresh et redeploys.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavorites(readFavorites());
    setHydrated(true);

    function onStorage(e: StorageEvent) {
      if (e.key !== KEY) return;
      setFavorites(readFavorites());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((slug: string) => {
    const current = readFavorites();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    writeStorage(KEY, next);
    setFavorites(next);
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  );

  const clear = useCallback(() => {
    writeStorage<string[]>(KEY, []);
    setFavorites([]);
  }, []);

  return { favorites, toggle, isFavorite, clear, hydrated };
}
