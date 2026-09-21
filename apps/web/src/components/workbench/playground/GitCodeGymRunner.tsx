/**
 * @file apps/web/src/components/workbench/playground/GitCodeGymRunner.tsx
 * @description 3-Star Code Gym muscle memory engine for Station 05: Git Time Machine
 * Trace -> Cloze -> Sprint -> DevOps Architecture for Tasks 1..6 (C# & Go)
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Star,
  Trophy,
  X,
  GitBranch,
} from "lucide-react";
import {
  GIT_TASKS,
  executeGitScript,
  type GitTask,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../utils/audioFx";
import { ProjectExplorerBar } from "./ProjectExplorerBar";
import { useCodeGymSession } from "./useCodeGymSession";
import { CodeGymEditor } from "./CodeGymEditor";
import { GuidedStepBar } from "./GuidedStepBar";

export const GitCodeGymRunner: React.FC = () => {
  const { t } = useTranslation();
  const {
    gitRepoState,
    taskMasteryStars,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    setGitVictoryModalOpen,
    resetGitRepo,
    targetTaskId,
    setTargetTaskId,
  } = useWorkbenchStore(
    useShallow((s) => ({
      gitRepoState: s.gitRepoState,
      taskMasteryStars: s.taskMasteryStars,
      setTaskMastery: s.setTaskMastery,
      saveTaskProgress: s.saveTaskProgress,
      completeCodingTask: s.completeCodingTask,
      addXp: s.addXp,
      setGitVictoryModalOpen: s.setGitVictoryModalOpen,
      resetGitRepo: s.resetGitRepo,
      targetTaskId: s.targetTaskId,
      setTargetTaskId: s.setTargetTaskId,
    }))
  );


  const [selectedTaskId, setSelectedTaskId] = useState<string>(GIT_TASKS[0].id);
  const currentTask: GitTask = useMemo(
    () => GIT_TASKS.find((t) => t.id === selectedTaskId) || GIT_TASKS[0],
    [selectedTaskId]
  );

  const starsEarned = taskMasteryStars[currentTask.id] || 0;

  const currentTaskIndex = GIT_TASKS.findIndex((t) => t.id === currentTask.id);
  const nextTask =
    currentTaskIndex >= 0 && currentTaskIndex < GIT_TASKS.length - 1
      ? GIT_TASKS[currentTaskIndex + 1]
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
    onRoundComplete: async (round) => {
      const targetStars = round ?? 1;
      setTaskMastery(currentTask.id, targetStars);
      saveTaskProgress(currentTask.id, targetStars);
      completeCodingTask(currentTask.id);
      addXp(targetStars * 15);
      const allCompleted = GIT_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setGitVictoryModalOpen(true);
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
      const nextT = GIT_TASKS.find((t) => t.id === taskId);
      if (nextT) {
        resetGitRepo(nextT.initialState);
      }
    },
    [selectedTaskId, setActiveRound, setShowTooltip, setShowTransferHint, resetGitRepo]
  );

  // Auto-switch task if requested from profile analytics
  useEffect(() => {
    if (targetTaskId && GIT_TASKS.some((t) => t.id === targetTaskId)) {
      handleSelectTask(targetTaskId);
      setTargetTaskId(null);
    }
  }, [targetTaskId, setTargetTaskId, handleSelectTask]);

  const fileName = useMemo(
    () => (codeLang === "go" ? "git_automation.go" : "GitWorkflow.cs"),
    [codeLang]
  );

  const allGitTasksCompleted = useMemo(() => {
    return GIT_TASKS.every((task) => (taskMasteryStars[task.id] || 0) >= 1);
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

    const scriptRes = executeGitScript(typedCode, codeLang, gitRepoState);
    const validation = currentTask.validate(
      currentTask.initialState,
      scriptRes.finalState,
      scriptRes,
      typedCode
    );

    if (validation.passed) {
      audioFx.playSuccessFanfare();
      setHasError(false);
      setFeedback(t(validation.messageKey || currentTask.successKey));
      setRoundCompleted(true);
      if (scriptRes?.finalState) {
        useWorkbenchStore.setState({ gitRepoState: scriptRes.finalState });
      }


      const targetStars = activeRound;
      let calculatedWpm: number | undefined;
      if (activeRound === 3) {
        const elapsedMinutes = Math.max(0.04, (Date.now() - (roundStartTimeRef.current || Date.now())) / 60000);
        calculatedWpm = Math.round((targetCode.length / 5) / elapsedMinutes);
        setRoundStats({ wpm: calculatedWpm, accuracy: 100 });
      }

      if (starsEarned < targetStars) {
        setTaskMastery(currentTask.id, targetStars, calculatedWpm);
        addXp(activeRound * 25);
        completeCodingTask(currentTask.id);
      }

      saveTaskProgress(currentTask.id, targetStars, calculatedWpm);

      // Check if all 6 Git tasks are completed
      const allCompleted = GIT_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setGitVictoryModalOpen(true);
        }, 1200);
      }
    } else {
      audioFx.playErrorBuzz();
      setHasError(true);
      setFeedback(t(validation.messageKey || "git.validationFailed", "Команда або скрипт Git не пройшли валідацію. Перевірте синтаксис та аргументи."));
    }
  }, [
    activeRound,
    typedCode,
    targetCode,
    codeLang,
    gitRepoState,
    currentTask,
    starsEarned,
    roundStartTimeRef,
    setRoundStats,
    setTaskMastery,
    addXp,
    completeCodingTask,
    saveTaskProgress,
    taskMasteryStars,
    setGitVictoryModalOpen,
    setHasError,
    setFeedback,
    setRoundCompleted,
    t,
  ]);

  // Keyboard shortcut listener (Ctrl/Cmd + Enter to verify)
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
      <div className="p-4 rounded-2xl bg-[#EFEAE1] border border-paper-border shadow-paper-sm space-y-3">
        {/* Task Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {GIT_TASKS.map((task, idx) => {
            const isCurrent = task.id === currentTask.id;
            const taskStars = taskMasteryStars[task.id] || 0;
            return (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#1E2024] border-[#1E2024] text-white shadow-md"
                    : "bg-paper/70 hover:bg-paper border-paper-border text-ink hover:border-purple-500/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase ${
                      isCurrent ? "text-purple-400" : "text-ink-muted"
                    }`}
                  >
                    #{idx + 1} GIT
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4].map((s) => (
                      <span
                        key={s}
                        className={
                          taskStars >= s
                            ? s === 4
                              ? "text-cyan-400 font-bold text-[10px]"
                              : "text-purple-400 text-[10px]"
                            : "text-gray-300 opacity-40 text-[10px]"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className={`text-xs font-bold truncate mt-1 ${
                    isCurrent ? "text-white" : "text-ink"
                  }`}
                >
                  {t(task.titleKey)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Task Title & Stars Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-500">
              <GitBranch size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-600 border border-purple-500/30">
                  Git Time Machine Gym
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
            {allGitTasksCompleted && (
              <button
                onClick={() => {
                  audioFx.playSuccessFanfare();
                  setGitVictoryModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-display font-extrabold text-xs shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={t("git.certTooltip", "Отримати сертифікат Git Architect")}
              >
                <Trophy size={14} className="text-white" />
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
                          ? "text-purple-400 fill-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] scale-115"
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
          <div className="p-3 rounded-xl bg-[#EBE5D8] border border-[#1A1D20]/30 text-[#1A1D20] text-xs font-sans leading-relaxed shadow-sm animate-in fade-in flex items-start justify-between gap-2">
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
                    ? "bg-[#1E2024] border-[#1E2024] text-white shadow-md"
                    : isUnlocked
                    ? "bg-paper hover:bg-paper-muted border-paper-border text-ink hover:border-purple-500/40"
                    : "bg-paper/40 border-paper-border/50 text-ink-muted/50 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-[11px] uppercase">
                    {label}
                  </span>
                  {starsEarned >= round && (
                    <span
                      className={
                        round === 4
                          ? "text-purple-400 text-xs drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]"
                          : "text-amber-400 text-xs"
                      }
                    >
                      {round === 4 ? "💎" : "⭐"}
                    </span>
                  )}
                </div>
                <div
                  className={`text-[10px] truncate mt-0.5 ${
                    isActive ? "text-gray-300" : "text-ink-muted"
                  }`}
                >
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
        stationId="git"
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
    </div>
  );
};
