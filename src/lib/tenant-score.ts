// Scoring locataire — calculé au moment de la soumission d'une
// candidature, figé dans TenantApplication (immutable).
//
// Philosophie : on reste transparent et explicable — chaque point de
// score correspond à une raison lisible par le bailleur. Pas de modèle
// opaque. Les seuils sont calibrés sur le marché marocain (ratio 3x
// considéré standard, 2x-3x acceptable selon contexte).
//
// Sortie : un score 0-100 + un label verbal + une liste de raisons.

import {
  ApplicationStatus,
  EmploymentType,
  type Guarantor,
} from "@prisma/client";

export type ScoreInput = {
  monthlyIncome: number;
  rent: number; // loyer mensuel (charges incluses si fournies)
  employment: EmploymentType;
  contractEndDate: Date | null;
  guarantors: Array<
    Pick<Guarantor, "monthlyIncome" | "employment" | "type">
  >;
};

export type ScoreOutput = {
  score: number; // 0-100
  label: string; // « Solide », « Correct », « À discuter », « Fragile »
  reasons: string[];
  ratio: number; // revenus / loyer
};

const EMPLOYMENT_POINTS: Record<EmploymentType, number> = {
  CDI: 30,
  FONCTIONNAIRE: 30,
  CDD: 18,
  INDEPENDANT: 18,
  RETRAITE: 20,
  ETUDIANT: 10,
  SANS_EMPLOI: 0,
  AUTRE: 10,
};

const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  CDI: "CDI",
  CDD: "CDD",
  FONCTIONNAIRE: "Fonctionnaire",
  INDEPENDANT: "Indépendant",
  ETUDIANT: "Étudiant",
  RETRAITE: "Retraité",
  SANS_EMPLOI: "Sans emploi",
  AUTRE: "Autre statut",
};

export function scoreTenantApplication(input: ScoreInput): ScoreOutput {
  const reasons: string[] = [];
  let score = 0;

  const ratio = input.rent > 0 ? input.monthlyIncome / input.rent : 0;

  // 1. Ratio revenus / loyer (max 50 points)
  if (ratio >= 3.5) {
    score += 50;
    reasons.push(`Revenus ${ratio.toFixed(1)}× le loyer — marge confortable.`);
  } else if (ratio >= 3) {
    score += 40;
    reasons.push(`Revenus 3× le loyer — ratio standard respecté.`);
  } else if (ratio >= 2.5) {
    score += 28;
    reasons.push(`Revenus ${ratio.toFixed(1)}× le loyer — en dessous du seuil classique (3×).`);
  } else if (ratio >= 2) {
    score += 15;
    reasons.push(`Revenus ${ratio.toFixed(1)}× le loyer — marge serrée, garant recommandé.`);
  } else {
    reasons.push(`Revenus ${ratio.toFixed(1)}× le loyer — insuffisants seul.`);
  }

  // 2. Type de contrat (max 30 points)
  const empPts = EMPLOYMENT_POINTS[input.employment];
  score += empPts;
  if (empPts >= 30) {
    reasons.push(`${EMPLOYMENT_LABEL[input.employment]} — statut stable.`);
  } else if (empPts >= 18) {
    reasons.push(`${EMPLOYMENT_LABEL[input.employment]} — statut acceptable.`);
  } else if (empPts > 0) {
    reasons.push(`${EMPLOYMENT_LABEL[input.employment]} — statut précaire, garant conseillé.`);
  } else {
    reasons.push(`${EMPLOYMENT_LABEL[input.employment]} — sans revenus propres.`);
  }

  // 2bis. Pénalité si CDD / stage finit dans < 6 mois
  if (
    (input.employment === "CDD" || input.employment === "ETUDIANT") &&
    input.contractEndDate
  ) {
    const monthsLeft =
      (input.contractEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsLeft < 6 && monthsLeft > 0) {
      score -= 5;
      reasons.push(`Contrat qui se termine dans ${Math.ceil(monthsLeft)} mois.`);
    }
  }

  // 3. Garants (max 20 points)
  if (input.guarantors.length > 0) {
    const hasSolidGuarantor = input.guarantors.some((g) => {
      const guarantorRatio =
        g.monthlyIncome && input.rent > 0 ? g.monthlyIncome / input.rent : 0;
      return guarantorRatio >= 3 || g.type === "EMPLOYEUR" || g.type === "ENTREPRISE";
    });
    if (hasSolidGuarantor) {
      score += 20;
      reasons.push(
        input.guarantors.length > 1
          ? `${input.guarantors.length} garants dont au moins un solide.`
          : "Garant solide.",
      );
    } else {
      score += 10;
      reasons.push(
        `${input.guarantors.length} garant${input.guarantors.length > 1 ? "s" : ""} — revenus à vérifier.`,
      );
    }
  } else {
    reasons.push("Sans garant.");
  }

  // Clamp
  score = Math.max(0, Math.min(100, Math.round(score)));

  const label =
    score >= 80 ? "Solide" : score >= 60 ? "Correct" : score >= 40 ? "À discuter" : "Fragile";

  return { score, label, reasons, ratio };
}

/** Humanise un statut d'application pour l'UI. */
export function applicationStatusLabel(status: ApplicationStatus): string {
  switch (status) {
    case ApplicationStatus.PENDING:
      return "En attente";
    case ApplicationStatus.SHORTLISTED:
      return "Présélectionné";
    case ApplicationStatus.ACCEPTED:
      return "Accepté";
    case ApplicationStatus.REJECTED:
      return "Refusé";
    case ApplicationStatus.WITHDRAWN:
      return "Retirée";
  }
}
