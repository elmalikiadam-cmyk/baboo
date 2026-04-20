import Image from "next/image";

interface Media {
  url: string;
  alt?: string | null;
}

interface Props {
  cover: string;
  images: Media[];
  title: string;
}

export function ListingGallery({ cover, images, title }: Props) {
  const others = images
    .filter((i) => i.url !== cover)
    .slice(0, 4);

  while (others.length < 4 && images.length > 0) {
    others.push(images[others.length % images.length]);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-foreground/5">
      <div className="grid grid-cols-4 gap-1">
        <div className="relative col-span-4 aspect-[16/10] md:col-span-2 md:row-span-2 md:aspect-auto">
          <Image
            src={cover}
            alt={`${title} — photo principale`}
            fill
            priority
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-cover"
          />
        </div>
        {others.slice(0, 4).map((img, i) => (
          <div key={`${img.url}-${i}`} className="relative col-span-2 hidden aspect-[4/3] md:col-span-1 md:block">
            <Image
              src={img.url}
              alt={img.alt ?? `${title} — photo ${i + 2}`}
              fill
              sizes="(min-width: 1024px) 320px, 45vw"
              className="object-cover"
            />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 grid place-items-center bg-black/40 text-sm font-medium text-white">
                +{images.length - 5} photos
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
