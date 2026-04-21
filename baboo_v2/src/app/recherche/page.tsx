import type { Metadata } from "next";
import Link from "next/link";
import { MobileSearchHeader } from "@/components/search/mobile-search-header";
import { AppliedChips } from "@/components/search/applied-chips";
import { SearchToolbar } from "@/components/search/search-toolbar";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchPagination } from "@/components/search/search-pagination";
import { ListingCard } from "@/components/listing/listing-card";
import { Button } from "@/components/ui/button";
import { findListings } from "@/lib/listings-query";
import { parseSearchParams, buildSearchHref } from "@/lib/search-params";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPE_LABEL_PLURAL, TRANSACTION_VERB } from "@/data/taxonomy";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const f = parseSearchParams(sp);
  const title = buildH1(f);
  return {
    title,
    description: `${title} sur Baboo. Filtrez par ville, prix et surface.`,
    alternates: { canonical: "/recherche" + (f.citySlug ? `?city=${f.citySlug}` : "") },
  };
}

function buildH1(f: ReturnType<typeof parseSearchParams>): string {
  const city = f.citySlug
    ? CITIES.find((c) => c.slug === f.citySlug)?.name ?? "au Maroc"
    : "au Maroc";
  const typeLabel =
    f.propertyTypes.length === 1
      ? PROPERTY_TYPE_LABEL_PLURAL[f.propertyTypes[0]]
      : "Biens";
  return `${typeLabel} ${TRANSACTION_VERB[f.transaction]} à ${city}`;
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = parseSearchParams(sp);
  const { items, total, page, totalPages } = await findListings(filters);

  const h1 = buildH1(filters);

  return (
    <>
      <MobileSearchHeader filters={filters} />

      <div className="container pb-10">
        <div className="mt-5 mb-5 md:mt-10">
          <h1 className="display-lg">{h1}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {total} annonce{total > 1 ? "s" : ""} correspond{total > 1 ? "ent" : ""} à vos critères.
          </p>
        </div>

        <div className="md:hidden">
          <AppliedChips filters={filters} />
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Panneau filtres */}
          <SearchFilters initial={filters} className="lg:sticky lg:top-24 lg:self-start" />

          <div>
            <SearchToolbar total={total} filters={filters} />

            <div className="mt-6">
              {items.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((l) => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </div>
              )}
            </div>

            <SearchPagination page={page} totalPages={totalPages} filters={filters} />
          </div>
        </div>
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <h2 className="display-md">Aucune annonce ne correspond.</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
        Essayez d'élargir votre budget ou de retirer quelques filtres.
      </p>
      <div className="mt-6">
        <Link href={buildSearchHref({ transaction: "SALE" })}>
          <Button variant="outline" size="md">
            Réinitialiser les filtres
          </Button>
        </Link>
      </div>
    </div>
  );
}
