/**
 * @file packages/sim-engine/src/index.ts
 * @description Simulation engine stub (Interactive Workbench, Block A, Item 5)
 */

export const SIM_ENGINE_NAME = "@iw/sim-engine";
export const SIM_ENGINE_VERSION = "0.0.1";

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
