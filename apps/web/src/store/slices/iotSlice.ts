/**
 * @file apps/web/src/store/slices/iotSlice.ts
 * @description Station 03: IoT Garage Gate & EventBus simulation slice
 */

import type { StateCreator } from "zustand";
import {
  type VirtualIotState,
  INITIAL_IOT_STATE,
  VirtualGarageGate,
} from "@iw/sim-engine";
import { audioFx } from "../../utils/audioFx";
import type { WorkbenchStore, IotSlice } from "../types";

export const createIotSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  IotSlice
> = (set, get) => ({
  isIotVictoryModalOpen: false,
  setIotVictoryModalOpen: (open: boolean) => set({ isIotVictoryModalOpen: open }),

  iotState: JSON.parse(JSON.stringify(INITIAL_IOT_STATE)),

  triggerIotRemote: () => {
    audioFx.playRelayClick();
    const gate = new VirtualGarageGate(get().iotState);
    gate.triggerRemote();
    set({ iotState: gate.getSnapshot() });
  },

  triggerIotObstacle: (detected: boolean) => {
    if (detected) {
      audioFx.playErrorBuzz();
    } else {
      audioFx.playKeyClick();
    }
    const gate = new VirtualGarageGate(get().iotState);
    gate.triggerObstacle(detected);
    set({ iotState: gate.getSnapshot() });
  },

  setIotPosition: (percent: number) => {
    const gate = new VirtualGarageGate(get().iotState);
    gate.setPosition(percent);
    set({ iotState: gate.getSnapshot() });
  },

  resetIotState: () => {
    audioFx.playRelayClick();
    set({ iotState: JSON.parse(JSON.stringify(INITIAL_IOT_STATE)) });
  },

  applyIotExecution: (updates: Partial<VirtualIotState>) => {
    set((s) => ({
      iotState: {
        ...s.iotState,
        ...updates,
      },
    }));
  },
});
