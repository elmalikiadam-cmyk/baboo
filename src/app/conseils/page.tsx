import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conseils — Baboo",
  description:
    "Guides et conseils pour acheter, vendre et louer un bien au Maroc.",
};

/**
 * Stub minimal — section conseils/éditorial à construire.
 * Existe pour que le lien "Conseils" du header ne renvoie pas un 404.
 */
export default function ConseilsPage() {
  return (
    <div className="container py-20 md:py-28">
      <p className="eyebrow">Conseils</p>
      <h1 className="display-xl mt-3">Bientôt disponible.</h1>
      <p className="mt-5 max-w-xl text-lg text-muted-foreground">
        Nous préparons des guides pratiques pour acheter, louer et vendre
        au Maroc : estimer un bien, préparer un dossier solide, comprendre
        les démarches notariales. Revenez nous voir dans quelques semaines.
      </p>
    </div>
  );
}
