/**
 * @file packages/sim-engine/src/runtime/types.ts
 * @description Type definitions for the Virtual TV interpreter runtime and coding curriculum
 */

export interface VirtualTvState {
  isOn: boolean;
  channel: number;
  volume: number;
  osdMessage?: string;
}

export type RuntimeLogType = "info" | "mutation" | "error" | "success";

export interface RuntimeLogEntry {
  type: RuntimeLogType;
  message: string;
}

export interface RuntimeResult {
  success: boolean;
  newState: VirtualTvState;
  mutationsCount: number;
  logs: RuntimeLogEntry[];
  error?: string;
  mentorFeedback?: string;
}

export interface CodingTask {
  id: string;
  order: number;
  titleKey: string;
  conceptKey: string;
  descKey: string;
  hintKey: string;
  successKey: string;
  initialCode: {
    csharp: string;
    go: string;
  };
  validate: (
    before: VirtualTvState,
    after: VirtualTvState,
    result: RuntimeResult,
    code?: string
  ) => { passed: boolean; messageKey?: string };
}
