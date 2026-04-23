"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { withdrawApplication } from "@/actions/tenant-applications";

export function WithdrawApplicationButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("Retirer cette candidature ?")) return;
    startTransition(async () => {
      await withdrawApplication(applicationId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="shrink-0 rounded-full border border-midnight/20 px-3 py-1 text-[11px] font-medium text-midnight hover:border-danger hover:text-danger"
    >
      {isPending ? "…" : "Retirer"}
    </button>
  );
}
