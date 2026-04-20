import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Les env vars Expo côté client doivent commencer par EXPO_PUBLIC_.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const hasSupabase = (): boolean => Boolean(url && anon);

let client: SupabaseClient | null = null;

/**
 * Renvoie le client Supabase si les env vars sont définies, sinon null.
 * Les écrans appellent `getSupabase()` et fallback sur la data mock quand null.
 */
export function getSupabase(): SupabaseClient | null {
  if (!hasSupabase()) return null;
  if (client) return client;
  client = createClient(url, anon, {
    auth: {
      storage: AsyncStorage as never,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}
