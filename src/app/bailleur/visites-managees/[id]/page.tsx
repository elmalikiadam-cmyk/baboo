import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Rapport de visite — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ManagedVisitReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const { id } = await params;
  if (!hasDb()) notFound();

  const mv = await db.managedVisit.findUnique({
    where: { id },
    include: {
      agent: { select: { name: true, email: true } },
      booking: {
        include: {
          slot: { select: { startsAt: true, endsAt: true } },
          listing: {
            select: {
              title: true,
              slug: true,
              ownerId: true,
              agencyId: true,
            },
          },
          visitorUser: { select: { name: true, email: true, phone: true } },
        },
      },
    },
  });
  if (!mv) notFound();

  const canView =
    mv.booking.listing.ownerId === session.user.id ||
    (!!session.user.agencyId &&
      mv.booking.listing.agencyId === session.user.agencyId);
  if (!canView) redirect("/bailleur/dashboard");

  const isComplete =
    mv.status === "COMPLETED" || mv.status === "NO_SHOW";

  return (
    <div className="container max-w-3xl py-10 md:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link
          href="/bailleur/visites-managees"
          className="hover:text-midnight"
        >
          Visites managées
        </Link>
        <span className="mx-2">·</span>
        <span>Rapport</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Rapport de visite</p>
        <h1 className="display-xl mt-2 text-3xl md:text-4xl">
          {mv.booking.listing.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Visite du{" "}
          {mv.booking.slot.startsAt.toLocaleString("fr-FR", {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: "Africa/Casablanca",
          })}
        </p>
      </header>

      {!isComplete ? (
        <div className="mt-8 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-6">
          <p className="eyebrow text-terracotta">En attente</p>
          <p className="mt-3 text-sm text-midnight">
            Cette visite est {mv.status}. Le rapport sera disponible
            dans l'heure qui suit la réalisation.
          </p>
        </div>
      ) : (
        <>
          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <Info
              label="Candidat"
              value={
                mv.booking.visitorUser.name ?? mv.booking.visitorUser.email
              }
              sub={mv.booking.visitorUser.phone ?? undefined}
            />
            <Info
              label="Agent Baboo"
              value={mv.agent?.name ?? mv.agent?.email ?? "—"}
              sub={
                mv.reportSubmittedAt
                  ? `Rapport envoyé ${mv.reportSubmittedAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}`
                  : undefined
              }
            />
          </section>

          {mv.status === "NO_SHOW" ? (
            <div className="mt-8 rounded-2xl border border-danger/30 bg-danger/5 p-6">
              <p className="eyebrow text-danger">
                ✗ Candidat absent (no-show)
              </p>
              <p className="mt-3 text-sm text-midnight">
                Le candidat ne s'est pas présenté au rendez-vous. Notre
                politique : 1 crédit consommé pour la mise en place,
                mais aucun frais supplémentaire.
              </p>
            </div>
          ) : (
            <>
              <section className="mt-8 rounded-2xl border border-midnight/10 bg-cream p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <p className="eyebrow">Évaluation candidat</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`h-2.5 w-2.5 rounded-full ${
                          n <= (mv.candidateScore ?? 0)
                            ? "bg-terracotta"
                            : "bg-midnight/10"
                        }`}
                      />
                    ))}
                    <span className="ml-2 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {mv.candidateScore ?? "—"}/5
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
                  <Check
                    ok={mv.candidatePresented}
                    label="Candidat présent"
                  />
                  <Check
                    ok={mv.candidatePhoneVerified}
                    label="Téléphone vérifié"
                  />
                  <Check
                    ok={mv.candidateEmploymentVerified}
                    label="Revenus/emploi vérifiés"
                  />
                  <Check
                    ok={mv.recommendForLandlord ?? false}
                    label="Recommandé par l'agent"
                  />
                </div>
                {mv.candidateNotes && (
                  <div className="mt-5 rounded-xl bg-white p-4">
                    <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Notes de l'agent
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-midnight">
                      {mv.candidateNotes}
                    </p>
                  </div>
                )}
              </section>

              {mv.propertyConditionNotes && (
                <section className="mt-6 rounded-2xl border border-midnight/10 bg-cream p-6">
                  <p className="eyebrow">État du bien</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-midnight">
                    {mv.propertyConditionNotes}
                  </p>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function Info({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-midnight/10 bg-cream p-5">
      <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="display-md mt-2 text-base">{value}</p>
      {sub && (
        <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
          ok ? "bg-forest text-cream" : "bg-midnight/10 text-muted-foreground"
        }`}
        aria-hidden
      >
        {ok ? "✓" : "—"}
      </span>
      <span className="text-sm">{label}</span>
    </div>
  );
}
