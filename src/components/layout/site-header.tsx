import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BabooLogo } from "@/components/ui/icons";
import { UserMenu } from "@/components/layout/user-menu";
import { auth } from "@/auth";

const NAV = [
  { href: "/recherche?t=sale", label: "Acheter" },
  { href: "/recherche?t=rent", label: "Louer" },
  { href: "/projets", label: "Projets neufs" },
  { href: "/pro/publier", label: "Déposer" },
  { href: "/pro", label: "Espace Pro" },
];

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/15 bg-background">
      <div className="container flex h-16 items-center gap-8 md:h-20">
        <Link href="/" aria-label="Baboo, accueil" className="shrink-0">
          <BabooLogo className="h-7 w-auto md:h-8" />
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

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <UserMenu
              name={user.name ?? user.email ?? "Compte"}
              email={user.email ?? ""}
              agencySlug={user.agencySlug ?? null}
              agencyName={user.agencyName ?? null}
              isAgency={user.role === "AGENCY"}
              isAdmin={user.role === "ADMIN"}
            />
          ) : (
            <Link href="/connexion">
              <Button size="sm">Connexion</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
