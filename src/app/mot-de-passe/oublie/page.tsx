import type { Metadata } from "next";
import { RequestResetForm } from "@/components/auth/request-reset-form";

export const metadata: Metadata = { title: "Mot de passe oublié · Baboo" };

export default function ForgotPasswordPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-8">
        <div className="mb-6 text-center">
          <p className="eyebrow">Mot de passe</p>
          <h1 className="display-xl mt-2 text-3xl">Réinitialiser mon accès.</h1>
          <p className="mt-3 text-sm text-ink-muted">
            Entrez votre email. Si un compte existe, vous recevrez un lien valable une heure.
          </p>
        </div>
        <RequestResetForm />
      </div>
    </div>
  );
}
