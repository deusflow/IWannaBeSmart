/**
 * @file apps/web/src/lib/supabase.ts
 * @description Supabase client stub and backend configuration (Block A, Item 4)
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("your-project") &&
      !supabaseAnonKey.includes("your-anon-key")
  );
};

// Fallback dummy credentials to allow safe client creation in stub/dev mode
const resolvedUrl = supabaseUrl || "https://placeholder-project.supabase.co";
const resolvedKey = supabaseAnonKey || "placeholder-anon-key";

/**
 * Supabase client instance stub.
 * Note: Real database calls require valid credentials in .env.
 */
export const supabase: SupabaseClient = createClient(resolvedUrl, resolvedKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
