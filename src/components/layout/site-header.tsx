import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BabooLogo } from "@/components/ui/icons";

const NAV = [
  { href: "/recherche?t=sale", label: "Acheter" },
  { href: "/recherche?t=rent", label: "Louer" },
  { href: "/pro/publier", label: "Déposer une annonce" },
  { href: "/pro", label: "Espace Pro" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-20 items-center">
        <Link href="/" aria-label="Baboo, accueil" className="text-foreground">
          <BabooLogo className="h-8 w-auto" />
        </Link>

        <nav className="mx-auto hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/connexion">
            <Button size="sm">Connexion</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
