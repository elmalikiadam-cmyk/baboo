import Link from "next/link";
import { WaitlistCard } from "@/components/auth/waitlist-card";

export const metadata = { title: "Connexion" };

export default function SignInPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-foreground/15 bg-surface p-8">
        <div className="mb-8 text-center">
          <p className="eyebrow">Bientôt</p>
          <h1 className="display-xl mt-2 text-3xl">Les comptes arrivent.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Pour l'instant, vos favoris et alertes sont stockés dans votre navigateur — pas besoin de compte. L'espace personnel synchronisé arrive bientôt.
          </p>
        </div>

        <WaitlistCard kind="connexion" />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          En attendant, profitez de vos{" "}
          <Link href="/favoris" className="font-medium text-foreground underline-offset-4 hover:underline">
            favoris
          </Link>{" "}
          et{" "}
          <Link href="/recherches" className="font-medium text-foreground underline-offset-4 hover:underline">
            alertes
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
