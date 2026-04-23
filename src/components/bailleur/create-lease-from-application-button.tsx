"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createLeaseFromApplication } from "@/actions/leases";

/**
 * CTA visible sur une candidature ACCEPTED. Soit on génère le bail
 * (première fois), soit on propose un raccourci vers le brouillon
 * existant.
 */
export function CreateLeaseFromApplicationButton({
  applicationId,
  existingLeaseId,
}: {
  applicationId: string;
  existingLeaseId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (existingLeaseId) {
    return (
      <div className="rounded-2xl border border-forest/30 bg-forest/5 p-5">
        <p className="eyebrow text-forest">Bail déjà lancé</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Un brouillon de bail existe déjà pour cette candidature.
        </p>
        <Link
          href={`/bailleur/baux/${existingLeaseId}`}
          className="mt-3 inline-flex h-10 items-center rounded-full bg-forest px-4 text-xs font-semibold text-cream hover:opacity-90"
        >
          Ouvrir le bail →
        </Link>
      </div>
    );
  }

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await createLeaseFromApplication(applicationId);
      if (res.ok && res.id) {
        router.push(`/bailleur/baux/${res.id}`);
      } else if (!res.ok) {
        setError(res.error);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-terracotta/40 bg-terracotta/5 p-5">
      <p className="eyebrow text-terracotta">Étape suivante</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Le dossier est accepté. Générez un bail pré-rempli avec les
        informations du listing — vous pourrez encore ajuster les termes
        avant de produire le PDF.
      </p>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="mt-3 inline-flex h-10 items-center rounded-full bg-terracotta px-4 text-xs font-semibold text-cream hover:bg-terracotta-2 disabled:opacity-50"
      >
        {isPending ? "Création…" : "Démarrer le bail →"}
      </button>
      {error && (
        <p className="mt-3 rounded-full bg-danger/10 px-3 py-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
