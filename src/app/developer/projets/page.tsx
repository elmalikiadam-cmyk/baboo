import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { PlusIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Mes projets · Baboo Promoteur" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PRE_LAUNCH: "Pré-lancement",
  SELLING: "En commercialisation",
  NEARLY_SOLD: "Presque vendu",
  DELIVERED: "Livré",
};

export default async function DeveloperProjects() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/developer/projets");
  if (!session.user.developerId) redirect("/developer/dashboard");

  const projects = hasDb()
    ? await db.project.findMany({
        where: { developerId: session.user.developerId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { units: true, leads: true } } },
      })
    : [];

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        <Link href="/developer/dashboard" className="hover:text-ink">Tableau de bord</Link>
        <span className="mx-2">·</span>
        <span>Projets</span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{projects.length} projet{projects.length > 1 ? "s" : ""}</p>
          <h1 className="display-xl mt-2 text-4xl md:text-5xl">Mes projets.</h1>
        </div>
        <Link
          href="/developer/projets/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background"
        >
          <PlusIcon className="h-4 w-4" /> Nouveau projet
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-12 rounded-md border border-dashed border-border p-10 text-center text-sm text-ink-muted">
          Aucun projet. <Link href="/developer/projets/nouveau" className="font-medium text-ink underline-offset-4 hover:underline">Créer le premier</Link>.
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center gap-4 rounded-md border border-border bg-surface p-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-surface-warm">
                <Image src={p.cover} alt={p.name} fill sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="display-lg truncate text-base">{p.name}</p>
                <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                  {STATUS_LABEL[p.status]} · {p._count.units} lot{p._count.units > 1 ? "s" : ""} · {p._count.leads} lead{p._count.leads > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/projets/${p.slug}`}
                  className="mono rounded-full border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] hover:border-ink"
                >
                  Voir
                </Link>
                <Link
                  href={`/developer/projets/${p.id}`}
                  className="mono rounded-full bg-ink px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-background hover:bg-ink/90"
                >
                  Gérer
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
