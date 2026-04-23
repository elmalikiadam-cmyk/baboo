"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { addAgencyMember } from "@/actions/agency-team";

export function TeamInviteForm({
  agencyId,
  canPromoteManager,
}: {
  agencyId: string;
  canPromoteManager: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setDone(false);
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addAgencyMember(agencyId, form);
      if (res.ok) {
        setDone(true);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="invite-email">Email du collaborateur</Label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          required
          placeholder="agent@exemple.ma"
        />
        {fieldErrors.email && (
          <p className="text-[11px] text-danger">{fieldErrors.email}</p>
        )}
        <p className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          La personne doit déjà avoir un compte Baboo
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="invite-role">Rôle</Label>
        <Select id="invite-role" name="role" defaultValue="AGENT" required>
          <option value="AGENT">Agent</option>
          {canPromoteManager && <option value="MANAGER">Manager</option>}
          {canPromoteManager && <option value="OWNER">Owner</option>}
        </Select>
      </div>
      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {done && (
        <p className="rounded-full bg-forest/10 px-3 py-1.5 text-xs text-forest" role="status">
          ✓ Membre ajouté.
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Ajout…" : "Ajouter à l'équipe"}
      </Button>
    </form>
  );
}
