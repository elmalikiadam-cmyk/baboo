"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import {
  toggleMyAvailability,
  updateMyCoverage,
} from "@/actions/agent-self";

type City = { slug: string; name: string };

export function AvailabilityToggle({ status }: { status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await toggleMyAvailability();
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  const isActive = status === "ACTIVE";
  const suspended = status === "SUSPENDED";

  return (
    <div className="rounded-2xl border border-midnight/10 bg-cream p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">Disponibilité</p>
          <p className="display-md mt-1.5 text-base">
            {isActive
              ? "Vous recevez les nouvelles missions."
              : suspended
              ? "Profil suspendu par l'équipe ops."
              : "En pause — pas de nouvelle mission."}
          </p>
        </div>
        {!suspended && (
          <button
            type="button"
            onClick={onClick}
            disabled={isPending}
            className={`inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold transition-colors disabled:opacity-50 ${
              isActive
                ? "border border-midnight/20 text-midnight hover:border-midnight"
                : "bg-terracotta text-cream hover:bg-terracotta-2"
            }`}
          >
            {isPending
              ? "…"
              : isActive
              ? "Mettre en pause"
              : "Réactiver mon profil"}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function CoverageEditor({
  initialCities,
  initialSpeciality,
  cities,
  status,
}: {
  initialCities: string[];
  initialSpeciality: string;
  cities: City[];
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>(initialCities);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const disabled = status === "SUSPENDED";

  function toggle(slug: string) {
    setSelected((p) =>
      p.includes(slug) ? p.filter((x) => x !== slug) : [...p, slug],
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDone(false);
    const form = new FormData(e.currentTarget);
    for (const s of selected) form.append("cityCoverage", s);
    startTransition(async () => {
      const res = await updateMyCoverage(form);
      if (res.ok) {
        setDone(true);
        router.refresh();
        setTimeout(() => setDone(false), 2500);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <details className="rounded-2xl border border-midnight/10 bg-cream p-5 open:bg-cream">
      <summary className="cursor-pointer text-sm font-semibold text-midnight">
        Modifier ma couverture
      </summary>
      {disabled ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Profil suspendu — modification impossible.
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-4 space-y-3"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="speciality">Spécialité</Label>
            <Select
              id="speciality"
              name="speciality"
              defaultValue={initialSpeciality}
            >
              <option value="LOCATION">Location</option>
              <option value="VENTE">Vente</option>
              <option value="BOTH">Les deux</option>
            </Select>
          </div>
          <div>
            <Label>Villes couvertes</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {cities.map((c) => {
                const active = selected.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => toggle(c.slug)}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${
                      active
                        ? "bg-terracotta text-cream"
                        : "border border-midnight/20 text-midnight hover:border-midnight"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
          {error && (
            <p className="text-xs text-danger" role="alert">
              {error}
            </p>
          )}
          {done && (
            <p className="text-xs text-forest">✓ Enregistré.</p>
          )}
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "…" : "Enregistrer"}
          </Button>
        </form>
      )}
    </details>
  );
}
