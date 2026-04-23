import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { relativeDate } from "@/lib/format";
import { CraftsmanRequestActions } from "@/components/artisan/craftsman-request-actions";

export const metadata: Metadata = {
  title: "Espace artisan — Baboo",
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

export default async function CraftsmanDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/pro/artisan");
  if (!hasDb()) return null;

  const craftsman = await db.craftsman.findUnique({
    where: { userId: session.user.id },
    select: { id: true, slug: true, displayName: true, verified: true },
  });

  if (!craftsman) {
    redirect("/pro/artisan/inscription");
  }

  const requests = await db.serviceRequest.findMany({
    where: { assignedCraftsmanId: craftsman.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 50,
    include: {
      requesterUser: { select: { name: true, email: true, phone: true } },
    },
  });

  return (
    <div className="container py-10 md:py-16">
      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Artisan · tableau de bord</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">
            Bonjour, {craftsman.displayName.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {craftsman.verified
              ? "Profil vérifié · badge visible publiquement."
              : "En attente de vérification par l'équipe Baboo."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/artisans/${craftsman.slug}`}
            className="rounded-full border border-midnight/20 px-4 py-2 text-xs font-medium text-midnight hover:border-midnight"
          >
            Voir mon profil public
          </Link>
          <Link
            href="/pro/artisan/inscription"
            className="rounded-full border border-midnight/20 px-4 py-2 text-xs font-medium text-midnight hover:border-midnight"
          >
            Modifier mon profil
          </Link>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="display-md text-xl">
          Demandes reçues{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({requests.length})
          </span>
        </h2>

        {requests.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-8 text-center text-sm text-muted-foreground">
            Vous n'avez pas encore de demande assignée. Les bailleurs
            et locataires peuvent vous contacter directement depuis
            votre fiche publique.
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
                      {r.requesterUser.name ?? r.requesterUser.email}
                      {r.requesterUser.phone && ` · ${r.requesterUser.phone}`}
                      {" · "}
                      reçue {relativeDate(r.createdAt)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-midnight">
                      {r.description}
                    </p>
                    {(r.budgetMin || r.budgetMax) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Budget : {r.budgetMin?.toLocaleString("fr-FR") ?? "—"} -{" "}
                        {r.budgetMax?.toLocaleString("fr-FR") ?? "—"} MAD
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] ${STATUS_TONE[r.status]}`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <CraftsmanRequestActions
                  requestId={r.id}
                  status={r.status}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
