import Link from "next/link";
import { HeroSearch } from "@/components/search/hero-search";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ForYou } from "@/components/marketing/for-you";
import { ListingCard } from "@/components/listing/listing-card";
import { db } from "@/lib/db";

export const revalidate = 600;

async function getLatestListings() {
  try {
    return await db.listing.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 8,
      include: {
        city: true,
        neighborhood: true,
        agency: { select: { id: true, slug: true, name: true, verified: true, logo: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const latest = await getLatestListings();
  const total = latest.length > 0 ? "2 847" : "0";

  const now = new Date();
  const issue = `N° ${String(now.getMonth() + 1).padStart(2, "0")} — ${now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }).toUpperCase()} · MAROC`;

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
            {total} annonces · particuliers & professionnels
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

      {/* Latest — grid with editorial header */}
      {latest.length > 0 && (
        <section className="container py-14 md:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-foreground/15 pb-4">
            <h2 className="display-xl text-3xl md:text-5xl">Sélection.</h2>
            <Link href="/recherche" className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
              Voir tout ({total}) →
            </Link>
          </div>

          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latest.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      <HowItWorks />
      <ForYou />
    </>
  );
}
