"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadSignedLease } from "@/actions/leases";

type Props = {
  leaseId: string;
  status: string;
  generatedUrl: string | null;
  signedUrl: string | null;
  generatedFilename: string | null;
  signedFilename: string | null;
};

/**
 * Côté locataire : on peut uniquement télécharger le PDF généré par
 * le bailleur et uploader la version signée des deux parties. Pas de
 * génération ni d'activation — ces étapes sont réservées au bailleur.
 */
export function TenantLeaseActions({
  leaseId,
  status,
  generatedUrl,
  signedUrl,
  generatedFilename,
  signedFilename,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploadingName, setUploadingName] = useState<string>("");

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingName(f.name);
    setError(null);
    const form = new FormData();
    form.append("file", f);
    startTransition(async () => {
      const res = await uploadSignedLease(leaseId, form);
      if (res.ok) {
        setUploadingName("");
        router.refresh();
      } else {
        setError(res.error);
        setUploadingName("");
      }
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-midnight/10 bg-cream p-5">
        <p className="eyebrow">Actions</p>
        {status === "DRAFT" ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Le bailleur finalise les termes. Vous serez averti(e) dès que
            le PDF sera disponible.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {generatedUrl && (
              <a
                href={generatedUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-full items-center justify-center rounded-full bg-terracotta px-5 text-sm font-semibold text-cream hover:bg-terracotta-2"
              >
                Télécharger le PDF
              </a>
            )}
            {(status === "GENERATED" || status === "SIGNED_UPLOADED") && (
              <label className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-midnight px-5 text-sm font-semibold text-midnight hover:bg-midnight hover:text-cream">
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  onChange={onFileChange}
                  disabled={isPending}
                  className="hidden"
                />
                {isPending && uploadingName
                  ? `Upload ${uploadingName}…`
                  : status === "SIGNED_UPLOADED"
                    ? "Remplacer la version signée"
                    : "Uploader la version signée"}
              </label>
            )}
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-full items-center justify-center rounded-full border border-midnight/20 px-4 text-xs font-medium text-midnight hover:border-midnight"
              >
                Voir la version signée ({signedFilename})
              </a>
            )}
            {status === "ACTIVE" && (
              <p className="rounded-full bg-forest/10 px-3 py-2 text-center text-xs font-medium text-forest">
                ✓ Bail actif
              </p>
            )}
          </div>
        )}
        {error && (
          <p className="mt-3 rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-midnight/10 bg-cream p-5 text-xs text-muted-foreground">
        <p className="eyebrow">Étapes</p>
        <ol className="mt-2 space-y-1.5">
          <li>1. Téléchargez et imprimez le PDF</li>
          <li>2. Signez avec le bailleur</li>
          <li>3. Scannez en un seul PDF</li>
          <li>4. Uploadez via le bouton ci-dessus</li>
        </ol>
      </div>
    </div>
  );
}
