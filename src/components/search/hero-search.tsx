"use client";

import { useState } from "react";
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
  const router = useRouter();

  const budgets = tab === "SALE" ? BUDGETS_SALE : BUDGETS_RENT;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(
      buildSearchHref({
        transaction: tab,
        citySlug: city || undefined,
        propertyTypes: type ? [type as PropertyType] : [],
        priceMax: priceMax ? Number(priceMax) : undefined,
      }),
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-3 flex items-center justify-center">
        <div
          role="tablist"
          aria-label="Type de transaction"
          className="glass inline-flex rounded-full p-1 text-sm"
        >
          {(["SALE", "RENT"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-1.5 font-medium transition-all ${
                tab === t
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {t === "SALE" ? "Acheter" : "Louer"}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="glass-strong ring-warm grid gap-2 rounded-full p-2 sm:grid-cols-[1.2fr_1fr_1fr_auto]"
      >
        <Select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          aria-label="Ville"
          className="h-11 border-transparent bg-transparent"
        >
          <option value="">Toutes les villes</option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </Select>

        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Type de bien"
          className="h-11 border-transparent bg-transparent"
        >
          <option value="">Tous les types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>{PROPERTY_TYPE_LABEL[t]}</option>
          ))}
        </Select>

        <Select
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          aria-label="Budget maximum"
          className="h-11 border-transparent bg-transparent"
        >
          <option value="">Budget max</option>
          {budgets.map((b) => (
            <option key={b} value={b}>
              {new Intl.NumberFormat("fr-FR").format(b)} MAD{tab === "RENT" ? "/mois" : ""}
            </option>
          ))}
        </Select>

        <Button type="submit" size="md" className="h-11 px-6">
          <SearchIcon className="h-4 w-4" />
          Rechercher
        </Button>
      </form>
    </div>
  );
}
