"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  uploadTenantDocument,
  deleteTenantDocument,
} from "@/actions/tenant-docs";

export type TenantDoc = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

const SUGGESTED = [
  { label: "CIN (recto)", hint: "Pièce d'identité" },
  { label: "CIN (verso)", hint: "" },
  { label: "Fiche de paie — mois 1", hint: "Mois le plus récent" },
  { label: "Fiche de paie — mois 2", hint: "" },
  { label: "Fiche de paie — mois 3", hint: "" },
  { label: "Avis d'imposition", hint: "Dernier avis disponible" },
  { label: "Contrat de travail", hint: "Optionnel mais recommandé" },
  { label: "Justificatif de domicile", hint: "Facture < 3 mois" },
];

export function TenantDocsUploader({ docs }: { docs: TenantDoc[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [currentLabel, setCurrentLabel] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  function triggerUpload(label: string) {
    setCurrentLabel(label);
    fileRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const form = new FormData();
    form.append("file", f);
    form.append("label", currentLabel);
    setError(null);
    startTransition(async () => {
      const res = await uploadTenantDocument(form);
      if (!res.ok) setError(res.error);
      else router.refresh();
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function remove(id: string) {
    if (!confirm("Supprimer ce document ?")) return;
    startTransition(async () => {
      await deleteTenantDocument(id);
      router.refresh();
    });
  }

  const uploadedLabels = new Set(docs.map((d) => d.filename));

  return (
    <section>
      <header className="border-b border-midnight/10 pb-3">
        <p className="eyebrow">Justificatifs</p>
        <h2 className="display-lg mt-1 text-xl">
          Documents du <span className="text-terracotta">dossier</span>
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Visibles uniquement par les bailleurs chez qui votre candidature
          est acceptée. Stockés dans un espace sécurisé, chiffrés au repos.
        </p>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
        className="hidden"
        onChange={onFileChange}
      />

      {error && (
        <p className="mt-3 rounded-full bg-danger/10 px-3 py-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {SUGGESTED.map((s) => {
          const existing = docs.find((d) => d.filename === s.label);
          return (
            <li
              key={s.label}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-midnight/10 bg-cream p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-midnight">{s.label}</p>
                {s.hint && (
                  <p className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    {s.hint}
                  </p>
                )}
              </div>
              {existing ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-forest/15 px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] text-forest">
                    ✓ Ajouté
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(existing.id)}
                    disabled={isPending}
                    className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:text-danger"
                  >
                    Retirer
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => triggerUpload(s.label)}
                  disabled={isPending}
                  className="rounded-full border-2 border-midnight px-3 py-1 text-[11px] font-semibold text-midnight hover:bg-midnight hover:text-cream disabled:opacity-50"
                >
                  {isPending && currentLabel === s.label ? "Upload…" : "+ Ajouter"}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Docs hors liste suggérée */}
      {docs.filter((d) => !SUGGESTED.find((s) => s.label === d.filename)).length > 0 && (
        <div className="mt-6">
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Autres documents
          </p>
          <ul className="mt-2 space-y-2">
            {docs
              .filter((d) => !SUGGESTED.find((s) => s.label === d.filename))
              .map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-midnight/5 bg-white px-3 py-2 text-xs"
                >
                  <span className="min-w-0 truncate">{d.filename}</span>
                  <button
                    type="button"
                    onClick={() => remove(d.id)}
                    className="text-muted-foreground hover:text-danger"
                  >
                    Retirer
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}
