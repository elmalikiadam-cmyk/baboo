import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "dark" | "light" | "accent" | "success";
type Size = "sm" | "md";
type Shape = "round" | "sticker";

const tones: Record<Tone, string> = {
  neutral: "bg-cream-2 text-midnight border border-border",
  dark: "bg-midnight text-cream",
  light: "bg-white/95 text-midnight backdrop-blur-sm",
  accent: "bg-terracotta-soft text-terracotta",
  success: "bg-forest-soft text-forest",
};

const sizes: Record<Size, string> = {
  sm: "h-6 px-2.5 text-[10px] font-semibold tracking-[0.04em] uppercase",
  md: "h-7 px-3 text-xs font-semibold tracking-wide uppercase",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  /** "round" = rounded-full (défaut). "sticker" = rounded-sm — étiquette cousue
   *  utilisée pour "À vendre / À louer" sur photo. */
  shape?: Shape;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone = "neutral", size = "sm", shape = "round", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        shape === "round" ? "rounded-full" : "rounded-sm",
        tones[tone],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";
