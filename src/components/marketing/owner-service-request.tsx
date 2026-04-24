"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { CITIES } from "@/data/cities";
import { requestOwnerService } from "@/actions/owner-services";

type Kind = "PHOTOS" | "CLEANING";

const LABEL: Record<Kind, string> = {
  PHOTOS: "Pack photos",
  CLEANING: "Pack ménage avant visite",
};

/**
 * Formulaire modale « Demander ce pack ». Léger, un seul champ par ligne,
 * pas de paiement en ligne V1 — l'équipe ops contacte sous 24 h.
 */
export function OwnerServiceRequestTrigger({ kind }: { kind: Kind }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 inline-flex h-11 items-center rounded-full bg-midnight px-5 text-sm font-semibold text-cream transition-colors hover:bg-midnight/90"
      >
        Demander ce pack →
      </button>
      {open && <Modal kind={kind} onClose={() => setOpen(false)} />}
    </>
  );
}

function Modal({ kind, onClose }: { kind: Kind; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    form.set("kind", kind);
    startTransition(async () => {
      const res = await requestOwnerService(form);
      if (res.ok) {
        setDone(true);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="owner-service-title"
      className="fixed inset-0 z-50 grid place-items-center bg-midnight/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-midnight/10 bg-cream">
        <div className="flex items-baseline justify-between border-b border-midnight/10 p-5">
          <div>
            <p className="eyebrow">Baboo à la carte</p>
            <h2 id="owner-service-title" className="display-md mt-1 text-lg">
              {LABEL[kind]}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-cream-2"
          >
            ×
          </button>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <p className="display-md text-lg text-forest">
              ✓ Demande enregistrée
            </p>
            <p className="mt-2 text-sm text-midnight">
              Notre équipe vous contacte sous 24 h ouvrées pour caler la
              date et le devis.
            </p>
            <Button className="mt-5" variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 p-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="os-name">Nom</Label>
              <Input id="os-name" name="name" required maxLength={120} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="os-email">Email</Label>
                <Input
                  id="os-email"
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="os-phone">Téléphone</Label>
                <Input
                  id="os-phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={40}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="os-city">Ville</Label>
              <Select id="os-city" name="citySlug" defaultValue="casablanca">
                {CITIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="os-notes">Précisions (optionnel)</Label>
              <Textarea
                id="os-notes"
                name="notes"
                rows={3}
                maxLength={1000}
                placeholder={
                  kind === "PHOTOS"
                    ? "Type de bien, surface approximative, dispo souhaitée…"
                    : "Fréquence souhaitée, surface, points d'attention…"
                }
              />
            </div>

            {error && (
              <p
                className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Envoi…" : "Envoyer la demande"}
            </Button>
            <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Pas de paiement à cette étape — devis transmis avant toute
              prestation.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
