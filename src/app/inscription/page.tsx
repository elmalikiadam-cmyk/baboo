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
  const defaultRole =
    role === "agency" ? "AGENCY" : role === "developer" ? "DEVELOPER" : "USER";

  const copy = {
    USER: {
      eyebrow: "Inscription",
      title: "Créer votre compte.",
      subtitle: "Une adresse et un mot de passe, et vos favoris sont sauvegardés partout.",
    },
    AGENCY: {
      eyebrow: "Baboo Pro",
      title: "Rejoindre Baboo Pro.",
      subtitle: "Publiez vos annonces, recevez des leads qualifiés, suivez votre pipeline.",
    },
    DEVELOPER: {
      eyebrow: "Baboo Promoteur",
      title: "Rejoindre Baboo Promoteur.",
      subtitle: "Présentez vos programmes neufs, collectez demandes de brochure et visites.",
    },
  }[defaultRole];

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-md border border-foreground/15 bg-surface p-8">
        <div className="mb-8 text-center">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="display-xl mt-2 text-3xl">{copy.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>

        <SignUpForm defaultRole={defaultRole} />
      </div>
    </div>
  );
}
