import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { AgentCreateForm, AgentEditForm } from "@/components/admin/agent-forms";
import { CITIES } from "@/data/cities";

export const metadata: Metadata = {
  title: "Agents Baboo — Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/admin/agents");
  if (session.user.role !== "ADMIN") redirect("/");
  if (!hasDb()) return null;

  const agents = await db.visitAgentProfile.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  const loads = await db.managedVisit.groupBy({
    by: ["agentUserId"],
    where: { status: { in: ["REQUESTED", "ASSIGNED", "CONFIRMED"] } },
    _count: { _all: true },
  });
  const loadByUser = new Map(
    loads.map((l) => [l.agentUserId, l._count._all]),
  );

  const cities = CITIES.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <div className="container py-10 md:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link href="/admin" className="hover:text-midnight">
          Admin
        </Link>
        <span className="mx-2">·</span>
        <span>Agents</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Réseau terrain Baboo</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Pool d'agents visites.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Les agents actifs reçoivent les missions via le dispatcher.
          Inactif = on conserve le profil mais on ne dispatche plus.
          Suspendu = blocage administratif.
        </p>
      </header>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="display-md text-xl">Ajouter un agent</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crée le compte utilisateur et lui octroie le rôle VISIT_AGENT.
            Invitation email optionnelle.
          </p>
          <div className="mt-5">
            <AgentCreateForm cities={cities} />
          </div>
        </div>

        <div>
          <h2 className="display-md text-xl">
            {agents.length} profil{agents.length > 1 ? "s" : ""}
          </h2>
          {agents.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-6 text-center text-sm text-muted-foreground">
              Aucun agent enregistré pour l'instant.
            </p>
          ) : (
            <ul className="mt-5 space-y-4">
              {agents.map((a) => (
                <li
                  key={a.id}
                  className="rounded-2xl border border-midnight/10 bg-cream p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <p className="display-md text-base">
                        {a.user.name ?? a.user.email}
                      </p>
                      <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {a.user.email} · {a.user.phone ?? "—"}
                      </p>
                    </div>
                    <span
                      className={`mono rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                        a.status === "ACTIVE"
                          ? "bg-forest/15 text-forest"
                          : a.status === "SUSPENDED"
                          ? "bg-danger/15 text-danger"
                          : "bg-midnight/10 text-muted-foreground"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Spécialité : {a.speciality} · Villes :{" "}
                    {a.cityCoverage.join(", ") || "—"}
                  </p>
                  <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {a.completedVisits} visites complétées · charge actuelle :{" "}
                    {loadByUser.get(a.user.id) ?? 0} mission
                    {(loadByUser.get(a.user.id) ?? 0) > 1 ? "s" : ""}
                    {a.avgRating != null &&
                      ` · note ${a.avgRating.toFixed(1)}/5`}
                  </p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-semibold text-midnight">
                      Modifier
                    </summary>
                    <div className="mt-3">
                      <AgentEditForm
                        profileId={a.id}
                        initialSpeciality={a.speciality}
                        initialCities={a.cityCoverage}
                        initialStatus={a.status}
                        cities={cities}
                      />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
