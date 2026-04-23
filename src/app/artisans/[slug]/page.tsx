import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db, hasDb } from "@/lib/db";
import { CITIES } from "@/data/cities";
import { normalizePhoneMA } from "@/lib/whatsapp";
import { CraftsmanSpeciality } from "@prisma/client";

const SPECIALITY_LABEL: Record<CraftsmanSpeciality, string> = {
  PLOMBERIE: "Plomberie",
  ELECTRICITE: "Électricité",
  PEINTURE: "Peinture",
  MACONNERIE: "Maçonnerie",
  SERRURERIE: "Serrurerie",
  MENUISERIE: "Menuiserie",
  CLIMATISATION: "Climatisation",
  NETTOYAGE: "Nettoyage",
  JARDINAGE: "Jardinage",
  MULTITRAVAUX: "Multi-travaux",
  AUTRE: "Autre",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!hasDb()) return { title: "Artisan — Baboo" };
  const c = await db.craftsman.findUnique({
    where: { slug },
    select: { displayName: true, speciality: true, description: true },
  });
  if (!c) return { title: "Artisan introuvable — Baboo" };
  return {
    title: `${c.displayName} · ${SPECIALITY_LABEL[c.speciality]} — Baboo`,
    description:
      c.description?.slice(0, 160) ??
      `Retrouvez ${c.displayName}, ${SPECIALITY_LABEL[c.speciality].toLowerCase()} sur Baboo.`,
  };
}

export const dynamic = "force-dynamic";

export default async function CraftsmanProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!hasDb()) notFound();
  const c = await db.craftsman.findUnique({ where: { slug } });
  if (!c) notFound();

  const whatsappPhone = normalizePhoneMA(c.whatsapp ?? c.phone);
  const whatsappLink = whatsappPhone
    ? `https://wa.me/${whatsappPhone}`
    : null;

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/artisans" className="hover:text-midnight">Artisans</Link>
        <span className="mx-2">·</span>
        <span>{c.displayName}</span>
      </nav>

      <header className="grid gap-6 border-b border-midnight/10 pb-6 md:grid-cols-[auto_1fr]">
        <div
          className="grid h-24 w-24 place-items-center rounded-2xl bg-midnight font-display text-2xl text-cream"
          style={
            c.photo
              ? {
                  backgroundImage: `url(${c.photo})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {!c.photo &&
            c.displayName
              .split(" ")
              .slice(0, 2)
              .map((s) => s[0]?.toUpperCase() ?? "")
              .join("")}
        </div>
        <div>
          <p className="eyebrow">
            {SPECIALITY_LABEL[c.speciality]}
            {c.verified && " · ✓ vérifié"}
          </p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">{c.displayName}</h1>
          {c.rateInfo && (
            <p className="mt-3 text-sm text-midnight">
              <strong>Tarif :</strong> {c.rateInfo}
            </p>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section className="space-y-6">
          {c.description && (
            <div>
              <h2 className="display-md text-xl">À propos</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-midnight">
                {c.description}
              </p>
            </div>
          )}

          {c.serviceCitySlugs.length > 0 && (
            <div>
              <h2 className="display-md text-xl">Villes d'intervention</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.serviceCitySlugs.map((slug) => {
                  const city = CITIES.find((x) => x.slug === slug);
                  return (
                    <span
                      key={slug}
                      className="rounded-full border border-midnight/20 bg-cream px-3 py-1 text-xs text-midnight"
                    >
                      {city?.name ?? slug}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-midnight/10 bg-cream p-6">
            <p className="eyebrow">Contact direct</p>
            <div className="mt-4 space-y-2">
              <a
                href={`tel:${c.phone}`}
                className="flex h-11 w-full items-center justify-center rounded-full bg-midnight px-5 text-sm font-semibold text-cream hover:opacity-90"
              >
                Appeler · {c.phone}
              </a>
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 w-full items-center justify-center rounded-full bg-forest px-5 text-sm font-semibold text-cream hover:opacity-90"
                >
                  WhatsApp
                </a>
              )}
              {c.email && (
                <a
                  href={`mailto:${c.email}`}
                  className="flex h-11 w-full items-center justify-center rounded-full border-2 border-midnight px-5 text-sm font-medium text-midnight hover:bg-midnight hover:text-cream"
                >
                  Email · {c.email}
                </a>
              )}
            </div>
          </div>
          {!c.verified && (
            <div className="rounded-2xl border border-dashed border-midnight/20 p-4 text-xs text-muted-foreground">
              ⓘ Ce profil n'a pas encore été vérifié par l'équipe
              Baboo. Demandez des références à l'artisan avant
              engagement.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
