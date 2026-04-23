// WhatsApp Business — Meta Cloud API.
//
// Envoi de messages transactionnels (confirmation de visite, rappel,
// statut de candidature) via l'API REST officielle. Pas de SDK
// supplémentaire — fetch natif.
//
// Quand les variables d'env ne sont pas fournies, le wrapper tombe
// en no-op et retourne { sent: false, skipped: true } — permet à
// l'app de marcher sans WhatsApp provisionné (dev, CI, pré-launch).
//
// Env attendues :
//   WHATSAPP_ACCESS_TOKEN       — token Meta Graph API (long-lived)
//   WHATSAPP_PHONE_NUMBER_ID    — id du numéro approuvé
//   WHATSAPP_APP_SECRET         — (optionnel) validation webhook entrant
//
// Pour la V1, on n'envoie que des messages « template » approuvés
// par Meta. Le contenu libre n'est autorisé que dans la fenêtre 24 h
// après un message entrant du client — à gérer plus tard.

type SendResult =
  | { sent: true; messageId: string }
  | { sent: false; skipped: true; reason: string }
  | { sent: false; error: string };

function isConfigured(): boolean {
  return (
    !!process.env.WHATSAPP_ACCESS_TOKEN &&
    !!process.env.WHATSAPP_PHONE_NUMBER_ID
  );
}

export function isWhatsAppEnabled(): boolean {
  return isConfigured();
}

/**
 * Normalise un numéro de téléphone marocain vers le format E.164
 * attendu par Meta (sans le +, juste chiffres).
 *   06 12 34 56 78  → 212612345678
 *   +212612345678   → 212612345678
 *   00212612345678  → 212612345678
 */
export function normalizePhoneMA(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("212")) return digits;
  if (digits.startsWith("00212")) return digits.slice(2);
  if (digits.startsWith("0") && digits.length >= 10) {
    return "212" + digits.slice(1);
  }
  return digits;
}

/**
 * Envoie un message « template » WhatsApp. Les templates doivent être
 * préalablement créés et approuvés côté Meta Business Manager.
 *
 * @param to         Numéro E.164 (ex: 212612345678)
 * @param template   Nom du template approuvé (ex: "visit_confirmation")
 * @param locale     Locale (ex: "fr", "ar")
 * @param variables  Variables positionnelles pour remplir {{1}}, {{2}}…
 */
export async function sendWhatsAppTemplate(opts: {
  to: string;
  template: string;
  locale?: string;
  variables?: string[];
}): Promise<SendResult> {
  if (!isConfigured()) {
    return { sent: false, skipped: true, reason: "WhatsApp non configuré" };
  }
  const phone = normalizePhoneMA(opts.to);
  if (!phone) {
    return { sent: false, error: "Numéro invalide" };
  }

  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: opts.template,
      language: { code: opts.locale ?? "fr" },
      components: opts.variables?.length
        ? [
            {
              type: "body",
              parameters: opts.variables.map((text) => ({
                type: "text",
                text,
              })),
            },
          ]
        : undefined,
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as {
      messages?: Array<{ id: string }>;
      error?: { message?: string };
    };
    if (!res.ok) {
      const msg = json.error?.message ?? `HTTP ${res.status}`;
      console.warn(`[whatsapp] send failed: ${msg}`);
      return { sent: false, error: msg };
    }
    const messageId = json.messages?.[0]?.id;
    if (!messageId) return { sent: false, error: "Pas d'id retourné" };
    return { sent: true, messageId };
  } catch (err) {
    const msg = (err as Error).message;
    console.warn(`[whatsapp] fetch failed: ${msg}`);
    return { sent: false, error: msg };
  }
}

/**
 * Envoie un message texte libre (uniquement dans la fenêtre 24 h
 * post-message-entrant). Utilisé pour les échanges bailleur↔candidat
 * initiés depuis l'app Baboo.
 */
export async function sendWhatsAppText(opts: {
  to: string;
  text: string;
}): Promise<SendResult> {
  if (!isConfigured()) {
    return { sent: false, skipped: true, reason: "WhatsApp non configuré" };
  }
  const phone = normalizePhoneMA(opts.to);
  if (!phone) return { sent: false, error: "Numéro invalide" };

  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: phone,
    type: "text",
    text: { body: opts.text.slice(0, 4000) },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as {
      messages?: Array<{ id: string }>;
      error?: { message?: string };
    };
    if (!res.ok) {
      return { sent: false, error: json.error?.message ?? `HTTP ${res.status}` };
    }
    const messageId = json.messages?.[0]?.id;
    if (!messageId) return { sent: false, error: "Pas d'id retourné" };
    return { sent: true, messageId };
  } catch (err) {
    return { sent: false, error: (err as Error).message };
  }
}
