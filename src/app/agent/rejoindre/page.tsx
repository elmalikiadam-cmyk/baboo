import type { Metadata } from "next";
import Link from "next/link";
import { CITIES } from "@/data/cities";
import { AgentApplicationForm } from "@/components/agent/application-form";

export const metadata: Metadata = {
  title: "Rejoindre l'équipe agents Baboo",
  description:
    "Devenez agent de visite Baboo : missions ponctuelles, rémunération claire, formation incluse. Postuler en ligne.",
  alternates: { canonical: "/agent/rejoindre" },
};

export default function AgentJoinPage() {
  return (
    <div className="container max-w-3xl py-10 md:py-16">
      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Rejoindre Baboo</p>
        <h1 className="display-hero mt-3 text-midnight">
          Devenir agent <span className="text-terracotta">Baboo</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
          Vous accompagnez les visites de biens en location ou en vente
          pour le compte des bailleurs Baboo. Mission par mission,
          rémunération claire, formation Baboo incluse.
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card
          title="Comment ça marche"
          body="Vous recevez les missions par notification + WhatsApp. Vous confirmez ou déclinez. Vous accompagnez la visite, remplissez un rapport structuré."
        />
        <Card
          title="Rémunération"
          body="Forfait par visite réalisée. Bonus rapport remis dans l'heure. Paiement mensuel, virement bancaire."
        />
        <Card
          title="Profil idéal"
          body="Travailleur indépendant ou agent commercial avec connaissance terrain. Bonne aisance relationnelle, ponctualité, neutralité dans les rapports."
        />
      </section>

      <div className="mt-10">
        <AgentApplicationForm
          cities={CITIES.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </div>

      <p className="mono mt-6 text-center text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/agents" className="hover:text-terracotta">
          ← Voir notre équipe actuelle
        </Link>
      </p>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-midnight/10 bg-cream p-5">
      <h2 className="display-md text-base">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
