/**
 * @file packages/sim-engine/src/runtime/trace/traceEngine.ts
 * @description State machine and playback controller for multi-file Execution Flow Tracing.
 *              Implements Predict-Observe-Explain (POE) scaffolding, Time-Travel scrubbing,
 *              and Call Stack invariant tracking (Notional Machine).
 */

import type {
  ExecutionTraceTimeline,
  ExecutionTraceStep,
  TracePlayerState,
} from "./types";

export interface TraceEngineOptions {
  timeline: ExecutionTraceTimeline;
  enablePoe?: boolean;
  autoPlayIntervalMs?: number;
  onStepChange?: (step: ExecutionTraceStep, state: TracePlayerState) => void;
  onPoeRequired?: (step: ExecutionTraceStep) => void;
  onComplete?: () => void;
}

export class TracePlaybackController {
  private timeline: ExecutionTraceTimeline;
  private state: TracePlayerState;
  private enablePoe: boolean;
  private autoPlayIntervalMs: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private subscribers: Set<(state: TracePlayerState) => void> = new Set();
  private onStepChange?: (step: ExecutionTraceStep, state: TracePlayerState) => void;
  private onPoeRequired?: (step: ExecutionTraceStep) => void;
  private onComplete?: () => void;

  constructor(options: TraceEngineOptions) {
    this.timeline = options.timeline;
    this.enablePoe = options.enablePoe ?? true;
    this.autoPlayIntervalMs = options.autoPlayIntervalMs ?? 1800;
    this.onStepChange = options.onStepChange;
    this.onPoeRequired = options.onPoeRequired;
    this.onComplete = options.onComplete;

    this.state = {
      currentStepIndex: 0,
      isPlaying: false,
      playbackSpeed: 1,
      isWaitingForPoe: false,
      selectedPoeOptionId: null,
      poeResult: null,
      poeScore: {
        correct: 0,
        total: 0,
      },
      visitedStepIndices: new Set([0]),
    };

    // Check if step 0 has POE
    this.evaluateCurrentStepPoe();
  }

  public getTimeline(): ExecutionTraceTimeline {
    return this.timeline;
  }

  public setTimeline(timeline: ExecutionTraceTimeline): void {
    this.stopPlayback();
    this.timeline = timeline;
    this.reset();
  }

  public getState(): TracePlayerState {
    return {
      ...this.state,
      visitedStepIndices: new Set(this.state.visitedStepIndices),
    };
  }

  public getCurrentStep(): ExecutionTraceStep | undefined {
    return this.timeline.steps[this.state.currentStepIndex];
  }

  public subscribe(cb: (state: TracePlayerState) => void): () => void {
    this.subscribers.add(cb);
    cb(this.getState());
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private notify(): void {
    const frozenState = this.getState();
    this.subscribers.forEach((cb) => cb(frozenState));
    const currentStep = this.getCurrentStep();
    if (currentStep && this.onStepChange) {
      this.onStepChange(currentStep, frozenState);
    }
  }

  private evaluateCurrentStepPoe(): void {
    const step = this.getCurrentStep();
    if (this.enablePoe && step?.poeQuestion && !this.state.poeResult?.answered) {
      this.state.isWaitingForPoe = true;
      if (this.state.isPlaying) {
        this.stopPlayback();
      }
      this.onPoeRequired?.(step);
    } else {
      this.state.isWaitingForPoe = false;
    }
  }

  public stepForward(): boolean {
    if (this.state.isWaitingForPoe) {
      return false;
    }

    if (this.state.currentStepIndex >= this.timeline.steps.length - 1) {
      this.stopPlayback();
      this.onComplete?.();
      return false;
    }

    this.state.currentStepIndex += 1;
    this.state.visitedStepIndices.add(this.state.currentStepIndex);
    this.state.selectedPoeOptionId = null;
    this.state.poeResult = null;

    this.evaluateCurrentStepPoe();
    this.notify();
    return true;
  }

  public stepBackward(): boolean {
    if (this.state.currentStepIndex <= 0) {
      return false;
    }

    if (this.state.isPlaying) {
      this.stopPlayback();
    }

    this.state.currentStepIndex -= 1;
    this.state.isWaitingForPoe = false;
    this.state.selectedPoeOptionId = null;
    this.state.poeResult = null;

    this.notify();
    return true;
  }

  public seekTo(stepIndex: number): boolean {
    const boundedIndex = Math.max(0, Math.min(this.timeline.steps.length - 1, stepIndex));
    if (boundedIndex === this.state.currentStepIndex) return false;

    if (this.state.isPlaying) {
      this.stopPlayback();
    }

    this.state.currentStepIndex = boundedIndex;
    this.state.visitedStepIndices.add(boundedIndex);
    this.state.selectedPoeOptionId = null;
    this.state.poeResult = null;

    this.evaluateCurrentStepPoe();
    this.notify();
    return true;
  }

  public play(): void {
    if (this.state.isPlaying || this.state.isWaitingForPoe) return;
    if (this.state.currentStepIndex >= this.timeline.steps.length - 1) {
      // Loop or restart from 0
      this.state.currentStepIndex = 0;
    }

    this.state.isPlaying = true;
    this.startTimer();
    this.notify();
  }

  public pause(): void {
    if (!this.state.isPlaying) return;
    this.stopPlayback();
  }

  public togglePlay(): void {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setSpeed(speed: number): void {
    if (speed <= 0) return;
    this.state.playbackSpeed = speed;
    if (this.state.isPlaying) {
      this.stopPlayback();
      this.state.isPlaying = true;
      this.startTimer();
    }
    this.notify();
  }

  public setEnablePoe(enable: boolean): void {
    this.enablePoe = enable;
    if (!enable && this.state.isWaitingForPoe) {
      this.state.isWaitingForPoe = false;
      this.notify();
    } else if (enable) {
      this.evaluateCurrentStepPoe();
      this.notify();
    }
  }

  public answerPoe(optionId: string): { isCorrect: boolean; feedback: string } | null {
    const step = this.getCurrentStep();
    if (!step?.poeQuestion) return null;

    const chosen = step.poeQuestion.options.find((o) => o.id === optionId);
    if (!chosen) return null;

    const isCorrect = chosen.isCorrect;
    this.state.selectedPoeOptionId = optionId;
    this.state.poeResult = {
      answered: true,
      isCorrect,
      feedback: chosen.feedback,
    };

    this.state.poeScore = {
      correct: this.state.poeScore.correct + (isCorrect ? 1 : 0),
      total: this.state.poeScore.total + 1,
    };

    if (isCorrect) {
      this.state.isWaitingForPoe = false;
    }

    this.notify();
    return {
      isCorrect,
      feedback: typeof chosen.feedback === "string" ? chosen.feedback : chosen.feedback.ua || "",
    };
  }

  public reset(): void {
    this.stopPlayback();
    this.state = {
      currentStepIndex: 0,
      isPlaying: false,
      playbackSpeed: 1,
      isWaitingForPoe: false,
      selectedPoeOptionId: null,
      poeResult: null,
      poeScore: {
        correct: 0,
        total: 0,
      },
      visitedStepIndices: new Set([0]),
    };
    this.evaluateCurrentStepPoe();
    this.notify();
  }

  public dispose(): void {
    this.stopPlayback();
    this.subscribers.clear();
  }

  private startTimer(): void {
    if (this.timer) clearInterval(this.timer);
    const interval = Math.max(300, this.autoPlayIntervalMs / this.state.playbackSpeed);
    this.timer = setInterval(() => {
      const advanced = this.stepForward();
      if (!advanced) {
        this.stopPlayback();
      }
    }, interval);
  }

  private stopPlayback(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    const wasPlaying = this.state.isPlaying;
    this.state.isPlaying = false;
    if (wasPlaying) {
      this.notify();
    }
  }

  /**
   * Generates breadcrumbs up to the current step.
   * Prevents Transient Information Effect (Sweller) by maintaining historical anchor.
   */
  public getBreadcrumbHistory(): Array<{
    stepIndex: number;
    symbol: string;
    file: string;
    folder?: string;
    depth: number;
    isReturn: boolean;
    isException?: boolean;
  }> {
    const history: Array<{
      stepIndex: number;
      symbol: string;
      file: string;
      folder?: string;
      depth: number;
      isReturn: boolean;
      isException?: boolean;
    }> = [];

    for (let i = 0; i <= this.state.currentStepIndex; i++) {
      const step = this.timeline.steps[i];
      if (!step) continue;
      const isException = step.type === "exception";
      history.push({
        stepIndex: i,
        symbol: step.location.symbol,
        file: step.location.fileName,
        folder: step.location.folderName,
        depth: step.callStackDepth,
        isReturn: step.type === "return_unwind" || isException,
        isException,
      });
    }

    return history;
  }
}
