"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyCraftsman, unverifyCraftsman } from "@/actions/craftsmen";

export function CraftsmanVerifyButton({
  craftsmanId,
  verified,
}: {
  craftsmanId: string;
  verified: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = verified
        ? await unverifyCraftsman(craftsmanId)
        : await verifyCraftsman(craftsmanId);
      if (res.ok) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
        verified
          ? "border border-midnight/20 text-midnight hover:border-danger hover:text-danger"
          : "bg-forest text-cream"
      } disabled:opacity-50`}
    >
      {isPending
        ? "…"
        : verified
          ? "Dé-vérifier"
          : "✓ Vérifier"}
    </button>
  );
}
