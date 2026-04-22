import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { ListingForm } from "@/components/pro/listing-form";

export const metadata: Metadata = { title: "Nouvelle annonce · Baboo Pro" };
export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/pro/listings/new");
  if (session.user.role !== "AGENCY" || !session.user.agencyId) {
    redirect("/pro");
  }

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <Link href="/pro/dashboard" className="hover:text-midnight">Tableau de bord</Link>
        <span className="mx-2">·</span>
        <Link href="/pro/listings" className="hover:text-midnight">Mes annonces</Link>
        <span className="mx-2">·</span>
        <span>Nouvelle annonce</span>
      </nav>

      <div className="border-b border-border pb-6">
        <p className="eyebrow">Nouvelle annonce</p>
        <h1 className="display-xl mt-2 text-4xl md:text-6xl">Publier un bien.</h1>
        <p className="mt-3 max-w-xl text-muted">
          L'annonce apparaît immédiatement sur Baboo après publication. Vous pouvez la modifier ou l'archiver à tout moment.
        </p>
      </div>

      <div className="mt-10 max-w-3xl">
        <ListingForm />
      </div>
    </div>
  );
}
