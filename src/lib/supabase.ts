import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Client Supabase.
 * Si le fichier .env n'est pas configuré (URL placeholder),
 * le client est null et l'application utilise les données de démonstration.
 */
export const supabase: SupabaseClient | null =
  url && key && url.startsWith("https://") && !url.includes("VOTRE-REF")
    ? createClient(url, key)
    : null;

export const isSupabaseConfigured = supabase !== null;

// Mode mock forcé en production si Supabase n'est pas configuré
export const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !isSupabaseConfigured;

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase non configuré — mode démonstration actif. " +
    "Remplissez le fichier .env avec votre Project URL."
  );
} else {
  console.log("✅ Supabase connecté :", url);
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
    console.warn("⚠️ Mode mock activé manuellement malgré Supabase configuré");
  }
}