"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ApplicationStatus } from "@prisma/client";
import { updateApplicationStatus } from "@/actions/tenant-applications";

type ActionDef = {
  status: ApplicationStatus;
  label: string;
  tone: string;
  requiresReason?: boolean;
};

const ACTIONS: ActionDef[] = [
  {
    status: ApplicationStatus.SHORTLISTED,
    label: "Présélectionner",
    tone: "bg-terracotta text-cream",
  },
  {
    status: ApplicationStatus.ACCEPTED,
    label: "Accepter",
    tone: "bg-forest text-cream",
  },
  {
    status: ApplicationStatus.REJECTED,
    label: "Refuser",
    tone: "bg-danger text-cream",
    requiresReason: true,
  },
];

export function ApplicationReviewActions({
  applicationId,
  currentStatus,
  rejectionReason,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
  rejectionReason: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmStatus, setConfirmStatus] =
    useState<ApplicationStatus | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function apply(status: ApplicationStatus, r?: string) {
    setError(null);
    startTransition(async () => {
      const res = await updateApplicationStatus(applicationId, status, r);
      if (res.ok) {
        setConfirmStatus(null);
        setReason("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-midnight/10 bg-cream p-5">
      <p className="eyebrow">Décision</p>

      {currentStatus === ApplicationStatus.WITHDRAWN ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Candidature retirée par le locataire.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {ACTIONS.map((a) => (
            <button
              key={a.status}
              type="button"
              onClick={() => {
                if (a.requiresReason) setConfirmStatus(a.status);
                else apply(a.status);
              }}
              disabled={isPending || currentStatus === a.status}
              className={`w-full rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-wide ${a.tone} disabled:opacity-40`}
            >
              {currentStatus === a.status ? "✓ " : ""}
              {a.label}
            </button>
          ))}
        </div>
      )}

      {confirmStatus === ApplicationStatus.REJECTED && (
        <div className="mt-4 space-y-2 border-t border-midnight/10 pt-4">
          <label className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Motif (visible par le candidat)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Ex : profil intéressant mais nous avons retenu un autre dossier."
            className="w-full rounded-xl border border-midnight/20 bg-white p-3 text-sm text-midnight focus-visible:border-midnight focus-visible:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => apply(ApplicationStatus.REJECTED, reason)}
              disabled={isPending || reason.trim().length < 5}
              className="rounded-full bg-danger px-3 py-1.5 text-xs font-semibold text-cream disabled:opacity-50"
            >
              {isPending ? "Envoi…" : "Confirmer le refus"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmStatus(null)}
              className="rounded-full border border-midnight/20 px-3 py-1.5 text-xs font-medium text-midnight"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {rejectionReason && currentStatus === ApplicationStatus.REJECTED && (
        <div className="mt-4 border-t border-midnight/10 pt-4">
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Motif transmis
          </p>
          <p className="mt-1 text-xs italic text-danger">« {rejectionReason} »</p>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-full bg-danger/10 px-3 py-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
