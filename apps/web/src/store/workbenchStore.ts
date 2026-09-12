/**
 * @file apps/web/src/store/workbenchStore.ts
 * @description Central Workbench Zustand Store Root Composer
 * Decomposed into modular slices:
 * - tvSlice: Virtual TV state, power, channels, volume, OSD
 * - connectionsSlice: Hardware test point connections (VCC, GND, IR_DATA, DISPLAY_BUS)
 * - circuitSlice: Circuit board hardware edge fault injection
 * - architectureSlice: Architecture canvas graph, trace chains, bypasses
 * - mentorSlice: Guided steps, XP, Code Gym mastery stars, syncCloudProgress (with onConflict: 'user_id,station_id,task_id', payload.best_wpm = bestWpm)
 * - posSlice: Fintech POS terminal state and keypad
 * - calculatorSlice: Embedded calculator state
 * - irPipeline: Physical IR packet transmission and remote button dispatchers
 */

import { create } from "zustand";
import type { WorkbenchStore } from "./types";
import { createTvSlice } from "./slices/tvSlice";
import {
  createConnectionsSlice,
  createInitialConnections,
} from "./slices/connectionsSlice";
import {
  createCircuitSlice,
  createInitialCircuitEdges,
} from "./slices/circuitSlice";
import { createArchitectureSlice } from "./slices/architectureSlice";
import { createMentorSlice } from "./slices/mentorSlice";
import { createPosSlice } from "./slices/posSlice";
import { createCalculatorSlice } from "./slices/calculatorSlice";
import { createIrPipelineSlice } from "./slices/irPipeline";

export const useWorkbenchStore = create<WorkbenchStore>((...a) => ({
  ...createTvSlice(...a),
  ...createConnectionsSlice(...a),
  ...createCircuitSlice(...a),
  ...createArchitectureSlice(...a),
  ...createMentorSlice(...a),
  ...createPosSlice(...a),
  ...createCalculatorSlice(...a),
  ...createIrPipelineSlice(...a),
}));

export * from "./types";
export { createInitialConnections, createInitialCircuitEdges };
