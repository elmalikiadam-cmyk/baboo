import Link from "next/link";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL_PLURAL } from "@/data/taxonomy";
import { buildSearchHref } from "@/lib/search-params";

// Subtle custom glyphs to avoid emoji/noisy icons. Serif-ish capital letter.
const GLYPH: Record<(typeof PROPERTY_TYPES)[number], string> = {
  APARTMENT: "A",
  VILLA: "V",
  RIAD: "R",
  HOUSE: "M",
  OFFICE: "B",
  COMMERCIAL: "C",
  LAND: "T",
  INDUSTRIAL: "I",
  BUILDING: "I",
};

export function PropertyTypeRow() {
  return (
    <section className="container py-16 md:py-20">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent-foreground/80">Parcourir</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Par type de bien</h2>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {PROPERTY_TYPES.slice(0, 6).map((t) => (
          <li key={t}>
            <Link
              href={buildSearchHref({ transaction: "SALE", propertyTypes: [t] })}
              className="group flex h-full flex-col items-start gap-3 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-foreground/20 hover:bg-foreground/[0.02]"
            >
              <span
                aria-hidden
                className="grid h-10 w-10 place-items-center rounded-lg bg-primary/8 font-display text-lg font-semibold text-primary"
              >
                {GLYPH[t]}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{PROPERTY_TYPE_LABEL_PLURAL[t]}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Voir les annonces →</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
