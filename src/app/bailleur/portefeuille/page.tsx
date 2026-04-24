import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPE_LABEL } from "@/data/taxonomy";

export const metadata: Metadata = {
  title: "Mon portefeuille — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function PortefeuillePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/bailleur/portefeuille");
  const roles = session.user.roles ?? [];
  if (!roles.includes("BAILLEUR") && !roles.includes("AGENCY") && !roles.includes("ADMIN")) {
    redirect("/bailleur/onboarding");
  }

  if (!hasDb()) return null;

  const properties = await db.property.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      listings: {
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          transaction: true,
          price: true,
        },
        orderBy: { createdAt: "desc" },
      },
      leases: {
        select: {
          id: true,
          status: true,
          tenantUser: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const activeLeaseCount = properties.filter((p) =>
    p.leases.some((l) => l.status === "ACTIVE"),
  ).length;

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/compte" className="hover:text-midnight">Mon compte</Link>
        <span className="mx-2">·</span>
        <span>Portefeuille</span>
      </nav>

      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Biens physiques</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">
            Mon <span className="text-terracotta">portefeuille</span>.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {properties.length} bien{properties.length > 1 ? "s" : ""} ·{" "}
            {activeLeaseCount} loué{activeLeaseCount > 1 ? "s" : ""}
          </p>
        </div>
      </header>

      {properties.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center">
          <p className="display-md text-xl">Aucun bien enregistré.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Chaque annonce publiée génère automatiquement un « bien »
            dans votre portefeuille. Publiez votre premier bien pour
            commencer.
          </p>
          <Link
            href="/publier"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-terracotta px-5 text-sm font-semibold text-cream hover:bg-terracotta-2"
          >
            Publier une annonce →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => {
            const city = CITIES.find((c) => c.slug === p.citySlug);
            const activeLease = p.leases.find((l) => l.status === "ACTIVE");
            const publishedListing = p.listings.find(
              (l) => l.status === "PUBLISHED",
            );
            return (
              <li
                key={p.id}
                className="flex flex-col rounded-2xl border border-midnight/10 bg-cream p-5"
              >
                <p className="eyebrow">
                  {city?.name.toUpperCase() ?? p.citySlug.toUpperCase()}
                </p>
                <h3 className="display-lg mt-2 text-lg">
                  {p.label ?? PROPERTY_TYPE_LABEL[p.propertyType]}
                </h3>
                <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {PROPERTY_TYPE_LABEL[p.propertyType]}
                  {p.surface && ` · ${p.surface} M²`}
                  {p.bedrooms != null && ` · ${p.bedrooms} CH`}
                </p>

                <div className="mt-4 flex-1 space-y-2 text-sm">
                  {activeLease ? (
                    <div className="rounded-lg bg-forest/10 px-3 py-2">
                      <p className="mono text-[9px] uppercase tracking-[0.12em] text-forest">
                        LOUÉ ·{" "}
                        {activeLease.tenantUser.name ??
                          activeLease.tenantUser.email}
                      </p>
                    </div>
                  ) : publishedListing ? (
                    <div className="rounded-lg bg-terracotta/10 px-3 py-2">
                      <p className="mono text-[9px] uppercase tracking-[0.12em] text-terracotta">
                        ANNONCE PUBLIÉE
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-midnight/5 px-3 py-2">
                      <p className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                        VACANT
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-midnight/10 pt-4">
                  {publishedListing && (
                    <Link
                      href={`/annonce/${publishedListing.slug}`}
                      className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] font-medium text-midnight hover:border-midnight"
                    >
                      Voir l'annonce
                    </Link>
                  )}
                  {activeLease && (
                    <Link
                      href={`/bailleur/baux/${activeLease.id}`}
                      className="rounded-full border border-midnight/20 px-3 py-1 text-[11px] font-medium text-midnight hover:border-midnight"
                    >
                      Voir le bail
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
