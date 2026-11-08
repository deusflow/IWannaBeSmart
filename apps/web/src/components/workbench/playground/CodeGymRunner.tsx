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
  Flame,
  Layers,
  ShieldAlert,
  Lock,
} from "lucide-react";
import {
  FINTECH_TASKS,
  executePosScriptAsync,
  type FintechTask,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../utils/audioFx";
import { GuidedStepBar } from "./GuidedStepBar";
import { useGuideSpotlight } from "../../../hooks/useGuideSpotlight";
import { ProjectExplorerBar } from "./ProjectExplorerBar";
import { useCodeGymSession } from "./useCodeGymSession";
import { CodeGymEditor } from "./CodeGymEditor";
import { getStationCheckpoint } from "../../../utils/checkpointManager";
import {
  PredictObserveExplainModal,
  FirmwareLogicBuilderModal,
  StationCrashTestGateModal,
} from "../labs";

export const CodeGymRunner: React.FC = () => {
  const { t } = useTranslation();
  const {
    posState,
    applyPosExecution,
    resetPosState,
    taskMasteryStars,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    setPosVictoryModalOpen,
    targetTaskId,
    setTargetTaskId,
  } = useWorkbenchStore(
    useShallow((s) => ({
      posState: s.posState,
      applyPosExecution: s.applyPosExecution,
      resetPosState: s.resetPosState,
      taskMasteryStars: s.taskMasteryStars,
      setTaskMastery: s.setTaskMastery,
      saveTaskProgress: s.saveTaskProgress,
      completeCodingTask: s.completeCodingTask,
      addXp: s.addXp,
      setPosVictoryModalOpen: s.setPosVictoryModalOpen,
      targetTaskId: s.targetTaskId,
      setTargetTaskId: s.setTargetTaskId,
    }))
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string>(() => {
    const cp = getStationCheckpoint("pos");
    if (cp?.taskId && FINTECH_TASKS.some((t) => t.id === cp.taskId)) {
      return cp.taskId;
    }
    return FINTECH_TASKS[0].id;
  });
  const currentTask: FintechTask = useMemo(
    () => FINTECH_TASKS.find((t) => t.id === selectedTaskId) || FINTECH_TASKS[0],
    [selectedTaskId]
  );

  const starsEarned = taskMasteryStars[currentTask.id] || 0;

  const [isPoeModalOpen, setIsPoeModalOpen] = useState(false);
  const [isLogicBuilderOpen, setIsLogicBuilderOpen] = useState(false);
  const [isCrashGateOpen, setIsCrashGateOpen] = useState(false);

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
    isTheoryUnlocked,
    unlockPractice,
  } = useCodeGymSession<FintechTask, "csharp" | "go">({
    currentTask,
    initialLang: "csharp",
    starsEarned,
    stationId: "pos",
    onRoundComplete: async (round, code, stats) => {
      const targetStars = round ?? 1;
      const currentStars = taskMasteryStars[currentTask.id] || 0;
      setTaskMastery(currentTask.id, targetStars, stats?.wpm);
      saveTaskProgress(currentTask.id, targetStars, stats?.wpm);
      completeCodingTask(currentTask.id);
      if (targetStars > currentStars) {
        addXp((targetStars - currentStars) * 15);
      }
      if (code) {
        await runPosExecution(code);
      }
      const allCompleted = FINTECH_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setPosVictoryModalOpen(true);
        }, 1200);
      }
    },
  });

  const [forceTheoryExpanded, setForceTheoryExpanded] = useState<boolean | undefined>(undefined);

  const handleOpenTheory = useCallback(() => {
    setForceTheoryExpanded(true);
    unlockPractice();
    const el = document.getElementById("guided-step-bar-container");
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [unlockPractice]);

  const handleSelectTask = useCallback(
    (taskId: string) => {
      if (taskId === selectedTaskId) return;
      audioFx.playRelayClick();
      setSelectedTaskId(taskId);
      setActiveRound(1);
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
    [selectedTaskId, resetPosState, setActiveRound, setShowTooltip, setShowTransferHint]
  );

  useEffect(() => {
    if (targetTaskId) {
      const exists = FINTECH_TASKS.some((t) => t.id === targetTaskId);
      if (exists) {
        handleSelectTask(targetTaskId);
        setTargetTaskId(null);
      }
    }
  }, [targetTaskId, handleSelectTask, setTargetTaskId]);

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
      const currentStars = taskMasteryStars[currentTask.id] || 0;
      setTaskMastery(currentTask.id, 2);
      saveTaskProgress(currentTask.id, 2);
      completeCodingTask(currentTask.id);
      if (2 > currentStars) {
        addXp((2 - currentStars) * 15);
      }
      setFeedback(t(currentTask.successKey));

      const allCompleted = FINTECH_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setPosVictoryModalOpen(true);
        }, 1200);
      }
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
  }, [typedCode, runPosExecution, currentTask, posState, setHasError, setRoundCompleted, setRoundStats, setTaskMastery, saveTaskProgress, completeCodingTask, addXp, setFeedback, t, taskMasteryStars, setPosVictoryModalOpen]);

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
      const currentStars = taskMasteryStars[currentTask.id] || 0;
      setTaskMastery(currentTask.id, 3, calculatedWpm);
      saveTaskProgress(currentTask.id, 3, calculatedWpm);
      completeCodingTask(currentTask.id);
      if (3 > currentStars) {
        addXp((3 - currentStars) * 15);
      }
      setFeedback(t("codegym.round3Complete", " Спринт пройдено! Ідеальна швидкість та точність."));

      const allCompleted = FINTECH_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setPosVictoryModalOpen(true);
        }, 1200);
      }
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
  }, [
    typedCode,
    targetCode,
    runPosExecution,
    currentTask,
    posState,
    roundStartTimeRef,
    setHasError,
    setRoundCompleted,
    setRoundStats,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    setFeedback,
    taskMasteryStars,
    setPosVictoryModalOpen,
    t,
  ]);

  const handleRunTransfer = useCallback(async () => {
    const res = await runPosExecution(typedCode);

    const passed = currentTask.transferVariant
      ? currentTask.transferVariant.validate(posState, res.newState, typedCode, res)
      : currentTask.validate(posState, res.newState, res, typedCode).passed;

    if (passed) {
      setHasError(false);
      setRoundCompleted(true);
      setRoundStats({ wpm: 0, accuracy: 100 });
      audioFx.playSuccessFanfare();
      const currentStars = taskMasteryStars[currentTask.id] || 0;
      setTaskMastery(currentTask.id, 4);
      saveTaskProgress(currentTask.id, 4);
      completeCodingTask(currentTask.id);
      if (4 > currentStars) {
        addXp((4 - currentStars) * 15);
      }
      setFeedback(t("codegym.round4Complete", " Місія варіації виконана! Ви здобули 4-ту зірку майстра!"));

      const allCompleted = FINTECH_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setPosVictoryModalOpen(true);
        }, 1200);
      }
    } else {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(res.error || t(currentTask.hintKey));
    }
  }, [
    typedCode,
    runPosExecution,
    currentTask,
    posState,
    setHasError,
    setRoundCompleted,
    setRoundStats,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    setFeedback,
    taskMasteryStars,
    setPosVictoryModalOpen,
    t,
  ]);

  const handleVerifyBugfix = useCallback(async () => {
    const res = await runPosExecution(typedCode);
    const validation = currentTask.validate(posState, res.newState, res, typedCode);

    if (validation.passed) {
      setHasError(false);
      setRoundCompleted(true);
      setRoundStats({ wpm: 0, accuracy: 100 });
      audioFx.playSuccessFanfare();
      const currentStars = taskMasteryStars[currentTask.id] || 0;
      setTaskMastery(currentTask.id, 1);
      saveTaskProgress(currentTask.id, 1);
      completeCodingTask(currentTask.id);
      if (1 > currentStars) {
        addXp(15);
      }
      setFeedback(
        validation.messageKey
          ? t(validation.messageKey)
          : t("playground.defectResolvedSuccess", "✅ Дефект успішно усунено! Прилад працює у штатному режимі (OPERATIONAL).")
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
  }, [typedCode, runPosExecution, currentTask, posState, setHasError, setRoundCompleted, setRoundStats, setTaskMastery, saveTaskProgress, completeCodingTask, addXp, setFeedback, taskMasteryStars, t]);

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
      <div className="p-4 rounded-2xl bg-white border border-black/[0.07] shadow-porcelain space-y-3.5">
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
                    ? "bg-[#252932] border-[#252932] text-white shadow-sm"
                    : "bg-white hover:bg-slate-50 border-black/[0.06] hover:border-black/[0.14] text-obsidian shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] font-bold uppercase ${isCurrent ? "text-[#C5A059]" : "text-slate-500"}`}>
                    #{idx + 1} POS
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4].map((s) => (
                      <span
                        key={s}
                        className={
                          taskStars >= s
                            ? s === 4
                              ? "text-cyan-400 font-bold text-[10px]"
                              : "text-[#C5A059] text-[10px]"
                            : "text-slate-300 opacity-40 text-[10px]"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`text-xs font-bold truncate mt-1 ${isCurrent ? "text-white" : "text-obsidian"}`}>
                  {t(task.titleKey)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Task Title & Stars Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-black/[0.06] flex items-center justify-center text-[#252932] shadow-2xs">
              <Zap size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-black/[0.06]">
                  Fintech POS Gym
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {t(currentTask.conceptKey)}
                </span>
                <button
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="w-5 h-5 rounded-full bg-slate-100 border border-black/[0.08] hover:border-black/[0.18] text-slate-700 text-[11px] font-mono font-extrabold flex items-center justify-center transition-colors cursor-pointer"
                  title={t("common.simpleExplanation", "Простими словами")}
                  aria-label={t("common.simpleExplanation", "Простими словами")}
                >
                  ?
                </button>
              </div>
              <h3 className="font-display font-bold text-base text-obsidian mt-0.5">
                {t(currentTask.titleKey)}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              data-testid="lab-poe-btn"
              onClick={() => {
                audioFx.playRelayClick();
                setIsPoeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-amber-900 font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
              title={t("labs.poe.btnTooltip", "Живий симулятор: Що вибухне? (Predict-Observe-Explain)")}
            >
              <Flame size={13} className="text-amber-700" />
              <span className="hidden sm:inline">{t("labs.poe.btnLabel", "Що вибухне?")}</span>
            </button>

            <button
              data-testid="lab-logic-btn"
              onClick={() => {
                audioFx.playRelayClick();
                setIsLogicBuilderOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-black/[0.08] text-slate-700 font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
              title={t("labs.logic.btnTooltip", "Конструктор прошивки (No-Typing Logic Lab)")}
            >
              <Layers size={13} className="text-slate-600" />
              <span className="hidden sm:inline">{t("labs.logic.btnLabel", "Конструктор")}</span>
            </button>

            <button
              data-testid="lab-crash-btn"
              onClick={() => {
                if (!allPosTasksCompleted) {
                  audioFx.playErrorBuzz();
                  return;
                }
                audioFx.playWarRoomSiren();
                setIsCrashGateOpen(true);
              }}
              disabled={!allPosTasksCompleted}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all shadow-2xs ${
                allPosTasksCompleted
                  ? "bg-[#252932] hover:bg-[#1A1D24] text-white border-black/[0.12] cursor-pointer active:scale-95"
                  : "bg-slate-100/70 border-black/[0.06] text-slate-400 cursor-not-allowed opacity-60"
              }`}
              title={
                allPosTasksCompleted
                  ? t("labs.crash.btnTooltip", "Атестаційний краш-тест станції (Certification Drill)")
                  : t("labs.crash.btnLockedTooltip", "Краш-тест заблоковано: спочатку вирішіть усі завдання станції")
              }
            >
              {allPosTasksCompleted ? (
                <ShieldAlert size={13} className="text-[#C5A059]" />
              ) : (
                <Lock size={13} className="text-slate-400" />
              )}
              <span className="hidden sm:inline">{t("labs.crash.btnLabel", "Краш-тест")}</span>
            </button>

            {allPosTasksCompleted && (
              <button
                data-testid="station-cert-btn"
                onClick={() => {
                  audioFx.playSuccessFanfare();
                  setPosVictoryModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-[#C5A059] border border-[#C5A059]/40 font-display font-extrabold text-xs shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={t("codegym.posCertTooltip", "Отримати сертифікат станції POS")}
              >
                <Trophy size={14} className="text-[#C5A059]" />
                <span>{t("codegym.certificateBtn", "Сертифікат")}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] shadow-2xs">
              <span className="text-xs font-display font-bold text-slate-500 mr-1">
                {t("codegym.starsLabel", "Майстерність")}:
              </span>
              {[1, 2, 3, 4].map((starIdx) => (
                <span
                  key={starIdx}
                  title={starIdx === 4 ? "4-Star Master Star (Transfer)" : `Star ${starIdx}`}
                  className="inline-flex items-center"
                >
                  <Star
                    size={16}
                    className={`transition-all duration-300 ${
                      starsEarned >= starIdx
                        ? starIdx === 4
                          ? "text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] scale-115"
                          : "text-[#C5A059] fill-[#C5A059] scale-110"
                        : "text-slate-200"
                    }`}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Parchment Tooltip popover */}
        {showTooltip && (
          <div className="p-3.5 rounded-xl bg-white border border-black/[0.08] text-obsidian text-xs font-sans leading-relaxed shadow-luxury animate-in fade-in flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="font-mono font-bold text-[10px] uppercase text-slate-500 mb-1">
                {t("common.simpleExplanation", "Простими словами")}:
              </div>
              <p>{t(currentTask.descKey)}</p>
            </div>
            <button
              onClick={() => {
                audioFx.playRelayClick();
                setShowTooltip(false);
              }}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-obsidian transition-colors cursor-pointer shrink-0"
              title={t("common.close", "Закрити")}
              aria-label={t("common.close", "Закрити")}
            >
              <X size={14} />
            </button>
          </div>
        )}

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
            defaultExpanded={false}
            forceExpanded={forceTheoryExpanded}
            isTheoryUnlocked={isTheoryUnlocked}
            activeRound={activeRound}
            onUnlockPractice={unlockPractice}
            onStartPractice={() => {
              unlockPractice();
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
            { round: 3, label: t("codegym.round3Badge", "Раунд 3"), desc: `${t("codegym.round3DescShort", "Спринт")} (${sprintLimit}${t("codegym.secondsUnit", "с")})` },
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
                    ? "bg-[#252932] border-[#252932] text-white shadow-sm"
                    : isUnlocked
                    ? "bg-white hover:bg-slate-50 border-black/[0.06] hover:border-black/[0.14] text-obsidian shadow-2xs"
                    : "bg-slate-50/40 border-black/[0.04] text-slate-400 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-[11px] uppercase">
                    {label}
                  </span>
                  {starsEarned >= round && (
                    <span className={round === 4 ? "text-cyan-400 text-xs drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" : "text-[#C5A059] text-xs"}>
                      ★
                    </span>
                  )}
                </div>
                <div className={`text-[10px] truncate mt-0.5 ${isActive ? "text-slate-300" : "text-slate-500"}`}>
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
        stationId="pos"
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
        isTheoryUnlocked={isTheoryUnlocked}
        onOpenTheory={handleOpenTheory}
        onUnlockPractice={unlockPractice}
      />

      <PredictObserveExplainModal
        isOpen={isPoeModalOpen}
        onClose={() => setIsPoeModalOpen(false)}
        stationId="pos"
      />

      <FirmwareLogicBuilderModal
        isOpen={isLogicBuilderOpen}
        onClose={() => setIsLogicBuilderOpen(false)}
        stationId="pos"
      />

      <StationCrashTestGateModal
        isOpen={isCrashGateOpen}
        onClose={() => setIsCrashGateOpen(false)}
        stationId="pos"
        onPassed={() => {
          if (allPosTasksCompleted) {
            setPosVictoryModalOpen(true);
          }
        }}
      />
    </div>
  );
};
