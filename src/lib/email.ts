// Helpers email — Resend si RESEND_API_KEY est défini. Sinon no-op silencieux.
// On évite d'ajouter une dépendance lourde : l'API REST Resend accepte un
// POST JSON simple, c'est suffisant pour notre besoin.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://baboo.ma"
  ).replace(/\/+$/, "");
}

export function hasEmailProvider(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM;
}

async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<void> {
  if (!hasEmailProvider()) return;
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
        reply_to: input.replyTo,
        subject: input.subject,
        text: input.text,
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn("[sendMail] resend non-200:", res.status, body.slice(0, 200));
    }
  } catch (err) {
    console.warn("[sendMail] failed:", (err as Error).message);
  }
}

interface LeadEmailInput {
  to: string;
  agencyName: string;
  listingTitle: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string | null;
  leadMessage: string;
}

export async function notifyAgencyOfLead(input: LeadEmailInput): Promise<void> {
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
  await sendMail({ to: input.to, subject, text, replyTo: input.leadEmail });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  name: string | null;
  token: string;
}): Promise<void> {
  const link = `${siteUrl()}/mot-de-passe/reinitialiser?token=${encodeURIComponent(input.token)}`;
  const text = [
    `Bonjour${input.name ? " " + input.name : ""},`,
    ``,
    `Vous avez demandé à réinitialiser votre mot de passe Baboo.`,
    `Cliquez sur le lien ci-dessous (valide 1 heure) pour choisir un nouveau mot de passe :`,
    ``,
    link,
    ``,
    `Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
  ].join("\n");
  await sendMail({ to: input.to, subject: "Réinitialisation de votre mot de passe · Baboo", text });
}

export async function sendEmailVerificationEmail(input: {
  to: string;
  name: string | null;
  token: string;
}): Promise<void> {
  const link = `${siteUrl()}/verification-email?token=${encodeURIComponent(input.token)}`;
  const text = [
    `Bonjour${input.name ? " " + input.name : ""},`,
    ``,
    `Merci de vous être inscrit sur Baboo. Pour vérifier votre adresse email, cliquez sur le lien ci-dessous (valide 24 heures) :`,
    ``,
    link,
    ``,
    `À bientôt sur Baboo.`,
  ].join("\n");
  await sendMail({ to: input.to, subject: "Vérifiez votre adresse email · Baboo", text });
}

export async function sendSavedSearchDigest(input: {
  to: string;
  name: string | null;
  searchName: string;
  listings: Array<{ title: string; slug: string; city: string; price: number }>;
}): Promise<void> {
  if (input.listings.length === 0) return;
  const PRICE = new Intl.NumberFormat("fr-FR");
  const body = input.listings
    .map(
      (l) =>
        `• ${l.title} — ${l.city} — ${PRICE.format(l.price)} MAD\n  ${siteUrl()}/annonce/${l.slug}`,
    )
    .join("\n\n");
  const text = [
    `Bonjour${input.name ? " " + input.name : ""},`,
    ``,
    `Voici les nouvelles annonces correspondant à votre recherche "${input.searchName}" :`,
    ``,
    body,
    ``,
    `—`,
    `Gérer vos alertes : ${siteUrl()}/recherches`,
  ].join("\n");
  await sendMail({
    to: input.to,
    subject: `${input.listings.length} nouvelle${input.listings.length > 1 ? "s" : ""} annonce${input.listings.length > 1 ? "s" : ""} · ${input.searchName}`,
    text,
  });
}
