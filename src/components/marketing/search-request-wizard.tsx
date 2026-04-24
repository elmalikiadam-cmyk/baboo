"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPE_LABEL, PROPERTY_TYPES } from "@/data/taxonomy";
import { createSearchRequest } from "@/actions/search-requests";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Wizard multi-step /je-cherche. Un seul form HTML, on cache/montre
 * les sections progressivement pour garder un submit unique (pas de
 * perte de données entre étapes).
 */
export function SearchRequestWizard() {
  const [step, setStep] = useState<Step>(1);
  const [transaction, setTransaction] = useState<"SALE" | "RENT">("RENT");
  const [citySlug, setCitySlug] = useState("casablanca");
  const [neighborhoodSlugs, setNeighborhoodSlugs] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    matchCount: number;
  } | null>(null);

  const city = CITIES.find((c) => c.slug === citySlug);

  function toggleNeighborhood(slug: string) {
    setNeighborhoodSlugs((p) =>
      p.includes(slug) ? p.filter((x) => x !== slug) : [...p, slug],
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    // On ajoute les neighborhoodSlugs multi-select
    for (const slug of neighborhoodSlugs) {
      form.append("neighborhoodSlugs", slug);
    }
    startTransition(async () => {
      const res = await createSearchRequest(form);
      if (res.ok) {
        setResult({ id: res.id, matchCount: res.matchCount });
      } else {
        setError(res.error);
      }
    });
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-forest/30 bg-forest/5 p-8 text-center">
        {result.matchCount > 0 ? (
          <>
            <p className="display-xl text-3xl text-forest">
              ✓ {result.matchCount} annonce{result.matchCount > 1 ? "s" : ""} trouvée{result.matchCount > 1 ? "s" : ""}
            </p>
            <p className="mt-4 text-sm text-midnight md:text-base">
              Nous vous envoyons les détails par email immédiatement. Vous
              pouvez déjà parcourir les résultats ci-dessous.
            </p>
            <Link
              href={`/recherche?t=${transaction === "RENT" ? "rent" : "sale"}&city=${citySlug}`}
              className="mt-6 inline-flex h-12 items-center rounded-full bg-terracotta px-6 text-sm font-semibold text-cream hover:bg-terracotta-2"
            >
              Voir les annonces →
            </Link>
          </>
        ) : (
          <>
            <p className="display-xl text-2xl text-midnight">
              Nous n'avons pas encore d'annonce qui correspond
            </p>
            <p className="mt-4 text-sm text-midnight md:text-base">
              Votre recherche est enregistrée. Dès qu'une annonce
              correspondant à vos critères est publiée, nous vous
              écrivons à <strong>{/* show mailto would be intrusive */}</strong>
              votre adresse.
            </p>
            <Link
              href="/recherche"
              className="mt-6 inline-flex h-11 items-center rounded-full border-2 border-midnight px-5 text-sm font-semibold text-midnight hover:bg-midnight hover:text-cream"
            >
              Explorer les annonces existantes
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-8 rounded-2xl border border-midnight/10 bg-cream p-6 md:p-8"
      noValidate
    >
      <div className="flex items-center justify-between">
        <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Étape {step} / 6
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span
              key={n}
              className={`h-1.5 w-6 rounded-full ${
                n <= step ? "bg-terracotta" : "bg-midnight/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Toutes les étapes sont dans le DOM, on affiche seulement la courante */}
      {/* Step 1 — Transaction + type */}
      <section className={step === 1 ? "" : "hidden"}>
        <h2 className="display-lg text-xl">Que cherchez-vous ?</h2>
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTransaction("RENT")}
              className={`rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
                transaction === "RENT"
                  ? "bg-midnight text-cream"
                  : "border-2 border-midnight/20 text-midnight hover:border-midnight"
              }`}
            >
              Louer
            </button>
            <button
              type="button"
              onClick={() => setTransaction("SALE")}
              className={`rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
                transaction === "SALE"
                  ? "bg-midnight text-cream"
                  : "border-2 border-midnight/20 text-midnight hover:border-midnight"
              }`}
            >
              Acheter
            </button>
          </div>
          <input type="hidden" name="transaction" value={transaction} />
          <div className="space-y-1.5">
            <Label htmlFor="propertyType">Type de bien</Label>
            <Select id="propertyType" name="propertyType" defaultValue="APARTMENT">
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PROPERTY_TYPE_LABEL[t]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      {/* Step 2 — Ville + quartiers */}
      <section className={step === 2 ? "" : "hidden"}>
        <h2 className="display-lg text-xl">Où ?</h2>
        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="citySlug">Ville</Label>
            <Select
              id="citySlug"
              name="citySlug"
              value={citySlug}
              onChange={(e) => {
                setCitySlug(e.target.value);
                setNeighborhoodSlugs([]);
              }}
            >
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          {city && city.neighborhoods.length > 0 && (
            <div>
              <Label>Quartiers (optionnel, plusieurs choix)</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {city.neighborhoods.map((n) => {
                  const active = neighborhoodSlugs.includes(n.slug);
                  return (
                    <button
                      key={n.slug}
                      type="button"
                      onClick={() => toggleNeighborhood(n.slug)}
                      className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                        active
                          ? "bg-terracotta text-cream"
                          : "border border-midnight/20 text-midnight hover:border-midnight"
                      }`}
                    >
                      {n.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Step 3 — Budget */}
      <section className={step === 3 ? "" : "hidden"}>
        <h2 className="display-lg text-xl">Votre budget maximum</h2>
        <div className="mt-5 space-y-1.5">
          <Label htmlFor="budgetMax">
            {transaction === "RENT" ? "Loyer mensuel max (MAD)" : "Prix max (MAD)"}
          </Label>
          <Input
            id="budgetMax"
            name="budgetMax"
            type="number"
            min={0}
            required
            defaultValue={transaction === "RENT" ? 10000 : 2000000}
          />
        </div>
      </section>

      {/* Step 4 — Caractéristiques */}
      <section className={step === 4 ? "" : "hidden"}>
        <h2 className="display-lg text-xl">Caractéristiques souhaitées</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="minBedrooms">Chambres min</Label>
            <Input
              id="minBedrooms"
              name="minBedrooms"
              type="number"
              min={0}
              defaultValue={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="minSurface">Surface min (m²)</Label>
            <Input
              id="minSurface"
              name="minSurface"
              type="number"
              min={0}
              defaultValue={60}
            />
          </div>
          {transaction === "RENT" && (
            <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-midnight/10 bg-white p-4 text-sm">
              <input
                type="checkbox"
                name="furnished"
                className="h-4 w-4 accent-terracotta"
              />
              <span>Meublé uniquement</span>
            </label>
          )}
        </div>
      </section>

      {/* Step 5 — Délai */}
      <section className={step === 5 ? "" : "hidden"}>
        <h2 className="display-lg text-xl">Quel délai ?</h2>
        <div className="mt-5 space-y-1.5">
          <Label htmlFor="timeline">Quand souhaitez-vous emménager ?</Label>
          <Select id="timeline" name="timeline" defaultValue="quarter">
            <option value="month">Dans le mois</option>
            <option value="quarter">Dans les 3 mois</option>
            <option value="flexible">Flexible</option>
          </Select>
        </div>
      </section>

      {/* Step 6 — Contact */}
      <section className={step === 6 ? "" : "hidden"}>
        <h2 className="display-lg text-xl">Vos coordonnées</h2>
        <div className="mt-5 grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="contactName">Nom</Label>
            <Input id="contactName" name="contactName" required maxLength={140} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactPhone">Téléphone</Label>
            <Input id="contactPhone" name="contactPhone" type="tel" required maxLength={40} />
          </div>
          <label className="flex items-start gap-3 rounded-xl bg-cream-2 p-4 text-xs text-midnight">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-0.5 h-4 w-4 accent-terracotta"
            />
            <span>
              J'accepte d'être contacté par email ou téléphone avec des
              propositions correspondant à mes critères. Je peux me
              désinscrire à tout moment.
            </span>
          </label>
        </div>
      </section>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-midnight/10 pt-6">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((step - 1) as Step)}
            disabled={isPending}
            className="rounded-full border border-midnight/20 px-5 py-2 text-xs font-medium text-midnight hover:border-midnight"
          >
            ← Précédent
          </button>
        ) : (
          <span />
        )}
        {step < 6 ? (
          <button
            type="button"
            onClick={() => setStep((step + 1) as Step)}
            className="rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-cream hover:bg-terracotta-2"
          >
            Suivant →
          </button>
        ) : (
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Envoi…" : "Trouver mon bien"}
          </Button>
        )}
      </div>
    </form>
  );
}
