"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input, Label, Select } from "@/components/ui/input";
import { PillToggle } from "@/components/ui/pill-toggle";
import { CITIES } from "@/data/cities";
import {
  AMENITIES,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABEL,
  type PropertyType,
} from "@/data/taxonomy";
import type { SearchFilters } from "@/lib/search-params";
import { filtersToQueryString } from "@/lib/search-params";
import { cn } from "@/lib/cn";

interface Props {
  initial: SearchFilters;
  className?: string;
}

/**
 * V2 "Maison ouverte" — panneau filtres sticky (desktop) ou inline (mobile).
 * Card rounded-2xl, toggle Acheter/Louer, chips ronds bordés.
 */
export function SearchFiltersPanel({ initial, className }: Props) {
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

  const chipClass = (active: boolean) =>
    cn(
      "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors",
      active
        ? "border-ink bg-ink text-ink-foreground"
        : "border-border text-ink-soft hover:border-ink",
    );

  return (
    <aside
      className={cn(
        "rounded-2xl border border-border bg-surface p-5",
        className,
      )}
      aria-busy={isPending}
      aria-label="Filtres"
    >
      <p className="eyebrow-muted mb-3">Affiner</p>

      <PillToggle
        ariaLabel="Type de transaction"
        value={draft.transaction}
        onChange={(v) => apply({ transaction: v })}
        options={[
          { value: "SALE", label: "Acheter" },
          { value: "RENT", label: "Louer" },
        ]}
      />

      <div className="mt-5 space-y-5">
        <Block label="Ville" id="f-city">
          <Select
            id="f-city"
            value={draft.citySlug ?? ""}
            onChange={(e) => apply({ citySlug: e.target.value || undefined, neighborhoodSlug: undefined })}
          >
            <option value="">Toutes les villes</option>
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </Block>

        {selectedCity && selectedCity.neighborhoods.length > 0 && (
          <Block label="Quartier" id="f-n">
            <Select
              id="f-n"
              value={draft.neighborhoodSlug ?? ""}
              onChange={(e) => apply({ neighborhoodSlug: e.target.value || undefined })}
            >
              <option value="">Tous les quartiers</option>
              {selectedCity.neighborhoods.map((n) => (
                <option key={n.slug} value={n.slug}>
                  {n.name}
                </option>
              ))}
            </Select>
          </Block>
        )}

        <Block label="Type de bien">
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.slice(0, 7).map((t) => {
              const active = draft.propertyTypes.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  aria-pressed={active}
                  className={chipClass(active)}
                >
                  {PROPERTY_TYPE_LABEL[t]}
                </button>
              );
            })}
          </div>
        </Block>

        <div className="grid grid-cols-2 gap-3">
          <Block label="Prix min" id="f-pmin">
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
              className="h-11"
            />
          </Block>
          <Block label="Prix max" id="f-pmax">
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
              className="h-11"
            />
          </Block>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Block label="Surface min" id="f-smin">
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
              className="h-11"
            />
          </Block>
          <Block label="Surface max" id="f-smax">
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
              className="h-11"
            />
          </Block>
        </div>

        <Block label="Chambres min.">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = draft.bedroomsMin === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => apply({ bedroomsMin: active ? undefined : n })}
                  aria-pressed={active}
                  className={chipClass(active)}
                >
                  {n}+
                </button>
              );
            })}
          </div>
        </Block>

        <Block label="Commodités">
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => {
              const active = draft.amenities.includes(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleAmenity(a.key)}
                  aria-pressed={active}
                  className={chipClass(active)}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </Block>

        <Block label="Mot-clé" id="f-q">
          <Input
            id="f-q"
            type="search"
            defaultValue={draft.keyword ?? ""}
            onBlur={(e) => {
              const v = e.currentTarget.value.trim() || undefined;
              if (v !== draft.keyword) apply({ keyword: v });
            }}
            placeholder="rénové, vue mer…"
            className="h-11"
          />
        </Block>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={reset}
            className="text-xs font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Réinitialiser
          </button>
          {isPending && <span className="text-xs text-ink-muted">Mise à jour…</span>}
        </div>
      </div>
    </aside>
  );
}

function Block({
  label,
  id,
  children,
}: {
  label: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
