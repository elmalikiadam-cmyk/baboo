"use client";

import { useState, useTransition } from "react";
import { startPaymentCheckout } from "@/actions/payments";

/**
 * Bouton « Payer en ligne » sur une RentPeriod (côté locataire).
 * Affichage et comportement adaptatifs :
 *   - Si isPaymentEnabled=false : bouton disabled + tooltip
 *   - Sinon : clic → startPaymentCheckout → redirect vers gateway
 */
export function PayOnlineButton({
  rentPeriodId,
  enabled,
}: {
  rentPeriodId: string;
  enabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await startPaymentCheckout(rentPeriodId);
      if (res.ok) {
        window.location.href = res.checkoutUrl;
      } else {
        setError(res.error);
      }
    });
  }

  if (!enabled) {
    return (
      <p className="rounded-full border border-dashed border-midnight/20 px-4 py-2 text-center text-xs text-muted-foreground">
        Paiement en ligne bientôt disponible
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="rounded-full bg-terracotta px-4 py-2 text-xs font-semibold text-cream hover:bg-terracotta-2 disabled:opacity-50"
      >
        {isPending ? "Redirection…" : "Payer en ligne →"}
      </button>
      {error && (
        <p className="mt-2 rounded-full bg-danger/10 px-3 py-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
