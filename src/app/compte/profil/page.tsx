import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { ProfileForm } from "@/components/account/profile-form";
import { PasswordForm } from "@/components/account/password-form";

export const metadata: Metadata = { title: "Mon profil · Baboo" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/compte/profil");

  const user = hasDb()
    ? await db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, phone: true, image: true },
      })
    : null;

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/compte" className="hover:text-foreground">Mon compte</Link>
        <span className="mx-2">·</span>
        <span>Profil</span>
      </nav>

      <div className="border-b border-foreground/15 pb-6">
        <p className="eyebrow">Profil</p>
        <h1 className="display-xl mt-2 text-4xl md:text-5xl">Mes informations.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Votre nom et votre photo apparaissent dans vos conversations avec les agences.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="display-lg text-xl">Coordonnées</h2>
          <div className="mt-5">
            <ProfileForm
              initial={{
                name: user?.name ?? session.user.name ?? "",
                email: user?.email ?? session.user.email ?? "",
                phone: user?.phone ?? "",
                image: user?.image ?? "",
              }}
            />
          </div>
        </section>
        <section>
          <h2 className="display-lg text-xl">Mot de passe</h2>
          <div className="mt-5">
            <PasswordForm />
          </div>
        </section>
      </div>
    </div>
  );
}
