import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Check,
  Building2,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Espace Pro",
  description:
    "Publiez vos annonces, recevez des leads qualifiés, suivez votre pipeline. Baboo Pro pour les agences et promoteurs au Maroc.",
};

const BENEFITS = [
  {
    Icon: Home,
    title: "Publication soignée",
    body: "Fiche standardisée, photos mises en valeur, typographie lisible. Vos biens méritent mieux qu'un formulaire pressé.",
  },
  {
    Icon: MessageCircle,
    title: "Leads qualifiés",
    body: "Chaque contact arrive avec nom, téléphone, email, message. Zéro bots, zéro spam.",
  },
  {
    Icon: Sparkles,
    title: "Tableau de bord",
    body: "Vos annonces, vos vues, vos leads, en direct. Un chiffre par colonne, pas de diagramme inutile.",
  },
  {
    Icon: Building2,
    title: "Mise en avant",
    body: "Les annonces vérifiées apparaissent en premier sur les pages ville et dans les recherches.",
  },
  {
    Icon: ShieldCheck,
    title: "Modération humaine",
    body: "Chaque annonce passe devant un humain avant publication. Les doublons et les photos volées sont retirés.",
  },
  {
    Icon: Check,
    title: "Support local",
    body: "Équipe basée à Casablanca, WhatsApp direct avec votre référent. Pas de ticket à créer.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Baboo nous apporte des demandes précises, pas du trafic. En six mois, trois ventes directement attribuables.",
    name: "Karim E.",
    agency: "Atlas Immobilier · Casablanca",
  },
  {
    quote:
      "Le tableau de bord est simple. Je vois mes leads du matin et je rappelle avant midi.",
    name: "Salma B.",
    agency: "Médina Estates · Marrakech",
  },
  {
    quote:
      "Publier une annonce prend trois minutes. Mes fiches ont rarement été aussi propres.",
    name: "Omar R.",
    agency: "Côte Atlantique Immo · Agadir",
  },
];

export default function ProLandingPage() {
  return (
    <div className="container py-12 md:py-20">
      <section className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Baboo Pro</p>
        <h1 className="display-xl mt-4">
          L'immobilier, <span className="italic">sans friction.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-ink-soft">
          Une plateforme pensée pour les agences, brokers et promoteurs marocains. Publier, recevoir,
          qualifier — rien de plus, rien de moins.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/inscription?role=pro">
            <Button size="lg">Créer un compte Pro</Button>
          </Link>
          <Link href="/pro/contact">
            <Button variant="outline" size="lg">
              Parler à notre équipe
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-5 md:grid-cols-3">
        {BENEFITS.map(({ Icon, title, body }) => (
          <article
            key={title}
            className="rounded-2xl border border-border-soft bg-surface-warm p-6"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-success text-ink-foreground">
              <Icon size={18} strokeWidth={1.8} aria-hidden />
            </span>
            <h2 className="display-md mt-5 text-[1.125rem]">{title}</h2>
            <p className="mt-2 text-sm text-ink-soft">{body}</p>
          </article>
        ))}
      </section>

      <section className="mt-20">
        <div className="mb-8">
          <p className="eyebrow-muted">Ils utilisent Baboo Pro</p>
          <h2 className="display-lg mt-2">La parole aux agences.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={i}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <blockquote className="font-display text-[17px] leading-snug text-ink">
                « {t.quote} »
              </blockquote>
              <figcaption className="mt-5 border-t border-border-soft pt-4 text-xs">
                <div className="font-semibold text-ink">{t.name}</div>
                <div className="mt-0.5 text-ink-muted">{t.agency}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
