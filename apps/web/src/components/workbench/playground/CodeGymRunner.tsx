/**
 * @file apps/web/src/components/workbench/playground/CodeGymRunner.tsx
 * @description 3-Star Code Gym muscle memory engine: Trace -> Cloze -> Sprint for POS Tasks 1..4
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
  X,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import {
  FINTECH_TASKS,
  executePosScriptAsync,
  type VirtualPosState,
  type FintechTask,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { audioFx } from "../../../utils/audioFx";
import { SyntaxAnatomyCard } from "./SyntaxAnatomyCard";
import { GuidedStepBar } from "./GuidedStepBar";
import { PreciseErrorPointer } from "./PreciseErrorPointer";
import { useGuideSpotlight } from "../../../hooks/useGuideSpotlight";

export const CodeGymRunner: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    posState,
    applyPosExecution,
    resetPosState,
    taskMasteryStars,
    setTaskMastery,
    completeCodingTask,
    addXp,
    setPosVictoryModalOpen,
  } = useWorkbenchStore();

  const [selectedTaskId, setSelectedTaskId] = useState<string>(FINTECH_TASKS[0].id);
  const currentTask: FintechTask = useMemo(
    () => FINTECH_TASKS.find((t) => t.id === selectedTaskId) || FINTECH_TASKS[0],
    [selectedTaskId]
  );

  const [codeLang, setCodeLang] = useState<"csharp" | "go">("csharp");
  const [activeRound, setActiveRound] = useState<1 | 2 | 3 | 4>(1);
  const [showTransferHint, setShowTransferHint] = useState<boolean>(false);

  // Target code for current language & task
  const targetCode = currentTask.targetCode[codeLang];
  const clozeTemplate = currentTask.clozeTemplate[codeLang];

  // Editor content per round
  const [typedCode, setTypedCode] = useState<string>("");
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showTheory, setShowTheory] = useState<boolean>(false);

  // Dynamic gutter width for ghost overlay alignment
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const [gutterWidth, setGutterWidth] = useState<number>(40);
  const updateGutterWidth = useCallback(() => {
    const node = editorContainerRef.current;
    if (!node) return;
    const gutterEl = node.querySelector(".cm-gutters") as HTMLElement | null;
    setGutterWidth(gutterEl ? gutterEl.getBoundingClientRect().width : 40);
  }, []);
  const editorContainerCallbackRef = useCallback((node: HTMLDivElement | null) => {
    editorContainerRef.current = node;
    if (node) {
      updateGutterWidth();
      const resizeObserver = new ResizeObserver(() => updateGutterWidth());
      resizeObserver.observe(node);
      return () => resizeObserver.disconnect();
    }
  }, [updateGutterWidth]);

  // Sprint Timer (Round 3)
  const sprintTimeLimit = Math.max(25, Math.ceil(targetCode.length / 3.2));
  const [timeLeft, setTimeLeft] = useState<number>(sprintTimeLimit);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // WPM & Typing ergonomics
  const [roundStats, setRoundStats] = useState<{ wpm: number; accuracy: number } | null>(null);
  const roundStartTimeRef = useRef<number | null>(null);
  const lastKeySoundTimeRef = useRef<number>(0);

  const playThrottledKeyClick = useCallback(() => {
    const now = Date.now();
    if (now - lastKeySoundTimeRef.current > 35) {
      audioFx.playKeyClick();
      lastKeySoundTimeRef.current = now;
    }
  }, []);

  // Next task calculation
  const currentTaskIndex = FINTECH_TASKS.findIndex((t) => t.id === currentTask.id);
  const nextTask =
    currentTaskIndex >= 0 && currentTaskIndex < FINTECH_TASKS.length - 1
      ? FINTECH_TASKS[currentTaskIndex + 1]
      : null;

  useEffect(() => {
    updateGutterWidth();
  }, [activeRound, codeLang, targetCode, updateGutterWidth]);

  // Mastery stars for this task
  const starsEarned = taskMasteryStars[currentTask.id] || 0;

  // Guide Spotlight — pulses the targeted POS device node
  useGuideSpotlight(currentTask.id);

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
    setShowTransferHint(false);
    const nextTask = FINTECH_TASKS.find((t) => t.id === taskId);
    if (nextTask) {
      resetPosState(nextTask.initialState);
    }
  };

  // Reset or setup editor when round, language, or task changes
  useEffect(() => {
    setRoundCompleted(false);
    setFeedback(null);
    setHasError(false);
    setIsTimerRunning(false);
    setTimeLeft(sprintTimeLimit);
    setRoundStats(null);
    roundStartTimeRef.current = null;
    setShowTransferHint(false);

    if (activeRound === 1) {
      setTypedCode("");
    } else if (activeRound === 2) {
      setTypedCode(clozeTemplate);
    } else if (activeRound === 3) {
      setTypedCode("");
    } else if (activeRound === 4) {
      setTypedCode("");
    }
  }, [activeRound, codeLang, clozeTemplate, currentTask.id, sprintTimeLimit]);

  // ── Round 1: Trace typing mechanics ──────────────────────────
  const handleTraceChange = useCallback(
    async (input: string) => {
      setTypedCode(input);
      if (!roundStartTimeRef.current) {
        roundStartTimeRef.current = Date.now();
      }
      playThrottledKeyClick();

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
        setFeedback(t("codegym.mismatchPrompt", "Символ не відповідає трафарету. Використовуйте Backspace."));
      } else {
        setHasError(false);
        setFeedback(null);

        // Check if fully and accurately completed
        if (input.trim() === targetCode.trim()) {
          setRoundCompleted(true);
          const elapsedMinutes = Math.max(0.04, (Date.now() - (roundStartTimeRef.current || Date.now())) / 60000);
          const calculatedWpm = Math.round((targetCode.length / 5) / elapsedMinutes);
          setRoundStats({ wpm: calculatedWpm, accuracy: 100 });
          audioFx.playSuccessFanfare();
          if (currentTask.id === "task-pos-batch-settlement") {
            audioFx.playPrinterSound();
          } else if (currentTask.id === "task-pos-pin-lockout") {
            audioFx.playAlarmSound();
          }
          setTaskMastery(currentTask.id, 1);
          completeCodingTask(currentTask.id);
          addXp(15);

          // Physical POS device reflection
          const before: VirtualPosState = { ...posState };
          const result = await executePosScriptAsync(input, before);
          applyPosExecution(result.newState);
        }
      }
    },
    [targetCode, currentTask.id, posState, setTaskMastery, completeCodingTask, addXp, applyPosExecution, playThrottledKeyClick, t]
  );

  // ── Round 2: Cloze verification ──────────────────────────────
  const handleVerifyCloze = useCallback(async () => {
    const isUnfilled = typedCode.includes("___");
    if (isUnfilled) {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(t("codegym.fillBlanksPrompt", "Заповніть усі прогалини (___) перед перевіркою!"));
      return;
    }

    const before: VirtualPosState = { ...posState };
    const result = await executePosScriptAsync(typedCode, before);
    applyPosExecution(result.newState);

    const validation = currentTask.validate(before, result.newState, result, typedCode);

    if (validation.passed) {
      setHasError(false);
      setRoundCompleted(true);
      setRoundStats({ wpm: 0, accuracy: 100 });
      audioFx.playSuccessFanfare();
      if (currentTask.id === "task-pos-batch-settlement") {
        audioFx.playPrinterSound();
      } else if (currentTask.id === "task-pos-pin-lockout") {
        audioFx.playAlarmSound();
      }
      setTaskMastery(currentTask.id, 2);
      completeCodingTask(currentTask.id);
      addXp(20);
      setFeedback(t(currentTask.successKey));
    } else {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(t(validation.messageKey || currentTask.hintKey));
    }
  }, [typedCode, posState, currentTask, applyPosExecution, setTaskMastery, completeCodingTask, addXp, t]);

  // ── Round 3: Sprint timer logic ──────────────────────────────
  useEffect(() => {
    if (activeRound !== 3 || !isTimerRunning) return;

    if (timeLeft <= 0) {
      setIsTimerRunning(false);
      audioFx.playErrorBuzz();
      setHasError(true);
      setFeedback(t("codegym.timeExpired"));
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRound, isTimerRunning, timeLeft, t]);

  const handleStartSprint = () => {
    setTimeLeft(sprintTimeLimit);
    setIsTimerRunning(true);
    setHasError(false);
    setFeedback(null);
    setRoundCompleted(false);
    setTypedCode("");
  };

  const handleRunSprint = useCallback(async () => {
    if (timeLeft <= 0) {
      setHasError(true);
      setFeedback(t("codegym.timeExpired"));
      return;
    }

    setIsTimerRunning(false);
    const before: VirtualPosState = { ...posState };
    const result = await executePosScriptAsync(typedCode, before);
    applyPosExecution(result.newState);

    const validation = currentTask.validate(before, result.newState, result, typedCode);

    if (validation.passed) {
      setHasError(false);
      setRoundCompleted(true);
      const elapsedSec = Math.max(1, sprintTimeLimit - timeLeft);
      const elapsedMinutes = elapsedSec / 60;
      const calculatedWpm = Math.round((targetCode.length / 5) / elapsedMinutes);
      setRoundStats({ wpm: calculatedWpm, accuracy: 100 });
      audioFx.playSuccessFanfare();
      if (currentTask.id === "task-pos-batch-settlement") {
        audioFx.playPrinterSound();
      } else if (currentTask.id === "task-pos-pin-lockout") {
        audioFx.playAlarmSound();
      }
      setTaskMastery(currentTask.id, 3);
      completeCodingTask(currentTask.id);
      addXp(50);
      setFeedback(t("codegym.masteryComplete"));

      // Check if all fintech tasks are now completed
      const allCompleted = FINTECH_TASKS.every((task) =>
        task.id === currentTask.id ? true : (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setPosVictoryModalOpen(true);
      }
    } else {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(t(validation.messageKey || currentTask.hintKey));
    }
  }, [timeLeft, posState, typedCode, currentTask, applyPosExecution, setTaskMastery, completeCodingTask, addXp, taskMasteryStars, setPosVictoryModalOpen, t]);

  // ── Round 4: Transfer (Conceptual Variation) ──────────────────────────
  const handleRunTransfer = useCallback(async () => {
    if (!typedCode.trim()) {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(t("codegym.fillBlanksPrompt", "Введіть код для виконання завдання!"));
      return;
    }

    const before: VirtualPosState = { ...posState };
    const result = await executePosScriptAsync(typedCode, before);
    applyPosExecution(result.newState);

    const currentLangKey = (i18n.language?.startsWith("da")
      ? "da"
      : i18n.language?.startsWith("en")
      ? "en"
      : "ua") as "ua" | "en" | "da";

    let passed = false;
    if (currentTask.transferVariant) {
      passed = result.success && currentTask.transferVariant.validate(before, result.newState, typedCode, result);
    } else {
      const validation = currentTask.validate(before, result.newState, result, typedCode);
      passed = validation.passed;
    }

    if (passed) {
      setHasError(false);
      setRoundCompleted(true);
      setRoundStats({ wpm: 0, accuracy: 100 });
      audioFx.playSuccessFanfare();
      if (currentTask.id === "task-pos-batch-settlement") {
        audioFx.playPrinterSound();
      } else if (currentTask.id === "task-pos-pin-lockout") {
        audioFx.playAlarmSound();
      }
      setTaskMastery(currentTask.id, 4);
      completeCodingTask(currentTask.id);
      addXp(75);
      setFeedback(t("codegym.transferComplete", "Чудово! Варіацію перевірено, 4-ту зірку майстра зараховано!"));

      // Check if all fintech tasks are now completed
      const allCompleted = FINTECH_TASKS.every((task) =>
        task.id === currentTask.id ? true : (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setPosVictoryModalOpen(true);
      }
    } else {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(
        result.error
          ? result.error
          : currentTask.transferVariant?.hint[currentLangKey] ||
            t("codegym.transferFailed", "Умова варіації не виконана. Перевірте значення параметрів або стан пристрою.")
      );
    }
  }, [
    typedCode,
    posState,
    currentTask,
    applyPosExecution,
    setTaskMastery,
    completeCodingTask,
    addXp,
    taskMasteryStars,
    setPosVictoryModalOpen,
    i18n.language,
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

  const fileName = useMemo(() => {
    switch (currentTask.id) {
      case "task-pos-fee-calculation":
        return codeLang === "go" ? "fee.go" : "FeeCalculator.cs";
      case "task-pos-pin-lockout":
        return codeLang === "go" ? "pin_lock.go" : "PinSecurityGuard.cs";
      case "task-pos-batch-settlement":
        return codeLang === "go" ? "batch.go" : "BatchSettlement.cs";
      case "task-pos-interface-polymorphism":
        return codeLang === "go" ? "payment_gateway.go" : "PaymentContract.cs";
      case "task-pos-dependency-injection":
        return codeLang === "go" ? "container.go" : "Program.cs";
      default:
        return codeLang === "go" ? "guard.go" : "TransactionGuard.cs";
    }
  }, [currentTask.id, codeLang]);

  const allFintechCompleted = useMemo(() => {
    return FINTECH_TASKS.every((task) => (taskMasteryStars[task.id] || 0) >= 1);
  }, [taskMasteryStars]);

  // Keyboard Shortcuts (Ctrl+Enter / Cmd+Enter, Esc, Tab in Cloze)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter / Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (roundCompleted) {
          if (activeRound < 4) {
            audioFx.playRelayClick();
            setActiveRound((prev) => (prev + 1) as 1 | 2 | 3 | 4);
          } else if (nextTask) {
            audioFx.playRelayClick();
            handleSelectTask(nextTask.id);
          }
          return;
        }

        if (activeRound === 2) {
          handleVerifyCloze();
        } else if (activeRound === 3) {
          if (!isTimerRunning) {
            handleStartSprint();
          } else {
            handleRunSprint();
          }
        } else if (activeRound === 4) {
          handleRunTransfer();
        }
        return;
      }

      // Escape to reset round
      if (e.key === "Escape") {
        e.preventDefault();
        audioFx.playRelayClick();
        setTypedCode(activeRound === 2 ? clozeTemplate : "");
        setHasError(false);
        setFeedback(null);
        setRoundCompleted(false);
        setIsTimerRunning(false);
        setTimeLeft(sprintTimeLimit);
        setRoundStats(null);
        roundStartTimeRef.current = null;
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeRound,
    roundCompleted,
    isTimerRunning,
    typedCode,
    clozeTemplate,
    sprintTimeLimit,
    nextTask,
    handleVerifyCloze,
    handleRunSprint,
    handleRunTransfer,
    handleSelectTask,
  ]);

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none max-w-4xl mx-auto">
      {/* ── Top Header: Task Selector, Task Title, Round Tabs & Mastery Stars ── */}
      <div className="p-4 rounded-2xl bg-[#EFEAE1] border border-paper-border shadow-paper-sm space-y-3">
        {/* Task Navigation Bar (Tasks 1..6) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 border-b border-paper-border/70 pb-3">
          {FINTECH_TASKS.map((task, idx) => {
            const isCurrent = task.id === currentTask.id;
            const taskStars = taskMasteryStars[task.id] || 0;
            return (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#1E2024] border-[#1E2024] text-white shadow-sm"
                    : "bg-paper/70 hover:bg-paper border-paper-border text-ink hover:border-accent-blue/40"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`font-bold uppercase ${isCurrent ? "text-amber-400" : "text-ink-muted"}`}>
                    Завдання {idx + 1}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs">
                    {[1, 2, 3, 4].map((s) => (
                      <span
                        key={s}
                        className={
                          taskStars >= s
                            ? s === 4
                              ? "text-cyan-400"
                              : "text-amber-400"
                            : "text-gray-300 opacity-40"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </span>
                </div>
                <div
                  className={`text-[11px] font-display font-bold truncate mt-0.5 ${
                    isCurrent ? "text-white" : "text-ink"
                  }`}
                  title={t(task.titleKey)}
                >
                  {t(task.conceptKey)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Task Title & Stars Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title & Concept Badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-600/40 flex items-center justify-center text-amber-700">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 border border-amber-600/30">
                  Code Gym • 4-Star Mastery
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
            {allFintechCompleted && (
              <button
                onClick={() => {
                  audioFx.playSuccessFanfare();
                  setPosVictoryModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-display font-extrabold text-xs shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={t("codegym.certificateTooltip", "Отримати сертифікат модуля")}
              >
                <Trophy size={14} className="text-stone-900" />
                <span>{t("codegym.certificateBtn", "Сертифікат")}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper border border-paper-border shadow-xs">
              <span className="text-xs font-display font-bold text-ink-muted mr-1">
                {t("codegym.starsLabel")}:
              </span>
              {[1, 2, 3, 4].map((starIdx) => (
                <span
                  key={starIdx}
                  title={starIdx === 4 ? "4-Star Master Star (Transfer)" : `Star ${starIdx}`}
                  className="inline-flex items-center"
                >
                  <Star
                    key={starIdx}
                    size={18}
                    className={`transition-all duration-300 ${
                      starsEarned >= starIdx
                        ? starIdx === 4
                          ? "text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] scale-115"
                          : "text-amber-500 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] scale-110"
                        : "text-gray-300"
                    }`}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Parchment Tooltip popover with close button */}
        {showTooltip && (
          <div className="p-3 rounded-xl bg-[#EBE5D8] border border-[#1A1D20]/30 text-[#1A1D20] text-xs font-balsamiq leading-relaxed shadow-sm animate-in fade-in flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="font-mono font-bold text-[10px] uppercase text-[#1A1D20]/70 mb-1">
                {t("common.simpleExplanation", "Простими словами")}:
              </div>
              <p>{t(currentTask.descKey)}</p>
            </div>
            <button
              onClick={() => {
                audioFx.playRelayClick();
                setShowTooltip(false);
              }}
              className="p-1 rounded-md hover:bg-[#1A1D20]/10 text-[#1A1D20]/60 hover:text-[#1A1D20] transition-colors cursor-pointer shrink-0"
              title={t("common.close", "Закрити")}
              aria-label={t("common.close", "Закрити")}
            >
              <X size={14} />
            </button>
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

        {/* ── Guided Step Bar: Arcade-style briefing & 5-layer didactic engine ── */}
        {currentTask.simpleExplanationKey && (
          <GuidedStepBar
            data={{
              simpleKey: currentTask.simpleExplanationKey,
              engineeringKey: currentTask.engineeringKey || currentTask.simpleExplanationKey,
              taskId: currentTask.id,
              codeLang,
              targetCode: currentTask.targetCode,
            }}
            persistent={true}
            defaultExpanded={starsEarned === 0 && activeRound === 1}
            onStartPractice={() => {
              setTimeout(() => {
                const cm = document.querySelector(".cm-content") as HTMLElement | null;
                cm?.focus();
              }, 50);
            }}
          />
        )}

        {/* 4-Round Mode Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {[
            { round: 1, label: t("codegym.round1Badge"), desc: "Сліпий трафарет" },
            { round: 2, label: t("codegym.round2Badge"), desc: "Прогалини (Cloze)" },
            { round: 3, label: t("codegym.round3Badge"), desc: `Спринт (${sprintTimeLimit}с)` },
            { round: 4, label: t("codegym.round4Badge"), desc: t("codegym.round4DescShort", "Варіація") },
          ].map(({ round, label, desc }) => {
            const isActive = activeRound === round;
            const isUnlocked = round === 1 || starsEarned >= round - 1;

            return (
              <button
                key={round}
                disabled={!isUnlocked}
                onClick={() => {
                  audioFx.playRelayClick();
                  setActiveRound(round as 1 | 2 | 3 | 4);
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
                    <span className={round === 4 ? "text-cyan-400 text-xs" : "text-amber-400 text-xs"}>
                      {round === 4 ? "💎" : "⭐"}
                    </span>
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

      {/* ── Editor Container ── */}
      <div className="w-full rounded-2xl overflow-hidden border border-[#2B2D33] shadow-lg bg-[#1E1E22]">
        {/* Editor Top Bar */}
        <div className="px-3.5 py-2 bg-[#18191C] border-b border-[#2B2D33] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />

            {/* Language Switcher */}
            <div className="ml-2 flex items-center gap-1 bg-[#23252B] p-0.5 rounded-lg border border-[#343842]">
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

          {/* Round-specific status display & stats */}
          <div className="flex items-center gap-2">
            {roundStats && roundStats.wpm > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                ⚡ {roundStats.wpm} WPM
              </span>
            )}
            {roundStats && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                {roundStats.accuracy}% точність
              </span>
            )}

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

            {activeRound === 4 && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
                <Sparkles size={13} />
                <span>Варіація</span>
              </div>
            )}
          </div>
        </div>

        {/* Round 4: Transfer Mission Prompt Banner */}
        {activeRound === 4 && (
          <div className="px-4 py-3 bg-[#161B22] border-b border-[#2B2D33] text-ink-light space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                  {t("codegym.transferCardTitle", "Місія варіації (Transfer Task)")}
                </span>
                <span className="text-[11px] font-mono text-gray-400">
                  ★ 4-та зірка майстра
                </span>
              </div>
              {currentTask.transferVariant?.hint && (
                <button
                  type="button"
                  onClick={() => setShowTransferHint((prev) => !prev)}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer flex items-center gap-1"
                >
                  <HelpCircle size={12} />
                  <span>{showTransferHint ? t("codegym.hideHint", "Сховати підказку") : t("codegym.showHint", "Підказка")}</span>
                </button>
              )}
            </div>
            <p className="text-xs font-mono text-gray-200 leading-relaxed font-semibold">
              {currentTask.transferVariant?.prompt[
                (i18n.language?.startsWith("da") ? "da" : i18n.language?.startsWith("en") ? "en" : "ua") as "ua" | "en" | "da"
              ] ||
                currentTask.transferVariant?.prompt.ua ||
                t(currentTask.descKey)}
            </p>
            {showTransferHint && currentTask.transferVariant?.hint && (
              <div className="p-2.5 rounded-lg bg-[#0D1117] border border-cyan-500/30 text-[11px] font-mono text-cyan-200 animate-in fade-in duration-200">
                <span className="text-cyan-400 font-bold">Hint: </span>
                {currentTask.transferVariant.hint[
                  (i18n.language?.startsWith("da") ? "da" : i18n.language?.startsWith("en") ? "en" : "ua") as "ua" | "en" | "da"
                ] || currentTask.transferVariant.hint.ua}
              </div>
            )}
          </div>
        )}

        {/* Interactive Editor Surface */}
        <div className="relative font-mono text-xs" ref={editorContainerCallbackRef}>
          {/* Round 1 (Trace): Blueprint Ghost Guide Overlay — gutter-aligned */}
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
              playThrottledKeyClick();
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

        {/* Tactile Hotkeys Quick Bar */}
        <div className="px-3.5 py-1 bg-[#141517] border-t border-[#23252B] flex items-center justify-between text-[10px] font-mono text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#23252B] border border-[#3A3D46] text-gray-200 font-bold text-[9px]">Ctrl+Enter</kbd>
              <span>{roundCompleted ? t("codegym.nextRoundBtn", "Наступний крок") : t("common.verify", "Перевірка")}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#23252B] border border-[#3A3D46] text-gray-200 font-bold text-[9px]">Esc</kbd>
              <span>{t("common.reset", "Скидання")}</span>
            </span>
          </div>
          {activeRound === 2 && (
            <span className="text-gray-400 hidden sm:inline">
              Заповніть <code className="text-amber-300 font-bold">___</code> прогалини
            </span>
          )}
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
                    ? t("codegym.round1Desc")
                    : activeRound === 2
                    ? t("codegym.round2Desc")
                    : activeRound === 3
                    ? t("codegym.round3Desc")
                    : t("codegym.round4Desc", "Створіть варіацію самостійно без підказок трафарету."))}
              </span>
            </div>
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
                <span>{t("codegym.verifyBlanksBtn", "Перевірити прогалини")}</span>
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
                    <span>{`${t("codegym.startSprintBtn", "Почати спринт")} (${sprintTimeLimit}с)`}</span>
                  </button>
                )}

                {isTimerRunning && (
                  <button
                    onClick={handleRunSprint}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 size={13} />
                    <span>{t("codegym.runSprintBtn")}</span>
                  </button>
                )}
              </>
            )}

            {activeRound === 4 && !roundCompleted && (
              <button
                onClick={handleRunTransfer}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                <Sparkles size={13} />
                <span>{t("codegym.verifyTransferBtn", "Перевірити варіацію")}</span>
              </button>
            )}

            {/* Next Round Button after Win */}
            {roundCompleted && activeRound < 4 && (
              <button
                onClick={() => {
                  audioFx.playRelayClick();
                  setActiveRound((prev) => (prev + 1) as 1 | 2 | 3 | 4);
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md animate-pulse"
              >
                <span>{t("codegym.nextRoundBtn")}</span>
                <ArrowRight size={13} />
              </button>
            )}

            {roundCompleted && activeRound === 4 && (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/50 text-amber-200 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm">
                  <Trophy size={14} className="text-amber-400" />
                  <span>4-Star Platinum Master!</span>
                </div>
                {nextTask && (
                  <button
                    onClick={() => {
                      audioFx.playRelayClick();
                      handleSelectTask(nextTask.id);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md animate-pulse"
                  >
                    <span>{t("codegym.nextTaskBtn", "Наступне завдання →")}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
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
                setTimeLeft(sprintTimeLimit);
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
