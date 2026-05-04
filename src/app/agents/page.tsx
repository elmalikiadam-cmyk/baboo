import type { Metadata } from "next";
import Link from "next/link";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Nos agents — Baboo",
  description:
    "Les agents Baboo accompagnent les visites de votre bien : ils filtrent les candidats, vérifient les pièces et vous transmettent un rapport détaillé.",
  alternates: { canonical: "/agents" },
};
export const revalidate = 3600;

/**
 * Showcase public des agents Baboo. Pas de PII (email, téléphone),
 * uniquement prénom, ville couverte, spécialité, années d'activité,
 * note. Sert de trust-building avant l'achat d'un pack.
 */
export default async function AgentsShowcasePage() {
  const agents = hasDb()
    ? await db.visitAgentProfile
        .findMany({
          where: { status: "ACTIVE" },
          orderBy: [
            { avgRating: "desc" },
            { completedVisits: "desc" },
          ],
          take: 24,
          include: {
            user: { select: { name: true } },
          },
        })
        .catch(() => [])
    : [];

  return (
    <div className="container py-10 md:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="eyebrow inline-block border-b border-midnight/20 pb-1">
          L'équipe terrain Baboo
        </p>
        <h1 className="display-hero mt-6 text-midnight">
          Nos <span className="text-terracotta">agents</span> de visite.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Quand vous activez un pack visites, c'est l'un d'eux qui se
          déplace. Sélection rigoureuse, formation Baboo, retour
          structuré dans l'heure qui suit chaque visite.
        </p>
      </header>

      {agents.length === 0 ? (
        <p className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-midnight/20 p-8 text-center text-sm text-muted-foreground">
          Notre réseau est en cours de constitution dans cette région.
          Les premières missions seront prises en charge par notre
          équipe centrale.
        </p>
      ) : (
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => {
            const firstName =
              a.user.name?.split(" ")[0] ?? "Agent Baboo";
            return (
              <li
                key={a.id}
                className="flex flex-col rounded-2xl border border-midnight/10 bg-cream p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-midnight text-cream">
                    <span className="mono text-sm font-semibold">
                      {firstName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="display-md text-base">{firstName}</p>
                    <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {a.speciality === "BOTH"
                        ? "Location & vente"
                        : a.speciality === "LOCATION"
                        ? "Location"
                        : "Vente"}
                    </p>
                  </div>
                </div>
                <p className="mono mt-4 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {a.cityCoverage.join(", ") || "—"}
                </p>
                <div className="mt-4 flex items-center gap-3 border-t border-midnight/10 pt-3 text-xs text-midnight">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`h-2 w-2 rounded-full ${
                          n <= Math.round(a.avgRating ?? 0)
                            ? "bg-terracotta"
                            : "bg-midnight/10"
                        }`}
                      />
                    ))}
                    {a.avgRating != null && (
                      <span className="ml-1 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {a.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {a.completedVisits} visite{a.completedVisits > 1 ? "s" : ""}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section className="mt-16 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-midnight/10 bg-cream p-6 md:p-8">
          <p className="eyebrow">Bailleur</p>
          <h2 className="display-md mt-3 text-xl">
            Activer un pack visites.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Vous publiez votre annonce, vous choisissez un pack adapté,
            nos agents prennent le relais sur les visites.
          </p>
          <Link
            href="/publier"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-terracotta px-5 text-sm font-semibold text-cream hover:bg-terracotta-2"
          >
            Publier mon bien →
          </Link>
        </div>
        <div className="rounded-2xl border border-forest/30 bg-forest/5 p-6 md:p-8">
          <p className="eyebrow text-forest">Vous voulez devenir agent Baboo ?</p>
          <h2 className="display-md mt-3 text-xl">Rejoignez le réseau.</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Travailleurs indépendants, agents commerciaux. Mission par
            mission, rémunération claire, formation Baboo.
          </p>
          <Link
            href="/agent/rejoindre"
            className="mt-5 inline-flex h-11 items-center rounded-full border-2 border-forest px-5 text-sm font-semibold text-forest hover:bg-forest hover:text-cream"
          >
            Voir comment postuler →
          </Link>
        </div>
      </section>
    </div>
  );
}
