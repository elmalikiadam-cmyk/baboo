import Link from "next/link";
import Image from "next/image";
import { IconButton } from "@/components/ui/icon-button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeftIcon, ShareIcon, HeartIcon } from "@/components/ui/icons";

interface Media {
  url: string;
  alt?: string | null;
}

interface Props {
  cover: string;
  images: Media[];
  title: string;
  transactionLabel: string;
  propertyTypeLabel: string;
}

/**
 * Hero photo de la fiche détail. V2 :
 * - Mobile : full-bleed 420px
 * - Desktop : ratio 16:10, rounded-2xl
 * - Top : retour (floating) + partage + cœur
 * - Bottom : sticker transaction + compteur photos
 */
export function ListingGallery({
  cover,
  images,
  title,
  transactionLabel,
  propertyTypeLabel,
}: Props) {
  const photos = images.length > 0 ? images : [{ url: cover, alt: title }];
  const primary = photos[0];
  const total = Math.max(photos.length, 1);

  return (
    <div className="relative h-[420px] w-full overflow-hidden bg-cream-2 md:h-auto md:aspect-[16/10] md:rounded-2xl">
      <Image
        src={primary.url}
        alt={primary.alt ?? title}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 66vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 dot-pattern" aria-hidden />

      {/* Top controls */}
      <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between md:top-6">
        <Link href="/recherche" aria-label="Retour aux annonces">
          <IconButton variant="floating" size="md">
            <ChevronLeftIcon className="h-5 w-5" />
          </IconButton>
        </Link>
        <div className="flex gap-2">
          <IconButton variant="floating" size="md" aria-label="Partager">
            <ShareIcon className="h-4 w-4" />
          </IconButton>
          <IconButton variant="floating" size="md" aria-label="Ajouter aux favoris">
            <HeartIcon className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {/* Sticker transaction + type */}
      <div className="absolute bottom-4 left-4 z-10">
        <Badge tone="light" size="md" shape="sticker">
          {transactionLabel} · {propertyTypeLabel}
        </Badge>
      </div>

      {/* Compteur photos */}
      <div className="absolute bottom-4 right-4 z-10 rounded-full bg-midnight/70 px-3 py-1.5 text-xs font-semibold text-cream backdrop-blur">
        1 / {total}
      </div>
    </div>
  );
}
