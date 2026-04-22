import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db, hasDb } from "@/lib/db";
import { CITIES } from "@/data/cities";
import { ListingCard } from "@/components/listing/listing-card";
import { Button } from "@/components/ui/button";
import { PhoneIcon, WhatsAppIcon, CheckIcon, MapPinIcon } from "@/components/ui/icons";
import { agencyJsonLd } from "@/lib/jsonld";

async function getAgency(slug: string) {
  if (!hasDb()) return null;
  try {
    return await db.agency.findUnique({
      where: { slug },
      include: {
        listings: {
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          include: {
            city: true,
            neighborhood: true,
            agency: { select: { id: true, slug: true, name: true, verified: true, logo: true } },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAgency(slug);
  if (!a) return { title: "Agence introuvable" };
  const count = a.listings.length;
  const description =
    a.tagline ??
    a.description?.slice(0, 160) ??
    `${a.name} — ${count} annonce${count > 1 ? "s" : ""} sur Baboo.`;
  const og = a.cover ?? a.logo ?? undefined;
  return {
    title: a.name,
    description,
    alternates: { canonical: `/agence/${a.slug}` },
    openGraph: {
      title: a.name,
      description,
      type: "profile",
      ...(og ? { images: [og] } : {}),
    },
  };
}

export default async function AgencyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agency = await getAgency(slug);
  if (!agency) notFound();
  const city = CITIES.find((c) => c.slug === agency.citySlug);
  const saleCount = agency.listings.filter((l) => l.transaction === "SALE").length;
  const rentCount = agency.listings.length - saleCount;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://baboo.ma").replace(/\/+$/, "");
  const jsonLd = agencyJsonLd(agency, siteUrl);

  return (
    <div className="container py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        <Link href="/" className="hover:text-ink">Accueil</Link>
        <span className="mx-2">·</span>
        <Link href="/agences" className="hover:text-ink">Agences</Link>
        <span className="mx-2">·</span>
        <span>{agency.name}</span>
      </nav>

      {/* Header */}
      <header className="grid gap-10 border-b border-border pb-10 md:grid-cols-[1.4fr_1fr] md:pb-14">
        <div>
          <div className="flex items-start gap-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-surface-warm md:h-24 md:w-24">
              {agency.logo && (
                <Image src={agency.logo} alt={agency.name} fill sizes="96px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {agency.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 mono text-[9px] uppercase tracking-[0.12em]">
                    <CheckIcon className="h-3 w-3" /> Vérifiée
                  </span>
                )}
                <span className="mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                  Agence · Baboo Pro
                </span>
              </div>
              <h1 className="display-xl mt-3 text-4xl md:text-6xl">{agency.name}</h1>
              {agency.tagline && (
                <p className="mt-2 text-ink-muted">{agency.tagline}</p>
              )}
              {city && (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-muted">
                  <MapPinIcon className="h-4 w-4" /> Basée à {city.name}
                </p>
              )}
            </div>
          </div>

          {agency.description && (
            <p className="mt-8 max-w-2xl leading-relaxed text-ink">{agency.description}</p>
          )}

          <dl className="mt-8 grid grid-cols-3 gap-y-5 border-y border-border py-5">
            <div>
              <dt className="eyebrow">Annonces actives</dt>
              <dd className="display-lg mt-1 text-2xl">{agency.listings.length}</dd>
            </div>
            <div>
              <dt className="eyebrow">Ventes</dt>
              <dd className="display-lg mt-1 text-2xl">{saleCount}</dd>
            </div>
            <div>
              <dt className="eyebrow">Locations</dt>
              <dd className="display-lg mt-1 text-2xl">{rentCount}</dd>
            </div>
          </dl>
        </div>

        <aside className="rounded-md border border-border bg-surface p-6 md:sticky md:top-24 md:self-start">
          <p className="eyebrow">Contact</p>
          <h3 className="display-lg mt-2 text-xl">Parlez à l'équipe.</h3>

          <div className="mt-5 space-y-3 text-sm">
            {agency.phone && (
              <a href={`tel:${agency.phone.replace(/\s+/g, "")}`} className="flex items-center gap-3 rounded-full border border-border p-3 hover:bg-surface-warm">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-background">
                  <PhoneIcon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">Téléphone</span>
                  <span className="block font-medium">{agency.phone}</span>
                </span>
              </a>
            )}
            {agency.phone && (
              <a
                href={`https://wa.me/${agency.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-full border border-border p-3 hover:bg-surface-warm"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-success/10 text-success">
                  <WhatsAppIcon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">WhatsApp</span>
                  <span className="block font-medium">Envoyer un message</span>
                </span>
              </a>
            )}
            {agency.email && (
              <a href={`mailto:${agency.email}`} className="flex items-center gap-3 rounded-full border border-border p-3 hover:bg-surface-warm">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-border">@</span>
                <span className="min-w-0">
                  <span className="block mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">Email</span>
                  <span className="block truncate font-medium">{agency.email}</span>
                </span>
              </a>
            )}
          </div>

          <Button size="lg" className="mt-5 w-full">Envoyer un message</Button>
        </aside>
      </header>

      {/* Listings */}
      <section className="mt-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-4">
          <div>
            <p className="eyebrow">Portefeuille</p>
            <h2 className="display-xl mt-2 text-3xl md:text-4xl">Les annonces de {agency.name}.</h2>
          </div>
        </div>

        {agency.listings.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-10 text-center">
            <p className="eyebrow">Aucune annonce</p>
            <h3 className="display-lg mt-3 text-xl">Aucune annonce publiée pour l'instant.</h3>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {agency.listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
