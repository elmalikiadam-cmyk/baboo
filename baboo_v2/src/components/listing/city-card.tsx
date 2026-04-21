import Link from "next/link";
import Image from "next/image";
import type { City } from "@/data/cities";

interface Props {
  city: City;
  count: number;
}

/**
 * Carte ville du carrousel "Explorer par ville".
 * 140 × 170, rounded-2xl, photo avec overlay sombre + dots,
 * texte blanc en bas.
 */
export function CityCard({ city, count }: Props) {
  return (
    <Link
      href={`/recherche?city=${city.slug}`}
      className="group relative block h-[170px] w-[140px] shrink-0 overflow-hidden rounded-2xl bg-surface-cool"
      aria-label={`${city.name}, ${count} annonces`}
    >
      {city.cover && (
        <Image
          src={city.cover}
          alt=""
          fill
          sizes="140px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      )}
      {/* Overlay sombre + motif points */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 dot-pattern" aria-hidden />

      <div className="absolute inset-x-3 bottom-3 text-ink-foreground">
        <p className="display-md text-[1.25rem] leading-none text-ink-foreground">
          {city.name}
        </p>
        <p className="mt-1 text-[11px] opacity-85">{count} annonces</p>
      </div>
    </Link>
  );
}
