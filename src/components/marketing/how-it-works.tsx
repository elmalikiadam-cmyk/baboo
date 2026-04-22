import {
  SearchIcon,
  HomeIcon,
  CheckIcon,
} from "@/components/ui/icons";

const STEPS = [
  {
    n: "01",
    Icon: SearchIcon,
    title: "Recherchez",
    body: "Ville, quartier, budget, surface. Filtres clairs, résultats rapides.",
  },
  {
    n: "02",
    Icon: HomeIcon,
    title: "Visitez",
    body: "Contactez directement par message, téléphone ou WhatsApp. Sans intermédiaire caché.",
  },
  {
    n: "03",
    Icon: CheckIcon,
    title: "Emménagez",
    body: "Signature, remise des clés. On vous accompagne jusqu'au dossier administratif.",
  },
];

/**
 * V2 "Maison ouverte" : 3 étapes sobres, photo pas héros (icône dans square
 * surface-warm), pas d'illustrations lourdes.
 */
export function HowItWorks() {
  return (
    <section className="mt-14">
      <div className="mb-8">
        <p className="eyebrow-muted">Comment ça marche</p>
        <h2 className="display-lg mt-2">Trois étapes, pas une de plus.</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map(({ n, Icon, title, body }) => (
          <div
            key={n}
            className="rounded-2xl border border-border bg-cream p-5"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream-2">
                <Icon className="h-4 w-4 text-midnight" />
              </span>
              <p className="eyebrow-muted">{n}</p>
            </div>
            <h3 className="display-md mt-4 text-[1.125rem]">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
