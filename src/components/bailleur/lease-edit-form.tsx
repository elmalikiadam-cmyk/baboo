"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { updateLeaseDraft } from "@/actions/leases";

const FURNISHING_OPTIONS = [
  { value: "UNFURNISHED", label: "Non meublé" },
  { value: "FURNISHED", label: "Meublé" },
  { value: "SEMI_FURNISHED", label: "Semi-meublé" },
];

export type LeaseInitial = {
  monthlyRent: number;
  monthlyCharges: number;
  depositAmount: number;
  paymentDay: number;
  startDate: Date;
  endDate: Date | null;
  noticePeriodDays: number;
  furnishing: string;
  propertyAddress: string;
  propertyCity: string;
  propertySurface: number;
  specialClauses: string | null;
};

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function LeaseEditForm({
  leaseId,
  initial,
}: {
  leaseId: string;
  initial: LeaseInitial;
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
      const res = await updateLeaseDraft(leaseId, form);
      if (res.ok) {
        setSaved(true);
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
            <p className="eyebrow">Termes financiers</p>
            <h2 className="display-lg mt-1 text-xl">Loyer, charges, caution</h2>
          </header>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="monthlyRent">Loyer mensuel (MAD)</Label>
              <Input
                id="monthlyRent"
                name="monthlyRent"
                type="number"
                min={0}
                defaultValue={initial.monthlyRent}
                required
              />
              {fieldErrors.monthlyRent && (
                <p className="text-[11px] text-danger">{fieldErrors.monthlyRent}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="monthlyCharges">Charges (MAD)</Label>
              <Input
                id="monthlyCharges"
                name="monthlyCharges"
                type="number"
                min={0}
                defaultValue={initial.monthlyCharges}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="depositAmount">Caution (MAD)</Label>
              <Input
                id="depositAmount"
                name="depositAmount"
                type="number"
                min={0}
                defaultValue={initial.depositAmount}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paymentDay">Jour de paiement (1-28)</Label>
              <Input
                id="paymentDay"
                name="paymentDay"
                type="number"
                min={1}
                max={28}
                defaultValue={initial.paymentDay}
                required
              />
            </div>
          </div>
        </section>

        <section>
          <header className="border-b border-midnight/10 pb-3">
            <p className="eyebrow">Durée</p>
            <h2 className="display-lg mt-1 text-xl">Début, fin, préavis</h2>
          </header>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={toDateInput(initial.startDate)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">Date de fin (laisser vide = indéterminé)</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={toDateInput(initial.endDate)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="noticePeriodDays">Préavis (jours)</Label>
              <Input
                id="noticePeriodDays"
                name="noticePeriodDays"
                type="number"
                min={30}
                max={365}
                defaultValue={initial.noticePeriodDays}
              />
              <p className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                Standard loi 67-12 : 90 jours
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="furnishing">Ameublement</Label>
              <Select
                id="furnishing"
                name="furnishing"
                defaultValue={initial.furnishing}
              >
                {FURNISHING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </section>

        <section>
          <header className="border-b border-midnight/10 pb-3">
            <p className="eyebrow">Bien loué</p>
            <h2 className="display-lg mt-1 text-xl">Adresse et surface</h2>
          </header>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="propertyAddress">Adresse complète</Label>
              <Input
                id="propertyAddress"
                name="propertyAddress"
                defaultValue={initial.propertyAddress}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="propertyCity">Ville</Label>
              <Input
                id="propertyCity"
                name="propertyCity"
                defaultValue={initial.propertyCity}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="propertySurface">Surface (m²)</Label>
              <Input
                id="propertySurface"
                name="propertySurface"
                type="number"
                min={1}
                defaultValue={initial.propertySurface}
                required
              />
            </div>
          </div>
        </section>

        <section>
          <header className="border-b border-midnight/10 pb-3">
            <p className="eyebrow">Clauses particulières (optionnel)</p>
            <h2 className="display-lg mt-1 text-xl">Spécificités à intégrer</h2>
          </header>
          <div className="mt-5">
            <Textarea
              name="specialClauses"
              rows={6}
              maxLength={10_000}
              defaultValue={initial.specialClauses ?? ""}
              placeholder="Ex : interdiction d'animaux domestiques, autorisation de sous-louer ponctuellement, modalités de révision du loyer à l'anniversaire…"
            />
          </div>
        </section>

        {error && (
          <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-full bg-forest/10 px-3 py-2 text-xs text-forest" role="status">
            ✓ Brouillon enregistré.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-midnight/10 pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement…" : "Enregistrer le brouillon"}
          </Button>
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            ○ Générez le PDF dans le panneau de droite une fois prêt
          </p>
        </div>
      </fieldset>
    </form>
  );
}
