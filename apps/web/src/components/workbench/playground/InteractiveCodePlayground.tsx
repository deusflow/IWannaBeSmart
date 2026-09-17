/**
 * @file apps/web/src/components/workbench/playground/InteractiveCodePlayground.tsx
 * @description 3-Star Code Gym muscle memory engine for Virtual TV: Trace -> Cloze -> Sprint
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CODING_TASKS,
  executeTvScriptAsync,
  type VirtualTvState,
  type CodingTask,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../utils/audioFx";
import { useGuideSpotlight } from "../../../hooks/useGuideSpotlight";
import { ProjectExplorerBar } from "./ProjectExplorerBar";
import { useCodeGymSession } from "./useCodeGymSession";
import { CodeGymEditor } from "./CodeGymEditor";
import { TvPlaygroundHeader } from "./TvPlaygroundHeader";

export interface InteractiveCodePlaygroundProps {
  onOpenArchitectureStudio?: () => void;
}

export const InteractiveCodePlayground: React.FC<InteractiveCodePlaygroundProps> = ({
  onOpenArchitectureStudio,
}) => {
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
    saveTaskProgress,
    addXp,
    setStationVictoryModalOpen,
    resetBypasses,
  } = useWorkbenchStore(
    useShallow((s) => ({
      power: s.power,
      channel: s.channel,
      volume: s.volume,
      isArchitecturePowerWired: s.isArchitecturePowerWired,
      setArchitecturePowerWired: s.setArchitecturePowerWired,
      applyCodeExecution: s.applyCodeExecution,
      completeCodingTask: s.completeCodingTask,
      completedCodingTasks: s.completedCodingTasks,
      taskMasteryStars: s.taskMasteryStars,
      setTaskMastery: s.setTaskMastery,
      saveTaskProgress: s.saveTaskProgress,
      addXp: s.addXp,
      setStationVictoryModalOpen: s.setStationVictoryModalOpen,
      resetBypasses: s.resetBypasses,
    }))
  );

  const tierMeta = useMemo(() => {
    const countTasks = (tier: 0 | 1 | 2) => CODING_TASKS.filter((t) => (t.tier ?? 0) === tier).length;
    return {
      0: { label: t("codegym.tier0Label", "РАНГ 0: СТАРТ"), maxStars: countTasks(0) * 4, unlockAt: 0 },
      1: { label: t("codegym.tier1Label", "РАНГ 1: ЛОГІКА"), maxStars: countTasks(1) * 4, unlockAt: 6 },
      2: { label: t("codegym.tier2Label", "РАНГ 2: АРХІТЕКТУРА"), maxStars: countTasks(2) * 4, unlockAt: 12 },
    };
  }, [t]);
  const tierKeys = [0, 1, 2] as const;

  const [selectedTier, setSelectedTier] = useState<0 | 1 | 2>(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("task-0-1-power-on");

  // Auto-reset architecture trace bypasses on task change to prevent state leaks
  useEffect(() => {
    resetBypasses();
  }, [selectedTaskId, resetBypasses]);

  const currentTask: CodingTask = useMemo(
    () => CODING_TASKS.find((t) => t.id === selectedTaskId) || CODING_TASKS[0],
    [selectedTaskId]
  );

  const tierStarTotals = useMemo(
    () => ({
      0: CODING_TASKS.filter((task) => task.tier === 0).reduce((sum, task) => sum + (taskMasteryStars[task.id] || 0), 0),
      1: CODING_TASKS.filter((task) => task.tier === 1).reduce((sum, task) => sum + (taskMasteryStars[task.id] || 0), 0),
      2: CODING_TASKS.filter((task) => task.tier === 2).reduce((sum, task) => sum + (taskMasteryStars[task.id] || 0), 0),
    }),
    [taskMasteryStars]
  );

  const visibleTasks = useMemo(
    () => CODING_TASKS.filter((task) => (task.tier ?? 0) === selectedTier),
    [selectedTier]
  );

  const isTierUnlocked = useCallback(
    (tier: 0 | 1 | 2) => {
      if (tier === 0) return true;
      if (tier === 1) return tierStarTotals[0] >= 6;
      return tierStarTotals[1] >= 12;
    },
    [tierStarTotals]
  );

  const starsEarned = taskMasteryStars[currentTask.id] || 0;

  // Next task calculation
  const currentTaskIndex = CODING_TASKS.findIndex((t) => t.id === currentTask.id);
  const nextTask =
    currentTaskIndex >= 0 && currentTaskIndex < CODING_TASKS.length - 1
      ? CODING_TASKS[currentTaskIndex + 1]
      : null;
  const isNextTaskUnlocked = nextTask ? isTierUnlocked((nextTask.tier ?? 0) as 0 | 1 | 2) : false;

  useGuideSpotlight(currentTask.id);

  // ── Code Execution Helper ──
  const runTvExecution = useCallback(
    async (code: string, delay = 150) => {
      const beforeState: VirtualTvState = {
        isOn: power,
        channel,
        volume,
        isArchitectureWired: isArchitecturePowerWired,
      };
      const res = await executeTvScriptAsync(
        code,
        beforeState,
        (snap) => {
          applyCodeExecution({
            power: snap.isOn,
            channel: snap.channel,
            volume: snap.volume,
            osdMessage: snap.osdMessage,
            label: snap.label,
          });
        },
        delay
      );
      if (res.success) {
        applyCodeExecution({
          power: res.newState.isOn,
          channel: res.newState.channel,
          volume: res.newState.volume,
          osdMessage: res.newState.osdMessage,
          label: res.newState.label,
        });
        if (res.newState.isArchitectureWired) {
          setArchitecturePowerWired(true);
        }
      }
      return { beforeState, res };
    },
    [power, channel, volume, isArchitecturePowerWired, applyCodeExecution, setArchitecturePowerWired]
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
    traceCharsMatched,
    handleCodeChange,
    handleStartSprint,
    handleResetRound,
    isTheoryUnlocked,
    unlockPractice,
  } = useCodeGymSession({
    currentTask,
    starsEarned,
    onRoundComplete: async (round, code) => {
      const targetStars = round ?? 1;
      setTaskMastery(currentTask.id, targetStars);
      saveTaskProgress(currentTask.id, targetStars);
      completeCodingTask(currentTask.id);
      addXp(targetStars * 15);
      await runTvExecution(code);
      const allCompleted = CODING_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1 || completedCodingTasks[task.id]
      );
      if (allCompleted) {
        setTimeout(() => {
          setStationVictoryModalOpen(true);
        }, 1200);
      }
    },
  });

  const [forceTheoryExpanded, setForceTheoryExpanded] = useState<boolean | undefined>(undefined);

  const handleOpenTheory = useCallback(() => {
    setForceTheoryExpanded(true);
    const el = document.getElementById("guided-step-bar-container");
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  // Handle task switching
  const handleSelectTask = useCallback((taskId: string) => {
    const task = CODING_TASKS.find((item) => item.id === taskId);
    if (!task) return;
    const nextTier = (task.tier ?? 0) as 0 | 1 | 2;
    if (nextTier > 0 && !isTierUnlocked(nextTier)) return;
    if (taskId === selectedTaskId) return;
    audioFx.playRelayClick();
    setSelectedTier(nextTier);
    setSelectedTaskId(taskId);
    setActiveRound(1);
    setShowTheory(false);
    setShowTooltip(false);

    if (taskId === "task-boundary-guard" && channel <= 4) {
      applyCodeExecution({ channel: 5 });
    }
    if (taskId === "task-function-encapsulation" && volume === 0) {
      applyCodeExecution({ volume: 50 });
    }
    if (task.isBugfixTask) {
      audioFx.playAlarmSound();
    }
  }, [selectedTaskId, isTierUnlocked, channel, volume, applyCodeExecution, setActiveRound, setShowTheory, setShowTooltip]);

  const handleSelectTier = useCallback((tier: 0 | 1 | 2) => {
    if (!isTierUnlocked(tier)) return;
    const firstTask = CODING_TASKS.find((task) => (task.tier ?? 0) === tier);
    if (!firstTask) return;
    audioFx.playRelayClick();
    setSelectedTier(tier);
    setSelectedTaskId(firstTask.id);
    setActiveRound(1);
    setShowTheory(false);
    setShowTooltip(false);

    if (firstTask.id === "task-boundary-guard" && channel <= 4) {
      applyCodeExecution({ channel: 5 });
    }
    if (firstTask.id === "task-function-encapsulation" && volume === 0) {
      applyCodeExecution({ volume: 50 });
    }
  }, [isTierUnlocked, channel, volume, applyCodeExecution, setActiveRound, setShowTheory, setShowTooltip]);

  useEffect(() => {
    const tierMatch = visibleTasks.some((task) => task.id === selectedTaskId);
    if (!tierMatch && visibleTasks[0]) {
      setSelectedTaskId(visibleTasks[0].id);
      setSelectedTier(visibleTasks[0].tier ?? 0);
    }
  }, [selectedTaskId, visibleTasks]);

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

  // ── Verification handlers ──
  const handleVerifyCloze = useCallback(async () => {
    const isUnfilled = typedCode.includes("___");
    if (isUnfilled) {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(t("codegym.fillBlanksPrompt", "Заповніть усі прогалини (___) перед перевіркою!"));
      return;
    }

    const { beforeState, res } = await runTvExecution(typedCode, 200);
    const validation = currentTask.validate(beforeState, res.newState, res, typedCode);

    if (validation.passed) {
      setHasError(false);
      setRoundCompleted(true);
      setRoundStats({ wpm: 0, accuracy: 100 });
      audioFx.playSuccessFanfare();
      setTaskMastery(currentTask.id, 2);
      saveTaskProgress(currentTask.id, 2);
      completeCodingTask(currentTask.id);
      addXp(20);
      setFeedback(t(currentTask.successKey));

      const allCompleted = CODING_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1 || completedCodingTasks[task.id]
      );
      if (allCompleted) {
        setTimeout(() => {
          setStationVictoryModalOpen(true);
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
  }, [typedCode, runTvExecution, currentTask, setHasError, setRoundCompleted, setRoundStats, setTaskMastery, saveTaskProgress, completeCodingTask, addXp, setFeedback, t, taskMasteryStars, completedCodingTasks, setStationVictoryModalOpen]);

  const handleRunSprint = useCallback(async () => {
    const isMatch = typedCode.trim() === targetCode.trim();
    if (!isMatch) {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(t("codegym.sprintMismatch", "Код не збігається з еталоном. Перевірте кожен символ!"));
      return;
    }

    const { beforeState, res } = await runTvExecution(typedCode, 150);
    const validation = currentTask.validate(beforeState, res.newState, res, typedCode);

    if (validation.passed) {
      setHasError(false);
      setRoundCompleted(true);
      const elapsedMinutes = Math.max(0.04, (Date.now() - (roundStartTimeRef.current || Date.now())) / 60000);
      const calculatedWpm = Math.round((targetCode.length / 5) / elapsedMinutes);
      setRoundStats({ wpm: calculatedWpm, accuracy: 100 });
      audioFx.playSuccessFanfare();
      setTaskMastery(currentTask.id, 3, calculatedWpm);
      saveTaskProgress(currentTask.id, 3, calculatedWpm);
      completeCodingTask(currentTask.id);
      addXp(30);
      setFeedback(t("codegym.round3Complete", "🏆 Спринт пройдено! Ідеальна швидкість та точність."));

      const allCompleted = CODING_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1 || completedCodingTasks[task.id]
      );
      if (allCompleted) {
        setTimeout(() => {
          setStationVictoryModalOpen(true);
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
    runTvExecution,
    currentTask,
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
    completedCodingTasks,
    setStationVictoryModalOpen,
    t,
  ]);

  const handleRunTransfer = useCallback(async () => {
    const { beforeState, res } = await runTvExecution(typedCode, 200);

    let passed = false;
    if (currentTask.transferVariant) {
      passed = currentTask.transferVariant.validate(beforeState, res.newState, typedCode);
    } else {
      const validation = currentTask.validate(beforeState, res.newState, res, typedCode);
      passed = validation.passed;
    }

    if (passed) {
      setHasError(false);
      setRoundCompleted(true);
      setRoundStats({ wpm: 0, accuracy: 100 });
      audioFx.playSuccessFanfare();
      setTaskMastery(currentTask.id, 4);
      saveTaskProgress(currentTask.id, 4);
      completeCodingTask(currentTask.id);
      addXp(40);
      setFeedback(t("codegym.round4Complete", "💎 Місія варіації виконана! Ви здобули 4-ту зірку майстра!"));

      const allCompleted = CODING_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1 || completedCodingTasks[task.id]
      );
      if (allCompleted) {
        setTimeout(() => {
          setStationVictoryModalOpen(true);
        }, 1200);
      }
    } else {
      setHasError(true);
      audioFx.playErrorBuzz();
      setFeedback(res.error || t(currentTask.hintKey));
    }
  }, [
    typedCode,
    runTvExecution,
    currentTask,
    setHasError,
    setRoundCompleted,
    setRoundStats,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    setFeedback,
    taskMasteryStars,
    completedCodingTasks,
    setStationVictoryModalOpen,
    t,
  ]);

  const handleVerifyBugfix = useCallback(async () => {
    const { beforeState, res } = await runTvExecution(typedCode, 200);
    const validation = currentTask.validate(beforeState, res.newState, res, typedCode);

    if (validation.passed) {
      setHasError(false);
      setRoundCompleted(true);
      setRoundStats({ wpm: 0, accuracy: 100 });
      audioFx.playSuccessFanfare();
      setTaskMastery(currentTask.id, 1);
      saveTaskProgress(currentTask.id, 1);
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
  }, [typedCode, runTvExecution, currentTask, setHasError, setRoundCompleted, setRoundStats, setTaskMastery, saveTaskProgress, completeCodingTask, addXp, setFeedback, t]);

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

  // Hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (roundCompleted) {
          if (activeRound < 4) {
            audioFx.playRelayClick();
            setActiveRound((prev) => (prev + 1) as 1 | 2 | 3 | 4);
          } else if (nextTask && isNextTaskUnlocked) {
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
  }, [roundCompleted, activeRound, nextTask, isNextTaskUnlocked, handleVerify, handleSelectTask, handleResetRound, setActiveRound]);

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none max-w-4xl mx-auto">
      {/* ── Top Header: Tier selector, Task list, Title, Mastery Stars & Tabs ── */}
      <TvPlaygroundHeader
        tierMeta={tierMeta}
        tierKeys={tierKeys}
        selectedTier={selectedTier}
        tierStarTotals={tierStarTotals}
        isTierUnlocked={isTierUnlocked}
        onSelectTier={handleSelectTier}
        visibleTasks={visibleTasks}
        currentTaskId={currentTask.id}
        taskMasteryStars={taskMasteryStars}
        onSelectTask={handleSelectTask}
        currentTask={currentTask}
        showTooltip={showTooltip}
        onToggleTooltip={() => setShowTooltip((p) => !p)}
        allTvTasksCompleted={allTvTasksCompleted}
        onOpenVictoryModal={() => {
          audioFx.playSuccessFanfare();
          setStationVictoryModalOpen(true);
        }}
        starsEarned={starsEarned}
        codeLang={codeLang}
        showTheory={showTheory}
        onToggleTheory={() => setShowTheory((p) => !p)}
        onOpenArchitectureStudio={onOpenArchitectureStudio}
        forceTheoryExpanded={forceTheoryExpanded}
        isTheoryUnlocked={isTheoryUnlocked}
        onUnlockPractice={unlockPractice}
        activeRound={activeRound}
        onSelectRound={(round) => {
          audioFx.playRelayClick();
          setActiveRound(round);
        }}
      />

      {/* Project Explorer Bar */}
      <ProjectExplorerBar
        currentCode={typedCode || targetCode}
        codeLang={codeLang}
        isFintech={false}
        stationId="tv"
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
          if (nextTask && isNextTaskUnlocked) {
            audioFx.playRelayClick();
            handleSelectTask(nextTask.id);
          }
        }}
        nextTaskAvailable={Boolean(nextTask && isNextTaskUnlocked)}
        isTheoryUnlocked={isTheoryUnlocked}
        onOpenTheory={handleOpenTheory}
      />
    </div>
  );
};
