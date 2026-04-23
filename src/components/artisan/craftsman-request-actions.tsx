"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ServiceRequestStatus } from "@prisma/client";
import { craftsmanUpdateRequestStatus } from "@/actions/service-requests";

export function CraftsmanRequestActions({
  requestId,
  status,
}: {
  requestId: string;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(next: ServiceRequestStatus, reason?: string) {
    setError(null);
    startTransition(async () => {
      const res = await craftsmanUpdateRequestStatus(requestId, next, reason);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  const buttons: Array<{
    label: string;
    next: ServiceRequestStatus;
    tone: string;
    confirm?: string;
  }> = [];

  if (status === "ASSIGNED") {
    buttons.push({
      label: "Accepter",
      next: ServiceRequestStatus.ACCEPTED,
      tone: "bg-forest text-cream",
    });
    buttons.push({
      label: "Refuser",
      next: ServiceRequestStatus.OPEN,
      tone: "border border-midnight/20 text-midnight",
      confirm: "Refuser cette demande ?",
    });
  } else if (status === "ACCEPTED") {
    buttons.push({
      label: "Marquer en cours",
      next: ServiceRequestStatus.IN_PROGRESS,
      tone: "bg-terracotta text-cream",
    });
  } else if (status === "IN_PROGRESS") {
    buttons.push({
      label: "Marquer terminée",
      next: ServiceRequestStatus.COMPLETED,
      tone: "bg-forest text-cream",
    });
  }

  if (buttons.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t border-midnight/10 pt-3">
      {buttons.map((b) => (
        <button
          key={b.label}
          type="button"
          onClick={() => {
            if (b.confirm && !confirm(b.confirm)) return;
            run(b.next);
          }}
          disabled={isPending}
          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${b.tone} disabled:opacity-50`}
        >
          {isPending ? "…" : b.label}
        </button>
      ))}
      {error && (
        <p className="w-full text-[11px] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
