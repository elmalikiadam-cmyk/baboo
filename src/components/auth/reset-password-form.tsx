"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { resetPassword } from "@/actions/password-reset";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setFieldErrors({});
    const payload = {
      token,
      password: String(form.get("password") ?? ""),
      confirm: String(form.get("confirm") ?? ""),
    };
    startTransition(async () => {
      const res = await resetPassword(payload);
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/connexion"), 1500);
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  if (success) {
    return (
      <p className="rounded-md bg-forest/10 p-4 text-center text-sm text-forest">
        Mot de passe mis à jour. Redirection vers la connexion…
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="rp-pwd">Nouveau mot de passe</Label>
        <Input id="rp-pwd" name="password" type="password" required minLength={8} autoComplete="new-password" />
        {fieldErrors.password && <p className="text-[11px] text-danger">{fieldErrors.password}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rp-cfm">Confirmation</Label>
        <Input id="rp-cfm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
        {fieldErrors.confirm && <p className="text-[11px] text-danger">{fieldErrors.confirm}</p>}
      </div>
      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Mise à jour…" : "Valider"}
      </Button>
    </form>
  );
}
