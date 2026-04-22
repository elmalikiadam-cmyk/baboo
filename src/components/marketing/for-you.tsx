import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronRightIcon } from "@/components/ui/icons";
import { IndividualIllus, BusinessIllus } from "@/components/marketing/illustrations";

const BLOCKS = [
  {
    n: "01",
    badge: "Particulier",
    title: "Vendez ou louez vous-même.",
    body: "Publiez votre annonce en quelques minutes. Photos, description, prix. Vous gardez la main sur vos échanges. Gratuit pour commencer.",
    cta: "Publier gratuitement",
    href: "/pro/publier?as=individual",
    Illus: IndividualIllus,
  },
  {
    n: "02",
    badge: "Professionnel",
    title: "Boostez votre agence.",
    body: "Tableau de bord, leads qualifiés, mise en avant sur les pages de recherche. Baboo Pro est pensé pour les agences et promoteurs qui veulent aller vite.",
    cta: "Découvrir Baboo Pro",
    href: "/pro",
    Illus: BusinessIllus,
  },
];

export function ForYou() {
  return (
    <section className="container py-16 md:py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-4">
        <div>
          <p className="eyebrow">Pour qui</p>
          <h2 className="display-xl mt-2 text-3xl md:text-5xl">Particulier ou professionnel.</h2>
        </div>
        <Link href="/contact" className="pill-soft">Nous contacter</Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {BLOCKS.map(({ n, badge, title, body, cta, href, Illus }) => (
          <Card key={badge} variant="dark" className="relative overflow-hidden p-7 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mono text-[10px] tracking-[0.14em] text-cream/60">/{n}</p>
                <span className="mt-3 inline-flex items-center rounded-full bg-cream/10 px-3 py-1 text-xs font-medium text-cream">
                  {badge}
                </span>
              </div>
              <Illus className="h-20 w-32 text-cream opacity-90" />
            </div>

            <div className="mt-14 md:mt-20">
              <h3 className="display-xl text-3xl text-cream md:text-[2.5rem]">{title}</h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/75 md:text-[0.95rem]">
                {body}
              </p>
              <Link
                href={href}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-midnight transition-colors hover:bg-cream-2"
              >
                {cta} <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
