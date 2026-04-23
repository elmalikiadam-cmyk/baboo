"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Layout rétractable pour la page /recherche.
 *
 * Mobile : filtres déjà gérés via un drawer au-dessus. Ce wrapper est
 * désactivé (retourne `filters` + `results` empilés).
 *
 * Desktop (lg+) : deux états
 *   - Ouvert     : grille [340px | 1fr], panneau visible
 *   - Rabattu    : grille [56px | 1fr], barre verticale affichant « FILTRES »
 *
 * Un clic sur la barre (ou sur « Masquer » du header) bascule. État
 * persisté en localStorage sous `baboo:search:filters-open`.
 */
export function SearchLayout({
  filters,
  results,
  initialOpen,
}: {
  filters: ReactNode;
  results: ReactNode;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return initialOpen ?? true;
    try {
      const stored = window.localStorage.getItem("baboo:search:filters-open");
      if (stored === null) return initialOpen ?? true;
      return stored === "1";
    } catch {
      return initialOpen ?? true;
    }
  });

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("baboo:search:filters-open", next ? "1" : "0");
      } catch {
        /* silencieux — localStorage bloqué */
      }
      return next;
    });
  }

  return (
    <div
      className={cn(
        "mt-4 grid gap-6 transition-[grid-template-columns] duration-300 ease-out",
        open
          ? "lg:grid-cols-[340px_1fr]"
          : "lg:grid-cols-[56px_1fr]",
      )}
    >
      {/* Colonne filtres — visible sur mobile (open implicite), rétractable desktop */}
      <aside
        aria-label="Filtres de recherche"
        className={cn(
          "relative self-start lg:sticky lg:top-24",
          !open && "hidden lg:block",
        )}
      >
        {open ? (
          <div className="space-y-3">
            <div className="hidden items-center justify-between lg:flex">
              <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Filtres
              </p>
              <button
                type="button"
                onClick={toggle}
                className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] font-medium text-midnight hover:border-midnight"
              >
                ← Masquer
              </button>
            </div>
            {filters}
          </div>
        ) : (
          <CollapsedRail onExpand={toggle} />
        )}
      </aside>

      {/* Colonne résultats */}
      <div className="min-w-0">
        {!open && (
          <button
            type="button"
            onClick={toggle}
            className="mb-4 hidden items-center gap-2 rounded-full border border-midnight/20 px-4 py-1.5 text-[11px] font-medium text-midnight hover:border-midnight lg:inline-flex"
          >
            <span>☰</span>
            Afficher les filtres
          </button>
        )}
        {results}
      </div>
    </div>
  );
}

function CollapsedRail({ onExpand }: { onExpand: () => void }) {
  return (
    <button
      type="button"
      onClick={onExpand}
      aria-label="Afficher les filtres"
      className="hidden h-64 w-14 flex-col items-center justify-center gap-3 rounded-md border border-midnight/10 bg-cream-2 transition-colors hover:border-midnight hover:bg-cream lg:flex"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-midnight text-cream">
        ☰
      </span>
      <span
        className="mono text-[10px] font-semibold uppercase tracking-[0.22em] text-midnight"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        Filtres
      </span>
    </button>
  );
}
