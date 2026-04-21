import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = { title: "Créer un compte" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ role?: string }>;
};

export default async function SignUpPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.agencyId ? "/pro/dashboard" : "/compte");
  }

  const { role } = await searchParams;
  const defaultRole = role === "agency" ? "AGENCY" : "USER";

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-md border border-foreground/15 bg-surface p-8">
        <div className="mb-8 text-center">
          <p className="eyebrow">{defaultRole === "AGENCY" ? "Baboo Pro" : "Inscription"}</p>
          <h1 className="display-xl mt-2 text-3xl">
            {defaultRole === "AGENCY" ? "Rejoindre Baboo Pro." : "Créer votre compte."}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {defaultRole === "AGENCY"
              ? "Publiez vos annonces, recevez des leads qualifiés, suivez votre pipeline."
              : "Une adresse et un mot de passe, et vos favoris sont sauvegardés partout."}
          </p>
        </div>

        <SignUpForm defaultRole={defaultRole} />
      </div>
    </div>
  );
}
