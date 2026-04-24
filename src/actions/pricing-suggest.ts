"use server";

import { PropertyType, Transaction } from "@prisma/client";
import { suggestPrice, type PricingSuggestion } from "@/lib/pricing-assistant";

/**
 * Action server — appelée depuis le formulaire de création/édition
 * annonce quand surface + ville + type sont remplis. Retourne une
 * suggestion de prix ou null si trop peu de comparables.
 */
export async function getPriceSuggestion(input: {
  citySlug: string;
  neighborhoodSlug?: string | null;
  propertyType: PropertyType;
  surface: number;
  transaction: Transaction;
}): Promise<PricingSuggestion | null> {
  return suggestPrice(input);
}
