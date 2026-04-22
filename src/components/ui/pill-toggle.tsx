"use client";

import { cn } from "@/lib/cn";

export interface PillOption<V extends string> {
  value: V;
  label: string;
}

interface Props<V extends string> {
  options: readonly PillOption<V>[];
  value: V;
  onChange: (v: V) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Toggle horizontal deux options ou plus.
 * Container en surface-warm, option active en ink.
 */
export function PillToggle<V extends string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: Props<V>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex rounded-full bg-cream-2 p-1 gap-1", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 h-10 rounded-full text-sm font-medium transition-colors duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-midnight/40",
              active
                ? "bg-midnight text-cream"
                : "text-muted-foreground hover:text-midnight",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
