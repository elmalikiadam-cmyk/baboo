"use server";

// Phase 3.4 — déclencheur admin manuel du cron rapports hebdo. Utile
// pour tester la génération en staging et pour les rattrapages en
// production si QStash a raté un run. Ne remplace pas la signature
// QStash : cette action n'est accessible qu'aux admins connectés.

import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { sendPromoterWeeklyDigest } from "@/lib/email";
import { absoluteUrl } from "@/lib/resend";
import {
  isPrivateStorageEnabled,
  uploadToPrivateStorage,
} from "@/lib/storage";
import { PromoterReportPdf } from "@/lib/promoter-report-pdf";

type Result =
  | { ok: true; generated: number; skipped: number }
  | { ok: false; error: string };

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

export async function runPromoterWeeklyReports(): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (session.user.role !== "ADMIN")
    return { ok: false, error: "Accès refusé." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const now = new Date();
  const weekEnd = startOfWeekUTC(now);
  const weekStart = new Date(weekEnd.getTime() - 7 * 86_400_000);

  const packs = await db.promoterPack.findMany({
    where: { status: "ACTIVE" },
    include: {
      developer: {
        select: {
          id: true,
          name: true,
          user: { select: { email: true } },
        },
      },
      projects: { select: { id: true } },
    },
  });

  let generated = 0;
  let skipped = 0;

  for (const pack of packs) {
    const exists = await db.promoterWeeklyReport.findUnique({
      where: { packId_weekStart: { packId: pack.id, weekStart } },
      select: { id: true },
    });
    if (exists) {
      skipped++;
      continue;
    }

    const projectIds = pack.projects.map((p) => p.id);
    const hasProjects = projectIds.length > 0;

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

    let pdfDocId: string | null = null;
    if (isPrivateStorageEnabled()) {
      try {
        const dev = await db.developer.findUnique({
          where: { id: pack.developer.id },
          select: { userId: true },
        });
        if (dev?.userId) {
          const buf = await renderToBuffer(
            PromoterReportPdf({
              data: {
                developerName: pack.developer.name,
                weekStart,
                weekEnd,
                visits: 0,
                leads,
                messages: 0,
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
            body: buf,
            contentType: "application/pdf",
          });
          const doc = await db.documentVault.create({
            data: {
              userId: dev.userId,
              category: "PROMOTER_REPORT",
              path: objectPath,
              filename: `rapport-baboo-${isoWeek}.pdf`,
              mimeType: "application/pdf",
              size: buf.length,
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
          visitsCount: 0,
          leadsCount: leads,
          messagesCount: 0,
          topVisitorsSnapshot: topLeads as unknown as object,
          pdfDocId,
          sentAt: new Date(),
        },
      }),
      db.promoterPack.update({
        where: { id: pack.id },
        data: {
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
        visits: 0,
        leads,
        messages: 0,
        dashboardUrl: absoluteUrl("/promoteur/rapports"),
      });
    }

    generated++;
  }

  revalidatePath("/admin/metriques");
  return { ok: true, generated, skipped };
}
