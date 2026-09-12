/**
 * @file apps/web/src/store/slices/mentorSlice.ts
 * @description Gamification, XP, coding task completion, mastery stars, and cloud sync
 */

import type { StateCreator } from "zustand";
import { CODING_TASKS } from "@iw/sim-engine";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { useAuthStore } from "../authStore";
import type {
  WorkbenchStore,
  MentorSlice,
  MentorPhase,
} from "../types";

export const createMentorSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  MentorSlice
> = (set, get) => ({
  mentorPhase: "GUIDED",
  guidedStep: 1,
  isHintActive: false,
  isStationVictoryModalOpen: false,

  xp: (() => {
    try {
      return typeof window !== "undefined"
        ? parseInt(localStorage.getItem("iw_user_xp") || "0", 10) || 0
        : 0;
    } catch {
      return 0;
    }
  })(),

  completedCodingTasks: (() => {
    try {
      return typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("iw_completed_tasks") || "{}")
        : {};
    } catch {
      return {};
    }
  })(),

  setStationVictoryModalOpen: (open: boolean) => set({ isStationVictoryModalOpen: open }),

  completeCodingTask: (taskId: string) => {
    const alreadyCompleted = Boolean(get().completedCodingTasks[taskId]);
    if (!alreadyCompleted) {
      const xpGain = taskId === "task-command-registry" ? 50 : 25;
      const nextCompleted = { ...get().completedCodingTasks, [taskId]: true };
      const tvTaskIds = CODING_TASKS.map((t) => t.id);
      const allTvCompleted = tvTaskIds.every((id) => nextCompleted[id]);
      const nextXp = get().xp + xpGain;

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("iw_completed_tasks", JSON.stringify(nextCompleted));
          localStorage.setItem("iw_user_xp", String(nextXp));
        }
      } catch {
        // Safe catch
      }

      set((s) => ({
        completedCodingTasks: nextCompleted,
        xp: nextXp,
        isStationVictoryModalOpen: allTvCompleted ? true : s.isStationVictoryModalOpen,
      }));
      return true;
    }
    return false;
  },

  isCodingTaskCompleted: (taskId: string) => {
    return Boolean(get().completedCodingTasks[taskId]);
  },

  setMentorPhase: (phase: MentorPhase) => set({ mentorPhase: phase }),
  setGuidedStep: (step: 1 | 2 | 3) => set({ guidedStep: step }),

  triggerHint: () => {
    set({ isHintActive: true });
    setTimeout(() => {
      set({ isHintActive: false });
    }, 4000);
  },

  addXp: (amount: number) =>
    set((s) => {
      const nextXp = s.xp + amount;
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("iw_user_xp", String(nextXp));
        }
      } catch {
        // Safe catch
      }
      return { xp: nextXp };
    }),

  taskMasteryStars: (() => {
    try {
      return typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("iw_mastery_stars") || "{}")
        : {};
    } catch {
      return {};
    }
  })(),

  setTaskMastery: (taskId: string, stars: number, bestWpm?: number) => {
    const current = get().taskMasteryStars[taskId] || 0;
    const nextStars = Math.max(current, stars);
    const nextMap = { ...get().taskMasteryStars, [taskId]: nextStars };
    set({ taskMasteryStars: nextMap });
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("iw_mastery_stars", JSON.stringify(nextMap));
      }
    } catch {
      // Safe catch
    }

    // Offline-First cloud sync with onConflict if authenticated
    if (isSupabaseConfigured) {
      try {
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          const payload: {
            user_id: string;
            station_id: string;
            task_id: string;
            tier: number;
            stars: number;
            best_wpm?: number;
            completed_at: string;
          } = {
            user_id: userId,
            station_id: get().currentStationId || "tv",
            task_id: taskId,
            tier: 0,
            stars: nextStars,
            completed_at: new Date().toISOString(),
          };

          if (typeof bestWpm === "number" && bestWpm > 0) {
            payload.best_wpm = bestWpm;
          }

          supabase
            .from("user_progress")
            .upsert(payload, { onConflict: "user_id,station_id,task_id" })
            .then(
              ({ error }) => {
                if (error) {
                  console.warn("[Workbench] Upsert user_progress warning:", error.message);
                }
              },
              (err: unknown) => {
                console.warn("[Workbench] Cloud sync network issue (offline):", err);
              }
            );
        }
      } catch {
        // Safe catch for offline/stub mode
      }
    }
  },

  saveTaskProgress: (taskId: string, stars: number, bestWpm?: number) => {
    get().setTaskMastery(taskId, stars, bestWpm);
  },

  getTaskMastery: (taskId: string) => get().taskMasteryStars[taskId] || 0,

  syncCloudProgress: async (userId: string) => {
    if (!isSupabaseConfigured || !userId) return;

    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.warn("[Workbench] Failed to fetch cloud progress:", error.message);
        return;
      }

      const localMap = { ...get().taskMasteryStars };
      const toUpload: Array<{
        user_id: string;
        station_id: string;
        task_id: string;
        tier: number;
        stars: number;
        completed_at: string;
      }> = [];

      // 1. Merge cloud rows into local with Math.max
      if (data && Array.isArray(data)) {
        for (const row of data as Array<{
          task_id: string;
          stars: number;
          station_id: string;
          tier: number;
        }>) {
          const localStars = localMap[row.task_id] || 0;
          const finalStars = Math.max(localStars, row.stars);
          localMap[row.task_id] = finalStars;

          // If local had higher stars, queue upload
          if (localStars > row.stars) {
            toUpload.push({
              user_id: userId,
              station_id: row.station_id || get().currentStationId || "tv",
              task_id: row.task_id,
              tier: row.tier || 0,
              stars: localStars,
              completed_at: new Date().toISOString(),
            });
          }
        }
      }

      // 2. Queue local stars not yet in cloud
      const cloudTaskIds = new Set(
        (data || []).map((r: { task_id: string }) => r.task_id)
      );
      for (const [taskId, stars] of Object.entries(localMap)) {
        if (!cloudTaskIds.has(taskId) && stars > 0) {
          toUpload.push({
            user_id: userId,
            station_id: get().currentStationId || "tv",
            task_id: taskId,
            tier: 0,
            stars,
            completed_at: new Date().toISOString(),
          });
        }
      }

      // Update local state and localStorage
      set({ taskMasteryStars: localMap });
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("iw_mastery_stars", JSON.stringify(localMap));
        }
      } catch {
        // Safe catch
      }

      // 3. Upsert queue to Supabase with onConflict
      if (toUpload.length > 0) {
        const { error: upsertErr } = await supabase
          .from("user_progress")
          .upsert(toUpload, { onConflict: "user_id,station_id,task_id" });

        if (upsertErr) {
          console.warn(
            "[Workbench] syncCloudProgress upsert warning:",
            upsertErr.message
          );
        }
      }
    } catch (err) {
      console.warn("[Workbench] syncCloudProgress exception:", err);
    }
  },

  currentStationId: "tv",
  setCurrentStationId: (id: string) =>
    set({
      currentStationId: id,
      bypassedTraceNodes: [],
      isTraceBroken: false,
      traceFaultReason: undefined,
    }),

  currentView: "HUB",
  setCurrentView: (view: "HUB" | "STATION") => set({ currentView: view }),
});
