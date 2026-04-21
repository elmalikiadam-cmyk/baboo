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

// Strict handoff : recherche brutaliste. Segmented avec bordure complète 1px,
// barre de recherche sharp (pas de rounded-full), bouton shape="sharp".
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
      {/* Segmented VENTE / LOCATION avec bordure complète 1px */}
      <div
        role="tablist"
        aria-label="Type de transaction"
        className="mb-3 inline-flex border border-foreground"
      >
        {(["SALE", "RENT"] as const).map((t, i) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`mono px-5 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors ${
              i === 0 ? "border-r border-foreground" : ""
            } ${tab === t ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-foreground/5"}`}
          >
            {t === "SALE" ? "Acheter" : "Louer"}
          </button>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-px border border-foreground bg-foreground/15 sm:grid-cols-[1.2fr_1fr_1fr_auto]"
      >
        <Select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          aria-label="Ville"
          className="h-12 border-0 bg-surface"
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
          className="h-12 border-0 bg-surface"
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
          className="h-12 border-0 bg-surface"
        >
          <option value="">Budget max</option>
          {budgets.map((b) => (
            <option key={b} value={b}>
              {new Intl.NumberFormat("fr-FR").format(b)} MAD{tab === "RENT" ? "/mois" : ""}
            </option>
          ))}
        </Select>

        <Button type="submit" size="md" shape="sharp" className="h-12 px-6">
          <SearchIcon className="h-4 w-4" />
          Rechercher
        </Button>
      </form>
    </div>
  );
}
