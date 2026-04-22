"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { CheckIcon } from "@/components/ui/icons";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL } from "@/data/taxonomy";
import { submitLead } from "@/actions/leads";

const TRANSACTIONS = [
  { value: "SALE", label: "Vente" },
  { value: "RENT", label: "Location" },
];

export function PublishForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setFieldErrors({});

    const type = String(form.get("propertyType") ?? "");
    const transaction = String(form.get("transaction") ?? "");
    const city = String(form.get("city") ?? "");
    const surface = String(form.get("surface") ?? "");
    const price = String(form.get("price") ?? "");
    const notes = String(form.get("notes") ?? "");

    const message = [
      `Bien à publier : ${PROPERTY_TYPE_LABEL[type as never] ?? type}`,
      `Transaction : ${transaction === "RENT" ? "Location" : "Vente"}`,
      `Ville : ${CITIES.find((c) => c.slug === city)?.name ?? city}`,
      surface && `Surface : ${surface} m²`,
      price && `Prix : ${price} MAD`,
      notes && `\nNotes : ${notes}`,
    ]
      .filter(Boolean)
      .join("\n");

    const payload = {
      source: "publication-interest" as const,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      message,
    };

    startTransition(async () => {
      const res = await submitLead(payload);
      if (res.ok) setSubmitted(true);
      else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-forest/30 bg-forest/5 p-10 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest/15 text-forest">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h2 className="display-xl mt-4 text-3xl md:text-4xl">Demande reçue.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          L'équipe Baboo vous contacte sous 24 h ouvrées pour organiser la publication : photos, description, prix.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10" noValidate>
      {/* Bien */}
      <section>
        <header className="border-b border-midnight/10 pb-3">
          <p className="eyebrow">01 · Le bien</p>
          <h2 className="display-lg mt-1 text-xl">Quelques infos de base</h2>
        </header>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="propertyType">Type de bien</Label>
            <Select id="propertyType" name="propertyType" defaultValue="APARTMENT" required>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PROPERTY_TYPE_LABEL[t]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transaction">Transaction</Label>
            <Select id="transaction" name="transaction" defaultValue="SALE" required>
              {TRANSACTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Ville</Label>
            <Select id="city" name="city" defaultValue="casablanca" required>
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="surface">Surface (m²)</Label>
            <Input id="surface" name="surface" type="number" min={1} placeholder="120" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="price">Prix souhaité (MAD)</Label>
            <Input id="price" name="price" type="number" min={0} placeholder="2 500 000" />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <header className="border-b border-midnight/10 pb-3">
          <p className="eyebrow">02 · Vos coordonnées</p>
          <h2 className="display-lg mt-1 text-xl">Pour qu'on vous rappelle</h2>
        </header>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" name="name" required autoComplete="name" />
            {fieldErrors.name && <p className="text-[11px] text-danger">{fieldErrors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
            {fieldErrors.email && <p className="text-[11px] text-danger">{fieldErrors.email}</p>}
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+212 6 00 00 00 00" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Dispo pour les photos, points forts du bien, délai souhaité…"
              className="w-full rounded-md border border-border bg-cream p-4 text-sm focus-visible:border-midnight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-midnight/10"
            />
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Envoi…" : "Envoyer la demande"}
        </Button>
        <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted">
          ○ Réponse sous 24 h ouvrées
        </p>
      </div>
    </form>
  );
}
