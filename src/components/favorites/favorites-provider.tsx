"use client";

import { createContext, useContext } from "react";

export const FavoritesInitialContext = createContext<string[] | null>(null);

export function FavoritesProvider({
  initial,
  children,
}: {
  initial: string[] | null;
  children: React.ReactNode;
}) {
  return (
    <FavoritesInitialContext.Provider value={initial}>
      {children}
    </FavoritesInitialContext.Provider>
  );
}

export function useFavoritesInitial(): string[] | null {
  return useContext(FavoritesInitialContext);
}
