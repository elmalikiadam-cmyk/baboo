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

  return (
    <>
      {/* Hero — centered, quiet, search-first */}
      <section className="container pb-16 pt-16 md:pb-24 md:pt-28">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <h1 className="display-xl text-4xl md:text-[clamp(2.5rem,5.5vw,4.75rem)]">
            Trouvez votre prochain logement.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Annonces de particuliers et professionnels. Achat, location, partout au Maroc.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            <Link href="/recherche?t=sale" className="pill-soft">Je veux acheter</Link>
            <Link href="/recherche?t=rent" className="pill-soft">Je veux louer</Link>
            <Link href="/pro/publier" className="pill-soft">Je veux publier une annonce</Link>
          </div>

          <div className="mt-10 flex w-full justify-center">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Latest listings */}
      {latest.length > 0 && (
        <section className="container py-16 md:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
            <h2 className="display-xl text-3xl md:text-5xl">Dernières annonces.</h2>
            <Link href="/recherche" className="pill-soft">Voir tout</Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
