/**
 * @file apps/web/src/components/workbench/playground/TvPlaygroundHeader.tsx
 * @description Top header for Smart TV Code Gym: Tier selector, Task grid, Concept Info, Stars, and Round navigation
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { Star, Trophy, Zap, Lock, X } from "lucide-react";
import type { CodingTask } from "@iw/sim-engine";
import { audioFx } from "../../../utils/audioFx";
import { SyntaxAnatomyCard } from "./SyntaxAnatomyCard";
import { GuidedStepBar } from "./GuidedStepBar";

export interface TvPlaygroundHeaderProps {
  tierMeta: Record<0 | 1 | 2, { label: string; maxStars: number; unlockAt: number }>;
  tierKeys: readonly [0, 1, 2];
  selectedTier: 0 | 1 | 2;
  tierStarTotals: Record<0 | 1 | 2, number>;
  isTierUnlocked: (tier: 0 | 1 | 2) => boolean;
  onSelectTier: (tier: 0 | 1 | 2) => void;
  visibleTasks: CodingTask[];
  currentTaskId: string;
  taskMasteryStars: Record<string, number>;
  onSelectTask: (taskId: string) => void;
  currentTask: CodingTask;
  showTooltip: boolean;
  onToggleTooltip: () => void;
  allTvTasksCompleted: boolean;
  onOpenVictoryModal: () => void;
  starsEarned: number;
  codeLang: "csharp" | "go";
  showTheory: boolean;
  onToggleTheory: () => void;
  onOpenArchitectureStudio?: () => void;
  forceTheoryExpanded?: boolean;
  isTheoryUnlocked: boolean;
  onUnlockPractice: () => void;
  activeRound: 1 | 2 | 3 | 4;
  onSelectRound: (round: 1 | 2 | 3 | 4) => void;
}

export const TvPlaygroundHeader: React.FC<TvPlaygroundHeaderProps> = ({
  tierMeta,
  tierKeys,
  selectedTier,
  tierStarTotals,
  isTierUnlocked,
  onSelectTier,
  visibleTasks,
  currentTaskId,
  taskMasteryStars,
  onSelectTask,
  currentTask,
  showTooltip,
  onToggleTooltip,
  allTvTasksCompleted,
  onOpenVictoryModal,
  starsEarned,
  codeLang,
  showTheory,
  onToggleTheory,
  onOpenArchitectureStudio,
  forceTheoryExpanded,
  isTheoryUnlocked,
  onUnlockPractice,
  activeRound,
  onSelectRound,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-2xl bg-[#EFEAE1] border border-paper-border shadow-paper-sm space-y-3">
      {/* Tier Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-paper-border/70 pb-3">
        {tierKeys.map((tier) => {
          const isUnlocked = isTierUnlocked(tier);
          const isCurrent = selectedTier === tier;
          const maxStars = tierMeta[tier].maxStars;
          const currentTierStars = tierStarTotals[tier] || 0;

          return (
            <button
              key={tier}
              disabled={!isUnlocked}
              onClick={() => onSelectTier(tier)}
              className={`p-2 rounded-xl border text-left transition-all ${
                isCurrent
                  ? "bg-[#1E2024] border-[#1E2024] text-white shadow-sm"
                  : isUnlocked
                  ? "bg-paper/70 hover:bg-paper border-paper-border text-ink hover:border-accent-blue/40 cursor-pointer"
                  : "bg-paper/40 border-paper-border/50 text-ink-muted/50 cursor-not-allowed opacity-75"
              }`}
              title={
                !isUnlocked
                  ? tier === 1
                    ? t("codegym.tier1Locked", "🔒 Потрібно 6 ★ у Ранзі 0")
                    : t("codegym.tier2Locked", "🔒 Пройдіть Ранг 1 (≥10 ★)")
                  : `${tierMeta[tier].label} (${currentTierStars}/${maxStars} ★)`
              }
            >
              <div className="flex items-center justify-between gap-1">
                <div className="font-mono text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 min-w-0">
                  {!isUnlocked && <Lock size={11} className="text-ink-muted/70 shrink-0" />}
                  <span className="truncate">{tierMeta[tier].label}</span>
                </div>
                <span
                  className={`font-mono text-[10px] font-bold shrink-0 ${
                    isCurrent ? "text-amber-400" : "text-ink-muted"
                  }`}
                >
                  {currentTierStars}/{maxStars} ★
                </span>
              </div>
              {!isUnlocked ? (
                <div className="mt-1 text-[9px] font-mono text-amber-900/80 font-semibold truncate">
                  {tier === 1
                    ? t("codegym.tier1Locked", "🔒 Потрібно 6 ★ у Ранзі 0")
                    : t("codegym.tier2Locked", "🔒 Пройдіть Ранг 1 (≥10 ★)")}
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-1 text-[9px]">
                  {Array.from({ length: 3 }).map((_, starIdx) => {
                    const threshold = Math.round(((starIdx + 1) * maxStars) / 3);
                    return (
                      <span
                        key={starIdx}
                        className={currentTierStars >= threshold ? "text-amber-400" : "text-gray-300 opacity-40"}
                      >
                        ★
                      </span>
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Task Cards for active tier */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 pt-2">
        {visibleTasks.map((task, idx) => {
          const isCurrent = task.id === currentTaskId;
          const taskStars = taskMasteryStars[task.id] || 0;
          return (
            <button
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className={`p-1.5 rounded-xl text-center border transition-all cursor-pointer ${
                isCurrent
                  ? "bg-[#1E2024] border-[#1E2024] text-white shadow-sm"
                  : "bg-paper/70 hover:bg-paper border-paper-border text-ink hover:border-accent-blue/40"
              }`}
              title={`${t(task.titleKey)} (${taskStars}/4 ★)`}
            >
              <div className="text-[10px] font-mono font-bold uppercase">
                <span className={isCurrent ? "text-amber-400" : "text-ink-muted"}>
                  #{idx + 1}
                </span>
              </div>
              <div className="flex items-center justify-center gap-0.5 text-[9px] mt-0.5">
                {[1, 2, 3, 4].map((s) => (
                  <span
                    key={s}
                    className={
                      taskStars >= s
                        ? s === 4
                          ? "text-cyan-400 font-bold"
                          : "text-amber-400"
                        : "text-gray-300 opacity-40"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Task Title & Stars Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent-blue/20 border border-accent-blue/40 flex items-center justify-center text-accent-blue">
            <Zap size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-accent-blue/20 text-accent-blue border border-accent-blue/30">
                Code Gym • 4-Star Mastery
              </span>
              <span className="text-xs font-mono font-bold text-ink-muted">
                {t(currentTask.conceptKey)}
              </span>
              <button
                onClick={onToggleTooltip}
                className="w-5 h-5 rounded-full bg-[#EBE5D8] border border-[#1A1D20]/30 hover:border-[#1A1D20]/60 text-[#1A1D20] text-[11px] font-mono font-extrabold flex items-center justify-center transition-colors cursor-pointer"
                title={t("common.simpleExplanation", "Простими словами")}
                aria-label={t("common.simpleExplanation", "Простими словами")}
              >
                ?
              </button>
            </div>
            <h3 className="font-display font-bold text-base text-ink mt-0.5">
              {t(currentTask.titleKey)}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allTvTasksCompleted && (
            <button
              onClick={onOpenVictoryModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-display font-extrabold text-xs shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
              title={t("codegym.tvCertTooltip", "Отримати сертифікат телевізійної станції")}
            >
              <Trophy size={14} className="text-stone-900" />
              <span>{t("codegym.certificateBtn", "Сертифікат")}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper border border-paper-border shadow-xs">
            <span className="text-xs font-display font-bold text-ink-muted mr-1">
              {t("codegym.starsLabel", "Майстерність")}:
            </span>
            {[1, 2, 3, 4].map((starIdx) => (
              <span
                key={starIdx}
                title={starIdx === 4 ? "4-Star Master Star (Transfer)" : `Star ${starIdx}`}
                className="inline-flex items-center"
              >
                <Star
                  size={18}
                  className={`transition-all duration-300 ${
                    starsEarned >= starIdx
                      ? starIdx === 4
                        ? "text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] scale-115"
                        : "text-amber-500 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] scale-110"
                      : "text-gray-300"
                  }`}
                />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Parchment Tooltip popover */}
      {showTooltip && (
        <div className="p-3 rounded-xl bg-[#EBE5D8] border border-[#1A1D20]/30 text-[#1A1D20] text-xs font-sans leading-relaxed shadow-sm animate-in fade-in flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="font-mono font-bold text-[10px] uppercase text-[#1A1D20]/70 mb-1">
              {t("common.simpleExplanation", "Простими словами")}:
            </div>
            <p>{t(currentTask.descKey)}</p>
          </div>
          <button
            onClick={() => {
              audioFx.playRelayClick();
              onToggleTooltip();
            }}
            className="p-1 rounded-md hover:bg-[#1A1D20]/10 text-[#1A1D20]/60 hover:text-[#1A1D20] transition-colors cursor-pointer shrink-0"
            title={t("common.close", "Закрити")}
            aria-label={t("common.close", "Закрити")}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Theory & Code Anatomy Card */}
      <div className="pt-0.5">
        <SyntaxAnatomyCard
          taskId={currentTask.id}
          codeLang={codeLang}
          isOpen={showTheory}
          onToggle={onToggleTheory}
        />
      </div>

      {/* Guided Step Bar */}
      {currentTask.simpleExplanationKey && (
        <GuidedStepBar
          data={{
            simpleKey: currentTask.simpleExplanationKey,
            engineeringKey: currentTask.engineeringKey || currentTask.simpleExplanationKey,
            taskId: currentTask.id,
            tier: (currentTask.tier ?? 0) as 0 | 1 | 2,
            codeLang,
            targetCode: currentTask.targetCode,
            onOpenArchitectureStudio,
          }}
          persistent={true}
          defaultExpanded={starsEarned === 0 && activeRound === 1}
          forceExpanded={forceTheoryExpanded}
          isTheoryUnlocked={isTheoryUnlocked}
          onUnlockPractice={onUnlockPractice}
          onStartPractice={() => {
            onUnlockPractice();
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
          { round: 3, label: t("codegym.round3Badge", "Раунд 3"), desc: t("codegym.round3DescShort", "Спринт") },
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
                onSelectRound(round as 1 | 2 | 3 | 4);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                isActive
                  ? "bg-[#1E2024] border-[#1E2024] text-white shadow-md"
                  : isUnlocked
                  ? "bg-paper hover:bg-paper-muted border-paper-border text-ink hover:border-accent-blue/40"
                  : "bg-paper/40 border-paper-border/50 text-ink-muted/50 cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-[11px] uppercase">
                  {label}
                </span>
                {starsEarned >= round && (
                  <span className={round === 4 ? "text-cyan-400 text-xs drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" : "text-amber-400 text-xs"}>
                    {round === 4 ? "💎" : "⭐"}
                  </span>
                )}
              </div>
              <div className={`text-[10px] truncate mt-0.5 ${isActive ? "text-gray-300" : "text-ink-muted"}`}>
                {desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
