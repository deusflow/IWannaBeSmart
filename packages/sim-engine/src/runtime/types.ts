/**
 * @file packages/sim-engine/src/runtime/types.ts
 * @description Type definitions for the Virtual TV interpreter runtime and coding curriculum
 */

export interface VirtualTvState {
  isOn: boolean;
  channel: number;
  volume: number;
  osdMessage?: string;
  isArchitectureWired?: boolean;
  label?: string;
  isSafeGuardActive?: boolean;
  activeInstanceName?: string;
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

export interface TransferVariant {
  prompt: Record<"ua" | "en" | "da", string>;
  hint: Record<"ua" | "en" | "da", string>;
  targetSnippetExample?: string;
  validate: (
    before: VirtualTvState,
    after: VirtualTvState,
    code: string
  ) => boolean;
}

export interface CodingTask {
  id: string;
  tier?: 0 | 1 | 2;
  order: number;
  titleKey: string;
  conceptKey: string;
  descKey: string;
  hintKey: string;
  successKey: string;
  simpleExplanationKey?: string;
  /** i18n key for engineering-precision explanation with English CS terms */
  engineeringKey?: string;
  careerImpactKey?: string;
  initialCode: {
    csharp: string;
    go: string;
  };
  targetCode: {
    csharp: string;
    go: string;
  };
  clozeTemplate: {
    csharp: string;
    go: string;
  };
  sprintTimeLimit?: number;
  transferVariant?: TransferVariant;
  validate: (
    before: VirtualTvState,
    after: VirtualTvState,
    result: RuntimeResult,
    code?: string
  ) => { passed: boolean; messageKey?: string };
}
