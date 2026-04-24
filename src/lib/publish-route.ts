// Routage contextuel du CTA « Publier une annonce ».
//
// Au Maroc la pratique n'est pas au KYC pour publier une annonce
// particulier — on laisse le bailleur publier immédiatement et la
// modération humaine (admin) s'occupe des cas frauduleux.
//
// Le rôle BAILLEUR est auto-accordé au premier clic « Publier » pour
// éliminer toute friction. Le KYC (upload pièce, titre) reste
// accessible via /bailleur/onboarding mais uniquement comme upgrade
// volontaire pour obtenir le badge « Vérifié Baboo ».
//
// Matrice :
//   - Non connecté            → /connexion?callbackUrl=/publier
//   - AGENCY + agencyId       → /pro/listings/new
//   - DEVELOPER               → /developer/projets/nouveau
//   - BAILLEUR                → /pro/listings/new
//   - Sinon (USER simple)     → auto-grant BAILLEUR + /pro/listings/new

import { auth } from "@/auth";
import { grantRole } from "@/lib/roles";
import { UserRole } from "@prisma/client";

export type PublishTarget =
  | { route: "/connexion"; callbackUrl: string }
  | { route: "/pro/listings/new" }
  | { route: "/developer/projets/nouveau" };

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

  // Auto-grant BAILLEUR si pas déjà — zéro friction, la modération se
  // fait au niveau de l'annonce (admin valide PUBLISHED ou rejette).
  if (!roles.includes("BAILLEUR")) {
    try {
      await grantRole(userId, UserRole.BAILLEUR, {
        reason: "Auto-grant via clic CTA Publier",
      });
    } catch {
      // silencieux — en cas d'échec DB on redirige quand même
    }
  }

  return { route: "/pro/listings/new" };
}
