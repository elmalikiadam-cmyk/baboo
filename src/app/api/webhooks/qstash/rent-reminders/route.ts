import { NextResponse } from "next/server";
import { verifyQStashSignature } from "@/lib/qstash";
import { db, hasDb } from "@/lib/db";
import { RentPeriodStatus } from "@prisma/client";
import { sendEmail, absoluteUrl } from "@/lib/resend";
import {
  rentReminderSoftEmail,
  rentReminderFormalEmail,
} from "@/lib/email-templates";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const FR_MONEY = new Intl.NumberFormat("fr-FR");

/**
 * Cron quotidien — 09:00 Africa/Casablanca.
 * Scanne toutes les RentPeriod en retard et envoie les relances
 * selon paliers :
 *   J+5  : email soft au locataire
 *   J+10 : WhatsApp
 *   J+15 : email formel + notification bailleur
 *   J+30 : mise en demeure (notification + log, PDF à venir)
 *
 * La RentPeriod n'a pas de colonne `remindersSent` en V1 — on utilise
 * `daysLate` comme fenêtre stricte : on envoie exactement à J+5, J+10,
 * J+15, J+30 (UTC date compare). Idempotent si le cron tourne 1x/jour.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const raw = await req.text();
  const sig = req.headers.get("upstash-signature");
  if (!(await verifyQStashSignature(raw, sig))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  if (!hasDb()) return NextResponse.json({ ok: false, skipped: "no-db" });

  const now = new Date();
  const lateCutoff = new Date(now.getTime() - 4 * 24 * 3600 * 1000); // J+5

  const periods = await db.rentPeriod.findMany({
    where: {
      status: {
        in: [RentPeriodStatus.LATE, RentPeriodStatus.DUE, RentPeriodStatus.PARTIALLY_PAID],
      },
      dueDate: { lt: lateCutoff },
    },
    include: {
      payments: { select: { amount: true } },
      lease: {
        select: {
          id: true,
          propertyAddress: true,
          propertyCity: true,
          landlordUserId: true,
          tenantUserId: true,
          tenantUser: {
            select: { id: true, name: true, email: true, phone: true },
          },
          landlordUser: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  let softCount = 0;
  let whatsappCount = 0;
  let formalCount = 0;
  let demandCount = 0;

  for (const p of periods) {
    const paid = p.payments.reduce((s, pay) => s + pay.amount, 0);
    if (paid >= p.amountTotal) continue;

    const daysLate = Math.floor(
      (now.getTime() - p.dueDate.getTime()) / (1000 * 3600 * 24),
    );
    const dueDateLabel = p.dueDate.toLocaleDateString("fr-FR", {
      dateStyle: "long",
    });
    const amountLabel = `${FR_MONEY.format(p.amountTotal - paid)} MAD`;
    const tenant = p.lease.tenantUser;
    const lease = p.lease;

    // J+5 : email soft
    if (daysLate === 5) {
      const tpl = rentReminderSoftEmail({
        tenantName: tenant.name ?? tenant.email.split("@")[0],
        listingTitle: `${lease.propertyAddress}, ${lease.propertyCity}`,
        dueDate: dueDateLabel,
        amount: amountLabel,
        leaseId: lease.id,
      });
      await sendEmail({ to: tenant.email, subject: tpl.subject, html: tpl.html });
      softCount += 1;
    }

    // J+10 : WhatsApp si téléphone
    if (daysLate === 10 && tenant.phone) {
      await sendWhatsAppTemplate({
        to: tenant.phone,
        template: "rent_reminder",
        locale: "fr",
        variables: [`${lease.propertyAddress}, ${lease.propertyCity}`, amountLabel],
      });
      whatsappCount += 1;
    }

    // J+15 : email formel + notification bailleur
    if (daysLate === 15) {
      const tpl = rentReminderFormalEmail({
        tenantName: tenant.name ?? tenant.email.split("@")[0],
        listingTitle: `${lease.propertyAddress}, ${lease.propertyCity}`,
        dueDate: dueDateLabel,
        amount: amountLabel,
        daysLate,
        leaseId: lease.id,
      });
      await sendEmail({ to: tenant.email, subject: tpl.subject, html: tpl.html });
      await createNotification({
        userId: lease.landlordUserId,
        type: "RENT_LATE",
        title: `Loyer en retard de 15 j — ${lease.propertyAddress}`,
        body: `Le loyer de ${amountLabel} dû le ${dueDateLabel} n'a toujours pas été réglé.`,
        linkUrl: absoluteUrl(`/bailleur/baux/${lease.id}`),
        entityType: "Lease",
        entityId: lease.id,
      });
      formalCount += 1;
    }

    // J+30 : mise en demeure — notification critique + audit log
    if (daysLate === 30) {
      await createNotification({
        userId: lease.landlordUserId,
        type: "RENT_LATE",
        title: `⚠ Retard ≥ 30 jours — ${lease.propertyAddress}`,
        body: `Le locataire doit ${amountLabel}. Une mise en demeure formelle peut être engagée.`,
        linkUrl: absoluteUrl(`/bailleur/baux/${lease.id}`),
        entityType: "Lease",
        entityId: lease.id,
      });
      try {
        await db.auditLog.create({
          data: {
            action: "rent.late_30_days",
            entityType: "RentPeriod",
            entityId: p.id,
            meta: { daysLate, amountOwed: p.amountTotal - paid },
          },
        });
      } catch {
        /* silencieux */
      }
      demandCount += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: periods.length,
    softEmails: softCount,
    whatsapp: whatsappCount,
    formalEmails: formalCount,
    miseEnDemeure: demandCount,
  });
}
