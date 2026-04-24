// Yousign — signature électronique du bail.
// Wrapper REST avec no-op fallback : si YOUSIGN_API_KEY manque, les
// fonctions retournent skipped et le flow UI tombe automatiquement
// sur l'upload manuel du PDF signé (flow Brique 5).
//
// API utilisée : Yousign Sign API v3 (https://developers.yousign.com).
// Endpoints clés :
//   POST /signature_requests                — crée une requête
//   POST /signature_requests/:id/documents  — upload le PDF
//   POST /signature_requests/:id/signers    — ajoute signataires
//   POST /signature_requests/:id/activate   — envoie les invitations
//   GET  /signature_requests/:id            — status
//   DELETE /signature_requests/:id          — annule
//
// Webhooks : Yousign envoie sur /api/webhooks/yousign, signés avec
// YOUSIGN_WEBHOOK_SECRET (HMAC SHA256 dans header X-Yousign-Signature).

type Result<T = object> =
  | ({ ok: true } & T)
  | { ok: false; skipped: true; reason: string }
  | { ok: false; error: string };

export function isYousignEnabled(): boolean {
  return !!process.env.YOUSIGN_API_KEY;
}

const API_BASE =
  process.env.YOUSIGN_API_BASE ??
  (process.env.YOUSIGN_ENV === "prod"
    ? "https://api.yousign.app/v3"
    : "https://api-sandbox.yousign.app/v3");

async function ysFetch<T>(
  method: string,
  path: string,
  body?: unknown,
  contentType = "application/json",
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${process.env.YOUSIGN_API_KEY!}`,
        ...(body
          ? contentType === "application/json"
            ? { "Content-Type": "application/json" }
            : {}
          : {}),
      },
      body:
        body && contentType === "application/json"
          ? JSON.stringify(body)
          : (body as BodyInit | undefined),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      return { ok: false, error: `Yousign ${res.status}: ${err.slice(0, 200)}` };
    }
    const data = (await res.json().catch(() => ({}))) as T;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Crée une procédure de signature complète : requête + document +
 * signataires + activation. Retourne l'id de la signature request.
 * L'upload du PDF se fait en multipart séparé.
 */
export async function createSignatureProcedure(opts: {
  name: string;
  pdfBuffer: Buffer | ArrayBuffer;
  signers: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: "landlord" | "tenant";
  }>;
  metadata?: Record<string, string>;
}): Promise<
  Result<{ signatureRequestId: string; signingUrls: Record<string, string> }>
> {
  if (!isYousignEnabled()) {
    return {
      ok: false,
      skipped: true,
      reason: "Yousign non configuré (fallback upload manuel).",
    };
  }

  // 1. Créer la signature request
  const req = await ysFetch<{ id: string }>(
    "POST",
    "/signature_requests",
    {
      name: opts.name,
      delivery_mode: "email",
      timezone: "Africa/Casablanca",
      ...(opts.metadata ? { external_id: JSON.stringify(opts.metadata) } : {}),
    },
  );
  if (!req.ok) return { ok: false, error: req.error };
  const srId = req.data.id;

  // 2. Upload du document PDF en multipart
  const form = new FormData();
  // Conversion via un ArrayBuffer frais pour satisfaire le typage
  // BlobPart strict de TS 5.7 (refuse SharedArrayBuffer implicite).
  const source =
    opts.pdfBuffer instanceof Buffer
      ? opts.pdfBuffer
      : Buffer.from(new Uint8Array(opts.pdfBuffer));
  const ab = new ArrayBuffer(source.byteLength);
  new Uint8Array(ab).set(source);
  const blob = new Blob([ab], { type: "application/pdf" });
  form.append("file", blob, `${opts.name.replace(/[^a-z0-9]/gi, "-")}.pdf`);
  form.append("nature", "signable_document");
  form.append("parse_anchors", "true");

  const docRes = await fetch(
    `${API_BASE}/signature_requests/${srId}/documents`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.YOUSIGN_API_KEY!}`,
      },
      body: form,
    },
  );
  if (!docRes.ok) {
    return {
      ok: false,
      error: `Yousign document upload ${docRes.status}`,
    };
  }

  // 3. Ajouter les signataires
  const signingUrls: Record<string, string> = {};
  for (const s of opts.signers) {
    const signer = await ysFetch<{ id: string; signature_link?: string }>(
      "POST",
      `/signature_requests/${srId}/signers`,
      {
        info: {
          first_name: s.firstName,
          last_name: s.lastName,
          email: s.email,
          phone_number: s.phone ?? undefined,
          locale: "fr",
        },
        signature_level: "electronic_signature",
        signature_authentication_mode: s.phone ? "otp_sms" : "no_otp",
      },
    );
    if (!signer.ok) return { ok: false, error: signer.error };
    if (signer.data.signature_link) {
      signingUrls[s.role] = signer.data.signature_link;
    }
  }

  // 4. Activer pour envoyer les emails
  const activate = await ysFetch<{ id: string }>(
    "POST",
    `/signature_requests/${srId}/activate`,
  );
  if (!activate.ok) return { ok: false, error: activate.error };

  return { ok: true, signatureRequestId: srId, signingUrls };
}

export async function getSignatureProcedure(
  signatureRequestId: string,
): Promise<Result<{ status: string; documents: Array<{ id: string }> }>> {
  if (!isYousignEnabled()) {
    return { ok: false, skipped: true, reason: "Yousign non configuré" };
  }
  const res = await ysFetch<{ status: string; documents: Array<{ id: string }> }>(
    "GET",
    `/signature_requests/${signatureRequestId}`,
  );
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, status: res.data.status, documents: res.data.documents };
}

export async function downloadSignedDocument(
  signatureRequestId: string,
  documentId: string,
): Promise<Result<{ buffer: Buffer }>> {
  if (!isYousignEnabled()) {
    return { ok: false, skipped: true, reason: "Yousign non configuré" };
  }
  try {
    const res = await fetch(
      `${API_BASE}/signature_requests/${signatureRequestId}/documents/${documentId}/download`,
      {
        headers: {
          Authorization: `Bearer ${process.env.YOUSIGN_API_KEY!}`,
        },
      },
    );
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const ab = await res.arrayBuffer();
    return { ok: true, buffer: Buffer.from(ab) };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function cancelSignatureProcedure(
  signatureRequestId: string,
): Promise<Result> {
  if (!isYousignEnabled()) {
    return { ok: false, skipped: true, reason: "Yousign non configuré" };
  }
  const res = await ysFetch<object>(
    "POST",
    `/signature_requests/${signatureRequestId}/cancel`,
    { reason: "Manuellement annulé par le bailleur" },
  );
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true };
}

/**
 * Vérifie la signature HMAC du webhook entrant. Yousign envoie
 * `X-Yousign-Signature-256` : sha256=<hex>.
 */
export async function verifyYousignWebhook(
  body: string,
  header: string | null,
): Promise<boolean> {
  if (!header) return false;
  const secret = process.env.YOUSIGN_WEBHOOK_SECRET;
  if (!secret) return false;
  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  // header peut être "sha256=abcdef..." ou juste "abcdef..."
  const provided = header.startsWith("sha256=") ? header.slice(7) : header;
  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(provided, "hex"),
    );
  } catch {
    return false;
  }
}
