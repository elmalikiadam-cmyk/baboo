"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { applyToListing } from "@/actions/tenant-applications";

export function ApplyForm({
  listingId,
  listingSlug,
  listingTitle,
}: {
  listingId: string;
  listingSlug: string;
  listingTitle: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await applyToListing(listingId, message);
      if (res.ok) {
        router.push(`/locataire/candidatures?from=${encodeURIComponent(listingSlug)}`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <section>
        <header className="border-b border-midnight/10 pb-3">
          <p className="eyebrow">Message (optionnel)</p>
          <h2 className="display-lg mt-1 text-xl">Un mot au bailleur</h2>
        </header>
        <div className="mt-5 space-y-2">
          <Label htmlFor="apply-message">
            Pourquoi ce bien vous correspond
          </Label>
          <Textarea
            id="apply-message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={2000}
            placeholder={`Ex : famille sérieuse, emménagement souhaité en septembre, aucun problème de loyer chez notre propriétaire actuel…`}
          />
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {message.length} / 2000
          </p>
        </div>
      </section>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-midnight/10 pt-6">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Envoi…" : `Envoyer ma candidature`}
        </Button>
        <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          ○ « {listingTitle.slice(0, 40)} »
        </p>
      </div>
    </form>
  );
}
