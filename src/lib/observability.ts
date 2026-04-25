// Couche d'observabilité minimale, no-op par défaut.
// Si SENTRY_DSN est défini en env, on bascule sur Sentry (lazy import).
// Sinon, fallback console pour les erreurs critiques.
//
// Volontairement minimal : pas de SDK, pas de breadcrumbs custom, pas
// de tags. L'objectif V1 est d'avoir un point unique d'envoi pour
// pouvoir brancher Sentry / Datadog plus tard sans toucher au code
// métier.
//
// Usage :
//   import { captureError } from "@/lib/observability";
//   try { ... } catch (e) { captureError(e, { route: "/api/x" }); }

type Context = Record<string, string | number | boolean | null | undefined>;

export function isObservabilityEnabled(): boolean {
  return !!process.env.SENTRY_DSN;
}

export function captureError(err: unknown, context?: Context): void {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;

  if (isObservabilityEnabled()) {
    // Lazy import — Sentry n'est pas installé en V1 mais on prépare la
    // surface. Quand le package sera ajouté, ce branch s'activera tout
    // seul si SENTRY_DSN est défini.
    void sendToSentry(message, stack, context);
    return;
  }

  // Fallback : console.warn structuré pour grep/Vercel logs
  const tag = context ? JSON.stringify(context) : "";
  console.warn(`[observability] ${message} ${tag}`);
  if (stack && process.env.NODE_ENV !== "production") {
    console.warn(stack);
  }
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Context,
): void {
  if (isObservabilityEnabled()) {
    void sendToSentry(`[${level}] ${message}`, undefined, context);
    return;
  }
  if (level === "error") {
    console.error(`[observability] ${message}`, context ?? {});
  } else if (level === "warning") {
    console.warn(`[observability] ${message}`, context ?? {});
  }
}

async function sendToSentry(
  _message: string,
  _stack: string | undefined,
  _context: Context | undefined,
): Promise<void> {
  // Quand @sentry/nextjs sera ajouté :
  //   const Sentry = await import("@sentry/nextjs");
  //   Sentry.captureException(...) avec context.
  // Pour l'instant on no-op pour ne pas faire crasher en prod si
  // l'install n'a pas suivi.
  return;
}
