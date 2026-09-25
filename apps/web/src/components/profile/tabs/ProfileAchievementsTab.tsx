/**
 * @file apps/web/src/components/profile/tabs/ProfileAchievementsTab.tsx
 * @description Station certificates showcase, eligibility verification, and system mastery badges.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Trophy,
  ArrowRight,
  Check,
  Lock,
  Award,
  Target,
  type LucideIcon,
} from "lucide-react";
import type { CareerRank, CareerRankGrade } from "../../../utils/careerRank";
import { CAREER_RANKS_CONFIG } from "../../../utils/careerRank";

export interface ProfileBadge {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  isUnlocked: boolean;
  progressText?: string;
}

export interface ProfileCertCard {
  id: string;
  title: string;
  spec: string;
  icon: LucideIcon;
  iconColor: string;
  status: {
    completedCount: number;
    total: number;
    isEligible: boolean;
  };
  onViewCert: () => void;
}

export interface ProfileAchievementsTabProps {
  certCards: ProfileCertCard[];
  badges?: ProfileBadge[];
  onJumpToTask: (stationId: string) => void;
  careerRank?: CareerRank;
  completedStationsCount?: number;
  resolvedWarRoomCount?: number;
  xp?: number;
}

export const ProfileAchievementsTab: React.FC<ProfileAchievementsTabProps> = ({
  certCards,
  badges = [],
  onJumpToTask,
  careerRank,
  completedStationsCount = 0,
  resolvedWarRoomCount = 0,
  xp = 0,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* ── Career Qualification Ladder (L1–L4) Card ── */}
      {careerRank && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F2] border-2 border-[#1A1D20]/25 shadow-paper-xs relative overflow-hidden">
          {/* Subtle blueprint grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(26,29,32,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,29,32,0.03)_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

          {/* Header row: title and current grade */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1D20]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-600/35 text-purple-900 flex items-center justify-center font-display font-extrabold shadow-2xs shrink-0">
                <Award size={20} strokeWidth={2.2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-[#1A1D20]">
                    {t("careerRank.qualificationTitle", "Кваліфікаційна драбина інженера")}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${careerRank.color}`}>
                    {careerRank.grade} • Tier {careerRank.tier}
                  </span>
                </div>
                <p className="text-[11px] font-sans text-[#1A1D20]/70 mt-0.5">
                  {t("careerRank.ladderDesc", "Офіційний інженерний грейд за стандартами архітектурної кваліфікації (L1–L4)")}
                </p>
              </div>
            </div>

            {/* Current Active Rank Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-[#EFE9DC] px-3 py-1.5 rounded-xl border border-[#1A1D20]/15">
              <div className="text-right">
                <div className="text-[9px] font-mono uppercase text-[#1A1D20]/60 font-bold">
                  {t("careerRank.label", "Кваліфікація")}
                </div>
                <div className="font-display font-black text-xs text-[#1A1D20]">
                  {careerRank.codeName}
                </div>
              </div>
            </div>
          </div>

          {/* Progress towards Next Grade */}
          <div className="relative z-10 py-3.5 border-b border-[#1A1D20]/10">
            {careerRank.nextGrade && careerRank.nextRequirements ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#1A1D20] flex items-center gap-1.5">
                    <Target size={13} className="text-accent-blue" />
                    <span>
                      {t("careerRank.towardsNext", {
                        grade: careerRank.nextGrade,
                        title: CAREER_RANKS_CONFIG[careerRank.nextGrade].codeName,
                        defaultValue: `Прогрес до грейду ${careerRank.nextGrade} (${CAREER_RANKS_CONFIG[careerRank.nextGrade].codeName})`,
                      })}
                    </span>
                  </span>
                  <span className="font-bold text-accent-blue font-mono">
                    {careerRank.progressPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-[#1A1D20]/10 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-accent-blue to-purple-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${careerRank.progressPercent}%` }}
                  />
                </div>

                {/* Requirements Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {/* XP Requirement */}
                  <div
                    className={`p-2 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                      careerRank.requirementsMet.xp
                        ? "bg-emerald-500/10 border-emerald-600/30 text-emerald-900"
                        : "bg-[#FAF8F2] border-[#1A1D20]/15 text-[#1A1D20]/80"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {careerRank.requirementsMet.xp ? (
                        <Check size={12} className="text-emerald-700" strokeWidth={3} />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                      <span className="font-bold">XP:</span>
                    </span>
                    <span className="font-bold">
                      {t("careerRank.xpReq", {
                        current: xp,
                        target: careerRank.nextRequirements.minXp,
                        defaultValue: `${xp} / ${careerRank.nextRequirements.minXp} XP`,
                      })}
                    </span>
                  </div>

                  {/* Certified Stations Requirement */}
                  <div
                    className={`p-2 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                      careerRank.requirementsMet.stations
                        ? "bg-emerald-500/10 border-emerald-600/30 text-emerald-900"
                        : "bg-[#FAF8F2] border-[#1A1D20]/15 text-[#1A1D20]/80"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {careerRank.requirementsMet.stations ? (
                        <Check size={12} className="text-emerald-700" strokeWidth={3} />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                      <span className="font-bold">Stations:</span>
                    </span>
                    <span className="font-bold">
                      {t("careerRank.stationsReq", {
                        current: completedStationsCount,
                        target: careerRank.nextRequirements.minStations,
                        defaultValue: `${completedStationsCount} / ${careerRank.nextRequirements.minStations} stations`,
                      })}
                    </span>
                  </div>

                  {/* War Room SEV-1 Requirement */}
                  <div
                    className={`p-2 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                      careerRank.requirementsMet.warRoom
                        ? "bg-emerald-500/10 border-emerald-600/30 text-emerald-900"
                        : "bg-[#FAF8F2] border-[#1A1D20]/15 text-[#1A1D20]/80"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {careerRank.requirementsMet.warRoom ? (
                        <Check size={12} className="text-emerald-700" strokeWidth={3} />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                      <span className="font-bold">War Room:</span>
                    </span>
                    <span className="font-bold">
                      {t("careerRank.warRoomReq", {
                        current: resolvedWarRoomCount,
                        target: careerRank.nextRequirements.minWarRoom,
                        defaultValue: `${resolvedWarRoomCount} / ${careerRank.nextRequirements.minWarRoom} SEV-1`,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-900 bg-purple-500/15 p-2.5 rounded-xl border border-purple-600/30">
                <Check size={15} strokeWidth={3} className="text-purple-700" />
                <span>{t("careerRank.maxRank", "Найвищий інженерний ранг здобуто (Solutions Architect)")}</span>
              </div>
            )}
          </div>

          {/* Stepper Timeline: L1 -> L2 -> L3 -> L4 */}
          <div className="relative z-10 pt-3.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["L1", "L2", "L3", "L4"] as CareerRankGrade[]).map((gradeKey) => {
                const conf = CAREER_RANKS_CONFIG[gradeKey];
                const isCurrent = careerRank.grade === gradeKey;
                const isUnlocked = careerRank.tier >= conf.tier;

                return (
                  <div
                    key={gradeKey}
                    className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? "bg-[#EFE9DC] border-[#1A1D20] shadow-paper-xs ring-2 ring-purple-600/40"
                        : isUnlocked
                        ? "bg-[#EBE5D8] border-[#1A1D20]/25 text-[#1A1D20]"
                        : "bg-[#FAF8F2]/60 border-[#1A1D20]/15 text-[#1A1D20]/50 opacity-75"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold border ${conf.color}`}>
                          {gradeKey}
                        </span>
                        {isUnlocked ? (
                          <Check size={11} strokeWidth={3} className="text-emerald-700" />
                        ) : (
                          <Lock size={10} className="text-[#1A1D20]/40" />
                        )}
                      </div>
                      <div className="font-display font-extrabold text-xs text-[#1A1D20] mt-1.5 truncate">
                        {conf.codeName}
                      </div>
                      <div className="text-[10px] text-[#1A1D20]/65 font-sans mt-0.5 line-clamp-2 leading-tight">
                        {t(`careerRank.${gradeKey}.desc`, conf.defaultTitle)}
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-[#1A1D20]/10 text-[9px] font-mono text-[#1A1D20]/70 flex items-center justify-between">
                      <span>{conf.requirements.minXp} XP</span>
                      <span>{conf.requirements.minStations} st.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-[#1A1D20]/70 font-mono font-bold">
        {t("profile.achievementsSubtitle", "Сертифікати та досягнення у вирішенні завдань")}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {badges.map((badge) => {
          const IconComponent = badge.icon;
          return (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all shadow-paper-xs relative flex items-start gap-3 ${
                badge.isUnlocked
                  ? "bg-[#EBE5D8] border-[#1A1D20]/25 text-[#1A1D20]"
                  : "bg-[#FAF8F2]/60 border-[#1A1D20]/15 text-[#1A1D20]/50 opacity-75"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  badge.isUnlocked
                    ? `${badge.bgColor} ${badge.iconColor}`
                    : "bg-slate-200/50 border-slate-300/60 text-slate-400"
                }`}
              >
                <IconComponent size={18} />
              </div>
              <div className="flex-1 min-w-0 pr-14">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-display font-extrabold text-xs ${
                      badge.isUnlocked ? "text-[#1A1D20]" : "text-[#1A1D20]/70"
                    }`}
                  >
                    {badge.title}
                  </span>
                </div>
                <div className="text-[11px] text-[#1A1D20]/70 mt-0.5 leading-snug">
                  {badge.desc}
                </div>
              </div>

              {/* Status badge in top right */}
              <div className="absolute top-3 right-3 flex items-center gap-1">
                {badge.isUnlocked ? (
                  <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-600/30 flex items-center gap-1">
                    <Check size={10} strokeWidth={3} />
                    <span>{t("profile.acquired", "ЗДОБУТО")}</span>
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold text-[#1A1D20]/60 bg-[#1A1D20]/5 px-2 py-0.5 rounded border border-[#1A1D20]/15 flex items-center gap-1">
                    <Lock size={9} />
                    <span>{badge.progressText || t("profile.certLocked", "БЛОКОВАНО")}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Station Certificates Showcase */}
      <div className="pt-2 space-y-2">
        <div className="text-[11px] font-mono uppercase font-bold text-[#1A1D20]/70">
          {t("profile.availableCertificates", "Доступні сертифікати інженера")}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {certCards.map((cert) => {
            const IconComponent = cert.icon;
            return (
              <div
                key={cert.id}
                className="p-3.5 rounded-2xl bg-[#FAF8F2] border-2 border-[#1A1D20]/20 flex items-center justify-between shadow-paper-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconComponent size={16} className={`${cert.iconColor} shrink-0`} />
                  <div className="min-w-0">
                    <div className="text-xs font-display font-extrabold text-[#1A1D20] truncate">
                      {cert.title}
                    </div>
                    <div className="text-[10px] text-[#1A1D20]/60 font-mono">
                      {cert.spec}
                    </div>
                  </div>
                </div>

                {cert.status.isEligible ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-600/30">
                      {t("profile.acquired", "ЗДОБУТО")}
                    </span>
                    <button
                      type="button"
                      onClick={cert.onViewCert}
                      className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-600/40 text-amber-900 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                      title={t("profile.viewCertBtn", "Переглянути")}
                    >
                      <Trophy size={11} />
                      <span>{t("profile.viewCertBtn", "Переглянути")}</span>
                    </button>
                  </div>
                ) : cert.status.completedCount > 0 ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-600/30">
                      {t("profile.certInProgress", "В ПРОЦЕСІ")}
                    </span>
                    <button
                      type="button"
                      onClick={() => onJumpToTask(cert.id)}
                      className="px-2 py-1 rounded-lg bg-[#1A1D20] hover:bg-black text-white text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                      title={t("profile.practiceTaskBtn", "Практикувати")}
                    >
                      <ArrowRight size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-[#1A1D20]/50 bg-[#1A1D20]/5 px-2 py-0.5 rounded border border-[#1A1D20]/15">
                      {t("profile.certLocked", "НЕ РОЗПОЧАТО")}
                    </span>
                    <button
                      type="button"
                      onClick={() => onJumpToTask(cert.id)}
                      className="px-2 py-1 rounded-lg bg-[#1A1D20] hover:bg-black text-white text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                      title={t("profile.practiceTaskBtn", "Практикувати")}
                    >
                      <ArrowRight size={10} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
