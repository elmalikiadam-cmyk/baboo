import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { CraftsmanForm } from "@/components/artisan/craftsman-form";

export const metadata: Metadata = {
  title: "Devenir artisan référencé — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function CraftsmanRegistrationPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion?callbackUrl=/pro/artisan/inscription");
  }

  const existing = hasDb()
    ? await db.craftsman.findUnique({
        where: { userId: session.user.id },
      })
    : null;

  return (
    <div className="container py-10 md:py-16">
      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Marketplace artisans</p>
        <h1 className="display-xl mt-2 text-4xl md:text-5xl">
          {existing ? "Modifier mon profil" : "Référencer mon activité"}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Inscrivez-vous gratuitement. Votre profil apparaît
          immédiatement dans l'annuaire. Le badge « vérifié » est
          attribué sous 48 h après validation de votre identité et de
          vos références par l'équipe Baboo.
        </p>
      </header>

      <div className="mt-10 max-w-3xl">
        <CraftsmanForm
          initial={
            existing
              ? {
                  displayName: existing.displayName,
                  speciality: existing.speciality,
                  description: existing.description,
                  phone: existing.phone,
                  whatsapp: existing.whatsapp,
                  email: existing.email,
                  serviceCitySlugs: existing.serviceCitySlugs,
                  rateInfo: existing.rateInfo,
                  photo: existing.photo,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
