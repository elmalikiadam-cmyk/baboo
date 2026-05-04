import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Baboo pour les promoteurs — commercialisation immobilière au Maroc",
  description:
    "Un forfait mensuel prévisible, des visites qualifiées par nos agents, un reporting hebdomadaire. La plateforme qui commercialise vos projets avec clarté.",
};

/**
 * Landing B2B promoteurs — Strate 3 (professionnel, structuré,
 * ROI-oriented). Le comparatif factuel avec un portail classique est
 * acceptable ici car on s'adresse directement à des décideurs
 * commerciaux. Pas de claim anti-agence, uniquement des critères
 * business observables.
 */
export default function PromotersLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="container pb-16 pt-12 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow inline-block border-b border-midnight/20 pb-1">
            Baboo pour les promoteurs
          </p>
          <h1 className="display-hero mt-6 text-midnight">
            La plateforme qui commercialise vos projets avec{" "}
            <span className="text-terracotta">clarté</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Un forfait mensuel prévisible, des visites qualifiées par nos
            agents, un reporting hebdomadaire.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/promoteurs/contact"
              className="inline-flex h-12 items-center rounded-full bg-terracotta px-6 text-sm font-semibold text-cream hover:bg-terracotta-2"
            >
              Prendre rendez-vous →
            </Link>
            <a
              href="#formules"
              className="inline-flex h-12 items-center rounded-full border-2 border-midnight px-6 text-sm font-semibold text-midnight hover:bg-midnight hover:text-cream"
            >
              Voir les formules
            </a>
          </div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="container py-14 md:py-20">
        <div className="mb-10 text-center">
          <p className="eyebrow">Pourquoi Baboo pour votre projet</p>
          <h2 className="display-lg mt-3 text-3xl md:text-4xl">
            Quatre bénéfices mesurables.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Benefit
            n="01"
            title="Forfait mensuel prévisible"
            body="Votre budget commercialisation est connu à l'avance, sans variation saisonnière ni surprise de facturation."
          />
          <Benefit
            n="02"
            title="Visites qualifiées"
            body="Nos agents reçoivent et filtrent les acheteurs avant de vous les envoyer. Vous ne rencontrez que les profils sérieux."
          />
          <Benefit
            n="03"
            title="Reporting hebdomadaire"
            body="Visibilité en temps réel sur la performance de votre commercialisation : visites, leads, taux de conversion."
          />
          <Benefit
            n="04"
            title="Accompagnement dédié"
            body="Un interlocuteur unique pour votre projet, joignable du lundi au samedi."
          />
        </div>
      </section>

      {/* Formules */}
      <section id="formules" className="container py-14 md:py-20">
        <div className="mb-10 text-center">
          <p className="eyebrow">Nos formules</p>
          <h2 className="display-lg mt-3 text-3xl md:text-4xl">
            Trois <span className="text-terracotta">options</span>, selon votre stade commercial.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Formula
            name="Découverte"
            price="25 000 MAD"
            suffix="par mois"
            highlights={[
              "1 projet mis en ligne",
              "5 visites managées / mois",
              "Reporting hebdomadaire",
              "Interlocuteur dédié",
            ]}
          />
          <Formula
            name="Croissance"
            price="60 000 MAD"
            suffix="par mois"
            highlights={[
              "Jusqu'à 3 projets actifs",
              "20 visites managées / mois",
              "Reporting hebdomadaire + PDF",
              "Mise en avant homepage",
              "Budget co-marketing inclus",
            ]}
            featured
          />
          <Formula
            name="Sur-mesure"
            price="À discuter"
            suffix=""
            highlights={[
              "Multi-projets (4+)",
              "Budget co-marketing étendu",
              "SLA garantis",
              "Reporting custom",
            ]}
          />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Tous les prix HT · Activation sous 5 jours ouvrés · Aucun engagement sur Découverte
        </p>
      </section>

      {/* Comparatif factuel */}
      <section className="container py-14 md:py-20">
        <div className="mb-10 text-center">
          <p className="eyebrow">Comparatif</p>
          <h2 className="display-lg mt-3 text-3xl md:text-4xl">
            Baboo versus portail classique.
          </h2>
        </div>

        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-midnight/10">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-cream-2 text-midnight">
              <tr>
                <th className="p-4 mono text-[10px] uppercase tracking-[0.14em]">
                  Critère
                </th>
                <th className="p-4 mono text-[10px] uppercase tracking-[0.14em]">
                  Portail classique
                </th>
                <th className="p-4 mono text-[10px] uppercase tracking-[0.14em] text-terracotta">
                  Baboo
                </th>
              </tr>
            </thead>
            <tbody className="bg-cream">
              <ComparisonRow
                criterion="Tarification"
                traditional="Variable selon saison"
                baboo="Forfait fixe"
              />
              <ComparisonRow
                criterion="Visites qualifiées"
                traditional="À votre charge"
                baboo="Incluses"
              />
              <ComparisonRow
                criterion="Reporting"
                traditional="Ponctuel, payant"
                baboo="Hebdomadaire, inclus"
              />
              <ComparisonRow
                criterion="Accompagnement"
                traditional="Équipe partagée"
                baboo="Interlocuteur dédié"
                last
              />
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ B2B */}
      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="eyebrow">Questions fréquentes</p>
            <h2 className="display-lg mt-3 text-3xl md:text-4xl">
              Ce que les promoteurs nous demandent.
            </h2>
          </div>
          <dl className="divide-y divide-midnight/10 rounded-2xl border border-midnight/10 bg-cream">
            <FaqItem
              q="Comment définissez-vous une visite qualifiée ?"
              a="Un acheteur qui a confirmé son intérêt, passé l'entretien de pré-qualification avec notre agent (capacité d'achat, calendrier, motivation) et reçu les éléments clés du projet. Nous transmettons ensuite son dossier à votre commercial."
            />
            <FaqItem
              q="Puis-je passer d'un pack à l'autre ?"
              a="Oui. Le passage de Découverte à Croissance peut se faire à tout moment. Le passage de Croissance à Sur-mesure est étudié au cas par cas avec notre équipe."
            />
            <FaqItem
              q="Que contient exactement le reporting hebdomadaire ?"
              a="Nombre de visites demandées/réalisées, taux de no-show, nombre de leads générés et qualifiés, top-10 visiteurs de la semaine avec leurs profils, recommandations de l'équipe."
            />
            <FaqItem
              q="Quels sont les délais d'activation ?"
              a="5 jours ouvrés à partir de la signature : mise en ligne de votre fiche projet, formation des agents dédiés, ouverture du dashboard de reporting."
            />
          </dl>
        </div>
      </section>

      {/* CTA final */}
      <section className="container py-14 md:py-20">
        <div className="rounded-2xl bg-midnight p-8 text-cream md:p-12">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="display-lg text-2xl text-cream md:text-3xl">
                Parlons de votre projet.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-cream/85 md:text-base">
                Laissez-nous vos coordonnées, nous revenons vers vous sous 48 h ouvrées.
              </p>
            </div>
            <Link
              href="/promoteurs/contact"
              className="inline-flex h-12 shrink-0 items-center rounded-full bg-terracotta px-6 text-sm font-semibold text-cream hover:bg-terracotta-2"
            >
              Prendre rendez-vous →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Benefit({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-midnight/10 bg-cream p-6">
      <span className="mono text-[10px] uppercase tracking-[0.14em] text-terracotta">
        {n}
      </span>
      <h3 className="display-md mt-3 text-lg text-midnight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

function Formula({
  name,
  price,
  suffix,
  highlights,
  featured = false,
}: {
  name: string;
  price: string;
  suffix: string;
  highlights: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-6 md:p-7 ${
        featured
          ? "border-terracotta bg-terracotta/5"
          : "border-midnight/10 bg-cream"
      }`}
    >
      {featured && (
        <span className="mono mb-2 inline-block self-start rounded-full bg-terracotta px-2.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-cream">
          Recommandée
        </span>
      )}
      <h3 className="display-lg text-xl text-midnight">{name}</h3>
      <div className="mt-4">
        <span className="display-xl text-3xl text-terracotta">{price}</span>
        {suffix && (
          <span className="ml-2 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      <ul className="mt-6 flex-1 space-y-2 text-sm text-midnight">
        {highlights.map((h) => (
          <li key={h} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
            <span>{h}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/promoteurs/contact"
        className={`mt-6 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${
          featured
            ? "bg-terracotta text-cream hover:bg-terracotta-2"
            : "border-2 border-midnight text-midnight hover:bg-midnight hover:text-cream"
        }`}
      >
        En savoir plus →
      </Link>
    </div>
  );
}

function ComparisonRow({
  criterion,
  traditional,
  baboo,
  last = false,
}: {
  criterion: string;
  traditional: string;
  baboo: string;
  last?: boolean;
}) {
  return (
    <tr className={last ? "" : "border-b border-midnight/10"}>
      <td className="p-4 text-sm font-medium text-midnight">{criterion}</td>
      <td className="p-4 text-sm text-muted-foreground">{traditional}</td>
      <td className="p-4 text-sm font-semibold text-terracotta">{baboo}</td>
    </tr>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="px-5 py-5 md:px-6 md:py-6">
      <dt className="display-md text-base text-midnight md:text-lg">{q}</dt>
      <dd className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
        {a}
      </dd>
    </div>
  );
}
