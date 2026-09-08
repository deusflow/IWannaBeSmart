/**
 * @file packages/sim-engine/src/index.ts
 * @description Simulation engine exports, schemas, and level manifests
 */

export const SIM_ENGINE_NAME = "@iw/sim-engine";
export const SIM_ENGINE_VERSION = "0.1.0";

export * from "./types/level";
export * from "./data/tv-level-01";

// Legacy engine stub compatibility
export interface SimEngineState {
  isRunning: boolean;
  tickRateHz: number;
}

export const initialSimState: SimEngineState = {
  isRunning: false,
  tickRateHz: 60,
};

export class SimEngineStub {
  private state: SimEngineState = { ...initialSimState };

  public getState(): SimEngineState {
    return { ...this.state };
  }

  public start(): void {
    this.state.isRunning = true;
  }

  public stop(): void {
    this.state.isRunning = false;
  }
}
