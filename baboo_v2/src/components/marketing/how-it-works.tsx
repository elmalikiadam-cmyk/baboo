import { Search, Home, Check } from "@/components/ui/icons";

const STEPS = [
  {
    n: "01",
    Icon: Search,
    title: "Recherchez",
    body: "Filtrez par ville, budget, surface. Sauvegardez vos recherches pour les retrouver.",
  },
  {
    n: "02",
    Icon: Home,
    title: "Visitez",
    body: "Contactez les publiants directement depuis la fiche annonce. Téléphone, WhatsApp, message.",
  },
  {
    n: "03",
    Icon: Check,
    title: "Emménagez",
    body: "Signature, remise des clés. Baboo vous accompagne jusqu'au dossier administratif.",
  },
];

/**
 * "Comment ça marche" — 3 colonnes sobres sur la home.
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
          <div key={n} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-warm">
                <Icon size={18} strokeWidth={1.8} className="text-ink" />
              </span>
              <p className="eyebrow-muted">{n}</p>
            </div>
            <h3 className="display-md mt-4 text-[1.125rem]">{title}</h3>
            <p className="mt-2 text-sm text-ink-soft">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
