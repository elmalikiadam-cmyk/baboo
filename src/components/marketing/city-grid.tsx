import Image from "next/image";
import Link from "next/link";
import { CITIES, FEATURED_CITY_SLUGS } from "@/data/cities";
import { buildSearchHref } from "@/lib/search-params";

export function CityGrid() {
  const featured = FEATURED_CITY_SLUGS
    .map((slug) => CITIES.find((c) => c.slug === slug))
    .filter((c): c is (typeof CITIES)[number] => !!c);

  return (
    <section className="container py-16 md:py-20">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent-foreground/80">Explorer</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Les villes à découvrir</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Du bord de mer de Tanger à la Palmeraie de Marrakech, trouvez le cadre qui vous ressemble.
          </p>
        </div>
        <Link
          href="/villes"
          className="hidden shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-foreground/5 md:inline-block"
        >
          Toutes les villes →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((c, i) => (
          <Link
            key={c.slug}
            href={buildSearchHref({ transaction: "SALE", citySlug: c.slug })}
            className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-foreground/5"
          >
            <Image
              src={c.cover}
              alt={`Immobilier à ${c.name}`}
              fill
              sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 92vw"
              priority={i < 2}
              className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-xs uppercase tracking-widest text-white/70">{c.region}</p>
              <h3 className="mt-1 font-display text-2xl font-semibold">{c.name}</h3>
              <p className="mt-1 line-clamp-1 text-sm text-white/85">{c.tagline}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white">
                Découvrir les biens <span aria-hidden>→</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
