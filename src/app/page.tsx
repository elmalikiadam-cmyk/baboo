import Link from "next/link";
import type { Metadata } from "next";
import { ListingCard } from "@/components/listing/listing-card";
import { HeroSearchBlock } from "@/components/search/hero-search-block";
import { CostCalculator } from "@/components/marketing/cost-calculator";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { getLatestListings } from "@/lib/listings-query";

export const metadata: Metadata = {
  title: "Baboo — L'immobilier, simplement.",
  description:
    "Publiez votre bien, organisez les visites, signez. Chaque service à son juste prix.",
};

export const revalidate = 3600;

/**
 * Home V4 — repositionnement « L'immobilier, simplement. »
 *
 * Structure Strate 1 (ton posé, pas de claim agressif) :
 *   1. Hero : tagline + sous-titre + 2 CTAs
 *   2. Calculateur interactif factuel
 *   3. Quatre services, quatre prix clairs
 *   4. Comment ça marche (4 étapes)
 *   5. Sélection de la semaine (annonces)
 *   6. Encart promoteurs
 *   7. FAQ
 */
export default async function HomePage() {
  const latest = await getLatestListings(6);

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="container pb-14 pt-12 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow inline-block border-b border-midnight/20 pb-1">
            L'immobilier au Maroc
          </p>
          <h1 className="display-hero mt-6 text-midnight">
            L'immobilier,{" "}
            <span className="text-terracotta">simplement</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Publiez votre bien, organisez les visites, signez. Chaque service
            à son juste prix.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/publier"
              className="inline-flex h-12 items-center rounded-full bg-terracotta px-6 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-2"
            >
              Publier mon bien →
            </Link>
            <Link
              href="/recherche"
              className="inline-flex h-12 items-center rounded-full border-2 border-midnight px-6 text-sm font-semibold text-midnight transition-colors hover:bg-midnight hover:text-cream"
            >
              Je cherche un bien
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <HeroSearchBlock />
        </div>
      </section>

      {/* ─── Calculateur ─── */}
      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <p className="eyebrow">Calcul transparent</p>
            <h2 className="display-lg mt-3 text-3xl md:text-4xl">
              Combien coûte votre transaction&nbsp;?
            </h2>
            <p className="mt-4 text-sm text-muted-foreground md:text-base">
              Avec Baboo, vous ne payez que les services dont vous avez
              besoin. Faites le calcul.
            </p>
          </div>
          <CostCalculator />
        </div>
      </section>

      {/* ─── Quatre services ─── */}
      <section className="container py-14 md:py-20">
        <div className="mb-10 text-center md:mb-14">
          <p className="eyebrow">À la carte</p>
          <h2 className="display-lg mt-3 text-3xl md:text-4xl">
            Quatre <span className="text-terracotta">services</span>, quatre prix clairs.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ServiceCard
            step="01"
            title="Publier"
            price="Gratuit"
            priceSubline="Options premium à partir de 29 MAD"
            body="Votre annonce en ligne en 5 minutes. Photos, description, prix. Visible par tous les candidats du Maroc."
          />
          <ServiceCard
            step="02"
            title="Faire visiter"
            price="À partir de 1 200 MAD"
            priceSubline="Pack 10 visites — nos agents organisent"
            body="Nos agents formés reçoivent les candidats, filtrent les profils et vous transmettent un rapport détaillé avec leur recommandation."
          />
          <ServiceCard
            step="03"
            title="Filtrer les candidats"
            price="Inclus"
            priceSubline="Dans tous nos packs visites"
            body="Score automatique de solvabilité, vérification des pièces d'emploi, comparateur côte-à-côte. Vous décidez en connaissance de cause."
          />
          <ServiceCard
            step="04"
            title="Rédiger le bail"
            price="Gratuit"
            priceSubline="Conforme loi 67-12"
            body="Génération du contrat en PDF, personnalisable, signature électronique en option. Quittances automatiques chaque mois."
          />
        </div>
      </section>

      {/* ─── Comment ça marche ─── */}
      <section className="container py-14 md:py-20">
        <div className="mb-10 text-center md:mb-14">
          <p className="eyebrow">Le parcours bailleur</p>
          <h2 className="display-lg mt-3 text-3xl md:text-4xl">
            Comment ça marche.
          </h2>
        </div>

        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Step
            n="01"
            title="Publiez"
            body="Décrivez votre bien, ajoutez vos photos, fixez votre prix. 5 minutes, gratuit."
          />
          <Step
            n="02"
            title="Recevez"
            body="Les candidats postulent avec leur dossier — emploi, revenus, garant si besoin."
          />
          <Step
            n="03"
            title="Faites visiter"
            body="Vous accompagnez, ou nos agents le font pour vous — à votre choix."
          />
          <Step
            n="04"
            title="Signez"
            body="Bail généré en un clic, conforme, signable électroniquement."
          />
        </ol>
      </section>

      {/* ─── Sélection de la semaine ─── */}
      {latest.length > 0 && (
        <section className="container py-14 md:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Trié par l'équipe Baboo</p>
              <h2 className="display-lg mt-3 text-3xl md:text-4xl">
                Sélection de la semaine.
              </h2>
            </div>
            <Link
              href="/recherche"
              className="mono text-[10px] uppercase tracking-[0.14em] text-midnight hover:text-terracotta"
            >
              Voir toutes les annonces →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.slice(0, 6).map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i < 3} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Encart promoteurs ─── */}
      <section className="container py-14 md:py-20">
        <div className="rounded-2xl border border-midnight/10 bg-forest p-8 text-cream md:p-12">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.14em] text-cream/75">
                Pour les promoteurs
              </p>
              <h2 className="display-lg mt-3 text-2xl text-cream md:text-3xl">
                Vous commercialisez un projet immobilier ?
              </h2>
              <p className="mt-3 max-w-xl text-sm text-cream/85 md:text-base">
                Baboo propose une offre dédiée aux promoteurs : forfait
                mensuel prévisible, visites qualifiées par nos agents,
                reporting hebdomadaire.
              </p>
            </div>
            <Link
              href="/promoteurs"
              className="inline-flex h-12 shrink-0 items-center rounded-full bg-cream px-6 text-sm font-semibold text-forest transition-colors hover:bg-cream/90"
            >
              Découvrir l'offre →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="eyebrow">Questions fréquentes</p>
            <h2 className="display-lg mt-3 text-3xl md:text-4xl">
              Ce que vous voulez savoir.
            </h2>
          </div>
          <FaqAccordion items={FAQ} />
        </div>
      </section>
    </>
  );
}

function ServiceCard({
  step,
  title,
  price,
  priceSubline,
  body,
}: {
  step: string;
  title: string;
  price: string;
  priceSubline: string;
  body: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-midnight/10 bg-cream p-6 md:p-7">
      <div className="flex items-baseline gap-3">
        <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {step}
        </span>
        <h3 className="display-lg text-xl text-midnight">{title}</h3>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-midnight">{body}</p>
      <div className="mt-auto border-t border-midnight/10 pt-4">
        <p className="display-md text-lg text-terracotta">{price}</p>
        <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {priceSubline}
        </p>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-2xl border border-midnight/10 bg-cream p-6">
      <span className="mono text-[10px] uppercase tracking-[0.14em] text-terracotta">
        {n}
      </span>
      <h3 className="display-md mt-3 text-lg text-midnight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </li>
  );
}

const FAQ = [
  {
    question: "Comment Baboo fait-il gagner du temps aux bailleurs ?",
    answer:
      "Vous publiez une seule fois. Les candidats arrivent filtrés, avec leur dossier déjà complété. Si vous choisissez un pack visites, nos agents se déplacent pour vous et vous transmettent un rapport détaillé après chaque visite — vous ne rencontrez que les candidats sérieux.",
  },
  {
    question: "Qui réalise les visites dans les packs Baboo ?",
    answer:
      "Nos agents sont des professionnels formés aux spécificités du marché marocain. Ils reçoivent le candidat sur place, vérifient son dossier, répondent à ses questions sur le bien et vous envoient un rapport structuré avec score, notes et recommandation dans l'heure qui suit.",
  },
  {
    question: "Comment le bail est-il généré ?",
    answer:
      "Dès qu'une candidature est acceptée, Baboo génère un bail conforme à la loi 67-12 directement depuis les informations de l'annonce et du candidat. Vous pouvez ajouter des clauses particulières, signer électroniquement ou télécharger le PDF pour une signature classique.",
  },
  {
    question: "Que se passe-t-il en cas d'impayé ?",
    answer:
      "Baboo vous fournit les outils : registre des loyers, rappels automatiques par WhatsApp, historique des relances, génération de lettres de mise en demeure. L'outil travaille pour vous, vous gardez la main sur la décision.",
  },
  {
    question: "Pourquoi Baboo ne facture pas de commission au pourcentage ?",
    answer:
      "Parce que le travail fourni ne dépend pas du prix du bien. Une visite d'un studio à 4 000 MAD et une villa à 25 000 MAD demandent le même temps à nos agents. Nous facturons donc le service, pas le pourcentage — vous payez ce que vous consommez, rien de plus.",
  },
];
