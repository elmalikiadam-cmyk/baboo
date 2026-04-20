import Link from "next/link";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Connexion" };

export default function SignInPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-foreground/15 bg-surface p-8">
        <div className="mb-8 text-center">
          <h1 className="display-xl text-3xl">Se connecter.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sauvegardez vos favoris, créez des alertes, suivez vos recherches.
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" size="lg" className="w-full">Se connecter</Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-foreground underline-offset-4 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
