import Link from "next/link";
import { Home, ArrowRight } from "@/components/ui/icons";

/**
 * Banner "Vous avez un bien ?" — fond olive soft, icône carrée olive.
 * Utilisé sur l'accueil, en fin de section listings.
 */
export function PublishBanner() {
  return (
    <Link
      href="/pro"
      className="mt-8 flex items-center gap-4 rounded-2xl border border-success/30 bg-success-soft p-5 transition-colors hover:border-success/50"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-success text-ink-foreground">
        <Home size={20} strokeWidth={1.8} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="display-md block text-[16px]">Vous avez un bien ?</span>
        <span className="mt-1 block text-xs text-ink-soft">
          Publiez gratuitement en 3 minutes.
        </span>
      </span>
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-ink-foreground"
        aria-hidden
      >
        <ArrowRight size={14} strokeWidth={1.8} />
      </span>
    </Link>
  );
}
