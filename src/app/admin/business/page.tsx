import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Admin · Business — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const FR = new Intl.NumberFormat("fr-FR");

export default async function AdminBusinessPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/admin/business");
  if (session.user.role !== "ADMIN") redirect("/");
  if (!hasDb()) return null;

  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const d7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

  const [
    totalUsers,
    newUsers30d,
    totalListings,
    publishedListings,
    newListings30d,
    totalApps,
    appsAccepted,
    totalLeases,
    leasesActive,
    totalPayments,
    totalRentCollected,
    pendingKyc,
    unverifiedCraftsmen,
    totalCraftsmen,
    visitsLast7d,
    savedSearchesActive,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: d30 } } }),
    db.listing.count(),
    db.listing.count({ where: { status: "PUBLISHED" } }),
    db.listing.count({ where: { createdAt: { gte: d30 } } }),
    db.tenantApplication.count(),
    db.tenantApplication.count({ where: { status: "ACCEPTED" } }),
    db.lease.count(),
    db.lease.count({ where: { status: "ACTIVE" } }),
    db.payment.count(),
    db.payment.aggregate({ _sum: { amount: true } }),
    db.landlordVerification.count({ where: { status: "PENDING" } }),
    db.craftsman.count({ where: { verified: false } }),
    db.craftsman.count(),
    db.visitBooking.count({ where: { createdAt: { gte: d7 } } }),
    db.savedSearch.count({ where: { paused: false } }),
  ]);

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/admin" className="hover:text-midnight">Admin</Link>
        <span className="mx-2">·</span>
        <span>Business</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Dashboard</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Pilotage <span className="text-terracotta">Baboo</span>.
        </h1>
      </header>

      <section className="mt-10">
        <h2 className="display-md text-xl">Utilisateurs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Comptes totaux" value={FR.format(totalUsers)} />
          <Kpi
            label="Nouveaux (30j)"
            value={FR.format(newUsers30d)}
            tone="success"
          />
          <Kpi
            label="Alertes actives"
            value={FR.format(savedSearchesActive)}
          />
          <Kpi
            label="Visites réservées (7j)"
            value={FR.format(visitsLast7d)}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="display-md text-xl">Inventaire</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Annonces totales" value={FR.format(totalListings)} />
          <Kpi
            label="Publiées"
            value={FR.format(publishedListings)}
            tone="success"
          />
          <Kpi label="Nouvelles (30j)" value={FR.format(newListings30d)} />
          <Kpi label="Artisans" value={`${FR.format(totalCraftsmen)}`} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="display-md text-xl">Funnel location</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Candidatures" value={FR.format(totalApps)} />
          <Kpi
            label="Acceptées"
            value={FR.format(appsAccepted)}
            tone="success"
          />
          <Kpi label="Baux totaux" value={FR.format(totalLeases)} />
          <Kpi label="Baux actifs" value={FR.format(leasesActive)} tone="success" />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="display-md text-xl">Flux financier</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Kpi label="Paiements déclarés" value={FR.format(totalPayments)} />
          <Kpi
            label="Montant cumulé"
            value={`${FR.format(totalRentCollected._sum.amount ?? 0)} MAD`}
            tone="success"
          />
          <Kpi
            label="Conversion visite → bail"
            value={
              visitsLast7d > 0
                ? `${Math.round((leasesActive / Math.max(totalApps, 1)) * 100)}%`
                : "—"
            }
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="display-md text-xl">Modération</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Kpi
            label="KYC bailleurs en attente"
            value={FR.format(pendingKyc)}
            tone={pendingKyc > 0 ? "warning" : "default"}
            href="/admin/kyc"
          />
          <Kpi
            label="Artisans à vérifier"
            value={FR.format(unverifiedCraftsmen)}
            tone={unverifiedCraftsmen > 0 ? "warning" : "default"}
            href="/admin/artisans"
          />
          <Kpi
            label="Annonces à modérer"
            value={FR.format(0)}
            href="/admin"
          />
        </div>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone = "default",
  href,
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
  href?: string;
}) {
  const toneCls = {
    default: "bg-cream border-midnight/10",
    success: "bg-forest/5 border-forest/20",
    warning: "bg-terracotta/5 border-terracotta/20",
    danger: "bg-danger/5 border-danger/20",
  }[tone];
  const valueCls = {
    default: "text-midnight",
    success: "text-forest",
    warning: "text-terracotta",
    danger: "text-danger",
  }[tone];
  const body = (
    <div className={`rounded-2xl border p-5 ${toneCls}`}>
      <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className={`display-xl mt-2 text-3xl ${valueCls}`}>{value}</p>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90">
        {body}
      </Link>
    );
  }
  return body;
}
