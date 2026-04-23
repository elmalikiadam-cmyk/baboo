import { signedUrlForPrivate } from "@/lib/storage";

/**
 * Lien vers un document du bucket privé, avec signed URL à la génération
 * de la page (TTL 10 min). Server Component — les URLs signées ne fuitent
 * donc jamais dans un bundle client.
 */
export async function KycDocLink({
  path,
  filename,
  label,
}: {
  path: string;
  filename: string;
  label: string;
}) {
  let url: string | null = null;
  try {
    url = await signedUrlForPrivate(path, 600);
  } catch {
    url = null;
  }

  if (!url) {
    return (
      <span className="rounded-full border border-dashed border-danger/40 px-3 py-1 text-[11px] text-danger">
        {label} · indisponible
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-midnight/20 bg-white px-3 py-1 text-[11px] text-midnight hover:border-midnight"
      title={filename}
    >
      <span className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        ↗
      </span>
      {label}
    </a>
  );
}
