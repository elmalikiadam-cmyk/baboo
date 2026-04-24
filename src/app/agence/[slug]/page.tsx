import { redirect } from "next/navigation";

// Page agence publique retirée (voir /agences). Redirect vers l'accueil.
export const dynamic = "force-dynamic";

export default function AgencyDetailRedirect(): never {
  redirect("/");
}
