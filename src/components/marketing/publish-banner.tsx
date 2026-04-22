import Link from "next/link";
import { HomeIcon, ArrowRightIcon } from "@/components/ui/icons";

/**
 * Banner "Vous avez un bien ?" — fond olive soft, icône carrée olive,
 * flèche ink dans un cercle. V2 "Maison ouverte".
 */
export function PublishBanner() {
  return (
    <Link
      href="/pro/publier"
      className="mt-8 flex items-center gap-4 rounded-2xl border border-success/30 bg-success-soft p-5 transition-colors hover:border-success/50"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-success text-ink-foreground">
        <HomeIcon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="display-md block text-[16px] text-ink">Vous avez un bien ?</span>
        <span className="mt-1 block text-xs text-ink-soft">
          Publiez gratuitement en 3 minutes.
        </span>
      </span>
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-ink-foreground"
        aria-hidden
      >
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
