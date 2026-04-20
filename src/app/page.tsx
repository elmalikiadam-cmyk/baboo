import Link from "next/link";
import { HeroSearch } from "@/components/search/hero-search";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ForYou } from "@/components/marketing/for-you";
import { CityStrip } from "@/components/marketing/city-strip";
import { ListingCard } from "@/components/listing/listing-card";
import { FeaturedHeroCard } from "@/components/listing/featured-hero-card";
import { db, hasDb } from "@/lib/db";

export const revalidate = 600;

const LISTING_INCLUDE = {
  city: true,
  neighborhood: true,
  agency: { select: { id: true, slug: true, name: true, verified: true, logo: true } },
} as const;

async function getHomeData() {
  if (!hasDb()) return { featured: null, latest: [], total: 0, cityCounts: [] };
  try {
    const [featured, latest, total, cityCounts] = await Promise.all([
      db.listing.findFirst({
        where: { status: "PUBLISHED", featured: true },
        orderBy: { publishedAt: "desc" },
        include: LISTING_INCLUDE,
      }),
      db.listing.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 8,
        include: LISTING_INCLUDE,
      }),
      db.listing.count({ where: { status: "PUBLISHED" } }),
      db.listing.groupBy({
        by: ["citySlug"],
        where: { status: "PUBLISHED" },
        _count: true,
      }),
    ]);
    return {
      featured,
      latest: latest.filter((l) => l.id !== featured?.id).slice(0, 8),
      total,
      cityCounts: cityCounts.map((c) => ({ citySlug: c.citySlug, count: c._count })),
    };
  } catch {
    return { featured: null, latest: [], total: 0, cityCounts: [] };
  }
}

function formatTotal(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export default async function HomePage() {
  const { featured, latest, total, cityCounts } = await getHomeData();
  const hasData = latest.length > 0 || !!featured;

  const now = new Date();
  const month = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }).toUpperCase();
  const issue = `N° ${String(now.getMonth() + 1).padStart(2, "0")} — ${month} · MAROC`;

  return (
    <>
      {/* Masthead — editorial type-first hero */}
      <section className="border-b border-foreground/10">
        <div className="container pt-10 pb-10 md:pt-16 md:pb-14">
          <p className="eyebrow">{issue}</p>

          <h1 className="display-xl mt-4 text-[clamp(3rem,11vw,9rem)]">
            <span className="block">À vendre,</span>
            <span className="block">à louer.</span>
          </h1>

          <p className="mono mt-6 text-xs uppercase text-muted-foreground">
            {hasData ? `${formatTotal(total)} annonces` : "Base en cours d'initialisation"}
            {hasData && " · particuliers & professionnels"}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/recherche?t=sale" className="pill-soft">Je veux acheter</Link>
            <Link href="/recherche?t=rent" className="pill-soft">Je veux louer</Link>
            <Link href="/pro/publier" className="pill-soft">Je veux publier</Link>
          </div>

          <div className="mt-8 flex w-full justify-start md:mt-10">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Featured hero — V1 editorial à la une */}
      {featured && (
        <section className="container pt-12 md:pt-16">
          <FeaturedHeroCard listing={featured} />
        </section>
      )}

      {/* Latest grid */}
      {latest.length > 0 && (
        <section className="container py-14 md:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-foreground/15 pb-4">
            <div>
              <p className="eyebrow">Sélection</p>
              <h2 className="display-xl mt-2 text-3xl md:text-5xl">Dernières annonces.</h2>
            </div>
            <Link
              href="/recherche"
              className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
            >
              Voir tout ({formatTotal(total)}) →
            </Link>
          </div>

          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latest.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state — visible only if DB has no data yet */}
      {!hasData && (
        <section className="container py-20">
          <div className="rounded-3xl border border-dashed border-foreground/20 bg-paper-2/40 p-10 text-center">
            <p className="eyebrow">Base vide</p>
            <h2 className="display-xl mt-3 text-3xl md:text-4xl">Pas encore d'annonces ici.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Lance le seed pour charger 60+ annonces de démonstration :
            </p>
            <code className="mt-4 inline-block rounded-full bg-foreground px-4 py-2 mono text-xs text-background">
              pnpm db:push && pnpm db:seed
            </code>
          </div>
        </section>
      )}

      <CityStrip counts={cityCounts} />
      <HowItWorks />
      <ForYou />
    </>
  );
}
