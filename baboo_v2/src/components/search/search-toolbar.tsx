"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SORT_OPTIONS, type SortKey } from "@/data/taxonomy";
import { buildSearchHref, type SearchFilters } from "@/lib/search-params";
import { cn } from "@/lib/cn";

interface Props {
  total: number;
  filters: SearchFilters;
}

export function SearchToolbar({ total, filters }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSort(value: SortKey) {
    startTransition(() => router.push(buildSearchHref({ ...filters, sort: value, page: 1 })));
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-ink-soft">
        <strong className="font-semibold text-ink">{total}</strong>{" "}
        annonce{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}
      </p>

      {/* Mobile : tri "inline" avec underline accent sur la valeur */}
      <div className="flex items-center gap-2 md:hidden">
        <span className="text-xs text-ink-soft">Trier :</span>
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onSort(o.value)}
            disabled={isPending}
            className={cn(
              "text-xs font-medium transition-colors",
              filters.sort === o.value
                ? "border-b-[1.5px] border-accent pb-0.5 text-ink"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Desktop : select classique */}
      <label className="hidden items-center gap-2 md:flex">
        <span className="text-xs text-ink-soft">Trier par</span>
        <select
          value={filters.sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          disabled={isPending}
          className="h-9 rounded-full border border-border bg-surface px-3 text-sm text-ink focus-visible:border-ink focus-visible:outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
