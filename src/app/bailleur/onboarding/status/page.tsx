import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Dossier bailleur en cours — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function BailleurStatusPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/publier");

  const roles = session.user.roles ?? [];
  if (roles.includes("BAILLEUR") || roles.includes("AGENCY")) {
    redirect("/pro/listings/new");
  }

  if (!hasDb()) redirect("/bailleur/onboarding");

  const v = await db.landlordVerification.findUnique({
    where: { userId: session.user.id },
    select: {
      status: true,
      submittedAt: true,
      reviewedAt: true,
      rejectionReason: true,
    },
  });

  if (!v) redirect("/bailleur/onboarding");
  if (v.status === "REJECTED") redirect("/bailleur/onboarding");

  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow">Dossier bailleur</p>
        <h1 className="display-xl mt-3 text-4xl md:text-5xl">
          {v.status === "APPROVED"
            ? "Dossier validé."
            : "Dossier en cours d'examen."}
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          {v.status === "APPROVED" ? (
            <>Votre rôle bailleur est actif. Vous pouvez publier votre première annonce.</>
          ) : (
            <>
              Reçu le{" "}
              <time dateTime={v.submittedAt.toISOString()}>
                {v.submittedAt.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              . Notre équipe valide sous 48 h ouvrées. Vous recevrez un
              email dès que c'est fait.
            </>
          )}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {v.status === "APPROVED" ? (
            <Link
              href="/pro/listings/new"
              className="inline-flex h-11 items-center rounded-full bg-terracotta px-6 text-sm font-semibold text-cream hover:bg-terracotta-2"
            >
              Publier mon annonce →
            </Link>
          ) : (
            <Link
              href="/compte"
              className="inline-flex h-11 items-center rounded-full border-2 border-midnight px-6 text-sm font-medium text-midnight hover:bg-midnight hover:text-cream"
            >
              Retour à mon compte
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
