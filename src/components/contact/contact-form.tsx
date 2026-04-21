"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { CheckIcon } from "@/components/ui/icons";
import { submitLead } from "@/actions/leads";

const SUBJECT_PREFIX: Record<string, string> = {
  general: "Question générale",
  listing: "Question sur une annonce",
  pro: "Espace Pro / partenariat",
  bug: "Signaler un problème",
  press: "Presse",
};

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setFieldErrors({});

    const subject = String(form.get("subject") ?? "general");
    const message = String(form.get("message") ?? "");

    const payload = {
      source: "general" as const,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      message: `[${SUBJECT_PREFIX[subject] ?? subject}]\n\n${message}`,
    };

    startTransition(async () => {
      const res = await submitLead(payload);
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-success/30 bg-success/5 p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h3 className="display-xl mt-4 text-2xl md:text-3xl">Message reçu.</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          On vous répond dans la journée, du lundi au vendredi.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" name="name" required />
          {fieldErrors.name && <p className="text-[11px] text-danger">{fieldErrors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
          {fieldErrors.email && <p className="text-[11px] text-danger">{fieldErrors.email}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">Sujet</Label>
        <Select id="subject" name="subject" defaultValue="general">
          <option value="general">Question générale</option>
          <option value="listing">Question sur une annonce</option>
          <option value="pro">Espace Pro / partenariat</option>
          <option value="bug">Signaler un problème</option>
          <option value="press">Presse</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Votre message</Label>
        <textarea
          id="message"
          name="message"
          rows={7}
          className="w-full rounded-2xl border border-foreground/15 bg-background p-4 text-sm focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/10"
          placeholder="Racontez-nous ce qu'on peut faire pour vous."
          required
        />
        {fieldErrors.message && <p className="text-[11px] text-danger">{fieldErrors.message}</p>}
      </div>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Envoi…" : "Envoyer"}
      </Button>

      <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        ○ Réponse garantie sous 24h ouvrées
      </p>
    </form>
  );
}
