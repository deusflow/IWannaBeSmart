/**
 * @file apps/web/src/components/workbench/playground/VertexCodeGymRunner.tsx
 * @description 4-Round Code Gym muscle memory engine for Station 06: Vertex AI Architect.
 * Trace -> Cloze -> Sprint -> Architecture for 15 Tasks (Python & YAML).
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Star, Trophy, X, Cloud } from "lucide-react";
import {
  VERTEX_TASKS,
  type VertexTask,
  type VertexCommandResult,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../utils/audioFx";
import { ProjectExplorerBar } from "./ProjectExplorerBar";
import { useCodeGymSession } from "./useCodeGymSession";
import { CodeGymEditor } from "./CodeGymEditor";
import { GuidedStepBar } from "./GuidedStepBar";

export const VertexCodeGymRunner: React.FC = () => {
  const { t } = useTranslation();
  const {
    vertexState,
    taskMasteryStars,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    setVertexVictoryModalOpen,
    connectVertexGcsBucketAction,
    setVertexPreprocessingStepAction,
    runVertexTrainingAction,
    configureVertexEndpointAction,
    configureVertexIamAction,
    checkVertexMonitoringAction,
    resetVertexState,
    targetTaskId,
    setTargetTaskId,
  } = useWorkbenchStore(
    useShallow((s) => ({
      vertexState: s.vertexState,
      taskMasteryStars: s.taskMasteryStars,
      setTaskMastery: s.setTaskMastery,
      saveTaskProgress: s.saveTaskProgress,
      completeCodingTask: s.completeCodingTask,
      addXp: s.addXp,
      setVertexVictoryModalOpen: s.setVertexVictoryModalOpen,
      connectVertexGcsBucketAction: s.connectVertexGcsBucketAction,
      setVertexPreprocessingStepAction: s.setVertexPreprocessingStepAction,
      runVertexTrainingAction: s.runVertexTrainingAction,
      configureVertexEndpointAction: s.configureVertexEndpointAction,
      configureVertexIamAction: s.configureVertexIamAction,
      checkVertexMonitoringAction: s.checkVertexMonitoringAction,
      resetVertexState: s.resetVertexState,
      targetTaskId: s.targetTaskId,
      setTargetTaskId: s.setTargetTaskId,
    }))
  );


  const [selectedTaskId, setSelectedTaskId] = useState<string>(VERTEX_TASKS[0].id);
  const currentTask: VertexTask = useMemo(
    () => VERTEX_TASKS.find((t) => t.id === selectedTaskId) || VERTEX_TASKS[0],
    [selectedTaskId]
  );

  const starsEarned = taskMasteryStars[currentTask.id] || 0;

  const currentTaskIndex = VERTEX_TASKS.findIndex((t) => t.id === currentTask.id);
  const nextTask =
    currentTaskIndex >= 0 && currentTaskIndex < VERTEX_TASKS.length - 1
      ? VERTEX_TASKS[currentTaskIndex + 1]
      : null;

  // Unified Code Gym Session (Python / YAML)
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
  } = useCodeGymSession<VertexTask, "python" | "yaml">({
    currentTask,
    initialLang: "python",
    starsEarned,
    onRoundComplete: async (round) => {
      const targetStars = round ?? 1;
      setTaskMastery(currentTask.id, targetStars);
      saveTaskProgress(currentTask.id, targetStars);
      completeCodingTask(currentTask.id);
      addXp(targetStars * 15);
      const allCompleted = VERTEX_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setVertexVictoryModalOpen(true);
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

  const handleSelectTask = useCallback(
    (taskId: string) => {
      if (taskId === selectedTaskId) return;
      audioFx.playRelayClick();
      setSelectedTaskId(taskId);
      setActiveRound(1);
      setShowTooltip(false);
      setShowTransferHint(false);
      const nextT = VERTEX_TASKS.find((t) => t.id === taskId);
      if (nextT) {
        resetVertexState(nextT.initialState);
      }
    },
    [selectedTaskId, setActiveRound, setShowTooltip, setShowTransferHint, resetVertexState]
  );

  useEffect(() => {
    if (targetTaskId) {
      const exists = VERTEX_TASKS.some((t) => t.id === targetTaskId);
      if (exists) {
        handleSelectTask(targetTaskId);
        setTargetTaskId(null);
      }
    }
  }, [targetTaskId, handleSelectTask, setTargetTaskId]);

  const fileName = useMemo(
    () => (codeLang === "yaml" ? "vertex_pipeline.yaml" : "pipeline.py"),
    [codeLang]
  );

  const allVertexTasksCompleted = useMemo(() => {
    return VERTEX_TASKS.every((task) => (taskMasteryStars[task.id] || 0) >= 1);
  }, [taskMasteryStars]);

  // Verification & Sim-Engine Execution Handler
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

    const beforeState = vertexState;
    let result: VertexCommandResult = {
      success: true,
      newState: beforeState,
      output: "Pipeline instruction applied successfully",
      logs: [],
    };

    // Execute corresponding cloud simulation action based on task order
    switch (currentTask.order) {
      case 1:
        result = connectVertexGcsBucketAction("gs://retail-training-data");
        break;
      case 2:
        result = setVertexPreprocessingStepAction("normalize");
        break;
      case 3:
        result = setVertexPreprocessingStepAction("both");
        break;
      case 4:
      case 5:
        result = runVertexTrainingAction("a2-highgpu-1g", 64, 0.0001);
        break;
      case 6:
        result = runVertexTrainingAction("tpu-v4-8", 128, 0.0001);
        break;
      case 7:
      case 8:
        result = configureVertexEndpointAction({
          minReplicas: 2,
          maxReplicas: 10,
          trafficSplitPercent: 100,
          autoscalingEnabled: true,
        });
        break;
      case 9:
        result = configureVertexEndpointAction({
          minReplicas: 2,
          maxReplicas: 10,
          trafficSplitPercent: 90,
          autoscalingEnabled: true,
        });
        break;
      case 10:
      case 11:
      case 12:
        result = configureVertexIamAction(
          {
            vpcPeeringEnabled: true,
            serviceAccountEmail: "sa-vertex@corp.iam.gserviceaccount.com",
            deniedRoles: ["roles/owner", "roles/editor"],
            dataResidencyRegion: "eu-west1",
          },
          "service-account"
        );
        break;
      case 13:
      case 14:
      case 15:
        result = checkVertexMonitoringAction({
          driftThreshold: 0.1,
          latencySloMs: 150,
          alertEmail: "mlops-sre@company.com",
          retrainingTriggerEnabled: true,
        });
        break;
      default:
        break;
    }

    const finalState = useWorkbenchStore.getState().vertexState;
    const validation = currentTask.validate(
      currentTask.initialState,
      result?.newState || finalState,
      result,
      typedCode
    );

    if (validation.passed) {
      audioFx.playSuccessFanfare();
      setHasError(false);
      setFeedback(t(validation.messageKey || currentTask.successKey));
      setRoundCompleted(true);

      const targetStars = activeRound;
      let calculatedWpm: number | undefined;
      if (activeRound === 3) {
        const elapsedMinutes = Math.max(
          0.04,
          (Date.now() - (roundStartTimeRef.current || Date.now())) / 60000
        );
        calculatedWpm = Math.round(targetCode.length / 5 / elapsedMinutes);
        setRoundStats({ wpm: calculatedWpm, accuracy: 100 });
      }

      if (starsEarned < targetStars) {
        setTaskMastery(currentTask.id, targetStars, calculatedWpm);
        addXp(activeRound * 25);
        completeCodingTask(currentTask.id);
      }

      saveTaskProgress(currentTask.id, targetStars, calculatedWpm);

      const allCompleted = VERTEX_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setVertexVictoryModalOpen(true);
        }, 1200);
      }
    } else {
      audioFx.playErrorBuzz();
      setHasError(true);
      setFeedback(
        String(
          t(
            validation.messageKey || "common.validationFailed",
            result.output || "MLOps configuration verification failed."
          )
        )
      );
    }
  }, [
    activeRound,
    typedCode,
    targetCode,
    currentTask,
    vertexState,
    connectVertexGcsBucketAction,
    setVertexPreprocessingStepAction,
    runVertexTrainingAction,
    configureVertexEndpointAction,
    configureVertexIamAction,
    checkVertexMonitoringAction,
    starsEarned,
    roundStartTimeRef,
    setRoundStats,
    setTaskMastery,
    addXp,
    completeCodingTask,
    saveTaskProgress,
    taskMasteryStars,
    setVertexVictoryModalOpen,
    t,
    setHasError,
    setFeedback,
    setRoundCompleted,
  ]);

  const handleAdvanceRound = useCallback(() => {
    if (activeRound < 4) {
      setActiveRound((prev) => (prev + 1) as 1 | 2 | 3 | 4);
      audioFx.playRelayClick();
    } else if (nextTask) {
      handleSelectTask(nextTask.id);
    }
  }, [activeRound, nextTask, handleSelectTask, setActiveRound]);

  // Global keyboard shortcuts (Cmd/Ctrl+Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (roundCompleted) {
          if (activeRound < 4) {
            setActiveRound((prev) => (prev + 1) as 1 | 2 | 3 | 4);
            audioFx.playRelayClick();
          } else if (nextTask) {
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
    <div className="flex flex-col gap-3 font-mono">
      {/* ── Top Bar: Task Navigator & Language Switcher ── */}
      <div className="bg-[#0B101B] border border-blue-950/80 p-3 rounded-2xl flex items-center justify-between flex-wrap gap-2 shadow-lg">
        {/* Task Buttons Scroll Container */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {VERTEX_TASKS.map((task) => {
            const isCurrent = task.id === selectedTaskId;
            const stars = taskMasteryStars[task.id] || 0;
            return (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer select-none shrink-0 ${
                  isCurrent
                    ? "bg-blue-600 text-slate-950 font-extrabold shadow-md shadow-blue-500/20"
                    : stars > 0
                    ? "bg-blue-950/50 text-blue-300 border border-blue-800/60 hover:bg-blue-900/40"
                    : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                <span>T{task.order}</span>
                <div className="flex items-center">
                  {[1, 2, 3, 4].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= stars
                          ? s === 4
                            ? "text-cyan-400 fill-cyan-400"
                            : "text-amber-400 fill-amber-400"
                          : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Certificate Trigger & Language Selection */}
        <div className="flex items-center gap-2">
          {allVertexTasksCompleted && (
            <button
              onClick={() => setVertexVictoryModalOpen(true)}
              className="px-2.5 py-1 text-xs rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("vertex.ui.certButton", "Certificate")}</span>
            </button>
          )}

          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setCodeLang("python")}
              className={`px-2.5 py-1 text-xs rounded font-bold transition-colors cursor-pointer ${
                codeLang === "python"
                  ? "bg-blue-600 text-slate-950 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Python 3.11
            </button>
            <button
              onClick={() => setCodeLang("yaml")}
              className={`px-2.5 py-1 text-xs rounded font-bold transition-colors cursor-pointer ${
                codeLang === "yaml"
                  ? "bg-cyan-600 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              YAML Spec
            </button>
          </div>
        </div>
      </div>

      {/* ── Task Info & Mode Tabs ── */}
      <div className="bg-[#070B14] border border-blue-950 p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-300 text-[10px] font-bold rounded">
              TASK {currentTask.order} // 15
            </span>
            <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
              {t(currentTask.roundNameKey, `Round ${currentTask.round}`)}
            </span>
            <h3 className="text-sm font-bold text-slate-200">
              {t(currentTask.titleKey, "Vertex Objective")}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-mono">
            <Cloud className="w-3.5 h-3.5" />
            <span className="text-[11px]">GCP / Vertex AI</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          {t(currentTask.descKey, "Configure enterprise-grade Vertex AI pipeline components.")}
        </p>

        {/* Popover Tooltip */}
        {showTooltip && (
          <div className="p-3 rounded-xl bg-slate-900 border border-blue-800 text-slate-200 text-xs font-mono leading-relaxed shadow-sm animate-in fade-in flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="font-mono font-bold text-[10px] uppercase text-blue-400 mb-1">
                {t("common.simpleExplanation", "Підказка архітектора")}:
              </div>
              <p>{t(currentTask.hintKey, currentTask.descKey)}</p>
            </div>
            <button
              onClick={() => {
                audioFx.playRelayClick();
                setShowTooltip(false);
              }}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
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
                    ? "bg-blue-600 border-blue-600 text-slate-950 font-bold shadow-md"
                    : isUnlocked
                    ? "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-200 hover:border-blue-700/60"
                    : "bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-[11px] uppercase">
                    {label}
                  </span>
                  {starsEarned >= round && (
                    <span className="text-amber-400 text-xs">
                      {round === 4 ? "💎" : "⭐"}
                    </span>
                  )}
                </div>
                <div className={`text-[10px] truncate mt-0.5 ${isActive ? "text-slate-900 font-semibold" : "text-slate-400"}`}>
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
        stationId="vertex"
      />

      {/* CodeGymEditor */}
      <CodeGymEditor
        currentTask={currentTask}
        codeLang={codeLang}
        onChangeLang={setCodeLang}
        availableLangs={[
          { id: "python", label: "Python 3.11" },
          { id: "yaml", label: "YAML" },
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
        onNextTask={nextTask ? () => handleSelectTask(nextTask.id) : undefined}
        nextTaskAvailable={Boolean(nextTask)}
        isTheoryUnlocked={isTheoryUnlocked}
        onOpenTheory={handleOpenTheory}
      />
    </div>
  );
};
