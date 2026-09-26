/**
 * @file apps/web/src/components/workbench/hub/StationShowcaseCard.tsx
 * @description Tactile Station Showcase Card with blueprint illustration, star metrics, and certificate triggers.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Lock,
  ArrowRight,
  Trophy,
  Sparkles,
  Construction,
} from "lucide-react";

export interface StationShowcaseCardProps {
  stationId: string;
  codeLabel: string;
  title: string;
  subtitle: string;
  blueprint: React.ReactNode;
  specs: string;
  currentStars: number;
  maxStars: number;
  statusType?: "mastered" | "completed" | "available" | "locked" | "roadmap";
  isRecommended?: boolean;
  beaconText?: string;
  isTrackStation?: boolean;
  isSecondaryStation?: boolean;
  trackBadgeText?: string;
  accentBorderClass?: string;
  starColorClass?: string;
  lockCriteria?: {
    conditionText: string;
    progressText: string;
    percent: number;
    badgeText: string;
    isRoadmap?: boolean;
  };
  onEnter?: () => void;
  onViewCert?: () => void;
  certTooltip?: string;
}

export const StationShowcaseCard: React.FC<StationShowcaseCardProps> = ({
  codeLabel,
  title,
  subtitle,
  blueprint,
  specs,
  currentStars,
  maxStars,
  statusType,
  isRecommended = false,
  beaconText,
  isTrackStation = false,
  isSecondaryStation = false,
  trackBadgeText,
  accentBorderClass = "hover:border-[#1A1D20]/50",
  starColorClass = "text-amber-700",
  lockCriteria,
  onEnter,
  onViewCert,
  certTooltip,
}) => {
  const { t } = useTranslation();

  if (statusType === "locked" || statusType === "roadmap") {
    const isRoadmap = statusType === "roadmap" || lockCriteria?.isRoadmap;
    return (
      <div
        className={`flex flex-col justify-between p-5 rounded-3xl border-2 border-dashed space-y-4 relative overflow-hidden ${
          isRoadmap
            ? "bg-[#EFE9DC]/80 border-amber-600/35"
            : "bg-[#EBE5D8]/70 border-[#1A1D20]/30"
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-[#1A1D20]/10 border border-[#1A1D20]/20 text-[#1A1D20]/60">
              {codeLabel}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${
                isRoadmap
                  ? "bg-amber-500/15 border-amber-600/30 text-amber-800"
                  : "bg-stone-500/15 border-stone-600/30 text-stone-700"
              }`}
            >
              {isRoadmap ? (
                <>
                  <Construction size={11} className="text-amber-700" />
                  <span>{t("hub.stationInDevelopment", "В РОЗРОБЦІ")}</span>
                </>
              ) : (
                <>
                  <Lock size={10} />
                  <span>{t("hub.stationLocked", "ЗАБЛОКОВАНО")}</span>
                </>
              )}
            </span>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-[#1A1D20]/80 flex items-center gap-2">
              <span>{title}</span>
            </h3>
            <p className="text-xs font-sans text-[#1A1D20]/65 mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#DFD7C5]/50 border border-[#1A1D20]/15 flex items-center justify-center py-6 relative overflow-hidden opacity-75">
            <div className="absolute inset-0 bg-notebook-grid opacity-30 pointer-events-none" />
            {blueprint}
          </div>

          {lockCriteria && (
            <div
              className={`p-3 rounded-xl border space-y-1.5 ${
                isRoadmap
                  ? "bg-amber-500/10 border-amber-600/20"
                  : "bg-[#DFD7C5]/60 border-[#1A1D20]/15"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#1A1D20]/75">
                <span>{lockCriteria.conditionText}</span>
                <span className="font-bold text-[#1A1D20]">{lockCriteria.progressText}</span>
              </div>
              {!isRoadmap && (
                <div className="w-full h-1.5 rounded-full bg-[#1A1D20]/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-600 transition-all duration-300"
                    style={{ width: `${lockCriteria.percent}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {lockCriteria && (
          <div className="pt-2">
            <div
              className={`w-full py-2 px-3 rounded-xl border font-mono font-bold text-[11px] text-center flex items-center justify-center gap-1.5 ${
                isRoadmap
                  ? "bg-amber-500/15 border-amber-600/35 text-amber-900 shadow-2xs"
                  : "bg-[#DFD7C5]/70 border-[#1A1D20]/20 text-[#1A1D20]/60"
              }`}
            >
              {isRoadmap ? <Construction size={12} className="text-amber-700" /> : <Lock size={12} />}
              <span>{lockCriteria.badgeText}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col justify-between p-5 rounded-3xl bg-[#FAF8F2] border-2 transition-all space-y-4 shadow-paper-sm hover:shadow-paper-md ${
        isTrackStation
          ? "border-amber-600/70 shadow-paper-md ring-2 ring-amber-500/25 bg-[#FDFBF7]"
          : isRecommended
          ? "border-amber-500/60 shadow-paper-md ring-2 ring-amber-500/20"
          : isSecondaryStation
          ? `border-[#1A1D20]/20 opacity-85 hover:opacity-100 ${accentBorderClass}`
          : `border-[#1A1D20]/25 ${accentBorderClass}`
      }`}
    >
      <div className="space-y-3">
        {/* Track Beacon or Recommended Beacon */}
        {isTrackStation ? (
          <div className="flex items-center justify-between px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-600/40 text-amber-950 text-xs font-mono font-bold shadow-2xs">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-700 shrink-0" />
              <span>{trackBadgeText || t("career.yourTrackBadge", "★ Твій трек")}</span>
            </div>
            <span className="text-[10px] font-mono text-amber-800 uppercase tracking-wider font-extrabold">
              {t("career.recommendedFocus", "ФОКУС")}
            </span>
          </div>
        ) : isRecommended ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-600/40 text-amber-900 text-xs font-mono font-bold animate-pulse">
            <Sparkles size={13} className="text-amber-700 shrink-0" />
            <span>{beaconText || t("onboarding.beaconStart", t("hub.recommendedStart", "🌟 Базовий контур: рекомендовано для старту інженера"))}</span>
          </div>
        ) : null}

        {/* Badge & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-[#1A1D20]/10 border border-[#1A1D20]/20 text-[#1A1D20]">
              {codeLabel}
            </span>
            {isSecondaryStation && (
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-[#1A1D20]/5 border border-[#1A1D20]/15 text-[#1A1D20]/60">
                {t("career.secondaryStation", "Додатково")}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${
              statusType === "mastered"
                ? "bg-amber-500/15 border-amber-600/30 text-amber-900"
                : statusType === "completed"
                ? "bg-emerald-500/15 border-emerald-600/30 text-emerald-900"
                : "bg-blue-500/15 border-blue-600/30 text-blue-900"
            }`}
          >
            {statusType === "mastered"
              ? `${t("hub.stationCompleted", "ЗАВЕРШЕНО")} (${maxStars}/${maxStars} ★)`
              : statusType === "completed"
              ? `${t("hub.stationCompleted", "ЗАВЕРШЕНО")} (${currentStars}/${maxStars} ★)`
              : `${t("hub.stationAvailable", "ДОСТУПНО")} (${currentStars}/${maxStars} ★)`}
          </span>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h3 className="font-display font-bold text-lg text-[#1A1D20]">
            {title}
          </h3>
          <p className="text-xs font-sans text-[#1A1D20]/70 mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Blueprint Diagram */}
        <div className="p-4 rounded-2xl bg-[#EFEAE1] border border-[#1A1D20]/15 flex items-center justify-center py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-notebook-grid opacity-40 pointer-events-none" />
          {blueprint}
        </div>

        {/* Specs & Task Progress with Zeigarnik Endowed Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-[#1A1D20]/80">
            <span>{specs}</span>
            <span className={`font-bold ${starColorClass}`}>
              {currentStars}/{maxStars} ★
            </span>
          </div>

          <div className="w-full space-y-1">
            <div className="w-full h-1.5 rounded-full bg-[#1A1D20]/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentStars >= maxStars
                    ? "bg-amber-600"
                    : currentStars > 0
                    ? "bg-emerald-600"
                    : "bg-gradient-to-r from-amber-500 to-emerald-500 animate-pulse"
                }`}
                style={{
                  width: `${
                    currentStars === 0
                      ? 25
                      : Math.max(25, Math.round((currentStars / maxStars) * 100))
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[9.5px] font-mono text-[#1A1D20]/60">
              <span>
                {currentStars === 0
                  ? t("architecture.circuitInitialized", {
                      remaining: maxStars,
                      defaultValue: "Контур ініціалізовано: 25%",
                    })
                  : currentStars >= maxStars
                  ? t("hub.stationCompleted", "ЗАВЕРШЕНО")
                  : `${Math.round((currentStars / maxStars) * 100)}%`}
              </span>
              <span>{currentStars === 0 ? "25% (Endowed)" : `${currentStars}/${maxStars} ★`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center gap-2">
        <button
          onClick={onEnter}
          className={`flex-1 py-2.5 px-4 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-sm ${
            isRecommended
              ? "bg-accent-blue hover:bg-blue-600 text-white ring-2 ring-blue-500/40"
              : "bg-[#1A1D20] hover:bg-black text-white"
          }`}
        >
          <span>{t("hub.enterStation", "Увійти на станцію")}</span>
          <ArrowRight size={14} />
        </button>

        {onViewCert && (
          <button
            onClick={onViewCert}
            className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-600/40 text-amber-800 transition-colors cursor-pointer"
            title={certTooltip || t("hub.viewCertTooltip", "Переглянути сертифікат")}
          >
            <Trophy size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
