import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "À propos",
  description: "Qui nous sommes et pourquoi nous avons créé Baboo.",
};

const STATS = [
  { k: "Annonces publiées", v: "2 847" },
  { k: "Agences partenaires", v: "180" },
  { k: "Villes couvertes", v: "12" },
  { k: "Leads/mois", v: "3 500" },
];

const VALUES = [
  {
    n: "01",
    title: "Clarté.",
    body: "Des prix en dirhams, des surfaces en m², des photos nettes. Pas de petit astérisque en bas de page.",
  },
  {
    n: "02",
    title: "Qualité.",
    body: "Chaque annonce est relue. Les doublons, les photos trompeuses et les prix incohérents sont retirés.",
  },
  {
    n: "03",
    title: "Ancrage local.",
    body: "Baboo est pensé pour le Maroc, ses quartiers, ses usages. Pas une traduction d'un modèle étranger.",
  },
  {
    n: "04",
    title: "Sans intermédiaire caché.",
    body: "Vous parlez directement au particulier ou à l'agence. Pas de numéro surtaxé, pas de commission surprise.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="container py-14 md:py-20">
        <p className="eyebrow">À propos</p>
        <h1 className="display-xl mt-2 text-5xl md:text-[clamp(3rem,8vw,6rem)]">
          Baboo est né d'une conviction simple.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-muted md:text-xl">
          L'immobilier au Maroc mérite une plateforme calme, lisible et sincère.
          Nous construisons Baboo pour que chercher un logement — ou le publier —
          redevienne une expérience sereine.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/recherche"><Button size="lg">Voir les annonces</Button></Link>
          <Link href="/pro"><Button size="lg" variant="outline">Espace Pro</Button></Link>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <dl className="grid grid-cols-2 gap-y-10 border-y border-border py-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.k}>
              <dt className="eyebrow">{s.k}</dt>
              <dd className="display-xl mt-2 text-5xl">{s.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container py-14 md:py-20">
        <div className="mb-10 border-b border-border pb-4">
          <p className="eyebrow">Nos valeurs</p>
          <h2 className="display-xl mt-2 text-3xl md:text-5xl">Ce qui nous guide.</h2>
        </div>
        <ul className="grid gap-5 md:grid-cols-2">
          {VALUES.map((v) => (
            <li key={v.n} className="rounded-md border border-border p-7 md:p-9">
              <p className="mono text-[10px] tracking-[0.14em] text-ink-muted">/{v.n}</p>
              <h3 className="display-xl mt-4 text-3xl">{v.title}</h3>
              <p className="mt-4 leading-relaxed text-ink-muted">{v.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container py-14 md:py-20">
        <div className="rounded-md bg-ink p-10 text-ink-foreground md:p-16">
          <p className="eyebrow text-ink-foreground/60">Rejoindre Baboo</p>
          <h2 className="display-xl mt-3 text-4xl text-ink-foreground md:text-5xl">
            Vous vendez, vous louez, vous publiez ?
          </h2>
          <p className="mt-4 max-w-xl text-ink-foreground/75">
            Qu'on soit particulier, agence ou promoteur, Baboo vous donne le même soin. Publication gratuite, leads qualifiés, interface claire.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/pro/publier" className="inline-flex items-center gap-2 rounded-full bg-ink-foreground px-5 py-2.5 text-sm font-medium text-ink">
              Déposer une annonce
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/30 px-5 py-2.5 text-sm font-medium text-ink-foreground hover:bg-ink-foreground/10">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
