import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { ListingForm } from "@/components/pro/listing-form";

export const metadata: Metadata = { title: "Modifier l'annonce · Baboo Pro" };
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  const agencyId = session.user.agencyId;
  if (!agencyId) redirect("/pro");

  if (!hasDb()) notFound();
  const { id } = await params;

  const listing = await db.listing
    .findUnique({
      where: { id },
      include: {
        neighborhood: { select: { slug: true } },
        images: { orderBy: { position: "asc" }, select: { url: true } },
      },
    })
    .catch(() => null);

  if (!listing) notFound();
  if (listing.agencyId !== agencyId) redirect("/pro/listings");

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        <Link href="/pro/dashboard" className="hover:text-ink">Tableau de bord</Link>
        <span className="mx-2">·</span>
        <Link href="/pro/listings" className="hover:text-ink">Mes annonces</Link>
        <span className="mx-2">·</span>
        <span>Modifier</span>
      </nav>

      <div className="border-b border-border pb-6">
        <p className="eyebrow">Édition</p>
        <h1 className="display-xl mt-2 text-4xl md:text-5xl">{listing.title}</h1>
      </div>

      <div className="mt-10 max-w-3xl">
        <ListingForm
          editId={listing.id}
          initial={{
            title: listing.title,
            description: listing.description,
            transaction: listing.transaction,
            propertyType: listing.propertyType,
            price: listing.price,
            surface: listing.surface,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            citySlug: listing.citySlug,
            neighborhoodSlug: listing.neighborhood?.slug ?? null,
            coverImage: listing.coverImage,
            additionalImages: listing.images.map((i) => i.url).join("\n"),
            condition: listing.condition,
            parking: listing.parking,
            elevator: listing.elevator,
            furnished: listing.furnished,
            terrace: listing.terrace,
            balcony: listing.balcony,
            garden: listing.garden,
            pool: listing.pool,
            seaView: listing.seaView,
            airConditioning: listing.airConditioning,
          }}
        />
      </div>
    </div>
  );
}
