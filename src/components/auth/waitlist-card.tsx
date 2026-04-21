"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { CheckIcon } from "@/components/ui/icons";
import { submitLead } from "@/actions/leads";

interface Props {
  kind: "connexion" | "inscription";
}

export function WaitlistCard({ kind }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    const email = String(form.get("email") ?? "").trim();
    if (!email) {
      setError("Merci d'indiquer votre email.");
      return;
    }
    startTransition(async () => {
      const res = await submitLead({
        source: "general",
        name: email.split("@")[0] || "Waitlist",
        email,
        message: `Waitlist ${kind} — inscription pour être prévenu du lancement des comptes.`,
      });
      if (res.ok) setSubmitted(true);
      else setError(res.error);
    });
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-success/30 bg-success/5 p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h2 className="display-xl mt-4 text-2xl">Inscrit à la liste.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          On vous prévient dès que les comptes sont disponibles.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">Votre email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="vous@email.ma" />
      </div>
      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Envoi…" : "Me prévenir"}
      </Button>
    </form>
  );
}
