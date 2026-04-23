"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { upsertCraftsmanProfile } from "@/actions/craftsmen";
import { CITIES } from "@/data/cities";

const SPECIALITY_OPTIONS = [
  { value: "PLOMBERIE", label: "Plomberie" },
  { value: "ELECTRICITE", label: "Électricité" },
  { value: "PEINTURE", label: "Peinture" },
  { value: "MACONNERIE", label: "Maçonnerie" },
  { value: "SERRURERIE", label: "Serrurerie" },
  { value: "MENUISERIE", label: "Menuiserie" },
  { value: "CLIMATISATION", label: "Climatisation" },
  { value: "NETTOYAGE", label: "Nettoyage" },
  { value: "JARDINAGE", label: "Jardinage" },
  { value: "MULTITRAVAUX", label: "Multi-travaux" },
  { value: "AUTRE", label: "Autre" },
];

type Initial = {
  displayName: string;
  speciality: string;
  description: string | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  serviceCitySlugs: string[];
  rateInfo: string | null;
  photo: string | null;
};

export function CraftsmanForm({ initial }: { initial: Initial | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await upsertCraftsmanProfile(form);
      if (res.ok) {
        router.push(`/artisans/${res.slug}`);
        router.refresh();
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <fieldset disabled={isPending} className="space-y-8">
        <section>
          <header className="border-b border-midnight/10 pb-3">
            <p className="eyebrow">01 · Identité professionnelle</p>
            <h2 className="display-lg mt-1 text-xl">Qui vous êtes</h2>
          </header>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="displayName">
                Nom affiché (vous ou votre entreprise)
              </Label>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={initial?.displayName ?? ""}
                maxLength={120}
                required
              />
              {fieldErrors.displayName && (
                <p className="text-[11px] text-danger">{fieldErrors.displayName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="speciality">Spécialité principale</Label>
              <Select
                id="speciality"
                name="speciality"
                defaultValue={initial?.speciality ?? "PLOMBERIE"}
                required
              >
                {SPECIALITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rateInfo">Tarif indicatif (optionnel)</Label>
              <Input
                id="rateInfo"
                name="rateInfo"
                defaultValue={initial?.rateInfo ?? ""}
                placeholder="150 MAD la visite, sur devis…"
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="description">Présentation (optionnel)</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={initial?.description ?? ""}
                rows={5}
                maxLength={4000}
                placeholder="Expérience, diplômes, assurance, références, style de travail…"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="photo">Photo de profil (URL publique, optionnel)</Label>
              <Input
                id="photo"
                name="photo"
                type="url"
                defaultValue={initial?.photo ?? ""}
                placeholder="https://…"
              />
            </div>
          </div>
        </section>

        <section>
          <header className="border-b border-midnight/10 pb-3">
            <p className="eyebrow">02 · Contact</p>
            <h2 className="display-lg mt-1 text-xl">Comment on vous joint</h2>
          </header>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={initial?.phone ?? ""}
                required
                placeholder="06 12 34 56 78"
              />
              {fieldErrors.phone && (
                <p className="text-[11px] text-danger">{fieldErrors.phone}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp (si différent)</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                defaultValue={initial?.whatsapp ?? ""}
                placeholder="06 12 34 56 78"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="email">Email (optionnel)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initial?.email ?? ""}
              />
            </div>
          </div>
        </section>

        <section>
          <header className="border-b border-midnight/10 pb-3">
            <p className="eyebrow">03 · Zones d'intervention</p>
            <h2 className="display-lg mt-1 text-xl">Où vous vous déplacez</h2>
          </header>
          <div className="mt-5">
            <Label htmlFor="serviceCities">Villes (cochez celles concernées)</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CITIES.map((c) => (
                <label
                  key={c.slug}
                  className="flex items-center gap-2 rounded-xl border border-midnight/10 bg-cream px-3 py-2 text-sm text-midnight"
                >
                  <input
                    type="checkbox"
                    name="serviceCitiesCheck"
                    value={c.slug}
                    defaultChecked={initial?.serviceCitySlugs?.includes(c.slug)}
                    className="h-4 w-4 accent-terracotta"
                    onChange={(e) => {
                      // On met à jour un input hidden CSV pour que l'action
                      // reçoive une seule chaîne (compat avec le schéma
                      // actuel `serviceCities`).
                      const form = e.currentTarget.form;
                      if (!form) return;
                      const checks = form.querySelectorAll<HTMLInputElement>(
                        'input[name="serviceCitiesCheck"]:checked',
                      );
                      const hidden = form.querySelector<HTMLInputElement>(
                        'input[name="serviceCities"]',
                      );
                      if (hidden) {
                        hidden.value = Array.from(checks)
                          .map((c) => c.value)
                          .join(",");
                      }
                    }}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
            <input
              type="hidden"
              name="serviceCities"
              defaultValue={initial?.serviceCitySlugs?.join(",") ?? ""}
            />
          </div>
        </section>

        {error && (
          <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-midnight/10 pt-6">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending
              ? "…"
              : initial
                ? "Mettre à jour le profil"
                : "Publier mon profil"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
