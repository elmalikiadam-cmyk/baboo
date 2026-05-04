"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createVisitSlot } from "@/actions/visits";

/**
 * Créneau de visite. Toggle « Je fais la visite moi-même » (défaut) /
 * « Un agent Baboo fait la visite » : active le service managé. Le
 * toggle managed est grisé si le listing n'a pas de pack actif — on
 * affiche un lien « Choisir un pack ».
 */
export function SlotCreateForm({
  listingId,
  hasActivePack = false,
  remainingCredits = 0,
}: {
  listingId: string;
  hasActivePack?: boolean;
  remainingCredits?: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [managed, setManaged] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const form = new FormData(e.currentTarget);
    form.set("managedByBaboo", managed ? "1" : "");
    startTransition(async () => {
      const res = await createVisitSlot(form);
      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        setManaged(false);
        router.refresh();
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const defaultEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000);

  function toLocalInput(d: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const canManage = hasActivePack && remainingCredits > 0;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-midnight/10 bg-cream p-5"
      noValidate
    >
      <input type="hidden" name="listingId" value={listingId} />

      {/* Toggle « qui fait la visite » */}
      <div className="rounded-xl border border-midnight/10 bg-white p-4">
        <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Qui fait la visite ?
        </p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setManaged(false)}
            aria-pressed={!managed}
            className={`rounded-xl border p-3 text-left text-sm transition-colors ${
              !managed
                ? "border-midnight bg-midnight text-cream"
                : "border-midnight/20 text-midnight hover:border-midnight"
            }`}
          >
            <strong className="block">Je fais la visite moi-même</strong>
            <span className={`mono mt-1 block text-[10px] uppercase tracking-[0.12em] ${!managed ? "text-cream/80" : "text-muted-foreground"}`}>
              Gratuit · vous accueillez le candidat
            </span>
          </button>
          <button
            type="button"
            onClick={() => canManage && setManaged(true)}
            disabled={!canManage}
            aria-pressed={managed}
            aria-disabled={!canManage}
            className={`rounded-xl border p-3 text-left text-sm transition-colors ${
              managed
                ? "border-terracotta bg-terracotta text-cream"
                : canManage
                ? "border-midnight/20 text-midnight hover:border-terracotta"
                : "cursor-not-allowed border-midnight/10 text-muted-foreground opacity-60"
            }`}
          >
            <strong className="block">Un agent Baboo fait la visite</strong>
            <span className={`mono mt-1 block text-[10px] uppercase tracking-[0.12em] ${managed ? "text-cream/80" : "text-muted-foreground"}`}>
              {canManage
                ? `${remainingCredits} visite${remainingCredits > 1 ? "s" : ""} dispo`
                : "Aucun pack actif"}
            </span>
          </button>
        </div>
        {!canManage && (
          <p className="mt-3 text-xs text-muted-foreground">
            Pour activer ce mode, achetez un{" "}
            <Link
              href={`/publier/${listingId}/pack-visites`}
              className="text-terracotta hover:underline"
            >
              pack visites
            </Link>
            {" "}— à partir de 1 000 MAD pour 5 visites.
          </p>
        )}
      </div>

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
            max={managed ? 1 : 20}
            defaultValue={1}
            required
          />
          {managed && (
            <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Visites managées : 1 candidat / créneau
            </p>
          )}
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
            placeholder="Code porte, points d'attention pour l'agent…"
          />
        </div>
      </div>

      {error && (
        <p
          className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger"
          role="alert"
        >
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
