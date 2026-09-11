/**
 * @file apps/web/src/store/authStore.ts
 * @description Authentication and user profile store using Supabase GoTrue Auth with HMR leak protection.
 */

import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured, type Profile } from "../lib/supabaseClient";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  initAuth: () => Promise<void>;
  cleanupAuth: () => void;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    callsign?: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  clearError: () => void;
}

// ────────────────────────────────────────────────
//  HMR & Memory-Leak Guard
// ────────────────────────────────────────────────
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  error: null,

  initAuth: async () => {
    // 1. Unsubscribe any existing active listener (prevents duplicate HMR listeners)
    if (authSubscription) {
      try {
        authSubscription.unsubscribe();
      } catch {
        // Safe catch
      }
      authSubscription = null;
    }

    set({ isLoading: true, error: null });

    try {
      // 2. Fetch initial session immediately
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) {
        console.warn("[Auth] Initial getSession error:", sessionErr.message);
      }

      const initialSession = sessionData?.session ?? null;
      const initialUser = initialSession?.user ?? null;

      set({
        session: initialSession,
        user: initialUser,
        isLoading: Boolean(initialUser), // Keep loading until profile loads
      });

      if (initialUser) {
        await get().fetchProfile(initialUser.id);
      } else {
        set({ isLoading: false });
      }

      // 3. Register state change subscription and store reference
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const nextUser = session?.user ?? null;
        set({
          session,
          user: nextUser,
          isLoading: false,
        });

        if (nextUser) {
          await get().fetchProfile(nextUser.id);
        } else {
          set({ profile: null });
        }
      });

      authSubscription = subscription;
    } catch (err) {
      console.error("[Auth] Failed to initialize auth:", err);
      set({ isLoading: false, error: err instanceof Error ? err.message : "Auth init failed" });
    }
  },

  cleanupAuth: () => {
    if (authSubscription) {
      try {
        authSubscription.unsubscribe();
      } catch {
        // Safe catch
      }
      authSubscription = null;
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured. Running in offline/guest mode.");
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured. Running in offline/guest mode.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      set({
        user: data.user,
        session: data.session,
        isLoading: false,
      });

      if (data.user) {
        await get().fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },

  signUpWithEmail: async (email: string, password: string, callsign?: string) => {
    set({ isLoading: true, error: null });
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured. Running in offline/guest mode.");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            callsign: callsign || email.split("@")[0],
          },
        },
      });

      if (error) throw error;
      set({
        user: data.user,
        session: data.session,
        isLoading: false,
      });

      if (data.user) {
        await get().fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("[Auth] SignOut warning:", err);
    } finally {
      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        error: null,
      });
    }
  },

  fetchProfile: async (userId: string) => {
    if (!isSupabaseConfigured || !userId) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("[Auth] Could not fetch profile:", error.message);
      } else if (data) {
        set({ profile: data as Profile });
      }
    } catch (err) {
      console.warn("[Auth] Fetch profile exception:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const user = get().user;
    if (!isSupabaseConfigured || !user) {
      return { error: new Error("Not authenticated or offline mode") };
    }

    try {
      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

      if (error) throw error;

      set((state) => ({
        profile: state.profile ? { ...state.profile, ...payload } : null,
      }));

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { error };
    }
  },

  clearError: () => set({ error: null }),
}));
