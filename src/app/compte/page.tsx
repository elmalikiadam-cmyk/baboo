import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ListingCard } from "@/components/listing/listing-card";
import { Button } from "@/components/ui/button";
import { HeartIcon, SearchIcon, CheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Mon compte" };

// Dummy user for the demo view. Real auth lands in Phase B.
const MOCK_USER = {
  name: "Sofia Bennani",
  email: "sofia.bennani@example.ma",
  avatar: "SB",
  memberSince: "Avril 2026",
};

const MOCK_SAVED_SEARCHES = [
  { id: "s1", label: "Appartements à Gauthier · 3+ ch · ≤ 3,5 M MAD", frequency: "Quotidienne", newMatches: 3 },
  { id: "s2", label: "Villas avec piscine à Marrakech · ≤ 8 M MAD", frequency: "Hebdomadaire", newMatches: 0 },
  { id: "s3", label: "Locations meublées à Rabat Agdal · ≤ 12 000 MAD", frequency: "Instantanée", newMatches: 7 },
];

const MOCK_CONTACT_HISTORY = [
  { listing: "Villa avec piscine, Anfa", agency: "Atlas Realty", date: "Il y a 2 jours", status: "Réponse reçue" },
  { listing: "Appartement lumineux, Gauthier", agency: "Oasis Immobilier", date: "Il y a 5 jours", status: "En attente" },
  { listing: "Riad au cœur de la médina, Marrakech", agency: "Medina Properties", date: "La semaine dernière", status: "Visite programmée" },
];

async function getRecent() {
  try {
    return await db.listing.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 4,
      include: {
        city: true,
        neighborhood: true,
        agency: { select: { id: true, slug: true, name: true, verified: true, logo: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function AccountPage() {
  const recent = await getRecent();

  return (
    <div className="container py-10 md:py-16">
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-foreground/15 pb-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-foreground text-background display-lg text-xl md:h-20 md:w-20 md:text-2xl">
            {MOCK_USER.avatar}
          </span>
          <div>
            <p className="eyebrow">Mon compte</p>
            <h1 className="display-xl mt-1 text-3xl md:text-5xl">Bonjour, {MOCK_USER.name.split(" ")[0]}.</h1>
            <p className="mono mt-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {MOCK_USER.email} · membre depuis {MOCK_USER.memberSince.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Modifier le profil</Button>
          <Button variant="ghost" size="sm">Déconnexion</Button>
        </div>
      </div>

      {/* Stats */}
      <dl className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
        <Stat label="Favoris" value="12" />
        <Stat label="Recherches sauvegardées" value={String(MOCK_SAVED_SEARCHES.length)} />
        <Stat label="Annonces contactées" value={String(MOCK_CONTACT_HISTORY.length)} />
        <Stat label="Visites programmées" value="1" />
      </dl>

      {/* Quick links */}
      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between border-b border-foreground/15 pb-4">
          <div>
            <p className="eyebrow">Raccourcis</p>
            <h2 className="display-xl mt-2 text-2xl md:text-3xl">Accès rapide.</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <QuickLink href="/favoris" icon={<HeartIcon className="h-5 w-5" />} label="Mes favoris" subtitle="12 annonces sauvegardées" />
          <QuickLink href="/recherches" icon={<SearchIcon className="h-5 w-5" />} label="Mes alertes" subtitle="3 recherches actives" />
          <QuickLink href="/pro/publier" icon={<CheckIcon className="h-5 w-5" />} label="Publier" subtitle="Déposer une annonce" />
        </div>
      </section>

      {/* Saved searches */}
      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between border-b border-foreground/15 pb-4">
          <div>
            <p className="eyebrow">Alertes email</p>
            <h2 className="display-xl mt-2 text-2xl md:text-3xl">Recherches sauvegardées.</h2>
          </div>
          <Link href="/recherches" className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
            Tout voir →
          </Link>
        </div>
        <ul className="overflow-hidden rounded-3xl border border-foreground/15">
          {MOCK_SAVED_SEARCHES.map((s, i) => (
            <li
              key={s.id}
              className={`flex items-center gap-4 p-5 ${i > 0 ? "border-t border-foreground/10" : ""}`}
            >
              <span className="grid h-10 w-10 place-items-center rounded-full border border-foreground/20">
                <SearchIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="display-lg text-base leading-tight">{s.label}</p>
                <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Fréquence : {s.frequency}
                </p>
              </div>
              {s.newMatches > 0 && (
                <span className="hidden shrink-0 rounded-full bg-foreground px-2.5 py-1 mono text-[10px] text-background sm:inline-flex">
                  {s.newMatches} nouvelles
                </span>
              )}
              <button className="mono shrink-0 text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
                Voir →
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Contact history */}
      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between border-b border-foreground/15 pb-4">
          <p className="eyebrow">Messages récents</p>
        </div>
        <ul className="space-y-3">
          {MOCK_CONTACT_HISTORY.map((c, i) => (
            <li key={i} className="flex flex-wrap items-center gap-4 rounded-2xl border border-foreground/15 p-5">
              <div className="min-w-0 flex-1">
                <p className="display-lg text-base leading-tight">{c.listing}</p>
                <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {c.agency} · {c.date.toUpperCase()}
                </p>
              </div>
              <span className={`mono shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
                c.status === "Visite programmée"
                  ? "border-success/40 bg-success/10 text-success"
                  : c.status === "Réponse reçue"
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 text-foreground/80"
              }`}>
                {c.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Recently viewed */}
      {recent.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between border-b border-foreground/15 pb-4">
            <div>
              <p className="eyebrow">Inspiration</p>
              <h2 className="display-xl mt-2 text-2xl md:text-3xl">Parcourus récemment.</h2>
            </div>
          </div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-foreground/15 bg-surface p-5">
      <p className="eyebrow">{label}</p>
      <p className="display-lg mt-2 text-3xl">{value}</p>
    </div>
  );
}

function QuickLink({ href, icon, label, subtitle }: { href: string; icon: React.ReactNode; label: string; subtitle: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-foreground/15 bg-surface p-5 transition-colors hover:border-foreground/40"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="display-lg text-base">{label}</p>
        <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{subtitle}</p>
      </div>
      <span className="mono text-[10px] text-muted-foreground group-hover:text-foreground">→</span>
    </Link>
  );
}
