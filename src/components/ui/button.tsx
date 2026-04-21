import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "soft" | "glass" | "link";
type Size = "xs" | "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-all duration-200 ease-out-soft disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-foreground text-background shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08),0_1px_2px_rgb(0_0_0/0.15),0_4px_12px_-2px_rgb(0_0_0/0.18)] hover:bg-foreground/90 hover:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.12),0_2px_4px_rgb(0_0_0/0.15),0_10px_20px_-4px_rgb(0_0_0/0.2)] hover:-translate-y-px",
  outline:
    "border border-foreground/20 bg-background/60 backdrop-blur text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
  ghost: "text-foreground hover:bg-foreground/5",
  soft: "bg-foreground/[0.06] text-foreground border border-foreground/[0.08] hover:bg-foreground/[0.12] hover:border-foreground/[0.16]",
  glass: "glass text-foreground hover:bg-white/80",
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
