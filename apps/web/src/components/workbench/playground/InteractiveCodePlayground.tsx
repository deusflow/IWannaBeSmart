/**
 * @file apps/web/src/components/workbench/playground/InteractiveCodePlayground.tsx
 * @description Main interactive live coding playground integrating CodeMirror, Virtual TV runtime, and feedback
 */

import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CODING_TASKS,
  executeTvScriptAsync,
  type VirtualTvState,
  type RuntimeResult,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { PlaygroundTaskHeader } from "./PlaygroundTaskHeader";
import { PlaygroundEditor } from "./PlaygroundEditor";
import { PlaygroundConsole } from "./PlaygroundConsole";
import { Play, RotateCcw, ArrowRight, Loader2 } from "lucide-react";

export const InteractiveCodePlayground: React.FC = () => {
  const { t } = useTranslation();
  const { power, channel, volume, applyCodeExecution, addXp } = useWorkbenchStore();

  const [currentTaskId, setCurrentTaskId] = useState<string>("task-1-assignment");
  const [codeLang, setCodeLang] = useState<"csharp" | "go">("csharp");
  const [showHint, setShowHint] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showXpAward, setShowXpAward] = useState(false);

  const currentTask = useMemo(
    () => CODING_TASKS.find((t) => t.id === currentTaskId) || CODING_TASKS[0],
    [currentTaskId]
  );

  // User code state per task and language dynamically populated from curriculum
  const [userCodes, setUserCodes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const task of CODING_TASKS) {
      initial[`${task.id}-csharp`] = task.initialCode.csharp;
      initial[`${task.id}-go`] = task.initialCode.go;
    }
    return initial;
  });

  const codeKey = `${currentTaskId}-${codeLang}`;
  const currentCode = userCodes[codeKey] ?? currentTask.initialCode[codeLang];

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setUserCodes((prev) => ({ ...prev, [codeKey]: newCode }));
    },
    [codeKey]
  );

  const handleReset = useCallback(() => {
    setUserCodes((prev) => ({
      ...prev,
      [codeKey]: currentTask.initialCode[codeLang],
    }));
    setLastResult(null);
    setTaskPassed(null);
    setFeedbackMessage(undefined);
  }, [codeKey, currentTask, codeLang]);

  // Execution & Diagnostics state
  const [lastResult, setLastResult] = useState<RuntimeResult | null>(null);
  const [taskPassed, setTaskPassed] = useState<boolean | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | undefined>(undefined);

  const currentTvState: VirtualTvState = useMemo(
    () => ({
      isOn: power,
      channel,
      volume,
    }),
    [power, channel, volume]
  );

  const handleSelectTask = useCallback(
    (taskId: string) => {
      setCurrentTaskId(taskId);
      setLastResult(null);
      setTaskPassed(null);
      setFeedbackMessage(undefined);
      setShowHint(false);

      // Educational setup: If selecting boundary guard and channel is in range, preset to 5
      if (taskId === "task-boundary-guard" && channel <= 4) {
        applyCodeExecution({ channel: 5 });
      }
      // If selecting Mute function and volume is already 0, preset to 50
      if (taskId === "task-function-encapsulation" && volume === 0) {
        applyCodeExecution({ volume: 50 });
      }
    },
    [channel, volume, applyCodeExecution]
  );

  // ── Run Code Action (Non-blocking async with live intermediate updates) ───
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);

    const beforeState: VirtualTvState = {
      isOn: power,
      channel,
      volume,
    };

    try {
      // Execute script with non-blocking async pauses (300ms) and intermediate TV mutations
      const result = await executeTvScriptAsync(
        currentCode,
        beforeState,
        (snapshot) => {
          applyCodeExecution({
            power: snapshot.isOn,
            channel: snapshot.channel,
            volume: snapshot.volume,
            osdMessage: snapshot.osdMessage,
          });
        },
        300
      );

      setLastResult(result);

      if (result.success) {
        // Ensure final physical state is synchronized
        applyCodeExecution({
          power: result.newState.isOn,
          channel: result.newState.channel,
          volume: result.newState.volume,
          osdMessage: result.newState.osdMessage,
        });

        // Validate task objective against final state and code
        const validation = currentTask.validate(
          beforeState,
          result.newState,
          result,
          currentCode
        );
        setTaskPassed(validation.passed);
        if (validation.passed) {
          setFeedbackMessage(t(validation.messageKey || currentTask.successKey));
          addXp(25);
          setShowXpAward(true);
          setTimeout(() => setShowXpAward(false), 2400);
        } else {
          setFeedbackMessage(
            validation.messageKey ? t(validation.messageKey) : undefined
          );
        }
      } else {
        setTaskPassed(false);
        setFeedbackMessage(result.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTaskPassed(false);
      setFeedbackMessage(msg);
    } finally {
      setIsRunning(false);
    }
  }, [
    isRunning,
    power,
    channel,
    volume,
    currentCode,
    applyCodeExecution,
    currentTask,
    t,
    addXp,
  ]);

  const handleNextTask = useCallback(() => {
    const currentIndex = CODING_TASKS.findIndex((t) => t.id === currentTaskId);
    if (currentIndex >= 0 && currentIndex < CODING_TASKS.length - 1) {
      const nextTask = CODING_TASKS[currentIndex + 1];
      handleSelectTask(nextTask.id);
    }
  }, [currentTaskId, handleSelectTask]);

  const isLastTask = currentTaskId === CODING_TASKS[CODING_TASKS.length - 1].id;

  return (
    <div className="space-y-4 select-none">
      {/* 1. Task Header & Goals */}
      <PlaygroundTaskHeader
        tasks={CODING_TASKS}
        currentTaskId={currentTaskId}
        onSelectTask={handleSelectTask}
        showHint={showHint}
        onToggleHint={() => setShowHint((p) => !p)}
      />

      {/* 2. Language Bar & Action Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 bg-paper p-1 rounded-xl border border-paper-border">
          <button
            onClick={() => setCodeLang("csharp")}
            disabled={isRunning}
            className={`px-3 py-1 text-xs font-display font-bold rounded-lg transition-all cursor-pointer ${
              codeLang === "csharp"
                ? "bg-paper-subtle text-accent-blue shadow-paper-sm border border-paper-border/60"
                : "text-ink-muted hover:text-ink"
            } ${isRunning ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            C# (.NET)
          </button>
          <button
            onClick={() => setCodeLang("go")}
            disabled={isRunning}
            className={`px-3 py-1 text-xs font-display font-bold rounded-lg transition-all cursor-pointer ${
              codeLang === "go"
                ? "bg-paper-subtle text-accent-blue shadow-paper-sm border border-paper-border/60"
                : "text-ink-muted hover:text-ink"
            } ${isRunning ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            Go (Функції)
          </button>
        </div>

        {/* Action Buttons: Run & Reset & Next */}
        <div className="flex items-center gap-2 relative">
          {/* Floating XP Award Animation Badge */}
          {showXpAward && (
            <div className="absolute -top-7 right-14 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-balsamiq font-extrabold text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1 animate-bounce z-30 pointer-events-none">
              <span>{t("playground.xpAwardedBadge", "+25 XP")}</span>
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-xl border border-paper-border bg-paper hover:bg-paper-muted text-ink-muted hover:text-ink text-xs font-display font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              isRunning ? "opacity-60 cursor-not-allowed" : ""
            }`}
            title={t("playground.resetCodeBtn")}
          >
            <RotateCcw size={12} />
            <span>{t("playground.resetCodeBtn")}</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-display font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition-all cursor-pointer ${
              isRunning ? "opacity-80 cursor-wait animate-pulse" : ""
            }`}
          >
            {isRunning ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} className="fill-white" />
            )}
            <span>
              {isRunning ? t("playground.runningCode") : t("playground.runCodeBtn")}
            </span>
          </button>

          {taskPassed && !isLastTask && (
            <button
              onClick={handleNextTask}
              disabled={isRunning}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-display font-bold flex items-center gap-1 shadow-md shadow-purple-900/20 transition-all cursor-pointer animate-fadeIn"
            >
              <span>{t("playground.nextTaskBtn")}</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 3. JetBrains CodeMirror Editor */}
      <PlaygroundEditor
        code={currentCode}
        onChange={handleCodeChange}
        language={codeLang}
      />

      {/* 4. Live Output Console */}
      <PlaygroundConsole
        result={lastResult}
        taskPassed={taskPassed}
        feedbackMessage={feedbackMessage}
        currentTvState={currentTvState}
        currentTask={currentTask}
      />
    </div>
  );
};
