import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { relativeDate } from "@/lib/format";
import { KycReviewActions } from "@/components/admin/kyc-review-actions";
import { KycDocLink } from "@/components/admin/kyc-doc-link";

export const metadata: Metadata = {
  title: "Admin · KYC bailleurs",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const OWNERSHIP_LABEL: Record<string, string> = {
  TITRE_FONCIER: "Titre foncier",
  ACTE_NOTARIE: "Acte notarié",
  ATTESTATION_AYANTS_DROIT: "Attestation ayants-droit",
  MANDAT: "Mandat de gestion",
  AUTRE: "Autre",
};

const ID_LABEL: Record<string, string> = {
  CIN: "CIN",
  PASSPORT: "Passeport",
  RESIDENCE_PERMIT: "Titre de séjour",
};

export default async function AdminKycPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/admin/kyc");
  if (session.user.role !== "ADMIN") redirect("/");
  if (!hasDb()) return null;

  const pending = await db.landlordVerification.findMany({
    where: { status: "PENDING" },
    orderBy: { submittedAt: "asc" },
    include: {
      user: { select: { id: true, email: true, name: true, phone: true } },
      idFrontDoc: { select: { id: true, path: true, filename: true } },
      idBackDoc: { select: { id: true, path: true, filename: true } },
      ownershipDoc: { select: { id: true, path: true, filename: true } },
      ribDoc: { select: { id: true, path: true, filename: true } },
    },
  });

  const stats = await db.landlordVerification.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  const statsMap = Object.fromEntries(
    stats.map((s) => [s.status, s._count.status]),
  );

  return (
    <div className="container py-10 md:py-16">
      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Admin · KYC bailleurs</p>
          <h1 className="display-xl mt-2 text-4xl md:text-5xl">
            Dossiers à examiner.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Approbation = rôle BAILLEUR accordé immédiatement. Rejet = le
            bailleur reçoit le motif et peut re-soumettre.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 text-center">
          <Stat value={statsMap.PENDING ?? 0} label="En attente" />
          <Stat value={statsMap.APPROVED ?? 0} label="Validés" />
          <Stat value={statsMap.REJECTED ?? 0} label="Rejetés" />
        </dl>
      </header>

      {pending.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center">
          <p className="display-md text-xl">File vide.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Aucun dossier KYC en attente d'approbation.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {pending.map((v) => (
            <li
              key={v.id}
              className="rounded-2xl border border-midnight/10 bg-cream p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="display-lg text-base">
                    {v.user.name ?? v.user.email}
                  </p>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {v.user.email}
                    {v.user.phone && ` · ${v.user.phone}`}
                    {" · "}
                    soumis {relativeDate(v.submittedAt)}
                  </p>
                </div>
                <KycReviewActions verificationId={v.id} />
              </div>

              <dl className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="eyebrow">Identité</dt>
                  <dd className="mt-2 text-sm text-midnight">
                    {ID_LABEL[v.idType] ?? v.idType}
                    {v.idNumber && (
                      <span className="ml-2 text-muted-foreground">
                        · {v.idNumber}
                      </span>
                    )}
                  </dd>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {v.idFrontDoc && (
                      <KycDocLink
                        path={v.idFrontDoc.path}
                        filename={v.idFrontDoc.filename}
                        label="Recto"
                      />
                    )}
                    {v.idBackDoc && (
                      <KycDocLink
                        path={v.idBackDoc.path}
                        filename={v.idBackDoc.filename}
                        label="Verso"
                      />
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="eyebrow">Droit de louer</dt>
                  <dd className="mt-2 text-sm text-midnight">
                    {OWNERSHIP_LABEL[v.ownershipType] ?? v.ownershipType}
                  </dd>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {v.ownershipDoc && (
                      <KycDocLink
                        path={v.ownershipDoc.path}
                        filename={v.ownershipDoc.filename}
                        label="Justificatif"
                      />
                    )}
                  </dd>
                  <dd className="mt-3 text-xs text-muted-foreground">
                    {v.attestation
                      ? "✓ Attestation cochée"
                      : "⚠ Attestation absente"}
                  </dd>
                </div>

                {(v.ribDoc || v.ibanLast4) && (
                  <div className="md:col-span-2">
                    <dt className="eyebrow">Paiement</dt>
                    <dd className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                      {v.ribDoc && (
                        <KycDocLink
                          path={v.ribDoc.path}
                          filename={v.ribDoc.filename}
                          label="RIB"
                        />
                      )}
                      {v.ibanLast4 && (
                        <span className="text-muted-foreground">
                          IBAN ⋯ {v.ibanLast4}
                        </span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-md border border-midnight/10 bg-cream p-3">
      <p className="display-lg text-xl">{value}</p>
      <p className="mono mt-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
