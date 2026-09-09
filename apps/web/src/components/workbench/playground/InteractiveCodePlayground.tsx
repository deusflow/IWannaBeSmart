/**
 * @file apps/web/src/components/workbench/playground/InteractiveCodePlayground.tsx
 * @description Main interactive live coding playground integrating CodeMirror, Virtual TV runtime, and Faded Scaffolding
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
import { audioFx } from "../../../utils/audioFx";
import { PlaygroundTaskHeader } from "./PlaygroundTaskHeader";
import { PlaygroundEditor } from "./PlaygroundEditor";
import { PlaygroundConsole } from "./PlaygroundConsole";
import { Play, RotateCcw, ArrowRight, Loader2, Sparkles, Eye, Edit3 } from "lucide-react";

export const InteractiveCodePlayground: React.FC = () => {
  const { t } = useTranslation();
  const {
    power,
    channel,
    volume,
    isArchitecturePowerWired,
    applyCodeExecution,
    completeCodingTask,
    isCodingTaskCompleted,
  } = useWorkbenchStore();

  const [currentTaskId, setCurrentTaskId] = useState<string>("task-1-assignment");
  const [codeLang, setCodeLang] = useState<"csharp" | "go">("csharp");
  const [taskPhase, setTaskPhase] = useState<"demo" | "practice">("demo");
  const [showHint, setShowHint] = useState(false);
  const [showGhost, setShowGhost] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showXpAward, setShowXpAward] = useState(false);

  const currentTask = useMemo(
    () => CODING_TASKS.find((t) => t.id === currentTaskId) || CODING_TASKS[0],
    [currentTaskId]
  );

  // Demo code state (populated from curriculum reference code)
  const [demoCodes, setDemoCodes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const task of CODING_TASKS) {
      initial[`${task.id}-csharp`] = task.initialCode.csharp;
      initial[`${task.id}-go`] = task.initialCode.go;
    }
    return initial;
  });

  // Self Practice code state (independent scratchpad per task and language)
  const [practiceCodes, setPracticeCodes] = useState<Record<string, string>>({});

  const codeKey = `${currentTaskId}-${codeLang}`;
  const defaultPracticeComment = `${t("playground.practicePlaceholderComment", "// Напишіть код самостійно...")}\n`;

  const currentCode =
    taskPhase === "demo"
      ? demoCodes[codeKey] ?? currentTask.initialCode[codeLang]
      : practiceCodes[codeKey] ?? defaultPracticeComment;

  const handleCodeChange = useCallback(
    (newCode: string) => {
      if (taskPhase === "demo") {
        setDemoCodes((prev) => ({ ...prev, [codeKey]: newCode }));
      } else {
        setPracticeCodes((prev) => ({ ...prev, [codeKey]: newCode }));
      }
    },
    [codeKey, taskPhase]
  );

  const handleReset = useCallback(() => {
    if (taskPhase === "demo") {
      setDemoCodes((prev) => ({
        ...prev,
        [codeKey]: currentTask.initialCode[codeLang],
      }));
    } else {
      setPracticeCodes((prev) => ({
        ...prev,
        [codeKey]: defaultPracticeComment,
      }));
    }
    setLastResult(null);
    setTaskPassed(null);
    setFeedbackMessage(undefined);
  }, [codeKey, currentTask, codeLang, taskPhase, defaultPracticeComment]);

  // 3-second ghost text overlay trigger
  const triggerGhost = useCallback(() => {
    setShowGhost(true);
    const timer = setTimeout(() => setShowGhost(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Execution & Diagnostics state
  const [lastResult, setLastResult] = useState<RuntimeResult | null>(null);
  const [taskPassed, setTaskPassed] = useState<boolean | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | undefined>(undefined);

  const currentTvState: VirtualTvState = useMemo(
    () => ({
      isOn: power,
      channel,
      volume,
      isArchitectureWired: isArchitecturePowerWired,
    }),
    [power, channel, volume, isArchitecturePowerWired]
  );

  const handleSelectTask = useCallback(
    (taskId: string) => {
      setCurrentTaskId(taskId);
      setTaskPhase("demo");
      setLastResult(null);
      setTaskPassed(null);
      setFeedbackMessage(undefined);
      setShowHint(false);
      setShowGhost(false);

      // Educational presets for edge conditions
      if (taskId === "task-boundary-guard" && channel <= 4) {
        applyCodeExecution({ channel: 5 });
      }
      if (taskId === "task-function-encapsulation" && volume === 0) {
        applyCodeExecution({ volume: 50 });
      }
    },
    [channel, volume, applyCodeExecution]
  );

  // ── Run Code Action (Non-blocking async with physical TV reaction) ───
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);

    const beforeState: VirtualTvState = {
      isOn: power,
      channel,
      volume,
    };

    try {
      // Execute script with 300ms step-by-step pauses and TV mutations
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
        // Synchronize physical TV state
        applyCodeExecution({
          power: result.newState.isOn,
          channel: result.newState.channel,
          volume: result.newState.volume,
          osdMessage: result.newState.osdMessage,
        });

        if (taskPhase === "demo") {
          // Guided Demo Mode: TV reacts without pass/fail grading or XP award
          setTaskPassed(null);
          setFeedbackMessage(t("playground.demoRunSuccess"));
        } else {
          // Self Practice Mode: Strict validation against task objective
          const validation = currentTask.validate(
            beforeState,
            result.newState,
            result,
            currentCode
          );

          if (validation.passed) {
            audioFx.playSuccessFanfare();
            setTaskPassed(true);
            const isNewlyCompleted = completeCodingTask(currentTaskId);
            if (isNewlyCompleted) {
              setShowXpAward(true);
              setTimeout(() => setShowXpAward(false), 2600);
            }
            setFeedbackMessage(
              t(
                validation.messageKey || currentTask.successKey,
                t("playground.practiceSuccessMsg")
              )
            );
          } else {
            audioFx.playErrorBuzz();
            setTaskPassed(false);
            setFeedbackMessage(
              validation.messageKey
                ? t(validation.messageKey)
                : result.error || t("playground.errorSyntax")
            );
          }
        }
      } else {
        audioFx.playErrorBuzz();
        setTaskPassed(false);
        setFeedbackMessage(result.error || t("playground.errorSyntax"));
      }
    } catch (err: unknown) {
      audioFx.playErrorBuzz();
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
    taskPhase,
    currentTask,
    currentTaskId,
    completeCodingTask,
    t,
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
    <div className="space-y-3.5 select-none">
      {/* 1. Task Header & Goals (with Checkmarks for completed practice tasks) */}
      <PlaygroundTaskHeader
        tasks={CODING_TASKS}
        currentTaskId={currentTaskId}
        onSelectTask={handleSelectTask}
        showHint={showHint}
        onToggleHint={() => {
          if (taskPhase === "practice") {
            triggerGhost();
          } else {
            setShowHint((p) => !p);
          }
        }}
        isTaskCompleted={isCodingTaskCompleted}
      />

      {/* 2. Educational Two-Phase Banner (Guided Demo <-> Self Practice) */}
      <div
        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 shadow-paper-xs ${
          taskPhase === "demo"
            ? "bg-[#EBE5D8] border-[#1A1D20]/20 text-[#1A1D20]"
            : "bg-emerald-500/10 border-emerald-600/30 text-[#1A1D20]"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase shrink-0 flex items-center gap-1 ${
              taskPhase === "demo"
                ? "bg-[#1A1D20] text-white"
                : "bg-emerald-700 text-white"
            }`}
          >
            {taskPhase === "demo" ? (
              <>
                <Eye size={10} />
                <span>{t("playground.phaseDemoTitle")}</span>
              </>
            ) : (
              <>
                <Edit3 size={10} />
                <span>{t("playground.phasePracticeTitle")}</span>
              </>
            )}
          </span>
          <span className="font-balsamiq text-xs font-medium truncate">
            {taskPhase === "demo"
              ? t("playground.demoExplainer")
              : t("playground.practiceExplainer")}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {taskPhase === "demo" ? (
            <button
              onClick={() => {
                setTaskPhase("practice");
                setLastResult(null);
                setTaskPassed(null);
                setFeedbackMessage(undefined);
              }}
              className="px-3 py-1 rounded-lg bg-[#1A1D20] hover:bg-black active:scale-95 text-white font-display font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>{t("playground.switchToPracticeBtn")}</span>
            </button>
          ) : (
            <>
              <button
                onClick={triggerGhost}
                disabled={showGhost}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                  showGhost
                    ? "bg-amber-400/20 text-amber-800 border-amber-500/40"
                    : "bg-paper hover:bg-paper-muted text-[#1A1D20] border-[#1A1D20]/25"
                }`}
                title="Короткочасно показати напівпрозорий привид коду"
              >
                <span>{t("playground.ghostCodeBtn")}</span>
              </button>

              <button
                onClick={() => {
                  setTaskPhase("demo");
                  setLastResult(null);
                  setTaskPassed(null);
                  setFeedbackMessage(undefined);
                }}
                className="px-2.5 py-1 rounded-lg bg-transparent hover:bg-[#1A1D20]/10 text-[#1A1D20]/70 hover:text-[#1A1D20] text-xs font-balsamiq font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>{t("playground.switchToDemoBtn")}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. Language Bar & Action Controls */}
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

        {/* Action Buttons: Run, Switch to Practice, Reset, Next */}
        <div className="flex items-center gap-2 relative">
          {/* Floating XP Award Animation Badge */}
          {showXpAward && (
            <div className="absolute -top-7 right-14 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-balsamiq font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1 animate-bounce z-30 pointer-events-none">
              <Sparkles size={12} />
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

          {/* Primary Action Button (Run Demo vs Verify Practice) */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded-xl active:scale-95 text-white text-xs font-display font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              taskPhase === "demo"
                ? "bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 shadow-blue-900/20"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/20"
            } ${isRunning ? "opacity-80 cursor-wait animate-pulse" : ""}`}
          >
            {isRunning ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} className="fill-white" />
            )}
            <span>
              {isRunning
                ? t("playground.runningCode")
                : taskPhase === "demo"
                ? t("playground.runDemoBtn")
                : t("playground.runPracticeBtn")}
            </span>
          </button>

          {/* If in demo mode and user ran demo, offer prominent switch to practice */}
          {taskPhase === "demo" && (
            <button
              onClick={() => {
                setTaskPhase("practice");
                setLastResult(null);
                setTaskPassed(null);
                setFeedbackMessage(undefined);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#1A1D20] hover:bg-black active:scale-95 text-white text-xs font-display font-bold flex items-center gap-1.5 shadow-md shadow-black/20 transition-all cursor-pointer"
            >
              <span>{t("playground.switchToPracticeBtn")}</span>
            </button>
          )}

          {/* Next Task Button (Only enabled after passing in Practice mode) */}
          {taskPassed && taskPhase === "practice" && !isLastTask && (
            <button
              onClick={handleNextTask}
              disabled={isRunning}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-display font-bold flex items-center gap-1 shadow-md shadow-purple-900/20 transition-all cursor-pointer animate-fadeIn"
            >
              <span>{t("playground.nextTaskBtn")}</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 4. JetBrains CodeMirror Editor with Ghost Overlay & No Autocomplete in Practice */}
      <PlaygroundEditor
        code={currentCode}
        onChange={handleCodeChange}
        language={codeLang}
        phase={taskPhase}
        ghostCode={currentTask.initialCode[codeLang]}
        showGhost={showGhost}
      />

      {/* 5. Live Output Console */}
      <PlaygroundConsole
        result={lastResult}
        taskPassed={taskPassed}
        feedbackMessage={feedbackMessage}
        currentTvState={currentTvState}
        currentTask={currentTask}
        phase={taskPhase}
      />
    </div>
  );
};
