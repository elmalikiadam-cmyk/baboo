import { BedIcon, BathIcon, RulerIcon } from "@/components/ui/icons";
import { formatSurface } from "@/lib/format";
import { PROPERTY_TYPE_LABEL, CONDITION_LABEL, type PropertyType, type Condition } from "@/data/taxonomy";

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

export function ListingFacts(props: Props) {
  const items: { label: string; value: string; Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [];
  items.push({ label: "Type", value: PROPERTY_TYPE_LABEL[props.propertyType] });
  items.push({ label: "Surface habitable", value: formatSurface(props.surface), Icon: RulerIcon });
  if (props.landSurface) items.push({ label: "Terrain", value: formatSurface(props.landSurface) });
  if (props.bedrooms != null) items.push({ label: "Chambres", value: String(props.bedrooms), Icon: BedIcon });
  if (props.bathrooms != null) items.push({ label: "Salles de bain", value: String(props.bathrooms), Icon: BathIcon });
  if (props.floor != null) items.push({ label: "Étage", value: props.totalFloors ? `${props.floor}/${props.totalFloors}` : String(props.floor) });
  if (props.yearBuilt) items.push({ label: "Année", value: String(props.yearBuilt) });
  if (props.condition) items.push({ label: "État", value: CONDITION_LABEL[props.condition] });

  return (
    <dl className="grid grid-cols-2 gap-y-5 gap-x-6 border-y border-border py-6 sm:grid-cols-3 md:grid-cols-4">
      {items.map(({ label, value, Icon }) => (
        <div key={label}>
          <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {label}
          </dt>
          <dd className="mt-1 font-display text-lg font-semibold text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
