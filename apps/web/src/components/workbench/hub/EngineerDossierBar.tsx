/**
 * @file apps/web/src/components/workbench/hub/EngineerDossierBar.tsx
 * @description Progressive disclosure engineer dossier displaying patterns mastery and milestone progression.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
} from "lucide-react";
import { audioFx } from "../../../utils/audioFx";
import { useWorkbenchStore } from "../../../store/workbenchStore";

export interface PatternItem {
  id: string;
  name: string;
  unlocked: boolean;
}

export interface EngineerDossierBarProps {
  xp: number;
  patterns: PatternItem[];
  station3ProgressPercent: number;
}

export const EngineerDossierBar: React.FC<EngineerDossierBarProps> = ({
  xp,
  patterns,
  station3ProgressPercent,
}) => {
  const { t } = useTranslation();
  const [isDossierExpanded, setIsDossierExpanded] = useState<boolean>(false);
  const dailyStreak = useWorkbenchStore((s) => s.dailyStreak);

  return (
    <div className="rounded-2xl bg-white border border-black/[0.07] shadow-porcelain overflow-hidden transition-all duration-300">
      <div className="p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 border-b border-black/[0.06]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-[#0F141C]">
            {t("hub.dossierTitle", "Досьє інженера")}
          </h2>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white border border-black/[0.08] font-mono text-[10px] font-bold text-emerald-800 shadow-2xs">
            {patterns.filter((p) => p.unlocked).length} / {patterns.length} {t("hub.patternsShort", "Патернів")}
          </span>
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-black/[0.08] font-mono text-[10px] font-bold text-amber-900 shadow-2xs"
            title={
              dailyStreak.isStreakFrozenToday
                ? t("hub.streakFreezeTooltip", "Заморозка серії активна сьогодні")
                : t("hub.streakTooltip", "Щоденна серія активності")
            }
          >
            <Flame size={12} className="text-amber-500 fill-amber-500 shrink-0" />
            <span>
              {dailyStreak.currentStreak} {t("hub.streakLabel", "днів поспіль")}
            </span>
            {dailyStreak.streakFreezesAvailable > 0 && (
              <span
                className="cursor-help text-[10px]"
                title={t("hub.streakFreezeTooltip", "Заморозка серії активна або доступна")}
              >
                ❄️
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] font-mono text-[#525866]">
            {t("hub.unlockProgress", "Прогрес")}:{" "}
            <span className="font-bold text-[#0F141C]">{xp} XP</span>
          </div>

          <button
            onClick={() => {
              audioFx.playRelayClick();
              setIsDossierExpanded((p) => !p);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-black/[0.08] bg-white hover:bg-slate-50 text-[11px] font-mono font-bold text-[#0F141C] transition-all cursor-pointer shadow-2xs"
            title={isDossierExpanded ? t("common.collapse", "Згорнути досьє") : t("common.details", "Розгорнути досьє")}
          >
            <span>{isDossierExpanded ? t("common.collapse", "Згорнути") : t("common.details", "Деталі")}</span>
            {isDossierExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Milestone Progress Bar (Always visible slim indicator) */}
      <div className="px-4 sm:px-5 py-2.5">
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#252932] to-[#3E4450] transition-all duration-500 ease-out"
            style={{ width: `${station3ProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Mastered Architectural Patterns (Expandable details) */}
      {isDossierExpanded && (
        <div className="px-4 sm:px-5 pb-4 pt-1 space-y-2 border-t border-black/[0.06] animate-in fade-in">
          <div className="text-[10px] font-mono font-bold uppercase text-[#868C98]">
            {t("hub.masteredPatterns", "Освоєні архітектурні патерни")}:
          </div>
          <div className="flex flex-wrap gap-2">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-colors ${
                  pattern.unlocked
                    ? "bg-emerald-50/70 border-emerald-600/30 text-emerald-900 shadow-2xs"
                    : "bg-slate-50 border-black/[0.06] text-slate-400"
                }`}
              >
                {pattern.unlocked ? (
                  <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                )}
                <span>{pattern.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
