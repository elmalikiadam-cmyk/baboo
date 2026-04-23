"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveLandlordKyc,
  rejectLandlordKyc,
} from "@/actions/landlord-kyc";

/**
 * Boutons approve/reject d'un dossier KYC. Rejet ouvre un textarea inline
 * pour saisir la raison (500 caractères max).
 */
export function KycReviewActions({
  verificationId,
}: {
  verificationId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function approve() {
    setError(null);
    startTransition(async () => {
      const res = await approveLandlordKyc(verificationId);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  function reject() {
    setError(null);
    startTransition(async () => {
      const res = await rejectLandlordKyc(verificationId, reason);
      if (res.ok) {
        setShowReject(false);
        setReason("");
        router.refresh();
      } else setError(res.error);
    });
  }

  if (showReject) {
    return (
      <div className="w-full space-y-2 md:w-80">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Motif du rejet (visible par le bailleur)"
          className="w-full rounded-xl border border-midnight/20 bg-cream px-3 py-2 text-sm text-midnight focus-visible:border-midnight focus-visible:outline-none"
        />
        {error && (
          <p className="text-[11px] text-danger" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reject}
            disabled={isPending || reason.trim().length < 5}
            className="rounded-full bg-danger px-4 py-2 text-xs font-semibold text-cream disabled:opacity-50"
          >
            {isPending ? "Envoi…" : "Confirmer le rejet"}
          </button>
          <button
            type="button"
            onClick={() => setShowReject(false)}
            disabled={isPending}
            className="rounded-full border border-midnight/20 px-4 py-2 text-xs font-medium text-midnight"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={approve}
        disabled={isPending}
        className="rounded-full bg-forest px-4 py-2 text-xs font-semibold text-cream disabled:opacity-50"
      >
        {isPending ? "…" : "Approuver"}
      </button>
      <button
        type="button"
        onClick={() => setShowReject(true)}
        disabled={isPending}
        className="rounded-full border border-midnight/30 px-4 py-2 text-xs font-medium text-midnight hover:border-midnight"
      >
        Rejeter
      </button>
      {error && (
        <p className="w-full text-[11px] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
