import Link from "next/link";
import { cn } from "@/lib/cn";
import { buildSearchHref, type SearchFilters } from "@/lib/search-params";

interface Props {
  page: number;
  totalPages: number;
  filters: SearchFilters;
}

/**
 * Précédent / Suivant + numéros de page (max 5 visibles autour de la page courante).
 * Page active = bg-ink.
 */
export function SearchPagination({ page, totalPages, filters }: Props) {
  if (totalPages <= 1) return null;

  const pages = computeVisiblePages(page, totalPages);
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-2 py-6"
    >
      <PageLink
        href={prev ? buildSearchHref({ ...filters, page: prev }) : undefined}
        label="Précédent"
        disabled={!prev}
      />
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`g-${i}`} className="px-1 text-ink-muted">
            …
          </span>
        ) : (
          <PageNumber
            key={p}
            n={p}
            active={p === page}
            href={buildSearchHref({ ...filters, page: p })}
          />
        ),
      )}
      <PageLink
        href={next ? buildSearchHref({ ...filters, page: next }) : undefined}
        label="Suivant"
        disabled={!next}
        primary
      />
    </nav>
  );
}

function PageNumber({
  n,
  active,
  href,
}: {
  n: number;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "grid h-[38px] w-[38px] place-items-center rounded-full text-sm font-semibold transition-colors",
        active
          ? "bg-ink text-ink-foreground"
          : "border border-border text-ink hover:border-ink",
      )}
    >
      {n}
    </Link>
  );
}

function PageLink({
  href,
  label,
  disabled,
  primary,
}: {
  href: string | undefined;
  label: string;
  disabled: boolean;
  primary?: boolean;
}) {
  const base =
    "inline-flex h-[38px] items-center rounded-full px-3.5 text-xs font-semibold transition-colors";
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(base, "pointer-events-none border border-border text-ink-muted opacity-50")}
      >
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href ?? "#"}
      className={cn(
        base,
        primary
          ? "bg-ink text-ink-foreground hover:bg-ink/90"
          : "border border-border text-ink-soft hover:border-ink",
      )}
    >
      {label}
    </Link>
  );
}

function computeVisiblePages(page: number, total: number): Array<number | "…"> {
  const out: Array<number | "…"> = [];
  const show = new Set<number>([1, total, page, page - 1, page + 1]);
  for (let i = 1; i <= total; i++) {
    if (show.has(i) && i >= 1 && i <= total) out.push(i);
  }
  // Insère ellipses si trous.
  const withGaps: Array<number | "…"> = [];
  for (let i = 0; i < out.length; i++) {
    const cur = out[i] as number;
    const prev = out[i - 1] as number | undefined;
    if (prev != null && cur - prev > 1) withGaps.push("…");
    withGaps.push(cur);
  }
  return withGaps;
}
