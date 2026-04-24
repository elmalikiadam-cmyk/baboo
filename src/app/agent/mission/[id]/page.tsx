import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { ConfirmMissionButton, ReportForm } from "@/components/agent/mission-ui";

export const metadata: Metadata = {
  title: "Mission — Agent Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AgentMissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/agent");
  const { id } = await params;
  if (!hasDb()) notFound();

  const mv = await db.managedVisit.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          slot: {
            select: {
              startsAt: true,
              endsAt: true,
              internalNote: true,
            },
          },
          listing: {
            select: {
              title: true,
              slug: true,
              addressLine: true,
              neighborhood: { select: { name: true } },
              city: { select: { name: true } },
              price: true,
              surface: true,
              bedrooms: true,
              transaction: true,
            },
          },
          visitorUser: { select: { name: true, email: true, phone: true } },
        },
      },
    },
  });
  if (!mv) notFound();
  if (mv.agentUserId !== session.user.id) redirect("/agent");

  const isReportable =
    mv.status === "ASSIGNED" ||
    mv.status === "CONFIRMED" ||
    mv.status === "REQUESTED";
  const isDone = mv.status === "COMPLETED" || mv.status === "NO_SHOW";

  return (
    <div className="container py-10 md:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link href="/agent" className="hover:text-midnight">
          Espace agent
        </Link>
        <span className="mx-2">·</span>
        <span>Mission</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Mission visite</p>
        <h1 className="display-xl mt-2 text-2xl md:text-4xl">
          {mv.booking.listing.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mv.booking.listing.neighborhood?.name
            ? `${mv.booking.listing.neighborhood.name}, `
            : ""}
          {mv.booking.listing.city.name} ·{" "}
          {mv.booking.slot.startsAt.toLocaleString("fr-FR", {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: "Africa/Casablanca",
          })}
        </p>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <aside className="rounded-2xl border border-midnight/10 bg-cream p-5">
          <p className="eyebrow">Le bien</p>
          <dl className="mt-3 space-y-2 text-sm">
            <Row k="Adresse" v={mv.booking.listing.addressLine ?? "—"} />
            <Row
              k="Prix"
              v={`${mv.booking.listing.price.toLocaleString("fr-FR")} MAD${mv.booking.listing.transaction === "RENT" ? " / mois" : ""}`}
            />
            <Row k="Surface" v={`${mv.booking.listing.surface} m²`} />
            <Row k="Chambres" v={String(mv.booking.listing.bedrooms ?? "—")} />
          </dl>
          {mv.booking.slot.internalNote && (
            <div className="mt-4 rounded-xl bg-white p-3 text-xs text-midnight">
              <p className="mono text-[10px] uppercase tracking-[0.12em] text-terracotta">
                Note du bailleur
              </p>
              <p className="mt-1">{mv.booking.slot.internalNote}</p>
            </div>
          )}
          <div className="mt-6 border-t border-midnight/10 pt-4">
            <p className="eyebrow">Candidat</p>
            <p className="mt-2 text-sm font-semibold">
              {mv.booking.visitorUser.name ?? "—"}
            </p>
            <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {mv.booking.visitorUser.email}
              {mv.booking.visitorUser.phone &&
                ` · ${mv.booking.visitorUser.phone}`}
            </p>
            {mv.booking.message && (
              <p className="mt-3 rounded-xl bg-white p-3 text-xs italic">
                « {mv.booking.message} »
              </p>
            )}
          </div>
        </aside>

        <div>
          {mv.status === "ASSIGNED" && <ConfirmMissionButton missionId={mv.id} />}
          {isDone ? (
            <div className="rounded-2xl border border-forest/30 bg-forest/5 p-6">
              <p className="eyebrow text-forest">
                ✓ {mv.status === "NO_SHOW" ? "Candidat absent enregistré" : "Rapport soumis"}
              </p>
              <p className="mt-3 text-sm text-midnight">
                Merci. Le bailleur a été notifié. Rapport envoyé le{" "}
                {mv.reportSubmittedAt?.toLocaleString("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                .
              </p>
              {mv.candidateScore != null && (
                <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Score attribué : {mv.candidateScore}/5 ·{" "}
                  {mv.recommendForLandlord ? "Recommandé" : "Non recommandé"}
                </p>
              )}
            </div>
          ) : isReportable ? (
            <ReportForm missionId={mv.id} />
          ) : (
            <p className="rounded-2xl border border-midnight/10 bg-cream p-5 text-sm text-muted-foreground">
              Cette mission est au statut {mv.status}. Aucune action requise.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-midnight/5 pb-2 last:border-0">
      <dt className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {k}
      </dt>
      <dd className="text-right text-sm text-midnight">{v}</dd>
    </div>
  );
}
