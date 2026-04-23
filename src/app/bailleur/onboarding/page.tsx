import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { isPrivateStorageEnabled } from "@/lib/storage";
import { KycOnboardingForm } from "@/components/bailleur/kyc-onboarding-form";

export const metadata: Metadata = {
  title: "Devenir bailleur — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function BailleurOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/publier");

  const userId = session.user.id;
  const roles = session.user.roles ?? [];

  // Déjà bailleur → direct vers la publication d'annonce.
  if (roles.includes("BAILLEUR") || roles.includes("AGENCY")) {
    redirect("/pro/listings/new");
  }

  // Dossier PENDING → page de statut.
  let existingRejection: string | null = null;
  if (hasDb()) {
    try {
      const v = await db.landlordVerification.findUnique({
        where: { userId },
        select: { status: true, rejectionReason: true },
      });
      if (v?.status === "PENDING") {
        redirect("/bailleur/onboarding/status");
      }
      if (v?.status === "REJECTED") {
        existingRejection = v.rejectionReason;
      }
    } catch {
      /* silencieux, on affiche le formulaire par défaut */
    }
  }

  const storageReady = isPrivateStorageEnabled();

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted">
        Accueil <span className="mx-2">·</span> Devenir bailleur
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Particuliers · publication self-service</p>
        <h1 className="display-xl mt-2 text-4xl md:text-5xl">
          Vérifions votre identité, puis vous publiez.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Pour protéger les locataires et limiter les fraudes, on vous
          demande trois choses simples : une pièce d'identité, une
          attestation que vous êtes habilité à louer ce bien, et
          (facultatif) un RIB pour la gestion locative. Validation sous
          48 h ouvrées.
        </p>
      </header>

      {existingRejection && (
        <div className="mt-8 rounded-2xl border border-danger/40 bg-danger/5 p-5">
          <p className="eyebrow text-danger">Précédent dossier refusé</p>
          <p className="mt-2 text-sm text-midnight">
            Motif : <span className="italic">« {existingRejection} »</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Corrigez les éléments ci-dessous puis re-soumettez.
          </p>
        </div>
      )}

      {!storageReady && (
        <div className="mt-8 rounded-2xl border border-midnight/20 bg-cream-2 p-5">
          <p className="eyebrow">⚠ Espace documents en préparation</p>
          <p className="mt-2 text-sm text-midnight">
            Notre espace de stockage sécurisé n'est pas encore activé
            côté infrastructure. Vous pouvez préparer vos documents, la
            soumission sera ouverte sous peu.
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <KycOnboardingForm disabled={!storageReady} />

        <aside className="space-y-6">
          <div className="rounded-2xl border border-midnight/10 bg-cream p-6">
            <p className="eyebrow">Ce qu'on vérifie</p>
            <ul className="mt-4 space-y-3 text-sm text-midnight">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-midnight text-center font-mono text-[11px] leading-6 text-cream">
                  1
                </span>
                <span>
                  <strong>CIN ou passeport</strong> — recto + verso, photo
                  nette, sans reflet.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-midnight text-center font-mono text-[11px] leading-6 text-cream">
                  2
                </span>
                <span>
                  <strong>Droit de louer</strong> — titre foncier, acte
                  notarié, attestation des ayants-droit, ou mandat si vous
                  gérez pour autrui.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-midnight text-center font-mono text-[11px] leading-6 text-cream">
                  3
                </span>
                <span>
                  <strong>RIB</strong> (optionnel) — uniquement si vous
                  souhaitez encaisser les loyers via Baboo plus tard.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-forest p-6 text-cream">
            <p className="eyebrow text-cream/60">Confidentialité</p>
            <p className="mt-2 text-sm">
              Vos documents sont stockés dans un espace privé, chiffrés
              au repos, visibles uniquement par notre équipe de
              modération. Conformité loi 09-08.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
