import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckIcon } from "@/components/ui/icons";

export const metadata = { title: "Espace Pro — Agences et promoteurs" };

const BENEFITS = [
  "Publication soignée : photos, carte, caractéristiques complètes",
  "Leads qualifiés directement dans votre boîte de réception",
  "Tableau de bord clair : pipeline, notes, statuts",
  "Mise en avant sur les pages de recherche",
  "Modération qui protège la qualité de votre vitrine",
  "Support dédié basé au Maroc",
];

export default function ProLanding() {
  return (
    <div>
      <section className="container pb-16 pt-16 md:pb-24 md:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">Baboo Pro</p>
          <h1 className="display-xl mt-3 text-4xl md:text-[clamp(2.5rem,5.5vw,4.5rem)]">
            L'immobilier, sans friction.
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-base leading-relaxed text-muted-foreground md:text-lg">
            Baboo Pro est l'espace des agences, brokers et promoteurs. Publication, leads, pipeline, tout est réuni.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/inscription?role=agency"><Button size="lg">Créer un compte Pro</Button></Link>
            <Link href="/contact"><Button size="lg" variant="outline">Parler à notre équipe</Button></Link>
          </div>
        </div>
      </section>

      <section className="container pb-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <Card key={b} variant="light" className="p-7">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background">
                <CheckIcon className="h-5 w-5" />
              </span>
              <p className="mt-5 text-[0.95rem] leading-relaxed text-foreground">{b}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
