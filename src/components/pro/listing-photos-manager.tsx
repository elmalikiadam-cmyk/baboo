"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Photo = { url: string; uploading?: boolean; id: string };

interface Props {
  initial?: string[]; // URLs déjà enregistrées
  onChange?: (urls: string[]) => void; // callback optionnel
  name?: string; // nom des inputs hidden (coverImage / additionalImages CSV)
  maxPhotos?: number;
}

/**
 * Gestionnaire multi-photos pour les annonces. Gère upload, preview,
 * réordonnancement (première = cover) et suppression. Produit 2 inputs
 * hidden lisibles par le server action existant :
 *   - `coverImage` : URL de la 1ère photo
 *   - `additionalImages` : CSV des URLs restantes
 *
 * L'upload passe par /api/upload (auth-gated, Supabase public bucket).
 * Drag & drop natif + click to browse. Max 15 photos par défaut.
 */
export function ListingPhotosManager({
  initial = [],
  onChange,
  name = "photos",
  maxPhotos = 15,
}: Props) {
  const [photos, setPhotos] = useState<Photo[]>(
    initial.map((url, i) => ({ url, id: `${i}-${url.slice(-8)}` })),
  );
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendBroken, setBackendBroken] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function notify(next: Photo[]) {
    setPhotos(next);
    onChange?.(next.filter((p) => !p.uploading).map((p) => p.url));
  }

  async function uploadFile(file: File): Promise<string | null> {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.status === 503) {
        setBackendBroken(true);
        setError(
          "L'upload direct n'est pas encore activé côté infra. Contactez l'admin.",
        );
        return null;
      }
      const body = (await res.json().catch(() => null)) as {
        ok?: boolean;
        url?: string;
        error?: string;
      } | null;
      if (!res.ok || !body?.ok || !body.url) {
        setError(body?.error ?? "Upload échoué.");
        return null;
      }
      return body.url;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files).slice(0, maxPhotos - photos.length);
    if (arr.length === 0) return;
    setError(null);

    // Placeholders « uploading »
    const placeholders: Photo[] = arr.map((f, i) => ({
      id: `u-${Date.now()}-${i}`,
      url: "",
      uploading: true,
    }));
    const withPlaceholders = [...photos, ...placeholders];
    setPhotos(withPlaceholders);

    const uploaded: Photo[] = [...photos];
    for (let i = 0; i < arr.length; i++) {
      const url = await uploadFile(arr[i]);
      if (url) {
        uploaded.push({ id: `${Date.now()}-${i}`, url });
      }
    }
    notify(uploaded);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  function removeAt(i: number) {
    const next = photos.filter((_, idx) => idx !== i);
    notify(next);
  }

  function moveTo(fromIdx: number, direction: -1 | 1) {
    const toIdx = fromIdx + direction;
    if (toIdx < 0 || toIdx >= photos.length) return;
    const next = [...photos];
    [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
    notify(next);
  }

  const validPhotos = photos.filter((p) => !p.uploading && p.url);
  const coverUrl = validPhotos[0]?.url ?? "";
  const additionalCsv = validPhotos
    .slice(1)
    .map((p) => p.url)
    .join("\n");

  return (
    <div className="space-y-3">
      {/* Hidden inputs lisibles par l'action existante */}
      <input type="hidden" name="coverImage" value={coverUrl} />
      <input
        type="hidden"
        name="additionalImages"
        value={additionalCsv}
      />
      {name && (
        <input type="hidden" name={name} value={validPhotos.map((p) => p.url).join(",")} />
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center transition-colors",
          dragOver
            ? "border-terracotta bg-terracotta/5"
            : "border-midnight/20 bg-cream hover:border-midnight/40",
          backendBroken && "opacity-60 cursor-not-allowed",
        )}
        role="button"
        tabIndex={0}
        aria-label="Ajouter des photos"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          disabled={backendBroken}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="display-lg text-lg">
          {dragOver
            ? "Déposez vos photos ici"
            : backendBroken
              ? "Upload indisponible"
              : "Glissez vos photos ou cliquez"}
        </p>
        <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {validPhotos.length}/{maxPhotos} · JPEG / PNG / WEBP · 8 MB max
        </p>
      </div>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      {/* Grid aperçus */}
      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p, i) => (
            <li
              key={p.id}
              className={cn(
                "group relative aspect-[4/3] overflow-hidden rounded-md border border-midnight/10 bg-cream-2",
                i === 0 && "ring-2 ring-terracotta",
              )}
            >
              {p.uploading ? (
                <div className="flex h-full items-center justify-center">
                  <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Upload…
                  </span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.url}
                  alt={`Photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              )}
              {i === 0 && !p.uploading && (
                <span className="absolute left-1 top-1 rounded-sm bg-terracotta px-1.5 py-0.5 mono text-[9px] font-semibold uppercase tracking-[0.12em] text-cream">
                  Couverture
                </span>
              )}
              {!p.uploading && (
                <div className="absolute bottom-1 left-1 right-1 flex justify-between gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveTo(i, -1);
                      }}
                      aria-label="Déplacer vers la gauche"
                      disabled={i === 0}
                      className="grid h-7 w-7 place-items-center rounded-full bg-midnight/80 text-[14px] text-cream disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveTo(i, 1);
                      }}
                      aria-label="Déplacer vers la droite"
                      disabled={i === photos.length - 1}
                      className="grid h-7 w-7 place-items-center rounded-full bg-midnight/80 text-[14px] text-cream disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAt(i);
                    }}
                    aria-label="Supprimer"
                    className="grid h-7 w-7 place-items-center rounded-full bg-danger/90 text-[12px] text-cream"
                  >
                    ✕
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
