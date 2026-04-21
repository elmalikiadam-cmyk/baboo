"use client";

/**
 * Filet de sécurité si le RootLayout lui-même crashe (erreur pendant la
 * résolution des providers ou des polices). Ce fichier doit contenir
 * <html> et <body> car il remplace complètement l'arbre.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <main style={{ maxWidth: "40rem", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#666" }}>
            Erreur critique
          </p>
          <h1 style={{ fontSize: "2rem", marginTop: "0.5rem" }}>
            Le site rencontre un problème temporaire.
          </h1>
          <p style={{ marginTop: "0.75rem", color: "#555" }}>
            Nous avons été notifiés. Merci de réessayer dans un instant.
          </p>
          {error.digest && (
            <p style={{ fontFamily: "ui-monospace, monospace", marginTop: "1rem", fontSize: "0.75rem", color: "#888" }}>
              Réf · {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "9999px",
              background: "#0a0a0a",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
