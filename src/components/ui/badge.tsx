import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "accent" | "success" | "primary" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  neutral: "bg-foreground/[0.06] text-foreground",
  accent: "bg-accent/15 text-accent-foreground ring-1 ring-inset ring-accent/30",
  success: "bg-success/10 text-success ring-1 ring-inset ring-success/20",
  primary: "bg-primary text-primary-foreground",
  outline: "border border-border bg-surface text-foreground",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
