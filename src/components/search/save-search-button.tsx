"use client";

import { useState } from "react";
import { useSavedSearches } from "@/hooks/use-saved-searches";
import type { SearchFilters } from "@/lib/search-params";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPE_LABEL_PLURAL } from "@/data/taxonomy";

interface Props {
  filters: SearchFilters;
  heading: string;
}

function defaultName(filters: SearchFilters, heading: string): string {
  const city = filters.citySlug
    ? CITIES.find((c) => c.slug === filters.citySlug)?.name
    : null;
  if (filters.propertyTypes.length === 1) {
    const t = PROPERTY_TYPE_LABEL_PLURAL[filters.propertyTypes[0]];
    return city ? `${t} à ${city}` : t;
  }
  return heading.replace(/\.$/, "");
}

export function SaveSearchButton({ filters, heading }: Props) {
  const { save } = useSavedSearches();
  const [saved, setSaved] = useState(false);

  function onClick() {
    save(defaultName(filters, heading), filters);
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <button
      onClick={onClick}
      className="mono rounded-full border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-ink transition hover:border-ink"
    >
      {saved ? "✓ Alerte créée" : "Enregistrer cette recherche"}
    </button>
  );
}
