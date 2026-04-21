"use client";

import { useTransition, useState } from "react";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { approveListing, rejectListing } from "@/actions/admin";

export function ModerationActions({ listingId }: { listingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: "approve" | "reject") {
    setError(null);
    startTransition(async () => {
      const res =
        action === "approve"
          ? await approveListing(listingId)
          : await rejectListing(listingId);
      if (!res.ok) setError(res.error ?? "Erreur.");
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => run("approve")}
          disabled={isPending}
          aria-label="Approuver"
          className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background transition hover:bg-foreground/90 disabled:opacity-50"
        >
          <CheckIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => run("reject")}
          disabled={isPending}
          aria-label="Rejeter"
          className="grid h-9 w-9 place-items-center rounded-full border border-foreground/20 transition hover:border-danger hover:text-danger disabled:opacity-50"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="text-[10px] text-danger">{error}</p>}
    </div>
  );
}
