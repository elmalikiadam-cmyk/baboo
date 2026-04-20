import { ShieldIcon, SparkleIcon, CheckIcon, MapPinIcon } from "@/components/ui/icons";

const PILLARS = [
  {
    Icon: ShieldIcon,
    title: "Annonces modérées",
    body: "Chaque annonce est relue par notre équipe pour éviter doublons, photos trompeuses et prix incohérents.",
  },
  {
    Icon: SparkleIcon,
    title: "Photos de qualité",
    body: "Un minimum de 5 photos nettes, bien cadrées, pour que vous puissiez juger en un coup d'œil.",
  },
  {
    Icon: CheckIcon,
    title: "Agences vérifiées",
    body: "Les professionnels partenaires portent un badge vérifié. Leurs coordonnées sont authentifiées.",
  },
  {
    Icon: MapPinIcon,
    title: "Ancrage local",
    body: "Baboo est pensé pour le Maroc, ses quartiers, ses usages, ses prix. Pas d'importation d'un modèle étranger.",
  },
];

export function TrustStrip() {
  return (
    <section className="container py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-accent-foreground/80">Pourquoi Baboo</p>
        <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Une recherche sereine, sans bruit.</h2>
        <p className="mt-3 text-muted-foreground">
          Nous avons construit Baboo autour d'un principe simple : mieux vaut moins d'annonces, mais de vraie qualité.
        </p>
      </div>

      <ul className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map(({ Icon, title, body }) => (
          <li key={title} className="rounded-xl border border-border bg-surface p-6">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/8 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
