import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import {
  PartnerCreateForm,
  PartnerTopUpButton,
} from "@/components/admin/partner-forms";
import { CITIES } from "@/data/cities";

export const metadata: Metadata = {
  title: "Partenaires — Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/admin/partners");
  if (session.user.role !== "ADMIN") redirect("/");
  if (!hasDb()) return null;

  const partners = await db.partnerAgency.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { leadUnlocks: true } },
    },
  });

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
        <span>Partenaires</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Baboo Partners</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Agences externes.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Création manuelle des comptes partenaires. Ils se connectent
          avec l'email fourni et accèdent à /partners/inbox pour
          débloquer des leads (500 MAD/lead).
        </p>
      </header>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="display-md text-xl">Ajouter une agence</h2>
          <div className="mt-5">
            <PartnerCreateForm
              cities={CITIES.map((c) => ({ slug: c.slug, name: c.name }))}
            />
          </div>
        </div>

        <div>
          <h2 className="display-md text-xl">
            {partners.length} partenaire{partners.length > 1 ? "s" : ""}
          </h2>
          {partners.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-6 text-center text-sm text-muted-foreground">
              Aucune agence enregistrée.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {partners.map((p) => (
                <li
                  key={p.id}
                  className="rounded-2xl border border-midnight/10 bg-cream p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <p className="display-md text-base">{p.name}</p>
                      <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {p.contactEmail} · {p.contactPhone ?? "—"} ·{" "}
                        {p.citySlugs.join(", ")}
                      </p>
                    </div>
                    <span
                      className={`mono rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                        p.active
                          ? "bg-forest/15 text-forest"
                          : "bg-midnight/10 text-muted-foreground"
                      }`}
                    >
                      {p.active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <Stat
                      label="Solde"
                      value={`${p.creditBalance.toLocaleString("fr-FR")} MAD`}
                    />
                    <Stat
                      label="Dépensé total"
                      value={`${p.totalSpent.toLocaleString("fr-FR")} MAD`}
                    />
                    <Stat
                      label="Leads débloqués"
                      value={String(p._count.leadUnlocks)}
                    />
                  </div>
                  <div className="mt-4">
                    <PartnerTopUpButton partnerId={p.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="display-md mt-1 text-sm">{value}</p>
    </div>
  );
}
