/**
 * @file apps/web/src/components/workbench/labs/FirmwareLogicBuilderModal.tsx
 * @description No-Typing visual firmware logic pipeline builder.
 * Allows engineers to structure architectural pipelines without finger fatigue.
 */

import React, { useState } from "react";
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

  const availableChallenges = LOGIC_CHALLENGES.filter(
    (c) => !stationId || c.stationId === stationId
  );
  const currentChallenge: LogicChallenge = availableChallenges[0] || LOGIC_CHALLENGES[0];

  const [pipelineBlockIds, setPipelineBlockIds] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runIndex, setRunIndex] = useState<number | null>(null);
  const [validationResult, setValidationResult] = useState<"success" | "fail" | null>(null);
  const [hasAwarded, setHasAwarded] = useState(false);

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
          if (!hasAwarded) {
            addXp(currentChallenge.rewardXp);
            setHasAwarded(true);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1A1D20]/65 backdrop-blur-xs font-sans text-[#1A1D20]"
    >
      <div className="relative w-full max-w-3xl bg-[#FAF8F2] rounded-2xl border-2 border-[#1A1D20]/30 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#EFE9DC] border-b border-[#1A1D20]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-600/15 border border-cyan-700/30 text-cyan-900">
              <Layers size={16} />
            </span>
            <div>
              <h2 className="font-display font-extrabold text-sm text-[#1A1D20] leading-none">
                {t("labs.logic.title", "Конструктор логіки прошивки (No-Typing)")}
              </h2>
              <p className="text-[11px] font-mono text-[#1A1D20]/60 mt-0.5">
                {t(currentChallenge.titleKey, currentChallenge.defaultTitle)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#1A1D20]/10 text-[#1A1D20] font-bold">
              +{currentChallenge.rewardXp} XP
            </span>
            <button
              onClick={() => {
                audioFx.playRelayClick();
                onClose();
              }}
              className="p-1 rounded-lg text-[#1A1D20]/60 hover:text-[#1A1D20] hover:bg-[#1A1D20]/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Mission */}
          <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200/80 text-xs text-cyan-950 font-medium">
            <div className="font-bold text-[10px] font-mono uppercase tracking-wider text-cyan-800 mb-1">
              Місія конструктора:
            </div>
            {t(currentChallenge.missionKey, currentChallenge.defaultMission)}
          </div>

          {/* Pipeline Lane */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-[#1A1D20]/70">
              <span>{t("labs.logic.pipelineTitle", "Ланцюжок виконання (Пайплайн):")}</span>
              <span>
                {pipelineBlockIds.length} / {currentChallenge.expectedSequence.length} модулів
              </span>
            </div>

            <div className="min-h-[90px] p-3 rounded-xl border-2 border-dashed border-[#1A1D20]/30 bg-[#EFE9DC]/40 flex items-center gap-2 overflow-x-auto">
              {pipelineBlockIds.length === 0 ? (
                <div className="w-full text-center py-4 text-xs font-mono text-[#1A1D20]/45">
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
                            : "bg-[#FAF8F2] border-[#1A1D20]/25 text-[#1A1D20]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="p-1 rounded bg-[#1A1D20]/10">
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
                    className="p-2.5 rounded-xl border border-[#1A1D20]/20 bg-[#FAF8F2] hover:bg-[#EFE9DC]/70 text-left transition-all flex items-start gap-2.5 group cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="p-1.5 rounded-lg bg-[#1A1D20]/5 border border-[#1A1D20]/15 text-[#1A1D20] shrink-0 mt-0.5 group-hover:bg-[#1A1D20] group-hover:text-white transition-colors">
                      {renderIcon(block.iconName)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#1A1D20] leading-tight flex items-center justify-between">
                        <span>{t(block.nameKey, block.defaultName)}</span>
                        <Plus size={13} className="text-[#1A1D20]/40 group-hover:text-[#1A1D20]" />
                      </div>
                      <p className="text-[10px] text-[#1A1D20]/60 mt-0.5 leading-snug line-clamp-1">
                        {t(block.descriptionKey, block.defaultDescription)}
                      </p>
                      <div className="mt-1 font-mono text-[9px] text-accent-blue bg-accent-blue/10 px-1.5 py-0.5 rounded w-fit">
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
        <div className="px-5 py-3.5 bg-[#EFE9DC] border-t border-[#1A1D20]/20 flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={isRunning || pipelineBlockIds.length === 0}
            className="px-3 py-1.5 rounded-xl border border-[#1A1D20]/25 bg-[#FAF8F2] text-xs font-mono font-bold flex items-center gap-1 hover:bg-[#E6DEC9] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>{t("labs.logic.resetPipeline", "Скинути")}</span>
          </button>

          <button
            onClick={handleRunPipeline}
            disabled={isRunning || pipelineBlockIds.length === 0}
            className="px-4 py-2 rounded-xl bg-cyan-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-cyan-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Play size={14} />
            <span>{t("labs.logic.runPipeline", "Запустити пайплайн")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
