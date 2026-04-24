"use client";

import { useState, useTransition } from "react";
import { VisitPackType } from "@prisma/client";
import { initiateVisitPackPurchase } from "@/actions/visit-packs";

const FR = new Intl.NumberFormat("fr-FR");

const PACK_DATA: Record<
  VisitPackType,
  { label: string; credits: number; price: number; subline: string; featured?: boolean }
> = {
  DECOUVERTE_3: {
    label: "Découverte",
    credits: 3,
    price: 400,
    subline: "Pour tester le service",
  },
  LOCATION_10: {
    label: "Location — 10 visites",
    credits: 10,
    price: 1200,
    subline: "Le pack de référence",
    featured: true,
  },
  LOCATION_25: {
    label: "Location — 25 visites",
    credits: 25,
    price: 2500,
    subline: "Biens très demandés",
  },
  VENTE_5: {
    label: "Vente — 5 visites",
    credits: 5,
    price: 2500,
    subline: "Transaction accompagnée",
  },
  VENTE_10: {
    label: "Vente — 10 visites",
    credits: 10,
    price: 4500,
    subline: "Vente rapide, profils qualifiés",
    featured: true,
  },
};

export function PackPicker({
  listingId,
  packTypes,
}: {
  listingId: string;
  packTypes: VisitPackType[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ manual: boolean } | null>(null);

  function onBuy(packType: VisitPackType) {
    setError(null);
    startTransition(async () => {
      const res = await initiateVisitPackPurchase(listingId, packType);
      if (res.ok) {
        if (res.redirectUrl) {
          window.location.href = res.redirectUrl;
        } else {
          setDone({ manual: !!res.manual });
        }
      } else {
        setError(res.error);
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-forest/30 bg-forest/5 p-8 text-center">
        <p className="display-xl text-2xl text-forest">
          ✓ Pack enregistré
        </p>
        <p className="mt-4 text-sm text-midnight">
          {done.manual
            ? "Notre équipe vous contactera sous 24 h pour finaliser le paiement."
            : "Votre pack sera activé dès confirmation du paiement."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        {packTypes.map((t) => {
          const p = PACK_DATA[t];
          return (
            <div
              key={t}
              className={`flex flex-col rounded-2xl border p-6 ${
                p.featured
                  ? "border-terracotta bg-terracotta/5"
                  : "border-midnight/10 bg-cream"
              }`}
            >
              {p.featured && (
                <span className="mono mb-2 inline-block self-start rounded-full bg-terracotta px-2.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-cream">
                  Recommandé
                </span>
              )}
              <h3 className="display-lg text-lg">{p.label}</h3>
              <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {p.subline}
              </p>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="display-xl text-3xl text-terracotta">
                  {FR.format(p.price)}
                </span>
                <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  MAD
                </span>
              </div>
              <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {p.credits} visite{p.credits > 1 ? "s" : ""} · {Math.round(p.price / p.credits)} MAD / visite
              </p>
              <button
                type="button"
                onClick={() => onBuy(t)}
                disabled={isPending}
                className={`mt-auto inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${
                  p.featured
                    ? "bg-terracotta text-cream hover:bg-terracotta-2"
                    : "border-2 border-midnight text-midnight hover:bg-midnight hover:text-cream"
                } disabled:opacity-50`}
              >
                {isPending ? "…" : "Choisir ce pack →"}
              </button>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="mt-4 rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
