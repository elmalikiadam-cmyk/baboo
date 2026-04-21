import Link from "next/link";
import Image from "next/image";
import { IconButton } from "@/components/ui/icon-button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Share2, Heart } from "@/components/ui/icons";

interface GalleryImage {
  url: string;
  alt?: string | null;
}

interface Props {
  images: GalleryImage[];
  cover: string;
  title: string;
  transactionLabel: string;
  propertyTypeLabel: string;
}

/**
 * Hero image de la fiche détail.
 * Mobile : pleine largeur, 420px.
 * Desktop : ratio 16:10.
 */
export function ListingGallery({
  images,
  cover,
  title,
  transactionLabel,
  propertyTypeLabel,
}: Props) {
  const photos = images.length > 0 ? images : [{ url: cover, alt: title }];
  const total = Math.max(photos.length, 1);

  return (
    <div className="relative h-[420px] w-full overflow-hidden bg-surface-warm md:h-auto md:aspect-[16/10] md:rounded-2xl">
      <Image
        src={photos[0].url}
        alt={photos[0].alt ?? title}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 66vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 dot-pattern" aria-hidden />

      {/* Top nav */}
      <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between md:top-6">
        <Link href="/recherche" aria-label="Retour aux annonces">
          <IconButton variant="floating" size="md">
            <ChevronLeft size={20} strokeWidth={1.8} />
          </IconButton>
        </Link>
        <div className="flex gap-2">
          <IconButton variant="floating" size="md" aria-label="Partager">
            <Share2 size={16} strokeWidth={1.8} />
          </IconButton>
          <IconButton variant="floating" size="md" aria-label="Ajouter aux favoris">
            <Heart size={16} strokeWidth={1.8} />
          </IconButton>
        </div>
      </div>

      {/* Transaction sticker bottom-left */}
      <div className="absolute bottom-4 left-4 z-10">
        <Badge tone="light" size="md" shape="sticker">
          {transactionLabel} · {propertyTypeLabel}
        </Badge>
      </div>

      {/* Compteur photos bottom-right */}
      <div className="absolute bottom-4 right-4 z-10 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-semibold text-ink-foreground backdrop-blur">
        1 / {total}
      </div>
    </div>
  );
}
