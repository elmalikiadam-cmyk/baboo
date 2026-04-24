import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { TenantProfileForm } from "@/components/locataire/tenant-profile-form";
import { GuarantorsManager } from "@/components/locataire/guarantors-manager";
import { TenantDocsUploader } from "@/components/locataire/tenant-docs-uploader";

export const metadata: Metadata = {
  title: "Mon dossier locataire — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function TenantProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/locataire/dossier");

  const { next } = await searchParams;

  const profile = hasDb()
    ? await db.tenantProfile
        .findUnique({
          where: { userId: session.user.id },
          include: { guarantors: { orderBy: { createdAt: "asc" } } },
        })
        .catch(() => null)
    : null;

  // Documents uploadés du dossier (fiches de paie, avis imposition…)
  const tenantDocs =
    hasDb() && profile
      ? await db.documentVault
          .findMany({
            where: {
              userId: session.user.id,
              category: "TENANT_DOSSIER",
              relatedEntityId: profile.id,
              deletedAt: null,
            },
            orderBy: { uploadedAt: "desc" },
            select: {
              id: true,
              filename: true,
              mimeType: true,
              size: true,
              uploadedAt: true,
            },
          })
          .catch(() => [])
      : [];

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Accueil <span className="mx-2">·</span> Mon dossier
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Locataire · dossier de candidature</p>
        <h1 className="display-xl mt-2 text-4xl md:text-5xl">
          Votre CV habitation.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Remplissez une seule fois, réutilisable sur toutes vos
          candidatures. Plus votre dossier est complet, plus il rassure
          les bailleurs. Vous pourrez le modifier à tout moment.
        </p>
      </header>

      {next && (
        <div className="mt-6 rounded-2xl border border-terracotta/40 bg-terracotta/5 p-4">
          <p className="text-sm text-midnight">
            Complétez votre dossier pour pouvoir candidater à l'annonce.
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-10">
          <TenantProfileForm
            initial={
              profile
                ? {
                    employment: profile.employment,
                    employer: profile.employer,
                    position: profile.position,
                    monthlyIncome: profile.monthlyIncome,
                    contractStartDate: profile.contractStartDate,
                    contractEndDate: profile.contractEndDate,
                    householdSize: profile.householdSize,
                    hasChildren: profile.hasChildren,
                    smoker: profile.smoker,
                    hasPets: profile.hasPets,
                    targetCitySlug: profile.targetCitySlug,
                    maxBudget: profile.maxBudget,
                    moveInDate: profile.moveInDate,
                    bio: profile.bio,
                  }
                : null
            }
            redirectOnSuccess={next ?? null}
          />

          {profile?.completed && (
            <>
              <GuarantorsManager
                guarantors={profile.guarantors.map((g) => ({
                  id: g.id,
                  type: g.type,
                  fullName: g.fullName,
                  email: g.email,
                  phone: g.phone,
                  relationship: g.relationship,
                  monthlyIncome: g.monthlyIncome,
                  employment: g.employment,
                  employer: g.employer,
                }))}
              />

              <TenantDocsUploader
                docs={tenantDocs.map((d) => ({
                  id: d.id,
                  filename: d.filename,
                  mimeType: d.mimeType,
                  size: d.size,
                  uploadedAt: d.uploadedAt.toISOString(),
                }))}
              />
            </>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-midnight/10 bg-cream p-6">
            <p className="eyebrow">Statut</p>
            <p className="mt-3 display-md text-lg">
              {profile?.completed ? "✓ Dossier complet" : "○ Dossier à compléter"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {profile?.completed
                ? "Vous pouvez candidater aux annonces de location."
                : "Indiquez votre emploi et vos revenus pour activer les candidatures."}
            </p>
          </div>

          <div className="rounded-2xl bg-forest p-6 text-cream">
            <p className="eyebrow text-cream/60">Conseil</p>
            <p className="mt-2 text-sm">
              Un garant solide peut compenser un ratio revenus/loyer
              serré. Ajoutez-le dans la section dédiée une fois votre
              dossier complété.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
