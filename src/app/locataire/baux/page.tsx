import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Mes baux — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Préparation par le bailleur",
  GENERATED: "À signer",
  SIGNED_UPLOADED: "Signature reçue",
  ACTIVE: "Actif",
  TERMINATED: "Résilié",
  EXPIRED: "Expiré",
};
const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-midnight/10 text-midnight",
  GENERATED: "bg-terracotta/10 text-terracotta",
  SIGNED_UPLOADED: "bg-forest/10 text-forest",
  ACTIVE: "bg-forest/15 text-forest",
  TERMINATED: "bg-muted/20 text-muted-foreground",
  EXPIRED: "bg-muted/20 text-muted-foreground",
};

export default async function TenantLeasesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/locataire/baux");

  const leases = hasDb()
    ? await db.lease
        .findMany({
          where: { tenantUserId: session.user.id },
          orderBy: { updatedAt: "desc" },
          include: {
            landlordUser: { select: { name: true, email: true } },
          },
        })
        .catch(() => [])
    : [];

  return (
    <div className="container py-10 md:py-16">
      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Locataire · baux</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">Mes baux.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Dès qu'un bailleur vous propose un bail, il apparaît ici.
            Téléchargez le PDF, signez-le physiquement, uploadez la
            version signée — ou laissez le bailleur le faire.
          </p>
        </div>
      </header>

      {leases.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center">
          <p className="display-md text-xl">Aucun bail en cours.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Une fois votre candidature acceptée, le bailleur vous proposera
            un bail que vous retrouverez ici.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {leases.map((l) => (
            <li key={l.id} className="rounded-xl border border-midnight/10 bg-cream p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/locataire/baux/${l.id}`}
                    className="display-lg text-base hover:text-terracotta"
                  >
                    {l.propertyAddress}, {l.propertyCity}
                  </Link>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Bailleur : {l.landlordUser.name ?? l.landlordUser.email}
                    {" · "}
                    {l.monthlyRent.toLocaleString("fr-FR")} MAD/mois
                    {" · "}
                    dès le{" "}
                    {l.startDate.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] ${STATUS_TONE[l.status]}`}
                >
                  {STATUS_LABEL[l.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
