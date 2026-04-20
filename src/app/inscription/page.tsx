import Link from "next/link";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Créer un compte" };

export default function SignUpPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-foreground/15 bg-surface p-8">
        <div className="mb-8 text-center">
          <h1 className="display-xl text-3xl">Créer un compte.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Une adresse suffit. Pas de spam, jamais de revente de données.
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          <Button type="submit" size="lg" className="w-full">Créer mon compte</Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-medium text-foreground underline-offset-4 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
