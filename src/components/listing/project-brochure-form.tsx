"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { submitLead } from "@/actions/leads";

interface Props {
  projectId: string;
  projectName: string;
}

export function ProjectBrochureForm({ projectId, projectName }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setFieldErrors({});

    const payload = {
      projectId,
      source: "project" as const,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      message: `Demande de brochure pour ${projectName}.`,
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

  return (
    <aside className="sticky top-24 h-fit rounded-md border border-foreground/15 bg-surface p-6">
      <p className="eyebrow">Demande de brochure</p>
      <h3 className="display-lg mt-2 text-xl">Recevez le dossier complet.</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Plans, prix détaillés, conditions commerciales. Réponse sous 24 h.
      </p>

      {submitted ? (
        <div className="mt-5 rounded-md border border-success/30 bg-success/5 p-5 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success">
            <CheckIcon className="h-5 w-5" />
          </span>
          <h4 className="display-lg mt-3 text-lg">Demande enregistrée.</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Le promoteur vous envoie la brochure par email dans la journée.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-3" noValidate>
          <BrochureField name="name" placeholder="Nom complet" required error={fieldErrors.name} />
          <BrochureField name="email" type="email" placeholder="Email" required error={fieldErrors.email} />
          <BrochureField name="phone" type="tel" placeholder="Téléphone" error={fieldErrors.phone} />

          {error && (
            <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>
          )}

          <Button size="lg" className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Envoi…" : "Recevoir la brochure"}
          </Button>
        </form>
      )}

      <p className="mt-4 mono text-[10px] text-muted-foreground">
        ○ RÉPONSE &lt; 24H · ○ DOSSIER COMPLET · ○ SANS ENGAGEMENT
      </p>
    </aside>
  );
}

function BrochureField({
  name,
  type = "text",
  placeholder,
  required = false,
  error,
}: {
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-full border border-foreground/15 bg-background px-4 text-sm focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/10"
      />
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
}
