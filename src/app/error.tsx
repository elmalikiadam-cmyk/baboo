"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary global côté App Router. Requis comme Client Component.
 * Next affiche cette page quand un Server Component jette, ou qu'une
 * erreur non interceptée survient dans un Client Component enfant.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error.message, error.digest);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Erreur serveur</p>
      <h1 className="display-xl mt-3 text-4xl md:text-5xl">
        Quelque chose s'est mal passé.
      </h1>
      <p className="mt-3 max-w-md text-ink-muted">
        Nous avons été notifiés. Vous pouvez réessayer, ou revenir à l'accueil.
      </p>
      {error.digest && (
        <p className="mono mt-4 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
          Réf · {error.digest}
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Réessayer</Button>
        <Link href="/">
          <Button variant="outline">Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  );
}
