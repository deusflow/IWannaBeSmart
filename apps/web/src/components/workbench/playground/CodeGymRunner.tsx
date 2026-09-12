/**
 * @file apps/web/src/components/workbench/playground/CodeGymRunner.tsx
 * @description 3-Star Code Gym muscle memory engine: Trace -> Cloze -> Sprint for POS Tasks 1..4
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Star,
  Trophy,
  Zap,
  X,
} from "lucide-react";
import {
  FINTECH_TASKS,
  executePosScriptAsync,
  type FintechTask,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../utils/audioFx";
import { SyntaxAnatomyCard } from "./SyntaxAnatomyCard";
import { GuidedStepBar } from "./GuidedStepBar";
import { useGuideSpotlight } from "../../../hooks/useGuideSpotlight";
import { ProjectExplorerBar } from "./ProjectExplorerBar";
import { useCodeGymSession } from "./useCodeGymSession";
import { CodeGymEditor } from "./CodeGymEditor";

export const CodeGymRunner: React.FC = () => {
  const { t } = useTranslation();
  const {
    posState,
    applyPosExecution,
    resetPosState,
    taskMasteryStars,
    setTaskMastery,
    completeCodingTask,
    addXp,
    setPosVictoryModalOpen,
  } = useWorkbenchStore(
    useShallow((s) => ({
      posState: s.posState,
      applyPosExecution: s.applyPosExecution,
      resetPosState: s.resetPosState,
      taskMasteryStars: s.taskMasteryStars,
      setTaskMastery: s.setTaskMastery,
      completeCodingTask: s.completeCodingTask,
      addXp: s.addXp,
      setPosVictoryModalOpen: s.setPosVictoryModalOpen,
    }))
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string>(FINTECH_TASKS[0].id);
  const currentTask: FintechTask = useMemo(
    () => FINTECH_TASKS.find((t) => t.id === selectedTaskId) || FINTECH_TASKS[0],
    [selectedTaskId]
  );

  const starsEarned = taskMasteryStars[currentTask.id] || 0;

  const currentTaskIndex = FINTECH_TASKS.findIndex((t) => t.id === currentTask.id);
  const nextTask =
    currentTaskIndex >= 0 && currentTaskIndex < FINTECH_TASKS.length - 1
      ? FINTECH_TASKS[currentTaskIndex + 1]
      : null;

  useGuideSpotlight(currentTask.id);

  // ── Execution Helper ──
  const runPosExecution = useCallback(
    async (code: string) => {
      const res = await executePosScriptAsync(code, posState);
      if (res.success) {
        applyPosExecution(res.newState);
      }
      return res;
    },
    [posState, applyPosExecution]
  );

  // ── Unified Code Gym Session ──
  const {
    codeLang,
    setCodeLang,
    activeRound,
    setActiveRound,
    typedCode,
    roundCompleted,
    setRoundCompleted,
    feedback,
    setFeedback,
    hasError,
    setHasError,
    showTooltip,
    setShowTooltip,
    showTheory,
    setShowTheory,
    showTransferHint,
    setShowTransferHint,
    timeLeft,
    isTimerRunning,
    roundStats,
    setRoundStats,
    roundStartTimeRef,
    gutterWidth,
    editorContainerRef,
    targetCode,
    clozeTemplate,
    sprintLimit,
    traceCharsMatched,
    handleCodeChange,
    handleStartSprint,
    handleResetRound,
  } = useCodeGymSession({
    currentTask,
    onRoundComplete: async (_round, code) => {
      setTaskMastery(currentTask.id, 1);
      completeCodingTask(currentTask.id);
      addXp(15);
      await runPosExecution(code);
    },
  });

  const handleSelectTask = useCallback(
    (taskId: string) => {
      if (taskId === selectedTaskId) return;
      audioFx.playRelayClick();
      setSelectedTaskId(taskId);
      setActiveRound(1);
      setShowTheory(false);
      setShowTooltip(false);
      setShowTransferHint(false);
      const nextT = FINTECH_TASKS.find((t) => t.id === taskId);
      if (nextT) {
        resetPosState(nextT.initialState);
        if (nextT.isBugfixTask) {
          audioFx.playAlarmSound();
        }
      }
    },
    [selectedTaskId, resetPosState, setActiveRound, setShowTheory, setShowTooltip, setShowTransferHint]
  );

  const fileName = useMemo(
    () => (codeLang === "go" ? "pos_controller.go" : "POSController.cs"),
    [codeLang]
  );

  const allPosTasksCompleted = useMemo(() => {
    return FINTECH_TASKS.every((task) => (taskMasteryStars[task.id] || 0) >= 1);
  }, [taskMasteryStars]);

  // ── Verification Handlers ──
  const handleVerifyCloze = useCallback(async () => {
    const isUnfilled = typedCode.includes("___");
    if (isUnfilled) {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(t("codegym.fillBlanksPrompt", "Заповніть усі прогалини (___) перед перевіркою!"));
      return;
    }

    const res = await runPosExecution(typedCode);
    const validation = currentTask.validate(posState, res.newState, res, typedCode);

    if (validation.passed) {
      setHasError(false);
      setRoundCompleted(true);
      setRoundStats({ wpm: 0, accuracy: 100 });
      audioFx.playSuccessFanfare();
      setTaskMastery(currentTask.id, 2);
      completeCodingTask(currentTask.id);
      addXp(20);
      setFeedback(t(currentTask.successKey));
    } else {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(
        res.error
          ? res.error
          : validation.messageKey
          ? t(validation.messageKey)
          : t(currentTask.hintKey)
      );
    }
  }, [typedCode, runPosExecution, currentTask, posState, setHasError, setRoundCompleted, setRoundStats, setTaskMastery, completeCodingTask, addXp, setFeedback, t]);

  const handleRunSprint = useCallback(async () => {
    const isMatch = typedCode.trim() === targetCode.trim();
    if (!isMatch) {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(t("codegym.sprintMismatch", "Код не збігається з еталоном. Перевірте кожен символ!"));
      return;
    }

    const res = await runPosExecution(typedCode);
    const validation = currentTask.validate(posState, res.newState, res, typedCode);

    if (validation.passed) {
      setHasError(false);
      setRoundCompleted(true);
      const elapsedMinutes = Math.max(0.04, (Date.now() - (roundStartTimeRef.current || Date.now())) / 60000);
      const calculatedWpm = Math.round((targetCode.length / 5) / elapsedMinutes);
      setRoundStats({ wpm: calculatedWpm, accuracy: 100 });
      audioFx.playSuccessFanfare();
      setTaskMastery(currentTask.id, 3);
      completeCodingTask(currentTask.id);
      addXp(30);
      setFeedback(t("codegym.round3Complete", "🏆 Спринт пройдено! Ідеальна швидкість та точність."));
    } else {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(
        res.error
          ? res.error
          : validation.messageKey
          ? t(validation.messageKey)
          : t(currentTask.hintKey)
      );
    }
  }, [typedCode, targetCode, runPosExecution, currentTask, posState, roundStartTimeRef, setHasError, setRoundCompleted, setRoundStats, setTaskMastery, completeCodingTask, addXp, setFeedback, t]);

  const handleRunTransfer = useCallback(async () => {
    const res = await runPosExecution(typedCode);

    let passed = false;
    if (currentTask.transferVariant) {
      passed = currentTask.transferVariant.validate(posState, res.newState, typedCode, res);
    } else {
      const validation = currentTask.validate(posState, res.newState, res, typedCode);
      passed = validation.passed;
    }

    if (passed) {
      setHasError(false);
      setRoundCompleted(true);
      setRoundStats({ wpm: 0, accuracy: 100 });
      audioFx.playSuccessFanfare();
      setTaskMastery(currentTask.id, 4);
      completeCodingTask(currentTask.id);
      addXp(40);
      setFeedback(t("codegym.round4Complete", "💎 Місія варіації виконана! Ви здобули 4-ту зірку майстра!"));
    } else {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(res.error || t(currentTask.hintKey));
    }
  }, [typedCode, runPosExecution, currentTask, posState, setHasError, setRoundCompleted, setRoundStats, setTaskMastery, completeCodingTask, addXp, setFeedback, t]);

  const handleVerifyBugfix = useCallback(async () => {
    const res = await runPosExecution(typedCode);
    const validation = currentTask.validate(posState, res.newState, res, typedCode);

    if (validation.passed) {
      setHasError(false);
      setRoundCompleted(true);
      setRoundStats({ wpm: 0, accuracy: 100 });
      audioFx.playSuccessFanfare();
      setTaskMastery(currentTask.id, 1);
      completeCodingTask(currentTask.id);
      addXp(30);
      setFeedback(
        validation.messageKey
          ? t(validation.messageKey)
          : "✅ Дефект успішно усунено! Прилад працює у штатному режимі (OPERATIONAL)."
      );
    } else {
      setHasError(true);
      audioFx.playAlarmSound();
      setFeedback(
        res.error
          ? res.error
          : validation.messageKey
          ? t(validation.messageKey)
          : t(currentTask.hintKey)
      );
    }
  }, [typedCode, codeLang, runPosExecution, currentTask, posState, setHasError, setRoundCompleted, setRoundStats, setTaskMastery, completeCodingTask, addXp, setFeedback, t]);

  const handleVerify = useCallback(() => {
    if (currentTask.isBugfixTask && activeRound === 1) {
      handleVerifyBugfix();
    } else if (activeRound === 2) {
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
  }, [currentTask.isBugfixTask, activeRound, isTimerRunning, handleVerifyBugfix, handleVerifyCloze, handleStartSprint, handleRunSprint, handleRunTransfer]);

  // Hotkeys: Ctrl+Enter / Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
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
        handleVerify();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleResetRound();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [roundCompleted, activeRound, nextTask, handleVerify, handleSelectTask, handleResetRound, setActiveRound]);

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none max-w-4xl mx-auto">
      {/* ── Top Header: Task Selector, Title & Mastery Stars ── */}
      <div className="p-4 rounded-2xl bg-[#EFEAE1] border border-paper-border shadow-paper-sm space-y-3">
        {/* Task Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FINTECH_TASKS.map((task, idx) => {
            const isCurrent = task.id === currentTask.id;
            const taskStars = taskMasteryStars[task.id] || 0;
            return (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#1E2024] border-[#1E2024] text-white shadow-md"
                    : "bg-paper/70 hover:bg-paper border-paper-border text-ink hover:border-accent-blue/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] font-bold uppercase ${isCurrent ? "text-amber-400" : "text-ink-muted"}`}>
                    #{idx + 1} POS
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        className={taskStars >= s ? "text-amber-400 text-[10px]" : "text-gray-300 opacity-40 text-[10px]"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`text-xs font-bold truncate mt-1 ${isCurrent ? "text-white" : "text-ink"}`}>
                  {t(task.titleKey)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Task Title & Stars Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-blue/20 border border-accent-blue/40 flex items-center justify-center text-accent-blue">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-accent-blue/20 text-accent-blue border border-accent-blue/30">
                  Fintech POS Gym
                </span>
                <span className="text-xs font-mono font-bold text-ink-muted">
                  {t(currentTask.conceptKey)}
                </span>
                <button
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="w-5 h-5 rounded-full bg-[#EBE5D8] border border-[#1A1D20]/30 hover:border-[#1A1D20]/60 text-[#1A1D20] text-[11px] font-mono font-extrabold flex items-center justify-center transition-colors cursor-pointer"
                  title={t("common.simpleExplanation", "Простими словами")}
                  aria-label={t("common.simpleExplanation", "Простими словами")}
                >
                  ?
                </button>
              </div>
              <h3 className="font-display font-bold text-base text-ink mt-0.5">
                {t(currentTask.titleKey)}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allPosTasksCompleted && (
              <button
                onClick={() => {
                  audioFx.playSuccessFanfare();
                  setPosVictoryModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-display font-extrabold text-xs shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={t("codegym.posCertTooltip", "Отримати сертифікат станції POS")}
              >
                <Trophy size={14} className="text-stone-900" />
                <span>{t("codegym.certificateBtn", "Сертифікат")}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper border border-paper-border shadow-xs">
              <span className="text-xs font-display font-bold text-ink-muted mr-1">
                {t("codegym.starsLabel", "Майстерність")}:
              </span>
              {[1, 2, 3, 4].map((starIdx) => (
                <span
                  key={starIdx}
                  title={starIdx === 4 ? "4-Star Master Star (Transfer)" : `Star ${starIdx}`}
                  className="inline-flex items-center"
                >
                  <Star
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

        {/* Parchment Tooltip popover */}
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

        {/* Theory & Code Anatomy Card */}
        <div className="pt-0.5">
          <SyntaxAnatomyCard
            taskId={currentTask.id}
            codeLang={codeLang}
            isOpen={showTheory}
            onToggle={() => setShowTheory((p) => !p)}
          />
        </div>

        {/* Guided Step Bar */}
        {currentTask.simpleExplanationKey && (
          <GuidedStepBar
            data={{
              simpleKey: currentTask.simpleExplanationKey,
              engineeringKey: currentTask.engineeringKey || currentTask.simpleExplanationKey,
              taskId: currentTask.id,
              tier: 1,
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
            { round: 1, label: t("codegym.round1Badge", "Раунд 1"), desc: t("codegym.round1DescShort", "Сліпий трафарет") },
            { round: 2, label: t("codegym.round2Badge", "Раунд 2"), desc: t("codegym.round2DescShort", "Прогалини (Cloze)") },
            { round: 3, label: t("codegym.round3Badge", "Раунд 3"), desc: `${t("codegym.round3DescShort", "Спринт")} (${sprintLimit}с)` },
            { round: 4, label: t("codegym.round4Badge", "Раунд 4"), desc: t("codegym.round4DescShort", "Варіація") },
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
                    <span className={round === 4 ? "text-cyan-400 text-xs drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" : "text-amber-400 text-xs"}>
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

      {/* Project Explorer Bar */}
      <ProjectExplorerBar
        currentCode={typedCode || targetCode}
        codeLang={codeLang}
        isFintech={true}
      />

      {/* Unified CodeGymEditor Component */}
      <CodeGymEditor
        currentTask={currentTask}
        codeLang={codeLang}
        onChangeLang={setCodeLang}
        activeRound={activeRound}
        fileName={fileName}
        typedCode={typedCode}
        onChangeCode={handleCodeChange}
        targetCode={targetCode}
        clozeTemplate={clozeTemplate}
        roundCompleted={roundCompleted}
        hasError={hasError}
        feedback={feedback}
        timeLeft={timeLeft}
        isTimerRunning={isTimerRunning}
        roundStats={roundStats}
        traceCharsMatched={traceCharsMatched}
        gutterWidth={gutterWidth}
        editorContainerRef={editorContainerRef}
        showTransferHint={showTransferHint}
        onToggleTransferHint={() => setShowTransferHint((prev) => !prev)}
        onResetRound={handleResetRound}
        onStartSprint={handleStartSprint}
        onVerify={handleVerify}
        onAdvanceRound={() => {
          audioFx.playRelayClick();
          setActiveRound((prev) => (prev + 1) as 1 | 2 | 3 | 4);
        }}
        onNextTask={() => {
          if (nextTask) {
            audioFx.playRelayClick();
            handleSelectTask(nextTask.id);
          }
        }}
        nextTaskAvailable={Boolean(nextTask)}
      />
    </div>
  );
};
