/**
 * @file apps/web/src/components/workbench/labs/XRayFlowModal.tsx
 * @description X-Ray Code Flow Visualizer:
 * Visualizes multi-file live execution flow across Program, Interface, and Service with animated SVG trace arrows.
 */

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ScanLine,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  X,
  CheckCircle2,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import {
  XRAY_SCENARIOS,
  type XRayScenario,
  type XRayStep,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { audioFx } from "../../../utils/audioFx";

export interface XRayFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId?: string;
  initialScenarioId?: string;
}

interface ArrowCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  curvePath: string;
}

export const XRayFlowModal: React.FC<XRayFlowModalProps> = ({
  isOpen,
  onClose,
  stationId = "tv",
  initialScenarioId,
}) => {
  const { t } = useTranslation();
  const addXp = useWorkbenchStore((s) => s.addXp);
  const completeLab = useWorkbenchStore((s) => s.completeLab);
  const isLabCompleted = useWorkbenchStore((s) => s.isLabCompleted);

  const availableScenarios = React.useMemo(
    () => XRAY_SCENARIOS.filter((s) => !stationId || s.stationId === stationId),
    [stationId]
  );

  const activeScenarioIndex = React.useMemo(() => {
    if (initialScenarioId) {
      const idx = availableScenarios.findIndex((s) => s.id === initialScenarioId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  }, [initialScenarioId, availableScenarios]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [arrowCoords, setArrowCoords] = useState<ArrowCoords | null>(null);
  const [isPathDrawn, setIsPathDrawn] = useState(false);

  const centerContainerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Map<string, HTMLElement>>(new Map());
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentScenario: XRayScenario =
    availableScenarios[activeScenarioIndex] || XRAY_SCENARIOS[0];
  const currentStep: XRayStep = currentScenario.steps[currentStepIndex];
  const isLastStep = currentStepIndex === currentScenario.steps.length - 1;
  const isCompleted = isLastStep;

  const handleNextStep = useCallback(() => {
    if (currentStepIndex < currentScenario.steps.length - 1) {
      audioFx.playKeyClick();
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, currentScenario.steps.length]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      audioFx.playKeyClick();
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleReset = useCallback(() => {
    audioFx.playRelayClick();
    setIsAutoPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    audioFx.playRelayClick();
    if (isLastStep) {
      setCurrentStepIndex(0);
      setIsAutoPlaying(true);
    } else {
      setIsAutoPlaying((p) => !p);
    }
  }, [isLastStep]);

  // Sound and XP reward upon completion
  useEffect(() => {
    if (isOpen && isLastStep) {
      audioFx.playSuccessFanfare();
      const labKey = `xray-${currentScenario.id}`;
      if (!isLabCompleted(labKey)) {
        addXp(currentScenario.rewardXp);
        completeLab(labKey);
      }
    }
  }, [isOpen, isLastStep, currentScenario, isLabCompleted, addXp, completeLab]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevStep();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNextStep, handlePrevStep, onClose]);

  // Calculate arrow connecting path between steps
  const updateArrow = useCallback(() => {
    if (!centerContainerRef.current) return;
    const containerRect = centerContainerRef.current.getBoundingClientRect();

    const currEl = lineRefs.current.get(`${currentStep.fileId}-${currentStep.line}`);
    if (!currEl) {
      setArrowCoords(null);
      return;
    }

    const prevIndex = currentStepIndex > 0 ? currentStepIndex - 1 : currentStepIndex;
    const prevStep = currentScenario.steps[prevIndex];
    const prevEl = lineRefs.current.get(`${prevStep.fileId}-${prevStep.line}`) || currEl;

    const pRect = prevEl.getBoundingClientRect();
    const cRect = currEl.getBoundingClientRect();

    const y1 = pRect.top + pRect.height / 2 - containerRect.top;
    const y2 = cRect.top + cRect.height / 2 - containerRect.top;

    const x1 =
      pRect.left < cRect.left
        ? pRect.right - containerRect.left
        : pRect.left > cRect.left
        ? pRect.left - containerRect.left
        : pRect.right - containerRect.left - 12;

    const x2 =
      pRect.left < cRect.left
        ? cRect.left - containerRect.left
        : pRect.left > cRect.left
        ? cRect.right - containerRect.left
        : cRect.right - containerRect.left - 12;

    const midX = (x1 + x2) / 2;
    const path =
      pRect.left === cRect.left
        ? `M ${x1} ${y1} C ${x1 + 24} ${y1}, ${x1 + 24} ${y2}, ${x2} ${y2}`
        : `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

    setArrowCoords({ x1, y1, x2, y2, curvePath: path });
    setIsPathDrawn(false);
  }, [currentStep, currentStepIndex, currentScenario.steps]);

  useLayoutEffect(() => {
    updateArrow();
  }, [updateArrow]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        updateArrow();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, updateArrow]);

  useEffect(() => {
    const handleResize = () => updateArrow();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateArrow]);

  useEffect(() => {
    // Trigger animation next tick
    const tId = setTimeout(() => setIsPathDrawn(true), 20);
    return () => clearTimeout(tId);
  }, [currentStepIndex]);

  // Auto-play loop
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= currentScenario.steps.length - 1) {
          setIsAutoPlaying(false);
          return prev;
        }
        audioFx.playKeyClick();
        return prev + 1;
      });
    }, 1200);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isOpen, isAutoPlaying, currentScenario.steps.length]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="xray-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm font-sans text-obsidian"
    >
      <div className="relative w-full max-w-6xl bg-white rounded-2xl border border-black/[0.08] shadow-luxury flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-600/25 text-sky-900">
              <ScanLine size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 border border-black/[0.06] text-slate-700">
                  {t("labs.xray.badge", "X-Ray Code Flow")}
                </span>
                <span className="text-xs font-mono font-bold text-amber-700">
                  +{currentScenario.rewardXp} XP
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold text-obsidian mt-0.5">
                {t(currentScenario.titleKey, currentScenario.defaultTitle)}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              audioFx.playRelayClick();
              onClose();
            }}
            data-testid="xray-close-btn"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-obsidian transition-colors cursor-pointer"
            aria-label={t("common.close", "Закрити")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: 3 columns layout (Controls, Code Visualizer, Payload Gauge) */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Flow Controls */}
          <div className="lg:col-span-2 flex flex-col gap-3 justify-between bg-slate-50/70 p-3.5 rounded-xl border border-black/[0.06]">
            <div className="space-y-3">
              <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500">
                {t("labs.xray.controlsLabel", "Керування трасуванням")}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                <button
                  onClick={handleNextStep}
                  disabled={isLastStep}
                  data-testid="xray-step-btn"
                  className={`w-full py-2 px-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                    isLastStep
                      ? "bg-slate-100 border border-black/[0.04] text-slate-400 cursor-not-allowed"
                      : "bg-[#252932] hover:bg-[#1A1D20] text-[#C5A059] border border-[#C5A059]/40 cursor-pointer active:scale-95"
                  }`}
                >
                  <ArrowRight size={14} />
                  <span>{t("labs.xray.stepBtn", "Крок ▶")}</span>
                </button>

                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  data-testid="xray-prev-btn"
                  className={`w-full py-2 px-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all border shadow-2xs ${
                    currentStepIndex === 0
                      ? "border-black/[0.04] bg-slate-50/40 text-slate-400 cursor-not-allowed"
                      : "bg-white hover:bg-slate-50 border-black/[0.08] text-obsidian cursor-pointer active:scale-95"
                  }`}
                >
                  <ArrowLeft size={14} />
                  <span>{t("labs.xray.prevBtn", "Назад ◀")}</span>
                </button>

                <button
                  onClick={handleReset}
                  data-testid="xray-reset-btn"
                  className="w-full py-2 px-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-black/[0.08] text-obsidian transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  <RotateCcw size={13} />
                  <span>{t("labs.xray.resetBtn", "Скинути")}</span>
                </button>

                <button
                  onClick={toggleAutoPlay}
                  className={`w-full py-2 px-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all border shadow-2xs ${
                    isAutoPlaying
                      ? "bg-[#252932] text-[#C5A059] border-[#C5A059]/40 font-extrabold"
                      : "bg-white hover:bg-slate-50 border-black/[0.08] text-obsidian"
                  }`}
                >
                  {isAutoPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>
                    {isAutoPlaying
                      ? t("labs.xray.pauseBtn", "Пауза")
                      : t("labs.xray.autoBtn", "Авто (1/с)")}
                  </span>
                </button>
              </div>
            </div>

            {/* Counter */}
            <div className="pt-2 border-t border-black/[0.06] text-center">
              <div className="font-mono text-[10px] text-slate-500 uppercase font-semibold">
                {t("labs.xray.stepCounterLabel", "Прогрес потоку")}
              </div>
              <div className="font-mono text-base font-extrabold text-obsidian mt-0.5">
                {currentStepIndex + 1} / {currentScenario.steps.length}
              </div>
            </div>
          </div>

          {/* Center Column: 3 Files in Parallel with SVG overlay */}
          <div
            ref={centerContainerRef}
            className="relative lg:col-span-7 bg-[#212429] rounded-xl p-3 border border-[#1A1D20]/40 overflow-hidden shadow-inner flex flex-col justify-between"
          >
            {/* SVG Connecting Arrow Layer */}
            <svg
              data-testid="xray-arrow"
              className="pointer-events-none absolute inset-0 w-full h-full z-20 overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="xray-arrowhead"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 0, 8 4, 0 8" fill="#F59E0B" />
                </marker>
                <filter id="xray-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.8" />
                </filter>
              </defs>

              <path
                d={arrowCoords?.curvePath || "M 0 0"}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeDasharray="1000"
                strokeDashoffset={isPathDrawn ? "0" : "1000"}
                markerEnd="url(#xray-arrowhead)"
                filter="url(#xray-glow)"
                style={{
                  transition: "stroke-dashoffset 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />

              {/* Animated traveling photon dot */}
              {arrowCoords && (
                <circle
                  cx={arrowCoords.x2}
                  cy={arrowCoords.y2}
                  r="4"
                  fill="#FDE68A"
                  filter="url(#xray-glow)"
                />
              )}
            </svg>

            {/* 3 File Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 h-full z-10">
              {currentScenario.files.map((file) => {
                const isFileActive = currentStep.fileId === file.id;

                return (
                  <div
                    key={file.id}
                    className={`flex flex-col rounded-lg bg-[#181A1E] border transition-all duration-200 overflow-hidden ${
                      isFileActive
                        ? "border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                        : "border-[#32363D]"
                    }`}
                  >
                    {/* File Header */}
                    <div
                      className={`px-2.5 py-1.5 flex items-center justify-between border-b text-[11px] font-mono font-bold ${
                        isFileActive
                          ? "bg-[#272B32] text-amber-400 border-amber-500/40"
                          : "bg-[#1E2126] text-gray-400 border-[#32363D]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Layers size={12} className={isFileActive ? "text-amber-400" : "text-gray-500"} />
                        <span className="truncate">{file.fileName}</span>
                      </div>
                      {isFileActive && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                      )}
                    </div>

                    {/* Code Lines */}
                    <div className="p-2 font-mono text-[11px] leading-relaxed select-none overflow-x-auto flex-1">
                      {file.lines.map((lineText, lineIdx) => {
                        const isLineActive = isFileActive && currentStep.line === lineIdx;

                        return (
                          <div
                            key={lineIdx}
                            ref={(el) => {
                              if (el) {
                                lineRefs.current.set(`${file.id}-${lineIdx}`, el);
                              } else {
                                lineRefs.current.delete(`${file.id}-${lineIdx}`);
                              }
                            }}
                            data-testid={isLineActive ? "xray-active-line" : undefined}
                            className={`flex items-start px-1.5 py-0.5 rounded transition-colors ${
                              isLineActive
                                ? "bg-amber-500/25 border-l-4 border-amber-500 text-amber-200 font-semibold"
                                : "text-gray-300 hover:bg-[#25282F]/60"
                            }`}
                          >
                            <span className="text-gray-600 text-[10px] w-4 text-right mr-2 select-none shrink-0 font-mono">
                              {lineIdx + 1}
                            </span>
                            <span className="whitespace-pre truncate font-mono text-[10px]">
                              {lineText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Dynamic Data Instrument & Explanation */}
          <div className="lg:col-span-3 flex flex-col justify-between bg-slate-50/70 p-4 rounded-xl border border-black/[0.06] space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-700">
                <Activity size={14} className="text-amber-600" />
                <span>{t("labs.xray.payloadGaugeTitle", "Прилад: Дані в польоті")}</span>
              </div>

              {/* Data in Flight Box */}
              <div className="p-3 rounded-lg bg-white border border-black/[0.06] shadow-2xs">
                <div className="font-mono text-[10px] uppercase text-slate-500 font-semibold mb-1">
                  {t("labs.xray.payloadLabel", "Корисне навантаження:")}
                </div>
                <div className="font-mono text-xs font-bold text-amber-900 break-words bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  {currentStep.dataLabel || "void (Call Execution)"}
                </div>
              </div>

              {/* Step Didactic Note */}
              <div className="p-3 rounded-lg bg-white border border-black/[0.06] shadow-2xs space-y-1.5">
                <div className="font-mono text-[10px] uppercase text-slate-500 font-semibold flex items-center gap-1">
                  <Zap size={11} className="text-amber-600" />
                  <span>{t("labs.xray.explanationLabel", "Пояснення архітектури:")}</span>
                </div>
                <p className="text-xs text-obsidian leading-relaxed">
                  {t(currentStep.noteKey, currentStep.defaultNote)}
                </p>
              </div>
            </div>

            {/* Completion Banner */}
            {isCompleted && (
              <div
                data-testid="xray-complete"
                className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-600/25 text-emerald-950 space-y-1.5 animate-in fade-in"
              >
                <div className="flex items-center gap-1.5 font-display font-bold text-xs text-emerald-900">
                  <CheckCircle2 size={15} className="text-emerald-700" />
                  <span>{t("labs.xray.completedTitle", "Потік успішно пройдено!")}</span>
                </div>
                <p className="text-[11px] text-emerald-900/80 leading-normal">
                  {t("labs.xray.completedDesc", "Ви побачили повний життєвий цикл виклику через інтерфейс та впровадження залежностей.")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-black/[0.06] flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
            <span>{t("labs.xray.hintNav", "Підказка: використовуйте стрілки [←] [→] або [Esc] для закриття")}</span>
          </div>

          <button
            onClick={() => {
              audioFx.playRelayClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-black/[0.08] font-mono text-xs font-bold text-obsidian transition-colors cursor-pointer shadow-2xs"
          >
            {t("common.close", "Закрити")}
          </button>
        </div>
      </div>
    </div>
  );
};
