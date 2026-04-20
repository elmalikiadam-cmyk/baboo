import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  CheckIcon,
  PhoneIcon,
  WhatsAppIcon,
  HeartIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";
import { PROPERTY_TYPE_LABEL } from "@/data/taxonomy";

export const metadata: Metadata = { title: "Tableau de bord · Baboo Pro" };

const PRICE_FR = new Intl.NumberFormat("fr-FR");

const MOCK_LEADS = [
  { name: "Youssef El Amrani", listing: "Villa avec piscine, Anfa", source: "form" as const, date: "Il y a 2 h", status: "Nouveau", message: "Bonjour, je suis intéressé par une visite ce week-end si possible." },
  { name: "Sarah Chakir", listing: "Appartement lumineux, Gauthier", source: "whatsapp" as const, date: "Il y a 5 h", status: "Contacté", message: "Possibilité de négocier le prix ?" },
  { name: "Karim Bennis", listing: "Villa contemporaine, Souissi", source: "call" as const, date: "Hier", status: "Visite programmée", message: "Rendez-vous pris samedi 14h." },
  { name: "Nadia Lahlou", listing: "Riad rénové, Médina", source: "form" as const, date: "Il y a 2 j", status: "Qualifié", message: "Dossier financier à jour. Sérieuse." },
  { name: "Omar Tazi", listing: "Duplex vue mer, Malabata", source: "whatsapp" as const, date: "Il y a 3 j", status: "En attente", message: "—" },
];

const STATUS_STYLE: Record<string, string> = {
  "Nouveau": "border-foreground bg-foreground text-background",
  "Contacté": "border-foreground/20 text-foreground",
  "Qualifié": "border-foreground/40 text-foreground",
  "Visite programmée": "border-success/40 bg-success/10 text-success",
  "En attente": "border-foreground/15 text-muted-foreground",
};

const SOURCE_ICON = {
  form: "FORM",
  whatsapp: "WA",
  call: "TEL",
};

async function getProData() {
  try {
    const agency = await db.agency.findFirst({
      where: { slug: "atlas-realty" },
      include: {
        listings: {
          where: { status: { in: ["PUBLISHED", "DRAFT", "PENDING"] } },
          orderBy: { updatedAt: "desc" },
          take: 8,
          include: {
            city: true,
            neighborhood: true,
            _count: { select: { favorites: true, leads: true } },
          },
        },
      },
    });
    return agency;
  } catch {
    return null;
  }
}

export default async function ProDashboard() {
  const agency = await getProData();

  // Aggregate numbers (hard-coded fallbacks for DB-less preview).
  const totalListings = agency?.listings.length ?? 0;
  const totalViews = 12_483;
  const totalLeads = MOCK_LEADS.length + 11;
  const conversionRate = 4.8;

  return (
    <div className="container py-10 md:py-16">
      <div className="flex flex-col gap-6 border-b border-foreground/15 pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Baboo Pro · {agency?.name ?? "Atlas Realty"}</p>
          <h1 className="display-xl mt-2 text-4xl md:text-6xl">Tableau de bord.</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Aperçu des 30 derniers jours. Performance, leads, état du portefeuille.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/pro/publier">
            <Button>
              <PlusIcon className="h-4 w-4" /> Nouvelle annonce
            </Button>
          </Link>
          <Button variant="outline" size="md">Exporter</Button>
        </div>
      </div>

      {/* Stats grid */}
      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Annonces actives" value={String(totalListings || 14)} delta="+2" />
        <StatCard label="Vues (30j)" value={PRICE_FR.format(totalViews)} delta="+18%" />
        <StatCard label="Leads (30j)" value={String(totalLeads)} delta="+5" tone="dark" />
        <StatCard label="Taux conv." value={`${conversionRate}%`} delta="+0.4pt" />
      </dl>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Leads feed */}
        <section>
          <div className="mb-6 flex items-end justify-between border-b border-foreground/15 pb-4">
            <div>
              <p className="eyebrow">Inbox</p>
              <h2 className="display-xl mt-2 text-2xl md:text-3xl">Leads récents.</h2>
            </div>
            <Link href="/pro/leads" className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
              Tous les leads →
            </Link>
          </div>

          <ul className="space-y-3">
            {MOCK_LEADS.map((l, i) => (
              <li key={i} className="group rounded-2xl border border-foreground/15 bg-surface p-5 transition-colors hover:border-foreground/40">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background display-lg text-sm">
                      {l.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                    <div className="min-w-0">
                      <p className="display-lg text-base leading-tight">{l.name}</p>
                      <p className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        {l.listing} · {l.date.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`mono rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] ${STATUS_STYLE[l.status]}`}>
                      {l.status}
                    </span>
                    <span className="mono rounded-full border border-foreground/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                      {SOURCE_ICON[l.source]}
                    </span>
                  </div>
                </div>

                {l.message !== "—" && (
                  <p className="mt-3 line-clamp-2 border-t border-foreground/10 pt-3 text-sm text-foreground/85">
                    « {l.message} »
                  </p>
                )}

                <div className="mt-3 flex gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] hover:border-foreground">
                    <PhoneIcon className="h-3 w-3" /> Appeler
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] hover:border-foreground">
                    <WhatsAppIcon className="h-3 w-3" /> WhatsApp
                  </button>
                  <button className="mono ml-auto text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
                    Voir le fil →
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* My listings column */}
        <section>
          <div className="mb-6 flex items-end justify-between border-b border-foreground/15 pb-4">
            <div>
              <p className="eyebrow">Portefeuille</p>
              <h2 className="display-xl mt-2 text-2xl md:text-3xl">Mes annonces.</h2>
            </div>
            <Link href="/pro/listings" className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
              Gérer →
            </Link>
          </div>

          <ul className="space-y-3">
            {(agency?.listings ?? []).slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center gap-3 rounded-2xl border border-foreground/15 bg-surface p-3">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-foreground/5">
                  <Image src={l.coverImage} alt={l.title} fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="display-lg truncate text-sm leading-tight">{l.title}</p>
                  <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {PROPERTY_TYPE_LABEL[l.propertyType].toUpperCase()} · {l.city.name.toUpperCase()}
                  </p>
                  <div className="mono mt-1 flex gap-3 text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <HeartIcon className="h-3 w-3" /> {l._count.favorites}
                    </span>
                    <span>{l._count.leads} lead{l._count.leads > 1 ? "s" : ""}</span>
                  </div>
                </div>
                <Link href={`/annonce/${l.slug}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-foreground/15">
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </li>
            ))}
            {(!agency || agency.listings.length === 0) && (
              <li className="rounded-2xl border border-dashed border-foreground/25 p-6 text-center text-sm text-muted-foreground">
                Aucune annonce publiée. <Link href="/pro/publier" className="font-medium text-foreground underline-offset-4 hover:underline">Déposer la première</Link>.
              </li>
            )}
          </ul>

          {/* Pro tip card */}
          <div className="mt-8 rounded-3xl bg-ink p-6 text-ink-foreground">
            <p className="eyebrow text-ink-foreground/60">Astuce du jour</p>
            <h3 className="display-lg mt-2 text-xl">Mettez en avant vos meilleures annonces.</h3>
            <p className="mt-3 text-sm text-ink-foreground/75">
              Les annonces mises en avant reçoivent en moyenne <strong className="font-semibold">3×</strong> plus de leads qualifiés.
            </p>
            <button className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink-foreground px-4 py-2 mono text-[11px] uppercase tracking-[0.12em] text-ink">
              <CheckIcon className="h-3.5 w-3.5" /> Activer
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, tone = "light" }: { label: string; value: string; delta: string; tone?: "light" | "dark" }) {
  const isPositive = delta.startsWith("+");
  return (
    <div
      className={`rounded-2xl border p-5 ${
        tone === "dark" ? "border-foreground bg-foreground text-background" : "border-foreground/15 bg-surface"
      }`}
    >
      <p className={`eyebrow ${tone === "dark" ? "text-background/60" : ""}`}>{label}</p>
      <div className="mt-3 flex items-end justify-between">
        <p className={`display-lg text-3xl ${tone === "dark" ? "text-background" : ""}`}>{value}</p>
        <span className={`mono text-[11px] uppercase tracking-[0.1em] ${
          tone === "dark" ? "text-background/80" : isPositive ? "text-success" : "text-danger"
        }`}>
          {delta}
        </span>
      </div>
    </div>
  );
}
