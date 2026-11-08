/**
 * @file apps/web/src/components/workbench/playground/BanditCodeGymRunner.tsx
 * @description 3-Star Code Gym muscle memory engine for Station 06: Cyber Bandit Lab
 * Trace -> Cloze -> Sprint -> Architecture for Tasks 1..6 (C# & Go)
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Trophy,
  X,
  Shield,
  Flame,
  ShieldAlert,
  Lock,
} from "lucide-react";
import {
  BANDIT_TASKS,
  executeBanditScript,
  type BanditTask,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../utils/audioFx";
import { ProjectExplorerBar } from "./ProjectExplorerBar";
import { useCodeGymSession } from "./useCodeGymSession";
import { CodeGymEditor } from "./CodeGymEditor";
import { GuidedStepBar } from "./GuidedStepBar";
import { getStationCheckpoint } from "../../../utils/checkpointManager";
import {
  PredictObserveExplainModal,
  StationCrashTestGateModal,
} from "../labs";

export const BanditCodeGymRunner: React.FC = () => {
  const { t } = useTranslation();
  const {
    banditState,
    taskMasteryStars,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    setBanditVictoryModalOpen,
    submitFlagDirect,
    resetBanditStationToLevel,
    targetTaskId,
    setTargetTaskId,
  } = useWorkbenchStore(
    useShallow((s) => ({
      banditState: s.banditState,
      taskMasteryStars: s.taskMasteryStars,
      setTaskMastery: s.setTaskMastery,
      saveTaskProgress: s.saveTaskProgress,
      completeCodingTask: s.completeCodingTask,
      addXp: s.addXp,
      setBanditVictoryModalOpen: s.setBanditVictoryModalOpen,
      submitFlagDirect: s.submitFlagDirect,
      resetBanditStationToLevel: s.resetBanditStationToLevel,
      targetTaskId: s.targetTaskId,
      setTargetTaskId: s.setTargetTaskId,
    }))
  );


  const [selectedTaskId, setSelectedTaskId] = useState<string>(() => {
    const cp = getStationCheckpoint("bandit");
    if (cp?.taskId && BANDIT_TASKS.some((t) => t.id === cp.taskId)) {
      return cp.taskId;
    }
    return BANDIT_TASKS[0].id;
  });
  const currentTask: BanditTask = useMemo(
    () => BANDIT_TASKS.find((t) => t.id === selectedTaskId) || BANDIT_TASKS[0],
    [selectedTaskId]
  );

  const starsEarned = taskMasteryStars[currentTask.id] || 0;
  const [isPoeModalOpen, setIsPoeModalOpen] = useState(false);
  const [isCrashGateOpen, setIsCrashGateOpen] = useState(false);

  const currentTaskIndex = BANDIT_TASKS.findIndex((t) => t.id === currentTask.id);
  const nextTask =
    currentTaskIndex >= 0 && currentTaskIndex < BANDIT_TASKS.length - 1
      ? BANDIT_TASKS[currentTaskIndex + 1]
      : null;

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
  } = useCodeGymSession({
    currentTask: {
      ...currentTask,
      initialCode: {
        csharp: currentTask.targetCode.csharp,
        go: currentTask.targetCode.go,
      },
      clozeTemplate: currentTask.clozeTemplate,
    },
    starsEarned,
    stationId: "bandit",
    onRoundComplete: async (round, _code, stats) => {
      const targetStars = round ?? 1;
      const currentStars = taskMasteryStars[currentTask.id] || 0;
      setTaskMastery(currentTask.id, targetStars, stats?.wpm);
      saveTaskProgress(currentTask.id, targetStars, stats?.wpm);
      completeCodingTask(currentTask.id);
      if (targetStars > currentStars) {
        addXp((targetStars - currentStars) * 25);
      }
      const allCompleted = BANDIT_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setBanditVictoryModalOpen(true);
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
      const nextT = BANDIT_TASKS.find((t) => t.id === taskId);
      if (nextT) {
        resetBanditStationToLevel(nextT.order);
      }
    },
    [selectedTaskId, setActiveRound, setShowTooltip, setShowTransferHint, resetBanditStationToLevel]
  );

  // Auto-switch task if requested from profile analytics
  useEffect(() => {
    if (targetTaskId && BANDIT_TASKS.some((t) => t.id === targetTaskId)) {
      handleSelectTask(targetTaskId);
      setTargetTaskId(null);
    }
  }, [targetTaskId, setTargetTaskId, handleSelectTask]);

  const fileName = useMemo(
    () => (codeLang === "go" ? "security_defense.go" : "SecurityMiddleware.cs"),
    [codeLang]
  );

  const allBanditTasksCompleted = useMemo(() => {
    return BANDIT_TASKS.every((task) => (taskMasteryStars[task.id] || 0) >= 1);
  }, [taskMasteryStars]);

  // ── Verification Handlers ──
  const handleVerify = useCallback(async () => {
    if (activeRound === 2) {
      const isUnfilled = typedCode.includes("/*") || typedCode.includes("___");
      if (isUnfilled) {
        setHasError(true);
        audioFx.playErrorBuzz();
        setFeedback(t("codegym.fillBlanksPrompt", "Заповніть усі прогалини перед перевіркою!"));
        return;
      }
    }

    const scriptRes = executeBanditScript(typedCode, codeLang, currentTask.id);
    const validation = currentTask.validate(
      currentTask.initialState,
      banditState,
      scriptRes,
      typedCode
    );

    if (validation.passed) {
      audioFx.playSuccessFanfare();
      setHasError(false);
      setFeedback(t(validation.messageKey || currentTask.successKey));
      setRoundCompleted(true);

      if (scriptRes.flagAwarded || currentTask.flag) {
        submitFlagDirect(scriptRes.flagAwarded || currentTask.flag);
      }

      const targetStars = activeRound;
      let calculatedWpm: number | undefined;
      if (activeRound === 3) {
        const elapsedMinutes = Math.max(0.04, (Date.now() - (roundStartTimeRef.current || Date.now())) / 60000);
        calculatedWpm = Math.round((targetCode.length / 5) / elapsedMinutes);
        setRoundStats({ wpm: calculatedWpm, accuracy: 100 });
      }

      const currentStars = taskMasteryStars[currentTask.id] || 0;
      setTaskMastery(currentTask.id, targetStars, calculatedWpm);
      saveTaskProgress(currentTask.id, targetStars, calculatedWpm);
      completeCodingTask(currentTask.id);
      if (targetStars > currentStars) {
        addXp((targetStars - currentStars) * 25);
      }

      // Check if all 6 Bandit tasks are completed
      const allCompleted = BANDIT_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setBanditVictoryModalOpen(true);
        }, 1200);
      }
    } else {
      audioFx.playErrorBuzz();
      setHasError(true);
      setFeedback(t(validation.messageKey || "bandit.validationFailed", scriptRes.output || "Security code verification failed."));
    }
  }, [
    activeRound,
    typedCode,
    targetCode,
    codeLang,
    currentTask,
    banditState,
    roundStartTimeRef,
    setRoundStats,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    setBanditVictoryModalOpen,
    submitFlagDirect,
    setHasError,
    setFeedback,
    setRoundCompleted,
    taskMasteryStars,
    t,
  ]);

  // Keyboard shortcut listener (Ctrl/Cmd + Enter to verify / advance, Escape to reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (roundCompleted) {
          if (activeRound < 4) {
            audioFx.playRelayClick();
            setActiveRound((prev) => (prev + 1) as 1 | 2 | 3 | 4);
          } else if (nextTask) {
            audioFx.playRelayClick();
            handleSelectTask(nextTask.id);
          }
        } else {
          handleVerify();
        }
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {BANDIT_TASKS.map((task, idx) => {
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
                  <span
                    className={`font-mono text-[10px] font-bold uppercase ${
                      isCurrent ? "text-[#C5A059]" : "text-slate-500"
                    }`}
                  >
                    #{idx + 1} BANDIT
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
                <div
                  className={`text-xs font-bold truncate mt-1 ${
                    isCurrent ? "text-white" : "text-obsidian"
                  }`}
                >
                  {t(task.titleKey, "Security Objective")}
                </div>
              </button>
            );
          })}
        </div>

        {/* Task Title & Stars Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-black/[0.06] flex items-center justify-center text-[#252932] shadow-2xs">
              <Shield size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-black/[0.06]">
                  Cyber Bandit Gym
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  FLAG: {currentTask.flag}
                </span>
                <button
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="w-5 h-5 rounded-full bg-slate-100 border border-black/[0.08] hover:border-black/[0.18] text-slate-700 text-[11px] font-mono font-extrabold flex items-center justify-center transition-colors cursor-pointer"
                  title={t("common.simpleExplanation", "Підказка безпеки")}
                  aria-label={t("common.simpleExplanation", "Підказка безпеки")}
                >
                  ?
                </button>
              </div>
              <h3 className="font-display font-bold text-base text-obsidian mt-0.5">
                {t(currentTask.titleKey, "Security Objective")}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
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
              onClick={() => {
                if (!allBanditTasksCompleted) {
                  audioFx.playErrorBuzz();
                  return;
                }
                audioFx.playWarRoomSiren();
                setIsCrashGateOpen(true);
              }}
              disabled={!allBanditTasksCompleted}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all shadow-2xs ${
                allBanditTasksCompleted
                  ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-600 cursor-pointer active:scale-95"
                  : "bg-slate-100 border-black/[0.06] text-slate-400 cursor-not-allowed opacity-60"
              }`}
              title={
                allBanditTasksCompleted
                  ? t("labs.crash.btnTooltip", "Атестаційний краш-тест станції (Certification Drill)")
                  : t("labs.crash.btnLockedTooltip", "Краш-тест заблоковано: спочатку вирішіть усі завдання станції")
              }
            >
              {allBanditTasksCompleted ? (
                <ShieldAlert size={13} className="text-white" />
              ) : (
                <Lock size={13} className="text-slate-400" />
              )}
              <span className="hidden sm:inline">{t("labs.crash.btnLabel", "Краш-тест")}</span>
            </button>

            {allBanditTasksCompleted && (
              <button
                onClick={() => setBanditVictoryModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-[#C5A059] border border-[#C5A059]/40 font-display font-extrabold text-xs shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Trophy size={14} className="text-[#C5A059]" />
                <span>{t("bandit.ui.certButton", "Certificate")}</span>
              </button>
            )}

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-black/[0.06]">
              <button
                onClick={() => setCodeLang("csharp")}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                  codeLang === "csharp"
                    ? "bg-[#252932] text-white shadow-2xs"
                    : "text-slate-600 hover:text-obsidian"
                }`}
              >
                C#
              </button>
              <button
                onClick={() => setCodeLang("go")}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                  codeLang === "go"
                    ? "bg-[#252932] text-white shadow-2xs"
                    : "text-slate-600 hover:text-obsidian"
                }`}
              >
                Go
              </button>
            </div>
          </div>
        </div>

        {/* Parchment Tooltip popover */}
        {showTooltip && (
          <div className="p-3.5 rounded-xl bg-white border border-black/[0.08] text-obsidian text-xs font-sans leading-relaxed shadow-luxury animate-in fade-in flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="font-mono font-bold text-[10px] uppercase text-slate-500 mb-1">
                {t("common.simpleExplanation", "Підказка безпеки")}:
              </div>
              <p>{t(currentTask.hintKey, currentTask.descKey)}</p>
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

        {/* Guided Step Bar (Teacher Demonstration & Code Breakdown) */}
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
            forceExpanded={forceTheoryExpanded}
            isTheoryUnlocked={isTheoryUnlocked}
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
        isFintech={false}
        stationId="bandit"
      />

      {/* Unified CodeGymEditor Component */}
      <CodeGymEditor
        currentTask={{
          ...currentTask,
          initialCode: {
            csharp: currentTask.targetCode.csharp,
            go: currentTask.targetCode.go,
          },
          clozeTemplate: currentTask.clozeTemplate,
        }}
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
        stationId="bandit"
      />

      <StationCrashTestGateModal
        isOpen={isCrashGateOpen}
        onClose={() => setIsCrashGateOpen(false)}
        stationId="bandit"
        onPassed={() => {
          if (allBanditTasksCompleted) {
            audioFx.playSuccessFanfare();
            setBanditVictoryModalOpen(true);
          }
        }}
      />
    </div>
  );
};
