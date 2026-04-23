import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { applicationStatusLabel } from "@/lib/tenant-score";
import { relativeDate } from "@/lib/format";
import { ApplicationReviewActions } from "@/components/bailleur/application-review-actions";

export const metadata: Metadata = {
  title: "Candidature — Baboo",
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

const GUARANTOR_LABEL: Record<string, string> = {
  PARENT: "Parent",
  EMPLOYEUR: "Employeur",
  PROCHE: "Proche",
  ENTREPRISE: "Entreprise",
  AUTRE: "Autre",
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  if (!hasDb()) notFound();
  const { id } = await params;

  const app = await db.tenantApplication.findUnique({
    where: { id },
    include: {
      listing: {
        select: {
          id: true,
          slug: true,
          title: true,
          ownerId: true,
          agencyId: true,
          price: true,
          charges: true,
          city: { select: { name: true } },
        },
      },
      tenantUser: {
        select: { id: true, name: true, email: true, phone: true },
      },
      tenantProfile: {
        include: { guarantors: { orderBy: { createdAt: "asc" } } },
      },
    },
  });
  if (!app) notFound();

  const canView =
    app.listing.ownerId === session.user.id ||
    (session.user.agencyId && app.listing.agencyId === session.user.agencyId);
  if (!canView) redirect("/bailleur/candidatures");

  const tp = app.tenantProfile;
  const totalRent = app.listing.price + (app.listing.charges ?? 0);

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/bailleur/candidatures" className="hover:text-midnight">Candidatures</Link>
        <span className="mx-2">·</span>
        <span>{app.tenantUser.name ?? app.tenantUser.email}</span>
      </nav>

      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="eyebrow">Candidature · {applicationStatusLabel(app.status)}</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">
            {app.tenantUser.name ?? app.tenantUser.email}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pour{" "}
            <Link href={`/annonce/${app.listing.slug}`} className="underline decoration-dotted">
              {app.listing.title}
            </Link>
            {" · "}
            {app.listing.city.name}
            {" · "}
            {relativeDate(app.submittedAt)}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-midnight/10 bg-cream p-4 text-center">
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Score
          </p>
          <p className="display-xl mt-1 text-4xl">{app.score}</p>
          <p className="mt-1 text-sm font-semibold text-midnight">{app.scoreLabel}</p>
          <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Ratio {app.snapshotRatio.toFixed(1)}×
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          {/* Message du candidat */}
          {app.message && (
            <section>
              <h2 className="display-md text-xl">Message du candidat</h2>
              <blockquote className="mt-3 rounded-2xl border-l-4 border-terracotta bg-cream p-5 text-sm italic text-midnight">
                « {app.message} »
              </blockquote>
            </section>
          )}

          {/* Situation */}
          <section>
            <h2 className="display-md text-xl">Situation</h2>
            <dl className="mt-3 grid grid-cols-2 gap-4 rounded-2xl border border-midnight/10 bg-cream p-5">
              <Field
                label="Statut"
                value={EMPLOYMENT_LABEL[tp.employment] ?? tp.employment}
              />
              <Field
                label="Revenus mensuels"
                value={`${tp.monthlyIncome.toLocaleString("fr-FR")} MAD`}
              />
              {tp.employer && <Field label="Employeur" value={tp.employer} />}
              {tp.position && <Field label="Poste" value={tp.position} />}
              {tp.contractStartDate && (
                <Field
                  label="Début de contrat"
                  value={tp.contractStartDate.toLocaleDateString("fr-FR")}
                />
              )}
              {tp.contractEndDate && (
                <Field
                  label="Fin de contrat"
                  value={tp.contractEndDate.toLocaleDateString("fr-FR")}
                />
              )}
              <Field
                label="Taille foyer"
                value={String(tp.householdSize)}
              />
              <Field
                label="Loyer cible"
                value={`${totalRent.toLocaleString("fr-FR")} MAD`}
              />
            </dl>
          </section>

          {/* Foyer */}
          <section>
            <h2 className="display-md text-xl">Foyer</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {tp.hasChildren && <Tag>Avec enfants</Tag>}
              {tp.smoker && <Tag>Fumeur</Tag>}
              {tp.hasPets && <Tag>Animaux</Tag>}
              {!tp.hasChildren && !tp.smoker && !tp.hasPets && (
                <span className="text-xs text-muted-foreground">
                  Aucune spécificité renseignée.
                </span>
              )}
            </div>
          </section>

          {/* Mot du candidat */}
          {tp.bio && (
            <section>
              <h2 className="display-md text-xl">Mot au bailleur</h2>
              <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">
                {tp.bio}
              </p>
            </section>
          )}

          {/* Garants */}
          <section>
            <h2 className="display-md text-xl">
              Garants{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({tp.guarantors.length})
              </span>
            </h2>
            {tp.guarantors.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-midnight/20 p-5 text-center text-xs text-muted-foreground">
                Pas de garant déclaré.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {tp.guarantors.map((g) => (
                  <li
                    key={g.id}
                    className="rounded-xl border border-midnight/10 bg-cream p-4"
                  >
                    <p className="display-lg text-base">{g.fullName}</p>
                    <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {GUARANTOR_LABEL[g.type] ?? g.type}
                      {g.relationship && ` · ${g.relationship}`}
                      {g.monthlyIncome != null &&
                        ` · ${g.monthlyIncome.toLocaleString("fr-FR")} MAD`}
                    </p>
                    {g.employment && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {EMPLOYMENT_LABEL[g.employment] ?? g.employment}
                        {g.employer && ` — ${g.employer}`}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Scoring — raisons détaillées */}
          <section>
            <h2 className="display-md text-xl">Analyse du score</h2>
            <ul className="mt-3 space-y-2">
              {app.scoreReasons.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-midnight">
                  <span className="text-terracotta">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Colonne actions */}
        <aside className="space-y-4">
          <div className="sticky top-24 space-y-4">
            <ApplicationReviewActions
              applicationId={app.id}
              currentStatus={app.status}
              rejectionReason={app.rejectionReason}
            />

            <div className="rounded-2xl border border-midnight/10 bg-cream p-5">
              <p className="eyebrow">Contact</p>
              <p className="mt-3 text-sm text-midnight">
                {app.tenantUser.email}
              </p>
              {app.tenantUser.phone && (
                <p className="text-sm text-midnight">{app.tenantUser.phone}</p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                À utiliser uniquement après présélection. Conformité
                loi 09-08.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-midnight">{value}</dd>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-midnight/20 bg-white px-3 py-1 text-xs text-midnight">
      {children}
    </span>
  );
}
