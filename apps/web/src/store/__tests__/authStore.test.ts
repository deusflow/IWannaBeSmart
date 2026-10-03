/**
 * @file apps/web/src/store/__tests__/authStore.test.ts
 * @description Comprehensive unit tests for self-healing, offline-first AuthStore with mocked Supabase client
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { User, Session } from "@supabase/supabase-js";

// Mock localStorage and window for Node test environment
const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, val: string) => {
    storageMap.set(key, String(val));
  },
  removeItem: (key: string) => {
    storageMap.delete(key);
  },
  clear: () => {
    storageMap.clear();
  },
  get length() {
    return storageMap.size;
  },
  key: (i: number) => Array.from(storageMap.keys())[i] ?? null,
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, "window", {
  value: {
    localStorage: localStorageMock,
    location: { origin: "http://localhost:5173", href: "http://localhost:5173" },
  },
  writable: true,
  configurable: true,
});

// Mock supabaseClient to prevent real network calls
vi.mock("../../lib/supabaseClient", () => {
  const createQueryBuilder = () => {
    const builder: Record<string, unknown> = {};
    const chainMethods = [
      "select", "insert", "update", "upsert", "delete",
      "eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike",
      "is", "in", "contains", "containedBy", "range",
      "match", "filter", "not", "or", "order", "limit", "offset",
      "single", "maybeSingle",
    ];
    for (const method of chainMethods) {
      builder[method] = vi.fn(() => builder);
    }
    builder.then = (onfulfilled?: (value: unknown) => unknown) =>
      Promise.resolve({ data: null, error: null }).then(onfulfilled);
    builder.catch = (onrejected?: (reason: unknown) => unknown) =>
      Promise.resolve({ data: null, error: null }).catch(onrejected);
    return builder;
  };

  const mockClient = {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
        error: null,
      })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({
        data: { provider: "google", url: "https://mock.supabase.co/oauth" },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: new Error("Cloud signIn fallback"),
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: new Error("Cloud signUp fallback"),
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ data: null, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: vi.fn(() => createQueryBuilder()),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  };

  return {
    supabase: mockClient,
    isSupabaseConfigured: true,
  };
});

import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../authStore";

describe("authStore (Offline-First Self-Healing Auth Engine)", () => {
  beforeEach(async () => {
    storageMap.clear();
    window.location.href = "http://localhost:5173";
    vi.clearAllMocks();
    await useAuthStore.getState().signOut();
    useAuthStore.getState().clearError();
  });

  it("starts in unauthenticated guest state with empty profile", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.error).toBeNull();
  });

  describe("signUpWithEmail (Local Offline Registration)", () => {
    it("successfully creates a new local engineer account and active session", async () => {
      const { error } = await useAuthStore.getState().signUpWithEmail(
        "cadet@station.local",
        "secret123",
        "Ghost-Engineer"
      );

      expect(error).toBeNull();
      const state = useAuthStore.getState();
      expect(state.user).not.toBeNull();
      expect(state.user?.email).toBe("cadet@station.local");
      expect(state.profile?.callsign).toBe("Ghost-Engineer");
      expect(state.profile?.avatar_url).toContain("Ghost-Engineer");
      expect(state.session?.access_token).toBeDefined();

      // Check localStorage persistence
      const activeSessionRaw = localStorage.getItem("iw_active_session");
      expect(activeSessionRaw).toBeTruthy();
      const parsedSession = JSON.parse(activeSessionRaw!);
      expect(parsedSession.user.email).toBe("cadet@station.local");
      expect(parsedSession.profile.callsign).toBe("Ghost-Engineer");
    });

    it("falls back to email username if callsign is not provided", async () => {
      const { error } = await useAuthStore.getState().signUpWithEmail(
        "chief.architect@firmware.org",
        "pass12345"
      );

      expect(error).toBeNull();
      const state = useAuthStore.getState();
      expect(state.profile?.callsign).toBe("chief.architect");
    });
  });

  describe("signInWithEmail (Local Offline & Cloud Login)", () => {
    it("blocks password login for offline local profiles without password", async () => {
      // 1. Register offline first
      await useAuthStore.getState().signUpWithEmail(
        "alex@cyber.net",
        "validPass99",
        "Alex-01"
      );
      await useAuthStore.getState().signOut();
      expect(useAuthStore.getState().user).toBeNull();

      // 2. Sign in via password must be blocked for offline profiles
      const { error } = await useAuthStore.getState().signInWithEmail(
        "alex@cyber.net",
        "validPass99"
      );

      expect(error).not.toBeNull();
      expect(error?.message).toContain("офлайн-профіль");
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("logs in with valid cloud credentials when online", async () => {
      const mockUser = {
        id: "cloud-user-123",
        email: "cloud.cadet@smart.com",
        app_metadata: { provider: "email" },
        user_metadata: { callsign: "CloudCadet" },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      };
      const mockSession = {
        access_token: "mock-jwt-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-refresh-token",
        user: mockUser,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: mockUser as unknown as User, session: mockSession as unknown as Session },
        error: null,
      });

      const { error } = await useAuthStore.getState().signInWithEmail(
        "cloud.cadet@smart.com",
        "secretCloudPass"
      );

      expect(error).toBeNull();
      const state = useAuthStore.getState();
      expect(state.user?.email).toBe("cloud.cadet@smart.com");
    });

    it("guides unregistered users to the registration tab", async () => {
      const { error } = await useAuthStore.getState().signInWithEmail(
        "unknown@nowhere.com",
        "somePassword"
      );

      expect(error).not.toBeNull();
      expect(error?.message).toContain("Реєстрація");
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe("signInWithGoogle (Online & Offline Resilience)", () => {
    it("redirects to OAuth URL when Supabase is online or activates offline profile when offline", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce({
        data: { provider: "google", url: "https://mock.supabase.co/oauth" },
        error: null,
      });

      const { error } = await useAuthStore.getState().signInWithGoogle();
      fetchSpy.mockRestore();

      expect(error).toBeNull();
      expect(window.location.href).toContain("mock.supabase.co");
    });

    it("immediately authenticates cadet engineer when Google OAuth is triggered offline", async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValueOnce(new Error("fetch failed"));
      const { error } = await useAuthStore.getState().signInWithGoogle();

      expect(error).toBeNull();
      const state = useAuthStore.getState();
      expect(state.user).not.toBeNull();
      expect(state.user?.email).toBe("cadet.engineer@google.internal");
      expect(state.user?.app_metadata.provider).toBe("google");
      expect(state.profile?.callsign).toBe("Google Cadet Engineer");
      expect(state.profile?.avatar_url).toContain("GoogleCadet");

      // Verify active session saved
      const savedRaw = localStorage.getItem("iw_active_session");
      expect(savedRaw).toContain("google.internal");
    });
  });

  describe("updateProfile & Session Persistence", () => {
    it("updates callsign and avatar locally and persists to session cache", async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValueOnce(new Error("fetch failed"));
      await useAuthStore.getState().signInWithGoogle();

      const { error } = await useAuthStore.getState().updateProfile({
        callsign: "Cyber-Vanguard",
        avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Vanguard",
      });

      expect(error).toBeNull();
      const state = useAuthStore.getState();
      expect(state.profile?.callsign).toBe("Cyber-Vanguard");
      expect(state.profile?.avatar_url).toBe("https://api.dicebear.com/7.x/bottts/svg?seed=Vanguard");

      // Check cached profile in localStorage
      const cached = JSON.parse(localStorage.getItem("iw_cached_profile") || "{}");
      expect(cached.callsign).toBe("Cyber-Vanguard");
    });

    it("restores saved session on initAuth without UI flicker", async () => {
      // 1. Create session
      await useAuthStore.getState().signUpWithEmail(
        "restore@session.dev",
        "mypassword",
        "RestoreCadet"
      );

      // 2. Simulate fresh page load by resetting in-memory zustand state
      useAuthStore.setState({ user: null, session: null, profile: null });
      expect(useAuthStore.getState().user).toBeNull();

      // 3. Trigger initAuth
      await useAuthStore.getState().initAuth();

      // 4. Verify session restored from localStorage
      const state = useAuthStore.getState();
      expect(state.user).not.toBeNull();
      expect(state.user?.email).toBe("restore@session.dev");
      expect(state.profile?.callsign).toBe("RestoreCadet");
    });

    it("clears local session on signOut", async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValueOnce(new Error("fetch failed"));
      await useAuthStore.getState().signInWithGoogle();
      expect(useAuthStore.getState().user).not.toBeNull();
      expect(localStorage.getItem("iw_active_session")).toBeTruthy();

      await useAuthStore.getState().signOut();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().profile).toBeNull();
      expect(localStorage.getItem("iw_active_session")).toBeNull();
    });
  });
});
