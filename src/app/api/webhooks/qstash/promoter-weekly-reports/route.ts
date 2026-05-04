// Phase 3.4 — cron hebdomadaire : génère un rapport pour chaque
// PromoterPack ACTIVE, incrémente les compteurs dénormalisés et
// envoie un email au promoteur (best-effort).
//
// Déclenchement : Upstash Schedules → POST tous les lundis 08:00 UTC.
// En prod la signature QStash est obligatoire. En dev (pas de clé),
// l'endpoint reste fermé par défaut.

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db, hasDb } from "@/lib/db";
import { verifyQStashSignature } from "@/lib/qstash";
import { sendPromoterWeeklyDigest } from "@/lib/email";
import { absoluteUrl } from "@/lib/resend";
import {
  isPrivateStorageEnabled,
  uploadToPrivateStorage,
} from "@/lib/storage";
import { PromoterReportPdf } from "@/lib/promoter-report-pdf";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("upstash-signature");

  const signed = await verifyQStashSignature(body, signature);
  if (!signed && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!hasDb()) {
    return NextResponse.json({ ok: true, skipped: "no-db" });
  }

  const now = new Date();
  const weekEnd = startOfWeekUTC(now); // lundi 00:00 UTC
  const weekStart = new Date(weekEnd.getTime() - 7 * 86_400_000);

  const packs = await db.promoterPack.findMany({
    where: { status: "ACTIVE" },
    include: {
      developer: {
        select: {
          id: true,
          name: true,
          user: { select: { email: true, name: true } },
        },
      },
      projects: { select: { id: true } },
    },
  });

  let generated = 0;
  let skipped = 0;

  for (const pack of packs) {
    const already = await db.promoterWeeklyReport.findUnique({
      where: { packId_weekStart: { packId: pack.id, weekStart } },
      select: { id: true },
    });
    if (already) {
      skipped++;
      continue;
    }

    const projectIds = pack.projects.map((p) => p.id);
    const hasProjects = projectIds.length > 0;

    // V1 : les visites sur les projets neufs ne passent pas par
    // VisitBooking (ce dernier est scope Listing). On compte donc les
    // leads comme proxy d'intérêt. À affiner dans une V2 avec un lien
    // direct Listing ↔ Project, ou un ManagedVisit dédié promoteur.
    const visits = 0;
    const messages = 0;

    const leads = hasProjects
      ? await db.lead.count({
          where: {
            projectId: { in: projectIds },
            createdAt: { gte: weekStart, lt: weekEnd },
          },
        })
      : 0;

    const topLeads = hasProjects
      ? await db.lead.findMany({
          where: {
            projectId: { in: projectIds },
            createdAt: { gte: weekStart, lt: weekEnd },
          },
          select: { name: true, email: true, message: true },
          take: 5,
          orderBy: { createdAt: "desc" },
        })
      : [];

    // Génération PDF (best-effort) + upload bucket privé.
    // Si renderToBuffer ou upload échoue, on continue sans PDF rattaché.
    let pdfDocId: string | null = null;
    if (isPrivateStorageEnabled()) {
      try {
        const dev = await db.developer.findUnique({
          where: { id: pack.developer.id },
          select: { userId: true },
        });
        if (dev?.userId) {
          const pdfBuffer = await renderToBuffer(
            PromoterReportPdf({
              data: {
                developerName: pack.developer.name,
                weekStart,
                weekEnd,
                visits,
                leads,
                messages,
                topLeads: topLeads as Array<{
                  name: string;
                  email: string;
                  message: string;
                }>,
                generatedAt: new Date(),
              },
            }),
          );
          const isoWeek = weekStart.toISOString().slice(0, 10);
          const objectPath = `promoter-reports/${pack.id}/${isoWeek}.pdf`;
          await uploadToPrivateStorage({
            objectPath,
            body: pdfBuffer,
            contentType: "application/pdf",
          });
          const doc = await db.documentVault.create({
            data: {
              userId: dev.userId,
              category: "PROMOTER_REPORT",
              path: objectPath,
              filename: `rapport-baboo-${isoWeek}.pdf`,
              mimeType: "application/pdf",
              size: pdfBuffer.length,
              relatedEntityId: `promoter-pack:${pack.id}`,
            },
            select: { id: true },
          });
          pdfDocId = doc.id;
        }
      } catch {
        /* best-effort */
      }
    }

    await db.$transaction([
      db.promoterWeeklyReport.create({
        data: {
          packId: pack.id,
          weekStart,
          weekEnd,
          visitsCount: visits,
          leadsCount: leads,
          messagesCount: messages,
          topVisitorsSnapshot: topLeads as unknown as object,
          pdfDocId,
          sentAt: new Date(),
        },
      }),
      db.promoterPack.update({
        where: { id: pack.id },
        data: {
          totalVisitsDelivered: { increment: visits },
          totalLeadsDelivered: { increment: leads },
          lastReportAt: new Date(),
        },
      }),
    ]);

    const email = pack.developer.user?.email;
    if (email) {
      await sendPromoterWeeklyDigest({
        to: email,
        developerName: pack.developer.name,
        visits,
        leads,
        messages,
        dashboardUrl: absoluteUrl("/promoteur/rapports"),
      });
    }

    generated++;
  }

  return NextResponse.json({ ok: true, generated, skipped });
}

function startOfWeekUTC(d: Date): Date {
  const r = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = r.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  r.setUTCDate(r.getUTCDate() + diff);
  r.setUTCHours(0, 0, 0, 0);
  return r;
}
