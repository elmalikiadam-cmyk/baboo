"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { bookVisit } from "@/actions/visits";

type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
  maxBookings: number;
  bookedCount: number;
  alreadyBooked: boolean;
  managedByBaboo?: boolean;
};

export function SlotBookingList({ slots }: { slots: Slot[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <ul className="space-y-3">
        {slots.map((s) => (
          <SlotButton
            key={s.id}
            slot={s}
            selected={selected === s.id}
            onSelect={() => setSelected(s.id === selected ? null : s.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function SlotButton({
  slot,
  selected,
  onSelect,
}: {
  slot: Slot;
  selected: boolean;
  onSelect: () => void;
}) {
  const start = new Date(slot.startsAt);
  const end = new Date(slot.endsAt);
  const full = slot.bookedCount >= slot.maxBookings;

  return (
    <li
      className={`rounded-2xl border bg-cream p-5 transition-colors ${
        selected ? "border-terracotta" : "border-midnight/10"
      } ${slot.alreadyBooked ? "opacity-70" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
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
            {slot.maxBookings > 1 &&
              ` · ${slot.maxBookings - slot.bookedCount}/${slot.maxBookings} places dispo`}
          </p>
          {slot.managedByBaboo && (
            <p className="mono mt-2 inline-block rounded-full bg-terracotta/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-terracotta">
              Visite accompagnée par un agent Baboo
            </p>
          )}
        </div>

        {slot.alreadyBooked ? (
          <span className="rounded-full bg-forest/15 px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] text-forest">
            ✓ Réservé
          </span>
        ) : full ? (
          <span className="rounded-full bg-muted/20 px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Complet
          </span>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            className="rounded-full border-2 border-midnight px-4 py-1.5 text-xs font-semibold text-midnight hover:bg-midnight hover:text-cream"
          >
            {selected ? "Fermer" : "Réserver"}
          </button>
        )}
      </div>

      {selected && !slot.alreadyBooked && !full && (
        <BookingForm
          slotId={slot.id}
          managed={slot.managedByBaboo ?? false}
        />
      )}
    </li>
  );
}

function BookingForm({
  slotId,
  managed,
}: {
  slotId: string;
  managed: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await bookVisit(slotId, message);
      if (res.ok) {
        router.push("/locataire/visites");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 space-y-3 border-t border-midnight/10 pt-4"
    >
      {managed && (
        <div className="rounded-xl bg-terracotta/5 p-3 text-xs text-midnight">
          <strong>Visite accompagnée Baboo.</strong> Un agent vous
          accueille sur place, vérifie votre dossier et présente le
          bien. Un rapport est envoyé au bailleur ; vous restez libre
          d'accepter ou non.
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor={`msg-${slotId}`}>
          {managed
            ? "Présentez-vous brièvement (visible par l'agent)"
            : "Message au bailleur (optionnel)"}
        </Label>
        <Textarea
          id={`msg-${slotId}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder={
            managed
              ? "Profil, contexte du projet, questions à préparer…"
              : "Infos utiles, contexte familial, références…"
          }
        />
      </div>
      {error && (
        <p
          className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger"
          role="alert"
        >
          {error}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Réservation…" : "Confirmer la réservation"}
      </Button>
    </form>
  );
}
