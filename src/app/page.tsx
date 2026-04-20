import Image from "next/image";
import Link from "next/link";
import { HeroSearch } from "@/components/search/hero-search";
import { CityGrid } from "@/components/marketing/city-grid";
import { PropertyTypeRow } from "@/components/marketing/property-type-row";
import { TrustStrip } from "@/components/marketing/trust-strip";
import { ProCta } from "@/components/marketing/pro-cta";
import { ListingCard } from "@/components/listing/listing-card";
import { db } from "@/lib/db";

export const revalidate = 3600;

async function getFeaturedListings() {
  return db.listing.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: { publishedAt: "desc" },
    take: 8,
    include: {
      city: true,
      neighborhood: true,
      agency: { select: { id: true, slug: true, name: true, verified: true, logo: true } },
    },
  });
}

export default async function HomePage() {
  // Featured listings require a seeded DB. If none, we still render the page.
  let featured: Awaited<ReturnType<typeof getFeaturedListings>> = [];
  try {
    featured = await getFeaturedListings();
  } catch {
    featured = [];
  }

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2200&q=75"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60" />
        </div>

        <div className="container flex min-h-[78vh] flex-col justify-end pb-10 pt-28 text-white md:min-h-[82vh] md:pb-16">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              L'immobilier premium au Maroc
            </p>
            <h1 className="font-display text-display-lg font-semibold leading-[1.05]">
              Trouvez votre prochaine adresse, <span className="italic text-accent">sans compromis</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85 md:text-xl">
              De Casablanca à Marrakech, Baboo rassemble les meilleures annonces, auprès des meilleurs professionnels.
            </p>
          </div>

          <div className="mt-10">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Featured listings */}
      {featured.length > 0 && (
        <section className="container py-16 md:py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-accent-foreground/80">
                Sélection Baboo
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Nos coups de cœur</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Des biens choisis par notre équipe pour leur qualité, leur emplacement et leur juste prix.
              </p>
            </div>
            <Link
              href="/recherche?featured=1"
              className="hidden shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-foreground/5 md:inline-block"
            >
              Voir tout →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      <CityGrid />
      <PropertyTypeRow />
      <TrustStrip />
      <ProCta />
    </>
  );
}
