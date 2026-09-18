/**
 * @file apps/web/src/store/slices/fdeSlice.ts
 * @description Station 07: Field AI Deployer (Forward Deployed Engineer) simulation slice
 */

import type { StateCreator } from "zustand";
import {
  type FdeState,
  type DiscoveryResult,
  type IntegrationResult,
  type PipelineResult,
  type SecurityResult,
  type HandoffResult,
  INITIAL_FDE_STATE,
  makeDiscoveryChoice,
  connectLegacyApi,
  configureAuthToken,
  connectAgentNode,
  configureRag,
  toggleSecurityCheck,
  submitRunbook,
} from "@iw/sim-engine";
import { audioFx } from "../../utils/audioFx";
import type { WorkbenchStore, FdeSlice } from "../types";

export const createFdeSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  FdeSlice
> = (set, get) => ({
  fdeState: JSON.parse(JSON.stringify(INITIAL_FDE_STATE)),
  isFdeVictoryModalOpen: false,

  makeFdeDiscoveryChoiceAction: (
    choiceId: string,
    isCorrect: boolean,
    xpGain: number,
    consequenceKey: string
  ): DiscoveryResult => {
    audioFx.playKeyClick();
    const state = get().fdeState;
    const res = makeDiscoveryChoice(state, choiceId, isCorrect, xpGain, consequenceKey);
    if (isCorrect) {
      audioFx.playSuccessFanfare();
    } else {
      audioFx.playErrorBuzz();
    }
    set({ fdeState: res.newState });
    return res;
  },

  connectFdeLegacyApiAction: (endpointUrl: string): IntegrationResult => {
    audioFx.playKeyClick();
    const state = get().fdeState;
    const res = connectLegacyApi(state, endpointUrl);
    if (res.success) {
      audioFx.playSuccessFanfare();
    } else {
      audioFx.playErrorBuzz();
    }
    set({ fdeState: res.newState });
    return res;
  },

  configureFdeAuthTokenAction: (token: string): IntegrationResult => {
    audioFx.playKeyClick();
    const state = get().fdeState;
    const res = configureAuthToken(state, token);
    if (res.success) {
      audioFx.playSuccessFanfare();
    } else {
      audioFx.playErrorBuzz();
    }
    set({ fdeState: res.newState });
    return res;
  },

  connectFdeAgentNodeAction: (nodeId: string): PipelineResult => {
    audioFx.playKeyClick();
    const state = get().fdeState;
    const res = connectAgentNode(state, nodeId);
    if (res.success) {
      audioFx.playSuccessFanfare();
    } else {
      audioFx.playErrorBuzz();
    }
    set({ fdeState: res.newState });
    return res;
  },

  configureFdeRagAction: (
    chunkSize: number,
    vectorDbUrl: string
  ): PipelineResult => {
    audioFx.playKeyClick();
    const state = get().fdeState;
    const res = configureRag(state, chunkSize, vectorDbUrl);
    if (res.success) {
      audioFx.playSuccessFanfare();
    } else {
      audioFx.playErrorBuzz();
    }
    set({ fdeState: res.newState });
    return res;
  },

  toggleFdeSecurityCheckAction: (checkId: string): SecurityResult => {
    audioFx.playKeyClick();
    const state = get().fdeState;
    const res = toggleSecurityCheck(state, checkId);
    if (res.posture !== "critical") {
      audioFx.playSuccessFanfare();
    }
    set({ fdeState: res.newState });
    return res;
  },

  submitFdeRunbookAction: (markdownContent: string): HandoffResult => {
    audioFx.playKeyClick();
    const state = get().fdeState;
    const res = submitRunbook(state, markdownContent);
    if (res.success) {
      audioFx.playSuccessFanfare();
    } else {
      audioFx.playErrorBuzz();
    }
    set({ fdeState: res.newState });
    return res;
  },

  resetFdeState: (custom?: Partial<FdeState>) => {
    const nominal = JSON.parse(JSON.stringify(INITIAL_FDE_STATE));
    set({
      fdeState: custom ? { ...nominal, ...custom } : nominal,
    });
  },

  setFdeVictoryModalOpen: (open: boolean) => {
    set({ isFdeVictoryModalOpen: open });
  },
});
