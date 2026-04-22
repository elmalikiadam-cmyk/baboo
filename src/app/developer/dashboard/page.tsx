import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { PlusIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Tableau de bord · Baboo Promoteur" };
export const dynamic = "force-dynamic";

export default async function DeveloperDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/developer/dashboard");
  if (!session.user.developerId) {
    return (
      <div className="container py-16">
        <div className="rounded-md border border-dashed border-border p-10 text-center">
          <p className="eyebrow">Accès promoteur</p>
          <h1 className="display-xl mt-3 text-2xl md:text-3xl">
            Ce compte n'est pas rattaché à un promoteur.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Créez un compte promoteur pour accéder à ce tableau de bord.
          </p>
          <Link
            href="/inscription?role=developer"
            className="mt-6 inline-flex rounded-full bg-midnight px-5 py-2.5 text-sm font-medium text-cream"
          >
            Créer un compte promoteur
          </Link>
        </div>
      </div>
    );
  }

  const developerId = session.user.developerId;
  if (!hasDb()) return null;

  const [developer, projects, stats] = await Promise.all([
    db.developer.findUnique({ where: { id: developerId } }),
    db.project.findMany({
      where: { developerId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { _count: { select: { units: true, leads: true } } },
    }),
    db.$transaction([
      db.project.count({ where: { developerId } }),
      db.lead.count({ where: { project: { developerId } } }),
      db.lead.count({
        where: {
          project: { developerId },
          createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
        },
      }),
    ]),
  ]);
  if (!developer) redirect("/");
  const [totalProjects, totalLeads, leads30d] = stats;

  return (
    <div className="container py-10 md:py-16">
      <div className="flex flex-col gap-6 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Baboo Promoteur · {developer.name}</p>
          <h1 className="display-xl mt-2 text-4xl md:text-6xl">Tableau de bord.</h1>
          <p className="mt-3 max-w-xl text-muted">
            Vos programmes neufs, les demandes de brochure et visites.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/developer/projets/nouveau"
            className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-2.5 text-sm font-medium text-cream"
          >
            <PlusIcon className="h-4 w-4" /> Nouveau projet
          </Link>
          <Link
            href={`/projets`}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-midnight"
          >
            Voir la vitrine publique
          </Link>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label="Projets" value={String(totalProjects)} />
        <Stat label="Leads (30j)" value={String(leads30d)} tone="dark" />
        <Stat label="Leads total" value={String(totalLeads)} />
      </dl>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
          <div>
            <p className="eyebrow">Programmes</p>
            <h2 className="display-xl mt-2 text-2xl md:text-3xl">Mes projets.</h2>
          </div>
          <Link
            href="/developer/projets"
            className="mono text-[11px] uppercase tracking-[0.14em] text-muted hover:text-midnight"
          >
            Tous →
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted">
            Aucun projet pour l'instant.{" "}
            <Link
              href="/developer/projets/nouveau"
              className="font-medium text-midnight underline-offset-4 hover:underline"
            >
              Créer le premier
            </Link>
            .
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li
                key={p.id}
                className="overflow-hidden rounded-md border border-border bg-cream"
              >
                <Link href={`/developer/projets/${p.id}`}>
                  <div className="relative aspect-[16/9] bg-cream-2">
                    <Image src={p.cover} alt={p.name} fill sizes="400px" className="object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="display-lg text-base">{p.name}</p>
                    <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                      {p.status.replace("_", " ")} · {p._count.units} lot{p._count.units > 1 ? "s" : ""} · {p._count.leads} lead{p._count.leads > 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, tone = "light" }: { label: string; value: string; tone?: "light" | "dark" }) {
  return (
    <div
      className={`rounded-md border p-5 ${
        tone === "dark"
          ? "border-midnight bg-midnight text-cream"
          : "border-border bg-cream"
      }`}
    >
      <p className={`eyebrow ${tone === "dark" ? "text-cream/60" : ""}`}>{label}</p>
      <p className={`display-lg mt-2 text-3xl ${tone === "dark" ? "text-cream" : ""}`}>{value}</p>
    </div>
  );
}
