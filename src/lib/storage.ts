// Supabase Storage — upload léger via l'API REST (pas de dépendance supplémentaire).
// Activé si SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_STORAGE_BUCKET
// sont définis. Sinon `isStorageEnabled()` renvoie false et l'UI retombe
// sur la saisie d'URLs publiques.

export function isStorageEnabled(): boolean {
  return (
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !!process.env.SUPABASE_STORAGE_BUCKET
  );
}

export function publicBucketUrl(objectPath: string): string {
  const base = process.env.SUPABASE_URL!.replace(/\/+$/, "");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET!;
  return `${base}/storage/v1/object/public/${bucket}/${objectPath}`;
}

/**
 * Upload un buffer binaire. Retourne l'URL publique (le bucket doit donc être
 * configuré en "public" côté Supabase). Erreur en cas d'échec — le caller doit
 * la gérer.
 */
export async function uploadToStorage(opts: {
  objectPath: string;
  body: ArrayBuffer | Uint8Array;
  contentType: string;
}): Promise<string> {
  if (!isStorageEnabled()) {
    throw new Error("Storage non configuré.");
  }
  const base = process.env.SUPABASE_URL!.replace(/\/+$/, "");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET!;
  const url = `${base}/storage/v1/object/${bucket}/${opts.objectPath}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      "Content-Type": opts.contentType,
      "x-upsert": "true",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
    body: opts.body as BodyInit,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase upload ${res.status}: ${body.slice(0, 200)}`);
  }
  return publicBucketUrl(opts.objectPath);
}
