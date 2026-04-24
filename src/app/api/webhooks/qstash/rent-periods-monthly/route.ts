import { NextResponse } from "next/server";
import { verifyQStashSignature } from "@/lib/qstash";
import { db, hasDb } from "@/lib/db";
import { ensureRentPeriods } from "@/actions/rent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Cron mensuel — 1er du mois 02:00 Africa/Casablanca.
 * Itère sur tous les Lease ACTIVE et force ensureRentPeriods pour
 * garantir que les mois à venir sont pré-générés.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const raw = await req.text();
  const sig = req.headers.get("upstash-signature");
  if (!(await verifyQStashSignature(raw, sig))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  if (!hasDb()) return NextResponse.json({ ok: false, skipped: "no-db" });

  const leases = await db.lease.findMany({
    where: { status: { in: ["ACTIVE", "SIGNED_UPLOADED"] } },
    select: { id: true },
  });

  let created = 0;
  let errors = 0;
  for (const l of leases) {
    try {
      await ensureRentPeriods(l.id);
      created += 1;
    } catch (err) {
      errors += 1;
      console.warn(
        `[cron/rent-periods] ${l.id} failed: ${(err as Error).message}`,
      );
    }
  }
  return NextResponse.json({ ok: true, processed: leases.length, created, errors });
}
