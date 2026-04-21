import type { Metadata } from "next";
import Link from "next/link";
import { AccountDashboard } from "@/components/account/account-dashboard";

export const metadata: Metadata = { title: "Mon compte" };
export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        <span className="mx-2">·</span>
        <span>Mon compte</span>
      </nav>

      <div className="border-b border-foreground/15 pb-6">
        <p className="eyebrow">Espace personnel</p>
        <h1 className="display-xl mt-2 text-4xl md:text-6xl">Votre Baboo.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Pas encore de compte ? Vos favoris et alertes fonctionnent déjà, sauvegardés dans ce navigateur.
        </p>
      </div>

      <AccountDashboard />
    </div>
  );
}
