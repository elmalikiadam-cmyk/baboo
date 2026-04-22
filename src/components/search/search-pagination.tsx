import Link from "next/link";
import { filtersToQueryString, type SearchFilters } from "@/lib/search-params";
import { cn } from "@/lib/cn";

interface Props {
  filters: SearchFilters;
  totalPages: number;
}

export function SearchPagination({ filters, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const add = (n: number) => {
    if (n >= 1 && n <= totalPages && !pages.includes(n)) pages.push(n);
  };
  add(1);
  add(filters.page - 1);
  add(filters.page);
  add(filters.page + 1);
  add(totalPages);
  pages.sort((a, b) => a - b);

  const prev = Math.max(1, filters.page - 1);
  const next = Math.min(totalPages, filters.page + 1);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
      <Link
        href={`/recherche${filtersToQueryString({ ...filters, page: prev })}`}
        aria-disabled={filters.page === 1}
        className={cn(
          "rounded-full border border-border px-3 py-2 text-sm",
          filters.page === 1 ? "pointer-events-none opacity-50" : "hover:bg-cream-2",
        )}
      >
        ← Précédent
      </Link>

      {pages.map((n, i) => {
        const gap = i > 0 && n - pages[i - 1] > 1;
        return (
          <span key={n} className="contents">
            {gap && <span className="px-1 text-muted">…</span>}
            <Link
              href={`/recherche${filtersToQueryString({ ...filters, page: n })}`}
              aria-current={filters.page === n ? "page" : undefined}
              className={cn(
                "min-w-[2.5rem] rounded-full px-3 py-2 text-center text-sm",
                filters.page === n
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-cream-2",
              )}
            >
              {n}
            </Link>
          </span>
        );
      })}

      <Link
        href={`/recherche${filtersToQueryString({ ...filters, page: next })}`}
        aria-disabled={filters.page === totalPages}
        className={cn(
          "rounded-full border border-border px-3 py-2 text-sm",
          filters.page === totalPages ? "pointer-events-none opacity-50" : "hover:bg-cream-2",
        )}
      >
        Suivant →
      </Link>
    </nav>
  );
}
