"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { unlockSearchRequest } from "@/actions/partners";

const LEAD_PRICE = 500;

export function UnlockLeadButton({
  partnerId,
  searchRequestId,
  balance,
}: {
  partnerId: string;
  searchRequestId: string;
  balance: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (!confirm(`Débloquer ce lead pour ${LEAD_PRICE} MAD ?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await unlockSearchRequest(partnerId, searchRequestId);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  const tooLow = balance < LEAD_PRICE;

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending || tooLow}
        className="inline-flex h-10 items-center rounded-full bg-terracotta px-5 text-xs font-semibold text-cream hover:bg-terracotta-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "…" : `Débloquer pour ${LEAD_PRICE} MAD →`}
      </button>
      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {tooLow && !error && (
        <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Solde insuffisant
        </p>
      )}
    </div>
  );
}
