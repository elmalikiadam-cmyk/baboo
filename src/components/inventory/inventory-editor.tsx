"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  addInventoryRoom,
  addInventoryPhoto,
  updateInventoryReport,
  updateInventoryRoom,
  deleteInventoryRoom,
  deleteInventoryPhoto,
  validateInventoryReport,
  unvalidateInventoryReport,
} from "@/actions/inventory";

type Photo = { id: string; url: string; filename: string };
type Room = {
  id: string;
  name: string;
  condition: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
  notes: string | null;
  order: number;
  photos: Photo[];
};

const CONDITION_OPTIONS: Array<{ value: Room["condition"]; label: string }> = [
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Bon" },
  { value: "AVERAGE", label: "Passable" },
  { value: "POOR", label: "Mauvais" },
];

const CONDITION_TONE: Record<Room["condition"], string> = {
  EXCELLENT: "bg-forest/15 text-forest",
  GOOD: "bg-midnight/10 text-midnight",
  AVERAGE: "bg-terracotta/15 text-terracotta",
  POOR: "bg-danger/15 text-danger",
};

export function InventoryEditor({
  reportId,
  status,
  role,
  generalNotes,
  landlordValidated,
  landlordValidatedAt,
  tenantValidated,
  tenantValidatedAt,
  rooms: initialRooms,
}: {
  reportId: string;
  status: "DRAFT" | "VALIDATED";
  role: "LANDLORD" | "TENANT";
  generalNotes: string | null;
  landlordValidated: boolean;
  landlordValidatedAt: string | null;
  tenantValidated: boolean;
  tenantValidatedAt: string | null;
  rooms: Room[];
}) {
  const router = useRouter();
  const locked = status === "VALIDATED";

  const myValidated =
    role === "LANDLORD" ? landlordValidated : tenantValidated;
  const otherValidated =
    role === "LANDLORD" ? tenantValidated : landlordValidated;
  const otherAt =
    role === "LANDLORD" ? tenantValidatedAt : landlordValidatedAt;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        {/* Notes générales */}
        <GeneralNotesBlock
          reportId={reportId}
          initial={generalNotes}
          locked={locked}
        />

        {/* Pièces */}
        <section>
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-midnight/10 pb-3">
            <div>
              <p className="eyebrow">Pièces</p>
              <h2 className="display-lg mt-1 text-xl">
                {initialRooms.length} pièce{initialRooms.length > 1 ? "s" : ""} à décrire
              </h2>
            </div>
          </header>

          <ul className="mt-5 space-y-4">
            {initialRooms.map((r) => (
              <RoomBlock key={r.id} room={r} locked={locked} />
            ))}
          </ul>

          {!locked && <AddRoomForm reportId={reportId} />}
        </section>
      </div>

      <aside className="space-y-4">
        <ValidationCard
          reportId={reportId}
          role={role}
          myValidated={myValidated}
          otherValidated={otherValidated}
          otherValidatedAt={otherAt}
          status={status}
          onRefresh={() => router.refresh()}
        />

        <div className="rounded-2xl border border-midnight/10 bg-cream p-5 text-xs text-muted-foreground">
          <p className="eyebrow">Conformité loi 67-12</p>
          <p className="mt-2">
            L'EDL doit être établi contradictoirement et validé par les
            deux parties. Toute édition réinitialise les validations —
            il faudra re-cocher après.
          </p>
        </div>
      </aside>
    </div>
  );
}

function GeneralNotesBlock({
  reportId,
  initial,
  locked,
}: {
  reportId: string;
  initial: string | null;
  locked: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initial ?? "");
  const [saved, setSaved] = useState(false);

  function onSave() {
    setSaved(false);
    const form = new FormData();
    form.append("generalNotes", value);
    startTransition(async () => {
      const res = await updateInventoryReport(reportId, form);
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <section>
      <header className="border-b border-midnight/10 pb-3">
        <p className="eyebrow">Notes générales</p>
        <h2 className="display-lg mt-1 text-xl">
          Clés, compteurs, remarques
        </h2>
      </header>
      <div className="mt-4 space-y-3">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          maxLength={4000}
          disabled={locked || isPending}
          placeholder="Nombre de jeux de clés remis, relevés des compteurs (eau, électricité, gaz), présence de dispositifs de sécurité…"
        />
        {!locked && (
          <div className="flex items-center gap-3">
            <Button onClick={onSave} disabled={isPending}>
              {isPending ? "…" : "Enregistrer les notes"}
            </Button>
            {saved && (
              <span className="mono text-[10px] uppercase tracking-[0.12em] text-forest">
                ✓ Enregistré
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function AddRoomForm({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;
    const form = new FormData();
    form.append("name", name);
    startTransition(async () => {
      const res = await addInventoryRoom(reportId, form);
      if (res.ok) {
        setName("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl border border-dashed border-midnight/20 p-4"
    >
      <div className="flex-1 min-w-[200px] space-y-1.5">
        <Label htmlFor="new-room">Ajouter une pièce</Label>
        <Input
          id="new-room"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Chambre 2, Balcon, WC, Cave…"
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending || !name.trim()}>
        {isPending ? "…" : "Ajouter"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}

function RoomBlock({ room, locked }: { room: Room; locked: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(room.name);
  const [condition, setCondition] = useState<Room["condition"]>(room.condition);
  const [notes, setNotes] = useState(room.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    const form = new FormData();
    form.append("name", name);
    form.append("condition", condition);
    form.append("notes", notes);
    startTransition(async () => {
      const res = await updateInventoryRoom(room.id, form);
      if (res.ok) {
        setEditing(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function remove() {
    if (!confirm(`Supprimer la pièce « ${room.name} » ?`)) return;
    startTransition(async () => {
      await deleteInventoryRoom(room.id);
      router.refresh();
    });
  }

  return (
    <li className="rounded-2xl border border-midnight/10 bg-cream p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        {editing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs"
            disabled={isPending}
          />
        ) : (
          <h3 className="display-lg text-lg">{room.name}</h3>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {!editing && (
            <span
              className={`rounded-full px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] ${CONDITION_TONE[room.condition]}`}
            >
              {CONDITION_OPTIONS.find((o) => o.value === room.condition)?.label}
            </span>
          )}
          {!locked && (
            <>
              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={save}
                    disabled={isPending}
                    className="rounded-full bg-forest px-3 py-1 text-[11px] font-semibold text-cream disabled:opacity-50"
                  >
                    {isPending ? "…" : "Enregistrer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setName(room.name);
                      setCondition(room.condition);
                      setNotes(room.notes ?? "");
                    }}
                    disabled={isPending}
                    className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] text-midnight"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] text-midnight hover:border-midnight"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={isPending}
                    className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] text-midnight hover:border-danger hover:text-danger"
                  >
                    Supprimer
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </header>

      {editing && (
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label>État général</Label>
            <Select
              value={condition}
              onChange={(e) => setCondition(e.target.value as Room["condition"])}
              disabled={isPending}
            >
              {CONDITION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (détails par élément : sols, murs, plafond…)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={4000}
              disabled={isPending}
            />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      )}

      {!editing && room.notes && (
        <p className="mt-3 whitespace-pre-line text-sm text-midnight">
          {room.notes}
        </p>
      )}

      {/* Photos */}
      <div className="mt-4">
        <RoomPhotos roomId={room.id} photos={room.photos} locked={locked} />
      </div>
    </li>
  );
}

function RoomPhotos({
  roomId,
  photos,
  locked,
}: {
  roomId: string;
  photos: Photo[];
  locked: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    startTransition(async () => {
      for (const f of Array.from(files)) {
        const form = new FormData();
        form.append("file", f);
        const res = await addInventoryPhoto(roomId, form);
        if (!res.ok) {
          setError(res.error);
          break;
        }
      }
      (e.target as HTMLInputElement).value = "";
      router.refresh();
    });
  }

  function onDelete(id: string) {
    if (!confirm("Supprimer cette photo ?")) return;
    startTransition(async () => {
      await deleteInventoryPhoto(id);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {photos.map((p) => (
          <div
            key={p.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-midnight/10 bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.filename}
              className="h-full w-full object-cover"
            />
            {!locked && (
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                disabled={isPending}
                aria-label="Supprimer la photo"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-midnight/80 text-[11px] font-bold text-cream opacity-0 transition-opacity group-hover:opacity-100"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {!locked && (
          <label className="grid aspect-square cursor-pointer place-items-center rounded-lg border-2 border-dashed border-midnight/20 bg-cream text-xs font-medium text-midnight hover:border-midnight">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={onUpload}
              disabled={isPending}
              className="hidden"
            />
            <span className="text-center leading-tight">
              {isPending ? "…" : "+ Photo"}
            </span>
          </label>
        )}
      </div>
      {error && (
        <p className="mt-2 rounded-full bg-danger/10 px-3 py-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function ValidationCard({
  reportId,
  role,
  myValidated,
  otherValidated,
  otherValidatedAt,
  status,
  onRefresh,
}: {
  reportId: string;
  role: "LANDLORD" | "TENANT";
  myValidated: boolean;
  otherValidated: boolean;
  otherValidatedAt: string | null;
  status: "DRAFT" | "VALIDATED";
  onRefresh: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      const res = myValidated
        ? await unvalidateInventoryReport(reportId)
        : await validateInventoryReport(reportId);
      if (res.ok) onRefresh();
      else setError(res.error);
    });
  }

  const otherLabel = role === "LANDLORD" ? "Locataire" : "Bailleur";

  return (
    <div
      className={`rounded-2xl border p-5 ${
        status === "VALIDATED"
          ? "border-forest/40 bg-forest/5"
          : "border-midnight/10 bg-cream"
      }`}
    >
      <p className="eyebrow">Validation contradictoire</p>

      {status === "VALIDATED" ? (
        <div className="mt-3">
          <p className="display-md text-lg text-forest">✓ Rapport finalisé</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Les deux parties ont coché. Le rapport est verrouillé, plus
            aucune modification n'est possible.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={myValidated}
              onChange={toggle}
              disabled={isPending}
              className="mt-0.5 h-5 w-5 accent-terracotta"
            />
            <span className="text-sm text-midnight">
              Je valide l'état des lieux tel que décrit ci-dessus en tant
              que <strong>{role === "LANDLORD" ? "bailleur" : "locataire"}</strong>.
            </span>
          </label>

          <div className="rounded-xl border border-midnight/5 bg-white p-3 text-xs">
            <p className="mono uppercase tracking-[0.12em] text-muted-foreground">
              {otherLabel}
            </p>
            <p className="mt-1 text-midnight">
              {otherValidated
                ? `✓ A validé${otherValidatedAt ? ` le ${new Date(otherValidatedAt).toLocaleDateString("fr-FR")}` : ""}`
                : "En attente de validation"}
            </p>
          </div>

          {error && (
            <p className="rounded-full bg-danger/10 px-3 py-1.5 text-xs text-danger" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
