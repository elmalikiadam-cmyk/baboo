import { redirect } from "next/navigation";

// Ancien point d'entrée de la publication. Redirigé vers `/publier`
// (routage contextuel). Conservé pour les bookmarks et les anciens liens
// indexés. À supprimer une fois que le sitemap aura propagé la nouvelle
// URL canonique.
export const dynamic = "force-dynamic";

export default function LegacyProPublishRedirect() {
  redirect("/publier");
}
