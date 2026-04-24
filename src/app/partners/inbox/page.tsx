import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { UnlockLeadButton } from "@/components/partners/unlock-button";

export const metadata: Metadata = {
  title: "Inbox — Partners Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function PartnersInboxPage() {
  const session = await auth();
  if (!session?.user?.email)
    redirect("/connexion?callbackUrl=/partners/inbox");
  if (!hasDb()) notFound();

  const partner = await db.partnerAgency.findUnique({
    where: { contactEmail: session.user.email.toLowerCase() },
    select: {
      id: true,
      name: true,
      citySlugs: true,
      creditBalance: true,
      active: true,
    },
  });
  if (!partner) redirect("/partners");

  // SearchRequests dans les villes couvertes, non encore routées à ce
  // partenaire, pas encore expirées.
  const leads = await db.searchRequest.findMany({
    where: {
      citySlug: { in: partner.citySlugs },
      status: { in: ["ACTIVE", "MATCHED", "ROUTED"] },
      consentGiven: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      partnerUnlocks: {
        where: { partnerId: partner.id },
        select: { id: true, pricePaid: true, unlockedAt: true },
      },
    },
  });

  return (
    <div className="container py-10 md:py-16">
      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Baboo Partners · {partner.name}</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">
            Leads disponibles.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Villes couvertes : {partner.citySlugs.join(", ")}. Débloquer
            un lead révèle ses coordonnées et décrémente votre solde de
            500 MAD.
          </p>
        </div>
        <div className="rounded-2xl border border-terracotta/30 bg-terracotta/5 p-4 text-center">
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-terracotta">
            Solde
          </p>
          <p className="display-xl mt-2 text-2xl text-terracotta">
            {partner.creditBalance.toLocaleString("fr-FR")}{" "}
            <span className="mono text-[10px] text-muted-foreground">MAD</span>
          </p>
          <Link
            href="/partners/billing"
            className="mono mt-2 inline-block text-[10px] uppercase tracking-[0.12em] text-midnight hover:text-terracotta"
          >
            Voir factures →
          </Link>
        </div>
      </header>

      {leads.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center text-sm text-muted-foreground">
          Pas de demande à traiter pour l'instant. Revenez dans la
          matinée, les demandes arrivent en continu.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {leads.map((l) => {
            const unlocked = l.partnerUnlocks[0];
            return (
              <li
                key={l.id}
                className="rounded-2xl border border-midnight/10 bg-cream p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="display-md text-base">
                      {l.transaction === "RENT" ? "Location" : "Achat"} ·{" "}
                      {l.propertyType} · {l.citySlug}
                      {l.neighborhoodSlugs.length > 0 &&
                        ` (${l.neighborhoodSlugs.join(", ")})`}
                    </p>
                    <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Budget max{" "}
                      {l.budgetMax.toLocaleString("fr-FR")} MAD ·{" "}
                      {l.minBedrooms ?? "—"} ch ·{" "}
                      {l.minSurface ?? "—"} m² ·{" "}
                      Délai : {l.timeline ?? "flexible"}
                    </p>
                  </div>
                  <span
                    className={`mono rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                      unlocked
                        ? "bg-forest/15 text-forest"
                        : "bg-midnight/10 text-muted-foreground"
                    }`}
                  >
                    {unlocked ? "Débloqué" : l.status}
                  </span>
                </div>
                {l.freeText && (
                  <p className="mt-3 line-clamp-2 text-xs italic text-muted-foreground">
                    « {l.freeText} »
                  </p>
                )}
                {unlocked ? (
                  <div className="mt-4 rounded-xl bg-white p-4">
                    <p className="mono text-[10px] uppercase tracking-[0.12em] text-forest">
                      ✓ Coordonnées
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {l.contactName}
                    </p>
                    <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {l.contactEmail} · {l.contactPhone}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <UnlockLeadButton
                      partnerId={partner.id}
                      searchRequestId={l.id}
                      balance={partner.creditBalance}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
