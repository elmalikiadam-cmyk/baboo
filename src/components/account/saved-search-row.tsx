"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  pauseSavedSearchAction,
  resumeSavedSearchAction,
  deleteSavedSearchAction,
} from "@/actions/saved-search";

export function SavedSearchRow({
  id,
  name,
  query,
  frequencyLabel,
  lastRunAt,
  matchesCount,
  paused,
}: {
  id: string;
  name: string;
  query: string;
  frequency: string;
  frequencyLabel: string;
  lastRunAt: string | null;
  matchesCount: number;
  paused: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      if (paused) await resumeSavedSearchAction(id);
      else await pauseSavedSearchAction(id);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm(`Supprimer l'alerte « ${name} » ?`)) return;
    startTransition(async () => {
      await deleteSavedSearchAction(id);
      router.refresh();
    });
  }

  return (
    <li className="rounded-xl border border-midnight/10 bg-cream p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/recherche?${query}`}
            className="display-lg text-base hover:text-terracotta"
          >
            {name}
          </Link>
          <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {frequencyLabel}
            {paused && " · ⏸ EN PAUSE"}
            {" · "}
            {matchesCount} match{matchesCount > 1 ? "es" : ""} envoyé
            {matchesCount > 1 ? "s" : ""}
            {lastRunAt && (
              <>
                {" · dernier run "}
                {new Date(lastRunAt).toLocaleDateString("fr-FR")}
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            disabled={isPending}
            className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] font-medium text-midnight hover:border-midnight"
          >
            {paused ? "Reprendre" : "Mettre en pause"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] font-medium text-midnight hover:border-danger hover:text-danger"
          >
            Supprimer
          </button>
        </div>
      </div>
    </li>
  );
}
