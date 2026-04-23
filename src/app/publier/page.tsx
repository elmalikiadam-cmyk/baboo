import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { resolvePublishTarget } from "@/lib/publish-route";

export const metadata: Metadata = {
  title: "Publier une annonce — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Point d'entrée unique du CTA « Publier une annonce ».
 * Redirige vers la bonne étape selon l'état du user (voir
 * `src/lib/publish-route.ts`). Ne rend jamais rien — toujours un redirect.
 */
export default async function PublierEntryPage() {
  const target = await resolvePublishTarget();
  if (target.route === "/connexion") {
    redirect(`/connexion?callbackUrl=${encodeURIComponent(target.callbackUrl)}`);
  }
  redirect(target.route);
}
