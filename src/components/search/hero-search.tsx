"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, SlidersIcon } from "@/components/ui/icons";
import { PillToggle } from "@/components/ui/pill-toggle";
import { buildSearchHref, type SearchFilters } from "@/lib/search-params";

interface Props {
  /** Si fourni, affiche "Bonjour {prénom}." au-dessus de la question. */
  firstName?: string;
}

/**
 * Hero de l'accueil V2. Greeting italique sur la question, barre de recherche
 * ronde bordée ink, toggle Acheter / Louer en dessous.
 */
export function HeroSearch({ firstName }: Props) {
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
        {firstName ? (
          <>
            Bonjour {firstName}.<br />
            <span className="italic text-muted-foreground">Où cherchez-vous ?</span>
          </>
        ) : (
          <>
            Trouvez <span className="italic text-muted-foreground">votre chez-vous.</span>
          </>
        )}
      </h1>

      <form onSubmit={submit} className="mt-6" role="search">
        <div
          className="flex h-[52px] items-center gap-2 rounded-full border-[1.5px] border-midnight bg-cream pl-5 pr-1.5"
          aria-label="Recherche d'annonces"
        >
          <SearchIcon className="h-4 w-4 shrink-0 text-midnight" aria-hidden />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Ville, quartier, type de bien…"
            className="flex-1 bg-transparent text-sm text-midnight outline-none placeholder:text-muted"
            aria-label="Rechercher"
          />
          <button
            type="submit"
            aria-label="Rechercher"
            disabled={isPending}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-midnight text-cream transition-opacity hover:bg-midnight/90 disabled:opacity-50"
          >
            <SlidersIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </form>

      <div className="mt-4 max-w-md">
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
