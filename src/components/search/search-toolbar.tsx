"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/input";
import { SORT_OPTIONS, type SortKey } from "@/data/taxonomy";
import { filtersToQueryString, type SearchFilters } from "@/lib/search-params";
import { cn } from "@/lib/cn";

interface Props {
  filters: SearchFilters;
  total: number;
}

/**
 * V2 "Maison ouverte" : count + tri.
 * Desktop → select classique. Mobile → liste de liens avec underline accent
 * sous l'option active (façon spec).
 */
export function SearchToolbar({ filters, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, start] = useTransition();

  function onSort(value: SortKey) {
    const next = { ...filters, sort: value, page: 1 };
    start(() => router.push(`${pathname}${filtersToQueryString(next)}`, { scroll: false }));
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <p className="text-sm text-muted-foreground">
        <strong className="font-semibold text-midnight">
          {new Intl.NumberFormat("fr-FR").format(total)}
        </strong>{" "}
        {total > 1 ? "annonces trouvées" : "annonce trouvée"}
        {isPending && <span className="ml-2 text-xs text-muted">· Mise à jour…</span>}
      </p>

      {/* Mobile : tri inline avec underline accent sur la valeur active */}
      <div className="flex items-center gap-2 md:hidden">
        <span className="text-xs text-muted-foreground">Trier :</span>
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onSort(o.value)}
            disabled={isPending}
            className={cn(
              "text-xs font-medium transition-colors",
              filters.sort === o.value
                ? "border-b-[1.5px] border-terracotta pb-0.5 text-midnight"
                : "text-muted hover:text-midnight",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Desktop : select */}
      <div className="hidden items-center gap-2 md:flex">
        <label htmlFor="sort" className="text-xs text-muted-foreground">
          Trier par
        </label>
        <Select
          id="sort"
          value={filters.sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          className="h-10 w-auto min-w-[180px] text-sm"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
