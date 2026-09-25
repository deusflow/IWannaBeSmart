/**
 * @file apps/web/src/utils/checkpointManager.ts
 * @description Bulletproof Auto-Save, Station Checkpoints & Crash-Resilient Session Recovery.
 *              Guarantees zero progress loss: keeps user XP, mastery stars, current station,
 *              active task, round, and typed editor drafts safe even if the app crashes or reloads.
 */

export interface StationCheckpoint {
  stationId: string;
  taskId: string;
  tier: number;
  round: 1 | 2 | 3 | 4;
  lang?: string;
  updatedAt: number;
}

export interface GlobalSessionState {
  currentStationId: string;
  currentView: "HUB" | "STATION" | "WAR_ROOM";
  activeView?: "device" | "architecture";
  updatedAt: number;
}

export interface CrashSnapshot {
  timestamp: number;
  stationId: string;
  currentView: string;
  activeTaskId?: string;
  activeRound?: number;
  errorMessage: string;
  errorStack?: string;
  url: string;
}

const STORAGE_PREFIX = "iw_";
const KEY_GLOBAL_SESSION = "iw_global_session";
const KEY_STATION_CHECKPOINT_PREFIX = "iw_checkpoint_";
const KEY_CODE_DRAFT_PREFIX = "iw_draft_";
const KEY_CRASH_SNAPSHOT = "iw_emergency_crash_snapshot";

/**
 * Keys that must NEVER be deleted during recovery or cache clear,
 * as they contain the student's actual hard-earned pedagogical mastery.
 */
export const SACRED_PROGRESS_KEYS = new Set([
  "iw_user_xp",
  "iw_completed_tasks",
  "iw_mastery_stars",
  "iw_task_best_wpm",
  "iw_active_session",
  "iw_cached_profile",
  "iw_local_users",
]);

// ─────────────────────────────────────────────────────────────
// 1. Station Checkpoints (Last Task, Tier, Round & Language)
// ─────────────────────────────────────────────────────────────

export function saveStationCheckpoint(
  stationId: string,
  data: {
    taskId: string;
    tier?: number;
    round?: 1 | 2 | 3 | 4;
    lang?: string;
  }
): void {
  if (typeof window === "undefined") return;
  try {
    const checkpoint: StationCheckpoint = {
      stationId,
      taskId: data.taskId,
      tier: data.tier ?? 0,
      round: data.round ?? 1,
      lang: data.lang,
      updatedAt: Date.now(),
    };
    localStorage.setItem(
      `${KEY_STATION_CHECKPOINT_PREFIX}${stationId}`,
      JSON.stringify(checkpoint)
    );
  } catch {
    // Storage quota or privacy sandbox fallback
  }
}

export function getStationCheckpoint(stationId: string): StationCheckpoint | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${KEY_STATION_CHECKPOINT_PREFIX}${stationId}`);
    if (!raw) return null;
    return JSON.parse(raw) as StationCheckpoint;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 2. Code Draft Auto-Save (Protects Unfinished Editor Input)
// ─────────────────────────────────────────────────────────────

function getCodeDraftKey(taskId: string, lang: string, round: number): string {
  return `${KEY_CODE_DRAFT_PREFIX}${taskId}_${lang}_r${round}`;
}

export function saveCodeDraft(
  taskId: string,
  lang: string,
  round: number,
  code: string
): void {
  if (typeof window === "undefined") return;
  try {
    // Only save if code is non-empty
    if (code && code.trim().length > 0) {
      localStorage.setItem(getCodeDraftKey(taskId, lang, round), code);
    } else {
      localStorage.removeItem(getCodeDraftKey(taskId, lang, round));
    }
  } catch {
    // Safe quota catch
  }
}

export function getCodeDraft(
  taskId: string,
  lang: string,
  round: number
): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(getCodeDraftKey(taskId, lang, round));
  } catch {
    return null;
  }
}

export function clearCodeDraft(taskId: string, lang: string, round: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getCodeDraftKey(taskId, lang, round));
  } catch {
    // Safe catch
  }
}

// ─────────────────────────────────────────────────────────────
// 3. Global Session Persistence (Station & View Mode)
// ─────────────────────────────────────────────────────────────

export function saveGlobalSession(data: {
  currentStationId: string;
  currentView: "HUB" | "STATION" | "WAR_ROOM";
  activeView?: "device" | "architecture";
}): void {
  if (typeof window === "undefined") return;
  try {
    const session: GlobalSessionState = {
      currentStationId: data.currentStationId,
      currentView: data.currentView,
      activeView: data.activeView,
      updatedAt: Date.now(),
    };
    localStorage.setItem(KEY_GLOBAL_SESSION, JSON.stringify(session));
    localStorage.setItem("iw_current_station", data.currentStationId);
    localStorage.setItem("iw_current_view", data.currentView);
  } catch {
    // Safe catch
  }
}

export function getGlobalSession(): GlobalSessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_GLOBAL_SESSION);
    if (!raw) {
      const station = localStorage.getItem("iw_current_station");
      const view = localStorage.getItem("iw_current_view") as "HUB" | "STATION" | null;
      if (station || view) {
        return {
          currentStationId: station || "tv",
          currentView: view || "HUB",
          updatedAt: Date.now(),
        };
      }
      return null;
    }
    return JSON.parse(raw) as GlobalSessionState;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 4. Emergency Crash Snapshotting & Safe Recovery
// ─────────────────────────────────────────────────────────────

export function saveCrashSnapshot(
  error: Error,
  additionalContext: {
    stationId?: string;
    currentView?: string;
    activeTaskId?: string;
    activeRound?: number;
  } = {}
): void {
  if (typeof window === "undefined") return;
  try {
    const snapshot: CrashSnapshot = {
      timestamp: Date.now(),
      stationId: additionalContext.stationId || localStorage.getItem("iw_current_station") || "tv",
      currentView: additionalContext.currentView || localStorage.getItem("iw_current_view") || "HUB",
      activeTaskId: additionalContext.activeTaskId,
      activeRound: additionalContext.activeRound,
      errorMessage: error.message || String(error),
      errorStack: error.stack,
      url: window.location.href,
    };
    localStorage.setItem(KEY_CRASH_SNAPSHOT, JSON.stringify(snapshot));
  } catch {
    // Safe catch
  }
}

export function getCrashSnapshot(): CrashSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_CRASH_SNAPSHOT);
    if (!raw) return null;
    return JSON.parse(raw) as CrashSnapshot;
  } catch {
    return null;
  }
}

export function clearCrashSnapshot(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY_CRASH_SNAPSHOT);
  } catch {
    // Safe catch
  }
}

/**
 * Safely clears transient temporary state without wiping user progress,
 * XP, stars, account credentials, or completed stations.
 */
export function clearSafeTransientCaches(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX) && !SACRED_PROGRESS_KEYS.has(k)) {
        // Keep drafts and checkpoints safe unless corrupted
        if (!k.startsWith(KEY_CODE_DRAFT_PREFIX) && !k.startsWith(KEY_STATION_CHECKPOINT_PREFIX)) {
          keysToRemove.push(k);
        }
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Safe catch
  }
}
