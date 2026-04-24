import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { ActivatePackButton } from "@/components/admin/activate-pack-button";

export const metadata: Metadata = {
  title: "Packs visites — Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminVisitPacksPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/admin/visit-packs");
  if (session.user.role !== "ADMIN") redirect("/");
  if (!hasDb()) return null;

  const [pending, active] = await Promise.all([
    db.visitPack.findMany({
      where: { status: "PENDING_PAYMENT" },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true } },
        listing: { select: { title: true } },
      },
      take: 50,
    }),
    db.visitPack.findMany({
      where: { status: "ACTIVE" },
      orderBy: { paidAt: "desc" },
      include: {
        user: { select: { email: true, name: true } },
        listing: { select: { title: true } },
      },
      take: 50,
    }),
  ]);

  return (
    <div className="container py-10 md:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link href="/admin" className="hover:text-midnight">
          Admin
        </Link>
        <span className="mx-2">·</span>
        <span>Packs visites</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Commerce · activation manuelle</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Packs visites.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Les packs créés en mode manuel (sans gateway configuré)
          arrivent en PENDING_PAYMENT. Après encaissement, on active
          ici — le bailleur reçoit une notification.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="display-md text-xl">
          En attente de paiement ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-6 text-center text-sm text-muted-foreground">
            Rien à activer. Respirez.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border border-midnight/10 bg-cream p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="display-md text-base">
                      {p.type.replace(/_/g, " ")} —{" "}
                      {p.listing?.title ?? "annonce orpheline"}
                    </p>
                    <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {p.user.name ?? p.user.email} ·{" "}
                      {p.amountPaid.toLocaleString("fr-FR")} MAD ·{" "}
                      {p.paymentProvider} · créé{" "}
                      {p.createdAt.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <ActivatePackButton packId={p.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="display-md text-xl">
          Actifs ({active.length})
        </h2>
        {active.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-6 text-center text-sm text-muted-foreground">
            Aucun pack actif pour l'instant.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {active.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-midnight/10 bg-cream p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {p.type.replace(/_/g, " ")} ·{" "}
                    {p.listing?.title ?? "—"}
                  </p>
                  <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {p.user.name ?? p.user.email} ·{" "}
                    {p.creditsUsed}/{p.creditsTotal} utilisés ·{" "}
                    expire {p.expiresAt.toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span className="mono rounded-full bg-forest/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-forest">
                  Actif
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
