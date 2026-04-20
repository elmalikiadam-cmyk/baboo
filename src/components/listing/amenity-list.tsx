import { CheckIcon } from "@/components/ui/icons";
import { AMENITIES } from "@/data/taxonomy";

export function AmenityList({ flags }: { flags: Record<string, boolean> }) {
  const present = AMENITIES.filter((a) => flags[a.key]);
  if (present.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="font-display text-2xl font-semibold">Commodités</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {present.map((a) => (
          <li key={a.key} className="flex items-center gap-2.5 text-sm text-foreground">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-success/10 text-success">
              <CheckIcon className="h-4 w-4" />
            </span>
            {a.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
