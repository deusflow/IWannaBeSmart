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
  isHeroCard?: boolean;
  isWaitingStation?: boolean;
  waitingBadgeText?: string;
}

export const StationShowcaseCard: React.FC<StationShowcaseCardProps> = ({
  stationId,
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
  accentBorderClass = "hover:border-black/[0.18]",
  starColorClass = "text-amber-700",
  lockCriteria,
  onEnter,
  onViewCert,
  certTooltip,
  isHeroCard = false,
  isWaitingStation = false,
  waitingBadgeText,
}) => {
  const { t } = useTranslation();

  if (statusType === "locked" || statusType === "roadmap") {
    const isRoadmap = statusType === "roadmap" || lockCriteria?.isRoadmap;
    return (
      <div
        data-testid={`station-card-${stationId}`}
        className={`flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-black/[0.07] shadow-porcelain space-y-3 relative overflow-hidden ${
          isWaitingStation ? "opacity-40 pointer-events-none select-none cursor-not-allowed" : ""
        }`}
      >
        <div className="space-y-2.5">
          {/* Top row: Module code on left, Status badge on right */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 border border-black/[0.06] text-slate-700">
              {codeLabel}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                isRoadmap
                  ? "bg-slate-100 border-slate-200 text-slate-600"
                  : "bg-slate-50 border-black/[0.06] text-slate-500"
              }`}
            >
              {isRoadmap ? (
                <>
                  <Construction size={11} className="text-slate-600" />
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
            <h3 className="font-display font-bold text-base sm:text-lg text-[#0F141C] flex items-center gap-2">
              <span>{title}</span>
            </h3>
            <p className="text-xs font-sans text-[#525866] mt-0.5 leading-relaxed line-clamp-2">
              {subtitle}
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/70 border border-black/[0.05] flex items-center justify-center py-3.5 sm:py-4 relative overflow-hidden opacity-75">
            <div className="absolute inset-0 bg-notebook-grid opacity-30 pointer-events-none" />
            {blueprint}
          </div>

          {lockCriteria && (
            <div
              className="p-2.5 rounded-xl border border-black/[0.06] bg-slate-50/60 space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
                <span>{lockCriteria.conditionText}</span>
                <span className="font-bold text-[#0F141C]">{lockCriteria.progressText}</span>
              </div>
              {!isRoadmap && (
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#252932] transition-all duration-300"
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
              className="w-full py-2 px-3 rounded-xl border border-black/[0.06] bg-slate-50 font-mono font-bold text-[10.5px] text-center flex items-center justify-center gap-1.5 text-slate-500"
            >
              {isRoadmap ? <Construction size={12} className="text-slate-500" /> : <Lock size={12} />}
              <span>{lockCriteria.badgeText}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid={`station-card-${stationId}`}
      className={`flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border transition-all space-y-3 shadow-porcelain hover:shadow-luxury ${
        isHeroCard
          ? "col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 border-[#252932] ring-1 ring-black/[0.08]"
          : isWaitingStation
          ? "border-black/[0.06] opacity-40 pointer-events-none select-none bg-slate-50 cursor-not-allowed"
          : isTrackStation
          ? "border-[#252932]/70 shadow-porcelain ring-1 ring-[#252932]/15"
          : isRecommended
          ? "border-black/[0.12] shadow-porcelain"
          : isSecondaryStation
          ? `border-black/[0.07] opacity-90 hover:opacity-100 ${accentBorderClass}`
          : `border-black/[0.07] ${accentBorderClass}`
      }`}
    >
      <div className="space-y-2.5">
        {/* Row 1: Module number on left, Status on right (single clean line) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 border border-black/[0.06] text-slate-700">
              {codeLabel}
            </span>
            {isSecondaryStation && (
              <span className="text-[9px] font-mono font-medium uppercase px-1.5 py-0.5 rounded-md bg-slate-50 border border-black/[0.06] text-slate-500">
                {t("career.secondaryStation", "Додатково")}
              </span>
            )}
          </div>
          {isWaitingStation ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border bg-slate-50 border-black/[0.06] text-slate-500">
              <Lock size={10} className="text-slate-400 shrink-0" />
              <span>{waitingBadgeText || t("onboarding.unlocksAfterStation01", "Відкриється після Станції 01")}</span>
            </span>
          ) : (
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                statusType === "mastered"
                  ? "bg-[#FBF7EF] border-[#C5A059]/30 text-[#8C6D28]"
                  : statusType === "completed"
                  ? "bg-emerald-50 border-emerald-600/20 text-emerald-800"
                  : "bg-slate-50 border-black/[0.06] text-slate-600"
              }`}
            >
              {statusType === "mastered"
                ? `${t("hub.stationCompleted", "ЗАВЕРШЕНО")} (${maxStars}/${maxStars} ★)`
                : statusType === "completed"
                ? `${t("hub.stationCompleted", "ЗАВЕРШЕНО")} (${currentStars}/${maxStars} ★)`
                : `${t("hub.stationAvailable", "ДОСТУПНО")} (${currentStars}/${maxStars} ★)`}
            </span>
          )}
        </div>

        {/* Row 2: Track strip, Hero strip, or Recommended strip */}
        {isHeroCard ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#252932] text-[#F8F9FA] text-xs sm:text-sm font-mono font-extrabold shadow-2xs">
            <Sparkles size={14} className="text-[#C5A059] shrink-0 animate-pulse" />
            <span>{beaconText || t("onboarding.startHere60s", " СТАРТ ТУТ: ПЕРШІ 60 СЕКУНД")}</span>
          </div>
        ) : isTrackStation ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#252932] text-white text-xs font-mono font-bold shadow-2xs">
            <Sparkles size={13} className="text-[#C5A059] shrink-0" />
            <span>{trackBadgeText || t("career.yourTrackBadge", "★ Твій трек")}</span>
          </div>
        ) : isRecommended ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-black/[0.06] text-slate-700 text-xs font-mono font-bold">
            <Sparkles size={13} className="text-slate-500 shrink-0" />
            <span>{beaconText || t("onboarding.beaconStart", t("hub.recommendedStart", " Базовий контур: рекомендовано для старту інженера"))}</span>
          </div>
        ) : null}

        {/* Row 3: Title & Subtitle */}
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-[#0F141C]">
            {title}
          </h3>
          <p className="text-xs font-sans text-[#525866] mt-0.5 leading-relaxed line-clamp-2">
            {subtitle}
          </p>
        </div>

        {/* Blueprint Diagram */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/70 border border-black/[0.05] flex items-center justify-center py-3.5 sm:py-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-notebook-grid opacity-25 pointer-events-none" />
          {blueprint}
        </div>

        {/* Specs & Task Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#525866]">
            <span className="truncate mr-2">{specs}</span>
            <span className={`font-bold shrink-0 ${starColorClass}`}>
              {currentStars}/{maxStars} ★
            </span>
          </div>

          <div className="w-full space-y-0.5">
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentStars >= maxStars
                    ? "bg-gradient-to-r from-[#C5A059] to-[#E6C687]"
                    : currentStars > 0
                    ? "bg-emerald-500"
                    : "bg-[#252932]"
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
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
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
          data-testid={`enter-station-${stationId}`}
          onClick={isWaitingStation ? undefined : onEnter}
          disabled={isWaitingStation}
          className={`flex-1 py-2 px-3.5 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-xs ${
            isHeroCard
              ? "py-2.5 text-xs sm:text-sm bg-[#0F141C] hover:bg-[#252932] text-white shadow-sm ring-1 ring-black/10 cursor-pointer"
              : isWaitingStation
              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              : isTrackStation
              ? "bg-[#252932] hover:bg-[#383E4C] text-white cursor-pointer"
              : isRecommended
              ? "bg-[#252932] hover:bg-[#383E4C] text-white cursor-pointer"
              : "bg-[#252932] hover:bg-[#383E4C] text-white cursor-pointer"
          }`}
        >
          <span>
            {isHeroCard
              ? t("hub.startHereBtn", "Почати за 60 секунд")
              : isWaitingStation
              ? t("onboarding.unlocksAfterStation01", "Відкриється після Станції 01")
              : t("hub.enterStation", "Увійти на станцію")}
          </span>
          <ArrowRight size={13} />
        </button>

        {onViewCert && (
          <button
            onClick={onViewCert}
            className="p-2 rounded-xl bg-[#FBF7EF] hover:bg-[#F3EBD9] border border-[#C5A059]/30 text-[#8C6D28] transition-colors cursor-pointer shrink-0 shadow-2xs"
            title={certTooltip || t("hub.viewCertTooltip", "Переглянути сертифікат")}
          >
            <Trophy size={15} className="text-[#C5A059]" />
          </button>
        )}
      </div>
    </div>
  );
};
