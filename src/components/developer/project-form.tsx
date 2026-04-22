"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProjectStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { CITIES } from "@/data/cities";
import { ImageUploader } from "@/components/pro/image-uploader";
import { createProject, updateProject, deleteProject } from "@/actions/developer-projects";

interface Initial {
  name: string;
  description: string;
  cover: string;
  citySlug: string;
  addressLine: string;
  deliveryYear: number | null;
  status: ProjectStatus;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PRE_LAUNCH: "Pré-lancement",
  SELLING: "En commercialisation",
  NEARLY_SOLD: "Presque vendu",
  DELIVERED: "Livré",
};

const DEFAULT: Initial = {
  name: "",
  description: "",
  cover: "",
  citySlug: "casablanca",
  addressLine: "",
  deliveryYear: null,
  status: "SELLING",
};

export function ProjectForm({
  initial = DEFAULT,
  editId,
}: {
  initial?: Initial;
  editId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cover, setCover] = useState(initial.cover);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const res = editId ? await updateProject(editId, form) : await createProject(form);
      if (res.ok) {
        router.push(`/developer/projets/${res.id}`);
        router.refresh();
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  function onDelete() {
    if (!editId) return;
    if (!window.confirm("Supprimer ce projet ? Cette action est irréversible.")) return;
    startTransition(async () => {
      const res = await deleteProject(editId);
      if (res.ok) router.push("/developer/projets");
      else setError(res.error ?? "Suppression impossible.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Field label="Nom du projet" error={fieldErrors.name}>
        <Input name="name" required defaultValue={initial.name} placeholder="Résidence Marina Phase II" />
      </Field>
      <Field label="Description" error={fieldErrors.description}>
        <textarea
          name="description"
          rows={6}
          required
          defaultValue={initial.description}
          placeholder="Programme, services, emplacement, livraison estimée…"
          className="w-full rounded-md border border-border bg-cream p-4 text-sm focus-visible:border-midnight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-midnight/10"
        />
      </Field>

      <Field label="Visuel principal" error={fieldErrors.cover}>
        <ImageUploader value={cover} onChange={setCover} />
        <div className="mt-2">
          <Input
            type="url"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            placeholder="…ou collez une URL"
          />
        </div>
        <input type="hidden" name="cover" value={cover} />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Ville" error={fieldErrors.citySlug}>
          <Select name="citySlug" defaultValue={initial.citySlug} required>
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Année de livraison" error={fieldErrors.deliveryYear}>
          <Input
            name="deliveryYear"
            type="number"
            min={2020}
            max={2100}
            defaultValue={initial.deliveryYear ?? ""}
            placeholder="2026"
          />
        </Field>
        <Field label="Statut" error={fieldErrors.status}>
          <Select name="status" defaultValue={initial.status}>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Adresse" error={fieldErrors.addressLine}>
        <Input name="addressLine" defaultValue={initial.addressLine} placeholder="Bd de la Corniche, Casablanca" />
      </Field>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Enregistrement…" : editId ? "Enregistrer" : "Créer le projet"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Annuler
        </Button>
        {editId && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            className="mono ml-auto rounded-full border border-danger/30 px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-danger hover:bg-danger/10 disabled:opacity-50"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  );
}
