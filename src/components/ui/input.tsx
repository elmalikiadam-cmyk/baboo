import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-12 w-full rounded-full border border-foreground/12 bg-white/80 px-4 text-sm text-foreground placeholder:text-muted-foreground/70 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.6)]",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:border-foreground/60 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-foreground/8",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground", className)}
      {...props}
    />
  ),
);
Label.displayName = "Label";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-12 w-full appearance-none rounded-full border border-foreground/12 bg-white/80 pl-4 pr-10 text-sm text-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.6)]",
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path fill=%22none%22 stroke=%22%230F0F0F%22 stroke-width=%221.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M3 4.5l3 3 3-3%22/></svg>')] bg-no-repeat bg-[right_14px_center]",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:border-foreground/60 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-foreground/8",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
