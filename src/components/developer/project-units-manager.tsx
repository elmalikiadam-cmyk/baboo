"use client";

import { useState, useTransition } from "react";
import { PropertyType, type ProjectUnit } from "@prisma/client";
import { Input, Label, Select } from "@/components/ui/input";
import { PROPERTY_TYPE_LABEL, PROPERTY_TYPES } from "@/data/taxonomy";
import { createProjectUnit, deleteProjectUnit } from "@/actions/developer-projects";
import { useRouter } from "next/navigation";

const PRICE = new Intl.NumberFormat("fr-FR");

export function ProjectUnitsManager({
  projectId,
  units,
}: {
  projectId: string;
  units: ProjectUnit[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      projectId,
      label: String(f.get("label") ?? ""),
      propertyType: String(f.get("propertyType") ?? "APARTMENT") as PropertyType,
      bedrooms: f.get("bedrooms") ? Number(f.get("bedrooms")) : null,
      surface: Number(f.get("surface") ?? 0),
      price: Number(f.get("price") ?? 0),
      available: true,
    };
    setError(null);
    startTransition(async () => {
      const res = await createProjectUnit(payload);
      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else setError(res.error ?? "Erreur.");
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      await deleteProjectUnit(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {units.length > 0 ? (
        <ul className="space-y-2">
          {units.map((u) => (
            <li key={u.id} className="flex items-center gap-3 rounded-md border border-foreground/10 bg-surface p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{u.label}</p>
                <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {PROPERTY_TYPE_LABEL[u.propertyType]}
                  {u.bedrooms != null ? ` · ${u.bedrooms} ch.` : ""} · {u.surface} m² · {PRICE.format(u.price)} MAD
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDelete(u.id)}
                disabled={isPending}
                className="mono shrink-0 rounded-full border border-foreground/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] hover:border-danger hover:text-danger"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-foreground/25 p-5 text-center text-sm text-muted-foreground">
          Aucun lot. Ajoutez-en ci-dessous.
        </p>
      )}

      <form onSubmit={onSubmit} className="rounded-md border border-foreground/15 bg-surface p-4">
        <p className="eyebrow mb-3">Ajouter un lot</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Libellé">
            <Input name="label" required placeholder="T3 lot A12" />
          </Field>
          <Field label="Type">
            <Select name="propertyType" defaultValue="APARTMENT">
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PROPERTY_TYPE_LABEL[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Chambres">
            <Input name="bedrooms" type="number" min={0} max={10} placeholder="2" />
          </Field>
          <Field label="Surface (m²)">
            <Input name="surface" type="number" min={1} required placeholder="80" />
          </Field>
          <Field label="Prix (MAD)">
            <Input name="price" type="number" min={1} required placeholder="950000" />
          </Field>
        </div>
        {error && <p className="mt-2 text-[11px] text-danger">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="mono mt-3 rounded-full bg-foreground px-4 py-1.5 text-[10px] uppercase tracking-[0.12em] text-background disabled:opacity-50"
        >
          {isPending ? "Ajout…" : "Ajouter le lot"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
