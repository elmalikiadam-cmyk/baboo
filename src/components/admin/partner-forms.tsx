"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createPartnerAgency, topUpPartner } from "@/actions/partners";

type City = { slug: string; name: string };

export function PartnerCreateForm({ cities }: { cities: City[] }) {
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
    setDone(false);
    const form = new FormData(e.currentTarget);
    for (const s of selected) form.append("citySlugs", s);
    startTransition(async () => {
      const res = await createPartnerAgency(form);
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
          <Label htmlFor="name">Nom de l'agence</Label>
          <Input id="name" name="name" required maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactName">Contact</Label>
          <Input id="contactName" name="contactName" required maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactEmail">Email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactPhone">Téléphone</Label>
          <Input id="contactPhone" name="contactPhone" type="tel" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="initialCredit">Solde initial (MAD)</Label>
          <Input
            id="initialCredit"
            name="initialCredit"
            type="number"
            min={0}
            defaultValue={0}
          />
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
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {done && (
        <p className="rounded-full bg-forest/10 px-3 py-2 text-xs text-forest">
          ✓ Partenaire créé.
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "…" : "Créer le partenaire"}
      </Button>
    </form>
  );
}

export function PartnerTopUpButton({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    const raw = prompt("Montant à créditer (MAD) ?");
    if (!raw) return;
    const amount = Number.parseInt(raw, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Montant invalide.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await topUpPartner(partnerId, amount);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="inline-flex h-9 items-center rounded-full border border-midnight/20 px-4 text-xs font-semibold text-midnight hover:border-midnight"
      >
        {isPending ? "…" : "Créditer le solde"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
