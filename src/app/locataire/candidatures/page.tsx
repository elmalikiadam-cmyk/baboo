import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { applicationStatusLabel } from "@/lib/tenant-score";
import { relativeDate, formatPrice } from "@/lib/format";
import { WithdrawApplicationButton } from "@/components/locataire/withdraw-application-button";

export const metadata: Metadata = {
  title: "Mes candidatures — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-midnight/10 text-midnight",
  SHORTLISTED: "bg-terracotta/10 text-terracotta",
  ACCEPTED: "bg-forest/15 text-forest",
  REJECTED: "bg-danger/10 text-danger",
  WITHDRAWN: "bg-muted/20 text-muted-foreground",
};

export default async function TenantApplicationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/locataire/candidatures");

  const applications = hasDb()
    ? await db.tenantApplication
        .findMany({
          where: { tenantUserId: session.user.id },
          orderBy: { submittedAt: "desc" },
          include: {
            listing: {
              select: {
                slug: true,
                title: true,
                price: true,
                city: { select: { name: true } },
                coverImage: true,
              },
            },
          },
        })
        .catch(() => [])
    : [];

  return (
    <div className="container py-10 md:py-16">
      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Locataire · candidatures</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">Mes candidatures.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Suivez l'état de chaque dossier envoyé. Vous pouvez retirer
            une candidature à tout moment tant qu'elle n'a pas été
            acceptée.
          </p>
        </div>
        <Link
          href="/locataire/dossier"
          className="inline-flex h-11 items-center rounded-full border-2 border-midnight px-5 text-sm font-medium text-midnight hover:bg-midnight hover:text-cream"
        >
          Modifier mon dossier →
        </Link>
      </header>

      {applications.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center">
          <p className="display-md text-xl">Aucune candidature envoyée.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Parcourez les annonces de location et cliquez sur « Candidater ».
          </p>
          <Link
            href="/recherche?t=rent"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-terracotta px-5 text-sm font-semibold text-cream hover:bg-terracotta-2"
          >
            Voir les annonces →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {applications.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-midnight/10 bg-cream p-4"
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/annonce/${a.listing.slug}`}
                    className="display-lg text-base hover:text-terracotta"
                  >
                    {a.listing.title}
                  </Link>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {a.listing.city.name} · {formatPrice(a.listing.price)} · soumise{" "}
                    {relativeDate(a.submittedAt)}
                  </p>
                  {a.rejectionReason && (
                    <p className="mt-2 text-xs italic text-danger">
                      Motif du refus : « {a.rejectionReason} »
                    </p>
                  )}
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] ${STATUS_TONE[a.status]}`}
                >
                  {applicationStatusLabel(a.status)}
                </span>

                {(a.status === "PENDING" || a.status === "SHORTLISTED") && (
                  <WithdrawApplicationButton applicationId={a.id} />
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span>
                  Score figé :{" "}
                  <strong className="text-midnight">{a.score}/100 · {a.scoreLabel}</strong>
                </span>
                <span>·</span>
                <span>
                  Ratio {a.snapshotRatio.toFixed(1)}× (
                  {a.snapshotIncome.toLocaleString("fr-FR")} MAD /{" "}
                  {a.snapshotRent.toLocaleString("fr-FR")} MAD)
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
