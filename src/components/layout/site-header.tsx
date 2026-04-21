import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BabooLogo } from "@/components/ui/icons";
import { UserMenu } from "@/components/layout/user-menu";
import { auth } from "@/auth";
import { countUnreadConversations } from "@/lib/messaging";

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
  const unread = user?.id ? await countUnreadConversations(user.id) : 0;

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
            <>
              <Link
                href="/messages"
                aria-label="Messagerie"
                className="relative hidden h-9 w-9 place-items-center rounded-full border border-foreground/15 bg-surface text-foreground transition hover:bg-foreground/5 md:grid"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M21 12a8 8 0 0 1-11.6 7.15L3 21l1.85-6.4A8 8 0 1 1 21 12Z" />
                </svg>
                {unread > 0 && (
                  <span
                    aria-label={`${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}`}
                    className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-accent-foreground"
                  >
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <UserMenu
                name={user.name ?? user.email ?? "Compte"}
                email={user.email ?? ""}
                agencySlug={user.agencySlug ?? null}
                agencyName={user.agencyName ?? null}
                isAgency={user.role === "AGENCY"}
                isAdmin={user.role === "ADMIN"}
                unreadMessages={unread}
              />
            </>
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
