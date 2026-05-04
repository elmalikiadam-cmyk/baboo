"use server";

// Candidature publique pour devenir agent Baboo (rôle VISIT_AGENT).
// V1 simple : on enregistre un Lead source="agent-application", l'équipe
// ops trie. Pas d'auto-acceptation : le profil Active n'est créé que
// par /admin/agents après onboarding (formation, signature contrat).

import { z } from "zod";
import { db, hasDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { hasEmailProvider, notifyAgencyOfLead } from "@/lib/email";

type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(40),
  citySlugs: z.array(z.string().min(1)).min(1, "Au moins une ville."),
  speciality: z.enum(["LOCATION", "VENTE", "BOTH"]),
  experience: z.string().trim().max(2000),
  consent: z.literal("on").or(z.literal("true")),
});

export async function submitAgentApplication(
  form: FormData,
): Promise<Result> {
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const email = String(form.get("email") ?? "");
  const rl = await rateLimit({
    key: `agent-application:${email}`,
    limit: 5,
    windowSec: 86_400,
  });
  if (!rl.success) return { ok: false, error: "Trop de demandes." };

  const parsed = schema.safeParse({
    name: form.get("name") ?? "",
    email: form.get("email") ?? "",
    phone: form.get("phone") ?? "",
    citySlugs: form.getAll("citySlugs").map(String).filter(Boolean),
    speciality: form.get("speciality") ?? "LOCATION",
    experience: form.get("experience") ?? "",
    consent: form.get("consent") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalide." };
  }
  const d = parsed.data;

  await db.lead.create({
    data: {
      name: d.name,
      email: d.email.toLowerCase(),
      phone: d.phone,
      message: [
        `Candidature agent Baboo`,
        `Spécialité : ${d.speciality}`,
        `Villes : ${d.citySlugs.join(", ")}`,
        `Expérience : ${d.experience || "—"}`,
      ].join("\n"),
      source: "agent-application",
    },
  });

  const opsEmail = process.env.OPS_LEAD_INBOX;
  if (opsEmail && hasEmailProvider()) {
    await notifyAgencyOfLead({
      to: opsEmail,
      agencyName: "Équipe Baboo · recrutement",
      listingTitle: `Candidature agent · ${d.citySlugs.join(", ")}`,
      leadName: d.name,
      leadEmail: d.email,
      leadPhone: d.phone,
      leadMessage: `Spécialité ${d.speciality}\n\n${d.experience || "Pas de précision."}`,
    }).catch(() => null);
  }

  return { ok: true };
}
