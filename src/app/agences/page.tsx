import { redirect } from "next/navigation";

// Les agences ne sont plus exposées dans la surface publique (repositionnement
// stratégique Q4 2025 — Baboo s'adresse désormais directement aux particuliers
// et aux promoteurs). Redirect server-side vers l'accueil.
// Les modèles Agency et AgencyMember restent en base pour réouverture éventuelle.
export const dynamic = "force-dynamic";

export default function AgenciesRedirect(): never {
  redirect("/");
}
