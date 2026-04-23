import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { applicationStatusLabel } from "@/lib/tenant-score";
import { relativeDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Candidatures reçues — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const SCORE_TONE: Record<string, string> = {
  Solide: "bg-forest/15 text-forest",
  Correct: "bg-terracotta/15 text-terracotta",
  "À discuter": "bg-midnight/10 text-midnight",
  Fragile: "bg-danger/10 text-danger",
};

const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-midnight/10 text-midnight",
  SHORTLISTED: "bg-terracotta/10 text-terracotta",
  ACCEPTED: "bg-forest/15 text-forest",
  REJECTED: "bg-danger/10 text-danger",
  WITHDRAWN: "bg-muted/20 text-muted-foreground",
};

export default async function BailleurApplicationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/bailleur/candidatures");

  const roles = session.user.roles ?? [];
  const canAccess =
    roles.includes("BAILLEUR") || roles.includes("AGENCY") || roles.includes("ADMIN");
  if (!canAccess) redirect("/bailleur/onboarding");

  if (!hasDb()) return null;

  // Récupère les annonces possédées par le user (owner direct ou via
  // agencyId), puis les candidatures rattachées.
  const ownedWhere = session.user.agencyId
    ? {
        OR: [
          { ownerId: session.user.id },
          { agencyId: session.user.agencyId },
        ],
      }
    : { ownerId: session.user.id };

  const applications = await db.tenantApplication.findMany({
    where: { listing: ownedWhere },
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
    include: {
      listing: {
        select: { slug: true, title: true, city: { select: { name: true } } },
      },
      tenantUser: { select: { name: true, email: true } },
    },
  });

  const byStatus = applications.reduce<Record<string, typeof applications>>(
    (acc, a) => {
      const arr = acc[a.status] ?? [];
      arr.push(a);
      acc[a.status] = arr;
      return acc;
    },
    {},
  );

  return (
    <div className="container py-10 md:py-16">
      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Bailleur · candidatures reçues</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">
            Dossiers à examiner.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Présélectionnez, acceptez ou refusez. La signature du bail
            arrive dans l'étape suivante.
          </p>
        </div>
        <dl className="grid grid-cols-4 gap-3 text-center">
          {(["PENDING", "SHORTLISTED", "ACCEPTED", "REJECTED"] as const).map((s) => (
            <div key={s} className="rounded-md border border-midnight/10 bg-cream p-3 min-w-[70px]">
              <p className="display-lg text-xl">{byStatus[s]?.length ?? 0}</p>
              <p className="mono mt-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                {applicationStatusLabel(s)}
              </p>
            </div>
          ))}
        </dl>
      </header>

      {applications.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center">
          <p className="display-md text-xl">Aucune candidature reçue.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Les candidats apparaîtront ici dès qu'ils auront postulé à
            vos annonces de location.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {applications.map((a) => (
            <li key={a.id} className="rounded-xl border border-midnight/10 bg-cream p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/bailleur/candidatures/${a.id}`}
                    className="display-lg text-base hover:text-terracotta"
                  >
                    {a.tenantUser.name ?? a.tenantUser.email}
                  </Link>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Pour{" "}
                    <Link
                      href={`/annonce/${a.listing.slug}`}
                      className="underline decoration-dotted"
                    >
                      {a.listing.title}
                    </Link>
                    {" · "}
                    {a.listing.city.name}
                    {" · "}
                    reçue {relativeDate(a.submittedAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span
                    className={`rounded-full px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] ${SCORE_TONE[a.scoreLabel] ?? "bg-midnight/10 text-midnight"}`}
                  >
                    {a.score}/100 · {a.scoreLabel}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] ${STATUS_TONE[a.status]}`}
                  >
                    {applicationStatusLabel(a.status)}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                Revenus {a.snapshotIncome.toLocaleString("fr-FR")} MAD · Loyer{" "}
                {a.snapshotRent.toLocaleString("fr-FR")} MAD · Ratio{" "}
                {a.snapshotRatio.toFixed(1)}×
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
