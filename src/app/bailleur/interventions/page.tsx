import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { ServiceRequestForm } from "@/components/bailleur/service-request-form";
import { relativeDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Interventions — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Ouverte",
  ASSIGNED: "Assignée",
  ACCEPTED: "Acceptée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};
const STATUS_TONE: Record<string, string> = {
  OPEN: "bg-midnight/10 text-midnight",
  ASSIGNED: "bg-terracotta/15 text-terracotta",
  ACCEPTED: "bg-forest/15 text-forest",
  IN_PROGRESS: "bg-terracotta/10 text-terracotta",
  COMPLETED: "bg-forest/20 text-forest",
  CANCELLED: "bg-muted/20 text-muted-foreground",
};

export default async function InterventionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/bailleur/interventions");
  if (!hasDb()) return null;

  // Une seule vue pour bailleur ET locataire : on montre toutes les
  // demandes où le user est requester.
  const requests = await db.serviceRequest.findMany({
    where: { requesterUserId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      assignedCraftsman: {
        select: { slug: true, displayName: true, speciality: true, phone: true },
      },
    },
  });

  // Baux actifs pour pouvoir rattacher une demande à un bail.
  const myLeases = await db.lease.findMany({
    where: {
      OR: [
        { landlordUserId: session.user.id },
        { tenantUserId: session.user.id },
      ],
      status: { in: ["ACTIVE", "SIGNED_UPLOADED"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      propertyAddress: true,
      propertyCity: true,
    },
    take: 20,
  });

  return (
    <div className="container py-10 md:py-16">
      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Mes interventions</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">
            Plombier, électricien, peintre.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Déclarez un besoin, choisissez un artisan de l'annuaire,
            suivez l'intervention jusqu'à son achèvement.
          </p>
        </div>
        <Link
          href="/artisans"
          className="inline-flex h-11 items-center rounded-full border-2 border-midnight px-5 text-sm font-medium text-midnight hover:bg-midnight hover:text-cream"
        >
          Parcourir l'annuaire →
        </Link>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <section>
          <h2 className="display-md text-xl">Nouvelle demande</h2>
          <div className="mt-5">
            <ServiceRequestForm
              leases={myLeases.map((l) => ({
                id: l.id,
                label: `${l.propertyAddress}, ${l.propertyCity}`,
              }))}
            />
          </div>
        </section>

        <section>
          <h2 className="display-md text-xl">Mes demandes</h2>
          {requests.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-8 text-center text-sm text-muted-foreground">
              Aucune demande pour le moment.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-midnight/10 bg-cream p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="display-lg text-base">{r.title}</p>
                      <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {r.speciality} · créée {relativeDate(r.createdAt)}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {r.description}
                      </p>
                      {r.assignedCraftsman && (
                        <p className="mt-2 text-xs text-midnight">
                          Assigné à{" "}
                          <Link
                            href={`/artisans/${r.assignedCraftsman.slug}`}
                            className="font-semibold underline decoration-dotted"
                          >
                            {r.assignedCraftsman.displayName}
                          </Link>
                          {r.assignedCraftsman.phone && ` · ${r.assignedCraftsman.phone}`}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] ${STATUS_TONE[r.status]}`}
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                  </div>
                  {r.status === "OPEN" && (
                    <div className="mt-3 border-t border-midnight/10 pt-3">
                      <Link
                        href={`/artisans?speciality=${r.speciality}`}
                        className="text-xs font-medium text-terracotta hover:underline"
                      >
                        → Trouver un artisan pour cette demande
                      </Link>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
