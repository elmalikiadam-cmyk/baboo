"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { CITIES } from "@/data/cities";
import { submitTenantProfile } from "@/actions/tenant-applications";

const EMPLOYMENT = [
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "FONCTIONNAIRE", label: "Fonctionnaire" },
  { value: "INDEPENDANT", label: "Indépendant / freelance" },
  { value: "ETUDIANT", label: "Étudiant" },
  { value: "RETRAITE", label: "Retraité" },
  { value: "SANS_EMPLOI", label: "Sans emploi" },
  { value: "AUTRE", label: "Autre" },
];

type Initial = {
  employment: string;
  employer: string | null;
  position: string | null;
  monthlyIncome: number;
  contractStartDate: Date | null;
  contractEndDate: Date | null;
  householdSize: number;
  hasChildren: boolean;
  smoker: boolean;
  hasPets: boolean;
  targetCitySlug: string | null;
  maxBudget: number | null;
  moveInDate: Date | null;
  bio: string | null;
};

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function TenantProfileForm({
  initial,
  redirectOnSuccess,
}: {
  initial: Initial | null;
  redirectOnSuccess: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaved(false);
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitTenantProfile(form);
      if (res.ok) {
        setSaved(true);
        if (redirectOnSuccess) {
          router.push(redirectOnSuccess);
        } else {
          router.refresh();
        }
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10" noValidate>
      <fieldset disabled={isPending} className="space-y-10">
        {/* Situation pro */}
        <section>
          <header className="border-b border-midnight/10 pb-3">
            <p className="eyebrow">01 · Situation professionnelle</p>
            <h2 className="display-lg mt-1 text-xl">Ce que vous faites au quotidien</h2>
          </header>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="employment">Type de contrat</Label>
              <Select
                id="employment"
                name="employment"
                defaultValue={initial?.employment ?? "CDI"}
                required
              >
                {EMPLOYMENT.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="monthlyIncome">Revenus nets mensuels (MAD)</Label>
              <Input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                min={0}
                defaultValue={initial?.monthlyIncome ?? ""}
                required
              />
              {fieldErrors.monthlyIncome && (
                <p className="text-[11px] text-danger">{fieldErrors.monthlyIncome}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="employer">Employeur (optionnel)</Label>
              <Input
                id="employer"
                name="employer"
                defaultValue={initial?.employer ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="position">Poste (optionnel)</Label>
              <Input
                id="position"
                name="position"
                defaultValue={initial?.position ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contractStartDate">Début de contrat</Label>
              <Input
                id="contractStartDate"
                name="contractStartDate"
                type="date"
                defaultValue={fmtDate(initial?.contractStartDate ?? null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contractEndDate">Fin (si CDD)</Label>
              <Input
                id="contractEndDate"
                name="contractEndDate"
                type="date"
                defaultValue={fmtDate(initial?.contractEndDate ?? null)}
              />
            </div>
          </div>
        </section>

        {/* Foyer */}
        <section>
          <header className="border-b border-midnight/10 pb-3">
            <p className="eyebrow">02 · Foyer</p>
            <h2 className="display-lg mt-1 text-xl">Qui vivra avec vous</h2>
          </header>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="householdSize">Taille du foyer</Label>
              <Input
                id="householdSize"
                name="householdSize"
                type="number"
                min={1}
                max={20}
                defaultValue={initial?.householdSize ?? 1}
                required
              />
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
              <Checkbox name="hasChildren" label="Avec enfants" defaultChecked={initial?.hasChildren} />
              <Checkbox name="smoker" label="Fumeur" defaultChecked={initial?.smoker} />
              <Checkbox name="hasPets" label="Animaux de compagnie" defaultChecked={initial?.hasPets} />
            </div>
          </div>
        </section>

        {/* Recherche */}
        <section>
          <header className="border-b border-midnight/10 pb-3">
            <p className="eyebrow">03 · Recherche</p>
            <h2 className="display-lg mt-1 text-xl">Ce que vous cherchez (optionnel)</h2>
          </header>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="targetCitySlug">Ville visée</Label>
              <Select
                id="targetCitySlug"
                name="targetCitySlug"
                defaultValue={initial?.targetCitySlug ?? ""}
              >
                <option value="">Indifférent</option>
                {CITIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxBudget">Budget max (MAD/mois)</Label>
              <Input
                id="maxBudget"
                name="maxBudget"
                type="number"
                min={0}
                defaultValue={initial?.maxBudget ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="moveInDate">Emménagement souhaité</Label>
              <Input
                id="moveInDate"
                name="moveInDate"
                type="date"
                defaultValue={fmtDate(initial?.moveInDate ?? null)}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="bio">Mot au bailleur (optionnel)</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                maxLength={2000}
                defaultValue={initial?.bio ?? ""}
                placeholder="Une ou deux lignes pour vous présenter : sérieux, référence d'ancien bailleur, motivation…"
              />
            </div>
          </div>
        </section>

        {error && (
          <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
        {saved && !redirectOnSuccess && (
          <p className="rounded-full bg-forest/10 px-3 py-2 text-xs text-forest" role="status">
            ✓ Dossier enregistré.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-midnight/10 pt-6">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending
              ? "Enregistrement…"
              : initial
                ? "Mettre à jour le dossier"
                : "Enregistrer mon dossier"}
          </Button>
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            ○ Réutilisable sur toutes vos candidatures
          </p>
        </div>
      </fieldset>
    </form>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-midnight">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-terracotta"
      />
      <span>{label}</span>
    </label>
  );
}
