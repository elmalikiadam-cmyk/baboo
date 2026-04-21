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
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="glass mx-auto flex h-14 max-w-7xl items-center rounded-full px-4 md:h-16 md:px-6">
        <Link
          href="/"
          aria-label="Baboo, accueil"
          className="text-foreground transition-opacity hover:opacity-80"
        >
          <BabooLogo className="h-7 w-auto md:h-8" />
        </Link>

        <nav className="mx-auto hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
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
