"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createVisitSlot } from "@/actions/visits";

export function SlotCreateForm({ listingId }: { listingId: string }) {
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
      const res = await createVisitSlot(form);
      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  // Helpers pour des valeurs par défaut raisonnables : demain 10h → 11h
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const defaultEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000);

  function toLocalInput(d: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-midnight/10 bg-cream p-5"
      noValidate
    >
      <input type="hidden" name="listingId" value={listingId} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startsAt">Début</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={toLocalInput(tomorrow)}
            required
          />
          {fieldErrors.startsAt && (
            <p className="text-[11px] text-danger">{fieldErrors.startsAt}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endsAt">Fin</Label>
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={toLocalInput(defaultEnd)}
            required
          />
          {fieldErrors.endsAt && (
            <p className="text-[11px] text-danger">{fieldErrors.endsAt}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxBookings">Places (1 = visite privée)</Label>
          <Input
            id="maxBookings"
            name="maxBookings"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            required
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="internalNote">
            Note interne (optionnel, non visible par le candidat)
          </Label>
          <Textarea
            id="internalNote"
            name="internalNote"
            rows={2}
            maxLength={1000}
            placeholder="Code porte, points d'attention…"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Création…" : "Ajouter ce créneau"}
        </Button>
      </div>
    </form>
  );
}
