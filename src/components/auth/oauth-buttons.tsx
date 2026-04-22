"use client";

import { useTransition } from "react";
import { signInWithProvider } from "@/actions/auth";

export function OAuthButtons({ google, facebook }: { google: boolean; facebook: boolean }) {
  const [isPending, startTransition] = useTransition();

  function onClick(provider: "google" | "facebook") {
    startTransition(async () => {
      await signInWithProvider(provider);
    });
  }

  return (
    <div className="space-y-2">
      {google && (
        <button
          type="button"
          onClick={() => onClick("google")}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-surface-warm disabled:opacity-50"
        >
          <GoogleMark />
          Continuer avec Google
        </button>
      )}
      {facebook && (
        <button
          type="button"
          onClick={() => onClick("facebook")}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1877F2] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#166fd8] disabled:opacity-50"
        >
          <FacebookMark />
          Continuer avec Facebook
        </button>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.65 4.1-5.35 4.1A5.9 5.9 0 0 1 6.1 12 5.9 5.9 0 0 1 12 6.1c1.7 0 2.83.72 3.48 1.34l2.37-2.28C16.35 3.8 14.37 3 12 3A9 9 0 1 0 21.35 11.1Z"
        fill="#4285F4"
      />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.47h-1.27c-1.25 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.33V21.88A10 10 0 0 0 22 12Z"
        fill="#fff"
      />
    </svg>
  );
}
