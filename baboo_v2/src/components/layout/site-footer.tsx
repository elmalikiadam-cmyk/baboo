import Link from "next/link";
import { BabooLogo } from "@/components/layout/baboo-logo";
import { CITIES } from "@/data/cities";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-surface-warm">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="text-ink">
              <BabooLogo size={24} />
            </div>
            <p className="mt-5 max-w-xs text-sm text-ink-soft">
              Annonces immobilières au Maroc — particuliers et professionnels, achat et location.
            </p>
          </div>

          <nav aria-label="À propos">
            <h4 className="eyebrow-muted mb-4">À propos</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link className="text-ink-soft hover:text-ink" href="/pro">Espace Pro</Link></li>
              <li><Link className="text-ink-soft hover:text-ink" href="/connexion">Connexion</Link></li>
              <li><Link className="text-ink-soft hover:text-ink" href="/inscription">Créer un compte</Link></li>
            </ul>
          </nav>

          <nav aria-label="Villes">
            <h4 className="eyebrow-muted mb-4">Villes</h4>
            <ul className="space-y-2.5 text-sm">
              {CITIES.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link
                    className="text-ink-soft hover:text-ink"
                    href={`/recherche?city=${c.slug}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Légal">
            <h4 className="eyebrow-muted mb-4">Légal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link className="text-ink-soft hover:text-ink" href="/mentions-legales">Mentions légales</Link></li>
              <li><Link className="text-ink-soft hover:text-ink" href="/confidentialite">Confidentialité</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-ink-muted md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Baboo. Tous droits réservés.</p>
          <p>Prix exprimés en dirhams (MAD). Surfaces en m².</p>
        </div>
      </div>
    </footer>
  );
}
