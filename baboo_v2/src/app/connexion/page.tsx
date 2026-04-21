import type { Metadata } from "next";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte Baboo.",
};

export default function SignInPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12 md:py-20">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 md:p-8">
        <div className="mb-8 text-center">
          <p className="eyebrow-muted">Connexion</p>
          <h1 className="display-lg mt-2">
            <span className="italic">Bon retour.</span>
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Vos favoris, vos alertes et — pour les pros — votre tableau de bord.
          </p>
        </div>

        {/* TODO : brancher l'authentification serveur (pas implémentée dans cette V2 front). */}
        <form className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link
                href="/mot-de-passe/oublie"
                className="text-xs font-medium text-accent underline underline-offset-4 hover:text-accent/80"
              >
                Oublié ?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
            />
          </div>

          <Button type="submit" size="lg" className="w-full">
            Se connecter
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-accent underline underline-offset-4 hover:text-accent/80">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
