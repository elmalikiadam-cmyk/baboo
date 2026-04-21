import Link from "next/link";
import { BabooLogo } from "@/components/layout/baboo-logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/recherche?t=sale", label: "Acheter" },
  { href: "/recherche?t=rent", label: "Louer" },
  { href: "/pro", label: "Espace Pro" },
];

/**
 * Header mobile : logo + avatar. La nav principale vit dans la bottom nav.
 * Header desktop : logo + nav texte + CTA "Publier une annonce".
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-full items-center gap-8">
        <Link
          href="/"
          aria-label="Baboo, accueil"
          className="shrink-0 text-ink hover:opacity-80"
        >
          <BabooLogo size={22} />
        </Link>

        <nav className="mx-auto hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Avatar placeholder sur mobile — on n'a pas d'auth. */}
          <div className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-warm text-xs font-semibold text-ink md:hidden">
            SA
          </div>
          <div className="hidden md:flex md:items-center md:gap-2">
            <Link href="/connexion">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/pro">
              <Button size="sm">Publier une annonce</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
