import Link from "next/link";
import { CITIES } from "@/data/cities";
import { BabooLogo } from "@/components/ui/icons";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL_PLURAL } from "@/data/taxonomy";
import { buildSearchHref } from "@/lib/search-params";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-foreground text-background/90">
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="text-background"><BabooLogo className="h-8 w-auto" /></div>
            <p className="mt-4 max-w-xs text-sm text-background/70">
              Baboo est la plateforme immobilière premium du Maroc. Nous sélectionnons chaque annonce avec soin pour vous offrir une recherche sereine.
            </p>
          </div>

          <nav aria-label="Acheter" className="text-sm">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-background/60">Acheter</h4>
            <ul className="space-y-2">
              {CITIES.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link className="hover:text-background" href={buildSearchHref({ transaction: "SALE", citySlug: c.slug })}>
                    Immobilier à {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Louer" className="text-sm">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-background/60">Louer</h4>
            <ul className="space-y-2">
              {CITIES.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link className="hover:text-background" href={buildSearchHref({ transaction: "RENT", citySlug: c.slug })}>
                    Locations à {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Baboo" className="text-sm">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-background/60">Baboo</h4>
            <ul className="space-y-2">
              <li><Link className="hover:text-background" href="/a-propos">À propos</Link></li>
              <li><Link className="hover:text-background" href="/pro">Espace Pro</Link></li>
              <li><Link className="hover:text-background" href="/pro/publier">Publier une annonce</Link></li>
              <li><Link className="hover:text-background" href="/contact">Contact</Link></li>
              <li><Link className="hover:text-background" href="/mentions-legales">Mentions légales</Link></li>
              <li><Link className="hover:text-background" href="/confidentialite">Confidentialité</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-background/10 pt-8">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-background/60">Rechercher par type</h4>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {PROPERTY_TYPES.map((t) => (
              <li key={t}>
                <Link
                  className="text-background/70 hover:text-background"
                  href={buildSearchHref({ transaction: "SALE", propertyTypes: [t] })}
                >
                  {PROPERTY_TYPE_LABEL_PLURAL[t]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 text-xs text-background/60 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Baboo — Fait avec soin au Maroc.</p>
          <p>Les prix sont indicatifs et exprimés en dirhams (MAD).</p>
        </div>
      </div>
    </footer>
  );
}
