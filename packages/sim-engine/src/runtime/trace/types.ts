/**
 * @file packages/sim-engine/src/runtime/trace/types.ts
 * @description Type definitions for the Execution Flow Visualizer engine.
 *              Grounded in Notional Machine research (Sorva, du Boulay),
 *              Cognitive Load Theory (Sweller), and Predict-Observe-Explain (White & Gunstone).
 */

import type { LocalizedText } from "../types";

export type TraceEventType =
  | "folder_enter"
  | "file_focus"
  | "function_call"
  | "branch_eval"
  | "return_unwind"
  | "exception";

export interface TraceStepLocation {
  folderId: string;
  folderName: string;
  fileId: string;
  fileName: string;
  lineStart: number;
  lineEnd: number;
  symbol: string;
  codeSnippet?: string;
}

export interface PoeOption {
  id: string;
  targetFileId?: string;
  targetFolderId?: string;
  label: LocalizedText;
  isCorrect: boolean;
  feedback: LocalizedText;
}

export interface PoeQuestion {
  id: string;
  prompt: LocalizedText;
  options: PoeOption[];
  pedagogicalRationale: LocalizedText;
}

export interface ExecutionTraceReturnValue {
  type: string;
  value: string;
  summary: LocalizedText;
  terminationReason: LocalizedText;
}

export interface ExecutionTraceStep {
  stepIndex: number;
  type: TraceEventType;
  location: TraceStepLocation;
  targetLocation?: TraceStepLocation;
  callStackDepth: number;
  callStack: string[];
  scopeVariables?: Record<string, string | number | boolean>;
  returnValue?: ExecutionTraceReturnValue;
  explanation: LocalizedText;
  poeQuestion?: PoeQuestion;
}

export interface ExecutionTraceTimeline {
  id: string;
  stationId: string;
  title: LocalizedText;
  description: LocalizedText;
  language: "csharp" | "go" | "python" | "typescript";
  totalSteps: number;
  steps: ExecutionTraceStep[];
}

export interface TracePlayerState {
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.5x, 1x, 2x
  isWaitingForPoe: boolean;
  selectedPoeOptionId: string | null;
  poeResult: {
    answered: boolean;
    isCorrect: boolean;
    feedback: LocalizedText;
  } | null;
  poeScore: {
    correct: number;
    total: number;
  };
  visitedStepIndices: Set<number>;
}
