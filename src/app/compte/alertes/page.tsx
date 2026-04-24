import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { SavedSearchRow } from "@/components/account/saved-search-row";

export const metadata: Metadata = {
  title: "Mes alertes — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const FREQUENCY_LABEL: Record<string, string> = {
  instant: "Instantané (15 min)",
  daily: "Quotidien (08h)",
  weekly: "Hebdomadaire (lundi)",
};

export default async function AlertesPage({
  searchParams,
}: {
  searchParams: Promise<{ pause?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/compte/alertes");
  const { pause } = await searchParams;

  // Support du lien « pause » envoyé dans les emails
  if (pause && hasDb()) {
    try {
      await db.savedSearch.updateMany({
        where: { id: pause, userId: session.user.id },
        data: { paused: true },
      });
    } catch {
      /* silencieux */
    }
  }

  const searches = hasDb()
    ? await db.savedSearch.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/compte" className="hover:text-midnight">Mon compte</Link>
        <span className="mx-2">·</span>
        <span>Alertes</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Recherches sauvegardées</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Vos <span className="text-terracotta">alertes</span>.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Vous êtes averti(e) par email et dans vos notifications dès
          qu'une annonce correspond à vos critères. Instantané, quotidien ou
          hebdomadaire — votre choix.
        </p>
      </header>

      {searches.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center">
          <p className="display-md text-xl">Aucune alerte enregistrée.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Faites une recherche puis cliquez sur « Sauvegarder » en haut
            de la liste de résultats.
          </p>
          <Link
            href="/recherche"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-terracotta px-5 text-sm font-semibold text-cream hover:bg-terracotta-2"
          >
            Faire une recherche →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {searches.map((s) => (
            <SavedSearchRow
              key={s.id}
              id={s.id}
              name={s.name}
              query={s.query}
              frequency={s.frequency}
              frequencyLabel={FREQUENCY_LABEL[s.frequency] ?? s.frequency}
              lastRunAt={s.lastRunAt?.toISOString() ?? null}
              matchesCount={s.matchesCount}
              paused={s.paused}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
