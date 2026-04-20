import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "soft" | "link";
type Size = "xs" | "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors duration-150 ease-out-soft disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full";

const variants: Record<Variant, string> = {
  primary: "bg-foreground text-background hover:bg-foreground/90",
  outline: "border border-foreground/80 bg-transparent text-foreground hover:bg-foreground hover:text-background",
  ghost: "text-foreground hover:bg-foreground/5",
  soft: "bg-foreground/[0.08] text-foreground hover:bg-foreground/[0.14]",
  link: "text-foreground underline-offset-4 hover:underline rounded",
};

const sizes: Record<Size, string> = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  ),
);
Button.displayName = "Button";
