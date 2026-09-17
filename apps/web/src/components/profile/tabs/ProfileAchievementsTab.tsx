/**
 * @file apps/web/src/components/profile/tabs/ProfileAchievementsTab.tsx
 * @description Station certificates showcase, eligibility verification, and system mastery badges.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Zap,
  Layers,
  CreditCard,
  Award,
  Trophy,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

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
  onJumpToTask: (stationId: string) => void;
}

export const ProfileAchievementsTab: React.FC<ProfileAchievementsTabProps> = ({
  certCards,
  onJumpToTask,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="text-xs text-[#1A1D20]/70 font-mono font-bold">
        {t("profile.achievementsSubtitle", "Сертифікати та досягнення у вирішенні завдань")}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Badge 1: Speed Demon */}
        <div className="p-4 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 flex items-start gap-3 shadow-paper-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-600/40 text-amber-800 flex items-center justify-center shrink-0">
            <Zap size={18} />
          </div>
          <div>
            <div className="font-display font-extrabold text-xs text-[#1A1D20]">
              {t("profile.badgeSpeedDemon", "Спринтер алгоритмів")}
            </div>
            <div className="text-[11px] text-[#1A1D20]/70 mt-0.5">
              {t("profile.badgeSpeedDemonDesc", "Досягнуто швидкість понад 60 слів/хв у Code Gym")}
            </div>
          </div>
        </div>

        {/* Badge 2: Architecture Master */}
        <div className="p-4 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 flex items-start gap-3 shadow-paper-xs">
          <div className="w-9 h-9 rounded-xl bg-accent-blue/15 border border-accent-blue/30 text-accent-blue flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <div className="font-display font-extrabold text-xs text-[#1A1D20]">
              {t("profile.badgeArchitectureMaster", "Майстер архітектури")}
            </div>
            <div className="text-[11px] text-[#1A1D20]/70 mt-0.5">
              {t("profile.badgeArchitectureMasterDesc", "Успішно зібрано DI контейнер та з'єднано шину викликів")}
            </div>
          </div>
        </div>

        {/* Badge 3: Fintech Shield */}
        <div className="p-4 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 flex items-start gap-3 shadow-paper-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-600/40 text-emerald-800 flex items-center justify-center shrink-0">
            <CreditCard size={18} />
          </div>
          <div>
            <div className="font-display font-extrabold text-xs text-[#1A1D20]">
              {t("profile.badgeFintechShield", "Вартовий транзакцій")}
            </div>
            <div className="text-[11px] text-[#1A1D20]/70 mt-0.5">
              {t("profile.badgeFintechShieldDesc", "Захищено банківський POS-термінал від збоїв та блокувань")}
            </div>
          </div>
        </div>

        {/* Badge 4: Pattern Collector */}
        <div className="p-4 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 flex items-start gap-3 shadow-paper-xs">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-600/40 text-purple-800 flex items-center justify-center shrink-0">
            <Award size={18} />
          </div>
          <div>
            <div className="font-display font-extrabold text-xs text-[#1A1D20]">
              {t("profile.badgePatternCollector", "Колекціонер патернів")}
            </div>
            <div className="text-[11px] text-[#1A1D20]/70 mt-0.5">
              {t("profile.badgePatternCollectorDesc", "Освоєно понад 5 ключових патернів проєктування")}
            </div>
          </div>
        </div>
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
