import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Nouveau mot de passe · Baboo" };

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-8">
        <div className="mb-6 text-center">
          <p className="eyebrow">Mot de passe</p>
          <h1 className="display-xl mt-2 text-3xl">Choisissez un nouveau mot de passe.</h1>
        </div>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
            Lien invalide. Recommencez la procédure depuis
            <a className="ml-1 underline-offset-4 hover:underline" href="/mot-de-passe/oublie">
              /mot-de-passe/oublie
            </a>.
          </p>
        )}
      </div>
    </div>
  );
}
