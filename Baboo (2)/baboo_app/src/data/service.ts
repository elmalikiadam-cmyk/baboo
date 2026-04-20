/**
 * Service layer — remplace ces fonctions par de vrais appels API.
 * Les signatures sont conçues pour être drop-in avec Supabase/REST/tRPC.
 */
import { mockListings, mockAgents } from './mockListings';
import type { Listing, ListingFilters, Agent } from '@/types';

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

export async function fetchListings(filters?: ListingFilters): Promise<Listing[]> {
  let result = [...mockListings];
  if (filters?.transaction) {
    result = result.filter((l) => l.type === filters.transaction);
  }
  if (filters?.cities?.length) {
    result = result.filter((l) =>
      filters.cities!.some((c) => l.location.city === c)
    );
  }
  if (filters?.priceMin != null) {
    result = result.filter((l) => l.price >= filters.priceMin!);
  }
  if (filters?.priceMax != null) {
    result = result.filter((l) => l.price <= filters.priceMax!);
  }
  if (filters?.roomsMin != null) {
    result = result.filter((l) => l.rooms >= filters.roomsMin!);
  }
  return delay(result);
}

export async function fetchListing(id: string): Promise<Listing | null> {
  return delay(mockListings.find((l) => l.id === id) ?? null);
}

export async function fetchAgents(): Promise<Agent[]> {
  return delay(mockAgents);
}

export async function fetchAgent(id: string): Promise<Agent | null> {
  return delay(mockAgents.find((a) => a.id === id) ?? null);
}
