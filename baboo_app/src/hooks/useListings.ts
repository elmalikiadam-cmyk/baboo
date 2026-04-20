import { useEffect, useState } from "react";
import { fetchListings, fetchListing } from "@/data/api";
import { LISTINGS, type Listing } from "@/data/listings";

type State<T> = { data: T; loading: boolean; error: Error | null };

/** Liste des annonces — initialise avec la data mock pour un first paint instant. */
export function useListings(): State<Listing[]> {
  const [state, setState] = useState<State<Listing[]>>({
    data: LISTINGS,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetchListings()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: LISTINGS, loading: false, error: err });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/** Détail d'une annonce. */
export function useListing(ref: string | undefined): State<Listing | null> {
  const initial = ref ? LISTINGS.find((l) => l.ref === ref) ?? null : null;
  const [state, setState] = useState<State<Listing | null>>({
    data: initial,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!ref) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    fetchListing(ref)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled)
          setState({ data: initial, loading: false, error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [ref]);

  return state;
}
