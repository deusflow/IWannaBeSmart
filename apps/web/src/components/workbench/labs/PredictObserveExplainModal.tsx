/**
 * @file apps/web/src/components/workbench/labs/PredictObserveExplainModal.tsx
 * @description Predict-Observe-Explain (POE) interactive simulator: "What will explode?"
 * Promotes active schema construction and prevents passive guessing through immediate tactile simulation.
 */

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  X,
  Flame,
  Zap,
} from "lucide-react";
import {
  POE_SCENARIOS,
  type PoeScenario,
  type PoeScenarioOption,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { audioFx } from "../../../utils/audioFx";

export interface PredictObserveExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId?: string;
  initialScenarioId?: string;
}

export const PredictObserveExplainModal: React.FC<PredictObserveExplainModalProps> = ({
  isOpen,
  onClose,
  stationId = "pos",
  initialScenarioId,
}) => {
  const { t } = useTranslation();
  const addXp = useWorkbenchStore((s) => s.addXp);
  const completeLab = useWorkbenchStore((s) => s.completeLab);
  const isLabCompleted = useWorkbenchStore((s) => s.isLabCompleted);

  const availableScenarios = useMemo(
    () => POE_SCENARIOS.filter((s) => !stationId || s.stationId === stationId),
    [stationId]
  );

  const [activeScenarioIndex, setActiveScenarioIndex] = useState(() => {
    if (initialScenarioId) {
      const idx = availableScenarios.findIndex((s) => s.id === initialScenarioId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });
  const [prevInitialScenarioId, setPrevInitialScenarioId] = useState(initialScenarioId);

  if (initialScenarioId !== prevInitialScenarioId) {
    setPrevInitialScenarioId(initialScenarioId);
    if (initialScenarioId) {
      const idx = availableScenarios.findIndex((s) => s.id === initialScenarioId);
      if (idx !== -1) {
        setActiveScenarioIndex(idx);
      }
    }
  }

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);

  if (!isOpen) return null;

  const currentScenario: PoeScenario | undefined =
    availableScenarios[activeScenarioIndex] || POE_SCENARIOS[0];

  const handleSelectOption = (optionId: string) => {
    if (isSimulating || hasSimulated) return;
    audioFx.playKeyClick();
    setSelectedOptionId(optionId);
  };

  const handleRunSimulation = () => {
    if (!selectedOptionId || isSimulating || hasSimulated) return;

    audioFx.playRelayClick();
    setIsSimulating(true);

    setTimeout(() => {
      setIsSimulating(false);
      setHasSimulated(true);

      const chosenOpt = currentScenario?.options.find((o) => o.id === selectedOptionId);
      if (chosenOpt?.isCorrect) {
        audioFx.playSuccessFanfare();
        if (currentScenario && !isLabCompleted(currentScenario.id)) {
          addXp(currentScenario.rewardXp);
          completeLab(currentScenario.id);
        }
      } else {
        audioFx.playErrorBuzz();
      }
    }, 800);
  };

  const handleReset = () => {
    audioFx.playRelayClick();
    setSelectedOptionId(null);
    setIsSimulating(false);
    setHasSimulated(false);
  };

  const handleNext = () => {
    if (activeScenarioIndex < availableScenarios.length - 1) {
      audioFx.playRelayClick();
      setActiveScenarioIndex((i) => i + 1);
      setSelectedOptionId(null);
      setIsSimulating(false);
      setHasSimulated(false);
    } else {
      onClose();
    }
  };

  const selectedOpt = currentScenario?.options.find((o) => o.id === selectedOptionId);
  const isCorrect = selectedOpt?.isCorrect ?? false;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="poe-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm font-sans text-obsidian"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-black/[0.08] shadow-luxury flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-600/25 text-amber-900">
              <Flame size={16} />
            </span>
            <div>
              <h2 className="font-display font-extrabold text-sm text-obsidian leading-none">
                {t("labs.poe.title", "Живий симулятор: «Що вибухне?»")}
              </h2>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                {t(currentScenario.titleKey, currentScenario.defaultTitle)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 border border-black/[0.06] text-slate-700 font-bold">
              +{currentScenario.rewardXp} XP
            </span>
            <button
              data-testid="poe-close-btn"
              onClick={() => {
                audioFx.playRelayClick();
                onClose();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-obsidian hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Premise */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 font-medium">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1 uppercase tracking-wider text-[10px] font-mono">
              <AlertTriangle size={13} />
              <span>{t("labs.poe.predictPrompt", "Спрогнозуйте наслідок перед виконанням:")}</span>
            </div>
            {t(currentScenario.premiseKey, currentScenario.defaultPremise)}
          </div>

          {/* Code Snippet Card */}
          <div className="rounded-xl border border-black/[0.1] bg-[#18191C] text-emerald-400 p-3.5 font-mono text-xs overflow-x-auto shadow-inner">
            <div className="text-[9px] text-slate-500 font-bold uppercase mb-1 tracking-wider">
              {currentScenario.language} code
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">{currentScenario.codeSnippet}</pre>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {t("labs.poe.predictionOptions", "Варіанти прогнозу:")}
            </div>
            {currentScenario.options.map((option: PoeScenarioOption, idx: number) => {
              const isSelected = selectedOptionId === option.id;
              let btnStyle = "border-black/[0.06] bg-slate-50/60 hover:bg-slate-100/80 text-obsidian shadow-2xs";
              if (isSelected) {
                btnStyle = "border-[#C5A059] bg-[#C5A059]/10 text-obsidian font-semibold ring-1 ring-[#C5A059]/40 shadow-2xs";
              }
              if (hasSimulated && isSelected) {
                btnStyle = option.isCorrect
                  ? "border-emerald-600 bg-emerald-500/15 text-emerald-950 font-semibold ring-1 ring-emerald-500 shadow-2xs"
                  : "border-rose-600 bg-rose-500/15 text-rose-950 font-semibold ring-1 ring-rose-500 shadow-2xs";
              }

              return (
                <button
                  key={option.id}
                  data-testid={`poe-option-${option.id}`}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={isSimulating || hasSimulated}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer disabled:cursor-default ${btnStyle}`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0 border border-current mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-snug">
                    {t(option.labelKey, option.defaultLabel)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Simulation Output Banner */}
          {hasSimulated && selectedOpt && (
            <div
              data-testid="poe-feedback"
              className={`p-4 rounded-xl border text-xs animate-in fade-in duration-200 ${
                isCorrect
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-rose-50 border-rose-300 text-rose-950"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {isCorrect ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span>{t("labs.poe.correctPrediction", "Влучний прогноз! Ви правильно передбачили стан системи.")}</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-rose-700" />
                    <span>{t("labs.poe.wrongPrediction", "Система поводиться інакше! Подивіться на пояснення:")}</span>
                  </>
                )}
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-700 mt-1 font-mono">
                {t(selectedOpt.explanationKey, selectedOpt.defaultExplanation)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-black/[0.06] flex items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-500">
            {activeScenarioIndex + 1} / {availableScenarios.length}
          </div>
          <div className="flex items-center gap-2">
            {hasSimulated ? (
              <>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl border border-black/[0.08] bg-white text-xs font-mono font-bold flex items-center gap-1 hover:bg-slate-50 text-obsidian shadow-2xs transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>{t("labs.common.tryAgain", "Спробувати ще")}</span>
                </button>
                <button
                  data-testid="poe-finish-btn"
                  onClick={handleNext}
                  className="px-4 py-1.5 rounded-xl bg-[#252932] text-white text-xs font-mono font-bold flex items-center gap-1 hover:bg-[#1A1D24] transition-colors cursor-pointer shadow-2xs"
                >
                  <span>
                    {activeScenarioIndex < availableScenarios.length - 1
                      ? t("labs.common.next", "Далі →")
                      : t("labs.common.finish", "Завершити")}
                  </span>
                </button>
              </>
            ) : (
              <button
                data-testid="poe-simulate-btn"
                onClick={handleRunSimulation}
                disabled={!selectedOptionId || isSimulating}
                className="px-4 py-2 rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-[#C5A059] border border-[#C5A059]/40 text-xs font-mono font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                {isSimulating ? (
                  <>
                    <Zap size={14} className="animate-spin" />
                    <span>{t("labs.poe.simulating", "Симуляція...")}</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-[#C5A059]" />
                    <span>{t("labs.poe.runSimulation", "Запустити фізичну симуляцію (Enter)")}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
