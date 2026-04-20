import * as React from "react";
import { cn } from "@/lib/cn";

type CardVariant = "light" | "dark" | "soft";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variants: Record<CardVariant, string> = {
  light: "bg-surface border border-foreground/15 text-foreground",
  soft: "bg-surface-muted border border-foreground/10 text-foreground",
  dark: "bg-ink text-ink-foreground",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "light", ...props }, ref) => (
    <div ref={ref} className={cn("rounded-3xl", variants[variant], className)} {...props} />
  ),
);
Card.displayName = "Card";

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-7 md:p-9", className)} {...props} />,
);
CardBody.displayName = "CardBody";
