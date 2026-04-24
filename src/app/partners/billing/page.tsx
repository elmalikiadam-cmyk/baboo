import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Facturation — Partners Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function PartnersBillingPage() {
  const session = await auth();
  if (!session?.user?.email)
    redirect("/connexion?callbackUrl=/partners/billing");
  if (!hasDb()) notFound();

  const partner = await db.partnerAgency.findUnique({
    where: { contactEmail: session.user.email.toLowerCase() },
    select: {
      id: true,
      name: true,
      creditBalance: true,
      totalSpent: true,
    },
  });
  if (!partner) redirect("/partners");

  const unlocks = await db.partnerLeadUnlock.findMany({
    where: { partnerId: partner.id },
    orderBy: { unlockedAt: "desc" },
    include: {
      searchRequest: {
        select: {
          contactName: true,
          citySlug: true,
          transaction: true,
          budgetMax: true,
        },
      },
    },
    take: 100,
  });

  return (
    <div className="container max-w-4xl py-10 md:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link href="/partners/inbox" className="hover:text-midnight">
          Inbox
        </Link>
        <span className="mx-2">·</span>
        <span>Facturation</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Baboo Partners · {partner.name}</p>
        <h1 className="display-xl mt-2 text-3xl md:text-4xl">Facturation.</h1>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Stat
          label="Solde disponible"
          value={`${partner.creditBalance.toLocaleString("fr-FR")} MAD`}
          tone="accent"
        />
        <Stat
          label="Total dépensé"
          value={`${partner.totalSpent.toLocaleString("fr-FR")} MAD`}
        />
      </section>

      <div className="mt-8 rounded-2xl border border-midnight/10 bg-cream p-5">
        <p className="eyebrow">Recharger le solde</p>
        <p className="mt-3 text-sm text-midnight">
          Virement bancaire ou CMI — envoyez le justificatif à{" "}
          <a
            href="mailto:partners@baboo.ma"
            className="font-semibold text-terracotta hover:underline"
          >
            partners@baboo.ma
          </a>
          . Crédité sous 24 h ouvrées.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="display-md text-xl">Historique des déblocages</h2>
        {unlocks.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-6 text-center text-sm text-muted-foreground">
            Aucun lead débloqué pour l'instant.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {unlocks.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-midnight/10 bg-cream p-3 text-sm"
              >
                <div>
                  <p>
                    <strong>
                      {u.searchRequest.contactName} — {u.searchRequest.citySlug}
                    </strong>{" "}
                    <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {u.searchRequest.transaction} · budget{" "}
                      {u.searchRequest.budgetMax.toLocaleString("fr-FR")} MAD
                    </span>
                  </p>
                  <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {u.unlockedAt.toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span className="mono text-xs text-terracotta">
                  −{u.pricePaid} MAD
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "accent";
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        tone === "accent"
          ? "border-terracotta/30 bg-terracotta/5"
          : "border-midnight/10 bg-cream"
      }`}
    >
      <p
        className={`mono text-[10px] uppercase tracking-[0.12em] ${
          tone === "accent" ? "text-terracotta" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      <p
        className={`display-xl mt-2 text-2xl ${
          tone === "accent" ? "text-terracotta" : "text-midnight"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
