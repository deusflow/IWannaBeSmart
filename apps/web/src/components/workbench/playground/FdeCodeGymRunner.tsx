/**
 * @file apps/web/src/components/workbench/playground/FdeCodeGymRunner.tsx
 * @description 4-Round Code Gym & Stakeholder Discovery engine for Station 07: Field AI Deployer.
 * Discovery -> Integration -> Agent Design -> Security -> Handoff (15 Tasks).
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Star, Trophy, X, Users, ShieldCheck } from "lucide-react";
import {
  FDE_TASKS,
  type FdeTask,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../utils/audioFx";
import { ProjectExplorerBar } from "./ProjectExplorerBar";
import { useCodeGymSession } from "./useCodeGymSession";
import { CodeGymEditor } from "./CodeGymEditor";
import { GuidedStepBar } from "./GuidedStepBar";

export const FdeCodeGymRunner: React.FC = () => {
  const { t } = useTranslation();
  const {
    fdeState,
    taskMasteryStars,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    setFdeVictoryModalOpen,
    makeFdeDiscoveryChoiceAction,
    connectFdeLegacyApiAction,
    configureFdeAuthTokenAction,
    connectFdeAgentNodeAction,
    configureFdeRagAction,
    toggleFdeSecurityCheckAction,
    submitFdeRunbookAction,
    resetFdeState,
    targetTaskId,
    setTargetTaskId,
  } = useWorkbenchStore(
    useShallow((s) => ({
      fdeState: s.fdeState,
      taskMasteryStars: s.taskMasteryStars,
      setTaskMastery: s.setTaskMastery,
      saveTaskProgress: s.saveTaskProgress,
      completeCodingTask: s.completeCodingTask,
      addXp: s.addXp,
      setFdeVictoryModalOpen: s.setFdeVictoryModalOpen,
      makeFdeDiscoveryChoiceAction: s.makeFdeDiscoveryChoiceAction,
      connectFdeLegacyApiAction: s.connectFdeLegacyApiAction,
      configureFdeAuthTokenAction: s.configureFdeAuthTokenAction,
      connectFdeAgentNodeAction: s.connectFdeAgentNodeAction,
      configureFdeRagAction: s.configureFdeRagAction,
      toggleFdeSecurityCheckAction: s.toggleFdeSecurityCheckAction,
      submitFdeRunbookAction: s.submitFdeRunbookAction,
      resetFdeState: s.resetFdeState,
      targetTaskId: s.targetTaskId,
      setTargetTaskId: s.setTargetTaskId,
    }))
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string>(FDE_TASKS[0].id);
  const currentTask: FdeTask = useMemo(
    () => FDE_TASKS.find((t) => t.id === selectedTaskId) || FDE_TASKS[0],
    [selectedTaskId]
  );

  const starsEarned = taskMasteryStars[currentTask.id] || 0;

  const currentTaskIndex = FDE_TASKS.findIndex((t) => t.id === currentTask.id);
  const nextTask =
    currentTaskIndex >= 0 && currentTaskIndex < FDE_TASKS.length - 1
      ? FDE_TASKS[currentTaskIndex + 1]
      : null;

  // Adapt task so useCodeGymSession has targetCode and clozeTemplate even for dialogue rounds
  const adaptedTask = useMemo(() => {
    const fallbackTarget = {
      python: `# FDE Discovery & Stakeholder Alignment\nclient_goal = "Automate legacy compliance audit with generative AI"\nconstraints = ["On-prem data sovereignty", "Zero PII leakage"]\nsla = "P99 < 3s, accuracy >= 95%"`,
      typescript: `// FDE Discovery & Stakeholder Alignment\nconst clientGoal = "Automate legacy compliance audit with generative AI";\nconst constraints = ["On-prem data sovereignty", "Zero PII leakage"];\nconst sla = "P99 < 3s, accuracy >= 95%";`,
    };
    const fallbackCloze = {
      python: `client_goal = "___"\nconstraints = ["___", "___"]\nsla = "___"`,
      typescript: `const clientGoal = "___";\nconst constraints = ["___", "___"];\nconst sla = "___";`,
    };

    return {
      ...currentTask,
      targetCode: currentTask.targetCode || fallbackTarget,
      clozeTemplate: currentTask.clozeTemplate || fallbackCloze,
    };
  }, [currentTask]);

  // Unified Code Gym Session (Python / TypeScript)
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
  } = useCodeGymSession<typeof adaptedTask, "python" | "typescript">({
    currentTask: adaptedTask,
    initialLang: "python",
    starsEarned,
    onRoundComplete: async (round) => {
      const targetStars = round ?? 1;
      setTaskMastery(currentTask.id, targetStars);
      saveTaskProgress(currentTask.id, targetStars);
      completeCodingTask(currentTask.id);
      addXp(targetStars * 15);
      const allCompleted = FDE_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setFdeVictoryModalOpen(true);
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
      const nextT = FDE_TASKS.find((t) => t.id === taskId);
      if (nextT) {
        resetFdeState(nextT.initialState);
      }
    },
    [selectedTaskId, setActiveRound, setShowTooltip, setShowTransferHint, resetFdeState]
  );

  useEffect(() => {
    if (targetTaskId) {
      const exists = FDE_TASKS.some((t) => t.id === targetTaskId);
      if (exists) {
        handleSelectTask(targetTaskId);
        setTargetTaskId(null);
      }
    }
  }, [targetTaskId, handleSelectTask, setTargetTaskId]);

  const fileName = useMemo(
    () => (codeLang === "typescript" ? "agent_graph.ts" : "agent_graph.py"),
    [codeLang]
  );

  const allFdeTasksCompleted = useMemo(() => {
    return FDE_TASKS.every((task) => (taskMasteryStars[task.id] || 0) >= 1);
  }, [taskMasteryStars]);

  // Dialogue choice handler for Discovery tasks (Tasks 1 & 2)
  const handleDialogueChoice = useCallback(
    (choiceId: string, isCorrect: boolean, xpGain: number, consequenceKey: string) => {
      makeFdeDiscoveryChoiceAction(
        choiceId,
        isCorrect,
        xpGain,
        consequenceKey
      );

      if (isCorrect) {
        audioFx.playSuccessFanfare();
        setHasError(false);
        setFeedback(t(consequenceKey));
        setRoundCompleted(true);
        setTaskMastery(currentTask.id, 4);
        saveTaskProgress(currentTask.id, 4);
        completeCodingTask(currentTask.id);
        addXp(xpGain);
      } else {
        audioFx.playErrorBuzz();
        setHasError(true);
        setFeedback(t(consequenceKey));
      }
    },
    [
      makeFdeDiscoveryChoiceAction,
      currentTask.id,
      setTaskMastery,
      saveTaskProgress,
      completeCodingTask,
      addXp,
      t,
      setHasError,
      setFeedback,
      setRoundCompleted,
    ]
  );

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

    const beforeState = fdeState;
    let result: any = {
      success: true,
      output: "FDE verification passed",
    };

    // Trigger matching state update in simulator
    switch (currentTask.order) {
      case 1:
      case 2:
      case 3:
        break;
      case 4:
        result = connectFdeLegacyApiAction("https://compliance-legacy.bankinternal.com/api/v1");
        break;
      case 5:
        result = configureFdeAuthTokenAction("Bearer secure_vault_token_4096");
        break;
      case 6:
        result = toggleFdeSecurityCheckAction("pii-masking");
        break;
      case 7:
        connectFdeAgentNodeAction("planner");
        connectFdeAgentNodeAction("retriever");
        connectFdeAgentNodeAction("tool-caller");
        connectFdeAgentNodeAction("validator");
        result = connectFdeAgentNodeAction("responder");
        break;
      case 8:
        result = configureFdeRagAction(512, "https://qdrant.cluster.internal:6333");
        break;
      case 9:
        result = connectFdeAgentNodeAction("tool-caller");
        break;
      case 10:
        result = toggleFdeSecurityCheckAction("iam-least-privilege");
        break;
      case 11:
        result = toggleFdeSecurityCheckAction("prompt-injection");
        break;
      case 12:
        result = toggleFdeSecurityCheckAction("data-residency");
        break;
      case 13:
      case 14:
      case 15: {
        const validRunbook = `# Enterprise AI System Production Runbook and Architecture Operations

## Architecture and Pipeline Overview
The production pipeline consists of a multi-agent system wired through LangGraph with sequential state transitions: planner, RAG retriever, tool caller, output validator, and responder. All data flows travel through private encrypted VPC Peering interconnects.

## Operations and Production Incident Runbook
1. Check gateway status: curl -f https://agent.corp.internal/health
2. Inspect connection pool saturation in Grafana telemetry dashboards.
3. If P99 latency spikes above 800ms or error rates exceed 5%, trigger automated replica scale-up.
4. Fall back to cached deterministic answers if legacy ERP link becomes unresponsive.

## Troubleshooting and Error Resolution Guide
- HTTP 401 Unauthorized: Rotate enterprise service account secrets in HashiCorp Vault.
- HTTP 503 Service Unavailable: Inspect legacy SOAP bridge health and restart proxy pods.
- Prompt Injection Alert: Quarantine session, append cryptographic SHA-256 hash to SOC2 immutable audit log.
- Post-mortem template: Document root cause, blast radius, error timeline, and remediation items.`;
        result = submitFdeRunbookAction(validRunbook);
        break;
      }
      default:
        break;
    }

    const finalState = useWorkbenchStore.getState().fdeState;
    const validation = currentTask.validate(
      beforeState,
      finalState,
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

      const allCompleted = FDE_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted) {
        setTimeout(() => {
          setFdeVictoryModalOpen(true);
        }, 1200);
      }
    } else {
      audioFx.playErrorBuzz();
      setHasError(true);
      setFeedback(
        String(
          t(
            validation.messageKey || "common.validationFailed",
            result?.output || "Applied AI code verification failed."
          )
        )
      );
    }
  }, [
    activeRound,
    typedCode,
    targetCode,
    currentTask,
    fdeState,
    connectFdeLegacyApiAction,
    configureFdeAuthTokenAction,
    connectFdeAgentNodeAction,
    configureFdeRagAction,
    toggleFdeSecurityCheckAction,
    submitFdeRunbookAction,
    starsEarned,
    roundStartTimeRef,
    setRoundStats,
    setTaskMastery,
    addXp,
    completeCodingTask,
    saveTaskProgress,
    taskMasteryStars,
    setFdeVictoryModalOpen,
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
      <div className="bg-[#110D1B] border border-purple-950/80 p-3 rounded-2xl flex items-center justify-between flex-wrap gap-2 shadow-lg">
        {/* Task Buttons Scroll Container */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {FDE_TASKS.map((task) => {
            const isCurrent = task.id === selectedTaskId;
            const stars = taskMasteryStars[task.id] || 0;
            return (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer select-none shrink-0 ${
                  isCurrent
                    ? "bg-purple-600 text-slate-950 font-extrabold shadow-md shadow-purple-500/20"
                    : stars > 0
                    ? "bg-purple-950/50 text-purple-300 border border-purple-800/60 hover:bg-purple-900/40"
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
          {allFdeTasksCompleted && (
            <button
              onClick={() => setFdeVictoryModalOpen(true)}
              className="px-2.5 py-1 text-xs rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("fde.ui.certButton", "Certificate")}</span>
            </button>
          )}

          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setCodeLang("python")}
              className={`px-2.5 py-1 text-xs rounded font-bold transition-colors cursor-pointer ${
                codeLang === "python"
                  ? "bg-purple-600 text-slate-950 shadow-[0_0_8px_rgba(147,51,234,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Python 3.11
            </button>
            <button
              onClick={() => setCodeLang("typescript")}
              className={`px-2.5 py-1 text-xs rounded font-bold transition-colors cursor-pointer ${
                codeLang === "typescript"
                  ? "bg-cyan-600 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              TypeScript
            </button>
          </div>
        </div>
      </div>

      {/* ── Stakeholder Discovery Dialogue Card (if task has dialogueTree) ── */}
      {currentTask.dialogueTree && (
        <div className="p-4 rounded-xl bg-[#140F22] border-2 border-purple-500/50 shadow-md space-y-3 font-sans">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
                {t("fde.dialogue.title", "Діалог зі стейкхолдерами замовника")}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-300">
              Довіра клієнта: {fdeState.clientTrustScore}%
            </span>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-purple-800/40 text-xs text-slate-200 leading-relaxed italic">
            "{t(currentTask.dialogueTree.npcOpeningKey)}"
          </div>

          {currentTask.dialogueTree.choices.map((choice) => (
            <div key={choice.id} className="space-y-2">
              <p className="text-xs font-semibold text-purple-200 font-mono">
                {t(choice.npcPromptKey)}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {choice.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      handleDialogueChoice(
                        choice.id,
                        opt.isCorrect,
                        opt.xpGain,
                        opt.consequenceKey
                      )
                    }
                    className="p-3 text-left rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/50 text-xs text-slate-100 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <span className="font-bold text-purple-400 mr-2 uppercase font-mono">
                      [{opt.id}]
                    </span>
                    {t(opt.textKey)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Task Info & Mode Tabs ── */}
      <div className="bg-[#0D0917] border border-purple-950 p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-bold rounded">
              TASK {currentTask.order} // 15
            </span>
            <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
              {t(currentTask.roundNameKey, `Round ${currentTask.round}`)}
            </span>
            <h3 className="text-sm font-bold text-slate-200">
              {t(currentTask.titleKey, "Applied AI Objective")}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[11px]">Applied AI / FDE</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          {t(currentTask.descKey, "Design and deploy high-reliability enterprise agent workflows.")}
        </p>

        {/* Popover Tooltip */}
        {showTooltip && (
          <div className="p-3 rounded-xl bg-slate-900 border border-purple-800 text-slate-200 text-xs font-mono leading-relaxed shadow-sm animate-in fade-in flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="font-mono font-bold text-[10px] uppercase text-purple-400 mb-1">
                {t("common.simpleExplanation", "Підказка розгортання")}:
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
              targetCode: adaptedTask.targetCode,
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
                    ? "bg-purple-600 border-purple-600 text-slate-950 font-bold shadow-md"
                    : isUnlocked
                    ? "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-200 hover:border-purple-700/60"
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
        stationId="fde"
      />

      {/* CodeGymEditor */}
      <CodeGymEditor
        currentTask={adaptedTask}
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
        onNextTask={nextTask ? () => handleSelectTask(nextTask.id) : undefined}
        nextTaskAvailable={Boolean(nextTask)}
        isTheoryUnlocked={isTheoryUnlocked}
        onOpenTheory={handleOpenTheory}
      />
    </div>
  );
};
