"use client";

import { useState, useTransition } from "react";
import { sendVerificationEmail } from "@/actions/email-verification";

export function EmailVerificationButton({ verified }: { verified: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (verified) {
    return (
      <span className="mono inline-flex rounded-full bg-success/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-success">
        Email vérifié
      </span>
    );
  }

  function onClick() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await sendVerificationEmail();
      if (res.ok) setMessage(res.message ?? "Envoyé.");
      else setError(res.error);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span className="mono inline-flex rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Email non vérifié
        </span>
        <button
          type="button"
          onClick={onClick}
          disabled={isPending}
          className="mono rounded-full border border-foreground/20 px-3 py-0.5 text-[10px] uppercase tracking-[0.12em] hover:border-foreground disabled:opacity-50"
        >
          {isPending ? "Envoi…" : "Renvoyer le lien"}
        </button>
      </div>
      {message && <p className="text-[11px] text-success">{message}</p>}
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  );
}
