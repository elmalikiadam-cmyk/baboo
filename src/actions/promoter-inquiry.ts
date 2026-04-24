"use server";

import { z } from "zod";
import { db, hasDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  companyName: z.string().trim().min(2).max(140),
  contactName: z.string().trim().min(2).max(140),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(40),
  projectCount: z.enum(["1-2", "3-5", "6+"]),
  teamSize: z.enum(["0", "1-3", "4-10", "10+"]),
  budget: z.enum(["lt-20", "20-50", "50-100", "gt-100"]),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

/**
 * Soumission d'une demande B2B promoteur. Stockée comme Lead avec
 * source "promoter-inquiry" — l'équipe commerciale Baboo peut filtrer
 * ces leads dans l'admin pour les traiter en priorité.
 */
export async function submitPromoterInquiry(
  form: FormData,
): Promise<Result> {
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const ip = "unknown"; // pas de header IP ici
  const rl = await rateLimit({
    key: `promoter-inquiry:${ip}`,
    limit: 5,
    windowSec: 3600,
  });
  if (!rl.success) {
    return { ok: false, error: "Trop de demandes récentes." };
  }

  const parsed = schema.safeParse({
    companyName: form.get("companyName") ?? "",
    contactName: form.get("contactName") ?? "",
    email: form.get("email") ?? "",
    phone: form.get("phone") ?? "",
    projectCount: form.get("projectCount") ?? "1-2",
    teamSize: form.get("teamSize") ?? "1-3",
    budget: form.get("budget") ?? "lt-20",
    message: form.get("message") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: "Formulaire invalide." };
  }

  const data = parsed.data;
  const body = [
    `Promoteur : ${data.companyName}`,
    `Contact : ${data.contactName} · ${data.phone}`,
    `Projets : ${data.projectCount} · Équipe : ${data.teamSize}`,
    `Budget : ${data.budget}`,
    data.message ? `\nMessage :\n${data.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await db.lead.create({
      data: {
        source: "promoter-inquiry",
        name: data.contactName,
        email: data.email,
        phone: data.phone,
        message: body,
      },
    });
  } catch (err) {
    console.error("[promoter-inquiry] create failed:", (err as Error).message);
    return {
      ok: false,
      error: "Impossible d'envoyer votre demande. Réessayez plus tard.",
    };
  }

  return { ok: true };
}
