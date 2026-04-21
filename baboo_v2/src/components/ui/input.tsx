import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-12 w-full rounded-full border border-border bg-surface px-5",
        "text-sm text-ink placeholder:text-ink-muted",
        "transition-colors duration-200 ease-out",
        "focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[96px] w-full rounded-2xl border border-border bg-surface p-4",
      "text-sm text-ink placeholder:text-ink-muted",
      "transition-colors duration-200 ease-out",
      "focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/10",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-full border border-border bg-surface px-5 pr-9",
        "text-sm text-ink",
        "transition-colors duration-200 ease-out",
        "focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/10",
        "appearance-none bg-no-repeat bg-[right_1rem_center]",
        "bg-[length:12px_auto]",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%231A1815' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
