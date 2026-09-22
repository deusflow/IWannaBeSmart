/**
 * @file apps/web/src/components/workbench/trace/ExecutionFlowPlayer.tsx
 * @description Master interactive player for multi-file Execution Flow Tracing.
 *              Fuses Predict-Observe-Explain (POE), Mayer's Signaling Principle,
 *              Notional Machine stack unwinding, and Anti-Transient breadcrumb history.
 *              Supports Dual-View: In-Situ Dock HUD (non-blocking) and Full Studio.
 */

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Folder,
  FolderTree,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Code2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Trophy,
} from "lucide-react";
import {
  TracePlaybackController,
  getStationTrace,
  resolveLocalizedText,
  type ExecutionTraceTimeline,
  type TracePlayerState,
} from "@iw/sim-engine";
import { audioFx } from "../../../utils/audioFx";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { toast } from "../../../store/toastStore";
import { ArchitecturalBreadcrumbTrail } from "./ArchitecturalBreadcrumbTrail";
import { SyncedProjectFolderTree } from "./SyncedProjectFolderTree";
import { ReturnValueInspector } from "./ReturnValueInspector";
import { getStationProjectFiles } from "../playground/stationProjectData";

interface ExecutionFlowPlayerProps {
  stationId: string;
  isOpen: boolean;
  onClose: () => void;
  timelineOverride?: ExecutionTraceTimeline;
  className?: string;
}

export const ExecutionFlowPlayer: React.FC<ExecutionFlowPlayerProps> = ({
  stationId,
  isOpen,
  onClose,
  timelineOverride,
  className = "",
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.startsWith("da")
    ? "da"
    : i18n.language?.startsWith("en")
    ? "en"
    : "ua") as "ua" | "en" | "da";

  const timeline = useMemo(
    () => timelineOverride || getStationTrace(stationId),
    [timelineOverride, stationId]
  );

  const [enablePoe, setEnablePoe] = useState(true);
  const [displayMode, setDisplayMode] = useState<"dock" | "modal">("dock");
  const [dockTab, setDockTab] = useState<"code" | "tree">("code");

  const controller = useMemo(() => {
    return new TracePlaybackController({
      timeline,
      enablePoe: true,
      autoPlayIntervalMs: 2000,
    });
  }, [timeline]);

  const [playerState, setPlayerState] = useState<TracePlayerState>(() => controller.getState());
  const addXp = useWorkbenchStore((s) => s.addXp);
  const [hasCompleted, setHasCompleted] = useState(false);
  const awardedRef = React.useRef(false);

  useEffect(() => {
    const unsubscribe = controller.subscribe((s) => setPlayerState(s));
    return () => {
      controller.dispose();
      unsubscribe();
    };
  }, [controller]);

  useEffect(() => {
    if (playerState.currentStepIndex === timeline.steps.length - 1 && !awardedRef.current) {
      awardedRef.current = true;
      setHasCompleted(true);
      if (enablePoe && playerState.poeScore.total > 0) {
        const bonus = playerState.poeScore.correct * 15;
        const totalXp = 50 + bonus;
        addXp(totalXp);
        toast.success(
          currentLang === "en"
            ? `🎉 Flow Trace Mastered! +${totalXp} XP (${playerState.poeScore.correct}/${playerState.poeScore.total} predictions)`
            : currentLang === "da"
            ? `🎉 Flow Trace Mestret! +${totalXp} XP (${playerState.poeScore.correct}/${playerState.poeScore.total} forudsigelser)`
            : `🎉 Потік виконання опановано! +${totalXp} XP (${playerState.poeScore.correct}/${playerState.poeScore.total} передбачень)`
        );
        audioFx.playSuccessFanfare();
      } else {
        addXp(10);
        toast.info(
          currentLang === "en"
            ? "👁️ Demo Mode completed (+10 XP). Enable POE to earn full mastery stars!"
            : currentLang === "da"
            ? "👁️ Demo Mode fuldført (+10 XP). Aktiver POE for fuld mestring!"
            : "👁️ Демо-перегляд завершено (+10 XP). Увімкніть POE для повних балів майстерності!"
        );
      }
    }
  }, [
    playerState.currentStepIndex,
    timeline.steps.length,
    enablePoe,
    playerState.poeScore,
    addXp,
    currentLang,
  ]);

  const currentStep = controller.getCurrentStep();
  const breadcrumbs = controller.getBreadcrumbHistory();

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable ||
        Boolean(target?.closest(".cm-editor"))
      ) {
        return;
      }

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        controller.togglePlay();
      } else if (e.key === "ArrowRight" || e.key === "l") {
        e.preventDefault();
        controller.stepForward();
      } else if (e.key === "ArrowLeft" || e.key === "j") {
        e.preventDefault();
        controller.stepBackward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, controller, onClose]);

  const handleStepForward = () => {
    audioFx.playKeyClick();
    controller.stepForward();
  };

  const handleStepBackward = () => {
    audioFx.playKeyClick();
    controller.stepBackward();
  };

  const handleTogglePlay = () => {
    audioFx.playRelayClick();
    controller.togglePlay();
  };

  const handleReset = () => {
    audioFx.playRelayClick();
    awardedRef.current = false;
    setHasCompleted(false);
    controller.reset();
  };

  const handleSeek = (index: number) => {
    audioFx.playKeyClick();
    controller.seekTo(index);
  };

  const handleSpeedChange = (speed: number) => {
    audioFx.playKeyClick();
    controller.setSpeed(speed);
  };

  const handleTogglePoe = () => {
    const next = !enablePoe;
    setEnablePoe(next);
    controller.setEnablePoe(next);
  };

  const handleAnswerPoe = (optionId: string) => {
    const res = controller.answerPoe(optionId);
    if (res?.isCorrect) {
      audioFx.playSuccessFanfare();
      if (displayMode === "dock") {
        setDockTab("code");
      }
    } else {
      audioFx.playErrorBuzz();
    }
  };

  const projectFiles = useMemo(() => {
    const activeStation = timeline.stationId || stationId;
    const files = getStationProjectFiles(activeStation, false, timeline.language, "");
    return files[0]?.children || [];
  }, [timeline.stationId, stationId, timeline.language]);

  if (!isOpen) return null;

  const titleText =
    typeof timeline.title === "string"
      ? timeline.title
      : timeline.title[currentLang] || timeline.title.ua || "";

  const descText =
    typeof timeline.description === "string"
      ? timeline.description
      : timeline.description[currentLang] || timeline.description.ua || "";

  const explanationText = currentStep
    ? typeof currentStep.explanation === "string"
      ? currentStep.explanation
      : currentStep.explanation[currentLang] || currentStep.explanation.ua || ""
    : "";

  const isDock = displayMode === "dock";

  const poeStatusText = enablePoe
    ? currentLang === "en"
      ? "Active"
      : currentLang === "da"
      ? "Aktiv"
      : "Активне"
    : currentLang === "en"
    ? "Auto"
    : currentLang === "da"
    ? "Auto"
    : "Авто";

  const poeTooltip =
    currentLang === "en"
      ? "Predict-Observe-Explain: interactive checkpoints before code execution jumps"
      : currentLang === "da"
      ? "Predict-Observe-Explain: interaktive checkpoints før eksekveringshop"
      : "Predict-Observe-Explain: інтерактивні запитання перед переходами";

  const displayModeTooltip = isDock
    ? currentLang === "en"
      ? "Expand to Full Studio"
      : currentLang === "da"
      ? "Udvid til Full Studio"
      : "Розгорнути в Full Studio"
    : currentLang === "en"
    ? "Collapse to Dock HUD"
    : currentLang === "da"
    ? "Skjul til Dock HUD"
    : "Згорнути в компактний Dock";

  const closeAriaLabel =
    currentLang === "en"
      ? "Close Execution Flow Visualizer"
      : currentLang === "da"
      ? "Luk Execution Flow Visualizer"
      : "Закрити візуалізатор ланцюга виконання";

  const codeTabLabel =
    currentLang === "en" ? "Code & POE" : currentLang === "da" ? "Kode & POE" : "Код та POE";

  const treeTabLabel =
    currentLang === "en"
      ? "Solution Tree & Stack"
      : currentLang === "da"
      ? "Projekttræ & Stak"
      : "Дерево проєкту та Стек";

  const didacticFocusLabel =
    currentLang === "en"
      ? `Didactic focus (Step ${playerState.currentStepIndex + 1}/${timeline.totalSteps}):`
      : currentLang === "da"
      ? `Didaktisk fokus (Trin ${playerState.currentStepIndex + 1}/${timeline.totalSteps}):`
      : `Дидактичний фокус кроку (${playerState.currentStepIndex + 1}/${timeline.totalSteps}):`;

  const poeCardBadge = playerState.isWaitingForPoe
    ? currentLang === "en"
      ? "Prediction Checkpoint (Predict-Observe-Explain)"
      : currentLang === "da"
      ? "Forudsigelses-checkpoint"
      : "Контрольне передбачення (Predict-Observe-Explain)"
    : currentLang === "en"
    ? "Prediction Result"
    : currentLang === "da"
    ? "Forudsigelsesresultat"
    : "Результат передбачення";

  const feedbackHeading = playerState.poeResult?.isCorrect
    ? currentLang === "en"
      ? "Excellent!"
      : currentLang === "da"
      ? "Fremragende!"
      : "Чудово!"
    : currentLang === "en"
    ? "Not quite."
    : currentLang === "da"
    ? "Ikke helt."
    : "Не зовсім так.";

  const continueButtonText =
    currentLang === "en"
      ? "Continue Execution Chain"
      : currentLang === "da"
      ? "Fortsæt eksekveringskæde"
      : "Продовжити ланцюг виконання";

  const exploreInTreeText =
    currentLang === "en"
      ? "Inspect target in Solution Tree"
      : currentLang === "da"
      ? "Undersøg mål i projekttræ"
      : "Оглянути ціль у дереві проєкту";

  const resetTooltip =
    currentLang === "en"
      ? "Reset to start"
      : currentLang === "da"
      ? "Nulstil til start"
      : "Перезапустити спочатку";

  const stepBackTooltip =
    currentLang === "en"
      ? "Step backward [← / J]"
      : currentLang === "da"
      ? "Trin tilbage [← / J]"
      : "Крок назад [← / J]";

  const stepForwardTooltip =
    currentLang === "en"
      ? "Step forward [→ / L]"
      : currentLang === "da"
      ? "Trin frem [→ / L]"
      : "Крок вперед [→ / L]";

  const playPauseText = playerState.isPlaying
    ? currentLang === "en"
      ? "Pause"
      : currentLang === "da"
      ? "Pause"
      : "Пауза"
    : currentLang === "en"
    ? "Play"
    : currentLang === "da"
    ? "Kør"
    : "Запуск";

  return (
    <div
      className={
        isDock
          ? `fixed bottom-3 right-3 sm:right-6 left-3 sm:left-auto sm:w-[720px] max-h-[82vh] z-40 flex flex-col rounded-2xl border-2 border-blue-500/60 bg-[#070A10]/95 backdrop-blur-xl text-slate-100 shadow-[0_10px_50px_rgba(0,0,0,0.85)] overflow-hidden animate-fadeIn ${className}`
          : `fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn ${className}`
      }
      data-testid="execution-flow-player-modal"
    >
      <div
        className={
          isDock
            ? "flex flex-col w-full h-full overflow-hidden"
            : "relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-700/80 bg-[#070A10] text-slate-100 shadow-2xl overflow-hidden"
        }
      >
        {/* ── Top Header ── */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0C111B] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-xs sm:text-sm text-white tracking-wide truncate">
                  {titleText}
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-700/50 uppercase shrink-0">
                  {timeline.language}
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700 uppercase shrink-0">
                  Station: {stationId}
                </span>
              </div>
              {!isDock && (
                <p className="text-xs text-slate-400 truncate max-w-xl">{descText}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* POE Mode Toggle */}
            <button
              onClick={handleTogglePoe}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                enablePoe
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-300"
              }`}
              title={poeTooltip}
            >
              <HelpCircle className="w-3 h-3" />
              <span className="hidden sm:inline">POE:</span>
              <span>{poeStatusText}</span>
            </button>

            {/* Toggle Dock / Modal */}
            <button
              onClick={() => {
                audioFx.playRelayClick();
                setDisplayMode(isDock ? "modal" : "dock");
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={displayModeTooltip}
              aria-label="Toggle display mode"
            >
              {isDock ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={closeAriaLabel}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Persistent Breadcrumb Trail (Anti-Transient Sweller Shield) ── */}
        <ArchitecturalBreadcrumbTrail
          breadcrumbs={breadcrumbs}
          currentStepIndex={playerState.currentStepIndex}
          onSeek={handleSeek}
        />

        {/* ── Dock View Switcher (Tabs when in In-Situ Dock HUD) ── */}
        {isDock && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0E17] border-b border-slate-800 text-[11px] font-mono shrink-0">
            <button
              onClick={() => setDockTab("code")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                dockTab === "code"
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{codeTabLabel}</span>
            </button>

            <button
              onClick={() => setDockTab("tree")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                dockTab === "tree"
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>{treeTabLabel}</span>
              {playerState.isWaitingForPoe && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping ml-0.5" />
              )}
            </button>
          </div>
        )}

        {/* ── Main Workspace ── */}
        <div className={`grid ${isDock ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"} flex-1 overflow-hidden min-h-0 bg-[#080C14]`}>
          {/* Left Column: Solution Explorer & Stack (Shown in Full Studio mode or when Dock Tab is 'tree') */}
          {(!isDock || dockTab === "tree") && (
            <div className={`${isDock ? "col-span-1" : "lg:col-span-4 border-r border-slate-800/80"} p-3 flex flex-col gap-3 overflow-y-auto scrollbar-thin`}>
              <SyncedProjectFolderTree
                files={projectFiles}
                activeFileId={currentStep?.location.fileId || ""}
                activeFolderId={currentStep?.location.folderId}
                isWaitingForPoe={playerState.isWaitingForPoe}
                onPoeTargetSelect={(fileId) => {
                  if (currentStep?.poeQuestion) {
                    const opt = currentStep.poeQuestion.options.find((o) => {
                      if (
                        o.targetFileId &&
                        (o.targetFileId === fileId ||
                          fileId.includes(o.targetFileId) ||
                          o.targetFileId.includes(fileId))
                      ) {
                        return true;
                      }
                      const labelText = resolveLocalizedText(o.label, currentLang).toLowerCase();
                      const cleanFile = fileId.replace(/[-_.]/g, "").toLowerCase();
                      const cleanLabel = labelText.replace(/[-_.]/g, "").toLowerCase();
                      return o.id.includes(fileId) || cleanLabel.includes(cleanFile);
                    });
                    if (opt) handleAnswerPoe(opt.id);
                  }
                }}
              />

              <ReturnValueInspector
                returnValue={currentStep?.returnValue}
                currentLocation={
                  currentStep?.location || {
                    folderId: "",
                    folderName: "",
                    fileId: "",
                    fileName: "",
                    lineStart: 0,
                    lineEnd: 0,
                    symbol: "",
                  }
                }
                targetLocation={currentStep?.targetLocation}
                callStack={currentStep?.callStack || []}
                scopeVariables={currentStep?.scopeVariables}
              />
            </div>
          )}

          {/* Right Column (or Full in Dock when dockTab === 'code'): Code & Didactic / POE Panel */}
          {(!isDock || dockTab === "code") && (
            <div className={`${isDock ? "col-span-1" : "lg:col-span-8"} p-3 flex flex-col gap-2.5 overflow-y-auto scrollbar-thin`}>
              {/* Active Code Frame with Folder -> File -> Line -> Symbol Signaling */}
              <div className="rounded-xl border border-slate-800 bg-[#0A0E17] overflow-hidden flex flex-col shadow-inner">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#0E131E] border-b border-slate-800/80 text-xs font-mono">
                  <div className="flex items-center gap-1.5 truncate text-slate-300">
                    <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-amber-300 font-semibold">{currentStep?.location.folderName || "Root"}</span>
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <Code2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-semibold text-slate-200 truncate">
                      {currentStep?.location.fileName}
                    </span>
                    <span className="text-slate-400 text-[11px] shrink-0">
                      L{currentStep?.location.lineStart}–L{currentStep?.location.lineEnd}
                    </span>
                  </div>
                  {currentStep?.type === "branch_eval" ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px] border border-amber-500/40 shrink-0">
                      BRANCH: {currentStep.location.symbol}
                    </span>
                  ) : currentStep?.type === "return_unwind" ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px] border border-emerald-500/40 shrink-0">
                      RETURN: {currentStep.location.symbol}
                    </span>
                  ) : currentStep?.type === "exception" ? (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px] border border-rose-500/40 shrink-0">
                      EXCEPTION: {currentStep.location.symbol}
                    </span>
                  ) : currentStep?.type === "folder_enter" ? (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 font-semibold text-[10px] border border-cyan-700/40 shrink-0">
                      ENTRY: {currentStep.location.symbol}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 font-semibold text-[10px] border border-blue-800/40 shrink-0">
                      {currentStep?.location.symbol}
                    </span>
                  )}
                </div>

                <div
                  className={`font-mono text-xs text-slate-300 bg-[#06080D] overflow-x-auto overflow-y-auto leading-relaxed divide-y divide-slate-900/60 ${
                    isDock ? "max-h-[140px]" : "max-h-[220px]"
                  }`}
                >
                  {(currentStep?.location.codeSnippet || "// Executing method instructions...")
                    .split("\n")
                    .map((line, idx) => {
                      const lineNum = (currentStep?.location.lineStart || 1) + idx;
                      const isTargetLine = idx === 0;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center px-2 py-0.5 transition-colors group ${
                            isTargetLine
                              ? "bg-blue-600/20 text-blue-100 font-medium border-l-2 border-cyan-400"
                              : "hover:bg-slate-900/40 text-slate-300"
                          }`}
                        >
                          <span
                            className={`w-8 text-right pr-2 text-[10px] select-none shrink-0 font-mono ${
                              isTargetLine ? "text-cyan-400 font-bold" : "text-slate-600"
                            }`}
                          >
                            {lineNum}
                          </span>
                          <span className="w-4 text-center pr-1 text-[10px] shrink-0 select-none">
                            {isTargetLine ? (
                              <span className="text-cyan-400 animate-pulse font-bold">➔</span>
                            ) : (
                              <span className="text-slate-700">·</span>
                            )}
                          </span>
                          <span className="whitespace-pre font-mono selection:bg-blue-600/40 text-[11px]">
                            {line}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Completion & Gamification Mastery Banner */}
              {hasCompleted && (
                <div className="p-3 rounded-xl border border-emerald-500/50 bg-emerald-950/30 flex items-center justify-between text-xs text-emerald-200 shadow-sm animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-emerald-300">
                        {currentLang === "en"
                          ? "Execution Flow Mastered!"
                          : currentLang === "da"
                          ? "Eksekvering fuldført!"
                          : "Ланцюг виконання опановано!"}
                      </span>
                      <span className="text-[11px] text-emerald-400/90">
                        {enablePoe
                          ? `${
                              currentLang === "en"
                                ? "POE Score:"
                                : currentLang === "da"
                                ? "POE Score:"
                                : "Точність POE:"
                            } ${playerState.poeScore.correct}/${playerState.poeScore.total} (${Math.round(
                              (playerState.poeScore.correct / Math.max(1, playerState.poeScore.total)) * 100
                            )}%)`
                          : currentLang === "en"
                          ? "Demo Mode (Observation)"
                          : currentLang === "da"
                          ? "Demo Mode"
                          : "Демо-режим (Спостереження)"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] font-mono transition-all cursor-pointer shrink-0"
                  >
                    {currentLang === "en" ? "Replay Flow" : currentLang === "da" ? "Genspil" : "Повторити"}
                  </button>
                </div>
              )}

              {/* Didactic Step Explanation */}
              <div className="p-2.5 rounded-xl border border-blue-900/40 bg-blue-950/15 text-xs text-blue-100 flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-blue-300 block">
                    {didacticFocusLabel}
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">{explanationText}</p>
                </div>
              </div>

              {/* If in Dock mode and has return, show compact Return Value Inspector */}
              {isDock && currentStep?.returnValue && (
                <ReturnValueInspector
                  returnValue={currentStep.returnValue}
                  currentLocation={currentStep.location}
                  targetLocation={currentStep.targetLocation}
                  callStack={currentStep.callStack}
                  scopeVariables={currentStep.scopeVariables}
                />
              )}

              {/* POE Interactive Checkpoint Card */}
              {currentStep?.poeQuestion && (
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    playerState.isWaitingForPoe
                      ? "border-amber-500/60 bg-gradient-to-br from-amber-950/30 to-[#0F141E] shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30"
                      : playerState.poeResult?.isCorrect
                      ? "border-emerald-600/40 bg-emerald-950/20"
                      : "border-slate-800 bg-[#0B0F17]"
                  }`}
                  data-testid="poe-checkpoint-card"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                        {poeCardBadge}
                      </span>
                      <h4 className="text-xs font-semibold text-white">
                        {typeof currentStep.poeQuestion.prompt === "string"
                          ? currentStep.poeQuestion.prompt
                          : currentStep.poeQuestion.prompt[currentLang] || currentStep.poeQuestion.prompt.ua}
                      </h4>
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="space-y-1.5 mt-2">
                    {currentStep.poeQuestion.options.map((option) => {
                      const isSelected = playerState.selectedPoeOptionId === option.id;
                      const optLabel =
                        typeof option.label === "string"
                          ? option.label
                          : option.label[currentLang] || option.label.ua;

                      return (
                        <button
                          key={option.id}
                          disabled={playerState.poeResult?.isCorrect}
                          onClick={() => handleAnswerPoe(option.id)}
                          className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-start gap-2 cursor-pointer ${
                            isSelected && option.isCorrect
                              ? "bg-emerald-950/50 border-emerald-500 text-emerald-200 font-semibold"
                              : isSelected && !option.isCorrect
                              ? "bg-rose-950/50 border-rose-500 text-rose-200"
                              : "bg-slate-900/60 hover:bg-slate-850 border-slate-700/70 text-slate-300 hover:text-white"
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                            {isSelected && option.isCorrect ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : isSelected && !option.isCorrect ? (
                              <AlertCircle className="w-3 h-3 text-rose-400" />
                            ) : (
                              <span className="w-1 h-1 rounded-full bg-slate-500" />
                            )}
                          </div>
                          <span className="leading-snug text-[11px] sm:text-xs">{optLabel}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Inspect in tree shortcut for Dock HUD */}
                  {isDock && playerState.isWaitingForPoe && (
                    <button
                      onClick={() => setDockTab("tree")}
                      className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 text-amber-200 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FolderTree className="w-3.5 h-3.5 text-amber-400" />
                      <span>{exploreInTreeText}</span>
                    </button>
                  )}

                  {/* Feedback Message */}
                  {playerState.poeResult && (
                    <div
                      className={`mt-2 p-2.5 rounded-lg border text-xs leading-relaxed flex items-start gap-2 ${
                        playerState.poeResult.isCorrect
                          ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-200"
                          : "bg-rose-950/40 border-rose-600/40 text-rose-200"
                      }`}
                    >
                      {playerState.poeResult.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold mb-0.5 text-xs">
                          {feedbackHeading}
                        </p>
                        <p className="text-[11px] sm:text-xs">
                          {typeof playerState.poeResult.feedback === "string"
                            ? playerState.poeResult.feedback
                            : playerState.poeResult.feedback[currentLang] || playerState.poeResult.feedback.ua}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Continue button after correct answer */}
                  {playerState.poeResult?.isCorrect && (
                    <button
                      onClick={handleStepForward}
                      className="mt-2 w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
                    >
                      <span>{continueButtonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom Control Deck (Scrubber, Steps, Speed) ── */}
        <div className="px-3.5 py-2.5 bg-[#0B0F19] border-t border-slate-800 flex flex-col gap-1.5 shrink-0">
          {/* Time Scrubber Slider */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono text-slate-400 w-16 text-right shrink-0">
              Step {playerState.currentStepIndex + 1}/{timeline.totalSteps}
            </span>
            <input
              type="range"
              min={0}
              max={timeline.totalSteps - 1}
              value={playerState.currentStepIndex}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              aria-label="Timeline scrubber"
            />
            {playerState.poeScore.total > 0 && (
              <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                Score: {playerState.poeScore.correct}/{playerState.poeScore.total}
              </span>
            )}
          </div>

          {/* Buttons Deck */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={resetTooltip}
                aria-label="Reset trace"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStepBackward}
                disabled={playerState.currentStepIndex === 0}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title={stepBackTooltip}
                aria-label="Step backward"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleTogglePlay}
                disabled={playerState.isWaitingForPoe}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  playerState.isPlaying
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Play/Pause [Space]"
                aria-label={playerState.isPlaying ? "Pause trace" : "Play trace"}
              >
                {playerState.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{playPauseText}</span>
              </button>
              <button
                onClick={handleStepForward}
                disabled={
                  playerState.currentStepIndex === timeline.totalSteps - 1 ||
                  playerState.isWaitingForPoe
                }
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title={stepForwardTooltip}
                aria-label="Step forward"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Speed selector */}
            <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
              <Gauge className="w-3 h-3 text-slate-400 ml-1 mr-0.5" />
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                    playerState.playbackSpeed === s
                      ? "bg-blue-600 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              [Space] Play • [←/→] Step
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
