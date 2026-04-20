import Link from "next/link";
import { Card } from "@/components/ui/card";
import { UserIcon, BuildingIcon, ChevronRightIcon } from "@/components/ui/icons";

const BLOCKS = [
  {
    badge: "Particulier",
    title: "Vendez ou louez vous-même.",
    body: "Publiez votre annonce en quelques minutes. Photos, description, prix. Vous gardez la main sur vos échanges. Gratuit pour commencer.",
    cta: "Publier gratuitement",
    href: "/pro/publier?as=individual",
    Icon: UserIcon,
  },
  {
    badge: "Professionnel",
    title: "Boostez votre agence.",
    body: "Tableau de bord, leads qualifiés, mise en avant sur les pages de recherche. Baboo Pro est pensé pour les agences et promoteurs qui veulent aller vite.",
    cta: "Découvrir Baboo Pro",
    href: "/pro",
    Icon: BuildingIcon,
  },
];

export function ForYou() {
  return (
    <section className="container py-20 md:py-28">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Pour qui</p>
          <h2 className="display-xl mt-2 text-3xl md:text-5xl">Particulier ou professionnel.</h2>
        </div>
        <Link href="/contact" className="pill-soft">Nous contacter</Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {BLOCKS.map(({ badge, title, body, cta, href, Icon }) => (
          <Card key={badge} variant="dark" className="relative overflow-hidden p-7 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex items-center rounded-full bg-background/10 px-3 py-1 text-xs font-medium text-ink-foreground">
                {badge}
              </span>
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-ink-foreground/20">
                <Icon className="h-6 w-6 stroke-[1.5] text-ink-foreground" />
              </span>
            </div>

            <div className="mt-16 md:mt-24">
              <h3 className="display-xl text-3xl text-ink-foreground md:text-[2.5rem]">{title}</h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-foreground/75 md:text-[0.95rem]">
                {body}
              </p>
              <Link
                href={href}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
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
