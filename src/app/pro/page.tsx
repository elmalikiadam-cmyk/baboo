import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";

export const metadata = { title: "Espace Pro — Agences et promoteurs" };

const BENEFITS = [
  "Publication soignée : photos, carte, caractéristiques complètes",
  "Leads qualifiés directement dans votre boîte de réception",
  "Tableau de bord clair : pipeline, notes, statuts",
  "Modération qui protège la qualité de votre vitrine",
  "Mise en avant sur les pages de villes et quartiers",
  "Support dédié basé au Maroc",
];

export default function ProLanding() {
  return (
    <div>
      <section className="container py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-widest text-accent-foreground/80">Espace Pro</p>
          <h1 className="mt-3 font-display text-display-md font-semibold">
            Donnez à vos biens la vitrine qu'ils méritent.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Baboo est conçu pour les agences, brokers et promoteurs qui tiennent à leur image et à la qualité de leurs leads.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/inscription?role=agency"><Button size="lg">Créer un compte agence</Button></Link>
            <Link href="/contact"><Button size="lg" variant="outline">Parler à notre équipe</Button></Link>
          </div>
        </div>
      </section>

      <section className="container pb-20">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-5">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/8 text-primary">
                <CheckIcon className="h-4 w-4" />
              </span>
              <p className="text-sm leading-relaxed text-foreground">{b}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
