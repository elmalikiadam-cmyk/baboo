"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  generateLeasePdf,
  uploadSignedLease,
  activateLease,
} from "@/actions/leases";

type Props = {
  leaseId: string;
  status: string;
  generatedUrl: string | null;
  signedUrl: string | null;
  generatedFilename: string | null;
  signedFilename: string | null;
};

export function LeaseWorkflowActions({
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

  function runGenerate() {
    setError(null);
    startTransition(async () => {
      const res = await generateLeasePdf(leaseId);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  function runActivate() {
    setError(null);
    startTransition(async () => {
      const res = await activateLease(leaseId);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

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
    <div className="rounded-2xl border border-midnight/10 bg-cream p-5">
      <p className="eyebrow">Workflow</p>

      <ol className="mt-4 space-y-4">
        <Step
          n={1}
          done={status !== "DRAFT"}
          active={status === "DRAFT"}
          label="Générer le PDF"
        >
          {status === "DRAFT" ? (
            <button
              type="button"
              onClick={runGenerate}
              disabled={isPending}
              className="mt-2 rounded-full bg-terracotta px-4 py-2 text-xs font-semibold text-cream disabled:opacity-50"
            >
              {isPending ? "Génération…" : "Générer le PDF"}
            </button>
          ) : (
            generatedUrl && (
              <a
                href={generatedUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-midnight hover:text-terracotta"
              >
                ↗ Télécharger le PDF ({generatedFilename})
              </a>
            )
          )}
        </Step>

        <Step
          n={2}
          done={status === "SIGNED_UPLOADED" || status === "ACTIVE" || status === "TERMINATED"}
          active={status === "GENERATED"}
          label="Imprimer, signer, uploader"
        >
          {(status === "GENERATED" || status === "SIGNED_UPLOADED") && (
            <>
              <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-midnight px-4 py-2 text-xs font-semibold text-midnight hover:bg-midnight hover:text-cream">
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
                    : "Uploader la version signée (PDF)"}
              </label>
              {signedUrl && (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block text-[11px] font-medium text-midnight hover:text-terracotta"
                >
                  ↗ Consulter la version signée ({signedFilename})
                </a>
              )}
            </>
          )}
        </Step>

        <Step
          n={3}
          done={status === "ACTIVE" || status === "TERMINATED"}
          active={status === "SIGNED_UPLOADED"}
          label="Activer le bail"
        >
          {status === "SIGNED_UPLOADED" && (
            <button
              type="button"
              onClick={runActivate}
              disabled={isPending}
              className="mt-2 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-cream disabled:opacity-50"
            >
              {isPending ? "Activation…" : "Activer le bail"}
            </button>
          )}
          {status === "ACTIVE" && (
            <p className="mt-2 text-[11px] font-medium text-forest">
              ✓ Bail actif — la gestion locative démarre
            </p>
          )}
        </Step>
      </ol>

      {error && (
        <p className="mt-4 rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Step({
  n,
  done,
  active,
  label,
  children,
}: {
  n: number;
  done: boolean;
  active: boolean;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <li>
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold ${
            done
              ? "bg-forest text-cream"
              : active
                ? "bg-midnight text-cream"
                : "bg-midnight/10 text-midnight"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <div className="flex-1">
          <p
            className={`text-sm ${
              done ? "text-muted-foreground line-through" : active ? "font-semibold text-midnight" : "text-midnight"
            }`}
          >
            {label}
          </p>
          {children}
        </div>
      </div>
    </li>
  );
}
