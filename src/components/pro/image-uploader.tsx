"use client";

import { useState, useRef } from "react";

interface Props {
  /** URL initiale (pour le champ coverImage ou un seul avatar). */
  value: string;
  onChange: (url: string) => void;
  /** Si vrai, accepte plusieurs fichiers à la suite et les ajoute à la liste. */
  multiple?: boolean;
  disabled?: boolean;
}

/**
 * Uploader léger : click ou drag-drop, POST vers /api/upload qui renvoie l'URL
 * publique. Si le backend répond 503 (upload non configuré), on désactive le
 * champ fichier et on explique que le collage d'URL reste possible.
 */
export function ImageUploader({ value, onChange, multiple, disabled }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabledByBackend, setDisabledByBackend] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.status === 503) {
        setDisabledByBackend(true);
        setError(
          "L'upload direct n'est pas configuré. Collez l'URL d'une image publique.",
        );
        return;
      }
      const body = (await res.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;
      if (!res.ok || !body?.ok || !body.url) {
        setError(body?.error ?? "Upload impossible.");
        return;
      }
      onChange(body.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    void upload(files[0]);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  }

  return (
    <div className="space-y-2">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`group relative flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-foreground/25 bg-background px-4 py-3 text-sm transition hover:border-foreground ${disabled || disabledByBackend ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={onFile}
          disabled={disabled || disabledByBackend || uploading}
          multiple={multiple}
        />
        <span className="mono rounded-full bg-foreground/5 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground group-hover:bg-foreground/10">
          {uploading ? "Envoi…" : "Choisir une image"}
        </span>
        <span className="text-xs text-muted-foreground">
          Glissez-déposez ou cliquez · JPEG / PNG / WebP · max 8 Mo
        </span>
      </label>
      {error && <p className="text-[11px] text-danger">{error}</p>}
      {value && (
        <div className="flex items-center gap-3 rounded-md border border-foreground/10 bg-surface p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
          <p className="mono truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {value.replace(/^https?:\/\//, "")}
          </p>
          <button
            type="button"
            onClick={() => onChange("")}
            className="mono ml-auto shrink-0 rounded-full border border-foreground/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] hover:border-danger hover:text-danger"
          >
            Retirer
          </button>
        </div>
      )}
    </div>
  );
}
