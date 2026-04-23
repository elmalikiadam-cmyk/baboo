// Routage contextuel du CTA « Publier une annonce ».
// Un seul point d'entrée public (`/publier`) qui redirige selon l'état
// du user. Objectif : garder la surface publique simple (un seul lien,
// un seul intitulé) et absorber toute la complexité côté serveur.
//
// Matrice de décision :
//   - Non connecté                      → /connexion?callbackUrl=/publier
//   - AGENCY + agencyId                 → /pro/listings/new  (flux pro existant)
//   - DEVELOPER                         → /developer/projets/nouveau (flux promoteur)
//   - BAILLEUR (grant actif)            → /pro/listings/new
//   - Sans KYC (pas de LandlordVerification, ou REJECTED) → /bailleur/onboarding
//   - KYC PENDING                       → /bailleur/onboarding/status

import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export type PublishTarget =
  | { route: "/connexion"; callbackUrl: string }
  | { route: "/pro/listings/new" }
  | { route: "/developer/projets/nouveau" }
  | { route: "/bailleur/onboarding" }
  | { route: "/bailleur/onboarding/status" };

export async function resolvePublishTarget(): Promise<PublishTarget> {
  const session = await auth();
  if (!session?.user?.id) {
    return { route: "/connexion", callbackUrl: "/publier" };
  }

  const userId = session.user.id;
  const roles = session.user.roles ?? (session.user.role ? [session.user.role] : []);

  if (roles.includes("AGENCY") && session.user.agencyId) {
    return { route: "/pro/listings/new" };
  }
  if (roles.includes("DEVELOPER") && session.user.developerId) {
    return { route: "/developer/projets/nouveau" };
  }
  if (roles.includes("BAILLEUR")) {
    return { route: "/pro/listings/new" };
  }

  // Pas encore bailleur — on regarde s'il y a un dossier en cours.
  if (!hasDb()) {
    return { route: "/bailleur/onboarding" };
  }
  try {
    const v = await db.landlordVerification.findUnique({
      where: { userId },
      select: { status: true },
    });
    if (v?.status === "PENDING") {
      return { route: "/bailleur/onboarding/status" };
    }
  } catch {
    // silencieux — on tombe sur onboarding si la lecture échoue
  }
  return { route: "/bailleur/onboarding" };
}
