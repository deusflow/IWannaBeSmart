/**
 * @file apps/web/src/components/workbench/playground/CyberCodeGymRunner.tsx
 * @description 4-Round Code Gym muscle memory engine for Google Cybersecurity & SOC Analyst Track.
 * Manages tasks 1..8: Syslog Parsing, Threat Hunting, Packet Dissection, SYN Flood Detection,
 * ARP Poisoning, Credential Sniffing, MITRE ATT&CK Triage, and NIST CSF Containment.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { CYBER_TASKS, type CyberTask } from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../utils/audioFx";
import { GuidedStepBar } from "./GuidedStepBar";
import { ProjectExplorerBar } from "./ProjectExplorerBar";
import { useCodeGymSession } from "./useCodeGymSession";
import { CodeGymEditor } from "./CodeGymEditor";
import { getStationCheckpoint } from "../../../utils/checkpointManager";

export const CyberCodeGymRunner: React.FC = () => {
  const { t } = useTranslation();
  const {
    taskMasteryStars,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    setCyberVictoryModalOpen,
    targetTaskId,
    setTargetTaskId,
  } = useWorkbenchStore(
    useShallow((s) => ({
      taskMasteryStars: s.taskMasteryStars,
      setTaskMastery: s.setTaskMastery,
      saveTaskProgress: s.saveTaskProgress,
      completeCodingTask: s.completeCodingTask,
      addXp: s.addXp,
      setCyberVictoryModalOpen: s.setCyberVictoryModalOpen,
      targetTaskId: s.targetTaskId,
      setTargetTaskId: s.setTargetTaskId,
    }))
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string>(() => {
    const cp = getStationCheckpoint("cyber");
    if (cp?.taskId && CYBER_TASKS.some((t) => t.id === cp.taskId)) {
      return cp.taskId;
    }
    return CYBER_TASKS[0].id;
  });

  const currentTask: CyberTask = useMemo(
    () => CYBER_TASKS.find((t) => t.id === selectedTaskId) || CYBER_TASKS[0],
    [selectedTaskId]
  );

  const starsEarned = taskMasteryStars[currentTask.id] || 0;

  const currentTaskIndex = CYBER_TASKS.findIndex((t) => t.id === currentTask.id);
  const nextTask =
    currentTaskIndex >= 0 && currentTaskIndex < CYBER_TASKS.length - 1
      ? CYBER_TASKS[currentTaskIndex + 1]
      : null;

  // Unified Code Gym Session
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
    showTransferHint,
    setShowTransferHint,
    timeLeft,
    isTimerRunning,
    roundStats,
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
  } = useCodeGymSession<CyberTask, "python" | "typescript">({
    currentTask,
    initialLang: "python",
    starsEarned,
    stationId: "cyber",
    onRoundComplete: async (round) => {
      const targetStars = round ?? 1;
      setTaskMastery(currentTask.id, targetStars);
      saveTaskProgress(currentTask.id, targetStars);
      completeCodingTask(currentTask.id);
      addXp(targetStars * 15);
      const allCompleted = CYBER_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setCyberVictoryModalOpen(true);
        }, 1200);
      }
    },
  });

  const [forceTheoryExpanded] = useState<boolean | undefined>(undefined);

  const fileName = useMemo(
    () => (codeLang === "typescript" ? "soc_analyst.ts" : "soc_analyst.py"),
    [codeLang]
  );

  const handleSelectTask = useCallback(
    (taskId: string) => {
      if (taskId === selectedTaskId) return;
      audioFx.playRelayClick();
      setSelectedTaskId(taskId);
      setActiveRound(1);
      setShowTransferHint(false);
    },
    [selectedTaskId, setActiveRound, setShowTransferHint]
  );

  const handleAdvanceRound = useCallback(() => {
    if (activeRound < 4) {
      audioFx.playRelayClick();
      setActiveRound((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    } else if (nextTask) {
      audioFx.playRelayClick();
      handleSelectTask(nextTask.id);
    }
  }, [activeRound, nextTask, setActiveRound, handleSelectTask]);

  // Auto-switch to target task when requested
  useEffect(() => {
    if (targetTaskId) {
      const task = CYBER_TASKS.find((t) => t.id === targetTaskId);
      if (task) {
        setSelectedTaskId(task.id);
        setActiveRound(1);
        setTargetTaskId(null);
      }
    }
  }, [targetTaskId, setTargetTaskId, setActiveRound]);

  // Round Verification logic
  const handleVerify = useCallback(() => {
    if (activeRound === 1) {
      if (typedCode.trim() === targetCode.trim()) {
        setRoundCompleted(true);
        audioFx.playSuccessFanfare();
        setTaskMastery(currentTask.id, 1);
        saveTaskProgress(currentTask.id, 1);
        completeCodingTask(currentTask.id);
        addXp(15);
      } else {
        setHasError(true);
        audioFx.playErrorBuzz();
        setFeedback(t("codegym.mismatchPrompt", "Символ не відповідає трафарету."));
      }
    } else if (activeRound === 2) {
      if (typedCode.trim() === targetCode.trim()) {
        setRoundCompleted(true);
        audioFx.playSuccessFanfare();
        setTaskMastery(currentTask.id, 2);
        saveTaskProgress(currentTask.id, 2);
        completeCodingTask(currentTask.id);
        addXp(30);
      } else {
        setHasError(true);
        audioFx.playErrorBuzz();
        setFeedback(t("codegym.clozeMismatchPrompt", "Невірне заповнення прогалин!"));
      }
    } else if (activeRound === 3) {
      if (isTimerRunning) {
        if (typedCode.trim() === targetCode.trim()) {
          setRoundCompleted(true);
          audioFx.playSuccessFanfare();
          setTaskMastery(currentTask.id, 3);
          saveTaskProgress(currentTask.id, 3);
          completeCodingTask(currentTask.id);
          addXp(45);
        } else {
          setHasError(true);
          audioFx.playErrorBuzz();
          setFeedback(t("codegym.sprintMismatch", "Код не відповідає еталону спринту!"));
        }
      }
    } else if (activeRound === 4) {
      if (typedCode.trim().length > 20) {
        setRoundCompleted(true);
        audioFx.playSuccessFanfare();
        setTaskMastery(currentTask.id, 4);
        saveTaskProgress(currentTask.id, 4);
        completeCodingTask(currentTask.id);
        addXp(60);

        const allCompleted = CYBER_TASKS.every(
          (task) =>
            task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
        );
        if (allCompleted) {
          setTimeout(() => {
            setCyberVictoryModalOpen(true);
          }, 1200);
        }
      } else {
        setHasError(true);
        audioFx.playErrorBuzz();
        setFeedback(t("codegym.transferFailed", "Реалізуйте трансферну варіацію алгоритму."));
      }
    }
  }, [
    activeRound,
    typedCode,
    targetCode,
    isTimerRunning,
    currentTask.id,
    setRoundCompleted,
    setHasError,
    setFeedback,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    t,
  ]);

  // Hotkeys: Ctrl+Enter / Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (roundCompleted) {
          handleAdvanceRound();
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
  }, [
    roundCompleted,
    handleAdvanceRound,
    handleVerify,
    handleResetRound,
  ]);

  return (
    <div className="flex flex-col gap-4 font-sans text-slate-100">
      {/* ── Task Navigation Strip ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {CYBER_TASKS.map((task) => {
          const isSelected = task.id === selectedTaskId;
          const stars = taskMasteryStars[task.id] || 0;
          return (
            <button
              key={task.id}
              onClick={() => handleSelectTask(task.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono shrink-0 transition-all ${
                isSelected
                  ? "bg-red-950/80 border-red-500/60 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span className="font-bold">#{task.order}</span>
              <span className="truncate max-w-[120px]">{t(task.titleKey, task.id)}</span>
              <div className="flex items-center gap-0.5 text-amber-400">
                <Star size={11} className={stars >= 1 ? "fill-amber-400" : "opacity-30"} />
                <span className="text-[10px]">{stars}/4</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Guided Theory & Concepts Bar ── */}
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

      {/* ── Project Explorer & Code Editor Rack ── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left: Project Explorer */}
        <div className="w-full lg:w-[260px] shrink-0">
          <ProjectExplorerBar stationId="cyber" />
        </div>

        {/* Right: Code Gym 4-Round Editor */}
        <div className="flex-1 w-full min-w-0">
          <CodeGymEditor<CyberTask, "python" | "typescript">
            currentTask={currentTask}
            codeLang={codeLang}
            onChangeLang={setCodeLang}
            availableLangs={[
              { id: "python", label: "Python 3.11" },
              { id: "typescript", label: "TypeScript" },
            ]}
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
            onAdvanceRound={handleAdvanceRound}
            nextTaskAvailable={Boolean(nextTask)}
            onNextTask={nextTask ? () => handleSelectTask(nextTask.id) : undefined}
          />
        </div>
      </div>
    </div>
  );
};
