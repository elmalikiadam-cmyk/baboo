import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SearchIcon, HeartIcon, PhoneIcon } from "@/components/ui/icons";

const STEPS = [
  {
    title: "Cherchez sans friction.",
    body: "Ville, quartier, budget, surface. Les filtres sont clairs, les résultats sont rapides.",
    Icon: SearchIcon,
  },
  {
    title: "Gardez le meilleur.",
    body: "Sauvegardez vos coups de cœur, créez une alerte et ne ratez aucune nouvelle annonce.",
    Icon: HeartIcon,
  },
  {
    title: "Contactez directement.",
    body: "Un message, un appel, ou WhatsApp. Vous parlez au particulier ou à l'agence, sans intermédiaire caché.",
    Icon: PhoneIcon,
  },
];

export function HowItWorks() {
  return (
    <section className="container py-20 md:py-28">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <h2 className="display-xl text-3xl md:text-5xl">Comment ça marche.</h2>
        <Link href="/a-propos" className="pill-soft">En savoir plus</Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map(({ title, body, Icon }) => (
          <Card key={title} variant="light" className="flex aspect-[7/9] flex-col justify-between p-7 md:p-9">
            <div>
              <h3 className="display-xl text-[1.65rem] md:text-3xl">{title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">
                {body}
              </p>
            </div>
            <div className="mt-8 flex items-end">
              <span className="grid h-16 w-16 place-items-center rounded-2xl border border-foreground/20">
                <Icon className="h-7 w-7 stroke-[1.5]" />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
