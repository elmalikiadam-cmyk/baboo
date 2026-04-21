import Link from "next/link";
import { WaitlistCard } from "@/components/auth/waitlist-card";

export const metadata = { title: "Créer un compte" };

export default function SignUpPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-foreground/15 bg-surface p-8">
        <div className="mb-8 text-center">
          <p className="eyebrow">Bientôt</p>
          <h1 className="display-xl mt-2 text-3xl">Inscrivez-vous à la liste.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Les comptes Baboo arrivent dans quelques semaines. Laissez votre email et on vous prévient à l'ouverture.
          </p>
        </div>

        <WaitlistCard kind="inscription" />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          En attendant,{" "}
          <Link href="/recherche" className="font-medium text-foreground underline-offset-4 hover:underline">
            parcourez les annonces
          </Link>{" "}
          sans compte.
        </p>
      </div>
    </div>
  );
}
