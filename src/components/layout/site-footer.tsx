import Link from "next/link";
import { BabooLogo } from "@/components/ui/icons";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL_PLURAL } from "@/data/taxonomy";
import { buildSearchHref } from "@/lib/search-params";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-foreground/15 bg-ink text-ink-foreground">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <BabooLogo variant="light" className="h-9 w-auto" />
            <p className="mt-5 max-w-xs text-sm text-ink-foreground/70">
              Annonces immobilières de particuliers et professionnels, partout au Maroc.
            </p>
          </div>

          <nav aria-label="Annonces" className="text-sm">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-foreground/50">Annonces</h4>
            <ul className="space-y-3">
              <li><Link className="hover:underline" href={buildSearchHref({ transaction: "SALE" })}>Acheter</Link></li>
              <li><Link className="hover:underline" href={buildSearchHref({ transaction: "RENT" })}>Louer</Link></li>
              <li><Link className="hover:underline" href="/pro/publier">Déposer une annonce</Link></li>
            </ul>
          </nav>

          <nav aria-label="Types" className="text-sm">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-foreground/50">Par type</h4>
            <ul className="space-y-3">
              {PROPERTY_TYPES.slice(0, 6).map((t) => (
                <li key={t}>
                  <Link
                    className="hover:underline"
                    href={buildSearchHref({ transaction: "SALE", propertyTypes: [t] })}
                  >
                    {PROPERTY_TYPE_LABEL_PLURAL[t]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Baboo" className="text-sm">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-foreground/50">Baboo</h4>
            <ul className="space-y-3">
              <li><Link className="hover:underline" href="/a-propos">À propos</Link></li>
              <li><Link className="hover:underline" href="/pro">Espace Pro</Link></li>
              <li><Link className="hover:underline" href="/contact">Contact</Link></li>
              <li><Link className="hover:underline" href="/mentions-legales">Mentions légales</Link></li>
              <li><Link className="hover:underline" href="/cgu">Conditions d'utilisation</Link></li>
              <li><Link className="hover:underline" href="/confidentialite">Confidentialité</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-ink-foreground/10 pt-8 text-xs text-ink-foreground/55 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Baboo. Tous droits réservés.</p>
          <p>Prix exprimés en dirhams (MAD).</p>
        </div>
      </div>
    </footer>
  );
}
