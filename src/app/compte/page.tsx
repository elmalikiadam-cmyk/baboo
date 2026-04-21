import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { AccountDashboard } from "@/components/account/account-dashboard";

export const metadata: Metadata = { title: "Mon compte" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        <span className="mx-2">·</span>
        <span>Mon compte</span>
      </nav>

      <div className="border-b border-foreground/15 pb-6">
        {user ? (
          <>
            <p className="eyebrow">Connecté · {user.email}</p>
            <h1 className="display-xl mt-2 text-4xl md:text-6xl">
              Bonjour, {user.name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "vous"}.
            </h1>
            {user.agencyName && (
              <p className="mono mt-3 inline-flex rounded-full bg-foreground px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-background">
                {user.agencyName}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="eyebrow">Espace personnel</p>
            <h1 className="display-xl mt-2 text-4xl md:text-6xl">Votre Baboo.</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Pas connecté ? Vos favoris et alertes fonctionnent déjà, sauvegardés dans ce navigateur.{" "}
              <Link href="/connexion" className="font-medium text-foreground underline-offset-4 hover:underline">
                Connectez-vous
              </Link>{" "}
              pour les synchroniser entre appareils.
            </p>
          </>
        )}
      </div>

      <AccountDashboard isSignedIn={!!user} isAgency={user?.role === "AGENCY"} />
    </div>
  );
}
