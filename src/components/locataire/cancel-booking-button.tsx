"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelBooking } from "@/actions/visits";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("Annuler cette visite ?")) return;
    startTransition(async () => {
      await cancelBooking(bookingId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] font-medium text-midnight hover:border-danger hover:text-danger"
    >
      {isPending ? "…" : "Annuler"}
    </button>
  );
}
