// Cron quotidien : expire les SearchRequest qui datent de plus de 60
// jours sans déboucher sur une conversion. Évite que les partenaires
// continuent de voir des leads froids.
//
// Déclenchement : Upstash Schedules → POST tous les jours 04:00 UTC.

import { NextResponse } from "next/server";
import { db, hasDb } from "@/lib/db";
import { verifyQStashSignature } from "@/lib/qstash";

export const dynamic = "force-dynamic";

const EXPIRY_DAYS = 60;

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

  const cutoff = new Date(Date.now() - EXPIRY_DAYS * 86_400_000);
  const res = await db.searchRequest.updateMany({
    where: {
      status: { in: ["ACTIVE", "MATCHED", "ROUTED"] },
      createdAt: { lt: cutoff },
    },
    data: {
      status: "EXPIRED",
      expiresAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, expired: res.count });
}
