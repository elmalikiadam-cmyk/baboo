import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { signedUrlForPrivate } from "@/lib/storage";
import { LeaseEditForm } from "@/components/bailleur/lease-edit-form";
import { LeaseWorkflowActions } from "@/components/bailleur/lease-workflow-actions";
import { InventoryCta } from "@/components/inventory/inventory-cta";
import { RentLedger } from "@/components/rent/rent-ledger";
import { ensureRentPeriods } from "@/actions/rent";

export const metadata: Metadata = {
  title: "Bail — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  GENERATED: "PDF généré",
  SIGNED_UPLOADED: "Signature reçue",
  ACTIVE: "Actif",
  TERMINATED: "Résilié",
  EXPIRED: "Expiré",
};

export default async function LeaseDetailPage({
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
      tenantUser: { select: { name: true, email: true, phone: true } },
      landlordUser: { select: { name: true, email: true } },
      listing: {
        select: { id: true, slug: true, title: true, agencyId: true },
      },
      generatedDoc: { select: { path: true, filename: true } },
      signedDoc: { select: { path: true, filename: true } },
      inventoryReports: {
        select: { id: true, type: true, status: true },
      },
    },
  });
  if (!lease) notFound();

  const canManage =
    lease.landlordUserId === session.user.id ||
    (!!session.user.agencyId && lease.listing?.agencyId === session.user.agencyId);
  if (!canManage) redirect("/bailleur/baux");

  // Génère les RentPeriod manquantes (idempotent, silencieux si bail
  // pas encore ACTIVE).
  await ensureRentPeriods(lease.id).catch(() => void 0);

  const [generatedUrl, signedUrl, periods] = await Promise.all([
    lease.generatedDoc
      ? signedUrlForPrivate(lease.generatedDoc.path, 600).catch(() => null)
      : null,
    lease.signedDoc
      ? signedUrlForPrivate(lease.signedDoc.path, 600).catch(() => null)
      : null,
    db.rentPeriod.findMany({
      where: { leaseId: lease.id },
      orderBy: { periodStart: "asc" },
      include: {
        payments: {
          orderBy: { paidAt: "asc" },
          include: {
            declaredBy: { select: { name: true, email: true } },
          },
        },
        receiptDoc: { select: { path: true, filename: true } },
      },
    }),
  ]);

  // Signe les URLs des quittances en parallèle.
  const periodsWithUrls = await Promise.all(
    periods.map(async (p) => ({
      ...p,
      receiptUrl: p.receiptDoc
        ? await signedUrlForPrivate(p.receiptDoc.path, 600).catch(() => null)
        : null,
    })),
  );

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/bailleur/baux" className="hover:text-midnight">Baux</Link>
        <span className="mx-2">·</span>
        <span>{lease.id.slice(-8).toUpperCase()}</span>
      </nav>

      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="eyebrow">Bail · {STATUS_LABEL[lease.status]}</p>
          <h1 className="display-xl mt-2 text-3xl md:text-4xl">
            {lease.propertyAddress}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {lease.propertyCity} · {lease.propertySurface} m² · Locataire :{" "}
            {lease.tenantUser.name ?? lease.tenantUser.email}
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-8">
          {lease.status === "DRAFT" ? (
            <>
              <div className="rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5">
                <p className="eyebrow text-terracotta">À faire</p>
                <p className="mt-2 text-sm text-midnight">
                  Vérifiez les montants, la durée et les clauses
                  particulières avant de générer le PDF. Une fois
                  généré, le brouillon est figé — regénérez si besoin.
                </p>
              </div>
              <LeaseEditForm
                leaseId={lease.id}
                initial={{
                  monthlyRent: lease.monthlyRent,
                  monthlyCharges: lease.monthlyCharges,
                  depositAmount: lease.depositAmount,
                  paymentDay: lease.paymentDay,
                  startDate: lease.startDate,
                  endDate: lease.endDate,
                  noticePeriodDays: lease.noticePeriodDays,
                  furnishing: lease.furnishing,
                  propertyAddress: lease.propertyAddress,
                  propertyCity: lease.propertyCity,
                  propertySurface: lease.propertySurface,
                  specialClauses: lease.specialClauses,
                }}
              />
            </>
          ) : (
            <section className="space-y-4 rounded-2xl border border-midnight/10 bg-cream p-6">
              <header>
                <p className="eyebrow">Termes figés</p>
                <h2 className="display-md mt-1 text-xl">
                  Le bail a été généré
                </h2>
              </header>
              <dl className="grid grid-cols-2 gap-3">
                <Field label="Loyer" value={`${lease.monthlyRent.toLocaleString("fr-FR")} MAD`} />
                <Field label="Charges" value={`${lease.monthlyCharges.toLocaleString("fr-FR")} MAD`} />
                <Field label="Caution" value={`${lease.depositAmount.toLocaleString("fr-FR")} MAD`} />
                <Field
                  label="Paiement"
                  value={`le ${lease.paymentDay} du mois`}
                />
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
            </section>
          )}

          {/* Registre des loyers — visible dès que des périodes
              existent (donc bail ACTIVE ou ultérieur). */}
          {periodsWithUrls.length > 0 && (
            <section>
              <header className="border-b border-midnight/10 pb-3">
                <p className="eyebrow">Registre des loyers</p>
                <h2 className="display-lg mt-1 text-xl">
                  Historique et quittances
                </h2>
              </header>
              <div className="mt-4">
                <RentLedger
                  role="LANDLORD"
                  periods={periodsWithUrls.map((p) => ({
                    id: p.id,
                    periodStart: p.periodStart.toISOString(),
                    periodEnd: p.periodEnd.toISOString(),
                    dueDate: p.dueDate.toISOString(),
                    amountRent: p.amountRent,
                    amountCharges: p.amountCharges,
                    amountTotal: p.amountTotal,
                    status: p.status,
                    payments: p.payments.map((pay) => ({
                      id: pay.id,
                      amount: pay.amount,
                      method: pay.method,
                      reference: pay.reference,
                      paidAt: pay.paidAt.toISOString(),
                      declaredByRole: pay.declaredByRole,
                      declaredByName: pay.declaredBy.name ?? null,
                    })),
                    receiptUrl: p.receiptUrl,
                    receiptFilename: p.receiptDoc?.filename ?? null,
                  }))}
                />
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <LeaseWorkflowActions
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
              disabledReason="EDL de sortie au départ du locataire"
            />
          </section>

          <div className="rounded-2xl border border-midnight/10 bg-cream p-5 text-xs text-muted-foreground">
            <p className="eyebrow">Disclaimer</p>
            <p className="mt-2">
              Le modèle de bail Baboo est conforme aux grands principes de
              la loi 67-12, mais n'a pas valeur de conseil juridique
              personnalisé. Faites relire par votre conseil avant
              signature si le bien ou la situation sortent du standard.
            </p>
          </div>
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
