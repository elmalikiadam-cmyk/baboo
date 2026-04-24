// Score qualité d'annonce — feedback actionnable et bienveillant.
//
// Le scoring est fait à la volée côté client pendant que le bailleur
// remplit le formulaire. L'idée : plus l'annonce est complète, plus
// elle remonte dans les résultats et génère de candidatures de qualité.
//
// Pas de pénalités « punitives » — uniquement des suggestions avec des
// gains positifs chiffrés (« +10 pts si vous ajoutez 3 photos »).

export type QualityLevel = "excellent" | "good" | "average" | "poor";

export type QualityIssue = {
  field: string;
  severity: "blocker" | "warning" | "suggestion";
  message: string;
  pointsLost?: number;
  pointsGainable?: number;
};

export type QualityFeedback = {
  score: number; // 0-100
  level: QualityLevel;
  issues: QualityIssue[];
};

export type QualityInput = {
  title?: string | null;
  description?: string | null;
  price?: number | null;
  surface?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  condition?: string | null;
  photosCount?: number;
  amenitiesCount?: number;
  hasCoordinates?: boolean;
  // Pour le contrôle prix (optionnel — si fourni, on compare au médian)
  medianPrice?: number | null;
};

function levelFromScore(score: number): QualityLevel {
  if (score >= 85) return "excellent";
  if (score >= 65) return "good";
  if (score >= 45) return "average";
  return "poor";
}

export function scoreListing(input: QualityInput): QualityFeedback {
  let score = 100;
  const issues: QualityIssue[] = [];

  // ───── Photos ─────
  const photos = input.photosCount ?? 0;
  if (photos === 0) {
    score -= 30;
    issues.push({
      field: "photos",
      severity: "blocker",
      message: "Ajoutez au moins une photo — les annonces sans photo ne sont quasiment jamais consultées.",
      pointsLost: 30,
    });
  } else if (photos < 3) {
    score -= 20;
    issues.push({
      field: "photos",
      severity: "warning",
      message: "Ajoutez quelques photos de plus. 5 photos est un bon minimum.",
      pointsGainable: 20,
    });
  } else if (photos < 6) {
    score -= 10;
    issues.push({
      field: "photos",
      severity: "suggestion",
      message: `Vous avez ${photos} photos. Ajoutez-en encore ${6 - photos} pour montrer toutes les pièces.`,
      pointsGainable: 10,
    });
  } else if (photos >= 10) {
    // bonus léger
    score = Math.min(100, score + 5);
  }

  // ───── Description ─────
  const descLen = (input.description ?? "").trim().length;
  if (descLen === 0) {
    score -= 20;
    issues.push({
      field: "description",
      severity: "blocker",
      message: "Décrivez votre bien en quelques phrases — c'est ce qui donne envie aux candidats.",
      pointsLost: 20,
    });
  } else if (descLen < 100) {
    score -= 15;
    issues.push({
      field: "description",
      severity: "warning",
      message: "Votre description est un peu courte. Racontez l'ambiance, les atouts, les équipements.",
      pointsGainable: 15,
    });
  } else if (descLen < 300) {
    score -= 5;
    issues.push({
      field: "description",
      severity: "suggestion",
      message: "Quelques phrases de plus aideraient les candidats à se projeter.",
      pointsGainable: 5,
    });
  } else if (descLen >= 800) {
    score = Math.min(100, score + 5);
  }

  // ───── Titre ─────
  const titleLen = (input.title ?? "").trim().length;
  if (titleLen === 0) {
    score -= 15;
    issues.push({
      field: "title",
      severity: "blocker",
      message: "Le titre est obligatoire.",
      pointsLost: 15,
    });
  } else if (titleLen < 20) {
    score -= 10;
    issues.push({
      field: "title",
      severity: "warning",
      message: "Titre un peu court. Un bon titre fait 40 à 80 caractères : « Bel appartement 3 pièces vue mer à Ain Diab ».",
      pointsGainable: 10,
    });
  } else if (titleLen > 100) {
    score -= 5;
    issues.push({
      field: "title",
      severity: "suggestion",
      message: "Titre un peu long. Essayez de rester concis.",
      pointsGainable: 5,
    });
  }

  // ───── Prix ─────
  if (!input.price || input.price <= 0) {
    score -= 15;
    issues.push({
      field: "price",
      severity: "blocker",
      message: "Le prix est obligatoire.",
      pointsLost: 15,
    });
  } else if (input.medianPrice && input.medianPrice > 0) {
    const ratio = input.price / input.medianPrice;
    if (ratio > 1.3) {
      score -= 10;
      issues.push({
        field: "price",
        severity: "warning",
        message: `Votre prix est au-dessus du marché local (${Math.round((ratio - 1) * 100)}% de plus que le prix médian). Vous pouvez l'ajuster pour attirer plus de candidats.`,
        pointsGainable: 10,
      });
    } else if (ratio < 0.7) {
      issues.push({
        field: "price",
        severity: "suggestion",
        message: "Votre prix est sensiblement en dessous du marché — vérifiez qu'il correspond à votre intention.",
      });
    }
  }

  // ───── Champs descriptifs ─────
  const requiredFields: Array<[keyof QualityInput, string]> = [
    ["surface", "surface"],
    ["bedrooms", "nombre de chambres"],
    ["bathrooms", "nombre de salles de bain"],
    ["condition", "état du bien"],
  ];
  for (const [field, label] of requiredFields) {
    if (input[field] == null || input[field] === "") {
      score -= 5;
      issues.push({
        field: String(field),
        severity: "suggestion",
        message: `Indiquez la ${label} — ce détail rassure les candidats.`,
        pointsGainable: 5,
      });
    }
  }

  // ───── Équipements ─────
  const amen = input.amenitiesCount ?? 0;
  if (amen < 2) {
    score -= 5;
    issues.push({
      field: "amenities",
      severity: "suggestion",
      message: "Cochez les équipements présents (parking, ascenseur, meublé…). Les candidats filtrent souvent par ces critères.",
      pointsGainable: 5,
    });
  }

  // ───── Géolocalisation ─────
  if (input.hasCoordinates) {
    score = Math.min(100, score + 10);
  } else {
    issues.push({
      field: "location",
      severity: "suggestion",
      message: "Ajouter l'adresse précise fait apparaître votre annonce sur la carte — gros gain de visibilité.",
      pointsGainable: 10,
    });
  }

  // Clamp final
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    level: levelFromScore(score),
    issues,
  };
}

export function levelLabel(level: QualityLevel): string {
  switch (level) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Bon";
    case "average":
      return "Correct";
    case "poor":
      return "À améliorer";
  }
}
