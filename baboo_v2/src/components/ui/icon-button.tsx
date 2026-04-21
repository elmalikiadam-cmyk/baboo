import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "soft" | "floating" | "dark";
type Size = "sm" | "md" | "lg";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  soft: "bg-surface-warm border border-border text-ink hover:bg-surface-cool",
  floating:
    "bg-white/95 text-ink backdrop-blur-sm border-0 hover:bg-white shadow-sm",
  dark: "bg-ink text-ink-foreground hover:bg-ink/90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "soft", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
IconButton.displayName = "IconButton";
