"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { runPromoterWeeklyReports } from "@/actions/promoter-reports";

export function RunWeeklyReportsButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function onClick() {
    if (
      !confirm(
        "Générer immédiatement les rapports hebdo ? Action idempotente — si déjà généré pour la semaine, rien n'est rejoué.",
      )
    )
      return;
    setMsg(null);
    startTransition(async () => {
      const res = await runPromoterWeeklyReports();
      if (res.ok) {
        setMsg(
          `✓ ${res.generated} généré(s), ${res.skipped} déjà fait${res.skipped > 1 ? "s" : ""}.`,
        );
        router.refresh();
      } else {
        setMsg(`⚠ ${res.error}`);
      }
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-midnight/10 bg-cream p-4">
      <p className="eyebrow">Ops · cron</p>
      <p className="mt-2 text-sm text-midnight">
        Déclencher manuellement la génération des rapports hebdo
        promoteurs (rattrapage si QStash a raté).
      </p>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="mt-3 inline-flex h-9 items-center rounded-full border border-midnight/20 px-4 text-xs font-semibold text-midnight hover:border-midnight disabled:opacity-50"
      >
        {isPending ? "Génération…" : "Lancer maintenant"}
      </button>
      {msg && (
        <p className="mono mt-3 text-[10px] uppercase tracking-[0.12em]">
          {msg}
        </p>
      )}
    </div>
  );
}
