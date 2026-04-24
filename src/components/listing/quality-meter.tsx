"use client";

import { scoreListing, levelLabel, type QualityInput } from "@/lib/listing-quality";

/**
 * Barre de qualité d'annonce — affichée en sticky à côté du formulaire
 * de publication. Feedback live, ton bienveillant, suggestions
 * actionnables avec gains positifs chiffrés.
 */
export function QualityMeter({ input }: { input: QualityInput }) {
  const feedback = scoreListing(input);
  const color =
    feedback.level === "excellent"
      ? "text-forest"
      : feedback.level === "good"
        ? "text-terracotta"
        : feedback.level === "average"
          ? "text-midnight"
          : "text-danger";
  const barColor =
    feedback.level === "excellent"
      ? "bg-forest"
      : feedback.level === "good"
        ? "bg-terracotta"
        : feedback.level === "average"
          ? "bg-midnight"
          : "bg-danger";

  return (
    <div className="rounded-2xl border border-midnight/10 bg-cream p-5">
      <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Qualité de l'annonce
      </p>
      <div className="mt-3 flex items-baseline justify-between">
        <p className={`display-xl text-3xl ${color}`}>{feedback.score}</p>
        <span className={`mono text-[11px] uppercase tracking-[0.12em] ${color}`}>
          {levelLabel(feedback.level)}
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-midnight/10">
        <div
          className={`h-full ${barColor} transition-all duration-300 ease-out`}
          style={{ width: `${feedback.score}%` }}
        />
      </div>

      {feedback.issues.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {feedback.issues.slice(0, 5).map((issue, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <span
                className={
                  issue.severity === "blocker"
                    ? "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger"
                    : issue.severity === "warning"
                      ? "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta"
                      : "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-midnight/30"
                }
                aria-hidden
              />
              <div className="flex-1">
                <p className="text-midnight">{issue.message}</p>
                {issue.pointsGainable && (
                  <p className="mono mt-0.5 text-[9px] uppercase tracking-[0.12em] text-forest">
                    +{issue.pointsGainable} pts
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-xs text-forest">
          ✓ Votre annonce est bien complète — elle va plaire aux candidats.
        </p>
      )}
    </div>
  );
}
