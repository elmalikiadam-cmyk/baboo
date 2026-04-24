"use client";

import { useEffect, useState, useTransition } from "react";
import { getPriceSuggestion } from "@/actions/pricing-suggest";
import type { PricingSuggestion } from "@/lib/pricing-assistant";
import type { PropertyType, Transaction } from "@prisma/client";

const FR = new Intl.NumberFormat("fr-FR");

/**
 * Composant affiché sous le champ prix du formulaire annonce.
 * Appelle la server action quand surface + ville + type sont
 * renseignés, affiche la fourchette low/median/high avec
 * visualisation segment horizontal.
 */
export function PriceSuggestion({
  citySlug,
  neighborhoodSlug,
  propertyType,
  surface,
  transaction,
  currentPrice,
  onApply,
}: {
  citySlug?: string | null;
  neighborhoodSlug?: string | null;
  propertyType?: PropertyType | null;
  surface?: number | null;
  transaction?: Transaction | null;
  currentPrice?: number | null;
  onApply?: (price: number) => void;
}) {
  const [suggestion, setSuggestion] = useState<PricingSuggestion | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!citySlug || !propertyType || !surface || surface <= 0 || !transaction) {
      setSuggestion(null);
      return;
    }
    startTransition(async () => {
      const res = await getPriceSuggestion({
        citySlug,
        neighborhoodSlug: neighborhoodSlug ?? null,
        propertyType,
        surface,
        transaction,
      });
      setSuggestion(res);
    });
  }, [citySlug, neighborhoodSlug, propertyType, surface, transaction]);

  if (isPending && !suggestion) {
    return (
      <p className="mt-2 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Estimation du marché…
      </p>
    );
  }

  if (!suggestion) {
    return (
      <p className="mt-2 text-[11px] text-muted-foreground">
        Remplissez ville + type + surface pour voir une estimation du marché.
      </p>
    );
  }

  // Position de currentPrice dans la fourchette low-high
  const current = currentPrice ?? 0;
  const range = suggestion.high - suggestion.low;
  const pos =
    range > 0
      ? Math.max(0, Math.min(100, ((current - suggestion.low) / range) * 100))
      : 50;
  const outOfRange =
    current > 0 &&
    (current < suggestion.low * 0.7 || current > suggestion.high * 1.3);

  return (
    <div className="mt-3 rounded-xl border border-midnight/10 bg-cream p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Marché local · {suggestion.sampleSize} comparable{suggestion.sampleSize > 1 ? "s" : ""}
        </p>
        {onApply && (
          <button
            type="button"
            onClick={() => onApply(suggestion.median)}
            className="mono text-[10px] uppercase tracking-[0.12em] text-terracotta hover:text-terracotta-2"
          >
            Appliquer le prix médian →
          </button>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <Cell label="Bas" value={suggestion.low} />
        <Cell label="Médian" value={suggestion.median} accent />
        <Cell label="Haut" value={suggestion.high} />
      </div>

      {/* Segment visuel */}
      <div className="relative mt-3 h-2 rounded-full bg-midnight/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-terracotta"
          style={{ width: `${pos}%` }}
        />
        {current > 0 && (
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-midnight ring-2 ring-cream"
            style={{ left: `${pos}%` }}
            aria-label="Votre prix"
          />
        )}
      </div>

      {outOfRange && (
        <p className="mt-3 text-[11px] text-terracotta">
          {current < suggestion.low
            ? "Votre prix est sensiblement en dessous du marché — vérifiez qu'il correspond à votre intention."
            : "Votre prix est au-dessus du marché — vous pouvez l'ajuster pour attirer plus de candidats."}
        </p>
      )}

      <p className="mt-3 mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        Fiabilité : {labelConfidence(suggestion.confidence)}
      </p>
    </div>
  );
}

function Cell({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className={accent ? "" : "opacity-60"}>
      <p className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className={accent ? "display-md text-base text-terracotta" : "text-sm text-midnight"}>
        {FR.format(value)}
      </p>
    </div>
  );
}

function labelConfidence(c: "high" | "medium" | "low"): string {
  return c === "high" ? "élevée" : c === "medium" ? "moyenne" : "faible";
}
