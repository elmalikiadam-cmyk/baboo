"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { CITIES } from "@/data/cities";
import { updateAgency } from "@/actions/profile";

interface Initial {
  name: string;
  tagline: string;
  description: string;
  logo: string;
  cover: string;
  phone: string;
  email: string;
  website: string;
  citySlug: string;
}

export function AgencyForm({ initial, verified }: { initial: Initial; verified: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSuccess(false);
    setError(null);
    setFieldErrors({});
    const payload: Record<string, string> = {};
    for (const key of Object.keys(initial) as (keyof Initial)[]) {
      payload[key] = String(form.get(key) ?? "");
    }
    startTransition(async () => {
      const res = await updateAgency(payload);
      if (res.ok) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <section>
        <div className="border-b border-foreground/10 pb-3">
          <p className="eyebrow">/01</p>
          <h2 className="display-lg mt-1 text-xl">Identité</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Nom de l'agence" error={fieldErrors.name}>
            <Input name="name" required defaultValue={initial.name} />
          </Field>
          <Field label="Ville principale" error={fieldErrors.citySlug}>
            <Select name="citySlug" defaultValue={initial.citySlug}>
              <option value="">— Non précisée —</option>
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-4">
          <Field
            label="Accroche"
            error={fieldErrors.tagline}
            hint="Une phrase courte qui résume votre positionnement."
          >
            <Input name="tagline" defaultValue={initial.tagline} placeholder="Immobilier résidentiel à Casablanca depuis 2008" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Description" error={fieldErrors.description}>
            <textarea
              name="description"
              rows={5}
              defaultValue={initial.description}
              placeholder="Parcours, zones couvertes, philosophie…"
              className="w-full rounded-md border border-foreground/15 bg-background p-4 text-sm focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/10"
            />
          </Field>
        </div>
      </section>

      <section>
        <div className="border-b border-foreground/10 pb-3">
          <p className="eyebrow">/02</p>
          <h2 className="display-lg mt-1 text-xl">Visuels</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Logo (URL)" error={fieldErrors.logo}>
            <Input name="logo" type="url" defaultValue={initial.logo} placeholder="https://…/logo.png" />
          </Field>
          <Field label="Bannière (URL)" error={fieldErrors.cover}>
            <Input name="cover" type="url" defaultValue={initial.cover} placeholder="https://…/cover.jpg" />
          </Field>
        </div>
      </section>

      <section>
        <div className="border-b border-foreground/10 pb-3">
          <p className="eyebrow">/03</p>
          <h2 className="display-lg mt-1 text-xl">Contact public</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field label="Email" error={fieldErrors.email}>
            <Input name="email" type="email" defaultValue={initial.email} placeholder="contact@agence.ma" />
          </Field>
          <Field label="Téléphone" error={fieldErrors.phone}>
            <Input name="phone" type="tel" defaultValue={initial.phone} placeholder="+212 5 22 …" />
          </Field>
          <Field label="Site web" error={fieldErrors.website}>
            <Input name="website" type="url" defaultValue={initial.website} placeholder="https://…" />
          </Field>
        </div>
      </section>

      <section className="rounded-md border border-foreground/10 bg-surface p-5">
        <p className="eyebrow">Vérification</p>
        <p className="mt-2 text-sm">
          {verified ? (
            <>
              <span className="mono mr-2 inline-flex rounded-full bg-success/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-success">
                Vérifiée
              </span>
              Votre agence affiche le badge vérifié sur toutes ses annonces.
            </>
          ) : (
            <>
              <span className="mono mr-2 inline-flex rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                En attente
              </span>
              Pour obtenir le badge vérifié, envoyez-nous votre RC, ICE et patente via le formulaire
              de contact.
            </>
          )}
        </p>
      </section>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-full bg-success/10 px-3 py-2 text-xs text-success" role="status">
          Profil enregistré.
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-foreground/15 pt-6">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  );
}
