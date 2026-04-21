import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="display-xl mt-3">
        Cette page s'est <span className="italic">échappée.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-ink-soft">
        L'adresse n'existe pas, ou le bien a été retiré. Vous pouvez revenir à l'accueil,
        ou repartir de la recherche.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button size="lg">Retour à l'accueil</Button>
        </Link>
        <Link href="/recherche">
          <Button variant="outline" size="lg">
            Voir les annonces
          </Button>
        </Link>
      </div>
    </div>
  );
}
