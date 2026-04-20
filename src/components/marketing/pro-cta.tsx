import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProCta() {
  return (
    <section className="container py-16 md:py-24">
      <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-14 text-primary-foreground md:px-16 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-primary-foreground/5 blur-3xl"
        />
        <div className="relative grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-accent">Espace Pro</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              Agences, promoteurs : donnez à vos biens la vitrine qu'ils méritent.
            </h2>
            <p className="mt-4 max-w-xl text-primary-foreground/80">
              Publication soignée, leads qualifiés, tableau de bord clair. Baboo est pensé pour les
              professionnels exigeants de l'immobilier au Maroc.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pro/publier"><Button variant="accent" size="lg">Publier une annonce</Button></Link>
              <Link href="/pro"><Button variant="outline" size="lg" className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">Découvrir l'espace Pro</Button></Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[
              { k: "Annonces publiées", v: "+2 400" },
              { k: "Agences partenaires", v: "180" },
              { k: "Villes couvertes", v: "12" },
              { k: "Leads qualifiés/mois", v: "3 500" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/[0.04] p-5">
                <dt className="text-xs uppercase tracking-widest text-primary-foreground/60">{s.k}</dt>
                <dd className="mt-1 font-display text-2xl font-semibold">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
