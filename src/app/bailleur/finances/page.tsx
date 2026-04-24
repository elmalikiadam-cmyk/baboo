import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLandlordFinanceSummary } from "@/lib/finances-query";

export const metadata: Metadata = {
  title: "Finances — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const FR_MONEY = new Intl.NumberFormat("fr-FR");

function fmt(n: number): string {
  return `${FR_MONEY.format(n)} MAD`;
}

export default async function FinancesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/bailleur/finances");
  const roles = session.user.roles ?? [];
  if (!roles.includes("BAILLEUR") && !roles.includes("AGENCY") && !roles.includes("ADMIN")) {
    redirect("/bailleur/onboarding");
  }

  const summary = await getLandlordFinanceSummary(
    session.user.id,
    session.user.agencyId ?? null,
  );

  // Graph 12 mois — rendu SVG simple (pas de dépendance recharts).
  const maxBar = Math.max(
    1,
    ...summary.last12Months.map((m) => Math.max(m.expected, m.received)),
  );

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/compte" className="hover:text-midnight">Mon compte</Link>
        <span className="mx-2">·</span>
        <span>Finances</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Gestion locative</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Vos <span className="text-terracotta">finances</span>.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Vue consolidée de tous vos baux actifs — loyers attendus,
          encaissés, en retard, YTD.
        </p>
      </header>

      {/* Bandeau Phase 4.1 — gestion locative = outil de rétention gratuit */}
      <div className="mt-6 rounded-2xl border border-forest/30 bg-forest/5 p-5">
        <p className="mono text-[10px] uppercase tracking-[0.14em] text-forest">
          ✓ Inclus
        </p>
        <p className="mt-2 text-sm text-midnight">
          Vos outils de suivi locatif (registre des loyers, quittances,
          relances, EDL) sont offerts avec Baboo. Aucun abonnement, pas
          de frais cachés.
        </p>
      </div>

      {/* 4 KPI */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ce mois attendu"
          value={fmt(summary.thisMonth.expected)}
        />
        <KpiCard
          label="Ce mois reçu"
          value={fmt(summary.thisMonth.received)}
          tone="success"
        />
        <KpiCard
          label="En attente"
          value={fmt(summary.thisMonth.pending)}
          tone="warning"
        />
        <KpiCard
          label="En retard"
          value={fmt(summary.thisMonth.late)}
          tone="danger"
        />
      </section>

      {/* YTD + graph */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-2xl border border-midnight/10 bg-cream p-6">
          <p className="eyebrow">Année en cours</p>
          <p className="display-xl mt-3 text-3xl text-terracotta">
            {fmt(summary.ytd.received)}
          </p>
          <p className="mono mt-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            sur {fmt(summary.ytd.expected)} attendus
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {summary.ytd.expected > 0
              ? `${Math.round((summary.ytd.received / summary.ytd.expected) * 100)}% encaissé YTD`
              : "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-midnight/10 bg-cream p-6">
          <p className="eyebrow">12 derniers mois</p>
          <div className="mt-4 overflow-x-auto">
            <div className="flex min-w-[480px] items-end justify-between gap-2 h-40">
              {summary.last12Months.map((m, i) => {
                const recH = (m.received / maxBar) * 100;
                const expH = (m.expected / maxBar) * 100;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="relative w-full"
                      style={{ height: `${expH}%` }}
                    >
                      <div
                        className="absolute inset-x-0 bottom-0 rounded-t-sm bg-midnight/15"
                        style={{ height: "100%" }}
                      />
                      <div
                        className="absolute inset-x-0 bottom-0 rounded-t-sm bg-terracotta"
                        style={{ height: `${(recH / expH) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-[11px] text-muted-foreground">
            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-terracotta" />
              Reçu
            </span>
            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-midnight/15" />
              Attendu
            </span>
          </div>
        </div>
      </section>

      {/* Retards actifs */}
      {summary.late.length > 0 && (
        <section className="mt-10">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-midnight/10 pb-3">
            <div>
              <p className="eyebrow text-danger">Retards actifs</p>
              <h2 className="display-lg mt-1 text-xl">
                {summary.late.length} échéance{summary.late.length > 1 ? "s" : ""} en retard
              </h2>
            </div>
          </header>
          <ul className="mt-4 space-y-2">
            {summary.late.slice(0, 15).map((l) => (
              <li
                key={l.periodId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/bailleur/baux/${l.leaseId}`}
                    className="display-lg text-base hover:text-terracotta"
                  >
                    {l.propertyLabel}
                  </Link>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {l.tenantName} · échéance{" "}
                    {l.dueDate.toLocaleDateString("fr-FR")} · +{l.daysLate} j
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-danger px-3 py-1 mono text-[11px] font-semibold text-cream">
                  {fmt(l.amountTotal)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Table baux */}
      <section className="mt-10">
        <header className="border-b border-midnight/10 pb-3">
          <p className="eyebrow">Par bail</p>
          <h2 className="display-lg mt-1 text-xl">Tous vos baux</h2>
        </header>
        {summary.byLease.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-midnight/20 p-8 text-center text-sm text-muted-foreground">
            Aucun bail pour l'instant.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-midnight/10">
                <tr>
                  <th className="eyebrow pb-2 pr-3">Bien</th>
                  <th className="eyebrow pb-2 pr-3">Locataire</th>
                  <th className="eyebrow pb-2 pr-3">Loyer</th>
                  <th className="eyebrow pb-2 pr-3">YTD reçu</th>
                  <th className="eyebrow pb-2 pr-3">Retards</th>
                  <th className="eyebrow pb-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {summary.byLease.map((l) => (
                  <tr key={l.leaseId} className="border-b border-midnight/5">
                    <td className="py-3 pr-3">
                      <Link
                        href={`/bailleur/baux/${l.leaseId}`}
                        className="font-medium text-midnight hover:text-terracotta"
                      >
                        {l.propertyLabel}
                      </Link>
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">
                      {l.tenantName}
                    </td>
                    <td className="py-3 pr-3">{fmt(l.monthlyRent)}</td>
                    <td className="py-3 pr-3 text-terracotta">
                      {fmt(l.ytdReceived)}
                    </td>
                    <td className="py-3 pr-3">{l.lateCount}</td>
                    <td className="py-3">
                      <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
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
  return (
    <div className={`rounded-2xl border p-5 ${toneCls}`}>
      <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className={`display-xl mt-2 text-3xl ${valueCls}`}>{value}</p>
    </div>
  );
}
