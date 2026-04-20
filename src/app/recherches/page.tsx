import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { SearchIcon, PlusIcon, CloseIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Mes alertes" };

const MOCK = [
  {
    id: "a1",
    title: "Appartements à Gauthier",
    criteria: "3+ ch · 90–140 m² · ≤ 3 500 000 MAD · Vente",
    frequency: "Quotidienne",
    active: true,
    matches: 3,
    lastSent: "Il y a 4 heures",
  },
  {
    id: "a2",
    title: "Villas à Marrakech",
    criteria: "Avec piscine · 4+ ch · ≤ 8 000 000 MAD · Vente",
    frequency: "Hebdomadaire",
    active: true,
    matches: 0,
    lastSent: "Il y a 3 jours",
  },
  {
    id: "a3",
    title: "Locations meublées Agdal",
    criteria: "Meublé · 2+ ch · ≤ 12 000 MAD/mois · Location",
    frequency: "Instantanée",
    active: true,
    matches: 7,
    lastSent: "Il y a 2 heures",
  },
  {
    id: "a4",
    title: "Riads médina Marrakech",
    criteria: "Rénové · ≤ 5 000 000 MAD · Vente",
    frequency: "Hebdomadaire",
    active: false,
    matches: 0,
    lastSent: "Pause",
  },
];

export default function SavedSearchesPage() {
  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/compte" className="hover:text-foreground">Mon compte</Link>
        <span className="mx-2">·</span>
        <span>Alertes</span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-foreground/15 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{MOCK.filter((m) => m.active).length} alertes actives</p>
          <h1 className="display-xl mt-2 text-4xl md:text-6xl">Mes alertes.</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Chaque alerte déclenche un email dès qu'une nouvelle annonce correspond à vos critères.
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4" /> Nouvelle alerte
        </Button>
      </div>

      <ul className="mt-10 space-y-4">
        {MOCK.map((m) => (
          <li
            key={m.id}
            className="rounded-3xl border border-foreground/15 bg-surface p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-foreground text-background">
                  <SearchIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="display-lg text-xl md:text-2xl">{m.title}</h2>
                  <p className="mono mt-1 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    {m.criteria}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`mono rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
                  m.active
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-foreground/20 text-muted-foreground"
                }`}>
                  {m.active ? "Active" : "En pause"}
                </span>
                {m.matches > 0 && (
                  <span className="mono inline-flex items-center rounded-full bg-foreground px-2.5 py-1 text-[10px] text-background">
                    {m.matches} nouvelle{m.matches > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-4 text-sm">
              <div className="mono flex gap-4 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <span>Fréquence : {m.frequency}</span>
                <span>·</span>
                <span>Dernier envoi : {m.lastSent}</span>
              </div>
              <div className="flex gap-2">
                <button className="mono rounded-full border border-foreground/20 px-3 py-1 text-[10px] uppercase tracking-[0.12em] hover:border-foreground">
                  Voir les résultats
                </button>
                <button className="mono rounded-full border border-foreground/20 px-3 py-1 text-[10px] uppercase tracking-[0.12em] hover:border-foreground">
                  Modifier
                </button>
                <button
                  aria-label="Supprimer"
                  className="grid h-7 w-7 place-items-center rounded-full border border-foreground/20 hover:border-danger hover:text-danger"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
