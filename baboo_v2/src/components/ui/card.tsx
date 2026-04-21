import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "light" | "warm" | "dark" | "outlined";

const variants: Record<Variant, string> = {
  light: "bg-surface border border-border text-ink",
  warm: "bg-surface-warm border border-border-soft text-ink",
  dark: "bg-ink text-ink-foreground border-0",
  outlined: "bg-transparent border border-border text-ink",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "light", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-2xl", variants[variant], className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 md:p-6", className)} {...props} />
  ),
);
CardBody.displayName = "CardBody";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 md:p-6 pb-0", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-5 md:p-6 pt-0 flex items-center gap-3", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";
