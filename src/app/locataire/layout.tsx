import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LocataireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion?callbackUrl=/locataire/dossier");
  }
  return <>{children}</>;
}
