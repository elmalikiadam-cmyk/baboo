import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "dark" | "light" | "success";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  neutral: "bg-foreground/[0.08] text-foreground",
  dark: "bg-foreground text-background",
  light: "border border-foreground/20 bg-background text-foreground",
  success: "bg-success/10 text-success",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
