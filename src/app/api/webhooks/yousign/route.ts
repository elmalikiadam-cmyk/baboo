import { NextResponse } from "next/server";
import { db, hasDb } from "@/lib/db";
import {
  verifyYousignWebhook,
  downloadSignedDocument,
  getSignatureProcedure,
} from "@/lib/yousign";
import {
  isPrivateStorageEnabled,
  uploadToPrivateStorage,
} from "@/lib/storage";
import { createNotification } from "@/lib/notifications";
import { LeaseStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook Yousign — events : signature_request.done,
 * signature_request.declined, signer.signed, etc.
 *
 * Signature vérifiée via verifyYousignWebhook (HMAC SHA256 header
 * X-Yousign-Signature-256).
 *
 * Sur `signature_request.done` :
 *   - télécharger le PDF signé
 *   - uploader dans DocumentVault (bucket privé)
 *   - mettre à jour Lease : signedDocId, signedUploadedAt,
 *     status=SIGNED_UPLOADED, signatureStatus=SIGNED, les timestamps
 *     de chaque signer
 *   - notifier bailleur + locataire
 *
 * Sur `signature_request.declined` / `expired` :
 *   - marquer signatureStatus=REFUSED (ou EXPIRED)
 *   - notifier bailleur
 */
export async function POST(req: Request): Promise<NextResponse> {
  const raw = await req.text();
  const sig =
    req.headers.get("x-yousign-signature-256") ??
    req.headers.get("X-Yousign-Signature-256");
  if (!(await verifyYousignWebhook(raw, sig))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    event_name?: string;
    data?: {
      signature_request?: {
        id: string;
        status: string;
        external_id?: string;
      };
    };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = payload.event_name;
  const sr = payload.data?.signature_request;
  if (!sr) {
    return NextResponse.json({ ok: true, skipped: "no-sr" });
  }
  if (!hasDb()) return NextResponse.json({ ok: false, skipped: "no-db" });

  // Retrouver le lease par signatureProviderId
  const lease = await db.lease.findFirst({
    where: { signatureProviderId: sr.id },
    select: {
      id: true,
      landlordUserId: true,
      tenantUserId: true,
      propertyAddress: true,
      propertyCity: true,
    },
  });
  if (!lease) {
    return NextResponse.json({ ok: true, skipped: "lease-not-found" });
  }

  if (
    eventName === "signature_request.done" ||
    sr.status === "done" ||
    sr.status === "completed"
  ) {
    // Télécharger le PDF signé
    const procRes = await getSignatureProcedure(sr.id);
    if (!procRes.ok || !("documents" in procRes) || procRes.documents.length === 0) {
      return NextResponse.json({ error: "no-documents" }, { status: 500 });
    }
    const docId = procRes.documents[0].id;
    const dl = await downloadSignedDocument(sr.id, docId);
    if (!dl.ok) {
      return NextResponse.json({ error: "download-failed" }, { status: 500 });
    }

    if (!isPrivateStorageEnabled()) {
      return NextResponse.json({ error: "no-private-storage" }, { status: 500 });
    }

    const path = `leases/${lease.id}/${Date.now()}-signed-yousign.pdf`;
    try {
      await uploadToPrivateStorage({
        objectPath: path,
        body: dl.buffer,
        contentType: "application/pdf",
      });
    } catch (err) {
      console.error("[yousign] upload failed:", (err as Error).message);
      return NextResponse.json({ error: "upload-failed" }, { status: 500 });
    }

    const newDoc = await db.documentVault.create({
      data: {
        userId: lease.landlordUserId,
        category: "LEASE",
        path,
        filename: `bail-signe-${lease.id.slice(-8)}.pdf`,
        mimeType: "application/pdf",
        size: dl.buffer.byteLength,
        relatedEntityId: lease.id,
      },
      select: { id: true },
    });

    const now = new Date();
    await db.lease.update({
      where: { id: lease.id },
      data: {
        status: LeaseStatus.SIGNED_UPLOADED,
        signedDocId: newDoc.id,
        signedUploadedAt: now,
        signatureStatus: "SIGNED",
        signatureLandlordSignedAt: now,
        signatureTenantSignedAt: now,
      },
    });

    // Notifications
    await createNotification({
      userId: lease.landlordUserId,
      type: "LEASE_SIGNED",
      title: "Bail signé par les deux parties",
      body: `${lease.propertyAddress} — prêt à activer.`,
      linkUrl: `/bailleur/baux/${lease.id}`,
      entityType: "Lease",
      entityId: lease.id,
    });
    await createNotification({
      userId: lease.tenantUserId,
      type: "LEASE_SIGNED",
      title: "Votre bail est signé",
      body: `${lease.propertyAddress} — en attente d'activation par le bailleur.`,
      linkUrl: `/locataire/baux/${lease.id}`,
      entityType: "Lease",
      entityId: lease.id,
    });

    return NextResponse.json({ ok: true, processed: "signed" });
  }

  if (
    eventName === "signature_request.declined" ||
    sr.status === "declined" ||
    sr.status === "refused"
  ) {
    await db.lease.update({
      where: { id: lease.id },
      data: { signatureStatus: "REFUSED" },
    });
    await createNotification({
      userId: lease.landlordUserId,
      type: "SYSTEM",
      title: "Signature du bail refusée",
      body: "Le locataire a refusé la signature électronique.",
      linkUrl: `/bailleur/baux/${lease.id}`,
      entityType: "Lease",
      entityId: lease.id,
    });
    return NextResponse.json({ ok: true, processed: "declined" });
  }

  if (
    eventName === "signature_request.expired" ||
    sr.status === "expired"
  ) {
    await db.lease.update({
      where: { id: lease.id },
      data: { signatureStatus: "EXPIRED" },
    });
    return NextResponse.json({ ok: true, processed: "expired" });
  }

  return NextResponse.json({ ok: true, processed: "ignored" });
}
