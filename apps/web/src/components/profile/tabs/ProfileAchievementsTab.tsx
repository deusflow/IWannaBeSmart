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
  type LucideIcon,
} from "lucide-react";

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
}

export const ProfileAchievementsTab: React.FC<ProfileAchievementsTabProps> = ({
  certCards,
  badges = [],
  onJumpToTask,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
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
