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

  // Reset completion state when the trace timeline itself changes (adjust state during render).
  const [prevTimelineId, setPrevTimelineId] = useState(timeline.id);
  if (prevTimelineId !== timeline.id) {
    setPrevTimelineId(timeline.id);
    setHasCompleted(false);
  }

  useEffect(() => {
    awardedRef.current = false;
    const unsubscribe = controller.subscribe((s) => {
      // Returning to the first step starts a fresh run: allow a new XP award.
      if (s.currentStepIndex === 0) {
        awardedRef.current = false;
        setHasCompleted(false);
      }
      setPlayerState(s);
    });
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
            ? ` Flow Trace Mastered! +${totalXp} XP (${playerState.poeScore.correct}/${playerState.poeScore.total} predictions)`
            : currentLang === "da"
            ? ` Flow Trace Mestret! +${totalXp} XP (${playerState.poeScore.correct}/${playerState.poeScore.total} forudsigelser)`
            : ` Потік виконання опановано! +${totalXp} XP (${playerState.poeScore.correct}/${playerState.poeScore.total} передбачень)`
        );
        audioFx.playSuccessFanfare();
      } else {
        addXp(10);
        toast.info(
          currentLang === "en"
            ? " Demo Mode completed (+10 XP). Enable POE to earn full mastery stars!"
            : currentLang === "da"
            ? " Demo Mode fuldført (+10 XP). Aktiver POE for fuld mestring!"
            : " Демо-перегляд завершено (+10 XP). Увімкніть POE для повних балів майстерності!"
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
          ? `fixed bottom-3 right-3 sm:right-6 left-3 sm:left-auto sm:w-[720px] max-h-[82vh] z-40 flex flex-col rounded-2xl border border-[#E4E7EC] bg-white/95 backdrop-blur-xl text-[#0F141C] shadow-luxury overflow-hidden animate-fadeIn ${className}`
          : `fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#0F141C]/60 backdrop-blur-md animate-fadeIn ${className}`
      }
      data-testid="execution-flow-player-modal"
    >
      <div
        className={
          isDock
            ? "flex flex-col w-full h-full overflow-hidden"
            : "relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-[#E4E7EC] bg-white text-[#0F141C] shadow-luxury overflow-hidden"
        }
      >
        {/* ── Top Header ── */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#F8F9FA] border-b border-[#E4E7EC] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#252932] border border-[#252932] flex items-center justify-center text-[#C5A059] shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-xs sm:text-sm text-[#0F141C] tracking-wide truncate">
                  {titleText}
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#252932] text-[#C5A059] border border-[#252932] uppercase shrink-0">
                  {timeline.language}
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-[#F1F3F5] text-[#525866] border border-[#E4E7EC] uppercase shrink-0">
                  Station: {stationId}
                </span>
              </div>
              {!isDock && (
                <p className="text-xs text-[#525866] truncate max-w-xl">{descText}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* POE Mode Toggle */}
            <button
              onClick={handleTogglePoe}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                enablePoe
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-[#F8F9FA] border-[#E4E7EC] text-[#525866] hover:text-[#0F141C]"
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
              className="p-1.5 rounded-lg text-[#525866] hover:text-[#0F141C] hover:bg-[#F1F3F5] transition-colors cursor-pointer"
              title={displayModeTooltip}
              aria-label="Toggle display mode"
            >
              {isDock ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#525866] hover:text-[#0F141C] hover:bg-[#F1F3F5] transition-colors cursor-pointer"
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
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FA] border-b border-[#E4E7EC] text-[11px] font-mono shrink-0">
            <button
              onClick={() => setDockTab("code")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                dockTab === "code"
                  ? "bg-[#252932] text-[#F8F9FA] font-bold shadow-sm"
                  : "text-[#525866] hover:text-[#0F141C] hover:bg-[#F1F3F5]"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{codeTabLabel}</span>
            </button>

            <button
              onClick={() => setDockTab("tree")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                dockTab === "tree"
                  ? "bg-[#252932] text-[#F8F9FA] font-bold shadow-sm"
                  : "text-[#525866] hover:text-[#0F141C] hover:bg-[#F1F3F5]"
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
        <div className={`grid ${isDock ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"} flex-1 overflow-hidden min-h-0 bg-white`}>
          {/* Left Column: Solution Explorer & Stack (Shown in Full Studio mode or when Dock Tab is 'tree') */}
          {(!isDock || dockTab === "tree") && (
            <div className={`${isDock ? "col-span-1" : "lg:col-span-4 border-r border-[#E4E7EC]"} p-3 flex flex-col gap-3 overflow-y-auto scrollbar-thin`}>
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
              <div className="rounded-xl border border-[#323846] bg-[#252932] overflow-hidden flex flex-col shadow-titanium">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#1E222A] border-b border-[#323846] text-xs font-mono">
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
                  className={`font-mono text-xs text-slate-200 bg-[#252932] overflow-x-auto overflow-y-auto leading-relaxed divide-y divide-[#323846]/50 ${
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
                              ? "bg-[#C5A059]/15 text-[#F8F9FA] font-medium border-l-2 border-[#C5A059]"
                              : "hover:bg-white/5 text-slate-300"
                          }`}
                        >
                          <span
                            className={`w-8 text-right pr-2 text-[10px] select-none shrink-0 font-mono ${
                              isTargetLine ? "text-[#C5A059] font-bold" : "text-slate-500"
                            }`}
                          >
                            {lineNum}
                          </span>
                          <span className="w-4 text-center pr-1 text-[10px] shrink-0 select-none">
                            {isTargetLine ? (
                              <span className="text-[#C5A059] animate-pulse font-bold">→</span>
                            ) : (
                              <span className="text-slate-500">·</span>
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
                <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-emerald-800">
                        {currentLang === "en"
                          ? "Execution Flow Mastered!"
                          : currentLang === "da"
                          ? "Eksekvering fuldført!"
                          : "Ланцюг виконання опановано!"}
                      </span>
                      <span className="text-[11px] text-emerald-700">
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
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] font-mono transition-all cursor-pointer shrink-0"
                  >
                    {currentLang === "en" ? "Replay Flow" : currentLang === "da" ? "Genspil" : "Повторити"}
                  </button>
                </div>
              )}

              {/* Didactic Step Explanation */}
              <div className="p-2.5 rounded-xl border border-[#E4E7EC] bg-[#F8F9FA] text-xs text-[#0F141C] flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-[#252932] text-[#C5A059] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-[#525866] block">
                    {didacticFocusLabel}
                  </span>
                  <p className="text-[#525866] leading-relaxed text-[11px] sm:text-xs">{explanationText}</p>
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
                      ? "border-amber-300 bg-amber-50 shadow-luxury ring-1 ring-amber-200"
                      : playerState.poeResult?.isCorrect
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-[#E4E7EC] bg-white"
                  }`}
                  data-testid="poe-checkpoint-card"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold block">
                        {poeCardBadge}
                      </span>
                      <h4 className="text-xs font-semibold text-[#0F141C]">
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
                              ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold"
                              : isSelected && !option.isCorrect
                              ? "bg-rose-50 border-rose-500 text-rose-900"
                              : "bg-white hover:bg-[#F1F3F5] border-[#E4E7EC] text-[#525866] hover:text-[#0F141C]"
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full border border-[#C9CED8] flex items-center justify-center shrink-0 mt-0.5">
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
                      className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                          : "bg-rose-50 border-rose-300 text-rose-900"
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
                      className="mt-2 w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
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
        <div className="px-3.5 py-2.5 bg-[#F8F9FA] border-t border-[#E4E7EC] flex flex-col gap-1.5 shrink-0">
          {/* Time Scrubber Slider */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono text-[#525866] w-16 text-right shrink-0">
              Step {playerState.currentStepIndex + 1}/{timeline.totalSteps}
            </span>
            <input
              type="range"
              min={0}
              max={timeline.totalSteps - 1}
              value={playerState.currentStepIndex}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="flex-1 h-1.5 bg-[#E4E7EC] rounded-lg appearance-none cursor-pointer accent-[#252932]"
              aria-label="Timeline scrubber"
            />
            {playerState.poeScore.total > 0 && (
              <span className="text-[10px] font-mono text-emerald-700 shrink-0">
                Score: {playerState.poeScore.correct}/{playerState.poeScore.total}
              </span>
            )}
          </div>

          {/* Buttons Deck */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E4E7EC] text-[#252932] hover:text-[#0F141C] transition-colors cursor-pointer"
                title={resetTooltip}
                aria-label="Reset trace"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStepBackward}
                disabled={playerState.currentStepIndex === 0}
                className="p-1.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E4E7EC] text-[#252932] hover:text-[#0F141C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                    ? "bg-[#C5A059] hover:bg-[#B28D44] text-[#0F141C]"
                    : "bg-[#252932] hover:bg-[#1A1D24] text-white"
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
                className="p-1.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E4E7EC] text-[#252932] hover:text-[#0F141C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title={stepForwardTooltip}
                aria-label="Step forward"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Speed selector */}
            <div className="flex items-center gap-0.5 bg-[#F1F3F5] p-0.5 rounded-lg border border-[#E4E7EC] text-[10px] font-mono">
              <Gauge className="w-3 h-3 text-[#525866] ml-1 mr-0.5" />
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                    playerState.playbackSpeed === s
                      ? "bg-[#252932] text-[#F8F9FA] font-bold"
                      : "text-[#525866] hover:text-[#0F141C]"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <span className="text-[10px] text-[#8A909E] font-mono hidden sm:inline">
              [Space] Play • [←/→] Step
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
