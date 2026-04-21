import { Maximize2, Bed, Bath, Calendar } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

interface Props {
  surface: number;
  bedrooms: number | null;
  bathrooms: number | null;
  yearBuilt: number | null;
}

type Fact = {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string;
};

/**
 * Grille 2x2 des caractéristiques. Bordure périmétrique + séparateurs internes,
 * pas de double bordure aux intersections.
 */
export function ListingFacts({ surface, bedrooms, bathrooms, yearBuilt }: Props) {
  const facts: Fact[] = [
    { Icon: Maximize2, label: "Surface", value: `${surface} m²` },
    { Icon: Bed, label: "Chambres", value: bedrooms != null ? String(bedrooms) : "—" },
    { Icon: Bath, label: "Salles de bain", value: bathrooms != null ? String(bathrooms) : "—" },
    { Icon: Calendar, label: "Construit", value: yearBuilt != null ? String(yearBuilt) : "—" },
  ];

  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border">
      {facts.map((f, i) => (
        <div
          key={f.label}
          className={cn(
            "flex items-center gap-3 p-4",
            i % 2 === 0 ? "border-r border-border" : "",
            i < 2 ? "border-b border-border" : "",
          )}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-warm">
            <f.Icon size={15} strokeWidth={1.8} className="text-ink" />
          </div>
          <div className="min-w-0">
            <p className="eyebrow-muted">{f.label}</p>
            <p className="display-md mt-0.5 text-[1.0625rem]">{f.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
