"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createInventoryReport } from "@/actions/inventory";
import type { InventoryType } from "@prisma/client";

/**
 * CTA EDL affiché sur la page du bail — ouvre le rapport existant ou
 * le crée si absent. Se comporte identiquement pour bailleur et
 * locataire (le serveur autorise les deux parties).
 */
export function InventoryCta({
  leaseId,
  type,
  existingReportId,
  existingStatus,
  label,
  disabled,
  disabledReason,
}: {
  leaseId: string;
  type: InventoryType;
  existingReportId: string | null;
  existingStatus: "DRAFT" | "VALIDATED" | null;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (existingReportId) {
    return (
      <Link
        href={`/edl/${existingReportId}`}
        className="flex h-11 w-full items-center justify-center rounded-full border-2 border-midnight px-5 text-sm font-medium text-midnight hover:bg-midnight hover:text-cream"
      >
        {existingStatus === "VALIDATED"
          ? `Consulter ${label}`
          : `Continuer ${label}`}
      </Link>
    );
  }

  if (disabled) {
    return (
      <div className="rounded-full border border-dashed border-midnight/20 px-5 py-3 text-center text-xs text-muted-foreground">
        {disabledReason ?? `${label} indisponible à ce stade.`}
      </div>
    );
  }

  function onClick() {
    startTransition(async () => {
      const res = await createInventoryReport(leaseId, type);
      if (res.ok && res.id) {
        router.push(`/edl/${res.id}`);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="flex h-11 w-full items-center justify-center rounded-full bg-terracotta px-5 text-sm font-semibold text-cream hover:bg-terracotta-2 disabled:opacity-50"
    >
      {isPending ? "Création…" : `Démarrer ${label}`}
    </button>
  );
}
