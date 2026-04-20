/**
 * Formate un nombre avec espace fin comme séparateur de milliers.
 * 4200000 → "4 200 000"
 */
export function formatPrice(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** "4 200 000 MAD" ou "18 500 MAD/MOIS" */
export function formatPriceFull(
  n: number,
  period?: 'month' | 'day' | 'night'
): string {
  const base = `${formatPrice(n)} MAD`;
  if (!period) return base;
  const suffix = { month: '/MOIS', day: '/JOUR', night: '/NUIT' }[period];
  return `${base}${suffix}`;
}
