"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  confirmBooking,
  cancelBooking,
  deleteVisitSlot,
  markBookingOutcome,
} from "@/actions/visits";

type Booking = {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  visitor: { name: string | null; email: string; phone: string | null };
};

type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
  maxBookings: number;
  internalNote: string | null;
  bookings: Booking[];
};

const STATUS_TONE: Record<string, string> = {
  BOOKED: "bg-midnight/10 text-midnight",
  CONFIRMED: "bg-forest/15 text-forest",
  CANCELLED: "bg-muted/20 text-muted-foreground",
  NO_SHOW: "bg-danger/10 text-danger",
  COMPLETED: "bg-terracotta/10 text-terracotta",
};

const STATUS_LABEL: Record<string, string> = {
  BOOKED: "Réservé",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  NO_SHOW: "Absent",
  COMPLETED: "Visité",
};

export function SlotRow({ slot }: { slot: Slot }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const start = new Date(slot.startsAt);
  const end = new Date(slot.endsAt);
  const activeBookings = slot.bookings.filter(
    (b) => b.status === "BOOKED" || b.status === "CONFIRMED",
  );

  function onDelete() {
    if (
      activeBookings.length > 0 &&
      !confirm(
        `Ce créneau a ${activeBookings.length} réservation${activeBookings.length > 1 ? "s" : ""} active${activeBookings.length > 1 ? "s" : ""}. Supprimer annule tout. Continuer ?`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteVisitSlot(slot.id);
      router.refresh();
    });
  }

  return (
    <li className="rounded-xl border border-midnight/10 bg-cream p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="display-lg text-base">
            {start.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <p className="mono mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {start.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" → "}
            {end.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" · "}
            {activeBookings.length}/{slot.maxBookings} place
            {slot.maxBookings > 1 ? "s" : ""}
          </p>
          {slot.internalNote && (
            <p className="mt-2 text-xs italic text-muted-foreground">
              {slot.internalNote}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] text-midnight hover:border-danger hover:text-danger"
        >
          {isPending ? "…" : "Supprimer"}
        </button>
      </header>

      {slot.bookings.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-midnight/10 pt-3">
          {slot.bookings.map((b) => (
            <BookingItem
              key={b.id}
              booking={b}
              onChange={() => router.refresh()}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function BookingItem({
  booking,
  onChange,
}: {
  booking: Booking;
  onChange: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      await fn();
      onChange();
    });
  }

  return (
    <li className="rounded-lg border border-midnight/5 bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-midnight">
            {booking.visitor.name ?? booking.visitor.email}
          </p>
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {booking.visitor.email}
            {booking.visitor.phone && ` · ${booking.visitor.phone}`}
          </p>
          {booking.message && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-1 text-[11px] text-terracotta"
            >
              {expanded ? "Masquer" : "Voir"} le message
            </button>
          )}
          {expanded && booking.message && (
            <p className="mt-1 text-xs italic text-midnight">« {booking.message} »</p>
          )}
        </div>
        <span
          className={`rounded-full px-2 py-0.5 mono text-[9px] uppercase tracking-[0.12em] ${STATUS_TONE[booking.status]}`}
        >
          {STATUS_LABEL[booking.status] ?? booking.status}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {booking.status === "BOOKED" && (
          <>
            <button
              type="button"
              onClick={() => run(() => confirmBooking(booking.id))}
              disabled={isPending}
              className="rounded-full bg-forest px-3 py-1 text-[11px] font-semibold text-cream disabled:opacity-50"
            >
              Confirmer
            </button>
            <button
              type="button"
              onClick={() => run(() => cancelBooking(booking.id))}
              disabled={isPending}
              className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] text-midnight"
            >
              Annuler
            </button>
          </>
        )}
        {booking.status === "CONFIRMED" && (
          <>
            <button
              type="button"
              onClick={() => run(() => markBookingOutcome(booking.id, "COMPLETED"))}
              disabled={isPending}
              className="rounded-full bg-terracotta px-3 py-1 text-[11px] font-semibold text-cream disabled:opacity-50"
            >
              Visité
            </button>
            <button
              type="button"
              onClick={() => run(() => markBookingOutcome(booking.id, "NO_SHOW"))}
              disabled={isPending}
              className="rounded-full border border-danger/40 px-3 py-1 text-[11px] text-danger"
            >
              Absent
            </button>
            <button
              type="button"
              onClick={() => run(() => cancelBooking(booking.id))}
              disabled={isPending}
              className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] text-midnight"
            >
              Annuler
            </button>
          </>
        )}
      </div>
    </li>
  );
}
