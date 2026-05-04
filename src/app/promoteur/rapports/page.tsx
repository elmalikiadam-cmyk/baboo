import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Rapports hebdomadaires — Promoteur",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function PromoteurReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/promoteur/rapports");
  if (!session.user.developerId) redirect("/developer/dashboard");
  if (!hasDb()) return null;

  const developerId = session.user.developerId;

  const pack = await db.promoterPack.findFirst({
    where: { developerId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  const reports = pack
    ? await db.promoterWeeklyReport.findMany({
        where: { packId: pack.id },
        orderBy: { weekStart: "desc" },
        take: 20,
      })
    : [];

  return (
    <div className="container max-w-4xl py-10 md:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link href="/developer/dashboard" className="hover:text-midnight">
          Tableau de bord
        </Link>
        <span className="mx-2">·</span>
        <span>Rapports hebdo</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Reporting</p>
        <h1 className="display-xl mt-2 text-3xl md:text-4xl">
          Rapports hebdomadaires.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Chaque lundi, un rapport consolidé synthétise visites, leads,
          messages et top candidats de la semaine écoulée. Archive
          téléchargeable en PDF.
        </p>
      </header>

      {!pack ? (
        <div className="mt-10 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-6">
          <p className="eyebrow text-terracotta">Pack promoteur</p>
          <p className="mt-3 text-sm text-midnight">
            Vous n'avez pas de pack promoteur actif. Les rapports
            hebdomadaires sont inclus dans les offres Croissance et
            Sur-mesure. Parlons-en :{" "}
            <Link
              href="/promoteurs/contact"
              className="text-terracotta hover:underline"
            >
              prendre contact
            </Link>
            .
          </p>
        </div>
      ) : reports.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center text-sm text-muted-foreground">
          Premier rapport envoyé lundi prochain.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-midnight/10 bg-cream p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="display-md text-base">
                    Semaine du{" "}
                    {r.weekStart.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {r.visitsCount} visite{r.visitsCount > 1 ? "s" : ""} ·{" "}
                    {r.leadsCount} lead{r.leadsCount > 1 ? "s" : ""} ·{" "}
                    {r.messagesCount} message
                    {r.messagesCount > 1 ? "s" : ""}
                  </p>
                </div>
                {r.sentAt && (
                  <span className="mono rounded-full bg-forest/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-forest">
                    ✓ Envoyé
                  </span>
                )}
              </div>
              {r.pdfDocId && (
                <div className="mt-3">
                  <Link
                    href={`/api/documents/${r.pdfDocId}/download`}
                    className="mono text-[10px] uppercase tracking-[0.12em] text-terracotta hover:underline"
                  >
                    Télécharger le PDF →
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
