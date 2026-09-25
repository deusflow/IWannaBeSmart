import { describe, it, expect, beforeEach } from "vitest";
import {
  saveStationCheckpoint,
  getStationCheckpoint,
  saveCodeDraft,
  getCodeDraft,
  clearCodeDraft,
  saveGlobalSession,
  getGlobalSession,
  saveCrashSnapshot,
  getCrashSnapshot,
  clearCrashSnapshot,
  clearSafeTransientCaches,
  SACRED_PROGRESS_KEYS,
} from "../checkpointManager";

// Mock localStorage for Node test environment
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

(globalThis as unknown as { localStorage: unknown }).localStorage = localStorageMock;
(globalThis as unknown as { window: unknown }).window = {
  location: { href: "http://localhost:5173/" } as unknown as Location,
  localStorage: localStorageMock,
};

describe("checkpointManager (Zero Progress Loss & Crash Recovery)", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("Station Checkpoint Persistence", () => {
    it("saves and retrieves station checkpoint with task, tier, round, and language", () => {
      saveStationCheckpoint("pos", {
        taskId: "task-pos-3",
        tier: 1,
        round: 2,
        lang: "csharp",
      });

      const cp = getStationCheckpoint("pos");
      expect(cp).not.toBeNull();
      expect(cp?.stationId).toBe("pos");
      expect(cp?.taskId).toBe("task-pos-3");
      expect(cp?.tier).toBe(1);
      expect(cp?.round).toBe(2);
      expect(cp?.lang).toBe("csharp");
      expect(cp?.updatedAt).toBeGreaterThan(0);
    });

    it("returns null for non-existent station checkpoint", () => {
      expect(getStationCheckpoint("unknown")).toBeNull();
    });
  });

  describe("Code Draft Auto-Save", () => {
    it("saves and retrieves user draft code across reloads", () => {
      const code = "public void Pay() { Console.WriteLine(123); }";
      saveCodeDraft("task-api-1", "csharp", 2, code);

      expect(getCodeDraft("task-api-1", "csharp", 2)).toBe(code);
    });

    it("removes draft when clearCodeDraft is called or empty string saved", () => {
      saveCodeDraft("task-api-1", "csharp", 2, "temp code");
      clearCodeDraft("task-api-1", "csharp", 2);
      expect(getCodeDraft("task-api-1", "csharp", 2)).toBeNull();

      saveCodeDraft("task-api-1", "csharp", 2, "   ");
      expect(getCodeDraft("task-api-1", "csharp", 2)).toBeNull();
    });
  });

  describe("Global Session Persistence", () => {
    it("saves and restores currentStationId and currentView", () => {
      saveGlobalSession({
        currentStationId: "bandit",
        currentView: "STATION",
        activeView: "device",
      });

      const session = getGlobalSession();
      expect(session).not.toBeNull();
      expect(session?.currentStationId).toBe("bandit");
      expect(session?.currentView).toBe("STATION");
      expect(session?.activeView).toBe("device");
    });
  });

  describe("Crash Snapshot & Emergency Safety", () => {
    it("records emergency crash snapshot with error details and active context", () => {
      const fakeError = new Error("Simulated memory overflow");
      fakeError.stack = "Error: Simulated memory overflow\n  at test.ts:42";

      saveCrashSnapshot(fakeError, {
        stationId: "vertex",
        currentView: "STATION",
        activeTaskId: "task-vertex-2",
        activeRound: 3,
      });

      const snapshot = getCrashSnapshot();
      expect(snapshot).not.toBeNull();
      expect(snapshot?.stationId).toBe("vertex");
      expect(snapshot?.errorMessage).toBe("Simulated memory overflow");
      expect(snapshot?.activeTaskId).toBe("task-vertex-2");
      expect(snapshot?.activeRound).toBe(3);

      clearCrashSnapshot();
      expect(getCrashSnapshot()).toBeNull();
    });

    it("never wipes sacred progress keys (XP, stars, completed tasks) during transient cache clearance", () => {
      // Set sacred progress data
      localStorage.setItem("iw_user_xp", "450");
      localStorage.setItem("iw_mastery_stars", JSON.stringify({ "task-1": 3, "task-2": 2 }));
      localStorage.setItem("iw_completed_tasks", JSON.stringify({ "task-1": true }));
      localStorage.setItem("iw_task_best_wpm", JSON.stringify({ "task-1": 65 }));
      localStorage.setItem("iw_active_session", "session-token");

      // Set transient UI items
      localStorage.setItem("iw_temp_filter", "all");
      localStorage.setItem("iw_ui_transient_drawer", "open");

      clearSafeTransientCaches();

      // Verify sacred progress is 100% intact!
      expect(SACRED_PROGRESS_KEYS.size).toBeGreaterThan(0);
      expect(localStorage.getItem("iw_user_xp")).toBe("450");
      expect(localStorage.getItem("iw_mastery_stars")).toContain("task-1");
      expect(localStorage.getItem("iw_completed_tasks")).toContain("task-1");
      expect(localStorage.getItem("iw_task_best_wpm")).toContain("65");
      expect(localStorage.getItem("iw_active_session")).toBe("session-token");

      // Verify transient garbage was cleaned
      expect(localStorage.getItem("iw_temp_filter")).toBeNull();
      expect(localStorage.getItem("iw_ui_transient_drawer")).toBeNull();
    });
  });
});
