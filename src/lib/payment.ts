// CMI / Youcan Pay — paiements en ligne MAD.
//
// V1 stub unique qui supporte les deux gateways via env `PAYMENT_GATEWAY`.
// No-op fallback si aucune clé configurée → /locataire/baux/[id]/payer
// affiche un message « paiement en ligne bientôt disponible » et le
// locataire peut toujours déclarer un paiement manuel.
//
// Pour CMI (Centre Monétique Interbancaire — standard Maroc) :
//   POST vers https://testpayment.cmi.co.ma/fim/est3Dgate avec un
//   payload signé HMAC SHA256. Le callback retour arrive en GET sur
//   /api/webhooks/cmi?... avec les champs validés.
//
// Pour Youcan Pay :
//   POST vers https://youcanpay.com/api/payments, webhook JSON signé.
//
// Ce module expose une API unifiée. Migration gateway = changement
// d'env sans modif code métier.

type CheckoutResult =
  | { ok: true; checkoutUrl: string; sessionId: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; error: string };

export function isPaymentEnabled(): boolean {
  return (
    process.env.PAYMENT_GATEWAY === "cmi" &&
    !!process.env.CMI_CLIENT_ID &&
    !!process.env.CMI_STORE_KEY
  ) || (
    process.env.PAYMENT_GATEWAY === "youcan" &&
    !!process.env.YOUCAN_PRIVATE_KEY
  );
}

export function paymentGateway(): "cmi" | "youcan" | null {
  if (!isPaymentEnabled()) return null;
  return (process.env.PAYMENT_GATEWAY as "cmi" | "youcan") ?? null;
}

/**
 * Crée une session de paiement. Retourne l'URL de redirect vers la
 * page de paiement hébergée par le gateway.
 *
 * @param opts.amount          MAD entiers
 * @param opts.referenceId     identifiant métier (ex: rentPeriodId)
 * @param opts.successUrl      URL de retour après paiement OK
 * @param opts.cancelUrl       URL de retour si annulation
 * @param opts.customerEmail   email du payeur
 * @param opts.description     texte court (« Loyer janvier 2026 »)
 */
export async function createCheckoutSession(opts: {
  amount: number;
  referenceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail: string;
  description: string;
}): Promise<CheckoutResult> {
  const gw = paymentGateway();
  if (!gw) {
    return {
      ok: false,
      skipped: true,
      reason: "Aucun gateway de paiement configuré.",
    };
  }

  if (gw === "youcan") {
    try {
      const res = await fetch("https://youcanpay.com/api/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.YOUCAN_PRIVATE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: opts.amount * 100, // centimes
          currency: "MAD",
          success_url: opts.successUrl,
          error_url: opts.cancelUrl,
          customer_email: opts.customerEmail,
          description: opts.description,
          order_id: opts.referenceId,
        }),
      });
      if (!res.ok) {
        return { ok: false, error: `Youcan ${res.status}` };
      }
      const json = (await res.json()) as {
        id: string;
        checkout_url: string;
      };
      return {
        ok: true,
        checkoutUrl: json.checkout_url,
        sessionId: json.id,
      };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  // CMI — signature HMAC SHA256 du formulaire
  if (gw === "cmi") {
    const { createHmac, randomBytes } = await import("node:crypto");
    const oid = `${opts.referenceId}-${randomBytes(4).toString("hex")}`;
    const rnd = randomBytes(8).toString("hex");
    const clientId = process.env.CMI_CLIENT_ID!;
    const storeKey = process.env.CMI_STORE_KEY!;
    const params: Record<string, string> = {
      clientid: clientId,
      storetype: "3d_pay_hosting",
      hashAlgorithm: "ver3",
      TranType: "PreAuth",
      amount: opts.amount.toFixed(2),
      currency: "504", // MAD ISO
      oid,
      okUrl: opts.successUrl,
      failUrl: opts.cancelUrl,
      lang: "fr",
      email: opts.customerEmail,
      rnd,
      BillToName: opts.customerEmail.split("@")[0] ?? "Client",
    };
    const hashFields = Object.keys(params)
      .sort()
      .map((k) => params[k].replace(/\|/g, "\\|").replace(/\\/g, "\\\\"))
      .join("|");
    const hash = createHmac("sha512", storeKey).update(hashFields).digest("base64");
    params.HASH = hash;

    // Le gateway CMI n'a pas d'API create-session — le formulaire se
    // POST côté client. On retourne donc l'URL du form + l'id de session
    // = oid ; le caller doit faire un POST HTML form.
    const url =
      process.env.CMI_ENV === "prod"
        ? "https://payment.cmi.co.ma/fim/est3Dgate"
        : "https://testpayment.cmi.co.ma/fim/est3Dgate";

    // On encode les params comme querystring pour permettre au caller
    // d'injecter un form HTML (POST) ou d'envoyer l'utilisateur sur un
    // relai qui fait le POST. Le sessionId = oid.
    const qs = new URLSearchParams(params).toString();
    return { ok: true, checkoutUrl: `${url}?${qs}`, sessionId: oid };
  }

  return { ok: false, error: `Gateway inconnu: ${gw}` };
}

/**
 * Vérifie la signature HMAC d'un webhook entrant.
 * Youcan : HMAC SHA256, header `x-payment-signature`.
 * CMI    : hash dans le body, recalcul identique à l'envoi.
 */
export async function verifyPaymentWebhook(
  rawBody: string,
  headers: Headers,
): Promise<boolean> {
  const gw = paymentGateway();
  if (!gw) return false;
  const { createHmac, timingSafeEqual } = await import("node:crypto");

  if (gw === "youcan") {
    const sig = headers.get("x-payment-signature");
    if (!sig) return false;
    const expected = createHmac("sha256", process.env.YOUCAN_PRIVATE_KEY!)
      .update(rawBody)
      .digest("hex");
    try {
      return timingSafeEqual(
        Buffer.from(expected, "hex"),
        Buffer.from(sig, "hex"),
      );
    } catch {
      return false;
    }
  }

  if (gw === "cmi") {
    // CMI retourne dans le body form-urlencoded avec HASH + HASHPARAMS.
    // On reconstruit et compare. Simplifié V1 — pour plus de robustesse,
    // lire HASHPARAMS qui liste les champs dans l'ordre.
    const params = new URLSearchParams(rawBody);
    const provided = params.get("HASH");
    const hashParams = params.get("HASHPARAMS");
    if (!provided || !hashParams) return false;
    const fields = hashParams.split(":").filter(Boolean);
    const concat = fields.map((f) => params.get(f) ?? "").join("|");
    const expected = createHmac("sha512", process.env.CMI_STORE_KEY!)
      .update(concat)
      .digest("base64");
    return provided === expected;
  }

  return false;
}
