"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { submitAgentApplication } from "@/actions/agent-applications";

type City = { slug: string; name: string };

export function AgentApplicationForm({ cities }: { cities: City[] }) {
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
    for (const s of selected) form.append("citySlugs", s);
    startTransition(async () => {
      const res = await submitAgentApplication(form);
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-forest/30 bg-forest/5 p-8 text-center">
        <p className="display-md text-lg text-forest">✓ Candidature reçue</p>
        <p className="mt-3 text-sm text-midnight">
          Notre équipe revient vers vous sous 5 jours ouvrés. Si votre
          profil correspond, nous vous proposerons un entretien et la
          formation Baboo.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-midnight/10 bg-cream p-6 md:p-8"
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" name="name" required maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" type="tel" required maxLength={40} />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="speciality">Spécialité</Label>
          <Select id="speciality" name="speciality" defaultValue="LOCATION">
            <option value="LOCATION">Location uniquement</option>
            <option value="VENTE">Vente uniquement</option>
            <option value="BOTH">Location et vente</option>
          </Select>
        </div>
      </div>

      <div>
        <Label>Villes que vous pouvez couvrir</Label>
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

      <div className="space-y-1.5">
        <Label htmlFor="experience">Votre expérience (optionnel)</Label>
        <Textarea
          id="experience"
          name="experience"
          rows={4}
          maxLength={2000}
          placeholder="Années d'activité, secteur d'origine, motivations…"
        />
      </div>

      <label className="flex items-start gap-3 rounded-xl bg-white p-4 text-xs text-midnight">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 h-4 w-4 accent-terracotta"
        />
        <span>
          J'accepte d'être contacté par Baboo dans le cadre du processus
          de recrutement. Mes données sont conservées 12 mois maximum.
        </span>
      </label>

      {error && (
        <p
          className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Envoi…" : "Envoyer ma candidature"}
      </Button>
    </form>
  );
}
