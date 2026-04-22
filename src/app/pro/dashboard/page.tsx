import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  HeartIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";
import { PROPERTY_TYPE_LABEL } from "@/data/taxonomy";
import { relativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Tableau de bord · Baboo Pro" };
export const dynamic = "force-dynamic";

const PRICE_FR = new Intl.NumberFormat("fr-FR");

const STATUS_STYLE: Record<string, string> = {
  NEW: "border-ink bg-ink text-background",
  CONTACTED: "border-border text-ink",
  QUALIFIED: "border-ink text-ink",
  VISIT_SCHEDULED: "border-success/40 bg-success/10 text-success",
  CLOSED: "border-border text-ink-muted",
  LOST: "border-danger/30 bg-danger/10 text-danger",
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "Nouveau",
  CONTACTED: "Contacté",
  QUALIFIED: "Qualifié",
  VISIT_SCHEDULED: "Visite",
  CLOSED: "Fermé",
  LOST: "Perdu",
};

async function getAgencyData(agencyId: string) {
  if (!hasDb()) return null;
  try {
    const [agency, listings, leads, totals] = await Promise.all([
      db.agency.findUnique({ where: { id: agencyId } }),
      db.listing.findMany({
        where: { agencyId, status: { in: ["PUBLISHED", "DRAFT", "PENDING"] } },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
          city: true,
          _count: { select: { favorites: true, leads: true } },
        },
      }),
      db.lead.findMany({
        where: { listing: { agencyId } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          listing: { select: { title: true, slug: true } },
        },
      }),
      db.$transaction([
        db.listing.count({ where: { agencyId, status: "PUBLISHED" } }),
        db.lead.count({ where: { listing: { agencyId } } }),
        db.lead.count({
          where: {
            listing: { agencyId },
            createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
          },
        }),
        db.favorite.count({ where: { listing: { agencyId } } }),
      ]),
    ]);

    const [activeCount, totalLeads, leads30d, totalFavorites] = totals;
    return { agency, listings, leads, activeCount, totalLeads, leads30d, totalFavorites };
  } catch {
    return null;
  }
}

export default async function ProDashboard() {
  const session = await auth();

  // Pas connecté, ou compte non-agence : demo preview honnête + CTA.
  if (!session?.user || !session.user.agencyId) {
    return <DashboardDemo signedIn={!!session?.user} />;
  }

  const data = await getAgencyData(session.user.agencyId);
  if (!data?.agency) {
    return <DashboardDemo signedIn signedInName={session.user.name ?? session.user.email ?? ""} />;
  }

  const { agency, listings, leads, activeCount, totalLeads, leads30d, totalFavorites } = data;

  return (
    <div className="container py-10 md:py-16">
      <div className="flex flex-col gap-6 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Baboo Pro · {agency.name}</p>
          <h1 className="display-xl mt-2 text-4xl md:text-6xl">Tableau de bord.</h1>
          <p className="mt-3 max-w-xl text-ink-muted">
            Vos annonces, vos leads, les 30 derniers jours.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/pro/publier">
            <Button>
              <PlusIcon className="h-4 w-4" /> Nouvelle annonce
            </Button>
          </Link>
          <Link href="/pro/leads">
            <Button variant="outline">Tous les leads</Button>
          </Link>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Annonces actives" value={String(activeCount)} />
        <StatCard label="Leads (30j)" value={String(leads30d)} tone="dark" />
        <StatCard label="Leads total" value={String(totalLeads)} />
        <StatCard label="Favoris reçus" value={String(totalFavorites)} />
      </dl>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Leads feed */}
        <section>
          <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
            <div>
              <p className="eyebrow">Inbox</p>
              <h2 className="display-xl mt-2 text-2xl md:text-3xl">Leads récents.</h2>
            </div>
            <Link href="/pro/leads" className="mono text-[11px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink">
              Tous ({totalLeads}) →
            </Link>
          </div>

          {leads.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-ink-muted">
              Pas encore de leads. Vos prochaines demandes de contact apparaîtront ici.
            </div>
          ) : (
            <ul className="space-y-3">
              {leads.map((l) => (
                <li
                  key={l.id}
                  className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-ink"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-background display-lg text-sm">
                        {l.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="display-lg text-base leading-tight">{l.name}</p>
                        <p className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                          {(l.listing?.title ?? "—").toUpperCase()} · {relativeDate(l.createdAt).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`mono rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] ${
                          STATUS_STYLE[l.status] ?? STATUS_STYLE.NEW
                        }`}
                      >
                        {STATUS_LABEL[l.status] ?? l.status}
                      </span>
                      <span className="mono rounded-full border border-border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-ink-muted">
                        {l.source.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 border-t border-ink/10 pt-3 text-sm text-ink">
                    « {l.message} »
                  </p>

                  <div className="mt-3 flex gap-2">
                    <a
                      href={`mailto:${l.email}`}
                      className="mono inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.12em] hover:border-ink"
                    >
                      Répondre
                    </a>
                    {l.phone && (
                      <a
                        href={`tel:${l.phone.replace(/\s+/g, "")}`}
                        className="mono inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.12em] hover:border-ink"
                      >
                        Appeler
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Listings column */}
        <section>
          <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
            <div>
              <p className="eyebrow">Portefeuille</p>
              <h2 className="display-xl mt-2 text-2xl md:text-3xl">Mes annonces.</h2>
            </div>
            <Link
              href={`/agence/${agency.slug}`}
              className="mono text-[11px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
            >
              Page publique →
            </Link>
          </div>

          <ul className="space-y-3">
            {listings.length === 0 ? (
              <li className="rounded-md border border-dashed border-border p-6 text-center text-sm text-ink-muted">
                Aucune annonce publiée.{" "}
                <Link
                  href="/pro/publier"
                  className="font-medium text-ink underline-offset-4 hover:underline"
                >
                  Déposer la première
                </Link>
                .
              </li>
            ) : (
              listings.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-surface p-3"
                >
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-surface-warm">
                    <Image src={l.coverImage} alt={l.title} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="display-lg truncate text-sm leading-tight">{l.title}</p>
                    <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                      {PROPERTY_TYPE_LABEL[l.propertyType].toUpperCase()} · {l.city.name.toUpperCase()} · {PRICE_FR.format(l.price)} MAD
                    </p>
                    <div className="mono mt-1 flex gap-3 text-[10px] text-ink-muted">
                      <span className="inline-flex items-center gap-1">
                        <HeartIcon className="h-3 w-3" /> {l._count.favorites}
                      </span>
                      <span>
                        {l._count.leads} lead{l._count.leads > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/annonce/${l.slug}`}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function DashboardDemo({ signedIn, signedInName }: { signedIn: boolean; signedInName?: string }) {
  return (
    <div className="container py-10 md:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-md border border-ink bg-ink px-5 py-4 text-background">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-background/60">
            {signedIn ? "Aperçu — aucun compte agence rattaché" : "Aperçu — non connecté"}
          </p>
          <p className="mt-1 text-sm">
            {signedIn
              ? `Bonjour ${signedInName}, ce compte n'est pas encore lié à une agence Baboo Pro.`
              : "Cette page illustre ce que voit une agence connectée. Créez un compte Pro pour y accéder."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/inscription?role=agency"
            className="mono rounded-full bg-background px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-ink"
          >
            {signedIn ? "Contacter Baboo →" : "Créer un compte Pro →"}
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-b border-border pb-8">
        <p className="eyebrow">Baboo Pro</p>
        <h1 className="display-xl text-4xl md:text-6xl">Tableau de bord.</h1>
        <p className="max-w-xl text-ink-muted">
          Une fois connectée avec un compte Pro lié à votre agence, cette page affiche vos vrais leads, annonces et statistiques.
        </p>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 opacity-60">
        <StatCard label="Annonces actives" value="—" />
        <StatCard label="Leads (30j)" value="—" tone="dark" />
        <StatCard label="Leads total" value="—" />
        <StatCard label="Favoris reçus" value="—" />
      </dl>

      <div className="mt-14">
        <Link href="/pro" className="pill-soft">Tout savoir sur Baboo Pro →</Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "light",
}: {
  label: string;
  value: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={`rounded-md border p-5 ${
        tone === "dark"
          ? "border-ink bg-ink text-background"
          : "border-border bg-surface"
      }`}
    >
      <p className={`eyebrow ${tone === "dark" ? "text-background/60" : ""}`}>{label}</p>
      <p className={`display-lg mt-2 text-3xl ${tone === "dark" ? "text-background" : ""}`}>
        {value}
      </p>
    </div>
  );
}
