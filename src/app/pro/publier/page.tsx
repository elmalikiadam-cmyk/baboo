import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PublishForm } from "@/components/pro/publish-form";
import { CheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Déposer une annonce" };
export const dynamic = "force-dynamic";

const BENEFITS = [
  "Publication gratuite pour les particuliers",
  "Réponse de notre équipe sous 24 h",
  "Modération des photos et du prix",
  "Mise en avant sur les pages de ville concernées",
];

export default async function PublishPage() {
  const session = await auth();
  // Une agence connectée accède directement à son vrai form de création.
  if (session?.user?.role === "AGENCY" && session.user.agencyId) {
    redirect("/pro/listings/new");
  }
  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <Link href="/" className="hover:text-midnight">Accueil</Link>
        <span className="mx-2">·</span>
        <span>Publier une annonce</span>
      </nav>

      <div className="border-b border-border pb-6">
        <p className="eyebrow">Déposer une annonce</p>
        <h1 className="display-xl mt-2 text-4xl md:text-6xl">Parlez-nous de votre bien.</h1>
        <p className="mt-3 max-w-xl text-muted">
          Pendant la phase de lancement, la publication se fait avec l'équipe Baboo. Remplissez le formulaire ci-dessous — on vous rappelle pour prendre les photos et finaliser votre annonce.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <PublishForm />

        <aside className="space-y-6">
          <div className="rounded-md border border-border bg-cream p-6">
            <p className="eyebrow">Ce qu'on fait pour vous</p>
            <h3 className="display-lg mt-2 text-xl">Publication accompagnée.</h3>
            <ul className="mt-5 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-midnight text-cream">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-midnight">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md bg-midnight p-6 text-cream">
            <p className="eyebrow text-cream/60">Agences & promoteurs</p>
            <h3 className="display-lg mt-2 text-xl">Baboo Pro.</h3>
            <p className="mt-2 text-sm text-cream/75">
              Vous avez plusieurs biens à publier ? L'espace Pro vous permet de tout gérer depuis un tableau de bord.
            </p>
            <Link
              href="/pro"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 mono text-[11px] uppercase tracking-[0.12em] text-midnight"
            >
              Découvrir Baboo Pro →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
