import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "soft" | "accent" | "link";
type Size = "xs" | "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** @deprecated — V2 : tous les boutons sont rounded-full. Prop ignorée. */
  shape?: "pill" | "sharp";
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap " +
  "transition-all duration-200 ease-out " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-midnight " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const variants: Record<Variant, string> = {
  primary: "bg-midnight text-cream hover:bg-midnight/90",
  outline:
    "border border-midnight bg-transparent text-midnight hover:bg-midnight hover:text-cream",
  ghost: "text-midnight hover:bg-cream-2",
  soft: "bg-cream-2 text-midnight border border-border hover:bg-cream-3",
  accent: "bg-terracotta text-terracotta-foreground hover:bg-terracotta/90",
  link: "text-terracotta underline underline-offset-4 hover:text-terracotta/80",
};

const sizes: Record<Size, string> = {
  xs: "h-8 px-3 text-xs rounded-full",
  sm: "h-9 px-4 text-sm rounded-full",
  md: "h-11 px-5 text-sm font-medium rounded-full",
  lg: "h-12 px-6 text-base font-medium rounded-full",
  icon: "h-10 w-10 rounded-full",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    // `shape` est accepté pour compat V1 mais volontairement ignoré — V2
    // n'a qu'une seule forme : rounded-full.
    { className, variant = "primary", size = "md", type = "button", shape: _shape, ...props },
    ref,
  ) => {
    const isLink = variant === "link";
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          base,
          variants[variant],
          isLink ? "h-auto p-0 rounded-none" : sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
