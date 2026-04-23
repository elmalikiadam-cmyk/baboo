"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { submitLandlordKyc } from "@/actions/landlord-kyc";

const ID_TYPES = [
  { value: "CIN", label: "Carte nationale (CIN)" },
  { value: "PASSPORT", label: "Passeport" },
  { value: "RESIDENCE_PERMIT", label: "Titre de séjour" },
];

const OWNERSHIP_TYPES = [
  { value: "TITRE_FONCIER", label: "Titre foncier" },
  { value: "ACTE_NOTARIE", label: "Acte notarié" },
  {
    value: "ATTESTATION_AYANTS_DROIT",
    label: "Attestation des ayants-droit",
  },
  { value: "MANDAT", label: "Mandat de gestion" },
  { value: "AUTRE", label: "Autre document" },
];

/**
 * Formulaire KYC bailleur — 3 documents (CIN recto, CIN verso, preuve
 * de droit) + attestation + RIB optionnel.
 */
export function KycOnboardingForm({ disabled }: { disabled?: boolean }) {
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
      const res = await submitLandlordKyc(form);
      if (res.ok) {
        router.push("/bailleur/onboarding/status");
        router.refresh();
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10" noValidate>
      <fieldset disabled={disabled || isPending} className="space-y-10">
        {/* Identité */}
        <section>
          <header className="border-b border-midnight/10 pb-3">
            <p className="eyebrow">01 · Identité</p>
            <h2 className="display-lg mt-1 text-xl">Votre pièce d'identité</h2>
          </header>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="idType">Type de document</Label>
              <Select id="idType" name="idType" defaultValue="CIN" required>
                {ID_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="idNumber">Numéro (optionnel)</Label>
              <Input id="idNumber" name="idNumber" placeholder="AB 123456" />
              {fieldErrors.idNumber && (
                <p className="text-[11px] text-danger">{fieldErrors.idNumber}</p>
              )}
            </div>
            <FileField
              id="idFront"
              name="idFront"
              label="Recto"
              error={fieldErrors.idFront}
            />
            <FileField
              id="idBack"
              name="idBack"
              label="Verso"
              error={fieldErrors.idBack}
            />
          </div>
        </section>

        {/* Droit de louer */}
        <section>
          <header className="border-b border-midnight/10 pb-3">
            <p className="eyebrow">02 · Droit de louer</p>
            <h2 className="display-lg mt-1 text-xl">Justificatif du bien</h2>
          </header>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="ownershipType">Nature du justificatif</Label>
              <Select
                id="ownershipType"
                name="ownershipType"
                defaultValue="TITRE_FONCIER"
                required
              >
                {OWNERSHIP_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <FileField
                id="ownership"
                name="ownership"
                label="Document (image ou PDF)"
                error={fieldErrors.ownership}
              />
            </div>
            <label className="md:col-span-2 flex items-start gap-3 rounded-xl border border-midnight/10 bg-cream-2 p-4 text-sm">
              <input
                type="checkbox"
                name="attestation"
                required
                className="mt-0.5 h-4 w-4 accent-terracotta"
              />
              <span className="text-midnight">
                J'atteste sur l'honneur être habilité(e) à louer ce bien et
                certifie l'exactitude des informations fournies. Toute
                fausse déclaration pourra entraîner la suspension
                immédiate du compte.
              </span>
            </label>
            {fieldErrors.attestation && (
              <p className="text-[11px] text-danger md:col-span-2">
                {fieldErrors.attestation}
              </p>
            )}
          </div>
        </section>

        {/* RIB optionnel */}
        <section>
          <header className="border-b border-midnight/10 pb-3">
            <p className="eyebrow">03 · Paiement (optionnel)</p>
            <h2 className="display-lg mt-1 text-xl">RIB et IBAN</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Requis uniquement si vous souhaitez encaisser les loyers via
              Baboo dans le futur. Vous pourrez l'ajouter plus tard.
            </p>
          </header>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FileField
                id="rib"
                name="rib"
                label="RIB (optionnel)"
                error={fieldErrors.rib}
                optional
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ibanLast4">4 derniers chiffres de l'IBAN</Label>
              <Input
                id="ibanLast4"
                name="ibanLast4"
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
              />
              {fieldErrors.ibanLast4 && (
                <p className="text-[11px] text-danger">{fieldErrors.ibanLast4}</p>
              )}
            </div>
          </div>
        </section>

        {error && (
          <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-midnight/10 pt-6">
          <Button type="submit" size="lg" disabled={disabled || isPending}>
            {isPending ? "Envoi…" : "Soumettre mon dossier"}
          </Button>
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            ○ Réponse sous 48 h ouvrées
          </p>
        </div>
      </fieldset>
    </form>
  );
}

function FileField({
  id,
  name,
  label,
  error,
  optional,
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {optional && (
          <span className="ml-2 mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            optionnel
          </span>
        )}
      </Label>
      <input
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,application/pdf"
        required={!optional}
        className="block w-full cursor-pointer rounded-xl border border-midnight/20 bg-cream px-4 py-3 text-sm text-midnight file:mr-3 file:rounded-full file:border-0 file:bg-midnight file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-cream hover:border-midnight/40"
      />
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  );
}
