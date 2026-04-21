import Image from "next/image";
import Link from "next/link";
import { CITIES, FEATURED_CITY_SLUGS } from "@/data/cities";
import { buildSearchHref } from "@/lib/search-params";

interface CityCount {
  citySlug: string;
  count: number;
}

interface Props {
  counts?: CityCount[];
}

export function CityStrip({ counts = [] }: Props) {
  const countMap = new Map(counts.map((c) => [c.citySlug, c.count]));
  const cities = FEATURED_CITY_SLUGS
    .map((slug) => CITIES.find((c) => c.slug === slug))
    .filter((c): c is (typeof CITIES)[number] => !!c);

  return (
    <section className="container py-16 md:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-foreground/15 pb-4">
        <div>
          <p className="eyebrow">Explorer</p>
          <h2 className="display-xl mt-2 text-3xl md:text-5xl">Par ville.</h2>
        </div>
        <Link href="/villes" className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
          Toutes les villes →
        </Link>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((c) => {
          const count = countMap.get(c.slug);
          return (
            <li key={c.slug}>
              <Link
                href={buildSearchHref({ transaction: "SALE", citySlug: c.slug })}
                className="group relative block aspect-[16/9] overflow-hidden rounded-md bg-foreground/5"
              >
                {c.cover && (
                  <Image
                    src={c.cover}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 92vw"
                    className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-background">
                  <div>
                    <p className="mono text-[10px] uppercase tracking-[0.14em] text-background/75">
                      {c.region}
                    </p>
                    <h3 className="display-xl mt-1 text-3xl text-background">
                      {c.name}
                    </h3>
                  </div>
                  {count != null && (
                    <span className="mono text-[10px] uppercase tracking-[0.14em] text-background/85">
                      {count} annonce{count > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
