import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BabooLogo, HeartIcon } from "@/components/ui/icons";

const NAV = [
  { href: "/recherche?t=sale", label: "Acheter" },
  { href: "/recherche?t=rent", label: "Louer" },
  { href: "/projets", label: "Projets neufs" },
  { href: "/agences", label: "Agences" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-8">
        <Link href="/" aria-label="Baboo, accueil" className="text-primary">
          <BabooLogo className="h-7 w-auto" />
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/favoris"
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5 md:inline-flex"
          >
            <HeartIcon className="h-4 w-4" />
            Favoris
          </Link>
          <Link href="/pro" className="hidden text-sm text-foreground/80 hover:text-foreground md:inline-block">
            Espace Pro
          </Link>
          <Link href="/connexion">
            <Button variant="outline" size="sm">Se connecter</Button>
          </Link>
          <Link href="/pro/publier" className="hidden md:inline-block">
            <Button size="sm">Déposer une annonce</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
