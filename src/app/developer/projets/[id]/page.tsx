import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { ProjectForm } from "@/components/developer/project-form";
import { ProjectUnitsManager } from "@/components/developer/project-units-manager";
import { relativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Gérer le projet · Baboo Promoteur" };
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ManageProjectPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/connexion?callbackUrl=/developer/projets/${id}`);
  if (!session.user.developerId) redirect("/developer/dashboard");
  if (!hasDb()) notFound();

  const project = await db.project.findUnique({
    where: { id },
    include: {
      units: { orderBy: { price: "asc" } },
      leads: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!project || project.developerId !== session.user.developerId) notFound();

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <Link href="/developer/dashboard" className="hover:text-midnight">Tableau de bord</Link>
        <span className="mx-2">·</span>
        <Link href="/developer/projets" className="hover:text-midnight">Projets</Link>
        <span className="mx-2">·</span>
        <span>{project.name}</span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-cream-2">
            <Image src={project.cover} alt={project.name} fill sizes="112px" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">Projet</p>
            <h1 className="display-xl mt-1 text-3xl md:text-4xl">{project.name}</h1>
          </div>
        </div>
        <Link
          href={`/projets/${project.slug}`}
          className="mono rounded-full border border-border px-4 py-2 text-[10px] uppercase tracking-[0.12em] hover:border-midnight"
        >
          Voir la page publique →
        </Link>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <h2 className="display-lg text-xl">Informations</h2>
          <div className="mt-5">
            <ProjectForm
              editId={project.id}
              initial={{
                name: project.name,
                description: project.description,
                cover: project.cover,
                citySlug: project.citySlug,
                addressLine: project.addressLine ?? "",
                deliveryYear: project.deliveryYear ?? null,
                status: project.status,
              }}
            />
          </div>
        </section>

        <aside>
          <h2 className="display-lg text-xl">Lots ({project.units.length})</h2>
          <div className="mt-5">
            <ProjectUnitsManager projectId={project.id} units={project.units} />
          </div>

          <h2 className="display-lg mt-10 text-xl">Leads récents</h2>
          {project.leads.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-border p-5 text-center text-sm text-muted">
              Pas encore de demande de brochure.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {project.leads.map((l) => (
                <li key={l.id} className="rounded-md border border-border bg-cream p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{l.name}</p>
                      <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted">
                        {l.email} · {relativeDate(l.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted">« {l.message} »</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
