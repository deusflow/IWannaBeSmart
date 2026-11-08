/**
 * @file apps/web/src/components/workbench/playground/CyberCodeGymRunner.tsx
 * @description 4-Round Code Gym muscle memory engine for Google Cybersecurity & SOC Analyst Track.
 * Manages tasks 1..8: Syslog Parsing, Threat Hunting, Packet Dissection, SYN Flood Detection,
 * ARP Poisoning, Credential Sniffing, MITRE ATT&CK Triage, and NIST CSF Containment.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Trophy, Flame, ShieldAlert, Lock, ShieldCheck } from "lucide-react";
import { CYBER_TASKS, type CyberTask } from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../utils/audioFx";
import { GuidedStepBar } from "./GuidedStepBar";
import { ProjectExplorerBar } from "./ProjectExplorerBar";
import { useCodeGymSession } from "./useCodeGymSession";
import { CodeGymEditor } from "./CodeGymEditor";
import { getStationCheckpoint } from "../../../utils/checkpointManager";
import {
  PredictObserveExplainModal,
  StationCrashTestGateModal,
} from "../labs";

const collapseWs = (s: string) => s.replace(/\s+/g, " ").trim();
const stripComments = (str: string) =>
  str.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").replace(/#.*/g, "").trim();

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
  const [isPoeModalOpen, setIsPoeModalOpen] = useState(false);
  const [isCrashGateOpen, setIsCrashGateOpen] = useState(false);
  const allCyberTasksCompleted = useMemo(
    () => CYBER_TASKS.every((task) => (taskMasteryStars[task.id] || 0) >= 1),
    [taskMasteryStars]
  );

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
    setRoundStats,
    roundStartTimeRef,
    gutterWidth,
    editorContainerRef,
    targetCode,
    clozeTemplate,
    traceCharsMatched,
    sprintLimit,
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
    onRoundComplete: async (round, _code, stats) => {
      const targetStars = round ?? 1;
      const currentStars = taskMasteryStars[currentTask.id] || 0;
      setTaskMastery(currentTask.id, targetStars, stats?.wpm);
      saveTaskProgress(currentTask.id, targetStars, stats?.wpm);
      completeCodingTask(currentTask.id);
      if (targetStars > currentStars) {
        addXp((targetStars - currentStars) * 25);
      }
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
    const currentStars = taskMasteryStars[currentTask.id] || 0;

    if (activeRound === 1) {
      if (collapseWs(typedCode) === collapseWs(targetCode)) {
        setRoundCompleted(true);
        audioFx.playSuccessFanfare();
        setTaskMastery(currentTask.id, 1);
        saveTaskProgress(currentTask.id, 1);
        completeCodingTask(currentTask.id);
        if (1 > currentStars) {
          addXp(15);
        }
      } else {
        setHasError(true);
        audioFx.playErrorBuzz();
        setFeedback(t("codegym.mismatchPrompt", "Символ не відповідає трафарету."));
      }
    } else if (activeRound === 2) {
      const isUnfilled = typedCode.includes("/*") || typedCode.includes("___");
      if (isUnfilled) {
        setHasError(true);
        audioFx.playErrorBuzz();
        setFeedback(t("codegym.fillBlanksPrompt", "Заповніть усі прогалини перед перевіркою!"));
        return;
      }
      if (collapseWs(typedCode) === collapseWs(targetCode)) {
        setRoundCompleted(true);
        audioFx.playSuccessFanfare();
        setTaskMastery(currentTask.id, 2);
        saveTaskProgress(currentTask.id, 2);
        completeCodingTask(currentTask.id);
        if (2 > currentStars) {
          addXp((2 - currentStars) * 25);
        }
      } else {
        setHasError(true);
        audioFx.playErrorBuzz();
        setFeedback(t("codegym.clozeMismatchPrompt", "Невірне заповнення прогалин!"));
      }
    } else if (activeRound === 3) {
      if (!isTimerRunning) {
        handleStartSprint();
      } else {
        if (collapseWs(typedCode) === collapseWs(targetCode)) {
          setRoundCompleted(true);
          audioFx.playSuccessFanfare();
          const elapsedMinutes = Math.max(
            0.04,
            (Date.now() - (roundStartTimeRef.current || Date.now())) / 60000
          );
          const calculatedWpm = Math.round(targetCode.length / 5 / elapsedMinutes);
          setRoundStats({ wpm: calculatedWpm, accuracy: 100 });
          setTaskMastery(currentTask.id, 3, calculatedWpm);
          saveTaskProgress(currentTask.id, 3, calculatedWpm);
          completeCodingTask(currentTask.id);
          if (3 > currentStars) {
            addXp((3 - currentStars) * 25);
          }
        } else {
          setHasError(true);
          audioFx.playErrorBuzz();
          setFeedback(t("codegym.sprintMismatch", "Код не відповідає еталону спринту!"));
        }
      }
    } else if (activeRound === 4) {
      const cleanCode = stripComments(typedCode);
      const hasStructure =
        cleanCode.length >= 40 &&
        (cleanCode.includes("def ") ||
          cleanCode.includes("function ") ||
          cleanCode.includes("return") ||
          cleanCode.includes("=>") ||
          cleanCode.includes("class ") ||
          cleanCode.includes("export "));

      if (hasStructure) {
        setRoundCompleted(true);
        audioFx.playSuccessFanfare();
        setTaskMastery(currentTask.id, 4);
        saveTaskProgress(currentTask.id, 4);
        completeCodingTask(currentTask.id);
        if (4 > currentStars) {
          addXp((4 - currentStars) * 25);
        }

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
    taskMasteryStars,
    roundStartTimeRef,
    handleStartSprint,
    setRoundCompleted,
    setHasError,
    setFeedback,
    setRoundStats,
    setTaskMastery,
    saveTaskProgress,
    completeCodingTask,
    addXp,
    setCyberVictoryModalOpen,
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
    <div className="w-full flex flex-col gap-4 font-sans select-none max-w-4xl mx-auto">
      {/* ── Top Header: Task Selector, Title & Mastery Stars ── */}
      <div className="p-4 rounded-2xl bg-white border border-black/[0.07] shadow-porcelain space-y-3.5">
        {/* Task Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {CYBER_TASKS.map((task) => {
            const isSelected = task.id === selectedTaskId;
            const stars = taskMasteryStars[task.id] || 0;
            return (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#252932] border-[#252932] text-white shadow-sm"
                    : "bg-white hover:bg-slate-50 border-black/[0.06] hover:border-black/[0.14] text-obsidian shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase ${
                      isSelected ? "text-[#C5A059]" : "text-slate-500"
                    }`}
                  >
                    #{task.order} SOC
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4].map((s) => (
                      <span
                        key={s}
                        className={
                          stars >= s
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
                    isSelected ? "text-white" : "text-obsidian"
                  }`}
                >
                  {t(task.titleKey, task.id)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Task Title & Lab Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-black/[0.06] flex items-center justify-center text-[#252932] shadow-2xs">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-black/[0.06]">
                  Google SOC Defense Gym
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  SIEM & Network Defense
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-obsidian mt-0.5">
                {t(currentTask.titleKey, currentTask.id)}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                audioFx.playRelayClick();
                setIsPoeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-black/[0.08] text-slate-700 font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
              title={t("labs.poe.btnTooltip", "Живий симулятор: Що вибухне? (Predict-Observe-Explain)")}
            >
              <Flame size={13} className="text-amber-600" />
              <span className="hidden sm:inline">{t("labs.poe.btnLabel", "Що вибухне?")}</span>
            </button>

            <button
              onClick={() => {
                if (!allCyberTasksCompleted) {
                  audioFx.playErrorBuzz();
                  return;
                }
                audioFx.playWarRoomSiren();
                setIsCrashGateOpen(true);
              }}
              disabled={!allCyberTasksCompleted}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all shadow-2xs ${
                allCyberTasksCompleted
                  ? "bg-[#252932] hover:bg-[#1A1D24] text-white border-black/[0.12] cursor-pointer active:scale-95"
                  : "bg-slate-100/70 border-black/[0.06] text-slate-400 cursor-not-allowed opacity-60"
              }`}
              title={
                allCyberTasksCompleted
                  ? t("labs.crash.btnTooltip", "Атестаційний краш-тест станції (Certification Drill)")
                  : t("labs.crash.btnLockedTooltip", "Краш-тест заблоковано: спочатку вирішіть усі завдання станції")
              }
            >
              {allCyberTasksCompleted ? (
                <ShieldAlert size={13} className="text-[#C5A059]" />
              ) : (
                <Lock size={13} className="text-slate-400" />
              )}
              <span className="hidden sm:inline">{t("labs.crash.btnLabel", "Краш-тест")}</span>
            </button>

            {allCyberTasksCompleted && (
              <button
                onClick={() => setCyberVictoryModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-[#C5A059] border border-[#C5A059]/40 font-display font-extrabold text-xs shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Trophy size={14} className="text-[#C5A059]" />
                <span>{t("codegym.certificateBtn", "Сертифікат")}</span>
              </button>
            )}

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-black/[0.06]">
              <button
                onClick={() => setCodeLang("python")}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                  codeLang === "python"
                    ? "bg-[#252932] text-white shadow-2xs"
                    : "text-slate-600 hover:text-obsidian"
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setCodeLang("typescript")}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                  codeLang === "typescript"
                    ? "bg-[#252932] text-white shadow-2xs"
                    : "text-slate-600 hover:text-obsidian"
                }`}
              >
                TypeScript
              </button>
            </div>
          </div>
        </div>

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

      <PredictObserveExplainModal
        isOpen={isPoeModalOpen}
        onClose={() => setIsPoeModalOpen(false)}
        stationId="cyber"
      />

      <StationCrashTestGateModal
        isOpen={isCrashGateOpen}
        onClose={() => setIsCrashGateOpen(false)}
        stationId="cyber"
        onPassed={() => {
          if (allCyberTasksCompleted) {
            audioFx.playSuccessFanfare();
            setCyberVictoryModalOpen(true);
          }
        }}
      />
    </div>
  );
};
