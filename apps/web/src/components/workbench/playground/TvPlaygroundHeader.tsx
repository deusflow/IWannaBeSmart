/**
 * @file apps/web/src/components/workbench/playground/TvPlaygroundHeader.tsx
 * @description Top header for Smart TV Code Gym: Tier selector, Task grid, Concept Info, Stars, and Round navigation
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { Star, Trophy, Zap, Lock, X, Flame, ShieldAlert, ScanLine, Timer, Target, Code2 } from "lucide-react";
import type { CodingTask } from "@iw/sim-engine";
import { audioFx } from "../../../utils/audioFx";
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
  onOpenPoeModal?: () => void;
  onOpenCrashGate?: () => void;
  onOpenXRayModal?: () => void;
  onOpenDiRaceModal?: () => void;
  pointerStep?: 1 | 2 | 3 | null;
  onAdvancePointerStep?: () => void;
  onDismissPointer?: () => void;
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
  onOpenArchitectureStudio,
  forceTheoryExpanded,
  isTheoryUnlocked,
  onUnlockPractice,
  activeRound,
  onSelectRound,
  onOpenPoeModal,
  onOpenCrashGate,
  onOpenXRayModal,
  onOpenDiRaceModal,
  pointerStep,
  onAdvancePointerStep,
  onDismissPointer,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-2xl bg-white border border-black/[0.07] shadow-porcelain space-y-3.5">
      {/* Tier Selector: In Tier 0, show a clean, focused beginner header */}
      {selectedTier === 0 ? (
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-[#252932] text-white shadow-2xs shrink-0">
              {tierMeta[0].label}
            </span>
            <span className="text-xs font-sans text-slate-500 truncate">
              {t("codegym.tier0Subtitle", "Базове знайомство з мовою коду (3 завдання)")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 shrink-0">
            <span className="text-[#C5A059] font-extrabold">{tierStarTotals[0] || 0}/{tierMeta[0].maxStars} ★</span>
            {isTierUnlocked(1) && (
              <button
                onClick={() => onSelectTier(1)}
                className="text-[11px] text-[#252932] hover:text-[#C5A059] cursor-pointer flex items-center gap-1 font-bold ml-1 transition-colors"
              >
                Ранг 1 →
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-black/[0.06] pb-3">
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
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? "bg-[#252932] border-[#252932] text-white shadow-sm"
                    : isUnlocked
                    ? "bg-slate-50 hover:bg-slate-100/70 border-black/[0.06] text-obsidian hover:border-black/[0.14] shadow-2xs cursor-pointer"
                    : "bg-slate-50/40 border-black/[0.04] text-slate-400 cursor-not-allowed opacity-60"
                }`}
                title={
                  !isUnlocked
                    ? tier === 1
                      ? t("codegym.tier1Locked", " Потрібно 3 ★ у Ранзі 0")
                      : t("codegym.tier2Locked", " Пройдіть Ранг 1 (≥10 ★)")
                    : `${tierMeta[tier].label} (${currentTierStars}/${maxStars} ★)`
                }
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="font-mono text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 min-w-0">
                    {!isUnlocked && <Lock size={11} className="text-slate-400 shrink-0" />}
                    <span className="truncate">{tierMeta[tier].label}</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold shrink-0 ${
                      isCurrent ? "text-[#C5A059]" : "text-slate-500"
                    }`}
                  >
                    {currentTierStars}/{maxStars} ★
                  </span>
                </div>
                {!isUnlocked ? (
                  <div className="mt-1 text-[9px] font-mono text-amber-800 font-semibold truncate">
                    {tier === 1
                      ? t("codegym.tier1Locked", " Потрібно 3 ★ у Ранзі 0")
                      : t("codegym.tier2Locked", " Пройдіть Ранг 1 (≥10 ★)")}
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-1 text-[9px]">
                    {Array.from({ length: 3 }).map((_, starIdx) => {
                      const threshold = Math.round(((starIdx + 1) * maxStars) / 3);
                      return (
                        <span
                          key={starIdx}
                          className={currentTierStars >= threshold ? "text-[#C5A059]" : "text-slate-300 opacity-40"}
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
      )}

      {/* Task Cards for active tier */}
      <div className={`grid gap-2 pt-1 ${selectedTier === 0 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"}`}>
        {visibleTasks.map((task, idx) => {
          const isCurrent = task.id === currentTaskId;
          const taskStars = taskMasteryStars[task.id] || 0;
          const simpleStepLabels: Record<string, string> = {
            "task-0-1-power-on": "1. Увімкнення",
            "task-0-2-types": "2. Типи даних",
            "task-0-3-sequential": "3. Послідовність",
          };
          const stepLabel = selectedTier === 0 && simpleStepLabels[task.id]
            ? simpleStepLabels[task.id]
            : `#${idx + 1}`;

          const isLocked = idx > 0 && (taskMasteryStars[visibleTasks[idx - 1].id] || 0) < 1;

          return (
            <button
              key={task.id}
              disabled={isLocked}
              onClick={() => {
                if (!isLocked) onSelectTask(task.id);
              }}
              className={`p-2 rounded-xl text-center border transition-all ${
                isLocked
                  ? "opacity-55 cursor-not-allowed bg-slate-100/60 border-dashed border-black/[0.08] text-slate-400"
                  : isCurrent
                  ? "bg-[#252932] border-[#252932] text-white shadow-sm cursor-pointer"
                  : "bg-white hover:bg-slate-50 border-black/[0.06] text-obsidian hover:border-black/[0.14] shadow-2xs cursor-pointer"
              }`}
              title={
                isLocked
                  ? t("codegym.completePreviousTask", "Спочатку виконайте Завдання {{num}}", { num: idx })
                  : `${t(task.titleKey)} (${taskStars}/4 ★)`
              }
            >
              <div className="text-[11px] font-mono font-bold uppercase truncate flex items-center justify-center gap-1">
                {isLocked && <Lock size={10} className="text-slate-400 shrink-0" />}
                <span className={isLocked ? "text-slate-400" : isCurrent ? "text-[#C5A059]" : "text-slate-500"}>
                  {stepLabel}
                </span>
              </div>
              <div className="flex items-center justify-center gap-0.5 text-[9px] mt-0.5">
                {isLocked ? (
                  <span className="text-[9px] font-mono font-semibold text-slate-400">
                    {t("codegym.locked", "Заблоковано")}
                  </span>
                ) : (
                  [1, 2, 3, 4].map((s) => (
                    <span
                      key={s}
                      className={
                        taskStars >= s
                          ? s === 4
                            ? "text-cyan-400 font-bold"
                            : "text-[#C5A059]"
                          : "text-slate-300 opacity-40"
                      }
                    >
                      ★
                    </span>
                  ))
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Task Title & Stars Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-black/[0.06] flex items-center justify-center text-[#252932] shadow-2xs">
            <Zap size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-black/[0.06]">
                Code Gym • 4-Star Mastery
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {t(currentTask.conceptKey)}
              </span>
              <button
                onClick={onToggleTooltip}
                className="w-5 h-5 rounded-full bg-slate-100 border border-black/[0.08] hover:border-black/[0.18] text-slate-700 text-[11px] font-mono font-extrabold flex items-center justify-center transition-colors cursor-pointer"
                title={t("common.simpleExplanation", "Простими словами")}
                aria-label={t("common.simpleExplanation", "Простими словами")}
              >
                ?
              </button>
            </div>
            <h3 className="font-display font-bold text-base text-obsidian mt-0.5">
              {t(currentTask.titleKey)}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {selectedTier > 0 && (
            <>
              {onOpenXRayModal && (
                <button
                  onClick={onOpenXRayModal}
                  data-testid="lab-xray-btn"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-black/[0.08] text-slate-700 font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title={t("labs.xray.btnTooltip", "X-Ray: Рентген заліза — потік сигналу крізь плату")}
                >
                  <ScanLine size={13} className="text-slate-600" />
                  <span className="hidden sm:inline">{t("labs.xray.btnLabel", "X-Ray")}</span>
                </button>
              )}

              {onOpenDiRaceModal && (
                <button
                  onClick={onOpenDiRaceModal}
                  data-testid="lab-di-race-btn"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-black/[0.08] text-slate-700 font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title={t("labs.diRace.btnTooltip", "DI-гонка: Порівняння прямого зв'язування з Dependency Injection")}
                >
                  <Timer size={13} className="text-amber-600" />
                  <span className="hidden sm:inline">{t("labs.diRace.btnLabel", "DI-гонка")}</span>
                </button>
              )}

              {onOpenPoeModal && (
                <button
                  onClick={onOpenPoeModal}
                  data-testid="lab-poe-btn"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-black/[0.08] text-slate-700 font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title={t("labs.poe.btnTooltip", "Що вибухне? Тренажер помилок: здогадайтеся, що станеться з залізом")}
                >
                  <Flame size={13} className="text-amber-600" />
                  <span className="hidden sm:inline">{t("labs.poe.btnLabel", "Що вибухне?")}</span>
                </button>
              )}

              {onOpenCrashGate && (
                <button
                  onClick={() => {
                    if (!allTvTasksCompleted) {
                      audioFx.playErrorBuzz();
                      return;
                    }
                    onOpenCrashGate();
                  }}
                  disabled={!allTvTasksCompleted}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all shadow-2xs ${
                    allTvTasksCompleted
                      ? "bg-[#252932] hover:bg-[#1A1D24] text-white border-black/[0.12] cursor-pointer active:scale-95"
                      : "bg-slate-100/70 border-black/[0.06] text-slate-400 cursor-not-allowed opacity-60"
                  }`}
                  title={
                    allTvTasksCompleted
                      ? t("labs.crash.btnTooltip", "Атестаційний краш-тест станції (Certification Drill)")
                      : t("labs.crash.btnLockedTooltip", "Краш-тест заблоковано: спочатку вирішіть усі завдання станції")
                  }
                >
                  {allTvTasksCompleted ? (
                    <ShieldAlert size={13} className="text-[#C5A059]" />
                  ) : (
                    <Lock size={13} className="text-slate-400" />
                  )}
                  <span className="hidden sm:inline">{t("labs.crash.btnLabel", "Краш-тест")}</span>
                </button>
              )}
            </>
          )}

          {allTvTasksCompleted && (
            <button
              onClick={onOpenVictoryModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-[#C5A059] border border-[#C5A059]/40 font-display font-extrabold text-xs shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
              title={t("codegym.tvCertTooltip", "Отримати сертифікат телевізійної станції")}
            >
              <Trophy size={14} className="text-[#C5A059]" />
              <span>{t("codegym.certificateBtn", "Сертифікат")}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] shadow-2xs">
            <span className="text-xs font-display font-bold text-slate-500 mr-1">
              {t("codegym.starsLabel", "Майстерність")}:
            </span>
            {[1, 2, 3, 4].map((starIdx) => (
              <span
                key={starIdx}
                title={starIdx === 4 ? "4-Star Master Star (Transfer)" : `Star ${starIdx}`}
                className="inline-flex items-center"
              >
                <Star
                  size={16}
                  className={`transition-all duration-300 ${
                    starsEarned >= starIdx
                      ? starIdx === 4
                        ? "text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] scale-115"
                        : "text-[#C5A059] fill-[#C5A059] scale-110"
                      : "text-slate-200"
                  }`}
                />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Parchment Tooltip popover */}
      {showTooltip && (
        <div className="p-3.5 rounded-xl bg-white border border-black/[0.08] text-obsidian text-xs font-sans leading-relaxed shadow-luxury animate-in fade-in flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="font-mono font-bold text-[10px] uppercase text-slate-500 mb-1">
              {t("common.simpleExplanation", "Простими словами")}:
            </div>
            <p>{t(currentTask.descKey)}</p>
          </div>
          <button
            onClick={() => {
              audioFx.playRelayClick();
              onToggleTooltip();
            }}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-obsidian transition-colors cursor-pointer shrink-0"
            title={t("common.close", "Закрити")}
            aria-label={t("common.close", "Закрити")}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Tier 0 Mission & Syntax Intro Card ── */}
      {selectedTier === 0 && (
        <div className="p-3.5 rounded-2xl bg-white border border-black/[0.08] shadow-porcelain space-y-2.5">
          <div className="flex items-center justify-between gap-2 border-b border-black/[0.05] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-obsidian">
                {t("codegym.missionTitle", "Місія завдання")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-black/[0.05]">
              <span>{t("codegym.deviceLabel", "Прилад:")}</span>
              <span className="font-bold text-obsidian">Smart TV 65"</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            {/* Goal */}
            <div
              id="guide-step-goal"
              className={`flex flex-col justify-between p-2.5 rounded-xl border transition-all duration-300 ${
                pointerStep === 1
                  ? "ring-2 ring-[#C5A059] shadow-[0_0_20px_rgba(197,160,89,0.35)] bg-amber-500/5 border-amber-500/40"
                  : "bg-slate-50/70 border-black/[0.04]"
              }`}
            >
              <div className="flex items-start gap-2">
                <Target size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] font-bold uppercase text-slate-500">
                    {t("codegym.missionGoalLabel", "Ціль:")}
                  </span>
                  <p className="text-obsidian font-medium leading-snug">
                    {currentTask.id === "task-0-1-power-on"
                      ? t("codegym.goalPowerOn", "Подати живлення на процесор телевізора і вивести його з режиму очікування.")
                      : currentTask.id === "task-0-2-types"
                      ? t("codegym.goalTypes", "Перемкнути канал на число 1 та встановити текстову мітку каналу.")
                      : t("codegym.goalSequential", "Виконати ланцюжок інструкцій послідовно зверху вниз.")}
                  </p>
                </div>
              </div>

              {/* Step 1 Pointer Bubble */}
              {pointerStep === 1 && (
                <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="px-1.5 py-0.2 rounded bg-[#C5A059] text-black font-mono text-[9px] font-extrabold uppercase shrink-0">
                      {t("codegym.pointer.step1Badge", "Крок 1 із 3")}
                    </span>
                    <span className="text-[11px] font-medium text-slate-700 truncate">
                      {t("codegym.pointer.step1Title", "Подивіться на місію")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={onAdvancePointerStep}
                      className="px-2.5 py-1 rounded-lg bg-[#252932] hover:bg-[#1A1D24] text-[#C5A059] text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                    >
                      {t("codegym.pointer.step1Btn", "Яка команда потрібна? →")}
                    </button>
                    {onDismissPointer && (
                      <button
                        onClick={onDismissPointer}
                        className="text-[10px] font-mono text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded cursor-pointer"
                        title={t("codegym.pointer.skip", "Пропустити підказки")}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Target Command */}
            <div
              id="guide-step-command"
              className={`flex flex-col justify-between p-2.5 rounded-xl border transition-all duration-300 ${
                pointerStep === 2
                  ? "ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.35)] bg-[#141820] border-emerald-500/60"
                  : "bg-[#181C24] border-white/[0.08]"
              } text-white`}
            >
              <div className="flex items-start gap-2">
                <Code2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 w-full">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase">
                    <span>{t("codegym.missionTargetCommand", "Команда для вводу:")}</span>
                    <span className="text-[9px] text-[#C5A059] font-bold">{codeLang === "go" ? "Go" : "C#"}</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-300">
                    {currentTask.id === "task-0-1-power-on"
                      ? (codeLang === "go" ? "tv.PowerOn()" : "tv.PowerOn();")
                      : currentTask.id === "task-0-2-types"
                      ? (codeLang === "go" ? 'tv.SetChannel(1)\ntv.SetLabel("NEWS")' : 'tv.SetChannel(1);\ntv.SetLabel("NEWS");')
                      : (codeLang === "go" ? "tv.PowerOn()\ntv.SetVolume(15)" : "tv.PowerOn();\ntv.SetVolume(15);")}
                  </div>
                </div>
              </div>

              {/* Step 2 Pointer Bubble */}
              {pointerStep === 2 && (
                <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="px-1.5 py-0.2 rounded bg-emerald-400 text-black font-mono text-[9px] font-extrabold uppercase shrink-0">
                      {t("codegym.pointer.step2Badge", "Крок 2 із 3")}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-200 truncate">
                      {t("codegym.pointer.step2Title", "Команда для заліза")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={onAdvancePointerStep}
                      className="px-2.5 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                    >
                      {t("codegym.pointer.step2Btn", "Куди вводити? →")}
                    </button>
                    {onDismissPointer && (
                      <button
                        onClick={onDismissPointer}
                        className="text-[10px] font-mono text-gray-400 hover:text-white px-1 py-0.5 rounded cursor-pointer"
                        title={t("codegym.pointer.skip", "Пропустити підказки")}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Syntax anatomy strip */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono bg-slate-50/90 p-2 rounded-xl border border-black/[0.04]">
            <span className="text-[10px] font-bold uppercase text-slate-500 mr-1">
              {t("codegym.syntaxAnatomy", "Анатомія:")}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-white border border-black/[0.08] text-obsidian font-bold">tv</span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-600 text-[10px]">{t("codegym.syntaxObject", "прилад")}</span>
            <span className="text-slate-400">•</span>
            <span className="px-1.5 py-0.2 rounded bg-white border border-black/[0.08] text-obsidian font-bold">.</span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-600 text-[10px]">{t("codegym.syntaxDot", "звернення")}</span>
            <span className="text-slate-400">•</span>
            <span className="px-1.5 py-0.2 rounded bg-white border border-black/[0.08] text-obsidian font-bold">
              {currentTask.id === "task-0-2-types" ? "SetChannel(1)" : currentTask.id === "task-0-3-sequential" ? "SetVolume(15)" : "PowerOn()"}
            </span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-600 text-[10px]">{t("codegym.syntaxAction", "дія")}</span>
            <span className="text-slate-400">•</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-900 border border-amber-600/20 font-bold">
              {codeLang === "go" ? "\\n" : ";"}
            </span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-600 text-[10px]">
              {codeLang === "go" ? t("codegym.syntaxNewline", "новий рядок") : t("codegym.syntaxSemicolon", "завершення команди")}
            </span>
          </div>
        </div>
      )}

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
          defaultExpanded={false}
          forceExpanded={forceTheoryExpanded}
          isTheoryUnlocked={isTheoryUnlocked}
          activeRound={activeRound}
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
  );
};
