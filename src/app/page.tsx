import Link from "next/link";
import type { Metadata } from "next";
import { ListingCard } from "@/components/listing/listing-card";
import { HeroSearchBlock } from "@/components/search/hero-search-block";
import { CostCalculator } from "@/components/marketing/cost-calculator";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { OwnerServiceRequestTrigger } from "@/components/marketing/owner-service-request";
import { getLatestListings } from "@/lib/listings-query";

export const metadata: Metadata = {
  title: "Baboo — L'immobilier, simplement.",
  description:
    "Publiez votre bien, organisez les visites, signez le cœur léger, le portefeuille intact.",
};

export const revalidate = 3600;

/**
 * Home V5 — repositionnement « L'immobilier, simplement. »
 *
 * Structure Strate 1 (ton posé) :
 *   1. Hero : tagline + sous-titre + 2 CTAs (Publier + Je cherche ***highlighté***)
 *   2. Calculateur — exemple 1 000 MAD / 5 visites avec logo Baboo
 *   3. Quatre services (sans prix, on parle du service — cartes dessous conservées)
 *   4. Visites optionnelles + agenda auto
 *   5. Options propriétaire : Pack photos / Pack ménage
 *   6. Gratuits : estimation prix, aide rédaction
 *   7. Comment ça marche
 *   8. Sélection de la semaine
 *   9. Encart promoteurs
 *  10. FAQ
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
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Publiez votre bien, organisez les visites, signez le cœur
            léger, le portefeuille intact.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/publier"
              className="inline-flex h-12 items-center rounded-full border-2 border-midnight px-6 text-sm font-semibold text-midnight transition-colors hover:bg-midnight hover:text-cream"
            >
              Publier mon bien
            </Link>
            <Link
              href="/je-cherche"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-terracotta-2"
            >
              Je cherche un bien →
            </Link>
          </div>
          <p className="mono mt-4 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Dites-nous ce que vous cherchez — on vous envoie les bonnes
            annonces.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <HeroSearchBlock />
        </div>
      </section>

      {/* ─── Calculateur — exemple 1 000 MAD / 5 visites avec logo Baboo ─── */}
      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <p className="eyebrow">Combien coûte votre transaction</p>
            <h2 className="display-lg mt-3 text-3xl md:text-4xl">
              Avec{" "}
              <span className="inline-flex items-baseline gap-1 text-terracotta">
                <span className="display-hero text-[1.1em] leading-none tracking-tight">
                  Baboo
                </span>
              </span>
              , le juste prix — rien de plus.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground md:text-base">
              À titre d'exemple :{" "}
              <strong className="text-midnight">
                1 000 MAD pour 5 visites
              </strong>{" "}
              réalisées par nos agents. Pas de commission au
              pourcentage, pas de coût caché.
            </p>
          </div>
          <CostCalculator />
        </div>
      </section>

      {/* ─── Quatre services (SANS prix — on parle du service) ─── */}
      <section className="container py-14 md:py-20">
        <div className="mb-10 text-center md:mb-14">
          <p className="eyebrow">Nos services</p>
          <h2 className="display-lg mt-3 text-3xl md:text-4xl">
            Quatre <span className="text-terracotta">services</span>, un
            seul cap.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            Chacun est optionnel. Vous choisissez ce qui vous fait
            gagner du temps, vous gardez le reste.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ServiceCard
            step="01"
            title="Faire visiter à votre place"
            body="Un agent Baboo formé reçoit les candidats sur place, vérifie leurs pièces, prend des photos du bien et vous transmet un rapport structuré avec recommandation. Vous ne rencontrez que les profils sérieux."
          />
          <ServiceCard
            step="02"
            title="Filtrer les candidats"
            body="Chaque candidat complète un dossier vérifiable avant de visiter — pièce d'identité, employeur, bulletins de salaire, garant éventuel. On vous présente un score clair ; les profils incomplets restent à la porte."
          />
          <ServiceCard
            step="03"
            title="Rédiger le bail et gérer la location"
            body="Bail conforme loi 67-12 généré automatiquement, signature électronique, quittances mensuelles, relances loyer, suivi des incidents. La gestion locative tout au long de la vie du bail, pas seulement à la signature."
          />
          <ServiceCard
            step="04"
            title="Organiser tout sur un seul agenda"
            body="Vous publiez vos créneaux, les candidats réservent en ligne, les rappels WhatsApp partent tout seuls. Les rendez-vous se calent sans échange de mails — vous gardez une vue d'ensemble en temps réel."
          />
        </div>
      </section>

      {/* ─── Visites optionnelles ─── */}
      <section className="container py-10 md:py-14">
        <div className="rounded-3xl border border-midnight/10 bg-cream p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <p className="eyebrow">Bon à savoir</p>
              <h3 className="display-lg mt-3 text-2xl md:text-3xl">
                Faire visiter, c'est{" "}
                <span className="text-terracotta">optionnel</span>.
              </h3>
              <p className="mt-4 text-sm text-midnight md:text-base">
                Vous pouvez rester aux commandes. L'outil sert d'abord
                à <strong>suivre et organiser</strong> vos rendez-vous :
                les candidats réservent eux-mêmes sur vos créneaux,
                l'agenda se met à jour, les rappels partent
                automatiquement. Le jour où vous voulez souffler, vous
                activez un pack visites et nos agents prennent le
                relais.
              </p>
              <div className="mt-6">
                <Link
                  href="/publier"
                  className="inline-flex h-11 items-center rounded-full bg-midnight px-5 text-sm font-semibold text-cream hover:bg-midnight/90"
                >
                  Publier et organiser mes visites →
                </Link>
              </div>
            </div>
            <div className="grid gap-3 text-sm">
              <BulletRow>
                Candidats réservent un créneau disponible en ligne
              </BulletRow>
              <BulletRow>
                Rappel WhatsApp J-1 + confirmation H-2 automatiques
              </BulletRow>
              <BulletRow>
                Historique complet, export en un clic
              </BulletRow>
              <BulletRow>
                Activation « visite par un agent » à la demande
              </BulletRow>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Options propriétaire — Pack photos / Pack ménage ─── */}
      <section className="container py-12 md:py-16">
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow">À la carte</p>
          <h2 className="display-lg mt-3 text-2xl md:text-3xl">
            Options pour propriétaires
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Des coups de pouce ponctuels, facturés à l'acte. Vous
            activez quand vous en avez besoin.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <OptionCard
            title="Pack photos"
            body="Un photographe pro passe chez vous, livre 15 clichés retouchés HD et un plan d'étage. Les annonces avec photos pro reçoivent en moyenne 3× plus de contacts."
            kind="PHOTOS"
          />
          <OptionCard
            title="Pack ménage avant visite"
            body="Équipe de ménage entre candidats ou avant une vague de visites. Un bien bien présenté, c'est un candidat qui se projette et une location qui se conclut plus vite."
            kind="CLEANING"
          />
        </div>
      </section>

      {/* ─── Toujours gratuit ─── */}
      <section className="container py-12 md:py-16">
        <div className="rounded-3xl border border-forest/30 bg-forest/5 p-6 md:p-10">
          <p className="eyebrow text-forest">Toujours gratuit</p>
          <h3 className="display-lg mt-3 text-2xl md:text-3xl">
            Le socle reste offert, pour tout le monde.
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <FreeCard
              title="Estimation du prix"
              body="Un ordre de grandeur fondé sur les transactions récentes de votre quartier. Publier au bon prix, c'est la moitié du succès."
            />
            <FreeCard
              title="Aide à la rédaction"
              body="Titre, description, points forts à mettre en avant : on vous propose un brouillon, vous gardez le dernier mot sur chaque phrase."
            />
            <FreeCard
              title="Publication et diffusion"
              body="Annonce visible sur tout Baboo, photos illimitées, statistiques de vues, contacts directs — sans abonnement."
            />
          </div>
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
            body="Décrivez votre bien, ajoutez vos photos, fixez votre prix. Estimation et aide à la rédaction offertes."
          />
          <Step
            n="02"
            title="Recevez"
            body="Les candidats postulent avec leur dossier — pièces d'identité, emploi, revenus, garant si besoin."
          />
          <Step
            n="03"
            title="Faites visiter"
            body="Vous accompagnez vous-même, ou nos agents le font pour vous — à votre rythme."
          />
          <Step
            n="04"
            title="Signez"
            body="Bail généré en un clic, conforme, signable électroniquement. Gestion locative intégrée."
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
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-midnight/10 bg-cream p-6 md:p-7">
      <div className="flex items-baseline gap-3">
        <span className="mono text-[10px] uppercase tracking-[0.14em] text-terracotta">
          {step}
        </span>
        <h3 className="display-lg text-xl text-midnight">{title}</h3>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-midnight">{body}</p>
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

function OptionCard({
  title,
  body,
  kind,
}: {
  title: string;
  body: string;
  kind: "PHOTOS" | "CLEANING";
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-terracotta/30 bg-terracotta/5 p-6 md:p-7">
      <p className="mono text-[10px] uppercase tracking-[0.14em] text-terracotta">
        Option
      </p>
      <h3 className="display-md mt-3 text-xl">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-midnight/80">
        {body}
      </p>
      <div className="mt-auto">
        <OwnerServiceRequestTrigger kind={kind} />
      </div>
    </div>
  );
}

function FreeCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white p-5">
      <h4 className="display-md text-base">{title}</h4>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function BulletRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
      <p className="text-sm text-midnight">{children}</p>
    </div>
  );
}

const FAQ = [
  {
    question: "Dois-je absolument payer un pack visites ?",
    answer:
      "Non. Faire visiter soi-même est parfaitement possible et même par défaut — l'outil vous sert à organiser vos créneaux, à recevoir les demandes et à automatiser les rappels WhatsApp. Les packs visites ne deviennent utiles que si vous n'avez pas le temps de vous déplacer.",
  },
  {
    question: "Combien coûte un pack visites ?",
    answer:
      "À titre de repère, 1 000 MAD pour 5 visites location — forfait fixe, valable 12 mois, pour une annonce. Les packs sont détaillés dans la page « Choisir un pack » de chaque annonce.",
  },
  {
    question: "Qui réalise les visites dans les packs Baboo ?",
    answer:
      "Nos agents sont des professionnels formés au marché marocain. Ils reçoivent le candidat, vérifient son dossier, répondent à ses questions, prennent quelques photos du bien et vous envoient un rapport structuré avec score et recommandation dans l'heure qui suit.",
  },
  {
    question: "Comment le bail est-il généré ?",
    answer:
      "Dès qu'une candidature est acceptée, Baboo génère un bail conforme à la loi 67-12 à partir des informations de l'annonce et du candidat. Clauses particulières, signature électronique ou PDF à télécharger : vous gardez le choix.",
  },
  {
    question: "L'estimation de prix et l'aide à la rédaction sont-elles vraiment gratuites ?",
    answer:
      "Oui, sans condition. Publier au bon prix avec une description claire, c'est la moitié du succès — il est dans notre intérêt que vos annonces performent.",
  },
  {
    question: "Pourquoi Baboo ne facture pas au pourcentage ?",
    answer:
      "Parce que le travail fourni ne dépend pas du prix du bien. Une visite d'un studio à 4 000 MAD et une villa à 25 000 MAD demandent le même temps à nos agents. Nous facturons le service, pas le pourcentage — vous payez ce que vous consommez, rien de plus.",
  },
];
