import { NextResponse } from "next/server";
import { verifyQStashSignature } from "@/lib/qstash";
import { runSavedSearches } from "@/lib/run-saved-searches";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Webhook QStash — déclenche le moteur saved searches pour une
 * fréquence donnée passée en body ({ frequency: "instant" | "daily" |
 * "weekly" }). Un schedule QStash par fréquence :
 *
 *   instant : toutes les 15 minutes
 *   daily   : tous les jours 08:00 Africa/Casablanca
 *   weekly  : lundi 08:00 Africa/Casablanca
 *
 * Tous signés HMAC via verifyQStashSignature.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const raw = await req.text();
  const sig = req.headers.get("upstash-signature");
  if (!(await verifyQStashSignature(raw, sig))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let frequency: "instant" | "daily" | "weekly";
  try {
    const body = JSON.parse(raw) as { frequency?: string };
    if (
      body.frequency === "instant" ||
      body.frequency === "daily" ||
      body.frequency === "weekly"
    ) {
      frequency = body.frequency;
    } else {
      return NextResponse.json(
        { error: "frequency must be instant|daily|weekly" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const stats = await runSavedSearches(frequency);
  return NextResponse.json({ ok: true, ...stats });
}
