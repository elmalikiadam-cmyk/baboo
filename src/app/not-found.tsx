import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="display-xl mt-3 text-4xl md:text-5xl">Cette adresse n'existe pas.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        L'annonce a peut-être été retirée, ou l'URL est incorrecte.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/"><Button>Retour à l'accueil</Button></Link>
        <Link href="/recherche"><Button variant="outline">Voir les annonces</Button></Link>
      </div>
    </div>
  );
}
