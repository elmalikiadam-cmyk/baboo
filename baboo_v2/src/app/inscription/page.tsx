import type { Metadata } from "next";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Baboo en quelques secondes.",
};

interface Props {
  searchParams: Promise<{ role?: string }>;
}

export default async function SignUpPage({ searchParams }: Props) {
  const { role } = await searchParams;
  const isPro = role === "pro";

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12 md:py-20">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 md:p-8">
        <div className="mb-8 text-center">
          <p className="eyebrow">{isPro ? "Baboo Pro" : "Inscription"}</p>
          <h1 className="display-lg mt-2">
            {isPro ? (
              <>
                Rejoindre <span className="italic">Baboo Pro.</span>
              </>
            ) : (
              <>
                Créer <span className="italic">votre compte.</span>
              </>
            )}
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            {isPro
              ? "Un formulaire court, un humain vous contacte dans la journée."
              : "Vos favoris et alertes sauvegardés, partout."}
          </p>
        </div>

        {/* TODO : brancher la création de compte (pas implémentée dans cette V2 front). */}
        <form className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" name="name" autoComplete="name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
            <p className="eyebrow-muted mt-1">8 caractères minimum</p>
          </div>

          <Button type="submit" size="lg" className="w-full">
            {isPro ? "Créer mon compte Pro" : "Créer mon compte"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-accent underline underline-offset-4 hover:text-accent/80">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
