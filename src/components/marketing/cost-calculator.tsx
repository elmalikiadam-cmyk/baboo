"use client";

import { useState, useMemo } from "react";

type Mode = "rent" | "sale";

// Packs visites Baboo (Strate 2 — communication produit, factuel)
// Exemple de référence mis en avant sur la home : 1 000 MAD / 5 visites.
const RENT_PACK_PRICE = 1000; // MAD pour 5 visites location
const SALE_PACK_PRICE = 2500; // MAD pour 5 visites vente

// Approche traditionnelle marché marocain
const TRADITIONAL_RENT_COMMISSION_MONTHS = 1; // 1 mois de loyer
const TRADITIONAL_SALE_COMMISSION_PCT = 0.025; // 2,5% du prix de vente

function formatMAD(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}

/**
 * Calculateur interactif « Combien coûte votre transaction ? »
 *
 * Affiche deux cartes côte à côte : l'approche traditionnelle
 * (commission marché) vs un pack Baboo (prix fixe service-based).
 * La différence apparaît en grand en-dessous, sans commentaire
 * triomphaliste — les chiffres parlent d'eux-mêmes.
 */
export function CostCalculator() {
  const [mode, setMode] = useState<Mode>("rent");
  const [rent, setRent] = useState(9000);
  const [salePrice, setSalePrice] = useState(1_800_000);

  const { traditional, baboo, saving, bacboSubline } = useMemo(() => {
    if (mode === "rent") {
      const trad = rent * TRADITIONAL_RENT_COMMISSION_MONTHS;
      return {
        traditional: trad,
        baboo: RENT_PACK_PRICE,
        saving: Math.max(0, trad - RENT_PACK_PRICE),
        bacboSubline: "5 visites location — forfait fixe",
      };
    }
    const trad = salePrice * TRADITIONAL_SALE_COMMISSION_PCT;
    return {
      traditional: trad,
      baboo: SALE_PACK_PRICE,
      saving: Math.max(0, trad - SALE_PACK_PRICE),
      bacboSubline: "5 visites vente — forfait fixe",
    };
  }, [mode, rent, salePrice]);

  return (
    <div className="rounded-2xl border border-midnight/10 bg-cream p-6 md:p-8">
      {/* Toggle type */}
      <div className="flex gap-2 rounded-full bg-white p-1">
        <button
          type="button"
          onClick={() => setMode("rent")}
          aria-pressed={mode === "rent"}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
            mode === "rent"
              ? "bg-midnight text-cream"
              : "text-midnight hover:bg-cream-2"
          }`}
        >
          Location
        </button>
        <button
          type="button"
          onClick={() => setMode("sale")}
          aria-pressed={mode === "sale"}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
            mode === "sale"
              ? "bg-midnight text-cream"
              : "text-midnight hover:bg-cream-2"
          }`}
        >
          Vente
        </button>
      </div>

      {/* Inputs */}
      <div className="mt-6 space-y-5">
        {mode === "rent" ? (
          <Slider
            label="Loyer mensuel"
            value={rent}
            min={3000}
            max={30000}
            step={500}
            onChange={setRent}
            suffix="MAD / mois"
          />
        ) : (
          <Slider
            label="Prix de vente"
            value={salePrice}
            min={500_000}
            max={10_000_000}
            step={50_000}
            onChange={setSalePrice}
            suffix="MAD"
          />
        )}
      </div>

      {/* Résultats — deux cartes comparatives */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-midnight/10 bg-white p-5">
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Approche traditionnelle
          </p>
          <p className="display-xl mt-3 text-3xl text-midnight">
            {formatMAD(traditional)}{" "}
            <span className="mono text-[11px] text-muted-foreground">MAD</span>
          </p>
          <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {mode === "rent"
              ? `Commission = 1 mois de loyer`
              : `Commission = 2,5 % du prix`}
          </p>
        </div>

        <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-5">
          <p className="mono flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-terracotta">
            <span>Avec</span>
            <span className="display-xl text-[14px] tracking-tight text-terracotta">
              Baboo
            </span>
          </p>
          <p className="display-xl mt-3 text-3xl text-terracotta">
            {formatMAD(baboo)}{" "}
            <span className="mono text-[11px] text-muted-foreground">MAD</span>
          </p>
          <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {bacboSubline}
          </p>
        </div>
      </div>

      {/* Économie */}
      {saving > 0 && (
        <div className="mt-8 border-t border-midnight/10 pt-6 text-center">
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Différence
          </p>
          <p className="display-xl mt-2 text-4xl text-midnight md:text-5xl">
            {formatMAD(saving)}{" "}
            <span className="mono text-[14px] text-muted-foreground">MAD</span>
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Indicatif. Les packs Baboo sont valables pour une annonce pendant 12
        mois, les visites sont réalisées par nos agents formés.
      </p>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </label>
        <span className="display-md text-base text-midnight">
          {formatMAD(value)}{" "}
          <span className="mono text-[10px] text-muted-foreground">
            {suffix}
          </span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-midnight/10 accent-terracotta"
        style={{
          background: `linear-gradient(to right, rgb(192 78 46) 0%, rgb(192 78 46) ${((value - min) / (max - min)) * 100}%, rgb(26 37 64 / 0.1) ${((value - min) / (max - min)) * 100}%, rgb(26 37 64 / 0.1) 100%)`,
        }}
        aria-label={`${label} — ${formatMAD(value)} ${suffix}`}
      />
    </div>
  );
}
