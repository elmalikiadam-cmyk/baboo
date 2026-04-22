import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BabooLogo } from "@/components/layout/baboo-logo";
import { UserMenu } from "@/components/layout/user-menu";
import { MessageCircleIcon } from "@/components/ui/icons";
import { auth } from "@/auth";
import { countUnreadConversations } from "@/lib/messaging";

const NAV = [
  { href: "/recherche?t=sale", label: "Acheter" },
  { href: "/recherche?t=rent", label: "Louer" },
  { href: "/projets", label: "Projets neufs" },
  { href: "/pro", label: "Espace Pro" },
];

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;
  const unread = user?.id ? await countUnreadConversations(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-md md:h-20">
      <div className="container flex h-full items-center gap-8">
        <Link
          href="/"
          aria-label="Baboo, accueil"
          className="shrink-0 text-ink transition-opacity hover:opacity-80"
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
          {user ? (
            <>
              <Link
                href="/messages"
                aria-label="Messagerie"
                className="relative hidden h-9 w-9 place-items-center rounded-full border border-border bg-surface-warm text-ink transition-colors hover:bg-surface-cool md:grid"
              >
                <MessageCircleIcon className="h-4 w-4" />
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
                isDeveloper={user.role === "DEVELOPER"}
                isAdmin={user.role === "ADMIN"}
                unreadMessages={unread}
              />
            </>
          ) : (
            <div className="hidden md:flex md:items-center md:gap-2">
              <Link href="/connexion">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link href="/pro/publier">
                <Button size="sm">Publier une annonce</Button>
              </Link>
            </div>
          )}
          {!user && (
            <Link
              href="/connexion"
              aria-label="Connexion"
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-warm text-xs font-semibold text-ink md:hidden"
            >
              SE
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
