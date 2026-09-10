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
import { GuidedStepBar, type GuidedStepData } from "./GuidedStepBar";
import { PreciseErrorPointer } from "./PreciseErrorPointer";
import { useGuideSpotlight } from "../../../hooks/useGuideSpotlight";

export const CodeGymRunner: React.FC = () => {
  const { t } = useTranslation();
  const {
    posState,
    applyPosExecution,
    resetPosState,
    taskMasteryStars,
    setTaskMastery,
    addXp,
    setPosVictoryModalOpen,
  } = useWorkbenchStore();

  const [selectedTaskId, setSelectedTaskId] = useState<string>(FINTECH_TASKS[0].id);
  const currentTask: FintechTask = useMemo(
    () => FINTECH_TASKS.find((t) => t.id === selectedTaskId) || FINTECH_TASKS[0],
    [selectedTaskId]
  );

  const [codeLang, setCodeLang] = useState<"csharp" | "go">("csharp");
  const [activeRound, setActiveRound] = useState<1 | 2 | 3>(1);

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

  useEffect(() => {
    updateGutterWidth();
  }, [activeRound, codeLang, targetCode, updateGutterWidth]);

  // Mastery stars for this task
  const starsEarned = taskMasteryStars[currentTask.id] || 0;

  // Guide Spotlight — pulses the targeted POS device node
  useGuideSpotlight(currentTask.id);

  // Show guided explanation bar before first round attempt
  const [showGuide, setShowGuide] = useState<boolean>(true);

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

    if (activeRound === 1) {
      setTypedCode("");
    } else if (activeRound === 2) {
      setTypedCode(clozeTemplate);
    } else if (activeRound === 3) {
      setTypedCode("");
    }
  }, [activeRound, codeLang, clozeTemplate, currentTask.id]);

  // ── Round 1: Trace typing mechanics ──────────────────────────
  const handleTraceChange = useCallback(
    (input: string) => {
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
          if (currentTask.id === "task-pos-batch-settlement") {
            audioFx.playPrinterSound();
          } else if (currentTask.id === "task-pos-pin-lockout") {
            audioFx.playAlarmSound();
          }
          setTaskMastery(currentTask.id, 1);
          addXp(15);
        }
      }
    },
    [targetCode, currentTask.id, setTaskMastery, addXp]
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

    const before: VirtualPosState = { ...posState };
    const result = await executePosScriptAsync(typedCode, before);
    applyPosExecution(result.newState);

    const validation = currentTask.validate(before, result.newState, result, typedCode);

    if (validation.passed) {
      setHasError(false);
      setRoundCompleted(true);
      audioFx.playSuccessFanfare();
      if (currentTask.id === "task-pos-batch-settlement") {
        audioFx.playPrinterSound();
      } else if (currentTask.id === "task-pos-pin-lockout") {
        audioFx.playAlarmSound();
      }
      setTaskMastery(currentTask.id, 2);
      addXp(20);
      setFeedback(t(currentTask.successKey));
    } else {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(t(validation.messageKey || currentTask.hintKey));
    }
  }, [typedCode, posState, currentTask, applyPosExecution, setTaskMastery, addXp, t]);

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
      audioFx.playSuccessFanfare();
      if (currentTask.id === "task-pos-batch-settlement") {
        audioFx.playPrinterSound();
      } else if (currentTask.id === "task-pos-pin-lockout") {
        audioFx.playAlarmSound();
      }
      setTaskMastery(currentTask.id, 3);
      addXp(50);
      setFeedback(t("codegym.masteryComplete"));

      if (currentTask.id === "task-pos-dependency-injection") {
        setPosVictoryModalOpen(true);
      }
    } else {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(t(validation.messageKey || currentTask.hintKey));
    }
  }, [timeLeft, posState, typedCode, currentTask, applyPosExecution, setTaskMastery, addXp, setPosVictoryModalOpen, t]);

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
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        className={taskStars >= s ? "text-amber-400" : "text-gray-300 opacity-40"}
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
            {allFintechCompleted && (
              <button
                onClick={() => {
                  audioFx.playSuccessFanfare();
                  setPosVictoryModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-display font-extrabold text-xs shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Отримати сертифікат модуля"
              >
                <Trophy size={14} className="text-stone-900" />
                <span>Сертифікат</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper border border-paper-border shadow-xs">
              <span className="text-xs font-display font-bold text-ink-muted mr-1">
                {t("codegym.starsLabel")}:
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
            { round: 1, label: t("codegym.round1Badge"), desc: "Сліпий трафарет" },
            { round: 2, label: t("codegym.round2Badge"), desc: "Прогалини (Cloze)" },
            { round: 3, label: t("codegym.round3Badge"), desc: "Спринт (15с)" },
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
                    ? t("codegym.round1Desc")
                    : activeRound === 2
                    ? t("codegym.round2Desc")
                    : t("codegym.round3Desc"))}
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
                    <span>{`Почати спринт (${sprintTimeLimit}с)`}</span>
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

            {/* Next Round Button after Win */}
            {roundCompleted && activeRound < 3 && (
              <button
                onClick={() => {
                  audioFx.playRelayClick();
                  setActiveRound((prev) => (prev + 1) as 1 | 2 | 3);
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md animate-pulse"
              >
                <span>{t("codegym.nextRoundBtn")}</span>
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
