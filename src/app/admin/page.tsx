import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { relativeDate } from "@/lib/format";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { VerifyAgencyButton } from "@/components/admin/verify-agency-button";

export const metadata: Metadata = { title: "Admin · Modération" };
export const dynamic = "force-dynamic";

async function getAdminStats() {
  if (!hasDb()) return { total: 0, published: 0, pending: 0, agencies: 0, leads: 0 };
  try {
    const [total, published, pending, agencies, leads] = await Promise.all([
      db.listing.count(),
      db.listing.count({ where: { status: "PUBLISHED" } }),
      db.listing.count({ where: { status: "PENDING" } }),
      db.agency.count(),
      db.lead.count(),
    ]);
    return { total, published, pending, agencies, leads };
  } catch {
    return { total: 0, published: 0, pending: 0, agencies: 0, leads: 0 };
  }
}

async function getPending() {
  if (!hasDb()) return [];
  try {
    return await db.listing.findMany({
      where: { status: "PENDING" },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: { city: true, agency: { select: { name: true, verified: true, logo: true } } },
    });
  } catch {
    return [];
  }
}

async function getUnverifiedAgencies() {
  if (!hasDb()) return [];
  try {
    return await db.agency.findMany({
      where: { verified: false },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, slug: true, citySlug: true, createdAt: true },
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

  const [stats, pending, recentLeads, unverifiedAgencies] = await Promise.all([
    getAdminStats(),
    getPending(),
    getRecentLeadsAcrossAgencies(),
    getUnverifiedAgencies(),
  ]);

  return (
    <div className="container py-10 md:py-16">
      <div className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Admin · Modération</p>
          <h1 className="display-xl mt-2 text-4xl md:text-6xl">Salle de contrôle.</h1>
          <p className="mt-3 max-w-xl text-muted">
            État en direct du catalogue, file de modération et signalements des utilisateurs.
          </p>
        </div>
        <div className="mono text-[11px] uppercase tracking-[0.12em] text-muted">
          ◉ CONNECTÉ · {(session.user.email ?? "admin").toUpperCase()}
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <Stat label="Total annonces" value={String(stats.total)} />
        <Stat label="Publiées" value={String(stats.published)} />
        <Stat label="À modérer" value={String(stats.pending)} tone="dark" />
        <Stat label="Agences" value={String(stats.agencies)} />
        <Stat label="Leads" value={String(stats.leads)} />
      </dl>

      <nav
        aria-label="Raccourcis admin"
        className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-7"
      >
        <AdminShortcut href="/admin/metriques" label="Métriques" />
        <AdminShortcut href="/admin/agents" label="Agents visites" />
        <AdminShortcut href="/admin/visit-packs" label="Packs visites" />
        <AdminShortcut href="/admin/partners" label="Partenaires" />
        <AdminShortcut href="/admin/search-requests" label="Recherches" />
        <AdminShortcut href="/admin/kyc" label="KYC" />
        <AdminShortcut href="/admin/business" label="Business" />
      </nav>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
            <div>
              <p className="eyebrow">Modération · {pending.length} en attente</p>
              <h2 className="display-xl mt-2 text-2xl md:text-3xl">File d'approbation.</h2>
            </div>
          </div>

          <ul className="space-y-3">
            {pending.length === 0 ? (
              <li className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted">
                Rien à modérer. Bonne journée.
              </li>
            ) : (
              pending.map((l) => (
                <li key={l.id} className="rounded-md border border-border bg-cream p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-cream-2">
                      <Image src={l.coverImage} alt={l.title} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="display-lg truncate text-base">{l.title}</p>
                      <p className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-muted">
                        {(l.agency?.name ?? "PARTICULIER").toUpperCase()} · {l.city.name.toUpperCase()}
                      </p>
                    </div>
                    <ModerationActions listingId={l.id} />
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="mt-8">
            <div className="mb-4 flex items-end justify-between border-b border-border pb-4">
              <div>
                <p className="eyebrow">Leads récents — toutes agences</p>
                <h3 className="display-lg mt-2 text-xl">Activité commerciale en temps réel.</h3>
              </div>
            </div>
            {recentLeads.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
                Aucun lead reçu pour l'instant.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentLeads.map((l) => (
                  <li key={l.id} className="rounded-md border border-border bg-cream p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="display-lg text-base">{l.name}</p>
                        <p className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-muted">
                          {(l.listing?.title ?? "Contact général").toUpperCase()}
                          {l.listing?.agency?.name && ` · ${l.listing.agency.name.toUpperCase()}`}
                          {" · "}{relativeDate(l.createdAt).toUpperCase()}
                        </p>
                        <p className="mt-2 line-clamp-1 text-xs text-muted">« {l.message} »</p>
                      </div>
                      <span className="mono shrink-0 rounded-full border border-border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-muted">
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
          <div className="mb-4 flex items-end justify-between border-b border-border pb-4">
            <div>
              <p className="eyebrow">Agences à vérifier</p>
              <h3 className="display-lg mt-2 text-xl">{unverifiedAgencies.length} en attente.</h3>
            </div>
          </div>
          {unverifiedAgencies.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
              Toutes les agences sont vérifiées.
            </p>
          ) : (
            <ul className="space-y-3">
              {unverifiedAgencies.map((a) => (
                <li key={a.id} className="rounded-md border border-border bg-cream p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="display-lg text-base">{a.name}</p>
                      <p className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-muted">
                        /{a.slug} {a.citySlug ? ` · ${a.citySlug}` : ""}
                      </p>
                    </div>
                    <VerifyAgencyButton agencyId={a.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

function AdminShortcut({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-midnight/10 bg-cream p-4 transition-colors hover:border-terracotta hover:bg-terracotta/5"
    >
      <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground group-hover:text-terracotta">
        Espace
      </p>
      <p className="display-md mt-1.5 text-sm text-midnight">{label}</p>
    </Link>
  );
}

function Stat({ label, value, tone = "light" }: { label: string; value: string; tone?: "light" | "dark" }) {
  return (
    <div
      className={`rounded-md border p-4 ${
        tone === "dark" ? "border-midnight bg-midnight text-cream" : "border-border bg-cream"
      }`}
    >
      <p className={`eyebrow ${tone === "dark" ? "text-cream/60" : ""}`}>{label}</p>
      <p className={`display-lg mt-2 text-2xl ${tone === "dark" ? "text-cream" : ""}`}>{value}</p>
    </div>
  );
}
