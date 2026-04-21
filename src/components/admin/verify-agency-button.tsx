"use client";

import { useState, useTransition } from "react";
import { verifyAgency } from "@/actions/admin";

export function VerifyAgencyButton({ agencyId }: { agencyId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await verifyAgency(agencyId);
      if (!res.ok) setError(res.error ?? "Erreur.");
    });
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="mono rounded-full bg-foreground px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-background transition hover:bg-foreground/90 disabled:opacity-50"
      >
        {isPending ? "…" : "Vérifier"}
      </button>
      {error && <p className="mt-1 text-[10px] text-danger">{error}</p>}
    </div>
  );
}
