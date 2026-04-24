import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Partenaires Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function PartnersLandingPage() {
  const session = await auth();
  if (!hasDb()) return null;

  // Si l'utilisateur est déjà partenaire → inbox
  if (session?.user?.email) {
    const existing = await db.partnerAgency.findUnique({
      where: { contactEmail: session.user.email.toLowerCase() },
      select: { id: true },
    });
    if (existing) redirect("/partners/inbox");
  }

  return (
    <div className="container max-w-3xl py-16">
      <p className="eyebrow">Baboo Partners</p>
      <h1 className="display-xl mt-3 text-3xl md:text-5xl">
        Leads qualifiés, payés à l'unité.
      </h1>
      <p className="mt-4 text-sm text-muted-foreground md:text-base">
        Chaque jour, des particuliers déposent une recherche détaillée
        sur Baboo. Quand votre ville est couverte et que nous n'avons
        pas d'annonce directement disponible, nous ouvrons le lead aux
        agences partenaires. Vous payez uniquement ce que vous
        débloquez — 500 MAD par lead qualifié, pas d'abonnement.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Card
          title="Ce que vous recevez"
          points={[
            "Coordonnées complètes (téléphone vérifié)",
            "Critères détaillés : budget, surface, délai",
            "Consentement explicite pour être contacté",
            "Moyenne de 12 demandes/semaine à Casablanca",
          ]}
        />
        <Card
          title="Comment ça marche"
          points={[
            "Nous créons votre compte (contact + villes couvertes)",
            "Vous créditez votre solde (virement ou CB)",
            "Vous débloquez les demandes qui vous intéressent",
            "Vous contactez le particulier directement",
          ]}
        />
      </div>

      <div className="mt-10 rounded-2xl border border-midnight/10 bg-cream p-6 text-center">
        <p className="text-sm text-midnight">
          Envoyez-nous un email à{" "}
          <a
            href="mailto:partners@baboo.ma"
            className="font-semibold text-terracotta hover:underline"
          >
            partners@baboo.ma
          </a>{" "}
          avec le nom de votre agence et les villes couvertes. Vous
          recevrez un lien d'activation sous 24 h.
        </p>
        {!session?.user && (
          <p className="mono mt-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Déjà partenaire ?{" "}
            <Link
              href="/connexion?callbackUrl=/partners/inbox"
              className="text-terracotta hover:underline"
            >
              Se connecter
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function Card({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="rounded-2xl border border-midnight/10 bg-cream p-6">
      <h3 className="display-md text-lg">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
