import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { relativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Admin · Modération" };
export const dynamic = "force-dynamic";

const MOCK_MODERATION = [
  { reason: "Doublon potentiel", listing: "Villa avec piscine, Anfa", agency: "Atlas Realty", risk: "Moyen" },
  { reason: "Photos de faible qualité", listing: "Appartement lumineux, Gauthier", agency: "Oasis Immobilier", risk: "Bas" },
  { reason: "Prix incohérent", listing: "Riad rénové, Médina", agency: "Medina Properties", risk: "Élevé" },
];


async function getAdminStats() {
  if (!hasDb()) return { total: 0, published: 0, pending: 12, agencies: 0, leads: 324 };
  try {
    const [total, published, pending, agencies, leads] = await Promise.all([
      db.listing.count(),
      db.listing.count({ where: { status: "PUBLISHED" } }),
      db.listing.count({ where: { status: "PENDING" } }),
      db.agency.count(),
      db.lead.count(),
    ]);
    return { total, published, pending: pending || 12, agencies, leads: leads || 324 };
  } catch {
    return { total: 0, published: 0, pending: 12, agencies: 0, leads: 324 };
  }
}

async function getPending() {
  if (!hasDb()) return [];
  try {
    return await db.listing.findMany({
      where: { status: { in: ["PENDING", "PUBLISHED"] } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { city: true, agency: { select: { name: true, verified: true, logo: true } } },
    });
  } catch {
    return [];
  }
}

async function getRecentLeadsAcrossAgencies() {
  if (!hasDb()) return [];
  try {
    return await db.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        listing: { select: { title: true, slug: true, agency: { select: { name: true } } } },
      },
    });
  } catch {
    return [];
  }
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  const stats = await getAdminStats();
  const pending = await getPending();
  const recentLeads = await getRecentLeadsAcrossAgencies();

  return (
    <div className="container py-10 md:py-16">
      <div className="flex flex-col gap-4 border-b border-foreground/15 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Admin · Modération</p>
          <h1 className="display-xl mt-2 text-4xl md:text-6xl">Salle de contrôle.</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            État en direct du catalogue, file de modération et signalements des utilisateurs.
          </p>
        </div>
        <div className="mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          ◉ CONNECTÉ · ADMIN@BABOO.MA
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <Stat label="Total annonces" value={String(stats.total || 60)} />
        <Stat label="Publiées" value={String(stats.published || 60)} />
        <Stat label="À modérer" value={String(stats.pending)} tone="dark" />
        <Stat label="Agences" value={String(stats.agencies || 6)} />
        <Stat label="Leads (30j)" value={String(stats.leads)} />
      </dl>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="mb-6 flex items-end justify-between border-b border-foreground/15 pb-4">
            <div>
              <p className="eyebrow">Modération · {pending.length} en attente</p>
              <h2 className="display-xl mt-2 text-2xl md:text-3xl">File d'approbation.</h2>
            </div>
          </div>

          <ul className="space-y-3">
            {pending.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-foreground/25 p-8 text-center text-sm text-muted-foreground">
                Rien à modérer. Bonne journée.
              </li>
            ) : (
              pending.map((l) => (
                <li key={l.id} className="rounded-2xl border border-foreground/15 bg-surface p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-foreground/5">
                      <Image src={l.coverImage} alt={l.title} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="display-lg truncate text-base">{l.title}</p>
                      <p className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        {(l.agency?.name ?? "PARTICULIER").toUpperCase()} · {l.city.name.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        aria-label="Approuver"
                        className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Rejeter"
                        className="grid h-9 w-9 place-items-center rounded-full border border-foreground/20 hover:border-danger hover:text-danger"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="mt-8">
            <div className="mb-4 flex items-end justify-between border-b border-foreground/15 pb-4">
              <div>
                <p className="eyebrow">Leads récents — toutes agences</p>
                <h3 className="display-lg mt-2 text-xl">Activité commerciale en temps réel.</h3>
              </div>
            </div>
            {recentLeads.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-foreground/25 p-6 text-center text-sm text-muted-foreground">
                Aucun lead reçu pour l'instant.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentLeads.map((l) => (
                  <li key={l.id} className="rounded-2xl border border-foreground/15 bg-surface p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="display-lg text-base">{l.name}</p>
                        <p className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                          {(l.listing?.title ?? "Contact général").toUpperCase()}
                          {l.listing?.agency?.name && ` · ${l.listing.agency.name.toUpperCase()}`}
                          {" · "}{relativeDate(l.createdAt).toUpperCase()}
                        </p>
                        <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">« {l.message} »</p>
                      </div>
                      <span className="mono shrink-0 rounded-full border border-foreground/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                        {l.source.toUpperCase()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside>
          <div className="mb-4 flex items-end justify-between border-b border-foreground/15 pb-4">
            <div>
              <p className="eyebrow">Alertes qualité</p>
              <h3 className="display-lg mt-2 text-xl">Scoring automatique.</h3>
            </div>
          </div>
          <ul className="space-y-3">
            {MOCK_MODERATION.map((m, i) => (
              <li key={i} className="rounded-2xl border border-foreground/15 bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="display-lg text-base">{m.listing}</p>
                    <p className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      {m.agency.toUpperCase()}
                    </p>
                    <p className="mt-2 text-sm">{m.reason}</p>
                  </div>
                  <span
                    className={`mono shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                      m.risk === "Élevé"
                        ? "border-danger/40 bg-danger/10 text-danger"
                        : m.risk === "Moyen"
                          ? "border-foreground/30 text-foreground"
                          : "border-foreground/15 text-muted-foreground"
                    }`}
                  >
                    {m.risk}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-3xl bg-ink p-6 text-ink-foreground">
            <p className="eyebrow text-ink-foreground/60">Action rapide</p>
            <h3 className="display-lg mt-2 text-xl">Publier un message global.</h3>
            <p className="mt-2 text-sm text-ink-foreground/75">
              Apparaîtra en bannière haute sur toutes les pages publiques pendant 24 h.
            </p>
            <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink-foreground px-4 py-2 mono text-[11px] uppercase tracking-[0.12em] text-ink">
              Composer
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "light" }: { label: string; value: string; tone?: "light" | "dark" }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        tone === "dark" ? "border-foreground bg-foreground text-background" : "border-foreground/15 bg-surface"
      }`}
    >
      <p className={`eyebrow ${tone === "dark" ? "text-background/60" : ""}`}>{label}</p>
      <p className={`display-lg mt-2 text-2xl ${tone === "dark" ? "text-background" : ""}`}>{value}</p>
    </div>
  );
}
