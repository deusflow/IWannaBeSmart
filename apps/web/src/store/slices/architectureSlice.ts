/**
 * @file apps/web/src/store/slices/architectureSlice.ts
 * @description Architecture canvas graph, trace chains, and counterfactual bypasses
 */

import type { StateCreator } from "zustand";
import type {
  WorkbenchStore,
  ArchitectureSlice,
} from "../types";

export const createArchitectureSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  ArchitectureSlice
> = (set, get) => ({
  isArchitecturePowerWired: false,
  setArchitecturePowerWired: (wired: boolean) => set({ isArchitecturePowerWired: wired }),

  archNodes: [],
  archEdges: [],
  setArchNodes: (nodes) => set({ archNodes: nodes }),
  setArchEdges: (edges) => set({ archEdges: edges }),

  selectedTraceEntityId: "IRemoteCommand",
  setSelectedTraceEntityId: (id: string) =>
    set({
      selectedTraceEntityId: id,
      bypassedTraceNodes: [],
      isTraceBroken: false,
      traceFaultReason: undefined,
    }),
  bypassedTraceNodes: [],
  toggleTraceBypass: (nodeId: string) => {
    const current = get().bypassedTraceNodes;
    const next = current.includes(nodeId)
      ? current.filter((id) => id !== nodeId)
      : [...current, nodeId];
    const isBroken = next.length > 0;
    set({
      bypassedTraceNodes: next,
      isTraceBroken: isBroken,
    });
  },
  resetBypasses: () =>
    set({
      bypassedTraceNodes: [],
      isTraceBroken: false,
      traceFaultReason: undefined,
    }),
  isTraceBroken: false,
  setIsTraceBroken: (broken: boolean) => set({ isTraceBroken: broken }),
  traceFaultReason: undefined,
  setTraceFaultReason: (reason?: string) => set({ traceFaultReason: reason }),

  resetLevelForPractice: () => {
    const currentEdges = get().archEdges;
    const nonPowerEdges = currentEdges.filter(
      (e) => !(e.source === "node-power-cmd" || e.target === "node-tv-controller")
    );
    set({
      archEdges: nonPowerEdges,
      isArchitecturePowerWired: false,
      mentorPhase: "PRACTICE",
      isHintActive: false,
    });
  },

  completeLevel: () => {
    if (get().mentorPhase !== "COMPLETED") {
      set((s) => ({
        mentorPhase: "COMPLETED",
        xp: s.xp + 50,
        isArchitecturePowerWired: true,
      }));
    }
  },
});
