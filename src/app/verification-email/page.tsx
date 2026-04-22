import Link from "next/link";
import type { Metadata } from "next";
import { confirmEmailVerification } from "@/actions/email-verification";

export const metadata: Metadata = { title: "Vérification email · Baboo" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function EmailVerificationPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const res = token ? await confirmEmailVerification(token) : { ok: false, error: "Lien manquant." } as const;

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-md border border-border bg-cream p-8 text-center">
        <p className="eyebrow">Vérification email</p>
        {res.ok ? (
          <>
            <h1 className="display-xl mt-3 text-3xl">Email confirmé.</h1>
            <p className="mt-3 text-sm text-muted">
              Merci. Votre adresse est maintenant vérifiée.
            </p>
            <Link
              href="/compte"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-2.5 text-sm font-medium text-cream"
            >
              Aller à mon compte
            </Link>
          </>
        ) : (
          <>
            <h1 className="display-xl mt-3 text-3xl">Lien invalide.</h1>
            <p className="mt-3 text-sm text-muted">{res.error}</p>
            <Link
              href="/compte"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium"
            >
              Retour
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
