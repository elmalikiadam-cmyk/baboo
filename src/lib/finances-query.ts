// Agrégation finances bailleur — utilisée par le dashboard
// /bailleur/gestion-locative/finances.

import { db, hasDb } from "@/lib/db";
import { RentPeriodStatus } from "@prisma/client";

export type FinanceSummary = {
  thisMonth: {
    expected: number;
    received: number;
    pending: number;
    late: number;
  };
  ytd: {
    expected: number;
    received: number;
  };
  last12Months: Array<{ month: string; expected: number; received: number }>;
  byLease: Array<{
    leaseId: string;
    propertyLabel: string;
    tenantName: string;
    monthlyRent: number;
    lateCount: number;
    ytdReceived: number;
    status: string;
  }>;
  late: Array<{
    leaseId: string;
    periodId: string;
    dueDate: Date;
    amountTotal: number;
    daysLate: number;
    tenantName: string;
    propertyLabel: string;
  }>;
};

const empty: FinanceSummary = {
  thisMonth: { expected: 0, received: 0, pending: 0, late: 0 },
  ytd: { expected: 0, received: 0 },
  last12Months: [],
  byLease: [],
  late: [],
};

export async function getLandlordFinanceSummary(
  userId: string,
  agencyId: string | null,
): Promise<FinanceSummary> {
  if (!hasDb()) return empty;

  const where = agencyId
    ? {
        OR: [
          { landlordUserId: userId },
          { listing: { agencyId } },
        ],
      }
    : { landlordUserId: userId };

  const leases = await db.lease.findMany({
    where,
    select: {
      id: true,
      status: true,
      monthlyRent: true,
      propertyAddress: true,
      propertyCity: true,
      tenantUser: { select: { name: true, email: true } },
      rentPeriods: {
        select: {
          id: true,
          periodStart: true,
          dueDate: true,
          amountTotal: true,
          status: true,
          payments: { select: { amount: true, paidAt: true } },
        },
      },
    },
  });

  const now = new Date();
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59),
  );

  const summary: FinanceSummary = {
    thisMonth: { expected: 0, received: 0, pending: 0, late: 0 },
    ytd: { expected: 0, received: 0 },
    last12Months: [],
    byLease: [],
    late: [],
  };

  // Pré-calcule 12 derniers mois
  const months: Array<{ key: string; label: string; start: Date; end: Date }> =
    [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const end = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59),
    );
    months.push({
      key: d.toISOString(),
      label: d.toLocaleDateString("fr-FR", {
        month: "short",
        year: "2-digit",
      }),
      start: d,
      end,
    });
  }
  const monthAgg = new Map(
    months.map((m) => [m.key, { expected: 0, received: 0 }]),
  );

  for (const lease of leases) {
    const tenantName = lease.tenantUser.name ?? lease.tenantUser.email;
    const propertyLabel = `${lease.propertyAddress}, ${lease.propertyCity}`;
    let ytdReceived = 0;
    let lateCount = 0;

    for (const p of lease.rentPeriods) {
      const totalPaid = p.payments.reduce((s, pay) => s + pay.amount, 0);

      // Agrégation ce mois-ci
      if (p.periodStart >= monthStart && p.periodStart <= monthEnd) {
        summary.thisMonth.expected += p.amountTotal;
        summary.thisMonth.received += Math.min(totalPaid, p.amountTotal);
        if (p.status === RentPeriodStatus.PAID) {
          // ok
        } else if (p.status === RentPeriodStatus.LATE) {
          summary.thisMonth.late += Math.max(0, p.amountTotal - totalPaid);
        } else if (p.status !== RentPeriodStatus.WAIVED) {
          summary.thisMonth.pending += Math.max(0, p.amountTotal - totalPaid);
        }
      }

      // Agrégation YTD
      if (p.periodStart >= yearStart) {
        summary.ytd.expected += p.amountTotal;
        summary.ytd.received += Math.min(totalPaid, p.amountTotal);
      }

      // Agrégation 12 mois
      const monthKey = new Date(
        Date.UTC(p.periodStart.getUTCFullYear(), p.periodStart.getUTCMonth(), 1),
      ).toISOString();
      const bucket = monthAgg.get(monthKey);
      if (bucket) {
        bucket.expected += p.amountTotal;
        bucket.received += Math.min(totalPaid, p.amountTotal);
      }

      // By lease
      const paidThisYear = p.payments
        .filter((pay) => pay.paidAt >= yearStart)
        .reduce((s, pay) => s + pay.amount, 0);
      ytdReceived += paidThisYear;
      if (p.status === RentPeriodStatus.LATE) lateCount += 1;

      // Retards
      if (
        (p.status === RentPeriodStatus.LATE ||
          (p.status === RentPeriodStatus.PARTIALLY_PAID && p.dueDate < now)) &&
        p.amountTotal > totalPaid
      ) {
        summary.late.push({
          leaseId: lease.id,
          periodId: p.id,
          dueDate: p.dueDate,
          amountTotal: p.amountTotal - totalPaid,
          daysLate: Math.max(
            0,
            Math.floor((now.getTime() - p.dueDate.getTime()) / (1000 * 3600 * 24)),
          ),
          tenantName,
          propertyLabel,
        });
      }
    }

    summary.byLease.push({
      leaseId: lease.id,
      propertyLabel,
      tenantName,
      monthlyRent: lease.monthlyRent,
      lateCount,
      ytdReceived,
      status: lease.status,
    });
  }

  summary.last12Months = months.map((m) => ({
    month: m.label,
    expected: monthAgg.get(m.key)?.expected ?? 0,
    received: monthAgg.get(m.key)?.received ?? 0,
  }));

  summary.late.sort((a, b) => b.daysLate - a.daysLate);
  summary.byLease.sort((a, b) => b.ytdReceived - a.ytdReceived);

  return summary;
}
