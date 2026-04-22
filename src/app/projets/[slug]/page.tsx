import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db, hasDb } from "@/lib/db";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPE_LABEL } from "@/data/taxonomy";
import { MapPinIcon, CheckIcon } from "@/components/ui/icons";
import { ProjectBrochureForm } from "@/components/listing/project-brochure-form";

const PRICE_FR = new Intl.NumberFormat("fr-FR");

const STATUS_LABEL: Record<string, string> = {
  PRE_LAUNCH: "Pré-commercialisation",
  SELLING: "En commercialisation",
  NEARLY_SOLD: "Bientôt vendu",
  DELIVERED: "Livré",
};

async function getProject(slug: string) {
  if (!hasDb()) return null;
  try {
    return await db.project.findUnique({
      where: { slug },
      include: {
        developer: true,
        units: { orderBy: { price: "asc" } },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return { title: "Projet introuvable" };
  const description = p.description.slice(0, 160).replace(/\s+\S*$/, "") + "…";
  return {
    title: p.name,
    description,
    alternates: { canonical: `/projets/${p.slug}` },
    openGraph: {
      title: p.name,
      description,
      type: "article",
      images: [p.cover],
    },
  };
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) notFound();

  const city = CITIES.find((c) => c.slug === p.citySlug);
  const minPrice = p.units.length ? Math.min(...p.units.map((u) => u.price)) : null;

  const highlights = [
    "Architecture contemporaine",
    "Matériaux premium",
    "Espaces communs aménagés",
    "Garantie décennale",
    "Parking inclus",
    "Syndic transparent",
  ];

  return (
    <div>
      <nav aria-label="Fil d'Ariane" className="container mt-6 mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <Link href="/" className="hover:text-midnight">Accueil</Link>
        <span className="mx-2">·</span>
        <Link href="/projets" className="hover:text-midnight">Projets</Link>
        <span className="mx-2">·</span>
        <span>{p.name}</span>
      </nav>

      <section className="container">
        <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-midnight/10 bg-cream-2 md:aspect-[21/9]">
          <Image src={p.cover} alt={p.name} fill priority sizes="100vw" className="object-cover" />
          <span className="absolute left-4 top-4 mono rounded-sm bg-cream/95 px-2.5 py-1 text-[10px] font-medium tracking-[0.14em]">
            ◉ {STATUS_LABEL[p.status]?.toUpperCase() ?? p.status}
          </span>
        </div>
      </section>

      <section className="container mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="eyebrow">{p.developer.name.toUpperCase()}</p>
          <h1 className="display-xl mt-2 text-4xl md:text-6xl">{p.name}</h1>
          <p className="mt-3 flex items-center gap-2 text-muted">
            <MapPinIcon className="h-4 w-4" />
            {p.addressLine ?? city?.name}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-y-5 border-y border-border py-6 sm:grid-cols-4">
            <div>
              <dt className="eyebrow">Livraison</dt>
              <dd className="display-lg mt-1 text-xl">{p.deliveryYear ?? "—"}</dd>
            </div>
            <div>
              <dt className="eyebrow">Typologies</dt>
              <dd className="display-lg mt-1 text-xl">{p.units.length}</dd>
            </div>
            <div>
              <dt className="eyebrow">À partir de</dt>
              <dd className="display-lg mt-1 text-xl">
                {minPrice ? `${PRICE_FR.format(minPrice)} MAD` : "—"}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Promoteur</dt>
              <dd className="display-lg mt-1 text-xl">{p.developer.verified ? "Vérifié" : "—"}</dd>
            </div>
          </dl>

          <div className="py-8">
            <h2 className="display-xl text-2xl md:text-3xl">Le programme.</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-midnight">{p.description}</p>
          </div>

          <div className="py-8">
            <h2 className="display-xl text-2xl md:text-3xl">Prestations.</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-sm">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-cream-2">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="py-8">
            <h2 className="display-xl text-2xl md:text-3xl">Typologies disponibles.</h2>
            <div className="mt-6 overflow-hidden rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream-2/60">
                  <tr>
                    <th className="eyebrow p-4">Référence</th>
                    <th className="eyebrow p-4">Type</th>
                    <th className="eyebrow p-4">Surface</th>
                    <th className="eyebrow p-4">Prix</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {p.units.map((u, i) => (
                    <tr key={u.id} className={i > 0 ? "border-t border-midnight/10" : ""}>
                      <td className="p-4 font-medium">{u.label}</td>
                      <td className="p-4 text-muted">
                        {PROPERTY_TYPE_LABEL[u.propertyType]}
                        {u.bedrooms != null && ` · ${u.bedrooms} ch.`}
                      </td>
                      <td className="p-4">{u.surface} m²</td>
                      <td className="p-4 display-lg text-lg">{PRICE_FR.format(u.price)} MAD</td>
                      <td className="p-4 text-right">
                        <button className="mono text-[10px] uppercase tracking-[0.14em] text-midnight hover:underline">
                          Détails →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <ProjectBrochureForm projectId={p.id} projectName={p.name} />
      </section>
    </div>
  );
}
