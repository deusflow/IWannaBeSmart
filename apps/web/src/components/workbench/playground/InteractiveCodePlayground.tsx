/**
 * @file apps/web/src/components/workbench/playground/InteractiveCodePlayground.tsx
 * @description 3-Star Code Gym muscle memory engine for Virtual TV: Trace -> Cloze -> Sprint
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { cpp } from "@codemirror/lang-cpp";
import { go } from "@codemirror/lang-go";
import {
  Star,
  Play,
  RotateCcw,
  ArrowRight,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Zap,
} from "lucide-react";
import {
  CODING_TASKS,
  executeTvScriptAsync,
  type VirtualTvState,
  type CodingTask,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { audioFx } from "../../../utils/audioFx";
import { SyntaxAnatomyCard } from "./SyntaxAnatomyCard";
import { GuidedStepBar, type GuidedStepData } from "./GuidedStepBar";
import { PreciseErrorPointer } from "./PreciseErrorPointer";
import { useGuideSpotlight } from "../../../hooks/useGuideSpotlight";

export const InteractiveCodePlayground: React.FC = () => {
  const { t } = useTranslation();
  const {
    power,
    channel,
    volume,
    isArchitecturePowerWired,
    setArchitecturePowerWired,
    applyCodeExecution,
    completeCodingTask,
    completedCodingTasks,
    taskMasteryStars,
    setTaskMastery,
    addXp,
    setStationVictoryModalOpen,
  } = useWorkbenchStore();

  const [selectedTaskId, setSelectedTaskId] = useState<string>("task-1-assignment");
  const currentTask: CodingTask = useMemo(
    () => CODING_TASKS.find((t) => t.id === selectedTaskId) || CODING_TASKS[0],
    [selectedTaskId]
  );

  const [codeLang, setCodeLang] = useState<"csharp" | "go">("csharp");
  const [activeRound, setActiveRound] = useState<1 | 2 | 3>(1);

  // Target code for current language & task
  const targetCode = currentTask.targetCode[codeLang];
  const clozeTemplate = currentTask.clozeTemplate[codeLang];
  const sprintLimit = Math.max(25, Math.ceil(targetCode.length / 3.2));

  // Editor content per round
  const [typedCode, setTypedCode] = useState<string>("");
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showTheory, setShowTheory] = useState<boolean>(false);

  // Sprint Timer (Round 3)
  const [timeLeft, setTimeLeft] = useState<number>(sprintLimit);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Mastery stars for this task
  const starsEarned = taskMasteryStars[currentTask.id] || 0;

  // Guide Spotlight — pulses the targeted device node
  useGuideSpotlight(currentTask.id);

  // Show guided explanation bar before first round attempt
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const [gutterWidth, setGutterWidth] = useState<number>(40);
  const updateGutterWidth = useCallback(() => {
    const node = editorContainerRef.current;
    if (!node) return;
    const gutterEl = node.querySelector(".cm-gutters") as HTMLElement | null;
    setGutterWidth(gutterEl ? gutterEl.getBoundingClientRect().width : 40);
  }, []);
  useEffect(() => {
    updateGutterWidth();
    if (!editorContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => updateGutterWidth());
    resizeObserver.observe(editorContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeRound, codeLang, targetCode, updateGutterWidth]);

  // CodeMirror language extensions
  const extensions = useMemo(() => {
    return codeLang === "go" ? [go()] : [cpp()];
  }, [codeLang]);

  // Handle task switching
  const handleSelectTask = (taskId: string) => {
    if (taskId === selectedTaskId) return;
    audioFx.playRelayClick();
    setSelectedTaskId(taskId);
    setActiveRound(1);
    setShowTheory(false);
    setShowTooltip(false);
    setShowGuide(true); // Reset guide for new task

    // Educational presets for edge conditions on TV
    if (taskId === "task-boundary-guard" && channel <= 4) {
      applyCodeExecution({ channel: 5 });
    }
    if (taskId === "task-function-encapsulation" && volume === 0) {
      applyCodeExecution({ volume: 50 });
    }
  };

  // Reset or setup editor when round, language, or task changes
  useEffect(() => {
    setRoundCompleted(false);
    setFeedback(null);
    setHasError(false);
    setIsTimerRunning(false);
    setTimeLeft(sprintLimit);

    if (activeRound === 1) {
      setTypedCode("");
    } else if (activeRound === 2) {
      setTypedCode(clozeTemplate);
    } else if (activeRound === 3) {
      setTypedCode("");
    }
  }, [activeRound, codeLang, clozeTemplate, currentTask.id, sprintLimit]);

  // ── Round 1: Trace typing mechanics ──────────────────────────
  const handleTraceChange = useCallback(
    async (input: string) => {
      setTypedCode(input);

      // Verify character by character against target
      let mismatch = false;
      const minLen = Math.min(input.length, targetCode.length);

      for (let i = 0; i < minLen; i++) {
        if (input[i] !== targetCode[i]) {
          mismatch = true;
          break;
        }
      }

      if (mismatch) {
        setHasError(true);
        audioFx.playErrorBuzz();
        setFeedback("Символ не відповідає трафарету. Використовуйте Backspace.");
      } else {
        setHasError(false);
        setFeedback(null);

        // Check if fully and accurately completed
        if (input.trim() === targetCode.trim()) {
          setRoundCompleted(true);
          audioFx.playSuccessFanfare();
          setTaskMastery(currentTask.id, 1);
          completeCodingTask(currentTask.id);
          addXp(15);

          // Physical TV reflection
          const beforeState: VirtualTvState = {
            isOn: power,
            channel,
            volume,
            isArchitectureWired: isArchitecturePowerWired,
          };
          const res = await executeTvScriptAsync(
            input,
            beforeState,
            (snap) => {
              applyCodeExecution({
                power: snap.isOn,
                channel: snap.channel,
                volume: snap.volume,
                osdMessage: snap.osdMessage,
              });
            },
            150
          );
          if (res.success) {
            applyCodeExecution({
              power: res.newState.isOn,
              channel: res.newState.channel,
              volume: res.newState.volume,
              osdMessage: res.newState.osdMessage,
            });
            if (res.newState.isArchitectureWired) {
              setArchitecturePowerWired(true);
            }
          }
        }
      }
    },
    [
      targetCode,
      currentTask.id,
      power,
      channel,
      volume,
      isArchitecturePowerWired,
      setArchitecturePowerWired,
      applyCodeExecution,
      setTaskMastery,
      completeCodingTask,
      addXp,
    ]
  );

  // ── Round 2: Cloze verification ──────────────────────────────
  const handleVerifyCloze = useCallback(async () => {
    const isUnfilled = typedCode.includes("___");
    if (isUnfilled) {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback("Заповніть усі прогалини (___) перед перевіркою!");
      return;
    }

    const beforeState: VirtualTvState = {
      isOn: power,
      channel,
      volume,
      isArchitectureWired: isArchitecturePowerWired,
    };

    const result = await executeTvScriptAsync(
      typedCode,
      beforeState,
      (snapshot) => {
        applyCodeExecution({
          power: snapshot.isOn,
          channel: snapshot.channel,
          volume: snapshot.volume,
          osdMessage: snapshot.osdMessage,
        });
      },
      200
    );

    if (result.success) {
      applyCodeExecution({
        power: result.newState.isOn,
        channel: result.newState.channel,
        volume: result.newState.volume,
        osdMessage: result.newState.osdMessage,
      });
      if (result.newState.isArchitectureWired) {
        setArchitecturePowerWired(true);
      }
    }

    const validation = currentTask.validate(beforeState, result.newState, result, typedCode);

    if (validation.passed) {
      setHasError(false);
      setRoundCompleted(true);
      audioFx.playSuccessFanfare();
      setTaskMastery(currentTask.id, 2);
      completeCodingTask(currentTask.id);
      addXp(20);
      setFeedback(t(currentTask.successKey));
    } else {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(
        result.error
          ? result.error
          : validation.messageKey
          ? t(validation.messageKey)
          : t(currentTask.hintKey)
      );
    }
  }, [
    typedCode,
    power,
    channel,
    volume,
    isArchitecturePowerWired,
    currentTask,
    applyCodeExecution,
    setTaskMastery,
    completeCodingTask,
    addXp,
    t,
  ]);

  // ── Round 3: Sprint timer logic ──────────────────────────────
  useEffect(() => {
    if (activeRound !== 3 || !isTimerRunning) return;

    if (timeLeft <= 0) {
      setIsTimerRunning(false);
      audioFx.playErrorBuzz();
      setHasError(true);
      setFeedback(t("codegym.timeExpired", "Час вичерпано! Спробуйте ще раз."));
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRound, isTimerRunning, timeLeft, t]);

  const handleStartSprint = () => {
    setTimeLeft(sprintLimit);
    setIsTimerRunning(true);
    setHasError(false);
    setFeedback(null);
    setRoundCompleted(false);
    setTypedCode("");
  };

  const handleRunSprint = useCallback(async () => {
    if (timeLeft <= 0) {
      setHasError(true);
      setFeedback(t("codegym.timeExpired", "Час вичерпано! Спробуйте ще раз."));
      return;
    }

    setIsTimerRunning(false);
    const beforeState: VirtualTvState = {
      isOn: power,
      channel,
      volume,
      isArchitectureWired: isArchitecturePowerWired,
    };

    const result = await executeTvScriptAsync(
      typedCode,
      beforeState,
      (snapshot) => {
        applyCodeExecution({
          power: snapshot.isOn,
          channel: snapshot.channel,
          volume: snapshot.volume,
          osdMessage: snapshot.osdMessage,
        });
      },
      150
    );

    if (result.success) {
      applyCodeExecution({
        power: result.newState.isOn,
        channel: result.newState.channel,
        volume: result.newState.volume,
        osdMessage: result.newState.osdMessage,
      });
      if (result.newState.isArchitectureWired) {
        setArchitecturePowerWired(true);
      }
    }

    const validation = currentTask.validate(beforeState, result.newState, result, typedCode);

    if (validation.passed) {
      setHasError(false);
      setRoundCompleted(true);
      audioFx.playSuccessFanfare();
      setTaskMastery(currentTask.id, 3);
      completeCodingTask(currentTask.id);
      addXp(50);
      setFeedback(t("codegym.masteryComplete", "Майстерність підтверджено! 3 зірки зараховано."));

      if (currentTask.id === "task-command-registry") {
        setStationVictoryModalOpen(true);
      }
    } else {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(
        result.error
          ? result.error
          : validation.messageKey
          ? t(validation.messageKey)
          : t(currentTask.hintKey)
      );
    }
  }, [
    timeLeft,
    power,
    channel,
    volume,
    isArchitecturePowerWired,
    typedCode,
    currentTask,
    applyCodeExecution,
    setTaskMastery,
    completeCodingTask,
    addXp,
    setStationVictoryModalOpen,
    t,
  ]);

  // Trace character progress
  const traceCharsMatched = useMemo(() => {
    let count = 0;
    const minLen = Math.min(typedCode.length, targetCode.length);
    for (let i = 0; i < minLen; i++) {
      if (typedCode[i] === targetCode[i]) count++;
      else break;
    }
    return count;
  }, [typedCode, targetCode]);

  // File name
  const fileName = useMemo(() => {
    switch (currentTask.id) {
      case "task-interface-polymorphism":
        return codeLang === "go" ? "command.go" : "IRemoteCommand.cs";
      case "task-di-container":
        return codeLang === "go" ? "container.go" : "Program.cs";
      case "task-command-registry":
        return codeLang === "go" ? "registry.go" : "CommandRegistry.cs";
      default:
        return codeLang === "go" ? "tv_controller.go" : "TVController.cs";
    }
  }, [currentTask.id, codeLang]);

  const allTvTasksCompleted = useMemo(() => {
    return CODING_TASKS.every(
      (task) => (taskMasteryStars[task.id] || 0) >= 1 || completedCodingTasks[task.id]
    );
  }, [taskMasteryStars, completedCodingTasks]);

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none max-w-4xl mx-auto">
      {/* ── Top Header: Task Selector, Task Title, Round Tabs & Mastery Stars ── */}
      <div className="p-4 rounded-2xl bg-[#EFEAE1] border border-paper-border shadow-paper-sm space-y-3">
        {/* Task Navigation Bar (Tasks 1..10) */}
        <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 border-b border-paper-border/70 pb-3">
          {CODING_TASKS.map((task, idx) => {
            const isCurrent = task.id === currentTask.id;
            const taskStars = taskMasteryStars[task.id] || 0;
            return (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                className={`p-1.5 rounded-xl text-center border transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#1E2024] border-[#1E2024] text-white shadow-sm"
                    : "bg-paper/70 hover:bg-paper border-paper-border text-ink hover:border-accent-blue/40"
                }`}
                title={`${t(task.titleKey)} (${taskStars}/3 ★)`}
              >
                <div className="text-[10px] font-mono font-bold uppercase">
                  <span className={isCurrent ? "text-amber-400" : "text-ink-muted"}>
                    #{idx + 1}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-0.5 text-[9px] mt-0.5">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={taskStars >= s ? "text-amber-400" : "text-gray-300 opacity-40"}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Task Title & Stars Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title & Concept Badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-blue/20 border border-accent-blue/40 flex items-center justify-center text-accent-blue">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-accent-blue/20 text-accent-blue border border-accent-blue/30">
                  Code Gym • 3-Star Mastery
                </span>
                <span className="text-xs font-mono font-bold text-ink-muted">
                  {t(currentTask.conceptKey)}
                </span>
                {/* Tooltip button in blueprint style */}
                <button
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="w-5 h-5 rounded-full bg-[#EBE5D8] border border-[#1A1D20]/30 hover:border-[#1A1D20]/60 text-[#1A1D20] text-[11px] font-mono font-extrabold flex items-center justify-center transition-colors cursor-pointer"
                  title="Простими словами"
                  aria-label="Простими словами"
                >
                  ?
                </button>
              </div>
              <h3 className="font-display font-bold text-base text-ink mt-0.5">
                {t(currentTask.titleKey)}
              </h3>
            </div>
          </div>

          {/* Stars Mastery Counter & Trophy / Certificate trigger */}
          <div className="flex items-center gap-2">
            {allTvTasksCompleted && (
              <button
                onClick={() => {
                  audioFx.playSuccessFanfare();
                  setStationVictoryModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-display font-extrabold text-xs shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Отримати сертифікат телевізійної станції"
              >
                <Trophy size={14} className="text-stone-900" />
                <span>Сертифікат</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper border border-paper-border shadow-xs">
              <span className="text-xs font-display font-bold text-ink-muted mr-1">
                {t("codegym.starsLabel", "Майстерність")}:
              </span>
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  size={18}
                  className={`transition-all duration-300 ${
                    starsEarned >= starIdx
                      ? "text-amber-500 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] scale-110"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Parchment Tooltip popover */}
        {showTooltip && (
          <div className="p-3 rounded-xl bg-[#EBE5D8] border border-[#1A1D20]/30 text-[#1A1D20] text-xs font-balsamiq leading-relaxed shadow-sm animate-in fade-in">
            <div className="font-mono font-bold text-[10px] uppercase text-[#1A1D20]/70 mb-1">
              Простими словами:
            </div>
            {t(currentTask.descKey)}
          </div>
        )}

        {/* Blueprint Style Theory & Code Anatomy Card */}
        <div className="pt-0.5">
          <SyntaxAnatomyCard
            taskId={currentTask.id}
            codeLang={codeLang}
            isOpen={showTheory}
            onToggle={() => setShowTheory((p) => !p)}
          />
        </div>

        {/* ── Guided Step Bar: two-layer explanation before first round ── */}
        {showGuide && activeRound === 1 && currentTask.simpleExplanationKey && (
          <GuidedStepBar
            data={{
              simpleKey: currentTask.simpleExplanationKey,
              engineeringKey: currentTask.engineeringKey || currentTask.simpleExplanationKey,
            } as GuidedStepData}
            onStartPractice={() => {
              setShowGuide(false);
              setTimeout(() => {
                const cm = document.querySelector(".cm-content") as HTMLElement | null;
                cm?.focus();
              }, 50);
            }}
          />
        )}

        {/* 3-Round Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { round: 1, label: t("codegym.round1Badge", "Раунд 1"), desc: t("codegym.round1Title", "Сліпий трафарет") },
            { round: 2, label: t("codegym.round2Badge", "Раунд 2"), desc: t("codegym.round2Title", "Прогалини (Cloze)") },
            { round: 3, label: t("codegym.round3Badge", "Раунд 3"), desc: `${t("codegym.round3Badge", "Спринт")} (${sprintLimit}с)` },
          ].map(({ round, label, desc }) => {
            const isActive = activeRound === round;
            const isUnlocked = round === 1 || starsEarned >= round - 1;

            return (
              <button
                key={round}
                disabled={!isUnlocked}
                onClick={() => {
                  audioFx.playRelayClick();
                  setActiveRound(round as 1 | 2 | 3);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-[#1E2024] border-[#1E2024] text-white shadow-md"
                    : isUnlocked
                    ? "bg-paper hover:bg-paper-muted border-paper-border text-ink hover:border-accent-blue/40"
                    : "bg-paper/40 border-paper-border/50 text-ink-muted/50 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-[11px] uppercase">
                    {label}
                  </span>
                  {starsEarned >= round && (
                    <span className="text-amber-400 text-xs">⭐</span>
                  )}
                </div>
                <div className={`text-[10px] truncate mt-0.5 ${isActive ? "text-gray-300" : "text-ink-muted"}`}>
                  {desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Editor Canvas: CodeMirror with Ghost Stencil or Code ── */}
      <div className="rounded-2xl border-2 border-[#2B2D33] bg-[#1E2024] overflow-hidden shadow-paper-lg flex flex-col">
        {/* Editor Title Bar */}
        <div className="px-4 py-2.5 bg-[#18191C] border-b border-[#2B2D33] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#282A30] p-0.5 rounded-lg border border-[#3A3D45]">
              <button
                onClick={() => setCodeLang("csharp")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                  codeLang === "csharp"
                    ? "bg-accent-blue text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                C#
              </button>
              <button
                onClick={() => setCodeLang("go")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                  codeLang === "go"
                    ? "bg-accent-blue text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Go
              </button>
            </div>

            <span className="text-[11px] font-mono text-gray-400 font-bold ml-1">
              {fileName}
            </span>
          </div>

          {/* Round-specific status display */}
          <div className="flex items-center gap-3">
            {activeRound === 1 && (
              <span className="text-[11px] font-mono text-amber-300 font-bold">
                Тайпінг: {traceCharsMatched} / {targetCode.length} симв.
              </span>
            )}

            {activeRound === 3 && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                <Timer size={13} className={isTimerRunning ? "animate-spin" : ""} />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Editor Surface */}
        <div className="relative font-mono text-xs" ref={editorContainerRef}>
          {/* Round 1 (Trace): Blueprint Ghost Guide Overlay */}
          {activeRound === 1 && (
            <div
              className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none whitespace-pre text-gray-600 opacity-60"
              style={{
                paddingLeft: `${gutterWidth + 6}px`,
                paddingTop: "8px",
                paddingRight: "12px",
                paddingBottom: "8px",
                fontFamily: "inherit",
                fontSize: "inherit",
                lineHeight: "1.4",
              }}
            >
              {targetCode}
            </div>
          )}

          <CodeMirror
            value={typedCode}
            height="180px"
            theme={oneDark}
            extensions={extensions}
            onChange={(val) => {
              if (activeRound === 1) {
                handleTraceChange(val);
              } else {
                setTypedCode(val);
              }
            }}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              foldGutter: false,
              autocompletion: false, // Strict muscle memory: no autocomplete!
            }}
          />
        </div>

        {/* Footer & Controls */}
        <div className="px-4 py-3 bg-[#18191C] border-t border-[#2B2D33] flex items-center justify-between flex-wrap gap-3">
          {/* Feedback message + PreciseErrorPointer */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              {hasError && <AlertTriangle size={15} className="text-red-400 shrink-0" />}
              {roundCompleted && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
              <span
                className={`text-xs font-mono truncate ${
                  hasError
                    ? "text-red-400 font-bold"
                    : roundCompleted
                    ? "text-emerald-300 font-bold"
                    : "text-gray-400"
                }`}
              >
                {feedback ||
                  (activeRound === 1
                    ? t("codegym.round1Desc", "Надрукуйте код символ у символ поверх трафарету.")
                    : activeRound === 2
                    ? t("codegym.round2Desc", "Заповніть ключові прогалини (___)!")
                    : t("codegym.round3Desc", "Відтворіть конструкцію з пам'яті за обмежений час!"))}
              </span>
            </div>
            {/* Precise token-level error pointer */}
            {hasError && (activeRound === 1 || activeRound === 3) && (
              <PreciseErrorPointer
                userInput={typedCode}
                targetCode={targetCode}
                hasError={hasError}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {activeRound === 2 && !roundCompleted && (
              <button
                onClick={handleVerifyCloze}
                className="px-4 py-1.5 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                <Play size={13} />
                <span>Перевірити прогалини</span>
              </button>
            )}

            {activeRound === 3 && (
              <>
                {!isTimerRunning && !roundCompleted && (
                  <button
                    onClick={handleStartSprint}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
                  >
                    <Play size={13} />
                    <span>Почати спринт ({sprintLimit}с)</span>
                  </button>
                )}

                {isTimerRunning && (
                  <button
                    onClick={handleRunSprint}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 size={13} />
                    <span>{t("codegym.runSprintBtn", "Запустити бліц")}</span>
                  </button>
                )}
              </>
            )}

            {/* Next Round Button after Win */}
            {roundCompleted && activeRound < 3 && (
              <button
                onClick={() => {
                  audioFx.playRelayClick();
                  setActiveRound((prev) => (prev + 1) as 1 | 2 | 3);
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md animate-pulse"
              >
                <span>{t("codegym.nextRoundBtn", "Наступний раунд")}</span>
                <ArrowRight size={13} />
              </button>
            )}

            {roundCompleted && activeRound === 3 && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono font-bold text-xs flex items-center gap-1.5">
                <Trophy size={14} className="text-amber-400" />
                <span>3-Star Mastered!</span>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={() => {
                audioFx.playRelayClick();
                setTypedCode(activeRound === 2 ? clozeTemplate : "");
                setHasError(false);
                setFeedback(null);
                setRoundCompleted(false);
                setIsTimerRunning(false);
                setTimeLeft(sprintLimit);
              }}
              title="Reset Round"
              className="p-1.5 rounded-xl bg-[#23252B] hover:bg-[#2F323A] text-gray-400 hover:text-white transition-colors cursor-pointer border border-[#343842]"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
