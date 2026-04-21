"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { updateProfile } from "@/actions/profile";

interface Initial {
  name: string;
  email: string;
  phone: string;
  image: string;
}

export function ProfileForm({ initial }: { initial: Initial }) {
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
    const payload = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      image: String(form.get("image") ?? ""),
    };
    startTransition(async () => {
      const res = await updateProfile(payload);
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
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="p-email">Email</Label>
        <Input id="p-email" type="email" value={initial.email} disabled readOnly />
        <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          L'email ne peut pas être modifié.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="p-name">Nom complet</Label>
        <Input id="p-name" name="name" required defaultValue={initial.name} autoComplete="name" />
        {fieldErrors.name && <p className="text-[11px] text-danger">{fieldErrors.name}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="p-phone">Téléphone</Label>
        <Input
          id="p-phone"
          name="phone"
          type="tel"
          defaultValue={initial.phone}
          autoComplete="tel"
          placeholder="+212 6 00 00 00 00"
        />
        {fieldErrors.phone && <p className="text-[11px] text-danger">{fieldErrors.phone}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="p-image">Photo de profil (URL)</Label>
        <Input
          id="p-image"
          name="image"
          type="url"
          defaultValue={initial.image}
          placeholder="https://…"
        />
        {fieldErrors.image && <p className="text-[11px] text-danger">{fieldErrors.image}</p>}
      </div>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-full bg-success/10 px-3 py-2 text-xs text-success" role="status">
          Modifications enregistrées.
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
