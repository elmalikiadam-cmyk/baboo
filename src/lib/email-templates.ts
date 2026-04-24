// Templates d'emails transactionnels. Chaque template exporte une
// fonction qui produit { subject, html } à partir de paramètres typés.
// Rendu via src/lib/resend.ts → sendEmail(). No-op si Resend non
// configuré (console.log en dev).

import { renderEmailLayout, absoluteUrl } from "@/lib/resend";

// ───────────────────── Signup / auth ─────────────────────

export function signupWelcomeEmail(args: {
  name: string;
}) {
  return {
    subject: "Bienvenue sur Baboo",
    html: renderEmailLayout({
      title: `Bienvenue sur Baboo, ${args.name}`,
      preheader: "Commencez à chercher, publier ou candidater.",
      body: `
        <p>Votre compte est créé.</p>
        <p>Baboo, c'est tout l'immobilier marocain à un seul endroit : annonces vérifiées, candidature simplifiée, gestion locative intégrée.</p>
        <p>Quelques actions pour démarrer :</p>
        <ul style="margin:12px 0;padding-left:20px;">
          <li><a href="${absoluteUrl("/recherche")}" style="color:#c04e2e;">Explorer les annonces</a></li>
          <li><a href="${absoluteUrl("/publier")}" style="color:#c04e2e;">Publier un bien</a></li>
          <li><a href="${absoluteUrl("/locataire/dossier")}" style="color:#c04e2e;">Compléter votre dossier locataire</a></li>
        </ul>
      `,
      cta: { label: "Accéder à mon compte →", href: absoluteUrl("/compte") },
      footer: "Une question ? Répondez à cet email, un humain lira.",
    }),
  };
}

// ───────────────────── Candidatures ─────────────────────

export function applicationReceivedEmail(args: {
  landlordName: string;
  tenantName: string;
  listingTitle: string;
  score: number;
  scoreLabel: string;
  applicationId: string;
}) {
  return {
    subject: `Nouvelle candidature — ${args.listingTitle}`,
    html: renderEmailLayout({
      title: "Une candidature vient d'arriver",
      preheader: `${args.tenantName} a postulé à votre annonce.`,
      body: `
        <p>Bonjour ${args.landlordName},</p>
        <p><strong>${args.tenantName}</strong> vient de candidater sur <strong>${args.listingTitle}</strong>.</p>
        <p><strong>Score :</strong> ${args.score}/100 — ${args.scoreLabel}</p>
      `,
      cta: {
        label: "Voir la candidature →",
        href: absoluteUrl(`/bailleur/candidatures/${args.applicationId}`),
      },
    }),
  };
}

export function applicationAcceptedEmail(args: {
  tenantName: string;
  listingTitle: string;
  listingSlug: string;
}) {
  return {
    subject: `Candidature acceptée — ${args.listingTitle}`,
    html: renderEmailLayout({
      title: "Félicitations — votre candidature est acceptée",
      preheader: `${args.listingTitle} vous a choisi(e).`,
      body: `
        <p>Bonjour ${args.tenantName},</p>
        <p>Excellente nouvelle : votre candidature pour <strong>${args.listingTitle}</strong> vient d'être acceptée par le bailleur.</p>
        <p>Le bailleur va préparer le bail. Vous recevrez un prochain email dès qu'il sera prêt à signer.</p>
      `,
      cta: {
        label: "Mes candidatures →",
        href: absoluteUrl("/locataire/candidatures"),
      },
    }),
  };
}

export function applicationRejectedEmail(args: {
  tenantName: string;
  listingTitle: string;
  reason: string | null;
}) {
  return {
    subject: `Candidature — mise à jour`,
    html: renderEmailLayout({
      title: "Votre candidature n'a pas été retenue",
      body: `
        <p>Bonjour ${args.tenantName},</p>
        <p>Le bailleur a retenu un autre dossier pour <strong>${args.listingTitle}</strong>.</p>
        ${args.reason ? `<p style="font-style:italic;color:#5a6478;">Motif : « ${args.reason} »</p>` : ""}
        <p>D'autres biens vous attendent — continuez à postuler.</p>
      `,
      cta: {
        label: "Voir d'autres annonces →",
        href: absoluteUrl("/recherche?t=rent"),
      },
    }),
  };
}

// ───────────────────── Visites ─────────────────────

export function visitConfirmedEmail(args: {
  visitorName: string;
  listingTitle: string;
  when: string; // déjà formaté FR
  address: string;
}) {
  return {
    subject: `Visite confirmée — ${args.listingTitle}`,
    html: renderEmailLayout({
      title: "Votre visite est confirmée",
      body: `
        <p>Bonjour ${args.visitorName},</p>
        <p>Votre visite de <strong>${args.listingTitle}</strong> est confirmée :</p>
        <ul style="margin:12px 0;padding-left:20px;">
          <li><strong>${args.when}</strong></li>
          <li>${args.address}</li>
        </ul>
        <p>Un rappel vous sera envoyé 24 h avant.</p>
      `,
      cta: { label: "Mes visites →", href: absoluteUrl("/locataire/visites") },
    }),
  };
}

// ───────────────────── Bail ─────────────────────

export function leaseReadyForSignatureEmail(args: {
  tenantName: string;
  listingTitle: string;
  leaseId: string;
  hasESignature: boolean;
}) {
  return {
    subject: `Bail à signer — ${args.listingTitle}`,
    html: renderEmailLayout({
      title: "Votre bail est prêt",
      body: `
        <p>Bonjour ${args.tenantName},</p>
        <p>Le bail pour <strong>${args.listingTitle}</strong> a été généré par le bailleur.</p>
        ${args.hasESignature
          ? "<p>Cliquez ci-dessous pour signer électroniquement.</p>"
          : "<p>Téléchargez, imprimez, signez, et le bailleur retournera la version signée.</p>"}
      `,
      cta: {
        label: args.hasESignature ? "Signer le bail →" : "Consulter le bail →",
        href: absoluteUrl(`/locataire/baux/${args.leaseId}`),
      },
    }),
  };
}

export function leaseActivatedEmail(args: {
  tenantName: string;
  listingTitle: string;
  leaseId: string;
  startDate: string; // formatted
}) {
  return {
    subject: `Bail activé — bienvenue chez vous`,
    html: renderEmailLayout({
      title: "Votre bail est actif",
      body: `
        <p>Bonjour ${args.tenantName},</p>
        <p>Le bail de <strong>${args.listingTitle}</strong> est officiellement actif à partir du <strong>${args.startDate}</strong>.</p>
        <p>Vos quittances seront générées automatiquement à chaque paiement. Bienvenue chez vous.</p>
      `,
      cta: {
        label: "Mon bail →",
        href: absoluteUrl(`/locataire/baux/${args.leaseId}`),
      },
    }),
  };
}

// ───────────────────── Loyers ─────────────────────

export function rentReminderSoftEmail(args: {
  tenantName: string;
  listingTitle: string;
  dueDate: string;
  amount: string;
  leaseId: string;
}) {
  return {
    subject: `Loyer en attente — ${args.listingTitle}`,
    html: renderEmailLayout({
      title: "Votre loyer est en attente",
      body: `
        <p>Bonjour ${args.tenantName},</p>
        <p>Le loyer de <strong>${args.amount}</strong> pour <strong>${args.listingTitle}</strong> était dû le <strong>${args.dueDate}</strong>. Nous n'avons pas encore enregistré de paiement.</p>
        <p>Pouvez-vous nous confirmer le paiement ou nous indiquer la date prévue ?</p>
      `,
      cta: {
        label: "Déclarer un paiement →",
        href: absoluteUrl(`/locataire/baux/${args.leaseId}`),
      },
    }),
  };
}

export function rentReminderFormalEmail(args: {
  tenantName: string;
  listingTitle: string;
  dueDate: string;
  amount: string;
  daysLate: number;
  leaseId: string;
}) {
  return {
    subject: `Relance formelle — Loyer en retard ${args.daysLate}j`,
    html: renderEmailLayout({
      title: "Relance formelle — paiement requis",
      body: `
        <p>Bonjour ${args.tenantName},</p>
        <p>Nous n'avons toujours pas enregistré le paiement du loyer de <strong>${args.amount}</strong> pour <strong>${args.listingTitle}</strong>, dû le ${args.dueDate} (${args.daysLate} jours de retard).</p>
        <p>Merci de régulariser rapidement. Si le paiement a déjà été effectué, transmettez-nous le justificatif.</p>
      `,
      cta: {
        label: "Régler maintenant →",
        href: absoluteUrl(`/locataire/baux/${args.leaseId}`),
      },
      footer: "Au-delà de 30 jours, une mise en demeure formelle peut être engagée.",
    }),
  };
}

export function receiptGeneratedEmail(args: {
  tenantName: string;
  period: string; // "janvier 2026"
  amount: string;
  leaseId: string;
}) {
  return {
    subject: `Quittance ${args.period} émise`,
    html: renderEmailLayout({
      title: "Votre quittance est disponible",
      body: `
        <p>Bonjour ${args.tenantName},</p>
        <p>La quittance pour <strong>${args.period}</strong> (${args.amount}) est prête à télécharger.</p>
      `,
      cta: {
        label: "Télécharger →",
        href: absoluteUrl(`/locataire/baux/${args.leaseId}`),
      },
    }),
  };
}

// ───────────────────── KYC ─────────────────────

export function kycApprovedEmail(args: {
  userName: string;
}) {
  return {
    subject: "Votre dossier bailleur est approuvé",
    html: renderEmailLayout({
      title: "Bienvenue — vous pouvez publier",
      body: `
        <p>Bonjour ${args.userName},</p>
        <p>Votre dossier KYC bailleur vient d'être approuvé par notre équipe. Vous pouvez désormais publier vos biens en toute sérénité.</p>
      `,
      cta: {
        label: "Publier mon premier bien →",
        href: absoluteUrl("/pro/listings/new"),
      },
    }),
  };
}

export function kycRejectedEmail(args: {
  userName: string;
  reason: string;
}) {
  return {
    subject: "Votre dossier bailleur demande une correction",
    html: renderEmailLayout({
      title: "Complément requis sur votre dossier",
      body: `
        <p>Bonjour ${args.userName},</p>
        <p>Votre dossier KYC nécessite quelques ajustements :</p>
        <blockquote style="margin:12px 0;padding:12px;background:#ebe3d1;border-left:3px solid #c04e2e;font-style:italic;">${args.reason}</blockquote>
        <p>Vous pouvez re-soumettre votre dossier à tout moment.</p>
      `,
      cta: {
        label: "Corriger mon dossier →",
        href: absoluteUrl("/bailleur/onboarding"),
      },
    }),
  };
}

// ───────────────────── Alertes / saved search ─────────────────────

export function savedSearchMatchesEmail(args: {
  userName: string;
  searchName: string;
  matches: Array<{
    title: string;
    city: string;
    price: string;
    url: string;
    image?: string | null;
  }>;
  searchUrl: string;
  unsubscribeUrl: string;
}) {
  const rows = args.matches
    .slice(0, 5)
    .map(
      (m) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #ebe3d1;">
            ${m.image ? `<img src="${m.image}" width="72" height="54" style="border-radius:6px;object-fit:cover;vertical-align:middle;" alt="">` : ""}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #ebe3d1;vertical-align:middle;">
            <a href="${m.url}" style="font-weight:600;color:#1a2540;text-decoration:none;">${m.title}</a>
            <p style="margin:4px 0 0;font-size:12px;color:#5a6478;">${m.city} · <span style="color:#c04e2e;">${m.price}</span></p>
          </td>
        </tr>`,
    )
    .join("");

  return {
    subject: `${args.matches.length} nouvelle${args.matches.length > 1 ? "s" : ""} annonce${args.matches.length > 1 ? "s" : ""} — ${args.searchName}`,
    html: renderEmailLayout({
      title: `${args.matches.length} nouvelle${args.matches.length > 1 ? "s" : ""} annonce${args.matches.length > 1 ? "s" : ""} pour « ${args.searchName} »`,
      body: `
        <p>Bonjour ${args.userName},</p>
        <p>Voici les dernières annonces qui matchent votre alerte :</p>
        <table role="presentation" width="100%">${rows}</table>
      `,
      cta: { label: "Voir toutes les annonces →", href: args.searchUrl },
      footer: `Vous pouvez <a href="${args.unsubscribeUrl}" style="color:#c04e2e;">mettre en pause</a> cette alerte à tout moment.`,
    }),
  };
}

// ───────────────────── Notifications diverses ─────────────────────

export function messageReceivedEmail(args: {
  recipientName: string;
  senderName: string;
  preview: string;
  conversationId: string;
}) {
  return {
    subject: `Nouveau message de ${args.senderName}`,
    html: renderEmailLayout({
      title: `${args.senderName} vous a écrit`,
      body: `
        <p style="font-style:italic;color:#5a6478;">« ${args.preview} »</p>
      `,
      cta: {
        label: "Répondre →",
        href: absoluteUrl(`/messages/${args.conversationId}`),
      },
    }),
  };
}
