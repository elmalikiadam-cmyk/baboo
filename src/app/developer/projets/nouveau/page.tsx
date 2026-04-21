import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { ProjectForm } from "@/components/developer/project-form";

export const metadata: Metadata = { title: "Nouveau projet · Baboo Promoteur" };
export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/developer/projets/nouveau");
  if (!session.user.developerId) redirect("/developer/dashboard");

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/developer/dashboard" className="hover:text-foreground">Tableau de bord</Link>
        <span className="mx-2">·</span>
        <Link href="/developer/projets" className="hover:text-foreground">Projets</Link>
        <span className="mx-2">·</span>
        <span>Nouveau</span>
      </nav>

      <div className="border-b border-foreground/15 pb-6">
        <p className="eyebrow">Création</p>
        <h1 className="display-xl mt-2 text-4xl md:text-5xl">Nouveau projet.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Renseignez les informations du programme. Vous pourrez ajouter les lots (appartements,
          duplex, etc.) juste après.
        </p>
      </div>

      <div className="mt-10 max-w-3xl">
        <ProjectForm />
      </div>
    </div>
  );
}
