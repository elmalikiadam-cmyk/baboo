import Link from "next/link";
import { cn } from "@/lib/cn";

interface Props {
  variant: "particuliers" | "pros";
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
}

/**
 * V3 — bloc éditorial grand format.
 * Particuliers : fond terracotta. Pros : fond forest. Toujours texte cream,
 * rounded-3xl, ornement étoile décoratif en haut à droite, divider pointillé
 * signature, CTA pill cream avec texte midnight.
 */
export function DualBlock({ variant, eyebrow, title, body, cta }: Props) {
  const bg = variant === "particuliers" ? "bg-terracotta" : "bg-forest";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-8 text-cream md:p-10",
        bg,
      )}
    >
      {/* Ornement étoile discret top-right */}
      <svg
        aria-hidden
        className="absolute right-6 top-6 opacity-30"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M16 0v32M0 16h32M5 5l22 22M27 5L5 27"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>

      <p className="mono text-[11px] uppercase tracking-[0.14em] opacity-80">
        {eyebrow}
      </p>
      <h3 className="display-lg mt-3 text-cream">{title}</h3>

      <div className="my-5 max-w-[200px] border-t border-dashed border-cream/40" />

      <p className="max-w-md leading-relaxed text-cream/90">{body}</p>

      <Link
        href={cta.href}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 font-medium text-midnight transition-colors hover:bg-white"
      >
        {cta.label}
      </Link>
    </div>
  );
}
