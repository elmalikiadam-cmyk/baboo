"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { activateManualPack } from "@/actions/visit-packs";

export function ActivatePackButton({ packId }: { packId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (!confirm("Activer ce pack ? Le bailleur sera notifié.")) return;
    setError(null);
    startTransition(async () => {
      const res = await activateManualPack(packId);
      if (res.ok) router.refresh();
      else setError(res.error ?? "Erreur inconnue.");
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="inline-flex h-9 items-center rounded-full bg-forest px-4 text-xs font-semibold text-cream hover:bg-forest/90 disabled:opacity-50"
      >
        {isPending ? "…" : "Activer"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
