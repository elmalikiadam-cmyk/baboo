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

export async function sendVisitBookingConfirmation(input: {
  to: string;
  visitorName: string | null;
  listingTitle: string;
  city: string;
  startsAt: Date;
  managedByBaboo: boolean;
  manageUrl: string;
}): Promise<void> {
  const dateStr = input.startsAt.toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Casablanca",
  });
  const greeting = input.visitorName
    ? `Bonjour ${input.visitorName},`
    : `Bonjour,`;
  const lines = [
    greeting,
    ``,
    `Votre visite est réservée :`,
    `· ${input.listingTitle}`,
    `· ${input.city}`,
    `· ${dateStr}`,
    ``,
    input.managedByBaboo
      ? `Un agent Baboo vous accueillera sur place. Il vérifiera votre dossier et présentera le bien — préparez vos justificatifs (pièce d'identité, contrat de travail, derniers bulletins de salaire).`
      : `Le bailleur vous accueillera sur place. Soyez ponctuel ; en cas d'empêchement, prévenez via votre espace : ${input.manageUrl}`,
    ``,
    `Voir / annuler : ${input.manageUrl}`,
    ``,
    `— L'équipe Baboo`,
  ];
  await sendMail({
    to: input.to,
    subject: `Visite confirmée — ${input.listingTitle}`,
    text: lines.join("\n"),
  });
}

export async function sendSearchRequestConfirmation(input: {
  to: string;
  contactName: string;
  matchCount: number;
  city: string;
  transaction: "RENT" | "SALE";
  manageUrl: string;
}): Promise<void> {
  const txnLabel = input.transaction === "RENT" ? "louer" : "acheter";
  const lines =
    input.matchCount > 0
      ? [
          `Bonjour ${input.contactName},`,
          ``,
          `Bonne nouvelle : ${input.matchCount} annonce${input.matchCount > 1 ? "s" : ""} correspond${input.matchCount > 1 ? "ent" : ""} à votre recherche pour ${txnLabel} à ${input.city}.`,
          ``,
          `Détails par mail séparé. Vous pouvez aussi gérer vos recherches ici : ${input.manageUrl}`,
          ``,
          `— L'équipe Baboo`,
        ]
      : [
          `Bonjour ${input.contactName},`,
          ``,
          `Votre recherche pour ${txnLabel} à ${input.city} est bien enregistrée. Nous n'avons pas encore d'annonce qui colle parfaitement, mais on vous écrit dès qu'un nouveau bien correspondant est publié.`,
          ``,
          `Vous pouvez modifier ou annuler votre recherche à tout moment : ${input.manageUrl}`,
          ``,
          `— L'équipe Baboo`,
        ];
  await sendMail({
    to: input.to,
    subject:
      input.matchCount > 0
        ? `${input.matchCount} annonce${input.matchCount > 1 ? "s" : ""} pour vous · Baboo`
        : `Recherche enregistrée · Baboo`,
    text: lines.join("\n"),
  });
}

export async function sendPromoterWeeklyDigest(input: {
  to: string;
  developerName: string;
  visits: number;
  leads: number;
  messages: number;
  dashboardUrl: string;
}): Promise<void> {
  const text = [
    `Bonjour,`,
    ``,
    `Voici le récap de la semaine écoulée pour ${input.developerName} :`,
    ``,
    `• ${input.visits} visite${input.visits > 1 ? "s" : ""} organisées`,
    `• ${input.leads} lead${input.leads > 1 ? "s" : ""} qualifiés`,
    `• ${input.messages} message${input.messages > 1 ? "s" : ""} échangés`,
    ``,
    `Détail complet : ${input.dashboardUrl}`,
    ``,
    `— L'équipe Baboo`,
  ].join("\n");
  await sendMail({
    to: input.to,
    subject: `Rapport hebdo Baboo — ${input.developerName}`,
    text,
  });
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
