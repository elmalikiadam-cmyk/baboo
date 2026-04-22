import Link from "next/link";
import { BabooLogo } from "@/components/layout/baboo-logo";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL_PLURAL } from "@/data/taxonomy";
import { buildSearchHref } from "@/lib/search-params";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-cream-2">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="text-midnight">
              <BabooLogo size={24} />
            </div>
            <p className="mt-5 max-w-xs text-sm text-muted-foreground">
              Annonces immobilières au Maroc — particuliers et professionnels, achat et location.
            </p>
          </div>

          <nav aria-label="Annonces">
            <h4 className="eyebrow-muted mb-4">Annonces</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link className="text-muted-foreground hover:text-midnight" href={buildSearchHref({ transaction: "SALE" })}>Acheter</Link></li>
              <li><Link className="text-muted-foreground hover:text-midnight" href={buildSearchHref({ transaction: "RENT" })}>Louer</Link></li>
              <li><Link className="text-muted-foreground hover:text-midnight" href="/pro/publier">Déposer une annonce</Link></li>
            </ul>
          </nav>

          <nav aria-label="Par type">
            <h4 className="eyebrow-muted mb-4">Par type</h4>
            <ul className="space-y-2.5 text-sm">
              {PROPERTY_TYPES.slice(0, 6).map((t) => (
                <li key={t}>
                  <Link
                    className="text-muted-foreground hover:text-midnight"
                    href={buildSearchHref({ transaction: "SALE", propertyTypes: [t] })}
                  >
                    {PROPERTY_TYPE_LABEL_PLURAL[t]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Baboo">
            <h4 className="eyebrow-muted mb-4">Baboo</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link className="text-muted-foreground hover:text-midnight" href="/a-propos">À propos</Link></li>
              <li><Link className="text-muted-foreground hover:text-midnight" href="/pro">Espace Pro</Link></li>
              <li><Link className="text-muted-foreground hover:text-midnight" href="/contact">Contact</Link></li>
              <li><Link className="text-muted-foreground hover:text-midnight" href="/mentions-legales">Mentions légales</Link></li>
              <li><Link className="text-muted-foreground hover:text-midnight" href="/cgu">Conditions d'utilisation</Link></li>
              <li><Link className="text-muted-foreground hover:text-midnight" href="/confidentialite">Confidentialité</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Baboo. Tous droits réservés.</p>
          <p>Prix exprimés en dirhams (MAD). Surfaces en m².</p>
        </div>
      </div>
    </footer>
  );
}
