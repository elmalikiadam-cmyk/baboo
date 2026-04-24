"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelMyOwnSearchRequest } from "@/actions/search-request-admin";

export function CancelMyRequestButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (
      !confirm(
        "Annuler cette recherche ? Nous arrêterons de vous envoyer des annonces correspondantes.",
      )
    )
      return;
    startTransition(async () => {
      const res = await cancelMyOwnSearchRequest(id);
      if (res.ok) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="inline-flex h-9 items-center rounded-full border border-midnight/20 px-4 text-xs text-midnight hover:border-midnight disabled:opacity-50"
    >
      {isPending ? "…" : "Annuler cette recherche"}
    </button>
  );
}
