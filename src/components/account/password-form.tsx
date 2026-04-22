"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { changePassword } from "@/actions/profile";

export function PasswordForm() {
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
    const payload = {
      current: String(form.get("current") ?? ""),
      next: String(form.get("next") ?? ""),
      confirm: String(form.get("confirm") ?? ""),
    };
    startTransition(async () => {
      const res = await changePassword(payload);
      if (res.ok) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="pw-current">Mot de passe actuel</Label>
        <Input id="pw-current" name="current" type="password" required autoComplete="current-password" />
        {fieldErrors.current && <p className="text-[11px] text-danger">{fieldErrors.current}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pw-next">Nouveau mot de passe</Label>
        <Input
          id="pw-next"
          name="next"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {fieldErrors.next && <p className="text-[11px] text-danger">{fieldErrors.next}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pw-confirm">Confirmation</Label>
        <Input
          id="pw-confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {fieldErrors.confirm && <p className="text-[11px] text-danger">{fieldErrors.confirm}</p>}
      </div>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-full bg-forest/10 px-3 py-2 text-xs text-forest" role="status">
          Mot de passe mis à jour.
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Mise à jour…" : "Changer mon mot de passe"}
      </Button>
    </form>
  );
}
