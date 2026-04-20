import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SearchIllus, HeartIllus, ContactIllus } from "@/components/marketing/illustrations";

const STEPS = [
  {
    n: "01",
    title: "Cherchez sans friction.",
    body: "Ville, quartier, budget, surface. Les filtres sont clairs, les résultats sont rapides.",
    Illus: SearchIllus,
  },
  {
    n: "02",
    title: "Gardez le meilleur.",
    body: "Sauvegardez vos favoris, créez une alerte et ne ratez aucune nouvelle annonce.",
    Illus: HeartIllus,
  },
  {
    n: "03",
    title: "Contactez directement.",
    body: "Un message, un appel, ou WhatsApp. Vous parlez au particulier ou à l'agence, sans intermédiaire caché.",
    Illus: ContactIllus,
  },
];

export function HowItWorks() {
  return (
    <section className="container py-16 md:py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-foreground/15 pb-4">
        <div>
          <p className="eyebrow">Mode d'emploi</p>
          <h2 className="display-xl mt-2 text-3xl md:text-5xl">Comment ça marche.</h2>
        </div>
        <Link href="/a-propos" className="pill-soft">En savoir plus</Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map(({ n, title, body, Illus }) => (
          <Card key={title} variant="light" className="flex aspect-[7/9] flex-col overflow-hidden p-7 md:p-9">
            <div>
              <p className="mono text-[10px] tracking-[0.14em] text-muted-foreground">/{n}</p>
              <h3 className="display-xl mt-5 text-[1.75rem] md:text-[2rem]">{title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">
                {body}
              </p>
            </div>
            <div className="mt-auto flex justify-center pt-8">
              <Illus className="h-32 w-full text-foreground" />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
