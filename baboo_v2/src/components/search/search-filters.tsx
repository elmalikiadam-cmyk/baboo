"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PillToggle } from "@/components/ui/pill-toggle";
import { Button } from "@/components/ui/button";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL, AMENITIES } from "@/data/taxonomy";
import { buildSearchHref, type SearchFilters as Filters } from "@/lib/search-params";
import { cn } from "@/lib/cn";

interface Props {
  initial: Filters;
  className?: string;
}

/**
 * Panneau de filtres sticky (desktop). Sur mobile, l'UX prévue est une
 * bottom-sheet — pour cette V2 front, on affiche la même Card, déplacée
 * au-dessus des résultats. L'ouverture/fermeture d'un vrai bottom-sheet
 * est un TODO non bloquant.
 */
export function SearchFilters({ initial, className }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [f, setF] = useState<Filters>(initial);

  const currentCity = useMemo(
    () => CITIES.find((c) => c.slug === f.citySlug),
    [f.citySlug],
  );

  function apply(next: Partial<Filters>) {
    const merged = { ...f, ...next, page: 1 };
    setF(merged);
    startTransition(() => router.push(buildSearchHref(merged)));
  }

  function reset() {
    const cleared: Filters = {
      transaction: f.transaction,
      propertyTypes: [],
      amenities: [],
      sort: "newest",
      page: 1,
    };
    setF(cleared);
    startTransition(() => router.push(buildSearchHref(cleared)));
  }

  function toggleType(t: (typeof PROPERTY_TYPES)[number]) {
    const has = f.propertyTypes.includes(t);
    apply({
      propertyTypes: has
        ? f.propertyTypes.filter((x) => x !== t)
        : [...f.propertyTypes, t],
    });
  }

  function toggleAmenity(k: string) {
    const has = f.amenities.includes(k);
    apply({
      amenities: has ? f.amenities.filter((a) => a !== k) : [...f.amenities, k],
    });
  }

  return (
    <aside
      className={cn(
        "rounded-2xl border border-border bg-surface p-5",
        className,
      )}
      aria-label="Filtres"
    >
      <PillToggle
        ariaLabel="Type de transaction"
        value={f.transaction}
        onChange={(v) => apply({ transaction: v })}
        options={[
          { value: "SALE", label: "Acheter" },
          { value: "RENT", label: "Louer" },
        ]}
      />

      <div className="mt-5 space-y-5">
        <Block label="Ville">
          <Select
            value={f.citySlug ?? ""}
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

        {currentCity && currentCity.neighborhoods.length > 0 && (
          <Block label="Quartier">
            <Select
              value={f.neighborhoodSlug ?? ""}
              onChange={(e) => apply({ neighborhoodSlug: e.target.value || undefined })}
            >
              <option value="">Tous les quartiers</option>
              {currentCity.neighborhoods.map((n) => (
                <option key={n.slug} value={n.slug}>
                  {n.name}
                </option>
              ))}
            </Select>
          </Block>
        )}

        <Block label="Type de bien">
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((t) => {
              const active = f.propertyTypes.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors",
                    active
                      ? "border-ink bg-ink text-ink-foreground"
                      : "border-border text-ink-soft hover:border-ink",
                  )}
                >
                  {PROPERTY_TYPE_LABEL[t]}
                </button>
              );
            })}
          </div>
        </Block>

        <Block label="Prix (MAD)">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Min"
              defaultValue={f.priceMin ?? ""}
              onBlur={(e) => apply({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
              className="h-11"
            />
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Max"
              defaultValue={f.priceMax ?? ""}
              onBlur={(e) => apply({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
              className="h-11"
            />
          </div>
        </Block>

        <Block label="Surface (m²)">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Min"
              defaultValue={f.surfaceMin ?? ""}
              onBlur={(e) => apply({ surfaceMin: e.target.value ? Number(e.target.value) : undefined })}
              className="h-11"
            />
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Max"
              defaultValue={f.surfaceMax ?? ""}
              onBlur={(e) => apply({ surfaceMax: e.target.value ? Number(e.target.value) : undefined })}
              className="h-11"
            />
          </div>
        </Block>

        <Block label="Chambres">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = f.bedroomsMin === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => apply({ bedroomsMin: active ? undefined : n })}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors",
                    active
                      ? "border-ink bg-ink text-ink-foreground"
                      : "border-border text-ink-soft hover:border-ink",
                  )}
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
              const active = f.amenities.includes(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleAmenity(a.key)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors",
                    active
                      ? "border-ink bg-ink text-ink-foreground"
                      : "border-border text-ink-soft hover:border-ink",
                  )}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </Block>

        <Block label="Mot-clé">
          <Input
            placeholder="Ex. rénové, vue mer…"
            defaultValue={f.keyword ?? ""}
            onBlur={(e) => apply({ keyword: e.target.value || undefined })}
            className="h-11"
          />
        </Block>

        <div className="pt-2">
          <Button variant="ghost" size="sm" onClick={reset} disabled={isPending}>
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
    </aside>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
