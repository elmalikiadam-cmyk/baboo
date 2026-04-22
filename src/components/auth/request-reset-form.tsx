"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { requestPasswordReset } from "@/actions/password-reset";

export function RequestResetForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await requestPasswordReset({ email: String(form.get("email") ?? "") });
      if (res.ok) setMessage(res.message ?? "Email envoyé.");
      else setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="r-email">Email</Label>
        <Input id="r-email" name="email" type="email" required autoComplete="email" />
      </div>
      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-full bg-forest/10 px-3 py-2 text-xs text-forest" role="status">
          {message}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Envoi…" : "Envoyer le lien"}
      </Button>
      <p className="text-center text-sm text-muted">
        <Link href="/connexion" className="underline-offset-4 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
