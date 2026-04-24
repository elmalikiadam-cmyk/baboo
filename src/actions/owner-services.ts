"use server";

// Phase 1 — commandes de services ponctuels côté propriétaire :
// Pack photos + Pack ménage. V1 simple : on enregistre un Lead
// source="owner-service" avec le type demandé en message, l'équipe
// ops reprend le contact dans les 24 h.

import { z } from "zod";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { hasEmailProvider, notifyAgencyOfLead } from "@/lib/email";

type Result = { ok: true } | { ok: false; error: string };

const ServiceKind = z.enum(["PHOTOS", "CLEANING"]);
type Kind = z.infer<typeof ServiceKind>;

const schema = z.object({
  kind: ServiceKind,
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(40),
  citySlug: z.string().trim().min(1).max(60),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const KIND_LABEL: Record<Kind, string> = {
  PHOTOS: "Pack photos propriétaire",
  CLEANING: "Pack ménage avant visite",
};

export async function requestOwnerService(
  form: FormData,
): Promise<Result> {
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const email = String(form.get("email") ?? "");
  const rl = await rateLimit({
    key: `owner-service:${email}`,
    limit: 6,
    windowSec: 3600,
  });
  if (!rl.success) return { ok: false, error: "Trop de demandes récentes." };

  const parsed = schema.safeParse({
    kind: form.get("kind") ?? "PHOTOS",
    name: form.get("name") ?? "",
    email: form.get("email") ?? "",
    phone: form.get("phone") ?? "",
    citySlug: form.get("citySlug") ?? "",
    notes: form.get("notes") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "Formulaire invalide." };

  const session = await auth();
  const label = KIND_LABEL[parsed.data.kind];

  await db.lead.create({
    data: {
      userId: session?.user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: [
        `Service demandé : ${label}`,
        `Ville : ${parsed.data.citySlug}`,
        parsed.data.notes
          ? `Notes : ${parsed.data.notes}`
          : "Pas de précision supplémentaire.",
      ].join("\n"),
      source: "owner-service",
    },
  });

  // Notification équipe ops (si RESEND configuré, on route vers l'email
  // générique ; sinon le lead reste visible côté /admin).
  const opsEmail = process.env.OPS_LEAD_INBOX;
  if (opsEmail && hasEmailProvider()) {
    await notifyAgencyOfLead({
      to: opsEmail,
      agencyName: "Équipe Baboo",
      listingTitle: label,
      leadName: parsed.data.name,
      leadEmail: parsed.data.email,
      leadPhone: parsed.data.phone,
      leadMessage: parsed.data.notes || "Demande propriétaire",
    }).catch(() => null);
  }

  return { ok: true };
}
