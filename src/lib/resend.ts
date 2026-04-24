// Resend — emails transactionnels.
//
// Wrapper REST avec no-op fallback quand RESEND_API_KEY manque. Permet
// à l'app de tourner en dev ou pré-launch sans crasher, les emails
// sont simplement loggés en console.
//
// Templates stockés dans src/emails/*.tsx (inline HTML via
// @react-email/components — on évite la dépendance en générant du
// HTML simple pour V1, facile à migrer vers react-email plus tard).

type SendResult =
  | { sent: true; id: string }
  | { sent: false; skipped: true; reason: string }
  | { sent: false; error: string };

export function isResendEnabled(): boolean {
  return !!process.env.RESEND_API_KEY;
}

const FROM_DEFAULT =
  process.env.RESEND_FROM ?? "Baboo <no-reply@baboo.ma>";
const BASE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "https://baboov3.vercel.app").replace(/\/+$/, "");

/**
 * Envoie un email via l'API Resend. Retourne silencieusement skipped
 * si l'API key n'est pas configurée — l'appelant ne doit pas traiter
 * ça comme une erreur métier.
 */
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}): Promise<SendResult> {
  if (!isResendEnabled()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[resend:noop] to=${opts.to} subject="${opts.subject}"`);
    }
    return { sent: false, skipped: true, reason: "Resend non configuré" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: opts.from ?? FROM_DEFAULT,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        reply_to: opts.replyTo,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[resend] ${res.status}: ${body.slice(0, 200)}`);
      return { sent: false, error: `HTTP ${res.status}` };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    if (!json.id) return { sent: false, error: "Pas d'id retourné" };
    return { sent: true, id: json.id };
  } catch (err) {
    return { sent: false, error: (err as Error).message };
  }
}

/** URL absolue à partir d'un chemin relatif, pour les boutons emails. */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${p}`;
}

/**
 * Template HTML minimal, cohérent avec le design system V3 (cream +
 * midnight + terracotta). Pas de dépendance React Email pour V1 —
 * string templating direct, facile à évoluer plus tard.
 */
export function renderEmailLayout(opts: {
  title: string;
  preheader?: string;
  body: string;
  cta?: { label: string; href: string };
  footer?: string;
}): string {
  const ctaHtml = opts.cta
    ? `
      <tr>
        <td style="padding: 24px 32px 0;">
          <a href="${opts.cta.href}" style="display:inline-block;background:#c04e2e;color:#f3ecdd;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:600;font-size:15px;padding:12px 28px;border-radius:9999px;text-decoration:none;">
            ${opts.cta.label}
          </a>
        </td>
      </tr>`
    : "";
  const footerHtml = opts.footer
    ? `<p style="color:#5a6478;font-size:12px;margin:32px 32px 0;line-height:1.5;">${opts.footer}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#f3ecdd;color:#1a2540;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>` : ""}
  <table role="presentation" width="100%" style="background:#f3ecdd;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" style="background:#ffffff;border-radius:12px;max-width:100%;">
          <tr>
            <td style="padding: 32px 32px 0;">
              <p style="margin:0;font-family:Georgia,serif;font-size:20px;font-weight:600;color:#1a2540;">baboo<span style="color:#c04e2e;">.</span></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px 0;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:600;color:#1a2540;line-height:1.25;">${opts.title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 0;font-size:15px;line-height:1.55;color:#2a3655;">${opts.body}</td>
          </tr>
          ${ctaHtml}
          ${footerHtml ? `<tr><td>${footerHtml}</td></tr>` : ""}
          <tr><td style="padding:32px 32px 32px;border-top:1px solid #ebe3d1;margin-top:24px;"><p style="color:#5a6478;font-size:11px;margin:16px 0 0;">Baboo — L'immobilier au Maroc.<br>Vous recevez cet email parce que vous avez un compte Baboo. <a href="${BASE_URL}/compte" style="color:#c04e2e;">Préférences de notification</a>.</p></td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
