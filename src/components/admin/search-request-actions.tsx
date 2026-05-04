"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  expireSearchRequest,
  reopenSearchRequest,
} from "@/actions/search-request-admin";

export function SearchRequestActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function expire() {
    startTransition(async () => {
      const res = await expireSearchRequest(id);
      if (res.ok) router.refresh();
    });
  }

  function reopen() {
    startTransition(async () => {
      const res = await reopenSearchRequest(id);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {status === "EXPIRED" ? (
        <button
          type="button"
          onClick={reopen}
          disabled={isPending}
          className="inline-flex h-8 items-center rounded-full border border-midnight/20 px-3 text-xs hover:border-midnight disabled:opacity-50"
        >
          {isPending ? "…" : "Rouvrir"}
        </button>
      ) : (
        <button
          type="button"
          onClick={expire}
          disabled={isPending}
          className="inline-flex h-8 items-center rounded-full border border-danger/30 px-3 text-xs text-danger hover:bg-danger/5 disabled:opacity-50"
        >
          {isPending ? "…" : "Expirer"}
        </button>
      )}
    </div>
  );
}
