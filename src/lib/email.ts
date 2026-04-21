// Helpers email — Resend si RESEND_API_KEY est défini. Sinon no-op silencieux.
// On évite d'ajouter une dépendance lourde : l'API REST Resend accepte un
// POST JSON simple, c'est suffisant pour notre besoin (un email par lead).

const RESEND_ENDPOINT = "https://api.resend.com/emails";

interface LeadEmailInput {
  to: string;
  agencyName: string;
  listingTitle: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string | null;
  leadMessage: string;
}

function hasEmailProvider(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM;
}

export async function notifyAgencyOfLead(input: LeadEmailInput): Promise<void> {
  if (!hasEmailProvider()) return;

  const subject = `Nouveau contact pour "${input.listingTitle}"`;
  const text = [
    `Bonjour ${input.agencyName},`,
    ``,
    `Vous avez reçu un nouveau contact pour votre annonce "${input.listingTitle}".`,
    ``,
    `De       : ${input.leadName} <${input.leadEmail}>`,
    input.leadPhone ? `Téléphone: ${input.leadPhone}` : null,
    ``,
    `Message  :`,
    input.leadMessage,
    ``,
    `—`,
    `Retrouvez ce lead dans votre tableau de bord Baboo.`,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM,
        to: [input.to],
        reply_to: input.leadEmail,
        subject,
        text,
      }),
      // On coupe tôt pour éviter de bloquer la réponse à l'utilisateur.
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn("[notifyAgencyOfLead] resend non-200:", res.status, body.slice(0, 200));
    }
  } catch (err) {
    console.warn("[notifyAgencyOfLead] failed:", (err as Error).message);
  }
}
