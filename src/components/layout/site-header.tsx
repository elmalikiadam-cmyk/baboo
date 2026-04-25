import Link from "next/link";
import { BabooLogo } from "@/components/layout/baboo-logo";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationBell } from "@/components/layout/notification-bell";
import { MessageCircleIcon } from "@/components/ui/icons";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { countUnreadConversations } from "@/lib/messaging";
import { countUnreadNotifications } from "@/lib/notifications";

const NAV_ITEMS = [
  { label: "Acheter", href: "/recherche?t=sale" },
  { label: "Louer", href: "/recherche?t=rent" },
  { label: "Je cherche", href: "/je-cherche" },
  { label: "Projets neufs", href: "/projets" },
  { label: "Conseils", href: "/conseils" },
];

/**
 * V3 « Éditorial chaleureux » — header sticky sur fond cream 95% + backdrop.
 * Logo baboo. à gauche, nav centrale, lien "Publier une annonce" + pill
 * outline "Se connecter" à droite.
 */
export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;
  const unread = user?.id ? await countUnreadConversations(user.id) : 0;
  const unreadNotifications = user?.id
    ? await countUnreadNotifications(user.id)
    : 0;
  const recentNotifications =
    user?.id && hasDb()
      ? await db.notification
          .findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
              id: true,
              type: true,
              title: true,
              body: true,
              linkUrl: true,
              readAt: true,
              createdAt: true,
            },
          })
          .then((rows) =>
            rows.map((r) => ({
              id: r.id,
              type: r.type,
              title: r.title,
              body: r.body,
              linkUrl: r.linkUrl,
              readAt: r.readAt ? r.readAt.toISOString() : null,
              createdAt: r.createdAt.toISOString(),
            })),
          )
          .catch(() => [])
      : [];

  return (
    <header className="sticky top-0 z-40 border-b border-midnight/10 bg-cream/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex items-center" aria-label="Accueil Baboo">
          <BabooLogo height={28} />
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navigation principale"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-midnight transition-colors hover:text-terracotta"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <NotificationBell
                unread={unreadNotifications}
                recent={recentNotifications}
              />
              <Link
                href="/messages"
                aria-label="Messagerie"
                className="relative grid h-10 w-10 place-items-center rounded-full border border-midnight/20 bg-white text-midnight transition-colors hover:border-midnight"
              >
                <MessageCircleIcon className="h-4 w-4" />
                {unread > 0 && (
                  <span
                    aria-label={`${unread} non lu${unread > 1 ? "s" : ""}`}
                    className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-terracotta px-1 text-[9px] font-semibold text-cream"
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
                isAgency={(user.roles ?? []).includes("AGENCY") || user.role === "AGENCY"}
                isDeveloper={(user.roles ?? []).includes("DEVELOPER") || user.role === "DEVELOPER"}
                isAdmin={(user.roles ?? []).includes("ADMIN") || user.role === "ADMIN"}
                isLandlord={(user.roles ?? []).includes("BAILLEUR")}
                isTenant={(user.roles ?? []).includes("LOCATAIRE")}
                isVisitAgent={(user.roles ?? []).includes("VISIT_AGENT") || user.role === "VISIT_AGENT"}
                unreadMessages={unread}
              />
            </>
          ) : (
            <>
              <Link
                href="/publier"
                className="text-sm font-medium text-midnight transition-colors hover:text-terracotta"
              >
                Publier une annonce
              </Link>
              <Link
                href="/connexion"
                className="inline-flex h-11 items-center rounded-full border-2 border-midnight px-6 text-sm font-medium text-midnight transition-colors hover:bg-midnight hover:text-cream"
              >
                Se connecter
              </Link>
            </>
          )}
        </div>

        {/* Mobile : notif bell + avatar (cliquable vers /compte) ou bouton connexion */}
        <div className="flex items-center gap-2 md:hidden">
          {user ? (
            <>
              <NotificationBell
                unread={unreadNotifications}
                recent={recentNotifications}
              />
              <Link
                href="/compte"
                aria-label="Mon compte"
                className="grid h-10 w-10 place-items-center rounded-full bg-midnight text-cream transition-colors hover:bg-midnight/90"
              >
                <span className="mono text-[11px] font-semibold">
                  {(user.name ?? user.email ?? "?")
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0] ?? "")
                    .join("")
                    .toUpperCase()}
                </span>
              </Link>
            </>
          ) : (
            <Link
              href="/connexion"
              aria-label="Se connecter"
              className="inline-flex h-10 items-center rounded-full border-2 border-midnight px-4 text-xs font-semibold text-midnight"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
