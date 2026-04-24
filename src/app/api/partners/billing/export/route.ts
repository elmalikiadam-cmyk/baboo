// Export CSV des déblocages d'un partenaire (utile pour la
// comptabilité). Renvoie un CSV UTF-8 avec BOM pour Excel.

import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("unauthorized", { status: 401 });
  }
  if (!hasDb()) {
    return new Response("no-db", { status: 503 });
  }

  const partner = await db.partnerAgency.findUnique({
    where: { contactEmail: session.user.email.toLowerCase() },
    select: { id: true, name: true },
  });
  if (!partner) return new Response("forbidden", { status: 403 });

  const rows = await db.partnerLeadUnlock.findMany({
    where: { partnerId: partner.id },
    orderBy: { unlockedAt: "desc" },
    include: {
      searchRequest: {
        select: {
          contactName: true,
          contactEmail: true,
          contactPhone: true,
          citySlug: true,
          transaction: true,
          budgetMax: true,
        },
      },
    },
    take: 5000,
  });

  const headers = [
    "date",
    "contact",
    "email",
    "telephone",
    "ville",
    "transaction",
    "budget_max_mad",
    "prix_paye_mad",
  ];

  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.unlockedAt.toISOString().slice(0, 10)),
        csvEscape(r.searchRequest.contactName),
        csvEscape(r.searchRequest.contactEmail),
        csvEscape(r.searchRequest.contactPhone),
        csvEscape(r.searchRequest.citySlug),
        csvEscape(r.searchRequest.transaction),
        csvEscape(r.searchRequest.budgetMax),
        csvEscape(r.pricePaid),
      ].join(","),
    );
  }

  // BOM UTF-8 pour Excel
  const body = "﻿" + lines.join("\n");
  const filename = `baboo-partners-billing-${partner.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
