import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { isPrivateStorageEnabled } from "@/lib/storage";
import { KycOnboardingForm } from "@/components/bailleur/kyc-onboarding-form";

export const metadata: Metadata = {
  title: "Obtenir le badge « Vérifié » — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Vérification Baboo — étape optionnelle.
 * Au Maroc, publier une annonce ne requiert pas de KYC. Cette page est
 * accessible uniquement aux bailleurs qui souhaitent obtenir un badge
 * de confiance « Vérifié Baboo » visible sur leurs annonces.
 * Validation manuelle par l'équipe, 48 h ouvrées.
 */
export default async function BailleurOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/bailleur/onboarding");

  const userId = session.user.id;

  let status: string | null = null;
  let existingRejection: string | null = null;
  if (hasDb()) {
    try {
      const v = await db.landlordVerification.findUnique({
        where: { userId },
        select: { status: true, rejectionReason: true },
      });
      status = v?.status ?? null;
      if (v?.status === "REJECTED") {
        existingRejection = v.rejectionReason;
      }
    } catch {
      /* silencieux */
    }
  }

  const storageReady = isPrivateStorageEnabled();

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/compte" className="hover:text-midnight">Mon compte</Link>
        <span className="mx-2">·</span>
        <span>Obtenir le badge</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Optionnel</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Obtenir le badge{" "}
          <span className="text-terracotta">« Vérifié Baboo »</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Cette étape n'est <strong>pas nécessaire</strong> pour publier
          une annonce — vous pouvez déjà le faire. Elle débloque le badge
          « Vérifié Baboo » visible par les candidats : un gage de
          confiance qui augmente le nombre de candidatures de qualité.
        </p>
      </header>

      {status === "APPROVED" && (
        <div className="mt-8 rounded-2xl border border-forest/30 bg-forest/5 p-6">
          <p className="eyebrow text-forest">✓ Badge obtenu</p>
          <p className="mt-2 text-sm text-midnight">
            Votre profil est vérifié. Le badge apparaît sur toutes vos annonces.
          </p>
        </div>
      )}

      {status === "PENDING" && (
        <div className="mt-8 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-6">
          <p className="eyebrow text-terracotta">⏳ Vérification en cours</p>
          <p className="mt-2 text-sm text-midnight">
            Notre équipe examine votre dossier, réponse sous 48 h ouvrées.
          </p>
        </div>
      )}

      {existingRejection && (
        <div className="mt-8 rounded-2xl border border-danger/40 bg-danger/5 p-5">
          <p className="eyebrow text-danger">Précédente demande refusée</p>
          <p className="mt-2 text-sm text-midnight">
            Motif : <span className="italic">« {existingRejection} »</span>
          </p>
        </div>
      )}

      {status !== "APPROVED" && status !== "PENDING" && (
        <>
          {!storageReady && (
            <div className="mt-8 rounded-2xl border border-midnight/20 bg-cream-2 p-5">
              <p className="eyebrow">⚠ Espace documents en préparation</p>
              <p className="mt-2 text-sm text-midnight">
                L'upload sécurisé n'est pas encore activé. Revenez plus tard
                ou publiez directement votre annonce sans badge.
              </p>
            </div>
          )}

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
            <KycOnboardingForm disabled={!storageReady} />

            <aside className="space-y-4">
              <div className="rounded-2xl border border-midnight/10 bg-cream p-6">
                <p className="eyebrow">Ce qu'apporte le badge</p>
                <ul className="mt-4 space-y-3 text-sm text-midnight">
                  <li>✓ Badge « Vérifié » visible sur toutes vos annonces</li>
                  <li>✓ Priorité dans les résultats de recherche</li>
                  <li>✓ Candidatures de meilleure qualité</li>
                  <li>✓ Accès au programme gestion locative V2</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-forest p-6 text-cream">
                <p className="eyebrow text-cream/60">Confidentialité</p>
                <p className="mt-2 text-sm">
                  Vos documents sont chiffrés, visibles uniquement par notre
                  équipe de modération. Conformité loi 09-08.
                </p>
              </div>
            </aside>
          </div>
        </>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/pro/listings/new"
          className="inline-flex h-11 items-center rounded-full bg-terracotta px-6 text-sm font-semibold text-cream hover:bg-terracotta-2"
        >
          Publier une annonce maintenant →
        </Link>
      </div>
    </div>
  );
}
