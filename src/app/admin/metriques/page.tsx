import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { RunWeeklyReportsButton } from "@/components/admin/run-weekly-reports-button";

export const metadata: Metadata = {
  title: "Métriques — Admin Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminMetricsPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/admin/metriques");
  if (session.user.role !== "ADMIN") redirect("/");
  if (!hasDb()) return null;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000);

  const [
    listingsTotal,
    listingsPublished,
    listingsWeek,
    usersTotal,
    usersWeek,
    visitsWeek,
    visitsMonth,
    packsActive,
    packsRevenueMTD,
    managedVisitsMonth,
    managedVisitsCompletedMonth,
    searchRequestsMonth,
    partnerUnlocksMonth,
    partnerRevenueMonth,
    promoterPacksActive,
  ] = await Promise.all([
    db.listing.count(),
    db.listing.count({ where: { status: "PUBLISHED" } }),
    db.listing.count({ where: { createdAt: { gte: weekAgo } } }),
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.visitBooking.count({ where: { createdAt: { gte: weekAgo } } }),
    db.visitBooking.count({ where: { createdAt: { gte: monthAgo } } }),
    db.visitPack.count({ where: { status: "ACTIVE" } }),
    db.visitPack.aggregate({
      _sum: { amountPaid: true },
      where: { paidAt: { gte: monthAgo } },
    }),
    db.managedVisit.count({ where: { createdAt: { gte: monthAgo } } }),
    db.managedVisit.count({
      where: { status: "COMPLETED", completedAt: { gte: monthAgo } },
    }),
    db.searchRequest.count({ where: { createdAt: { gte: monthAgo } } }),
    db.partnerLeadUnlock.count({ where: { unlockedAt: { gte: monthAgo } } }),
    db.partnerLeadUnlock.aggregate({
      _sum: { pricePaid: true },
      where: { unlockedAt: { gte: monthAgo } },
    }),
    db.promoterPack.count({ where: { status: "ACTIVE" } }),
  ]);

  // Timeserie : annonces créées par jour sur 30 jours
  const daily = await db.listing.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: monthAgo } },
    _count: { _all: true },
  });
  const buckets: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() - (29 - i) * 86_400_000);
    buckets[keyOf(d)] = 0;
  }
  for (const row of daily) {
    const k = keyOf(row.createdAt);
    if (k in buckets) buckets[k] += row._count._all;
  }
  const series = Object.values(buckets);
  const maxSeries = Math.max(1, ...series);

  const packRevenue = packsRevenueMTD._sum.amountPaid ?? 0;
  const partnerRevenue = partnerRevenueMonth._sum.pricePaid ?? 0;
  const totalRevenue = packRevenue + partnerRevenue;

  const reportRate =
    managedVisitsMonth > 0
      ? Math.round((managedVisitsCompletedMonth / managedVisitsMonth) * 100)
      : 0;

  return (
    <div className="container py-10 md:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link href="/admin" className="hover:text-midnight">
          Admin
        </Link>
        <span className="mx-2">·</span>
        <span>Métriques</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Baboo · 30 derniers jours</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Santé plateforme.
        </h1>
      </header>

      <section className="mt-8">
        <h2 className="display-md text-xl">Croissance catalogue</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Annonces totales" value={String(listingsTotal)} />
          <Stat label="Publiées" value={String(listingsPublished)} />
          <Stat label="Nouvelles (7j)" value={`+${listingsWeek}`} />
          <Stat label="Utilisateurs" value={String(usersTotal)} />
        </dl>
        <div className="mt-6 rounded-2xl border border-midnight/10 bg-cream p-5">
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Annonces créées / jour · 30 jours
          </p>
          <Sparkline values={series} max={maxSeries} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="display-md text-xl">Activité visites</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Visites réservées (7j)" value={String(visitsWeek)} />
          <Stat label="Visites réservées (30j)" value={String(visitsMonth)} />
          <Stat label="Visites managées (30j)" value={String(managedVisitsMonth)} />
          <Stat label="Taux rapport" value={`${reportRate}%`} tone="dark" />
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="display-md text-xl">Revenus (30j)</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="Packs bailleurs"
            value={`${packRevenue.toLocaleString("fr-FR")} MAD`}
          />
          <Stat
            label="Partners leads"
            value={`${partnerRevenue.toLocaleString("fr-FR")} MAD`}
          />
          <Stat
            label="Total"
            value={`${totalRevenue.toLocaleString("fr-FR")} MAD`}
            tone="dark"
          />
          <Stat label="Packs actifs" value={String(packsActive)} />
        </dl>
      </section>

      <RunWeeklyReportsButton />

      <section className="mt-10">
        <h2 className="display-md text-xl">Lead routing</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="Recherches publiées"
            value={String(searchRequestsMonth)}
          />
          <Stat
            label="Déblocages partners"
            value={String(partnerUnlocksMonth)}
          />
          <Stat
            label="Taux conversion"
            value={`${searchRequestsMonth > 0 ? Math.round((partnerUnlocksMonth / searchRequestsMonth) * 100) : 0}%`}
          />
          <Stat label="Packs promoteurs actifs" value={String(promoterPacksActive)} />
        </dl>
      </section>
    </div>
  );
}

function keyOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function Stat({
  label,
  value,
  tone = "light",
}: {
  label: string;
  value: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        tone === "dark"
          ? "border-midnight bg-midnight text-cream"
          : "border-midnight/10 bg-cream"
      }`}
    >
      <p
        className={`mono text-[10px] uppercase tracking-[0.12em] ${
          tone === "dark" ? "text-cream/70" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      <p
        className={`display-lg mt-2 text-2xl ${tone === "dark" ? "text-cream" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function Sparkline({ values, max }: { values: number[]; max: number }) {
  const W = 600;
  const H = 80;
  const step = values.length > 1 ? W / (values.length - 1) : W;
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = H - (v / max) * (H - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-3 h-20 w-full"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-terracotta"
      />
    </svg>
  );
}
