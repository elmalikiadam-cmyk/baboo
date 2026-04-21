import { MapPinIcon } from "@/components/ui/icons";

interface Props {
  lat: number;
  lng: number;
  cityName: string;
  neighborhoodName?: string | null;
}

// Lightweight map preview using OpenStreetMap's static map via a
// client-agnostic iframe embed. This avoids shipping a heavy client-side
// map library on every detail render. The real Mapbox map is lazy-loaded
// in Phase C when split-view search is implemented.
export function ListingMapPreview({ lat, lng, cityName, neighborhoodName }: Props) {
  const delta = 0.01;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <section className="py-8">
      <h2 className="font-display text-2xl font-semibold">Localisation</h2>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPinIcon className="h-4 w-4" />
        {neighborhoodName ? `${neighborhoodName}, ` : ""}{cityName}
        <span className="text-xs">· adresse exacte communiquée à la visite</span>
      </p>
      <div className="mt-4 overflow-hidden rounded-md border border-border">
        <iframe
          title={`Carte — ${neighborhoodName ?? cityName}`}
          src={src}
          className="h-[360px] w-full"
          loading="lazy"
        />
      </div>
    </section>
  );
}
