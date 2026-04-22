"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ListingStatus } from "@prisma/client";
import { toggleListingStatus, deleteListing } from "@/actions/pro-listings";

interface Props {
  id: string;
  slug: string;
  status: ListingStatus;
}

export function ListingRowActions({ id, slug, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function onToggle() {
    setError(null);
    startTransition(async () => {
      const res = await toggleListingStatus(id);
      if (!res.ok) setError(res.error ?? "Erreur");
      else router.refresh();
    });
  }

  function onDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteListing(id);
      if (!res.ok) {
        setError(res.error ?? "Erreur");
        setConfirmDelete(false);
      } else {
        router.refresh();
      }
    });
  }

  const isPublished = status === ListingStatus.PUBLISHED;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-midnight/10 pt-3">
      <Link
        href={`/annonce/${slug}`}
        className="mono rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.12em] hover:border-midnight"
      >
        Voir
      </Link>
      <Link
        href={`/pro/listings/${id}/edit`}
        className="mono rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.12em] hover:border-midnight"
      >
        Modifier
      </Link>
      <button
        onClick={onToggle}
        disabled={isPending}
        className="mono rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.12em] hover:border-midnight disabled:opacity-50"
      >
        {isPublished ? "Archiver" : "Publier"}
      </button>
      <button
        onClick={onDelete}
        disabled={isPending}
        className={`mono rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em] transition ${
          confirmDelete
            ? "border border-danger bg-danger text-cream"
            : "border border-danger/40 text-danger hover:bg-danger/10"
        } disabled:opacity-50`}
      >
        {confirmDelete ? "Confirmer la suppression" : "Supprimer"}
      </button>
      {error && <span className="ml-auto text-[11px] text-danger">{error}</span>}
    </div>
  );
}
