"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/input";
import { SORT_OPTIONS } from "@/data/taxonomy";
import { filtersToQueryString, type SearchFilters } from "@/lib/search-params";

interface Props {
  filters: SearchFilters;
  total: number;
}

export function SearchToolbar({ filters, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, start] = useTransition();

  function onSort(value: string) {
    const next = { ...filters, sort: value as typeof filters.sort, page: 1 };
    start(() => router.push(`${pathname}${filtersToQueryString(next)}`, { scroll: false }));
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{new Intl.NumberFormat("fr-FR").format(total)}</span>{" "}
        {total > 1 ? "annonces trouvées" : "annonce trouvée"}
        {isPending && <span className="ml-2 text-xs">· Mise à jour…</span>}
      </p>

      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-xs text-muted-foreground">Trier par</label>
        <Select
          id="sort"
          value={filters.sort}
          onChange={(e) => onSort(e.target.value)}
          className="h-10 w-auto min-w-[180px] text-sm"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
      </div>
    </div>
  );
}
