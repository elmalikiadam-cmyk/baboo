import { cn } from "@/lib/cn";

interface Stat {
  value: string;
  label: string;
}

/**
 * V3 — strip horizontal avec chiffres clés en terracotta Fraunces +
 * label mono uppercase en dessous. Utilisé dans le hero home.
 */
export function StatsStrip({
  items,
  className,
}: {
  items: Stat[];
  className?: string;
}) {
  return (
    <div className={cn("flex gap-8 md:gap-12", className)}>
      {items.map((s) => (
        <div key={s.label} className="flex flex-col">
          <span className="display-lg font-semibold text-terracotta">
            {s.value}
          </span>
          <span className="eyebrow mt-1">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
