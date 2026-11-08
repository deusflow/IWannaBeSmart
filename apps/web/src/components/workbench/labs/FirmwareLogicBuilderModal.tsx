/**
 * @file apps/web/src/components/workbench/labs/FirmwareLogicBuilderModal.tsx
 * @description No-Typing visual firmware logic pipeline builder.
 * Allows engineers to structure architectural pipelines without finger fatigue.
 */

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Calculator,
  DollarSign,
  Lock,
  Receipt,
  Play,
  RotateCcw,
  X,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
} from "lucide-react";
import {
  LOGIC_BLOCKS,
  LOGIC_CHALLENGES,
  type LogicChallenge,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { audioFx } from "../../../utils/audioFx";

export interface FirmwareLogicBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId?: string;
}

export const FirmwareLogicBuilderModal: React.FC<FirmwareLogicBuilderModalProps> = ({
  isOpen,
  onClose,
  stationId = "pos",
}) => {
  const { t } = useTranslation();
  const addXp = useWorkbenchStore((s) => s.addXp);
  const completeLab = useWorkbenchStore((s) => s.completeLab);
  const isLabCompleted = useWorkbenchStore((s) => s.isLabCompleted);

  const availableChallenges = useMemo(
    () => LOGIC_CHALLENGES.filter((c) => !stationId || c.stationId === stationId),
    [stationId]
  );
  const currentChallenge: LogicChallenge = availableChallenges[0] || LOGIC_CHALLENGES[0];

  const [pipelineBlockIds, setPipelineBlockIds] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runIndex, setRunIndex] = useState<number | null>(null);
  const [validationResult, setValidationResult] = useState<"success" | "fail" | null>(null);

  if (!isOpen) return null;

  const handleAddBlock = (blockId: string) => {
    if (isRunning) return;
    if (pipelineBlockIds.length >= currentChallenge.expectedSequence.length + 2) return;
    audioFx.playRelayClick();
    setPipelineBlockIds((prev) => [...prev, blockId]);
    setValidationResult(null);
  };

  const handleRemoveBlock = (index: number) => {
    if (isRunning) return;
    audioFx.playKeyClick();
    setPipelineBlockIds((prev) => prev.filter((_, i) => i !== index));
    setValidationResult(null);
  };

  const handleReset = () => {
    audioFx.playRelayClick();
    setPipelineBlockIds([]);
    setRunIndex(null);
    setIsRunning(false);
    setValidationResult(null);
  };

  const handleRunPipeline = () => {
    if (pipelineBlockIds.length === 0 || isRunning) return;

    audioFx.playRelayClick();
    setIsRunning(true);
    setRunIndex(0);
    setValidationResult(null);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < pipelineBlockIds.length) {
        audioFx.playKeyClick();
        setRunIndex(step);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setRunIndex(null);

        // Verify sequence
        const isMatched =
          pipelineBlockIds.length === currentChallenge.expectedSequence.length &&
          pipelineBlockIds.every((id, idx) => id === currentChallenge.expectedSequence[idx]);

        if (isMatched) {
          audioFx.playSuccessFanfare();
          setValidationResult("success");
          if (!isLabCompleted(currentChallenge.id)) {
            addXp(currentChallenge.rewardXp);
            completeLab(currentChallenge.id);
          }
        } else {
          audioFx.playErrorBuzz();
          setValidationResult("fail");
        }
      }
    }, 450);
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case "Lock":
        return <Lock size={15} />;
      case "ShieldCheck":
        return <ShieldCheck size={15} />;
      case "Calculator":
        return <Calculator size={15} />;
      case "DollarSign":
        return <DollarSign size={15} />;
      case "Receipt":
        return <Receipt size={15} />;
      default:
        return <Layers size={15} />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm font-sans text-obsidian select-none"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-black/[0.08] shadow-luxury flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#252932]/10 border border-[#252932]/20 text-[#252932]">
              <Layers size={16} />
            </span>
            <div>
              <h2 className="font-display font-extrabold text-sm text-obsidian leading-none">
                {t("labs.logic.title", "Конструктор логіки прошивки (No-Typing)")}
              </h2>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                {t(currentChallenge.titleKey, currentChallenge.defaultTitle)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              +{currentChallenge.rewardXp} XP
            </span>
            <button
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
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Mission */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.06] text-xs text-slate-700 font-medium shadow-2xs">
            <div className="font-bold text-[10px] font-mono uppercase tracking-wider text-[#252932] mb-1">
              {t("labs.logic.missionTitle", "Місія конструктора:")}
            </div>
            {t(currentChallenge.missionKey, currentChallenge.defaultMission)}
          </div>

          {/* Pipeline Lane */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              <span>{t("labs.logic.pipelineTitle", "Ланцюжок виконання (Пайплайн):")}</span>
              <span>
                {t("labs.logic.modulesProgress", {
                  current: pipelineBlockIds.length,
                  total: currentChallenge.expectedSequence.length,
                  defaultValue: `${pipelineBlockIds.length} / ${currentChallenge.expectedSequence.length} модулів`,
                })}
              </span>
            </div>

            <div className="min-h-[90px] p-3 rounded-2xl border border-dashed border-black/[0.15] bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
              {pipelineBlockIds.length === 0 ? (
                <div className="w-full text-center py-4 text-xs font-mono text-slate-400">
                  {t("labs.logic.emptySlot", "Натискайте модулі з палітри нижче, щоб додати їх у пайплайн")}
                </div>
              ) : (
                pipelineBlockIds.map((blockId, idx) => {
                  const block = LOGIC_BLOCKS[blockId];
                  const isCurrentRunning = runIndex === idx;

                  return (
                    <React.Fragment key={`${blockId}-${idx}`}>
                      <div
                        className={`relative p-2.5 rounded-xl border text-xs min-w-[130px] shrink-0 transition-all ${
                          isCurrentRunning
                            ? "bg-amber-400 border-amber-600 scale-105 shadow-md text-black"
                            : "bg-white border-black/[0.08] text-obsidian shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="p-1 rounded bg-black/[0.05]">
                            {renderIcon(block?.iconName || "")}
                          </span>
                          <button
                            onClick={() => handleRemoveBlock(idx)}
                            disabled={isRunning}
                            className="text-[#1A1D20]/40 hover:text-rose-600 transition-colors p-0.5"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="font-bold text-[11px] leading-tight truncate">
                          {t(block?.nameKey || "", block?.defaultName || "")}
                        </div>
                        <div className="text-[9px] font-mono text-[#1A1D20]/60 mt-1 truncate">
                          {block?.codePreview}
                        </div>
                      </div>
                      {idx < pipelineBlockIds.length - 1 && (
                        <ArrowRight size={14} className="text-[#1A1D20]/30 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>

          {/* Validation Banner */}
          {validationResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs animate-in fade-in duration-200 ${
                validationResult === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-rose-50 border-rose-300 text-rose-950"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {validationResult === "success" ? (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-700" />
                    <span>{t("labs.logic.pipelineSuccess", "Ідеальна архітектура! Пайплайн відпрацював без збоїв.")}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={15} className="text-rose-700" />
                    <span>{t("labs.logic.pipelineFailed", "Помилка послідовності! Порушено логіку виконання (перевірте черговість перевірок та списання).")}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Palette Blocks */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1A1D20]/70">
              {t("labs.logic.paletteTitle", "Доступні модулі (клікніть для додавання):")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentChallenge.availableBlockIds.map((blockId) => {
                const block = LOGIC_BLOCKS[blockId];
                if (!block) return null;

                return (
                  <button
                    key={blockId}
                    onClick={() => handleAddBlock(blockId)}
                    disabled={isRunning}
                    className="p-2.5 rounded-2xl border border-black/[0.08] bg-white hover:bg-slate-50 text-left transition-all flex items-start gap-2.5 group cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                  >
                    <span className="p-1.5 rounded-lg bg-black/[0.05] border border-black/[0.08] text-obsidian shrink-0 mt-0.5 group-hover:bg-[#252932] group-hover:text-white transition-colors">
                      {renderIcon(block.iconName)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-obsidian leading-tight flex items-center justify-between">
                        <span>{t(block.nameKey, block.defaultName)}</span>
                        <Plus size={13} className="text-slate-400 group-hover:text-obsidian" />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-1 font-sans">
                        {t(block.descriptionKey, block.defaultDescription)}
                      </p>
                      <div className="mt-1 font-mono text-[9px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                        {block.codePreview}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-black/[0.06] flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={isRunning || pipelineBlockIds.length === 0}
            className="px-3 py-1.5 rounded-xl border border-black/[0.08] bg-slate-100 text-xs font-mono font-bold flex items-center gap-1 hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer text-obsidian shadow-2xs"
          >
            <RotateCcw size={13} />
            <span>{t("labs.logic.resetPipeline", "Скинути")}</span>
          </button>

          <button
            onClick={handleRunPipeline}
            disabled={isRunning || pipelineBlockIds.length === 0}
            className="px-4 py-2 rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-white text-xs font-mono font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-luxury active:scale-95"
          >
            <Play size={14} />
            <span>{t("labs.logic.runPipeline", "Запустити пайплайн")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
