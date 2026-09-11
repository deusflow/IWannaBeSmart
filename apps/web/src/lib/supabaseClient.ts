/**
 * @file apps/web/src/lib/supabaseClient.ts
 * @description Typed Supabase client with Offline-First No-Op fallback stub.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ────────────────────────────────────────────────
//  Database Schema Types
// ────────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          callsign: string | null;
          avatar_url: string | null;
          total_stars: number;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          callsign?: string | null;
          avatar_url?: string | null;
          total_stars?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          callsign?: string | null;
          avatar_url?: string | null;
          total_stars?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_progress: {
        Row: {
          id: number;
          user_id: string;
          station_id: string;
          task_id: string;
          tier: number;
          stars: number;
          best_wpm: number | null;
          completed_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          station_id: string;
          task_id: string;
          tier?: number;
          stars?: number;
          best_wpm?: number | null;
          completed_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          station_id?: string;
          task_id?: string;
          tier?: number;
          stars?: number;
          best_wpm?: number | null;
          completed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserProgressRow = Database["public"]["Tables"]["user_progress"]["Row"];

// ────────────────────────────────────────────────
//  Environment Resolution & Guard (Isomorphic)
// ────────────────────────────────────────────────
const getEnv = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== "undefined" && import.meta && import.meta.env) {
      return (import.meta.env[key] as string | undefined)?.trim();
    }
  } catch {
    // Ignore in non-Vite environments
  }
  try {
    if (typeof process !== "undefined" && process && process.env) {
      return (process.env[key] as string | undefined)?.trim();
    }
  } catch {
    // Ignore
  }
  return undefined;
};

const envUrl = getEnv("VITE_SUPABASE_URL");
const envKey = getEnv("VITE_SUPABASE_ANON_KEY") || getEnv("VITE_SUPABASE_PUBLISHABLE_KEY");

const isConfigured = Boolean(
  envUrl &&
  envKey &&
  !envUrl.includes("mock") &&
  !envUrl.includes("placeholder") &&
  !envUrl.includes("your-project") &&
  !envKey.includes("mock") &&
  !envKey.includes("placeholder") &&
  !envKey.includes("your-anon-key")
);

export const isSupabaseConfigured: boolean = isConfigured;

// ────────────────────────────────────────────────
//  Robust No-Op Fallback Stub (Offline-First)
// ────────────────────────────────────────────────
function createNoopStub(): unknown {
  const emptyQueryResult = { data: null, error: null, count: 0 };

  const createChainableQuery = () => {
    const builder: Record<string, unknown> = {};
    const chainMethods = [
      "select", "insert", "update", "upsert", "delete",
      "eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike",
      "is", "in", "contains", "containedBy", "range",
      "match", "filter", "not", "or", "order", "limit", "offset",
      "single", "maybeSingle", "csv", "returns",
    ];

    for (const method of chainMethods) {
      builder[method] = () => builder;
    }

    // Make it awaitable / thenable
    builder.then = (onfulfilled?: (value: unknown) => unknown) => {
      return Promise.resolve(emptyQueryResult).then(onfulfilled);
    };
    builder.catch = (onrejected?: (reason: unknown) => unknown) => {
      return Promise.resolve(emptyQueryResult).catch(onrejected);
    };

    return builder;
  };

  return {
    auth: {
      onAuthStateChange: (
        _callback: (event: string, session: unknown) => void
      ) => ({
        data: {
          subscription: {
            unsubscribe: () => {
              // No-op unsubscribe
            },
          },
        },
        error: null,
      }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithOAuth: async () => ({ data: null, error: null }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: null,
      }),
      signUp: async () => ({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ data: null, error: null }),
      updateUser: async () => ({ data: { user: null }, error: null }),
    },
    from: (_table: string) => createChainableQuery(),
    rpc: (_fn: string, _args?: unknown) => ({
      then: (onfulfilled?: (value: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(onfulfilled),
    }),
    channel: (_name: string) => ({
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({}),
      unsubscribe: () => ({}),
    }),
  };
}

// ────────────────────────────────────────────────
//  Double-cast Client Export
// ────────────────────────────────────────────────
export const supabase: SupabaseClient<Database> = isConfigured
  ? createClient<Database>(envUrl!, envKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : (createNoopStub() as unknown as SupabaseClient<Database>);
