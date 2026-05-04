"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import {
  cancelMission,
  confirmMission,
  submitVisitReport,
} from "@/actions/managed-visits";

export function ConfirmMissionButton({ missionId }: { missionId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await confirmMission(missionId);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <div className="mb-5 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5">
      <p className="eyebrow text-terracotta">Action requise</p>
      <p className="mt-2 text-sm text-midnight">
        Confirmez que vous pouvez réaliser cette mission. Le bailleur sera
        notifié aussitôt.
      </p>
      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onClick} disabled={isPending}>
          {isPending ? "…" : "Je confirme la mission"}
        </Button>
        <CancelMissionButton missionId={missionId} variant="outline" />
      </div>
    </div>
  );
}

export function CancelMissionButton({
  missionId,
  variant = "outline",
}: {
  missionId: string;
  variant?: "outline" | "danger";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    const reason = window.prompt(
      "Pourquoi annulez-vous cette mission ? (visible par l'équipe ops)",
    );
    if (!reason || reason.trim().length < 3) return;
    if (
      !window.confirm(
        "Confirmer l'annulation ? Le crédit sera remboursé au bailleur, vous resterez disponible pour d'autres missions.",
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const res = await cancelMission(missionId, reason.trim());
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className={`inline-flex h-10 items-center rounded-full px-4 text-xs font-semibold transition-colors disabled:opacity-50 ${
          variant === "danger"
            ? "bg-danger text-cream hover:bg-danger/90"
            : "border border-midnight/20 text-midnight hover:border-midnight"
        }`}
      >
        {isPending ? "…" : "Décliner / annuler"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function ReportForm({ missionId }: { missionId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(3);
  const [presented, setPresented] = useState(true);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitVisitReport(form);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-midnight/10 bg-cream p-5"
      noValidate
    >
      <input type="hidden" name="missionId" value={missionId} />

      <div>
        <p className="eyebrow">Rapport post-visite</p>
        <h2 className="display-md mt-2 text-xl">
          Notez ce que vous avez observé.
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Rapport structuré à remplir dans l'heure qui suit la visite.
          Le bailleur le reçoit immédiatement.
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-xl bg-white p-4 text-sm">
        <input
          type="checkbox"
          name="candidatePresented"
          defaultChecked
          onChange={(e) => setPresented(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-terracotta"
        />
        <span>
          <strong>Le candidat s'est présenté</strong>
          <span className="mono mt-0.5 block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Décocher si no-show (le pack sera quand même consommé)
          </span>
        </span>
      </label>

      {presented && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm">
              <input
                type="checkbox"
                name="candidatePhoneVerified"
                defaultChecked
                className="h-4 w-4 accent-terracotta"
              />
              <span>Téléphone vérifié</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm">
              <input
                type="checkbox"
                name="candidateEmploymentVerified"
                defaultChecked
                className="h-4 w-4 accent-terracotta"
              />
              <span>Emploi / revenus vérifiés</span>
            </label>
          </div>

          <div>
            <Label>Score candidat (1-5)</Label>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setScore(n)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    n <= score
                      ? "bg-terracotta text-cream"
                      : "border border-midnight/20 text-midnight hover:border-midnight"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input type="hidden" name="candidateScore" value={score} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="candidateNotes">
              Notes sur le candidat (visibles par le bailleur)
            </Label>
            <Textarea
              id="candidateNotes"
              name="candidateNotes"
              rows={4}
              required
              minLength={10}
              maxLength={4000}
              placeholder="Présentation, attitude, sérieux du projet, points forts, inquiétudes…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="propertyConditionNotes">
              État du bien (optionnel)
            </Label>
            <Textarea
              id="propertyConditionNotes"
              name="propertyConditionNotes"
              rows={3}
              maxLength={4000}
              placeholder="Remarques à remonter au bailleur sur l'état du bien le jour de la visite."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="internalNotes">
              Notes internes (non visibles par le bailleur)
            </Label>
            <Textarea
              id="internalNotes"
              name="internalNotes"
              rows={2}
              maxLength={4000}
              placeholder="Points pour l'équipe ops uniquement."
            />
          </div>

          <label className="flex items-start gap-3 rounded-xl bg-white p-4 text-sm">
            <input
              type="checkbox"
              name="recommendForLandlord"
              defaultChecked
              className="mt-0.5 h-4 w-4 accent-terracotta"
            />
            <span>
              <strong>Je recommande ce candidat au bailleur.</strong>
              <span className="mono mt-0.5 block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Avis synthétique, factuel — le bailleur décide ensuite.
              </span>
            </span>
          </label>
        </>
      )}

      {error && (
        <p
          className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Envoi…" : presented ? "Envoyer le rapport" : "Enregistrer le no-show"}
      </Button>
    </form>
  );
}
