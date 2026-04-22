// PR #5 V2 — ListingCard éditoriale
//
// Fichier : src/components/listing/listing-card.tsx (remplacement complet)
//
// Changements clés vs V1 brutaliste :
// - Card entière en rounded-2xl (16px), plus en bordure rectangulaire
// - Fond surface (blanc) avec ombre légère au hover
// - Badge éditorial sur la photo : COUP DE CŒUR / NOUVEAU / EXCLUSIF / À LA UNE
// - Bouton favori rond dans cercle cream translucide
// - Prix en Fraunces 20-22px semibold
// - Localisation en Inter 13px normale (pas de caps)
// - Meta en mono 11px avec séparateurs ·

import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatSurface } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings-query";
import { FavoriteButton } from "@/components/listing/favorite-button";

interface ListingCardProps {
  listing: ListingWithRelations;
  priority?: boolean;
}

export function ListingCard({ listing, priority }: ListingCardProps) {
  const isRent = listing.transaction === "RENT";
  const href = `/annonce/${listing.slug}`;

  // Détermine le badge éditorial à afficher (un seul, ordre de priorité)
  const editorialBadge = getEditorialBadge(listing);

  return (
    <article className="group relative flex flex-col rounded-2xl bg-surface overflow-hidden border border-line transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-cream-2">
        <Image
          src={listing.coverImage}
          alt={`${listing.title} à ${listing.neighborhood?.name ?? listing.city.name}`}
          fill
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          priority={priority}
        />

        {/* Badge éditorial — en haut à gauche de la photo */}
        {editorialBadge && (
          <span className={`badge ${editorialBadge.className} absolute top-3 left-3`}>
            {editorialBadge.label}
          </span>
        )}

        {/* Bouton favori — cercle cream translucide en haut à droite */}
        <div className="absolute top-3 right-3">
          <FavoriteButton slug={listing.slug} variant="floating" />
        </div>
      </Link>

      <Link href={href} className="flex flex-1 flex-col p-4">
        {/* Prix principal */}
        <div className="flex items-baseline gap-1.5">
          <span className="display-md font-semibold text-midnight">
            {formatPrice(listing.price)}
          </span>
          <span className="mono-sm text-muted-foreground">
            {isRent ? "MAD/mois" : "MAD"}
          </span>
        </div>

        {/* Titre + localisation */}
        <h3 className="display-md mt-1.5 text-midnight line-clamp-1">
          {listing.title}
        </h3>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {listing.neighborhood?.name ? `${listing.city.name} · ${listing.neighborhood.name}` : listing.city.name}
        </p>

        {/* Divider pointillé */}
        <div className="my-3 border-t border-dashed border-line" />

        {/* Métadonnées en mono */}
        <p className="mono text-[11px] tracking-[0.08em] text-muted-foreground">
          {formatSurface(listing.surface)}
          {listing.bedrooms != null && ` · ${listing.bedrooms} CH`}
          {listing.bathrooms != null && ` · ${listing.bathrooms} SDB`}
          {listing.pool && ` · PISCINE`}
        </p>
      </Link>
    </article>
  );
}

/**
 * Détermine quel badge afficher en haut de la card.
 * Un seul badge à la fois — ordre de priorité : coup de cœur > exclusif > nouveau > à la une.
 */
function getEditorialBadge(listing: ListingWithRelations): { label: string; className: string } | null {
  // À adapter selon les flags réellement disponibles sur le modèle Prisma.
  // Si ces champs n'existent pas encore, voir la section "Migration" en bas du fichier.

  if ((listing as any).coupDeCoeur) {
    return { label: "Coup de cœur", className: "badge-coup-de-coeur" };
  }
  if ((listing as any).exclusive) {
    return { label: "Exclusif", className: "badge-exclusif" };
  }
  if (isNew(listing)) {
    return { label: "Nouveau", className: "badge-nouveau" };
  }
  if ((listing as any).featured) {
    return { label: "À la une", className: "badge-a-la-une" };
  }
  return null;
}

function isNew(listing: ListingWithRelations): boolean {
  const date = (listing as any).publishedAt ?? (listing as any).createdAt;
  if (!date) return false;
  const published = typeof date === "string" ? new Date(date) : date;
  const daysSince = (Date.now() - published.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince <= 7;
}


/* ============================================================================
   Migration Prisma — champs à ajouter au modèle Listing
   ============================================================================

   Dans prisma/schema.prisma, ajouter au modèle Listing :

     coupDeCoeur Boolean @default(false)  // sélection éditoriale manuelle
     exclusive   Boolean @default(false)  // exclusivité Baboo
     featured    Boolean @default(false)  // déjà présent probablement ?
     publishedAt DateTime?                // date de publication officielle

   Ces flags sont utilisés pour les badges. Ils doivent être toggle-ables
   depuis /admin (section PR complémentaire à prévoir).

   Migration :
     pnpm prisma migrate dev --name add_editorial_flags

   Seed à mettre à jour : marquer ~15-20% des annonces comme coupDeCoeur,
   ~5% comme exclusive, pour avoir un mix visuel cohérent à la home.

   ============================================================================ */


/* ============================================================================
   Patch complémentaire : FavoriteButton variant="floating"
   Fichier : src/components/listing/favorite-button.tsx
   ============================================================================

   Ajouter un nouveau variant "floating" pour les cards d'annonces :
   cercle cream translucide avec blur, contraste avec la photo.

   Dans le composant existant, ajouter :

   interface Props {
     slug: string;
     size?: "sm" | "md";
     variant?: "default" | "floating";
     position?: "top-right" | "inline";
   }

   Et dans le rendu, si variant === "floating" :

     className={cn(
       "grid place-items-center rounded-full transition",
       size === "sm" ? "h-9 w-9" : "h-11 w-11",
       variant === "floating"
         ? "bg-cream/90 backdrop-blur-sm border border-cream-2 hover:bg-cream"
         : "border border-midnight bg-cream hover:bg-cream-2",
       active && "text-terracotta",
     )}

     // Icône cœur rempli terracotta si actif, outline midnight sinon

   ============================================================================ */
