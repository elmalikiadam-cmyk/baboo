"use client";

// Wrapper typé, SSR-safe, autour de localStorage.
// Toutes les lectures retournent le defaultValue pendant le render serveur.

export function readStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Dispatch un event pour que les autres onglets / composants se mettent à jour.
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(value) }));
  } catch {
    // quota dépassé, mode privé, etc. — on ignore silencieusement.
  }
}

export function removeStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: null }));
  } catch {}
}
