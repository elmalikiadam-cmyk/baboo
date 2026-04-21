import { Check } from "@/components/ui/icons";
import { AMENITIES } from "@/data/taxonomy";

interface Props {
  flags: Record<string, boolean>;
}

export function AmenityList({ flags }: Props) {
  const active = AMENITIES.filter((a) => flags[a.key]);
  if (active.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-ink-muted">
        Le propriétaire n'a pas précisé de commodité spécifique.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {active.map((a) => (
        <li key={a.key} className="flex items-center gap-3">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-success-soft text-success">
            <Check size={12} strokeWidth={2.2} aria-hidden />
          </span>
          <span className="text-sm text-ink">{a.label}</span>
        </li>
      ))}
    </ul>
  );
}
