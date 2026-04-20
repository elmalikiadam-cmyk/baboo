"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/components/ui/icons";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL, type PropertyType } from "@/data/taxonomy";
import { buildSearchHref } from "@/lib/search-params";

type Tab = "SALE" | "RENT";

const BUDGETS_SALE = [500_000, 1_000_000, 2_000_000, 3_500_000, 5_000_000, 8_000_000, 15_000_000];
const BUDGETS_RENT = [3_000, 6_000, 10_000, 15_000, 25_000, 40_000];

export function HeroSearch() {
  const [tab, setTab] = useState<Tab>("SALE");
  const [city, setCity] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const router = useRouter();

  const budgets = tab === "SALE" ? BUDGETS_SALE : BUDGETS_RENT;

  const selectedCity = useMemo(() => CITIES.find((c) => c.slug === city), [city]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const href = buildSearchHref({
      transaction: tab,
      citySlug: city || undefined,
      propertyTypes: type ? [type as PropertyType] : [],
      priceMax: priceMax ? Number(priceMax) : undefined,
      bedroomsMin: bedrooms ? Number(bedrooms) : undefined,
    });
    router.push(href);
  }

  return (
    <div className="rounded-2xl bg-surface/95 p-3 shadow-xl ring-1 ring-border backdrop-blur-sm">
      <div role="tablist" aria-label="Type de transaction" className="mb-3 inline-flex rounded-full bg-foreground/[0.06] p-1 text-sm">
        {(["SALE", "RENT"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              tab === t ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "SALE" ? "Acheter" : "Louer"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
        <Select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Ville">
          <option value="">Toutes les villes</option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </Select>

        <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type de bien">
          <option value="">Tous les biens</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>{PROPERTY_TYPE_LABEL[t]}</option>
          ))}
        </Select>

        <Select value={priceMax} onChange={(e) => setPriceMax(e.target.value)} aria-label="Budget maximum">
          <option value="">Budget max</option>
          {budgets.map((b) => (
            <option key={b} value={b}>
              {tab === "SALE"
                ? `Jusqu'à ${new Intl.NumberFormat("fr-FR").format(b)} MAD`
                : `Jusqu'à ${new Intl.NumberFormat("fr-FR").format(b)} MAD/mois`}
            </option>
          ))}
        </Select>

        <Select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} aria-label="Nombre de chambres minimum">
          <option value="">Chambres</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}+ chambres</option>
          ))}
        </Select>

        <Button type="submit" size="lg" className="lg:px-7">
          <SearchIcon className="h-4 w-4" />
          Rechercher
        </Button>
      </form>

      {selectedCity && (
        <p className="mt-3 px-1 text-xs text-muted-foreground">
          {selectedCity.neighborhoods.length} quartiers disponibles à {selectedCity.name}.
        </p>
      )}
    </div>
  );
}
