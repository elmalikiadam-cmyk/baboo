"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { db, hasDb } from "@/lib/db";

const LeadInput = z.object({
  name: z.string().min(2, "Votre nom est requis.").max(120),
  email: z.string().email("Email invalide.").max(200),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  message: z
    .string()
    .min(10, "Un message d'au moins 10 caractères aide l'agence à répondre.")
    .max(2000),
  listingId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  source: z
    .enum(["form", "whatsapp", "call", "visit", "project", "general", "publication-interest"])
    .default("form"),
});

export type LeadInput = z.infer<typeof LeadInput>;
export type LeadResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

// Rate limit simple in-memory : 5 envois / 5 min / IP.
// En prod multi-instance, migrer vers un store partagé (Upstash Redis par ex.).
const LIMIT = 5;
const WINDOW_MS = 5 * 60 * 1000;
type Slot = { count: number; reset: number };
const buckets = new Map<string, Slot>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const slot = buckets.get(ip);
  if (!slot || now > slot.reset) {
    buckets.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (slot.count >= LIMIT) return false;
  slot.count += 1;
  return true;
}

async function getIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0]?.trim() || "anonymous";
}

/**
 * Enregistre un lead. Supporte trois cas :
 *  - Lead sur une annonce (listingId défini)
 *  - Lead sur un projet neuf (projectId défini, demande de brochure)
 *  - Lead général (ni l'un ni l'autre, formulaire /contact)
 */
export async function submitLead(input: unknown): Promise<LeadResult> {
  const parsed = LeadInput.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { ok: false, error: "Formulaire invalide.", fieldErrors };
  }

  const ip = await getIp();
  if (!rateLimit(ip)) {
    return { ok: false, error: "Trop de demandes. Réessayez dans quelques minutes." };
  }

  const data = parsed.data;

  // Sans DB on accepte silencieusement — mode démo local. L'utilisateur voit
  // la confirmation, aucune donnée n'est perdue puisqu'il n'y a pas de store.
  if (!hasDb()) return { ok: true };

  try {
    await db.lead.create({
      data: {
        listingId: data.listingId ?? null,
        projectId: data.projectId ?? null,
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        message: data.message,
        source: data.source,
      },
    });
    return { ok: true };
  } catch (err) {
    console.error("[submitLead] failed:", (err as Error).message);
    return {
      ok: false,
      error: "Impossible d'envoyer votre message. Réessayez dans un instant.",
    };
  }
}
