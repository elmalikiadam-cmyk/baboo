import * as React from "react";
import { cn } from "@/lib/cn";

type CardVariant = "light" | "warm" | "dark" | "outlined" | "soft";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variants: Record<CardVariant, string> = {
  light: "bg-cream border border-border text-midnight",
  warm: "bg-cream-2 border border-cream-2 text-midnight",
  soft: "bg-cream-2 border border-cream-2 text-midnight",
  dark: "bg-midnight text-cream border-0",
  outlined: "bg-transparent border border-border text-midnight",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "light", ...props }, ref) => (
    <div ref={ref} className={cn("rounded-2xl", variants[variant], className)} {...props} />
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
