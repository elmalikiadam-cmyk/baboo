// Format FR avec espaces fines (U+202F) pour les milliers.
// Intl utilise déjà la bonne séparation en fr-FR ; on s'assure juste d'une
// normalisation propre pour les petites variantes de rendu.

const NUM_FR = new Intl.NumberFormat("fr-FR");

export function formatPrice(n: number | null | undefined): string {
  if (n == null) return "Prix sur demande";
  return `${NUM_FR.format(n)} MAD`;
}

export function formatPricePerMonth(n: number | null | undefined): string {
  if (n == null) return "Prix sur demande";
  return `${NUM_FR.format(n)} MAD/mois`;
}

export function formatPricePerSqm(price: number, surface: number): string {
  if (!surface) return "—";
  return `${NUM_FR.format(Math.round(price / surface))} MAD/m²`;
}

export function formatSurface(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${NUM_FR.format(n)} m²`;
}

const DATE_FR = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(d: Date | string): string {
  return DATE_FR.format(typeof d === "string" ? new Date(d) : d);
}

export function relativeDate(d: Date | string): string {
  const then = typeof d === "string" ? new Date(d) : d;
  const diffDays = Math.round((Date.now() - then.getTime()) / 86_400_000);
  if (diffDays < 1) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
  return `Il y a ${Math.floor(diffDays / 365)} an${diffDays >= 730 ? "s" : ""}`;
}
