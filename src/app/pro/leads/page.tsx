import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { LeadStatus } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { relativeDate } from "@/lib/format";
import { LeadStatusSelect } from "@/components/pro/lead-status-select";

export const metadata: Metadata = { title: "Leads · Baboo Pro" };
export const dynamic = "force-dynamic";

const STATUS_TABS: Array<{ value: "ALL" | LeadStatus; label: string }> = [
  { value: "ALL", label: "Tous" },
  { value: LeadStatus.NEW, label: "Nouveaux" },
  { value: LeadStatus.CONTACTED, label: "Contactés" },
  { value: LeadStatus.QUALIFIED, label: "Qualifiés" },
  { value: LeadStatus.VISIT_SCHEDULED, label: "Visites" },
  { value: LeadStatus.CLOSED, label: "Fermés" },
  { value: LeadStatus.LOST, label: "Perdus" },
];

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function LeadsInbox({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/pro/leads");
  const agencyId = session.user.agencyId;
  if (!agencyId) {
    return (
      <div className="container py-16">
        <div className="rounded-2xl border border-dashed border-foreground/25 p-10 text-center">
          <p className="eyebrow">Accès refusé</p>
          <h1 className="display-xl mt-3 text-2xl md:text-3xl">Cette page est réservée aux agences Pro.</h1>
          <Link
            href="/pro"
            className="mt-5 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            Découvrir Baboo Pro
          </Link>
        </div>
      </div>
    );
  }

  const { status } = await searchParams;
  const activeStatus = status && Object.values(LeadStatus).includes(status as LeadStatus) ? (status as LeadStatus) : "ALL";

  const where = {
    listing: { agencyId },
    ...(activeStatus !== "ALL" ? { status: activeStatus } : {}),
  };

  const leads = hasDb()
    ? await db.lead
        .findMany({
          where,
          orderBy: { createdAt: "desc" },
          include: { listing: { select: { title: true, slug: true } } },
        })
        .catch(() => [])
    : [];

  const counts = hasDb()
    ? await db.$transaction(
        Object.values(LeadStatus).map((s) =>
          db.lead.count({
            where: { listing: { agencyId }, status: s },
          }),
        ),
      ).catch(() => [] as number[])
    : ([] as number[]);
  const countByStatus: Partial<Record<LeadStatus, number>> = {};
  Object.values(LeadStatus).forEach((s, i) => {
    countByStatus[s] = counts[i] ?? 0;
  });
  const total = Object.values(countByStatus).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/pro/dashboard" className="hover:text-foreground">Tableau de bord</Link>
        <span className="mx-2">·</span>
        <span>Leads</span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-foreground/15 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{total} leads au total</p>
          <h1 className="display-xl mt-2 text-4xl md:text-6xl">Inbox.</h1>
        </div>
      </div>

      {/* Status tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => {
          const n = t.value === "ALL" ? total : countByStatus[t.value as LeadStatus] ?? 0;
          const href = t.value === "ALL" ? "/pro/leads" : `/pro/leads?status=${t.value}`;
          const isActive = activeStatus === t.value;
          return (
            <Link
              key={t.value}
              href={href}
              className={`mono rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition ${
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/20 text-foreground hover:border-foreground"
              }`}
            >
              {t.label} · {n}
            </Link>
          );
        })}
      </div>

      {leads.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-foreground/25 bg-paper-2/40 p-10 text-center">
          <p className="eyebrow">Aucun lead</p>
          <h2 className="display-xl mt-3 text-2xl">
            {activeStatus === "ALL"
              ? "Pas encore de leads."
              : "Rien dans cette catégorie."}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            {activeStatus === "ALL"
              ? "Les messages de contact sur vos annonces apparaîtront ici."
              : "Essayez un autre filtre ou revenez sur Tous."}
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {leads.map((l) => (
            <li key={l.id} className="rounded-2xl border border-foreground/15 bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-foreground text-background display-lg text-sm">
                    {l.name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="display-lg text-base leading-tight">{l.name}</p>
                    <p className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      {(l.listing?.title ?? "Contact général").toUpperCase()} · {relativeDate(l.createdAt).toUpperCase()}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <a href={`mailto:${l.email}`} className="hover:text-foreground">
                        {l.email}
                      </a>
                      {l.phone && (
                        <a href={`tel:${l.phone.replace(/\s+/g, "")}`} className="hover:text-foreground">
                          {l.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <LeadStatusSelect leadId={l.id} status={l.status} />
              </div>

              <p className="mt-4 border-t border-foreground/10 pt-4 text-sm text-foreground/85">
                « {l.message} »
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {l.listing?.slug && (
                  <Link
                    href={`/annonce/${l.listing.slug}`}
                    className="mono rounded-full border border-foreground/20 px-3 py-1 text-[10px] uppercase tracking-[0.12em] hover:border-foreground"
                  >
                    Voir l'annonce
                  </Link>
                )}
                <a
                  href={`mailto:${l.email}`}
                  className="mono rounded-full border border-foreground/20 px-3 py-1 text-[10px] uppercase tracking-[0.12em] hover:border-foreground"
                >
                  Répondre par email
                </a>
                {l.phone && (
                  <a
                    href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mono rounded-full border border-success/40 bg-success/10 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-success hover:bg-success/15"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
