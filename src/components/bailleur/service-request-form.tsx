"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { createServiceRequest } from "@/actions/service-requests";

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

export function ServiceRequestForm({
  leases,
}: {
  leases: Array<{ id: string; label: string }>;
}) {
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
      const res = await createServiceRequest(form);
      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-midnight/10 bg-cream p-5"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="title">Intitulé court</Label>
        <Input
          id="title"
          name="title"
          placeholder="Ex : Fuite sous évier cuisine"
          maxLength={140}
          required
        />
        {fieldErrors.title && (
          <p className="text-[11px] text-danger">{fieldErrors.title}</p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="speciality">Spécialité</Label>
          <Select id="speciality" name="speciality" defaultValue="PLOMBERIE" required>
            {SPECIALITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="urgency">Urgence (optionnel)</Label>
          <Input
            id="urgency"
            name="urgency"
            placeholder="Urgent, cette semaine…"
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budgetMin">Budget min (MAD)</Label>
          <Input
            id="budgetMin"
            name="budgetMin"
            type="number"
            min={0}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budgetMax">Budget max (MAD)</Label>
          <Input
            id="budgetMax"
            name="budgetMax"
            type="number"
            min={0}
          />
          {fieldErrors.budgetMax && (
            <p className="text-[11px] text-danger">{fieldErrors.budgetMax}</p>
          )}
        </div>
      </div>
      {leases.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="leaseId">Rattacher à un bail (optionnel)</Label>
          <Select id="leaseId" name="leaseId" defaultValue="">
            <option value="">Aucun</option>
            {leases.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </Select>
          <p className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Visible par les deux parties du bail
          </p>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description détaillée</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          maxLength={4000}
          required
          placeholder="Décrivez le besoin précisément : lieu, symptômes, urgence, contraintes d'accès…"
        />
        {fieldErrors.description && (
          <p className="text-[11px] text-danger">{fieldErrors.description}</p>
        )}
      </div>
      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "…" : "Publier la demande"}
      </Button>
    </form>
  );
}
