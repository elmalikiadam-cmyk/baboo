"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { createVisitAgent, updateVisitAgent } from "@/actions/visit-agents";

type City = { slug: string; name: string };

export function AgentCreateForm({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(slug: string) {
    setSelected((p) =>
      p.includes(slug) ? p.filter((x) => x !== slug) : [...p, slug],
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    for (const s of selected) form.append("cityCoverage", s);
    startTransition(async () => {
      const res = await createVisitAgent(form);
      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        setSelected([]);
        setDone(true);
        router.refresh();
        setTimeout(() => setDone(false), 3000);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-midnight/10 bg-cream p-5"
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" name="name" required maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" type="tel" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="speciality">Spécialité</Label>
          <Select id="speciality" name="speciality" defaultValue="LOCATION">
            <option value="LOCATION">Location</option>
            <option value="VENTE">Vente</option>
            <option value="BOTH">Les deux</option>
          </Select>
        </div>
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
        <p
          className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger"
          role="alert"
        >
          {error}
        </p>
      )}
      {done && (
        <p className="rounded-full bg-forest/10 px-3 py-2 text-xs text-forest">
          ✓ Agent ajouté.
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "…" : "Créer l'agent"}
      </Button>
    </form>
  );
}

export function AgentEditForm({
  profileId,
  initialSpeciality,
  initialCities,
  initialStatus,
  cities,
}: {
  profileId: string;
  initialSpeciality: string;
  initialCities: string[];
  initialStatus: string;
  cities: City[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(initialCities);

  function toggle(slug: string) {
    setSelected((p) =>
      p.includes(slug) ? p.filter((x) => x !== slug) : [...p, slug],
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    for (const s of selected) form.append("cityCoverage", s);
    startTransition(async () => {
      const res = await updateVisitAgent(form);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <input type="hidden" name="profileId" value={profileId} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`speciality-${profileId}`}>Spécialité</Label>
          <Select
            id={`speciality-${profileId}`}
            name="speciality"
            defaultValue={initialSpeciality}
          >
            <option value="LOCATION">Location</option>
            <option value="VENTE">Vente</option>
            <option value="BOTH">Les deux</option>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`status-${profileId}`}>Statut</Label>
          <Select
            id={`status-${profileId}`}
            name="status"
            defaultValue={initialStatus}
          >
            <option value="ACTIVE">Actif</option>
            <option value="INACTIVE">Inactif</option>
            <option value="SUSPENDED">Suspendu</option>
          </Select>
        </div>
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
        <p
          className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger"
          role="alert"
        >
          {error}
        </p>
      )}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "…" : "Enregistrer"}
      </Button>
    </form>
  );
}
