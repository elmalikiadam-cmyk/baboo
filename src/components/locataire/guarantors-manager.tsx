"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { addGuarantor, deleteGuarantor } from "@/actions/tenant-applications";

const GUARANTOR_TYPES = [
  { value: "PARENT", label: "Parent / famille" },
  { value: "EMPLOYEUR", label: "Employeur" },
  { value: "PROCHE", label: "Proche" },
  { value: "ENTREPRISE", label: "Entreprise garante" },
  { value: "AUTRE", label: "Autre" },
];

const EMPLOYMENT = [
  { value: "", label: "—" },
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "FONCTIONNAIRE", label: "Fonctionnaire" },
  { value: "INDEPENDANT", label: "Indépendant" },
  { value: "RETRAITE", label: "Retraité" },
  { value: "AUTRE", label: "Autre" },
];

export type GuarantorLite = {
  id: string;
  type: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  monthlyIncome: number | null;
  employment: string | null;
  employer: string | null;
};

export function GuarantorsManager({
  guarantors,
}: {
  guarantors: GuarantorLite[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-midnight/10 pb-3">
        <div>
          <p className="eyebrow">Garants (optionnel)</p>
          <h2 className="display-lg mt-1 text-xl">
            {guarantors.length === 0
              ? "Aucun garant enregistré"
              : `${guarantors.length} garant${guarantors.length > 1 ? "s" : ""}`}
          </h2>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-full border border-midnight/30 px-4 py-2 text-xs font-medium text-midnight hover:border-midnight"
          >
            + Ajouter un garant
          </button>
        )}
      </header>

      {guarantors.length > 0 && (
        <ul className="mt-5 space-y-3">
          {guarantors.map((g) => (
            <GuarantorRow key={g.id} g={g} />
          ))}
        </ul>
      )}

      {adding && (
        <AddGuarantorForm
          onDone={() => setAdding(false)}
          onCancel={() => setAdding(false)}
        />
      )}
    </section>
  );
}

function GuarantorRow({ g }: { g: GuarantorLite }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm(`Supprimer le garant « ${g.fullName} » ?`)) return;
    startTransition(async () => {
      await deleteGuarantor(g.id);
      router.refresh();
    });
  }

  return (
    <li className="rounded-xl border border-midnight/10 bg-cream p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="display-lg text-base">{g.fullName}</p>
          <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {g.type}
            {g.relationship && ` · ${g.relationship}`}
            {g.monthlyIncome != null && ` · ${g.monthlyIncome.toLocaleString("fr-FR")} MAD/mois`}
          </p>
          {(g.email || g.phone) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {g.email}
              {g.email && g.phone && " · "}
              {g.phone}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          className="shrink-0 rounded-full border border-midnight/20 px-3 py-1 text-[11px] font-medium text-midnight hover:border-danger hover:text-danger"
        >
          {isPending ? "…" : "Retirer"}
        </button>
      </div>
    </li>
  );
}

function AddGuarantorForm({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel: () => void;
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
      const res = await addGuarantor(form);
      if (res.ok) {
        onDone();
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
      className="mt-5 space-y-4 rounded-2xl border border-midnight/10 bg-cream p-5"
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="g-type">Type de garant</Label>
          <Select id="g-type" name="type" defaultValue="PARENT" required>
            {GUARANTOR_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-fullName">Nom complet</Label>
          <Input id="g-fullName" name="fullName" required />
          {fieldErrors.fullName && (
            <p className="text-[11px] text-danger">{fieldErrors.fullName}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-relationship">Lien avec vous (optionnel)</Label>
          <Input id="g-relationship" name="relationship" placeholder="père, oncle, employeur…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-email">Email (optionnel)</Label>
          <Input id="g-email" name="email" type="email" />
          {fieldErrors.email && <p className="text-[11px] text-danger">{fieldErrors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-phone">Téléphone (optionnel)</Label>
          <Input id="g-phone" name="phone" type="tel" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-monthlyIncome">Revenus (MAD/mois)</Label>
          <Input id="g-monthlyIncome" name="monthlyIncome" type="number" min={0} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-employment">Statut pro</Label>
          <Select id="g-employment" name="employment" defaultValue="">
            {EMPLOYMENT.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-employer">Employeur (optionnel)</Label>
          <Input id="g-employer" name="employer" />
        </div>
      </div>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Ajout…" : "Ajouter le garant"}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-full border border-midnight/20 px-5 py-2 text-sm font-medium text-midnight"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
