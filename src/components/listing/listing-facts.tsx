import {
  BedIcon,
  BathIcon,
  Maximize2Icon,
  CalendarIcon,
  BuildingIcon,
} from "@/components/ui/icons";
import { formatSurface } from "@/lib/format";
import {
  PROPERTY_TYPE_LABEL,
  CONDITION_LABEL,
  type PropertyType,
  type Condition,
} from "@/data/taxonomy";
import { cn } from "@/lib/cn";

interface Props {
  surface: number;
  landSurface?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  propertyType: PropertyType;
  yearBuilt?: number | null;
  condition?: Condition | null;
}

type Fact = {
  label: string;
  value: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

/**
 * V2 : grille 2 colonnes, bordure périmétrique sable, séparateurs internes.
 * Icônes dans un carré surface-warm, label eyebrow-muted, valeur en Fraunces.
 */
export function ListingFacts(props: Props) {
  const items: Fact[] = [];
  items.push({
    label: "Surface",
    value: formatSurface(props.surface),
    Icon: Maximize2Icon,
  });
  if (props.bedrooms != null)
    items.push({ label: "Chambres", value: String(props.bedrooms), Icon: BedIcon });
  if (props.bathrooms != null)
    items.push({
      label: "Salles de bain",
      value: String(props.bathrooms),
      Icon: BathIcon,
    });
  if (props.landSurface)
    items.push({ label: "Terrain", value: formatSurface(props.landSurface) });
  if (props.yearBuilt)
    items.push({ label: "Construit", value: String(props.yearBuilt), Icon: CalendarIcon });
  if (props.floor != null)
    items.push({
      label: "Étage",
      value: props.totalFloors
        ? `${props.floor}/${props.totalFloors}`
        : String(props.floor),
      Icon: BuildingIcon,
    });
  if (props.condition)
    items.push({ label: "État", value: CONDITION_LABEL[props.condition] });
  items.push({
    label: "Type",
    value: PROPERTY_TYPE_LABEL[props.propertyType],
  });

  // Force un nombre pair pour avoir une grille propre.
  const even = items.slice(0, items.length - (items.length % 2));

  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border">
      {even.map(({ label, value, Icon }, i) => (
        <div
          key={label}
          className={cn(
            "flex items-center gap-3 p-4",
            i % 2 === 0 ? "border-r border-border" : "",
            i < even.length - 2 ? "border-b border-border" : "",
          )}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cream-2">
            {Icon ? (
              <Icon className="h-4 w-4 text-midnight" />
            ) : (
              <span className="mono text-[10px] font-semibold text-midnight">·</span>
            )}
          </div>
          <div className="min-w-0">
            <dt className="eyebrow-muted">{label}</dt>
            <dd className="display-md mt-0.5 text-[1.0625rem] leading-none">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
