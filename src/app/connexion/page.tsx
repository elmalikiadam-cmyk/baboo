import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInForm } from "@/components/auth/sign-in-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { oauthProviderStatus } from "@/actions/auth";

export const metadata = { title: "Connexion" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session?.user) {
    redirect(callbackUrl ?? (session.user.agencyId ? "/pro/dashboard" : "/compte"));
  }

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-md border border-foreground/15 bg-surface p-8">
        <div className="mb-8 text-center">
          <p className="eyebrow">Connexion</p>
          <h1 className="display-xl mt-2 text-3xl">Bon retour.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Accédez à vos favoris, alertes, et (pour les agences) à votre tableau de bord.
          </p>
        </div>

        <SignInForm callbackUrl={callbackUrl} />

        <OAuthSection />
      </div>
    </div>
  );
}

async function OAuthSection() {
  const status = await oauthProviderStatus();
  if (!status.google && !status.facebook) return null;
  return (
    <>
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-foreground/15" />
        <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">ou</span>
        <span className="h-px flex-1 bg-foreground/15" />
      </div>
      <OAuthButtons google={status.google} facebook={status.facebook} />
    </>
  );
}
