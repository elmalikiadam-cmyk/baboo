// Supabase Storage — deux buckets :
//   1. Bucket public (SUPABASE_STORAGE_BUCKET)   → photos d'annonces, assets
//      publics indexables.
//   2. Bucket privé  (SUPABASE_STORAGE_BUCKET_PRIVATE) → docs KYC, RIB,
//      titres, baux, EDL. JAMAIS indexé. Accès via signed URLs courtes
//      uniquement (admin modération, bailleur lui-même).
//
// Upload en REST natif (pas de SDK supplémentaire). Quand le bucket
// correspondant n'est pas configuré, les fonctions `isXEnabled()`
// renvoient false et l'appelant doit dégrader gracieusement l'UI.

export function isStorageEnabled(): boolean {
  return (
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !!process.env.SUPABASE_STORAGE_BUCKET
  );
}

export function isPrivateStorageEnabled(): boolean {
  return (
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !!process.env.SUPABASE_STORAGE_BUCKET_PRIVATE
  );
}

export function publicBucketUrl(objectPath: string): string {
  const base = process.env.SUPABASE_URL!.replace(/\/+$/, "");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET!;
  return `${base}/storage/v1/object/public/${bucket}/${objectPath}`;
}

/**
 * Upload un buffer binaire dans le bucket public. Retourne l'URL publique.
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

/**
 * Upload un buffer binaire dans le bucket privé (KYC, baux, EDL…).
 * Retourne la « clé » (path) à persister — JAMAIS d'URL publique. Pour
 * faire consulter le fichier il faut appeler `signedUrlForPrivate()`.
 */
export async function uploadToPrivateStorage(opts: {
  objectPath: string;
  body: ArrayBuffer | Uint8Array;
  contentType: string;
}): Promise<string> {
  if (!isPrivateStorageEnabled()) {
    throw new Error("Private storage non configuré.");
  }
  const base = process.env.SUPABASE_URL!.replace(/\/+$/, "");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET_PRIVATE!;
  const url = `${base}/storage/v1/object/${bucket}/${opts.objectPath}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      "Content-Type": opts.contentType,
      "x-upsert": "true",
      "Cache-Control": "private, no-store",
    },
    body: opts.body as BodyInit,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase private upload ${res.status}: ${body.slice(0, 200)}`);
  }
  return opts.objectPath;
}

/**
 * Génère une signed URL courte pour le bucket privé (admin qui consulte
 * un doc KYC, bailleur qui retélécharge son bail, etc.). TTL court par
 * défaut (10 minutes) pour limiter la fuite en cas de copie du lien.
 */
export async function signedUrlForPrivate(
  objectPath: string,
  expiresInSec = 600,
): Promise<string> {
  if (!isPrivateStorageEnabled()) {
    throw new Error("Private storage non configuré.");
  }
  const base = process.env.SUPABASE_URL!.replace(/\/+$/, "");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET_PRIVATE!;
  const url = `${base}/storage/v1/object/sign/${bucket}/${objectPath}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: expiresInSec }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase sign ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as { signedURL?: string; signedUrl?: string };
  const rel = json.signedURL ?? json.signedUrl;
  if (!rel) throw new Error("Supabase sign: réponse invalide.");
  return rel.startsWith("http") ? rel : `${base}${rel}`;
}

/**
 * Supprime un objet du bucket privé (soft-delete côté métier + hard delete
 * côté storage). Utilisé pour la purge RGPD / loi 09-08.
 */
export async function deleteFromPrivateStorage(objectPath: string): Promise<void> {
  if (!isPrivateStorageEnabled()) return;
  const base = process.env.SUPABASE_URL!.replace(/\/+$/, "");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET_PRIVATE!;
  const url = `${base}/storage/v1/object/${bucket}/${objectPath}`;
  await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
  });
}
