// Utilitaire slug partagé. Remplace les implémentations dupliquées
// (src/actions/pro-listings.ts, src/actions/developer-projects.ts, etc.).
// Une seule source de vérité pour garantir la cohérence des URLs Baboo.

const MAX_SLUG_LENGTH = 60;

/**
 * Normalise une chaîne en slug URL-safe : NFD, retrait des diacritiques,
 * lowercase, remplacement des non-alphanumériques par `-`, trim des `-`
 * en bordure, troncation à 60 caractères.
 *
 * Exemples :
 *   "Appartement à Marrakech"   → "appartement-a-marrakech"
 *   "Villa / Riad — centre"     → "villa-riad-centre"
 *   "   "                       → ""
 */
export function toSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH);
}

/**
 * Assure l'unicité d'un slug en itérant avec un suffixe numérique.
 * `exists` est une fonction async fournie par l'appelant qui interroge
 * la table cible (Listing, Agency, Project, etc.).
 *
 * Si plus de 50 collisions, bascule sur un suffixe timestamp base36 pour
 * garantir la terminaison (cas pathologique d'un seed massif).
 *
 * @param base    Le slug brut (sortie de `toSlug`).
 * @param exists  Prédicat async : retourne true si le slug est déjà pris.
 * @returns       Un slug unique.
 */
export async function uniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  if (!base) base = "item";
  let slug = base;
  let i = 2;
  while (await exists(slug)) {
    slug = `${base}-${i}`;
    i += 1;
    if (i > 50) return `${base}-${Date.now().toString(36)}`;
  }
  return slug;
}
