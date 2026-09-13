/**
 * @file apps/web/src/store/slices/banditSlice.ts
 * @description Station 06: Cyber Bandit Lab simulation slice (UNIX Wargame CLI, Packet Sniffer, Tampering, SQL Injection, Rate Limiting)
 */

import type { StateCreator } from "zustand";
import {
  type DefenseStatus,
  type SqlInjectionResult,
  type RateLimitResult,
  createInitialBanditState,
  executeBanditCommand,
  tamperTransitPacket,
  forwardTransitPacket,
  dropTransitPacket,
  executeSqlAuthQuery,
  simulateRateLimitRequest,
  toggleBanditDefense,
} from "@iw/sim-engine";
import { audioFx } from "../../utils/audioFx";
import type { WorkbenchStore, BanditSlice } from "../types";

export const createBanditSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  BanditSlice
> = (set, get) => ({
  banditState: createInitialBanditState(1),
  banditCliInput: "",
  isBanditVictoryModalOpen: false,
  sqlQueryInput: "' OR 1=1 --",
  sqlQueryResult: null,
  rateLimitStatus: null,

  setBanditCliInput: (cmd: string) => {
    set({ banditCliInput: cmd });
  },

  runBanditCommand: (rawCmd: string) => {
    audioFx.playKeyClick();
    const state = get().banditState;
    const res = executeBanditCommand(state, rawCmd);

    if (res.flagCaptured) {
      audioFx.playSuccessFanfare();
    }

    set({
      banditState: res.newState,
      banditCliInput: "",
    });

    return { output: res.output, flagCaptured: res.flagCaptured };
  },

  submitFlagDirect: (flag: string): boolean => {
    audioFx.playKeyClick();
    const state = get().banditState;
    const res = executeBanditCommand(state, `submit-flag ${flag}`);

    if (res.flagCaptured) {
      audioFx.playSuccessFanfare();
      set({ banditState: res.newState });
      return true;
    } else {
      audioFx.playErrorBuzz();
      set({ banditState: res.newState });
      return false;
    }
  },

  setTamperJson: (json: string) => {
    const state = get().banditState;
    const nextState = tamperTransitPacket(state, json);
    set({ banditState: nextState });
  },

  forwardTransitPacketAction: () => {
    audioFx.playKeyClick();
    const state = get().banditState;
    const { newState, responseStatus, message } = forwardTransitPacket(state);

    if (responseStatus === 403) {
      audioFx.playErrorBuzz();
    } else if (responseStatus === 200 && state.transitPacket?.isTampered) {
      audioFx.playSuccessFanfare();
    }

    set({ banditState: newState });
    return { responseStatus, message };
  },

  dropTransitPacketAction: () => {
    audioFx.playKeyClick();
    const state = get().banditState;
    const nextState = dropTransitPacket(state);
    set({ banditState: nextState });
  },

  toggleBanditDefenseAction: (key: keyof DefenseStatus) => {
    audioFx.playKeyClick();
    const state = get().banditState;
    const nextState = toggleBanditDefense(state, key);
    set({ banditState: nextState });
  },

  setSqlQueryInput: (input: string) => {
    set({ sqlQueryInput: input });
  },

  runSqlQueryAction: (input: string): SqlInjectionResult => {
    audioFx.playKeyClick();
    const state = get().banditState;
    const result = executeSqlAuthQuery(state, input);

    if (result.vulnerabilityExploited) {
      audioFx.playSuccessFanfare();
    } else if (!result.success) {
      audioFx.playErrorBuzz();
    }

    set({ sqlQueryResult: result });
    return result;
  },

  simulateRateLimitAction: (): RateLimitResult => {
    audioFx.playKeyClick();
    const state = get().banditState;
    const { newState, result } = simulateRateLimitRequest(state);

    if (result.statusCode === 429) {
      audioFx.playErrorBuzz();
    }

    set({
      banditState: newState,
      rateLimitStatus: result,
    });

    return result;
  },

  resetBanditStationToLevel: (level: number) => {
    const validLevel = Math.max(1, Math.min(6, level));
    const newState = createInitialBanditState(validLevel);
    set({
      banditState: newState,
      banditCliInput: "",
      sqlQueryResult: null,
      rateLimitStatus: null,
    });
  },

  setBanditVictoryModalOpen: (open: boolean) => {
    if (open) audioFx.playSuccessFanfare();
    set({ isBanditVictoryModalOpen: open });
  },
});
