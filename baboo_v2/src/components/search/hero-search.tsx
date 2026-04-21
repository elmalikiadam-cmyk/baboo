"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "@/components/ui/icons";
import { PillToggle } from "@/components/ui/pill-toggle";
import { buildSearchHref, type SearchFilters } from "@/lib/search-params";

/**
 * Hero de l'accueil. Greeting avec italique sur la question, input rond
 * bordure 1.5px ink + bouton filtres terminal, puis toggle Acheter/Louer.
 */
export function HeroSearch({ firstName }: { firstName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [transaction, setTransaction] = useState<SearchFilters["transaction"]>("SALE");
  const [keyword, setKeyword] = useState("");

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const href = buildSearchHref({
      transaction,
      keyword: keyword.trim() || undefined,
      page: 1,
    });
    startTransition(() => router.push(href));
  }

  return (
    <section className="pt-6 pb-6 md:pt-10">
      <h1 className="display-xl">
        Bonjour {firstName}.<br />
        <span className="italic text-ink-soft">Où cherchez-vous ?</span>
      </h1>

      <form onSubmit={submit} className="mt-6" role="search">
        <div
          className="flex h-[52px] items-center gap-2 rounded-full border-[1.5px] border-ink bg-background pl-5 pr-1.5"
          aria-label="Recherche d'annonces"
        >
          <Search size={18} strokeWidth={1.8} className="shrink-0 text-ink" aria-hidden />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Ville, quartier, type de bien…"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
            aria-label="Rechercher"
          />
          <button
            type="submit"
            aria-label="Affiner les filtres"
            disabled={isPending}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-ink-foreground transition-opacity hover:bg-ink/90 disabled:opacity-50"
          >
            <SlidersHorizontal size={15} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </form>

      <div className="mt-4">
        <PillToggle
          ariaLabel="Type de transaction"
          value={transaction}
          onChange={setTransaction}
          options={[
            { value: "SALE", label: "Acheter" },
            { value: "RENT", label: "Louer" },
          ]}
        />
      </div>
    </section>
  );
}
