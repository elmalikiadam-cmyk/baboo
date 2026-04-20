"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CITIES } from "@/data/cities";
import {
  AMENITIES,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABEL,
  type PropertyType,
} from "@/data/taxonomy";
import type { SearchFilters } from "@/lib/search-params";
import { filtersToQueryString } from "@/lib/search-params";

interface Props {
  initial: SearchFilters;
}

export function SearchFiltersPanel({ initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, start] = useTransition();

  const [draft, setDraft] = useState<SearchFilters>(initial);

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  function apply(next: Partial<SearchFilters>) {
    const merged: SearchFilters = { ...draft, ...next, page: 1 };
    setDraft(merged);
    const qs = filtersToQueryString(merged);
    start(() => router.push(`${pathname}${qs}`, { scroll: false }));
  }

  function toggleType(t: PropertyType) {
    const exists = draft.propertyTypes.includes(t);
    apply({
      propertyTypes: exists
        ? draft.propertyTypes.filter((x) => x !== t)
        : [...draft.propertyTypes, t],
    });
  }

  function toggleAmenity(k: string) {
    const exists = draft.amenities.includes(k);
    apply({
      amenities: exists ? draft.amenities.filter((x) => x !== k) : [...draft.amenities, k],
    });
  }

  function reset() {
    const base: SearchFilters = {
      transaction: draft.transaction,
      propertyTypes: [],
      amenities: [],
      sort: "newest",
      page: 1,
    };
    setDraft(base);
    start(() => router.push(`${pathname}${filtersToQueryString(base)}`, { scroll: false }));
  }

  const selectedCity = CITIES.find((c) => c.slug === draft.citySlug);

  return (
    <aside
      className="sticky top-20 max-h-[calc(100vh-6rem)] w-full overflow-y-auto rounded-3xl border border-foreground/15 bg-surface p-5"
      aria-busy={isPending}
    >
      <p className="eyebrow mb-3">Affiner</p>

      <div className="mb-5 inline-flex w-full rounded-full bg-foreground/[0.06] p-1 text-sm" role="tablist">
        {(["SALE", "RENT"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={draft.transaction === t}
            onClick={() => apply({ transaction: t })}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium transition-colors ${
              draft.transaction === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "SALE" ? "Acheter" : "Louer"}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="f-city">Ville</Label>
          <Select
            id="f-city"
            value={draft.citySlug ?? ""}
            onChange={(e) => apply({ citySlug: e.target.value || undefined, neighborhoodSlug: undefined })}
          >
            <option value="">Toutes les villes</option>
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </Select>
        </div>

        {selectedCity && selectedCity.neighborhoods.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="f-n">Quartier</Label>
            <Select
              id="f-n"
              value={draft.neighborhoodSlug ?? ""}
              onChange={(e) => apply({ neighborhoodSlug: e.target.value || undefined })}
            >
              <option value="">Tous les quartiers</option>
              {selectedCity.neighborhoods.map((n) => (
                <option key={n.slug} value={n.slug}>{n.name}</option>
              ))}
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Type de bien</Label>
          <div className="flex flex-wrap gap-1.5">
            {PROPERTY_TYPES.slice(0, 7).map((t) => {
              const active = draft.propertyTypes.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {PROPERTY_TYPE_LABEL[t]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="f-pmin">Prix min</Label>
            <Input
              id="f-pmin"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={draft.priceMin ?? ""}
              onBlur={(e) => {
                const v = e.currentTarget.value ? Number(e.currentTarget.value) : undefined;
                if (v !== draft.priceMin) apply({ priceMin: v });
              }}
              placeholder="MAD"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-pmax">Prix max</Label>
            <Input
              id="f-pmax"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={draft.priceMax ?? ""}
              onBlur={(e) => {
                const v = e.currentTarget.value ? Number(e.currentTarget.value) : undefined;
                if (v !== draft.priceMax) apply({ priceMax: v });
              }}
              placeholder="MAD"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="f-smin">Surface min</Label>
            <Input
              id="f-smin"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={draft.surfaceMin ?? ""}
              onBlur={(e) => {
                const v = e.currentTarget.value ? Number(e.currentTarget.value) : undefined;
                if (v !== draft.surfaceMin) apply({ surfaceMin: v });
              }}
              placeholder="m²"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-smax">Surface max</Label>
            <Input
              id="f-smax"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={draft.surfaceMax ?? ""}
              onBlur={(e) => {
                const v = e.currentTarget.value ? Number(e.currentTarget.value) : undefined;
                if (v !== draft.surfaceMax) apply({ surfaceMax: v });
              }}
              placeholder="m²"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Chambres min.</Label>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = draft.bedroomsMin === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => apply({ bedroomsMin: active ? undefined : n })}
                  aria-pressed={active}
                  className={`w-10 rounded-full border py-1.5 text-xs transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {n}+
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Commodités</Label>
          <div className="flex flex-wrap gap-1.5">
            {AMENITIES.map((a) => {
              const active = draft.amenities.includes(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleAmenity(a.key)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="f-q">Mot-clé</Label>
          <Input
            id="f-q"
            type="search"
            defaultValue={draft.keyword ?? ""}
            onBlur={(e) => {
              const v = e.currentTarget.value.trim() || undefined;
              if (v !== draft.keyword) apply({ keyword: v });
            }}
            placeholder="ex : piscine, duplex, rénové…"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={reset}
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Réinitialiser
          </button>
          {isPending && <span className="text-xs text-muted-foreground">Mise à jour…</span>}
        </div>
      </div>
    </aside>
  );
}
