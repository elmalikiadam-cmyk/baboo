import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listing/listing-card";
import { SearchFiltersPanel } from "@/components/search/search-filters";
import { SearchToolbar } from "@/components/search/search-toolbar";
import { SearchPagination } from "@/components/search/search-pagination";
import { AppliedChips } from "@/components/search/applied-chips";
import { SaveSearchButton } from "@/components/search/save-search-button";
import { SearchLayout } from "@/components/search/search-layout";
import { findListings } from "@/lib/listings-query";
import { parseSearchParams, buildSearchHref } from "@/lib/search-params";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPE_LABEL_PLURAL, TRANSACTION_VERB } from "@/data/taxonomy";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function titleFromFilters(f: ReturnType<typeof parseSearchParams>): string {
  const parts: string[] = [];
  if (f.propertyTypes.length === 1)
    parts.push(PROPERTY_TYPE_LABEL_PLURAL[f.propertyTypes[0]]);
  else parts.push("Biens immobiliers");
  parts.push(TRANSACTION_VERB[f.transaction]);
  if (f.citySlug) {
    const city = CITIES.find((c) => c.slug === f.citySlug);
    if (city) parts.push(`à ${city.name}`);
  }
  return parts.join(" ");
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const filters = parseSearchParams(await searchParams);
  const title = titleFromFilters(filters);
  return {
    title,
    description: `${title} — annonces de particuliers et professionnels sur Baboo.`,
    alternates: { canonical: buildSearchHref(filters) },
  };
}

/**
 * V2 "Maison ouverte" : layout mobile-first.
 * Mobile : chips scrollables + toolbar + liste 1 colonne.
 * Desktop : grille [320px filters | results] avec filtres sticky.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const filters = parseSearchParams(sp);
  const { items, total, totalPages } = await findListings(filters);
  const heading = titleFromFilters(filters);

  // Accent rouge doux sur le mot-clé selon la transaction (Acheter/Louer).
  const accentWord =
    filters.transaction === "RENT" ? "louer" : "acheter";
  const headingWithAccent = heading.replace(
    new RegExp(`\\b${accentWord}\\b`, "i"),
    `__ACC__`,
  );
  const [beforeAcc, afterAcc] = headingWithAccent.split("__ACC__");

  return (
    <div className="container pb-10">
      <div className="mb-5 mt-5 md:mt-10">
        <h1 className="display-xl text-3xl md:text-5xl">
          {beforeAcc !== undefined && afterAcc !== undefined ? (
            <>
              {beforeAcc}
              <span className="text-terracotta">{accentWord}</span>
              {afterAcc}
            </>
          ) : (
            heading
          )}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {total} annonce{total > 1 ? "s" : ""} correspond
          {total > 1 ? "ent" : ""} à vos critères.
        </p>
      </div>

      <div className="md:hidden">
        <AppliedChips filters={filters} />
      </div>

      <SearchLayout
        filters={
          <SearchFiltersPanel
            initial={filters}
            className="lg:self-start"
          />
        }
        results={
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SearchToolbar filters={filters} total={total} />
              {total > 0 && (
                <SaveSearchButton filters={filters} heading={heading} />
              )}
            </div>

            <div className="mt-6">
              {items.length === 0 ? (
                <EmptyState transaction={filters.transaction} />
              ) : (
                /* Grille : mobile 1, tablette 2, desktop 3 (toujours 3
                   une fois le panneau rétracté, sinon 2 sur lg, 3 sur xl). */
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {items.map((l, i) => (
                    <ListingCard key={l.id} listing={l} priority={i < 3} />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <SearchPagination filters={filters} totalPages={totalPages} />
            </div>
          </>
        }
      />
    </div>
  );
}

function EmptyState({ transaction }: { transaction: "SALE" | "RENT" }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-cream p-10 text-center">
      <h2 className="display-md">Aucune annonce ne correspond.</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        Essayez d'élargir votre budget ou de retirer quelques filtres.
      </p>
      <div className="mt-6">
        <Link href={buildSearchHref({ transaction })}>
          <Button variant="outline" size="md">
            Réinitialiser les filtres
          </Button>
        </Link>
      </div>
    </div>
  );
}
