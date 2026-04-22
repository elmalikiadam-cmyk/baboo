import Link from "next/link";
import Image from "next/image";

interface City {
  slug: string;
  name: string;
  cover?: string | null;
}

interface Props {
  city: City;
  count: number;
}

/**
 * Carte ville du carrousel "Explorer par ville". V2 : 140×170, rounded-2xl,
 * photo avec overlay sombre + pattern points, texte blanc en bas.
 */
export function CityCard({ city, count }: Props) {
  return (
    <Link
      href={`/recherche?city=${city.slug}`}
      className="group relative block h-[170px] w-[140px] shrink-0 overflow-hidden rounded-2xl bg-cream-3"
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
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 dot-pattern" aria-hidden />
      <div className="absolute inset-x-3 bottom-3 text-cream">
        <p className="display-md text-[1.25rem] leading-none text-cream">
          {city.name}
        </p>
        <p className="mt-1 text-[11px] opacity-85">{count} annonces</p>
      </div>
    </Link>
  );
}
