/**
 * @file apps/web/src/components/workbench/playground/BanditCodeGymRunner.tsx
 * @description 3-Star Code Gym muscle memory engine for Station 06: Cyber Bandit Lab
 * Trace -> Cloze -> Sprint -> Architecture for Tasks 1..6 (C# & Go)
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Star,
  Trophy,
  X,
  Shield,
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
    currentTask: {
      ...currentTask,
      initialCode: {
        csharp: currentTask.targetCode.csharp,
        go: currentTask.targetCode.go,
      },
      clozeTemplate: currentTask.clozeTemplate,
    },
    onRoundComplete: async () => {
      setTaskMastery(currentTask.id, 1);
      completeCodingTask(currentTask.id);
      addXp(15);
    },
  });

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

      const targetStars = activeRound === 1 ? 1 : activeRound === 2 ? 2 : 3;
      if (starsEarned < targetStars) {
        setTaskMastery(currentTask.id, targetStars);
        addXp(activeRound * 25);
        completeCodingTask(currentTask.id);
      }

      saveTaskProgress(currentTask.id, activeRound, targetStars);

      // Check if all 6 Bandit tasks are completed
      const allCompleted = BANDIT_TASKS.every(
        (task) =>
          task.id === currentTask.id || (taskMasteryStars[task.id] || 0) >= 1
      );
      if (allCompleted && activeRound >= 2) {
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
    codeLang,
    currentTask,
    banditState,
    starsEarned,
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
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= stars
                          ? "text-amber-400 fill-amber-400"
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

      {/* ── Round Selector & Explorer Bar ────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070B12] border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          {[
            { round: 1, label: t("codegym.round1", "Round 1: Trace"), desc: "Type matching code line-by-line" },
            { round: 2, label: t("codegym.round2", "Round 2: Cloze"), desc: "Fill in security critical blanks" },
            { round: 3, label: t("codegym.round3", "Round 3: Sprint"), desc: "Speed muscle memory sprint" },
            { round: 4, label: t("codegym.round4", "Round 4: Architecture"), desc: "DevOps & Security Architecture" },
          ].map((r) => {
            const isActive = activeRound === r.round;
            return (
              <button
                key={r.round}
                onClick={() => {
                  audioFx.playKeyClick();
                  setActiveRound(r.round as 1 | 2 | 3 | 4);
                }}
                className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
                title={r.desc}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Timer status if Round 3 */}
        {activeRound === 3 && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Time:</span>
            <span
              className={`font-bold ${
                timeLeft <= 5 ? "text-rose-400 animate-pulse" : "text-amber-400"
              }`}
            >
              {timeLeft}s
            </span>
            {!isTimerRunning && (
              <button
                onClick={handleStartSprint}
                className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs transition-colors"
              >
                Start Sprint
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Task Info Box ─────────────────────────────────────────────── */}
      <div className="bg-[#070B12] border border-emerald-950 p-3 rounded-xl space-y-1">
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
      </div>

      {/* ── Editor Container with Project Explorer ───────────────────── */}
      <div className="bg-[#05080E] border border-emerald-950 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <ProjectExplorerBar
          fileName={fileName}
          codeLang={codeLang}
          activeRound={activeRound}
          gutterWidth={gutterWidth}
          roundStats={roundStats}
          onResetRound={handleResetRound}
          onShowHint={() => setShowTooltip(true)}
        />

        <div ref={editorContainerRef} className="p-3 min-h-[280px]">
          <CodeGymEditor
            codeLang={codeLang}
            activeRound={activeRound}
            targetCode={targetCode}
            clozeTemplate={clozeTemplate}
            typedCode={typedCode}
            onCodeChange={handleCodeChange}
            traceCharsMatched={traceCharsMatched}
            gutterWidth={gutterWidth}
          />
        </div>

        {/* Feedback / Error banner */}
        {feedback && (
          <div
            className={`p-3 border-t text-xs font-mono flex items-center justify-between ${
              hasError
                ? "bg-rose-950/60 border-rose-900 text-rose-300"
                : "bg-emerald-950/60 border-emerald-900 text-emerald-300"
            }`}
          >
            <span>{feedback}</span>
            <button onClick={() => setFeedback("")}>
              <X className="w-4 h-4 text-slate-400 hover:text-slate-200" />
            </button>
          </div>
        )}

        {/* Bottom Verify Action Bar */}
        <div className="flex items-center justify-between p-3 bg-slate-950 border-t border-slate-900">
          <button
            onClick={handleResetRound}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded transition-colors"
          >
            Reset Round
          </button>

          <div className="flex items-center gap-2">
            {roundCompleted && nextTask && (
              <button
                onClick={() => handleSelectTask(nextTask.id)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded transition-colors"
              >
                Next Task (T{nextTask.order}) -&gt;
              </button>
            )}
            <button
              onClick={handleVerify}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded transition-colors shadow-[0_0_12px_rgba(16,185,129,0.4)] flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Verify Security Defense</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
