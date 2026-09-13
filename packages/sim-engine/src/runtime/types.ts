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
  brightness?: number;
  isFuseBlown?: boolean;
  isDefective?: boolean;
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

export interface WorkedExample {
  /** Такт 1: Готовий еталонний код */
  sampleCode: {
    csharp: string;
    go: string;
  } | string;
  /** Такт 1: Лог у терміналі та реакція апаратного приладу */
  demonstrationLog: {
    terminal: string[];
    hardwareEffect: string;
  };
  /** Такт 1: Покрокове пояснення (1-2 речення, що сталося) */
  explanation: string;
  /** Такт 2: Трафарет з пропусками */
  clozeExercise: {
    csharp: string;
    go: string;
  } | string;
  /** Такт 3: Бойове завдання зі зміненою умовою без підказок */
  finalChallenge: {
    prompt: string;
    hint?: string;
    targetCode: {
      csharp: string;
      go: string;
    } | string;
  };
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
  workedExample?: WorkedExample;
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
  isBugfixTask?: boolean;
  initialBrokenCode?: {
    csharp: string;
    go: string;
  };
  defectDescription?: Record<"ua" | "en" | "da", string>;
  diagnosticLogs?: string[];
  validate: (
    before: VirtualTvState,
    after: VirtualTvState,
    result: RuntimeResult,
    code?: string
  ) => { passed: boolean; messageKey?: string };
}
