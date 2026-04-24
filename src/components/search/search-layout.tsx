"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Layout horizontal avec barre de filtres rétractable en haut.
 *
 * État stocké en localStorage `baboo:search:filters-open` (défaut true).
 * Barre toujours visible avec l'applied chips ; l'expand/collapse
 * montre/cache le panneau complet.
 *
 * Résultats affichés en grille 3 colonnes desktop, 2 tablette, 1 mobile.
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
  const [open, setOpen] = useState<boolean>(initialOpen ?? false);

  // Lecture localStorage côté client après mount (évite mismatch SSR).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("baboo:search:filters-open");
      if (stored !== null) setOpen(stored === "1");
    } catch {
      /* silencieux */
    }
  }, []);

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(
          "baboo:search:filters-open",
          next ? "1" : "0",
        );
      } catch {
        /* silencieux */
      }
      return next;
    });
  }

  return (
    <div>
      {/* Barre rétractable */}
      <div className="mb-6 rounded-2xl border border-midnight/10 bg-cream overflow-hidden">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="search-filters-panel"
          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-cream-2"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-midnight text-cream">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
              >
                <path d="M3 6h18M6 12h12M10 18h4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="display-md text-[15px]">Filtres</span>
            <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hidden sm:inline">
              {open ? "Replier" : "Déplier"}
            </span>
          </div>
          <span
            className={cn(
              "mono text-[14px] text-midnight transition-transform",
              open ? "rotate-180" : "rotate-0",
            )}
            aria-hidden
          >
            ▾
          </span>
        </button>
        <div
          id="search-filters-panel"
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            open
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-midnight/10 bg-cream p-4 md:p-5">
              {filters}
            </div>
          </div>
        </div>
      </div>

      {/* Résultats plein largeur */}
      <div className="min-w-0">{results}</div>
    </div>
  );
}
