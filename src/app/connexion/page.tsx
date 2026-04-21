import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInForm } from "@/components/auth/sign-in-form";

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
      <div className="w-full max-w-md rounded-3xl border border-foreground/15 bg-surface p-8">
        <div className="mb-8 text-center">
          <p className="eyebrow">Connexion</p>
          <h1 className="display-xl mt-2 text-3xl">Bon retour.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Accédez à vos favoris, alertes, et (pour les agences) à votre tableau de bord.
          </p>
        </div>

        <SignInForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
