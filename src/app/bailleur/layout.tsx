import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Layout espace bailleur — guard auth minimale.
 * Les autorisations plus fines (KYC approuvé, rôle BAILLEUR) sont
 * appliquées sur chaque page selon le contexte (onboarding est
 * accessible sans rôle BAILLEUR, dashboard l'exige).
 */
export default async function BailleurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion?callbackUrl=/publier");
  }
  return <>{children}</>;
}
