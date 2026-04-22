import { CheckIcon } from "@/components/ui/icons";
import { AMENITIES } from "@/data/taxonomy";

export function AmenityList({ flags }: { flags: Record<string, boolean> }) {
  const present = AMENITIES.filter((a) => flags[a.key]);
  if (present.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted">
        Le propriétaire n'a pas précisé de commodité spécifique.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {present.map((a) => (
        <li key={a.key} className="flex items-center gap-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-forest-soft text-forest">
            <CheckIcon className="h-3 w-3" />
          </span>
          <span className="text-sm text-midnight">{a.label}</span>
        </li>
      ))}
    </ul>
  );
}
