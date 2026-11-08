/**
 * @file apps/web/src/components/profile/tabs/ProfileAnalyticsTab.tsx
 * @description Learning telemetry, typing speed, syntax precision, and strengths/growth areas diagnostics.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Zap,
  Sparkles,
  CheckCircle2,
  Award,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { TOTAL_MAX_STARS } from "@iw/sim-engine";

interface ProfileStrengthItem {
  id: string;
  title: string;
  stars: number;
  station: string;
}

interface ProfileGrowthItem {
  id: string;
  title: string;
  stars: number;
  stationId: string;
  stationName: string;
}

export interface ProfileAnalyticsTabProps {
  maxWpmRecord: number;
  totalMasteryStars: number;
  xp: number;
  accuracyRate?: number | null;
  strengths: ProfileStrengthItem[];
  growthAreas: ProfileGrowthItem[];
  onJumpToTask: (stationId: string, taskId?: string) => void;
}

export const ProfileAnalyticsTab: React.FC<ProfileAnalyticsTabProps> = ({
  maxWpmRecord,
  totalMasteryStars,
  xp,
  accuracyRate,
  strengths,
  growthAreas,
  onJumpToTask,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-black/[0.06] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-800 font-bold">
            <Zap size={13} className="text-amber-700" />
            <span>{t("profile.bestWpmLabel", "Рекордна швидкість")}</span>
          </div>
          <div className="mt-1 font-display font-black text-xl text-obsidian flex items-baseline gap-1">
            <span>{maxWpmRecord > 0 ? maxWpmRecord : "—"}</span>
            <span className="text-xs font-mono text-slate-500 font-normal">WPM</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-black/[0.06] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-slate-600 font-bold">
            <Sparkles size={13} className="text-[#C5A059]" />
            <span>{t("profile.masteredStarsLabel", "Освоєно зірок")}</span>
          </div>
          <div className="mt-1 font-display font-black text-xl text-[#C5A059]">
            ★ {totalMasteryStars} / {TOTAL_MAX_STARS}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-black/[0.06] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-800 font-bold">
            <CheckCircle2 size={13} className="text-emerald-700" />
            <span>{t("profile.accuracyLabel", "Точність синтаксису")}</span>
          </div>
          <div className="mt-1 font-display font-black text-xl text-obsidian">
            {accuracyRate !== undefined && accuracyRate !== null ? `${accuracyRate.toFixed(1)}%` : "—"}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-black/[0.06] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#252932] font-bold">
            <Award size={13} className="text-[#252932]" />
            <span>{t("profile.xpLabel", "Досвід (XP)")}</span>
          </div>
          <div className="mt-1 font-display font-black text-xl text-emerald-700">
            {xp} XP
          </div>
        </div>
      </div>

      {/* SECTION: Strengths (What went well) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-obsidian uppercase tracking-wider font-mono">
              {t("profile.strengthsTitle", "Сильні сторони (Що виходить відмінно)")}
            </h4>
            <p className="text-[11px] text-slate-500">
              {t("profile.strengthsSubtitle", "Освоєні навички та високі показники телеметрії")}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {strengths.length > 0 ? (
            strengths.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-600/25 flex items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-emerald-800 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-600/30">
                    {item.station}
                  </span>
                  <span className="font-display font-bold text-obsidian">{item.title}</span>
                </div>
                <div className="flex items-center gap-1 text-[#C5A059] font-mono font-bold">
                  {"★".repeat(item.stars)}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 rounded-xl bg-slate-50/80 border border-black/[0.06] text-slate-500 text-xs font-mono">
              {t("profile.noStrengthsYet", "Виконайте кілька завдань на 2 або 3 зірки, щоб зафіксувати свої сильні сторони.")}
            </div>
          )}
        </div>
      </div>

      {/* SECTION: Growth Areas (What needs improvement) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center">
            <AlertTriangle size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-obsidian uppercase tracking-wider font-mono">
              {t("profile.growthAreasTitle", "Точки зростання (Над чим попрацювати)")}
            </h4>
            <p className="text-[11px] text-slate-500">
              {t("profile.growthAreasSubtitle", "Завдання, які потребують повторення або покращення темпу")}
            </p>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {growthAreas.length > 0 ? (
            growthAreas.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-amber-500/10 border border-amber-600/25 flex items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-amber-900 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-600/30 shrink-0">
                    {item.stars === 0 ? "UNATTEMPTED" : `${item.stars} ★`}
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-black/[0.05] text-slate-500 border border-black/[0.08] shrink-0">
                    {item.stationName}
                  </span>
                  <span className="font-display font-bold text-obsidian truncate">{item.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onJumpToTask(item.stationId, item.id)}
                  className="px-2.5 py-1 rounded-lg bg-amber-600/15 hover:bg-amber-600/25 text-amber-900 border border-amber-600/30 text-[11px] font-display font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  <span>{t("profile.practiceTaskBtn", "Практикувати")}</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            ))
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-600/25 text-emerald-900 text-xs font-mono">
              {t("profile.noGrowthAreas", "Всі відкриті завдання виконано на високому рівні! Відмінна робота.")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
