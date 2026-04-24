// Feature flags simples — V1 contrôlés par variables d'environnement
// (pas de DB, pas de service externe). Permet d'activer/désactiver des
// pans entiers de la plateforme sans déploiement de code.
//
// Convention : nommer les flags `FEATURE_<NOM>` côté env. Valeur attendue
// "1" / "true" pour ON, n'importe quoi d'autre (ou absent) → OFF.
// Le défaut documenté ci-dessous s'applique si l'env est absente.
//
// Ces flags sont lus côté serveur (Server Components, Server Actions,
// route handlers). Pour exposer un flag côté client, ajouter un préfixe
// NEXT_PUBLIC_.

export const FEATURES = {
  /** Pack visites + dispatcher agents Baboo (Phase 2). Default ON. */
  managedVisits: read("FEATURE_MANAGED_VISITS", true),

  /** Promoteur B2B (PromoterPack, dashboards, weekly reports). Default ON. */
  promoterPacks: read("FEATURE_PROMOTER_PACKS", true),

  /** Lead routing /je-cherche → /partners. Default ON. */
  partnerRouting: read("FEATURE_PARTNER_ROUTING", true),

  /** Demandes Pack photos / Pack ménage côté propriétaire. Default ON. */
  ownerServices: read("FEATURE_OWNER_SERVICES", true),

  /** Affiche le badge « VÉRIFIÉ BABOO » sur les fiches d'agences vérifiées.
   *  Default ON — le toggle existe pour pouvoir le couper si on simplifie
   *  encore l'identité visuelle.
   */
  verifiedBadge: read("FEATURE_VERIFIED_BADGE", true),
} as const;

export type FeatureName = keyof typeof FEATURES;

export function isFeatureEnabled(name: FeatureName): boolean {
  return FEATURES[name];
}

function read(envName: string, defaultValue: boolean): boolean {
  const v = process.env[envName];
  if (v == null) return defaultValue;
  const norm = v.trim().toLowerCase();
  if (norm === "1" || norm === "true" || norm === "on") return true;
  if (norm === "0" || norm === "false" || norm === "off") return false;
  return defaultValue;
}
