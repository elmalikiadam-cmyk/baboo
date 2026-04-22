import { MapPinIcon } from "@/components/ui/icons";

interface Props {
  lat: number;
  lng: number;
  cityName: string;
  neighborhoodName?: string | null;
}

/**
 * Aperçu de localisation — iframe OSM léger, sans clé API.
 * V2 : rounded-2xl, border sable chaude.
 */
export function ListingMapPreview({ lat, lng, cityName, neighborhoodName }: Props) {
  const delta = 0.01;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPinIcon className="h-4 w-4" aria-hidden />
        <span className="font-medium text-midnight">
          {neighborhoodName ? `${neighborhoodName}, ` : ""}
          {cityName}
        </span>
      </p>
      <div className="mt-3 h-[320px] w-full overflow-hidden rounded-2xl border border-border md:h-[400px]">
        <iframe
          title={`Carte — ${neighborhoodName ?? cityName}`}
          src={src}
          className="h-full w-full"
          loading="lazy"
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        Adresse exacte communiquée à la visite.
      </p>
    </div>
  );
}
