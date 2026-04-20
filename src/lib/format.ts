const MAD_FORMATTER = new Intl.NumberFormat("fr-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 0,
});

const NUMBER_FR = new Intl.NumberFormat("fr-FR");

export function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return "Prix sur demande";
  return MAD_FORMATTER.format(amount);
}

export function formatPricePerMonth(amount: number | null | undefined): string {
  if (amount == null) return "Prix sur demande";
  return `${MAD_FORMATTER.format(amount)} /mois`;
}

export function formatSurface(m2: number | null | undefined): string {
  if (m2 == null) return "—";
  return `${NUMBER_FR.format(m2)} m²`;
}

export function formatRooms(n: number | null | undefined, label: string): string {
  if (n == null || n === 0) return "—";
  return `${n} ${label}${n > 1 ? "s" : ""}`;
}

const DATE_FR = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

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
