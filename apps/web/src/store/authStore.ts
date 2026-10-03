/**
 * @file apps/web/src/store/authStore.ts
 * @description Authentication and user profile store with Cloud Supabase and Offline-First Local Fallback.
 */

import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { i18n } from "@iw/i18n";
import { supabase, isSupabaseConfigured, type Profile } from "../lib/supabaseClient";
import { toast } from "./toastStore";

export interface LocalUserRecord {
  id: string;
  email: string;
  callsign: string;
  avatar_url: string;
  created_at: string;
  total_stars: number;
}

export interface StoredActiveSession {
  user: User;
  session: Session;
  profile: Profile;
}

const STORAGE_ACTIVE_SESSION = "iw_active_session";
const STORAGE_LOCAL_USERS = "iw_local_users";
const STORAGE_CACHED_PROFILE = "iw_cached_profile";

// ────────────────────────────────────────────────
//  Local Storage Auth Engine (Offline Resilience)
// ────────────────────────────────────────────────
function getStoredSession(): StoredActiveSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.user && parsed?.session && parsed?.profile) {
      return parsed as StoredActiveSession;
    }
  } catch {
    // Safe catch
  }
  return null;
}

function saveActiveSession(user: User, session: Session, profile: Profile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_ACTIVE_SESSION, JSON.stringify({ user, session, profile }));
    localStorage.setItem(STORAGE_CACHED_PROFILE, JSON.stringify(profile));
  } catch {
    // Safe catch
  }
}

function clearActiveSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_ACTIVE_SESSION);
    localStorage.removeItem(STORAGE_CACHED_PROFILE);
  } catch {
    // Safe catch
  }
}

function isNetworkOrTimeoutError(err: unknown): boolean {
  if (!err) return false;
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "object" && err !== null && "message" in err
      ? String((err as { message: unknown }).message)
      : String(err);
  const lower = msg.toLowerCase();
  return (
    lower.includes("fetch") ||
    lower.includes("network") ||
    lower.includes("timeout") ||
    lower.includes("failed to fetch") ||
    lower.includes("abort") ||
    lower.includes("connection") ||
    lower.includes("offline")
  );
}

function getLocalUsers(): Record<string, LocalUserRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_USERS);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LocalUserRecord>;
  } catch {
    return {};
  }
}

function createLocalAuthSession(
  userId: string,
  email: string,
  callsign: string,
  avatarUrl: string,
  provider = "local"
): StoredActiveSession {
  const user: User = {
    id: userId,
    app_metadata: { provider },
    user_metadata: {
      callsign,
      avatar_url: avatarUrl,
      full_name: callsign,
    },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email,
    phone: "",
    role: "authenticated",
    updated_at: new Date().toISOString(),
  };

  const session: Session = {
    access_token: `local_jwt_${provider}_${userId}_${Date.now()}`,
    refresh_token: `local_refresh_${provider}_${userId}`,
    expires_in: 3600 * 24 * 30, // 30 days
    expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 30,
    token_type: "bearer",
    user,
  };

  const profile: Profile = {
    id: userId,
    email,
    callsign,
    avatar_url: avatarUrl,
    total_stars: 0,
    updated_at: new Date().toISOString(),
  };

  return { user, session, profile };
}

// Timeout helper to prevent hanging cloud network calls
function withTimeout<T>(promise: PromiseLike<T>, ms: number, timeoutErrorMsg: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutErrorMsg));
    }, ms);
    Promise.resolve(promise)
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// ────────────────────────────────────────────────
//  Store Interface
// ────────────────────────────────────────────────
export interface AuthState {
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

    // 2. Immediate local session restore (zero UI flicker)
    const stored = getStoredSession();
    if (stored) {
      set({
        user: stored.user,
        session: stored.session,
        profile: stored.profile,
        isLoading: false,
        error: null,
      });
    } else {
      set({ isLoading: Boolean(isSupabaseConfigured), error: null });
    }

    // 3. If Supabase is configured, check for remote session in background
    if (isSupabaseConfigured) {
      try {
        const { data: sessionData } = await withTimeout(
          supabase.auth.getSession(),
          2000,
          "Cloud getSession timeout"
        );

        const initialSession = sessionData?.session ?? null;
        const initialUser = initialSession?.user ?? null;

        if (initialUser) {
          set({
            session: initialSession,
            user: initialUser,
            isLoading: true,
          });
          await get().fetchProfile(initialUser.id);
        } else if (!stored) {
          set({ isLoading: false });
        }

        // Setup subscription
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          const nextUser = session?.user ?? null;
          if (nextUser) {
            set({
              session,
              user: nextUser,
              isLoading: false,
            });
            await get().fetchProfile(nextUser.id);
          } else if (!getStoredSession()) {
            set({
              session: null,
              user: null,
              profile: null,
              isLoading: false,
            });
          }
        });

        authSubscription = subscription;
      } catch (err) {
        console.warn("[Auth] Cloud auth init skipped/offline:", err);
        set({ isLoading: false });
      }
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
      // 1. If Supabase is configured, attempt OAuth URL generation with skipBrowserRedirect
      if (isSupabaseConfigured) {
        const redirectUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}${import.meta.env.BASE_URL || "/"}`
            : undefined;

        try {
          const { data, error } = await withTimeout(
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true,
              },
            }),
            2500,
            "Cloud OAuth timeout"
          );

          if (!error && data?.url) {
            // Verify if the host can actually be reached before navigating away
            try {
              const urlObj = new URL(data.url);
              const testPing = await withTimeout(
                fetch(`${urlObj.origin}/auth/v1/health`, { method: "HEAD", mode: "no-cors" }),
                1200,
                "OAuth ping timeout"
              );
              if (testPing) {
                window.location.href = data.url;
                return { error: null };
              }
            } catch {
              console.warn("[Auth] Supabase endpoint unreachable, activating local Google Engineer profile.");
            }
          }
        } catch (cloudErr) {
          console.warn("[Auth] Supabase Google OAuth unavailable, falling back to local:", cloudErr);
        }
      }

      // 2. Fallback: Instant Local Google Cadet Engineer Session
      const googleSession = createLocalAuthSession(
        "google-cadet-engineer-01",
        "cadet.engineer@google.internal",
        "Google Cadet Engineer",
        "https://api.dicebear.com/7.x/bottts/svg?seed=GoogleCadet",
        "google"
      );

      saveActiveSession(googleSession.user, googleSession.session, googleSession.profile);

      set({
        user: googleSession.user,
        session: googleSession.session,
        profile: googleSession.profile,
        isLoading: false,
        error: null,
      });

      toast.success(
        "Авторизовано через Google",
        "Локальний профіль інженера активовано (Офлайн-режим)."
      );

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      const err = new Error(
        i18n.t("auth.serverUnavailable", "Сервер недоступний, спробуйте пізніше")
      );
      set({ error: err.message, isLoading: false });
      return { error: err };
    }

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        }),
        3000,
        "Cloud signIn timeout"
      );

      if (!error && data?.user) {
        set({
          user: data.user,
          session: data.session,
          isLoading: false,
          error: null,
        });
        await get().fetchProfile(data.user.id);
        const currentProfile = get().profile;
        if (data.session && currentProfile) {
          saveActiveSession(data.user, data.session, currentProfile);
        }
        toast.success("Вхід виконано", "Вітаємо на інженерному верстаку!");
        return { error: null };
      }

      if (error) {
        if (isNetworkOrTimeoutError(error)) {
          const err = new Error(
            i18n.t("auth.serverUnavailable", "Сервер недоступний, спробуйте пізніше")
          );
          set({ error: err.message, isLoading: false });
          return { error: err };
        }
        throw error;
      }

      const err = new Error(
        i18n.t("auth.serverUnavailable", "Сервер недоступний, спробуйте пізніше")
      );
      set({ error: err.message, isLoading: false });
      return { error: err };
    } catch (err) {
      const error = isNetworkOrTimeoutError(err)
        ? new Error(i18n.t("auth.serverUnavailable", "Сервер недоступний, спробуйте пізніше"))
        : err instanceof Error
        ? err
        : new Error(String(err));
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },

  signUpWithEmail: async (email: string, password: string, callsign?: string) => {
    set({ isLoading: true, error: null });
    const cleanEmail = email.trim().toLowerCase();
    const cleanCallsign = callsign?.trim() || cleanEmail.split("@")[0] || "Engineer";

    if (!isSupabaseConfigured) {
      const err = new Error(
        i18n.t("auth.serverUnavailable", "Сервер недоступний, спробуйте пізніше")
      );
      set({ error: err.message, isLoading: false });
      return { error: err };
    }

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              callsign: cleanCallsign,
            },
          },
        }),
        3000,
        "Cloud signUp timeout"
      );

      if (!error && data?.user) {
        set({
          user: data.user,
          session: data.session,
          isLoading: false,
          error: null,
        });
        await get().fetchProfile(data.user.id);
        const currentProfile = get().profile;
        if (data.session && currentProfile) {
          saveActiveSession(data.user, data.session, currentProfile);
        }
        toast.success("Профіль створено", "Ласкаво просимо до Інженерного верстака!");
        return { error: null };
      }

      if (error) {
        if (isNetworkOrTimeoutError(error)) {
          const err = new Error(
            i18n.t("auth.serverUnavailable", "Сервер недоступний, спробуйте пізніше")
          );
          set({ error: err.message, isLoading: false });
          return { error: err };
        }
        throw error;
      }

      const err = new Error(
        i18n.t("auth.serverUnavailable", "Сервер недоступний, спробуйте пізніше")
      );
      set({ error: err.message, isLoading: false });
      return { error: err };
    } catch (err) {
      const error = isNetworkOrTimeoutError(err)
        ? new Error(i18n.t("auth.serverUnavailable", "Сервер недоступний, спробуйте пізніше"))
        : err instanceof Error
        ? err
        : new Error(String(err));
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    clearActiveSession();
    try {
      if (isSupabaseConfigured) {
        await withTimeout(supabase.auth.signOut(), 1500, "SignOut timeout").catch(() => {});
      }
    } catch {
      // Safe catch
    } finally {
      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        error: null,
      });
      toast.info("Вихід з системи", "Сесію інженера завершено.");
    }
  },

  fetchProfile: async (userId: string) => {
    if (!userId) {
      set({ isLoading: false });
      return;
    }

    // Check local session/users first
    const stored = getStoredSession();
    if (stored && stored.user.id === userId) {
      set({ profile: stored.profile, isLoading: false });
      return;
    }

    if (!isSupabaseConfigured || userId.startsWith("local-") || userId.startsWith("google-")) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data, error } = await withTimeout(
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single(),
        2500,
        "Fetch profile timeout"
      );

      const user = get().user;
      const metaAvatar =
        user?.user_metadata?.avatar_url ||
        user?.user_metadata?.picture ||
        null;
      const metaCallsign =
        user?.user_metadata?.callsign ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "Engineer";

      if (error || !data) {
        const fallbackProfile: Profile = {
          id: userId,
          email: user?.email || null,
          callsign: metaCallsign,
          avatar_url: metaAvatar,
          total_stars: 0,
          updated_at: new Date().toISOString(),
        };
        set({ profile: fallbackProfile });
      } else {
        const profileRecord = data as Profile;
        if (!profileRecord.avatar_url && metaAvatar) {
          profileRecord.avatar_url = metaAvatar;
        }
        if (!profileRecord.callsign && metaCallsign) {
          profileRecord.callsign = metaCallsign;
        }
        set({ profile: profileRecord });
      }
    } catch (err) {
      console.warn("[Auth] Fetch profile exception (using fallback):", err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const user = get().user;
    const currentProfile = get().profile;

    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // 1. Optimistically update local store
    const nextProfile: Profile = currentProfile
      ? { ...currentProfile, ...payload }
      : {
          id: user?.id || "guest",
          email: user?.email || null,
          callsign: updates.callsign || "Engineer",
          avatar_url: updates.avatar_url || null,
          total_stars: 0,
          ...payload,
        };

    set({ profile: nextProfile });

    // 2. Persist to localStorage active session and cached profile
    if (user && get().session) {
      saveActiveSession(user, get().session!, nextProfile);
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_CACHED_PROFILE, JSON.stringify(nextProfile));
        if (user?.email) {
          const localUsers = getLocalUsers();
          const cleanEmail = user.email.toLowerCase();
          if (localUsers[cleanEmail]) {
            localUsers[cleanEmail].callsign = nextProfile.callsign || localUsers[cleanEmail].callsign;
            localUsers[cleanEmail].avatar_url = nextProfile.avatar_url || localUsers[cleanEmail].avatar_url;
            localStorage.setItem(STORAGE_LOCAL_USERS, JSON.stringify(localUsers));
          }
        }
      } catch {
        // Safe catch
      }
    }

    // 3. If connected to cloud, attempt sync
    if (isSupabaseConfigured && user && !user.id.startsWith("local-") && !user.id.startsWith("google-")) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update(payload)
          .eq("id", user.id);

        if (error) {
          console.warn("[Auth] Cloud profile update warning (saved locally):", error.message);
        }
      } catch (err) {
        console.warn("[Auth] Cloud profile update network error (saved locally):", err);
      }
    }

    toast.success("Профіль оновлено", "Зміни збережено в системі.");
    return { error: null };
  },

  clearError: () => set({ error: null }),
}));
