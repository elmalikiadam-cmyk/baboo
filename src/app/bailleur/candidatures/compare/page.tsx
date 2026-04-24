import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { applicationStatusLabel } from "@/lib/tenant-score";

export const metadata: Metadata = {
  title: "Comparer les candidats — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const EMPLOYMENT_LABEL: Record<string, string> = {
  CDI: "CDI",
  CDD: "CDD",
  FONCTIONNAIRE: "Fonctionnaire",
  INDEPENDANT: "Indépendant",
  ETUDIANT: "Étudiant",
  RETRAITE: "Retraité",
  SANS_EMPLOI: "Sans emploi",
  AUTRE: "Autre",
};

/**
 * Comparateur candidats côté bailleur — jusqu'à 3 candidatures en
 * parallèle pour aider à trancher. URL : /bailleur/candidatures/compare?ids=a,b,c
 */
export default async function CompareCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const { ids } = await searchParams;
  const idList = (ids ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  if (idList.length === 0) {
    redirect("/bailleur/candidatures");
  }

  if (!hasDb()) return null;

  const apps = await db.tenantApplication.findMany({
    where: {
      id: { in: idList },
      listing: session.user.agencyId
        ? {
            OR: [
              { ownerId: session.user.id },
              { agencyId: session.user.agencyId },
            ],
          }
        : { ownerId: session.user.id },
    },
    include: {
      tenantUser: { select: { name: true, email: true, phone: true } },
      tenantProfile: { include: { guarantors: true } },
      listing: { select: { slug: true, title: true } },
    },
  });

  if (apps.length === 0) redirect("/bailleur/candidatures");

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/bailleur/candidatures" className="hover:text-midnight">Candidatures</Link>
        <span className="mx-2">·</span>
        <span>Comparer {apps.length}</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Comparateur</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          <span className="text-terracotta">{apps.length}</span> candidats, côte-à-côte.
        </h1>
      </header>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-midnight/10">
              <th className="eyebrow p-3"></th>
              {apps.map((a) => (
                <th key={a.id} className="p-3 align-top">
                  <p className="display-lg text-base">
                    {a.tenantUser.name ?? a.tenantUser.email}
                  </p>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {applicationStatusLabel(a.status)}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Score">
              {apps.map((a) => (
                <td key={a.id} className="p-3">
                  <span className="display-xl text-2xl text-terracotta">
                    {a.score}
                  </span>
                  <span className="mono ml-1 text-[10px] text-muted-foreground">
                    /100
                  </span>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {a.scoreLabel}
                  </p>
                </td>
              ))}
            </Row>
            <Row label="Ratio revenus/loyer">
              {apps.map((a) => (
                <td key={a.id} className="p-3 font-medium">
                  {a.snapshotRatio.toFixed(1)}×
                </td>
              ))}
            </Row>
            <Row label="Revenus mensuels">
              {apps.map((a) => (
                <td key={a.id} className="p-3">
                  {a.snapshotIncome.toLocaleString("fr-FR")} MAD
                </td>
              ))}
            </Row>
            <Row label="Statut pro">
              {apps.map((a) => (
                <td key={a.id} className="p-3">
                  {EMPLOYMENT_LABEL[a.tenantProfile.employment] ??
                    a.tenantProfile.employment}
                  {a.tenantProfile.employer && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {a.tenantProfile.employer}
                    </p>
                  )}
                </td>
              ))}
            </Row>
            <Row label="Taille foyer">
              {apps.map((a) => (
                <td key={a.id} className="p-3">
                  {a.tenantProfile.householdSize}
                  {a.tenantProfile.hasChildren && " (avec enfants)"}
                </td>
              ))}
            </Row>
            <Row label="Animaux">
              {apps.map((a) => (
                <td key={a.id} className="p-3">
                  {a.tenantProfile.hasPets ? "Oui" : "Non"}
                </td>
              ))}
            </Row>
            <Row label="Fumeur">
              {apps.map((a) => (
                <td key={a.id} className="p-3">
                  {a.tenantProfile.smoker ? "Oui" : "Non"}
                </td>
              ))}
            </Row>
            <Row label="Garants">
              {apps.map((a) => (
                <td key={a.id} className="p-3">
                  {a.tenantProfile.guarantors.length === 0
                    ? "Aucun"
                    : a.tenantProfile.guarantors.map((g, i) => (
                        <p key={g.id} className="text-xs">
                          {i + 1}. {g.fullName}
                          {g.monthlyIncome != null &&
                            ` (${g.monthlyIncome.toLocaleString("fr-FR")} MAD)`}
                        </p>
                      ))}
                </td>
              ))}
            </Row>
            <Row label="Message">
              {apps.map((a) => (
                <td key={a.id} className="p-3 align-top">
                  {a.message ? (
                    <p className="text-xs italic text-midnight line-clamp-4">
                      « {a.message} »
                    </p>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              ))}
            </Row>
            <tr>
              <td></td>
              {apps.map((a) => (
                <td key={a.id} className="p-3">
                  <Link
                    href={`/bailleur/candidatures/${a.id}`}
                    className="inline-flex h-10 items-center rounded-full border-2 border-midnight px-4 text-xs font-semibold text-midnight hover:bg-midnight hover:text-cream"
                  >
                    Ouvrir le dossier →
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-b border-midnight/5">
      <th scope="row" className="eyebrow p-3 align-top text-left">
        {label}
      </th>
      {children}
    </tr>
  );
}
