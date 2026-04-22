"use client";

import Link from "next/link";
import { useSavedSearches, type SavedSearch } from "@/hooks/use-saved-searches";
import { Button } from "@/components/ui/button";
import { SearchIcon, CloseIcon } from "@/components/ui/icons";
import { buildSearchHref } from "@/lib/search-params";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPE_LABEL } from "@/data/taxonomy";

const FREQUENCY_LABEL: Record<SavedSearch["frequency"], string> = {
  instant: "Instantanée",
  daily: "Quotidienne",
  weekly: "Hebdomadaire",
  paused: "En pause",
};

export function SavedSearchesPage() {
  const { items, remove, setFrequency, hydrated } = useSavedSearches();
  const active = items.filter((s) => s.frequency !== "paused").length;

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        <Link href="/" className="hover:text-ink">Accueil</Link>
        <span className="mx-2">·</span>
        <span>Alertes</span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{hydrated ? `${active} alerte${active > 1 ? "s" : ""} active${active > 1 ? "s" : ""}` : "…"}</p>
          <h1 className="display-xl mt-2 text-4xl md:text-6xl">Mes alertes.</h1>
          <p className="mt-3 max-w-xl text-ink-muted">
            Vos alertes sont stockées dans ce navigateur. Depuis la page de recherche, cliquez sur « Enregistrer cette recherche ».
          </p>
        </div>
        <Link href="/recherche">
          <Button>Nouvelle recherche</Button>
        </Link>
      </div>

      {!hydrated ? (
        <ul className="mt-10 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="h-32 animate-pulse rounded-md bg-surface-warm" />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="mt-16 rounded-md border border-dashed border-border bg-surface-warm/40 p-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border">
            <SearchIcon className="h-6 w-6" />
          </span>
          <p className="eyebrow mt-5">Aucune alerte</p>
          <h2 className="display-xl mt-2 text-2xl">Créez votre première alerte.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
            Lancez une recherche avec vos critères puis cliquez sur « Enregistrer cette recherche ».
          </p>
          <Link
            href="/recherche"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background"
          >
            Lancer une recherche
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {items.map((s) => (
            <SavedSearchRow
              key={s.id}
              search={s}
              onRemove={() => remove(s.id)}
              onPause={() =>
                setFrequency(s.id, s.frequency === "paused" ? "daily" : "paused")
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SavedSearchRow({
  search,
  onRemove,
  onPause,
}: {
  search: SavedSearch;
  onRemove: () => void;
  onPause: () => void;
}) {
  const isPaused = search.frequency === "paused";
  return (
    <li className="rounded-md border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-background">
            <SearchIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="display-lg text-xl md:text-2xl">{search.name}</h2>
            <p className="mono mt-1 text-[11px] uppercase tracking-[0.1em] text-ink-muted">
              {summarizeCriteria(search)}
            </p>
          </div>
        </div>
        <span
          className={`mono rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
            isPaused
              ? "border-border text-ink-muted"
              : "border-success/40 bg-success/10 text-success"
          }`}
        >
          {isPaused ? "En pause" : FREQUENCY_LABEL[search.frequency]}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
        <p className="mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
          Créée le {new Date(search.createdAt).toLocaleDateString("fr-FR")}
        </p>
        <div className="flex gap-2">
          <Link
            href={buildSearchHref(search.filters)}
            className="mono rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.12em] hover:border-ink"
          >
            Voir les résultats
          </Link>
          <button
            onClick={onPause}
            className="mono rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.12em] hover:border-ink"
          >
            {isPaused ? "Reprendre" : "Pause"}
          </button>
          <button
            onClick={onRemove}
            aria-label="Supprimer"
            className="grid h-7 w-7 place-items-center rounded-full border border-border hover:border-danger hover:text-danger"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}

function summarizeCriteria(s: SavedSearch): string {
  const { filters } = s;
  const parts: string[] = [filters.transaction === "RENT" ? "Location" : "Vente"];
  if (filters.citySlug) {
    const city = CITIES.find((c) => c.slug === filters.citySlug);
    if (city) parts.push(city.name);
  }
  if (filters.propertyTypes.length === 1) {
    parts.push(PROPERTY_TYPE_LABEL[filters.propertyTypes[0]]);
  }
  if (filters.bedroomsMin) parts.push(`${filters.bedroomsMin}+ ch.`);
  if (filters.priceMax) parts.push(`≤ ${new Intl.NumberFormat("fr-FR").format(filters.priceMax)} MAD`);
  return parts.join(" · ").toUpperCase();
}
