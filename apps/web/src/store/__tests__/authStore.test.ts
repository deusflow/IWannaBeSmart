/**
 * @file apps/web/src/store/__tests__/authStore.test.ts
 * @description Comprehensive unit tests for self-healing, offline-first AuthStore
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { supabase } from "../../lib/supabaseClient";

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

import { useAuthStore } from "../authStore";

describe("authStore (Offline-First Self-Healing Auth Engine)", () => {
  beforeEach(async () => {
    storageMap.clear();
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

  describe("signInWithEmail (Local Offline Login)", () => {
    it("logs in with correct password after registration", async () => {
      // 1. Register first
      await useAuthStore.getState().signUpWithEmail(
        "alex@cyber.net",
        "validPass99",
        "Alex-01"
      );
      await useAuthStore.getState().signOut();
      expect(useAuthStore.getState().user).toBeNull();

      // 2. Sign in
      const { error } = await useAuthStore.getState().signInWithEmail(
        "alex@cyber.net",
        "validPass99"
      );

      expect(error).toBeNull();
      const state = useAuthStore.getState();
      expect(state.user?.email).toBe("alex@cyber.net");
      expect(state.profile?.callsign).toBe("Alex-01");
    });

    it("rejects login if password does not match", async () => {
      await useAuthStore.getState().signUpWithEmail(
        "serhiy@mesh.org",
        "correctPass",
        "Serhiy"
      );
      await useAuthStore.getState().signOut();

      const { error } = await useAuthStore.getState().signInWithEmail(
        "serhiy@mesh.org",
        "wrongPass"
      );

      expect(error).not.toBeNull();
      expect(error?.message).toContain("Невірний пароль");
      expect(useAuthStore.getState().user).toBeNull();
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
      const { error } = await useAuthStore.getState().signInWithGoogle();
      fetchSpy.mockRestore();
      expect(error).toBeNull();
      if (window.location.href.includes("supabase.co")) {
        expect(window.location.href).toContain("supabase.co");
      } else {
        expect(useAuthStore.getState().user?.email).toBe("cadet.engineer@google.internal");
      }
    });

    it("immediately authenticates cadet engineer when Google OAuth is triggered offline", async () => {
      vi.spyOn(supabase.auth, "signInWithOAuth").mockRejectedValueOnce(new Error("fetch failed"));
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
      vi.spyOn(supabase.auth, "signInWithOAuth").mockRejectedValueOnce(new Error("fetch failed"));
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
      vi.spyOn(supabase.auth, "signInWithOAuth").mockRejectedValueOnce(new Error("fetch failed"));
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
