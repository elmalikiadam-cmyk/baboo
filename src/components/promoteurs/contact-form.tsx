"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { submitPromoterInquiry } from "@/actions/promoter-inquiry";

export function PromoterContactForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitPromoterInquiry(form);
      if (res.ok) {
        setDone(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(res.error);
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-forest/30 bg-forest/5 p-8 text-center">
        <p className="display-lg text-xl text-forest">✓ Demande reçue</p>
        <p className="mt-3 text-sm text-midnight">
          Notre équipe commerciale vous contactera dans les 48 h ouvrées.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Nom du promoteur / société</Label>
          <Input id="companyName" name="companyName" required maxLength={140} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactName">Votre nom</Label>
          <Input id="contactName" name="contactName" required maxLength={140} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email professionnel</Label>
          <Input id="email" name="email" type="email" required maxLength={200} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" type="tel" required maxLength={40} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="projectCount">Projets en cours</Label>
          <Select id="projectCount" name="projectCount" defaultValue="1-2">
            <option value="1-2">1 à 2 projets</option>
            <option value="3-5">3 à 5 projets</option>
            <option value="6+">6+ projets</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="teamSize">Équipe commerciale</Label>
          <Select id="teamSize" name="teamSize" defaultValue="1-3">
            <option value="0">Externalisée</option>
            <option value="1-3">1 à 3 commerciaux</option>
            <option value="4-10">4 à 10 commerciaux</option>
            <option value="10+">10+ commerciaux</option>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="budget">Budget marketing mensuel actuel</Label>
        <Select id="budget" name="budget" defaultValue="lt-20">
          <option value="lt-20">Moins de 20 000 MAD</option>
          <option value="20-50">20 000 à 50 000 MAD</option>
          <option value="50-100">50 000 à 100 000 MAD</option>
          <option value="gt-100">Plus de 100 000 MAD</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Votre projet en quelques mots</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          maxLength={2000}
          placeholder="Type de biens, localisation, délai de commercialisation, besoins spécifiques…"
        />
      </div>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-midnight/10 pt-6">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Envoi…" : "Envoyer ma demande"}
        </Button>
        <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Réponse sous 48 h ouvrées
        </p>
      </div>
    </form>
  );
}
