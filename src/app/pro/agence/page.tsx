import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { AgencyForm } from "@/components/pro/agency-form";

export const metadata: Metadata = { title: "Profil agence · Baboo Pro" };
export const dynamic = "force-dynamic";

export default async function ProAgencyPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/pro/agence");
  if (!session.user.agencyId) redirect("/pro");

  const agency = hasDb()
    ? await db.agency.findUnique({
        where: { id: session.user.agencyId },
      })
    : null;

  if (!agency) redirect("/pro");

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/pro/dashboard" className="hover:text-foreground">Tableau de bord</Link>
        <span className="mx-2">·</span>
        <span>Profil agence</span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-foreground/15 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Baboo Pro · {agency.name}</p>
          <h1 className="display-xl mt-2 text-4xl md:text-5xl">Profil agence.</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Ces informations s'affichent sur votre page publique <span className="mono">/agence/{agency.slug}</span>.
          </p>
        </div>
        <Link
          href={`/agence/${agency.slug}`}
          className="mono rounded-full border border-foreground/20 px-4 py-2 text-[10px] uppercase tracking-[0.12em] hover:border-foreground"
        >
          Voir la page publique →
        </Link>
      </div>

      <div className="mt-10 max-w-3xl">
        <AgencyForm
          initial={{
            name: agency.name,
            tagline: agency.tagline ?? "",
            description: agency.description ?? "",
            logo: agency.logo ?? "",
            cover: agency.cover ?? "",
            phone: agency.phone ?? "",
            email: agency.email ?? "",
            website: agency.website ?? "",
            citySlug: agency.citySlug ?? "",
          }}
          verified={agency.verified}
        />
      </div>
    </div>
  );
}
