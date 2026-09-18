/**
 * @file apps/web/src/components/workbench/playground/BanditCodeGymRunner.tsx
 * @description 3-Star Code Gym muscle memory engine for Station 06: Cyber Bandit Lab
 * Trace -> Cloze -> Sprint -> Architecture for Tasks 1..6 (C# & Go)
 */

import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Star,
  Trophy,
  X,
  Flag,
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
  } = useWorkbenchStore(
    useShallow((s) => ({
      banditState: s.banditState,
      taskMasteryStars: s.taskMasteryStars,
      setTaskMastery: s.setTaskMastery,
      saveTaskProgress: s.saveTaskProgress,
      completeCodingTask: s.completeCodingTask,
      addXp: s.addXp,
      setBanditVictoryModalOpen: s.setBanditVictoryModalOpen,
    }))
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string>(BANDIT_TASKS[0].id);
  const currentTask: BanditTask = useMemo(
    () => BANDIT_TASKS.find((t) => t.id === selectedTaskId) || BANDIT_TASKS[0],
    [selectedTaskId]
  );

  const starsEarned = taskMasteryStars[currentTask.id] || 0;

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
    onRoundComplete: async (round) => {
      const targetStars = round ?? 1;
      setTaskMastery(currentTask.id, targetStars);
      saveTaskProgress(currentTask.id, targetStars);
      completeCodingTask(currentTask.id);
      addXp(targetStars * 15);
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
    },
    [selectedTaskId, setActiveRound, setShowTooltip, setShowTransferHint]
  );

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
    starsEarned,
    roundStartTimeRef,
    setRoundStats,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    setBanditVictoryModalOpen,
    setHasError,
    setFeedback,
    setRoundCompleted,
    taskMasteryStars,
    t,
  ]);

  return (
    <div className="w-full flex flex-col gap-4 font-mono select-none">
      {/* ── Top Bar: Task Navigation & Language Switcher ─────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070B12] border border-emerald-900/50 p-3 rounded-xl shadow-lg">
        {/* Task tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {BANDIT_TASKS.map((task) => {
            const isSelected = task.id === currentTask.id;
            const stars = taskMasteryStars[task.id] || 0;
            return (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-emerald-600 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    : stars > 0
                    ? "bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/40"
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

        {/* Language Tabs & All-Tasks Certificate trigger */}
        <div className="flex items-center gap-2">
          {allBanditTasksCompleted && (
            <button
              onClick={() => setBanditVictoryModalOpen(true)}
              className="px-2.5 py-1 text-xs rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("bandit.ui.certButton", "Certificate")}</span>
            </button>
          )}

          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setCodeLang("csharp")}
              className={`px-2.5 py-1 text-xs rounded font-bold transition-colors ${
                codeLang === "csharp"
                  ? "bg-emerald-600 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              C# (.NET)
            </button>
            <button
              onClick={() => setCodeLang("go")}
              className={`px-2.5 py-1 text-xs rounded font-bold transition-colors ${
                codeLang === "go"
                  ? "bg-cyan-600 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Go (crypto)
            </button>
          </div>
        </div>
      </div>

      {/* ── Task Info & Mode Tabs ───────────────────────────────────── */}
      <div className="bg-[#070B12] border border-emerald-950 p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-bold rounded">
              TASK {currentTask.order} // 6
            </span>
            <h3 className="text-sm font-bold text-slate-200">
              {t(currentTask.titleKey, "Security Objective")}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <Flag className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-mono">
              FLAG: {currentTask.flag}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t(currentTask.descKey, "Implement robust defensive code to pass penetration testing.")}
        </p>

        {/* Parchment Tooltip popover */}
        {showTooltip && (
          <div className="p-3 rounded-xl bg-slate-900 border border-emerald-800 text-slate-200 text-xs font-mono leading-relaxed shadow-sm animate-in fade-in flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="font-mono font-bold text-[10px] uppercase text-emerald-400 mb-1">
                {t("common.simpleExplanation", "Підказка безпеки")}:
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
                    ? "bg-[#10B981] border-[#10B981] text-slate-950 font-bold shadow-md"
                    : isUnlocked
                    ? "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-200 hover:border-emerald-700/60"
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
      />
    </div>
  );
};
