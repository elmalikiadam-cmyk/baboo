import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { signedUrlForPrivate } from "@/lib/storage";
import { InventoryEditor } from "@/components/inventory/inventory-editor";

export const metadata: Metadata = {
  title: "État des lieux — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Écran unique d'édition de l'EDL, partagé entre bailleur et locataire.
 * Le rôle déterminé côté serveur détermine quelle checkbox de
 * validation est la « sienne ». Les deux peuvent tout éditer en
 * attendant la validation.
 */
export default async function InventoryReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const session = await auth();
  const { reportId } = await params;
  if (!session?.user?.id) {
    redirect(`/connexion?callbackUrl=${encodeURIComponent(`/edl/${reportId}`)}`);
  }
  if (!hasDb()) notFound();

  const report = await db.inventoryReport.findUnique({
    where: { id: reportId },
    include: {
      lease: {
        select: {
          id: true,
          landlordUserId: true,
          tenantUserId: true,
          propertyAddress: true,
          propertyCity: true,
          listing: { select: { agencyId: true } },
        },
      },
      rooms: {
        orderBy: { order: "asc" },
      },
    },
  });
  if (!report) notFound();

  const isLandlord =
    report.lease.landlordUserId === session.user.id ||
    (!!session.user.agencyId &&
      report.lease.listing?.agencyId === session.user.agencyId);
  const isTenant = report.lease.tenantUserId === session.user.id;
  if (!isLandlord && !isTenant) redirect("/");

  // Résout les photos par pièce et signe les URLs (TTL court).
  const photos = await db.documentVault.findMany({
    where: {
      category: "INVENTORY",
      relatedEntityId: { in: report.rooms.map((r) => r.id) },
    },
    select: { id: true, path: true, filename: true, relatedEntityId: true },
    orderBy: { uploadedAt: "asc" },
  });

  const signedPhotos = await Promise.all(
    photos.map(async (p) => ({
      id: p.id,
      roomId: p.relatedEntityId ?? "",
      filename: p.filename,
      url: await signedUrlForPrivate(p.path, 600).catch(() => null),
    })),
  );
  const photosByRoom = new Map<string, typeof signedPhotos>();
  for (const p of signedPhotos) {
    if (!p.url) continue;
    const arr = photosByRoom.get(p.roomId) ?? [];
    arr.push(p);
    photosByRoom.set(p.roomId, arr);
  }

  const role: "LANDLORD" | "TENANT" = isLandlord ? "LANDLORD" : "TENANT";

  return (
    <div className="container py-10 md:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link
          href={role === "LANDLORD" ? `/bailleur/baux/${report.lease.id}` : `/locataire/baux/${report.lease.id}`}
          className="hover:text-midnight"
        >
          Bail
        </Link>
        <span className="mx-2">·</span>
        <span>EDL {report.type === "ENTRY" ? "d'entrée" : "de sortie"}</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">
          État des lieux · {report.type === "ENTRY" ? "Entrée" : "Sortie"}
        </p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          {report.lease.propertyAddress}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {report.lease.propertyCity}
        </p>
      </header>

      <InventoryEditor
        reportId={report.id}
        status={report.status}
        role={role}
        generalNotes={report.generalNotes}
        landlordValidated={report.landlordValidated}
        landlordValidatedAt={
          report.landlordValidatedAt?.toISOString() ?? null
        }
        tenantValidated={report.tenantValidated}
        tenantValidatedAt={report.tenantValidatedAt?.toISOString() ?? null}
        rooms={report.rooms.map((r) => ({
          id: r.id,
          name: r.name,
          condition: r.condition,
          notes: r.notes,
          order: r.order,
          photos: (photosByRoom.get(r.id) ?? []).map((p) => ({
            id: p.id,
            url: p.url as string,
            filename: p.filename,
          })),
        }))}
      />
    </div>
  );
}
