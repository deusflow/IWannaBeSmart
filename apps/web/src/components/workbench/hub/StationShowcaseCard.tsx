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
        className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-[#1E2227]/15 space-y-3 relative overflow-hidden shadow-xs"
      >
        <div className="space-y-2.5">
          {/* Top row: Module code on left, Status badge on right */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#1E2227]/5 border border-[#1E2227]/10 text-[#1E2227]/70">
              {codeLabel}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                isRoadmap
                  ? "bg-[#F5EDE6] border-[#C86D32]/30 text-[#C86D32]"
                  : "bg-[#1E2227]/5 border-[#1E2227]/10 text-[#1E2227]/60"
              }`}
            >
              {isRoadmap ? (
                <>
                  <Construction size={11} className="text-[#C86D32]" />
                  <span>{t("hub.stations.iot.badge", "В розробці (2 семестр)")}</span>
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
            <h3 className="font-display font-bold text-base sm:text-lg text-[#1E2227]/80 flex items-center gap-2">
              <span>{title}</span>
            </h3>
            <p className="text-xs font-sans text-[#1E2227]/65 mt-0.5 leading-relaxed line-clamp-2">
              {subtitle}
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF8F4] border border-[#1E2227]/10 flex items-center justify-center py-3.5 sm:py-4 relative overflow-hidden opacity-75">
            <div className="absolute inset-0 bg-notebook-grid opacity-30 pointer-events-none" />
            {blueprint}
          </div>

          {lockCriteria && (
            <div
              className={`p-2.5 rounded-xl border space-y-1 ${
                isRoadmap
                  ? "bg-[#F5EDE6]/60 border-[#C86D32]/20"
                  : "bg-[#1E2227]/5 border-[#1E2227]/10"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#1E2227]/75">
                <span>{lockCriteria.conditionText}</span>
                <span className="font-bold text-[#1E2227]">{lockCriteria.progressText}</span>
              </div>
              {!isRoadmap && (
                <div className="w-full h-1.5 rounded-full bg-[#1E2227]/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#C86D32] transition-all duration-300"
                    style={{ width: `${lockCriteria.percent}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {lockCriteria && (
          <div className="pt-1">
            <div
              className={`w-full py-2 px-3 rounded-xl border font-mono font-bold text-[10.5px] text-center flex items-center justify-center gap-1.5 ${
                isRoadmap
                  ? "bg-[#F5EDE6] border-[#C86D32]/30 text-[#C86D32] shadow-2xs"
                  : "bg-[#1E2227]/5 border-[#1E2227]/10 text-[#1E2227]/60"
              }`}
            >
              {isRoadmap ? <Construction size={12} className="text-[#C86D32]" /> : <Lock size={12} />}
              <span>{lockCriteria.badgeText}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border transition-all space-y-3 shadow-xs hover:shadow-paper-sm ${
        isTrackStation
          ? "border-[#C86D32]/50 shadow-sm ring-2 ring-[#C86D32]/20"
          : isRecommended
          ? "border-[#3B6B88]/40 shadow-sm ring-2 ring-[#3B6B88]/15"
          : isSecondaryStation
          ? `border-[#1E2227]/15 opacity-85 hover:opacity-100 ${accentBorderClass}`
          : `border-[#1E2227]/15 ${accentBorderClass}`
      }`}
    >
      <div className="space-y-2.5">
        {/* Row 1: Module number on left, Status on right (single clean line) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#1E2227]/5 border border-[#1E2227]/10 text-[#1E2227]">
              {codeLabel}
            </span>
            {isSecondaryStation && (
              <span className="text-[9px] font-mono font-medium uppercase px-1.5 py-0.5 rounded bg-[#1E2227]/5 border border-[#1E2227]/10 text-[#1E2227]/60">
                {t("career.secondaryStation", "Додатково")}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
              statusType === "mastered"
                ? "bg-[#F5EDE6] border-[#C86D32]/30 text-[#C86D32]"
                : statusType === "completed"
                ? "bg-[#EAF3EE] border-[#3E7A5E]/30 text-[#3E7A5E]"
                : "bg-[#EAF0F4] border-[#3B6B88]/30 text-[#3B6B88]"
            }`}
          >
            {statusType === "mastered"
              ? `${t("hub.stationCompleted", "ЗАВЕРШЕНО")} (${maxStars}/${maxStars} ★)`
              : statusType === "completed"
              ? `${t("hub.stationCompleted", "ЗАВЕРШЕНО")} (${currentStars}/${maxStars} ★)`
              : `${t("hub.stationAvailable", "ДОСТУПНО")} (${currentStars}/${maxStars} ★)`}
          </span>
        </div>

        {/* Row 2: Track strip or Recommended strip (placed cleanly above title) */}
        {isTrackStation ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5EDE6] border border-[#C86D32]/30 text-[#C86D32] text-xs font-mono font-bold shadow-2xs">
            <Sparkles size={13} className="text-[#C86D32] shrink-0" />
            <span>{trackBadgeText || t("career.yourTrackBadge", "★ Твій трек")}</span>
          </div>
        ) : isRecommended ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF0F4] border border-[#3B6B88]/30 text-[#3B6B88] text-xs font-mono font-bold">
            <Sparkles size={13} className="text-[#3B6B88] shrink-0" />
            <span>{beaconText || t("onboarding.beaconStart", t("hub.recommendedStart", "🌟 Базовий контур: рекомендовано для старту інженера"))}</span>
          </div>
        ) : null}

        {/* Row 3: Title & Subtitle */}
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-[#1E2227]">
            {title}
          </h3>
          <p className="text-xs font-sans text-[#1E2227]/70 mt-0.5 leading-relaxed line-clamp-2">
            {subtitle}
          </p>
        </div>

        {/* Blueprint Diagram */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF8F4] border border-[#1E2227]/10 flex items-center justify-center py-3.5 sm:py-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-notebook-grid opacity-30 pointer-events-none" />
          {blueprint}
        </div>

        {/* Specs & Task Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#1E2227]/80">
            <span className="truncate mr-2">{specs}</span>
            <span className={`font-bold shrink-0 ${starColorClass}`}>
              {currentStars}/{maxStars} ★
            </span>
          </div>

          <div className="w-full space-y-0.5">
            <div className="w-full h-1.5 rounded-full bg-[#1E2227]/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentStars >= maxStars
                    ? "bg-[#C86D32]"
                    : currentStars > 0
                    ? "bg-[#3E7A5E]"
                    : "bg-[#3B6B88]"
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
            <div className="flex items-center justify-between text-[9px] font-mono text-[#1E2227]/60">
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
      <div className="pt-1.5 flex items-center gap-2">
        <button
          onClick={onEnter}
          className={`flex-1 py-2 px-3.5 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-xs ${
            isTrackStation
              ? "bg-[#C86D32] hover:bg-[#B35E28] text-white"
              : isRecommended
              ? "bg-[#3B6B88] hover:bg-[#2F566E] text-white"
              : "bg-[#1E2227] hover:bg-black text-white"
          }`}
        >
          <span>{t("hub.enterStation", "Увійти на станцію")}</span>
          <ArrowRight size={13} />
        </button>

        {onViewCert && (
          <button
            onClick={onViewCert}
            className="p-2 rounded-xl bg-[#F5EDE6] hover:bg-[#EBDDCF] border border-[#C86D32]/30 text-[#C86D32] transition-colors cursor-pointer shrink-0"
            title={certTooltip || t("hub.viewCertTooltip", "Переглянути сертифікат")}
          >
            <Trophy size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
