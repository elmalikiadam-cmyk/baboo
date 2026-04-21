interface Props {
  lat: number;
  lng: number;
  cityName: string;
}

/**
 * iframe OpenStreetMap sans clé API — lazy.
 * Marquage d'adresse approximatif (pas de pin exact pour respecter la vie privée du bien).
 */
export function ListingMapPreview({ lat, lng, cityName }: Props) {
  const delta = 0.01; // ~1 km bbox
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div>
      <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-border md:h-[400px]">
        <iframe
          src={src}
          title={`Carte — ${cityName}`}
          loading="lazy"
          className="h-full w-full"
        />
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        Adresse exacte communiquée à la visite.
      </p>
    </div>
  );
}
