import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckIcon, ChevronRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Espace Pro — Agences et promoteurs" };

const BENEFITS = [
  { title: "Publication soignée", body: "Photos, carte, caractéristiques complètes. Votre annonce rend bien." },
  { title: "Leads qualifiés", body: "Les messages entrants directement dans votre boîte, avec source et contexte." },
  { title: "Tableau de bord clair", body: "Pipeline, notes, statuts. Chaque contact suivi, rien ne se perd." },
  { title: "Mise en avant", body: "Pages de recherche, landings de villes, section featured de la homepage." },
  { title: "Modération", body: "Les annonces douteuses sont retirées. Votre vitrine reste propre." },
  { title: "Support local", body: "Une équipe basée au Maroc, joignable par email et WhatsApp." },
];

export default function ProLanding() {
  return (
    <div>
      <section className="container pb-10 pt-16 md:pb-14 md:pt-24">
        <p className="eyebrow">Baboo Pro</p>
        <h1 className="display-xl mt-3 text-5xl md:text-[clamp(3rem,8vw,6.5rem)]">
          L'immobilier,<br />
          sans friction.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Baboo Pro est l'espace des agences, brokers et promoteurs. Publication soignée, leads qualifiés, tableau de bord clair — le tout sans jargon.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/inscription?role=agency"><Button size="lg">Créer un compte Pro</Button></Link>
          <Link href="/pro/dashboard"><Button size="lg" variant="outline">Voir un exemple →</Button></Link>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <dl className="grid grid-cols-2 gap-y-8 border-y border-foreground/15 py-8 md:grid-cols-4">
          <div>
            <dt className="eyebrow">Agences partenaires</dt>
            <dd className="display-xl mt-2 text-4xl">180+</dd>
          </div>
          <div>
            <dt className="eyebrow">Leads/mois</dt>
            <dd className="display-xl mt-2 text-4xl">3 500</dd>
          </div>
          <div>
            <dt className="eyebrow">Annonces actives</dt>
            <dd className="display-xl mt-2 text-4xl">2 847</dd>
          </div>
          <div>
            <dt className="eyebrow">Taux de réponse</dt>
            <dd className="display-xl mt-2 text-4xl">92%</dd>
          </div>
        </dl>
      </section>

      <section className="container py-14 md:py-20">
        <div className="mb-10 border-b border-foreground/15 pb-4">
          <p className="eyebrow">Ce que ça change</p>
          <h2 className="display-xl mt-2 text-3xl md:text-5xl">Six raisons d'y passer.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <Card key={b.title} variant="light" className="p-7">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background">
                <CheckIcon className="h-5 w-5" />
              </span>
              <h3 className="display-lg mt-5 text-xl">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <Card variant="dark" className="relative overflow-hidden p-8 md:p-14">
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <p className="eyebrow text-ink-foreground/60">Aperçu du dashboard</p>
              <h2 className="display-xl mt-3 text-3xl text-ink-foreground md:text-5xl">
                Tout ce qu'il vous faut, en un écran.
              </h2>
              <p className="mt-4 max-w-xl text-ink-foreground/75">
                Leads entrants, portefeuille d'annonces, performance sur 30 jours. Pas de bruit, pas de widgets inutiles.
              </p>
              <Link
                href="/pro/dashboard"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground"
              >
                Ouvrir le dashboard démo <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>

            {/* Mini wireframe preview */}
            <div className="rounded-2xl border border-ink-foreground/15 bg-ink-2 p-5">
              <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-foreground/50">
                Dashboard · Atlas Realty
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { l: "Actives", v: "14" },
                  { l: "Vues", v: "12.4K" },
                  { l: "Leads", v: "18" },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-ink-foreground/10 p-3">
                    <p className="mono text-[8px] uppercase tracking-[0.12em] text-ink-foreground/50">{s.l}</p>
                    <p className="display-lg mt-1 text-lg text-ink-foreground">{s.v}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-4 space-y-1.5 text-ink-foreground/85">
                {["Youssef E. · Villa Anfa", "Sarah C. · Apt. Gauthier", "Karim B. · Villa Souissi"].map((r) => (
                  <li key={r} className="flex items-center gap-2 rounded-md bg-ink-foreground/5 p-2 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-foreground" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
