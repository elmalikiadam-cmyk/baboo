import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { signedUrlForPrivate } from "@/lib/storage";
import { TenantLeaseActions } from "@/components/locataire/tenant-lease-actions";
import { InventoryCta } from "@/components/inventory/inventory-cta";

export const metadata: Metadata = {
  title: "Mon bail — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "En préparation par le bailleur",
  GENERATED: "À télécharger et signer",
  SIGNED_UPLOADED: "Signature reçue",
  ACTIVE: "Actif",
  TERMINATED: "Résilié",
  EXPIRED: "Expiré",
};

export default async function TenantLeaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  if (!hasDb()) notFound();
  const { id } = await params;

  const lease = await db.lease.findUnique({
    where: { id },
    include: {
      landlordUser: { select: { name: true, email: true, phone: true } },
      generatedDoc: { select: { path: true, filename: true } },
      signedDoc: { select: { path: true, filename: true } },
      inventoryReports: { select: { id: true, type: true, status: true } },
    },
  });
  if (!lease) notFound();
  if (lease.tenantUserId !== session.user.id) {
    redirect("/locataire/baux");
  }

  const [generatedUrl, signedUrl] = await Promise.all([
    lease.generatedDoc
      ? signedUrlForPrivate(lease.generatedDoc.path, 600).catch(() => null)
      : null,
    lease.signedDoc
      ? signedUrlForPrivate(lease.signedDoc.path, 600).catch(() => null)
      : null,
  ]);

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/locataire/baux" className="hover:text-midnight">Mes baux</Link>
        <span className="mx-2">·</span>
        <span>{lease.id.slice(-8).toUpperCase()}</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Bail · {STATUS_LABEL[lease.status]}</p>
        <h1 className="display-xl mt-2 text-3xl md:text-4xl">
          {lease.propertyAddress}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {lease.propertyCity} · {lease.propertySurface} m² · Bailleur :{" "}
          {lease.landlordUser.name ?? lease.landlordUser.email}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section className="space-y-4 rounded-2xl border border-midnight/10 bg-cream p-6">
          <header>
            <p className="eyebrow">Termes du bail</p>
          </header>
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Loyer" value={`${lease.monthlyRent.toLocaleString("fr-FR")} MAD`} />
            <Field label="Charges" value={`${lease.monthlyCharges.toLocaleString("fr-FR")} MAD`} />
            <Field label="Caution" value={`${lease.depositAmount.toLocaleString("fr-FR")} MAD`} />
            <Field label="Paiement" value={`le ${lease.paymentDay} du mois`} />
            <Field
              label="Début"
              value={lease.startDate.toLocaleDateString("fr-FR")}
            />
            <Field
              label="Fin"
              value={
                lease.endDate
                  ? lease.endDate.toLocaleDateString("fr-FR")
                  : "Durée indéterminée"
              }
            />
          </dl>
          {lease.specialClauses && (
            <div className="mt-3 rounded-xl border border-midnight/5 bg-white p-4">
              <p className="eyebrow">Clauses particulières</p>
              <p className="mt-2 whitespace-pre-line text-sm text-midnight">
                {lease.specialClauses}
              </p>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <TenantLeaseActions
            leaseId={lease.id}
            status={lease.status}
            generatedUrl={generatedUrl}
            signedUrl={signedUrl}
            generatedFilename={lease.generatedDoc?.filename ?? null}
            signedFilename={lease.signedDoc?.filename ?? null}
          />

          <section className="space-y-2 rounded-2xl border border-midnight/10 bg-cream p-5">
            <p className="eyebrow">États des lieux</p>
            <InventoryCta
              leaseId={lease.id}
              type="ENTRY"
              existingReportId={
                lease.inventoryReports.find((r) => r.type === "ENTRY")?.id ?? null
              }
              existingStatus={
                lease.inventoryReports.find((r) => r.type === "ENTRY")?.status ?? null
              }
              label="EDL d'entrée"
              disabled={
                lease.status !== "SIGNED_UPLOADED" && lease.status !== "ACTIVE"
              }
              disabledReason="EDL d'entrée disponible une fois le bail signé"
            />
            <InventoryCta
              leaseId={lease.id}
              type="EXIT"
              existingReportId={
                lease.inventoryReports.find((r) => r.type === "EXIT")?.id ?? null
              }
              existingStatus={
                lease.inventoryReports.find((r) => r.type === "EXIT")?.status ?? null
              }
              label="EDL de sortie"
              disabled={lease.status !== "ACTIVE" && lease.status !== "TERMINATED"}
              disabledReason="EDL de sortie au départ du bail"
            />
          </section>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-midnight">{value}</dd>
    </div>
  );
}
