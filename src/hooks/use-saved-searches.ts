"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "@/lib/client-storage";
import type { SearchFilters } from "@/lib/search-params";

const KEY = "baboo.saved-searches.v1";

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  frequency: "instant" | "daily" | "weekly" | "paused";
  createdAt: string;
}

function read(): SavedSearch[] {
  return readStorage<SavedSearch[]>(KEY, []);
}

export function useSavedSearches() {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read());
    setHydrated(true);

    function onStorage(e: StorageEvent) {
      if (e.key !== KEY) return;
      setItems(read());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const save = useCallback((name: string, filters: SearchFilters) => {
    const s: SavedSearch = {
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      filters,
      frequency: "daily",
      createdAt: new Date().toISOString(),
    };
    const next = [s, ...read()];
    writeStorage(KEY, next);
    setItems(next);
    return s;
  }, []);

  const remove = useCallback((id: string) => {
    const next = read().filter((s) => s.id !== id);
    writeStorage(KEY, next);
    setItems(next);
  }, []);

  const setFrequency = useCallback((id: string, frequency: SavedSearch["frequency"]) => {
    const next = read().map((s) => (s.id === id ? { ...s, frequency } : s));
    writeStorage(KEY, next);
    setItems(next);
  }, []);

  return { items, save, remove, setFrequency, hydrated };
}
