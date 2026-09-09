/**
 * @file apps/web/src/components/workbench/playground/InteractiveCodePlayground.tsx
 * @description Main interactive live coding playground integrating CodeMirror, Virtual TV runtime, and feedback
 */

import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CODING_TASKS,
  executeTvScript,
  type VirtualTvState,
  type RuntimeResult,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { PlaygroundTaskHeader } from "./PlaygroundTaskHeader";
import { PlaygroundEditor } from "./PlaygroundEditor";
import { PlaygroundConsole } from "./PlaygroundConsole";
import { Play, RotateCcw, ArrowRight } from "lucide-react";

export const InteractiveCodePlayground: React.FC = () => {
  const { t } = useTranslation();
  const { power, channel, volume, applyCodeExecution, addXp } = useWorkbenchStore();

  const [currentTaskId, setCurrentTaskId] = useState<string>("task-1-assignment");
  const [codeLang, setCodeLang] = useState<"csharp" | "go">("csharp");
  const [showHint, setShowHint] = useState(false);

  const currentTask = useMemo(
    () => CODING_TASKS.find((t) => t.id === currentTaskId) || CODING_TASKS[0],
    [currentTaskId]
  );

  // User code state per task and language
  const [userCodes, setUserCodes] = useState<Record<string, string>>({
    "task-1-assignment-csharp": CODING_TASKS[0].initialCode.csharp,
    "task-1-assignment-go": CODING_TASKS[0].initialCode.go,
    "task-2-branching-csharp": CODING_TASKS[1].initialCode.csharp,
    "task-2-branching-go": CODING_TASKS[1].initialCode.go,
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

  // ── Run Code Action ──────────────────────────────────────────
  const handleRunCode = useCallback(() => {
    const beforeState: VirtualTvState = {
      isOn: power,
      channel,
      volume,
    };

    // Execute script against Virtual TV interpreter
    const result = executeTvScript(currentCode, beforeState);
    setLastResult(result);

    if (result.success) {
      // Apply physical updates to TV in the Workbench store
      applyCodeExecution({
        power: result.newState.isOn,
        channel: result.newState.channel,
        volume: result.newState.volume,
        osdMessage: result.newState.osdMessage,
      });

      // Validate task objective
      const validation = currentTask.validate(beforeState, result.newState, result);
      setTaskPassed(validation.passed);
      if (validation.passed) {
        setFeedbackMessage(t(validation.messageKey || currentTask.successKey));
        addXp(10);
      } else {
        setFeedbackMessage(
          validation.messageKey ? t(validation.messageKey) : undefined
        );
      }
    } else {
      setTaskPassed(false);
      setFeedbackMessage(result.error);
    }
  }, [power, channel, volume, currentCode, applyCodeExecution, currentTask, t, addXp]);

  const handleNextTask = useCallback(() => {
    const nextTask = CODING_TASKS.find((t) => t.id !== currentTaskId);
    if (nextTask) {
      setCurrentTaskId(nextTask.id);
      setLastResult(null);
      setTaskPassed(null);
      setFeedbackMessage(undefined);
      setShowHint(false);
    }
  }, [currentTaskId]);

  return (
    <div className="space-y-3.5 select-none">
      {/* 1. Task Header & Goals */}
      <PlaygroundTaskHeader
        tasks={CODING_TASKS}
        currentTaskId={currentTaskId}
        onSelectTask={(id) => {
          setCurrentTaskId(id);
          setLastResult(null);
          setTaskPassed(null);
          setFeedbackMessage(undefined);
          setShowHint(false);
        }}
        showHint={showHint}
        onToggleHint={() => setShowHint((p) => !p)}
      />

      {/* 2. Language Bar & Action Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 bg-paper p-1 rounded-xl border border-paper-border">
          <button
            onClick={() => setCodeLang("csharp")}
            className={`px-3 py-1 text-xs font-display font-bold rounded-lg transition-all cursor-pointer ${
              codeLang === "csharp"
                ? "bg-paper-subtle text-accent-blue shadow-paper-sm border border-paper-border/60"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            C# (.NET)
          </button>
          <button
            onClick={() => setCodeLang("go")}
            className={`px-3 py-1 text-xs font-display font-bold rounded-lg transition-all cursor-pointer ${
              codeLang === "go"
                ? "bg-paper-subtle text-accent-blue shadow-paper-sm border border-paper-border/60"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Go (Функції)
          </button>
        </div>

        {/* Action Buttons: Run & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl border border-paper-border bg-paper hover:bg-paper-muted text-ink-muted hover:text-ink text-xs font-display font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title={t("playground.resetCodeBtn")}
          >
            <RotateCcw size={12} />
            <span>{t("playground.resetCodeBtn")}</span>
          </button>

          <button
            onClick={handleRunCode}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-display font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
          >
            <Play size={12} className="fill-white" />
            <span>{t("playground.runCodeBtn")}</span>
          </button>

          {taskPassed && currentTaskId === "task-1-assignment" && (
            <button
              onClick={handleNextTask}
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
      />
    </div>
  );
};
