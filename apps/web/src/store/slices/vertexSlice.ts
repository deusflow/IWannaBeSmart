/**
 * @file apps/web/src/store/slices/vertexSlice.ts
 * @description Station 06: Vertex AI Architect simulation slice
 */

import type { StateCreator } from "zustand";
import {
  type VirtualVertexState,
  type VertexCommandResult,
  type VertexHardwareType,
  type VertexEndpointConfig,
  type VertexIamConfig,
  type VertexAuthPolicy,
  type VertexMonitoringConfig,
  INITIAL_VERTEX_STATE,
  connectGcsBucket,
  setPreprocessingStep,
  runTraining,
  configureEndpoint,
  configureIam,
  checkMonitoring,
} from "@iw/sim-engine";
import { audioFx } from "../../utils/audioFx";
import type { WorkbenchStore, VertexSlice } from "../types";

export const createVertexSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  VertexSlice
> = (set, get) => ({
  vertexState: JSON.parse(JSON.stringify(INITIAL_VERTEX_STATE)),
  isVertexVictoryModalOpen: false,

  connectVertexGcsBucketAction: (bucketUri: string): VertexCommandResult => {
    audioFx.playKeyClick();
    const state = get().vertexState;
    const res = connectGcsBucket(state, bucketUri);
    if (res.success) {
      audioFx.playSuccessFanfare();
    } else {
      audioFx.playErrorBuzz();
    }
    set({ vertexState: res.newState });
    return res;
  },

  setVertexPreprocessingStepAction: (
    step: VirtualVertexState["preprocessingStep"]
  ): VertexCommandResult => {
    audioFx.playKeyClick();
    const state = get().vertexState;
    const res = setPreprocessingStep(state, step);
    if (res.success) {
      audioFx.playSuccessFanfare();
    } else {
      audioFx.playErrorBuzz();
    }
    set({ vertexState: res.newState });
    return res;
  },

  runVertexTrainingAction: (
    hardware: VertexHardwareType,
    batchSize: number,
    learningRate: number
  ): VertexCommandResult => {
    audioFx.playKeyClick();
    const state = get().vertexState;
    const res = runTraining(state, hardware, batchSize, learningRate);
    if (res.success) {
      audioFx.playSuccessFanfare();
    } else {
      audioFx.playErrorBuzz();
    }
    set({ vertexState: res.newState });
    return res;
  },

  configureVertexEndpointAction: (
    config: VertexEndpointConfig
  ): VertexCommandResult => {
    audioFx.playKeyClick();
    const state = get().vertexState;
    const res = configureEndpoint(state, config);
    if (res.success) {
      audioFx.playSuccessFanfare();
    } else {
      audioFx.playErrorBuzz();
    }
    set({ vertexState: res.newState });
    return res;
  },

  configureVertexIamAction: (
    iamConfig: VertexIamConfig,
    authPolicy: VertexAuthPolicy
  ): VertexCommandResult => {
    audioFx.playKeyClick();
    const state = get().vertexState;
    const res = configureIam(state, iamConfig, authPolicy);
    if (res.success) {
      audioFx.playSuccessFanfare();
    } else {
      audioFx.playErrorBuzz();
    }
    set({ vertexState: res.newState });
    return res;
  },

  checkVertexMonitoringAction: (
    monitoringConfig: VertexMonitoringConfig
  ): VertexCommandResult => {
    audioFx.playKeyClick();
    const state = get().vertexState;
    const res = checkMonitoring(state, monitoringConfig);
    if (res.success) {
      audioFx.playSuccessFanfare();
    } else {
      audioFx.playErrorBuzz();
    }
    set({ vertexState: res.newState });
    return res;
  },

  resetVertexState: (custom?: Partial<VirtualVertexState>) => {
    const nominal = JSON.parse(JSON.stringify(INITIAL_VERTEX_STATE));
    set({
      vertexState: custom ? { ...nominal, ...custom } : nominal,
    });
  },

  setVertexVictoryModalOpen: (open: boolean) => {
    set({ isVertexVictoryModalOpen: open });
  },
});
