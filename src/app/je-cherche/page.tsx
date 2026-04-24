import type { Metadata } from "next";
import { SearchRequestWizard } from "@/components/marketing/search-request-wizard";

export const metadata: Metadata = {
  title: "Dites-nous ce que vous cherchez — Baboo",
  description:
    "Décrivez votre recherche idéale, nous vous trouvons les annonces qui correspondent parmi des milliers de biens au Maroc.",
};

/**
 * /je-cherche — entry point lead routing Phase 3.5.
 * Ton Strate 1 (accueillant, utile, pas intrusif).
 */
export default function JeChercheLanding() {
  return (
    <div className="container py-10 md:py-16">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <p className="eyebrow">Votre recherche personnalisée</p>
        <h1 className="display-xl mt-3 text-3xl md:text-5xl">
          Dites-nous ce que vous{" "}
          <span className="text-terracotta">cherchez</span>.
        </h1>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          Nous vous trouvons le bon bien. Si nous n'avons pas encore
          d'annonce qui correspond, nous vous préviendrons dès qu'elle
          arrive.
        </p>
      </header>

      <div className="mx-auto max-w-2xl">
        <SearchRequestWizard />
      </div>
    </div>
  );
}
