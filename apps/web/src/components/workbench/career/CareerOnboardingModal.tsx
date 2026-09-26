/**
 * @file apps/web/src/components/workbench/career/CareerOnboardingModal.tsx
 * @description Career track selection modal welcoming freshman engineers.
 *              Empowers students to select their focus without fear of failure:
 *              "Impossible to lose when it's an experiment."
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  X,
  Compass,
  Briefcase,
  Layers,
} from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { CAREER_TRACKS, type CareerTrackItem } from "./careerTracks";
import type { CareerTrack } from "../../../store/types";
import { audioFx } from "../../../utils/audioFx";
import { LanguageSwitcher } from "../LanguageSwitcher";

export const CareerOnboardingModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    userTrack,
    hasCompletedOnboarding,
    isCareerModalOpen,
    setUserTrack,
    setIsCareerModalOpen,
  } = useWorkbenchStore(
    useShallow((s) => ({
      userTrack: s.userTrack,
      hasCompletedOnboarding: s.hasCompletedOnboarding,
      isCareerModalOpen: s.isCareerModalOpen,
      setUserTrack: s.setUserTrack,
      setIsCareerModalOpen: s.setIsCareerModalOpen,
    }))
  );

  const [selectedTrack, setSelectedTrack] = useState<CareerTrack>(
    userTrack || "explorer"
  );

  if (!isCareerModalOpen) return null;

  const handleSelect = (track: CareerTrack) => {
    audioFx.playRelayClick();
    setSelectedTrack(track);
  };

  const handleConfirm = () => {
    audioFx.playSuccessFanfare();
    setUserTrack(selectedTrack);
  };

  const handleDismiss = () => {
    audioFx.playRelayClick();
    if (!userTrack) {
      setUserTrack("explorer");
    } else {
      setIsCareerModalOpen(false);
    }
  };

  return (
    <div
      id="career-onboarding-modal"
      className="fixed inset-0 z-50 bg-[#1E2227]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-5xl rounded-3xl bg-[#FAF8F4] border border-[#1E2227]/15 shadow-xl relative overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Background Drafting Grid */}
        <div className="absolute inset-0 bg-notebook-grid opacity-30 pointer-events-none" />

        {/* ── Top Bar & Header ── */}
        <div className="relative z-10 px-5 sm:px-8 pt-5 pb-4 border-b border-[#1E2227]/15 bg-[#FAF8F4] shrink-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EDE6] border border-[#C86D32]/30 text-[#C86D32] text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles size={12} className="text-[#C86D32]" />
                <span>{hasCompletedOnboarding ? "CAREER TRACK FOCUS" : "CAREER ONBOARDING"}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EAF3EE] border border-[#3E7A5E]/25 text-[#3E7A5E] text-[10px] font-mono font-bold tracking-tight">
                <span>«{t("career.motto", "Неможливо програти, якщо це експеримент")}»</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#1E2227] tracking-tight">
              {t("career.onboardingModalTitle", "Обери свій інженерний шлях")}
            </h2>

            <p className="text-xs sm:text-sm font-sans text-[#1E2227]/75 leading-relaxed">
              {t(
                "career.onboardingModalSubtitle",
                "Не бійся помилитися: будь-який вибір — це експеримент, а напрямок можна змінити у будь-який момент в один клік."
              )}
            </p>
          </div>

          {/* Language Switcher & Close button */}
          <div className="self-end sm:self-start flex items-center gap-2.5 shrink-0">
            <LanguageSwitcher compact />
            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 rounded-xl border border-[#1E2227]/15 hover:border-[#1E2227]/40 text-[#1E2227]/60 hover:text-[#1E2227] bg-white hover:bg-[#F0EDE6] transition-all cursor-pointer shrink-0"
              title={t("common.close", "Закрити")}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── 4 Career Track Cards Grid ── */}
        <div className="relative z-10 p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {CAREER_TRACKS.map((track: CareerTrackItem) => {
              const isSelected = selectedTrack === track.id;
              const Icon = track.icon;
              const isExplorer = track.id === "explorer";

              return (
                <div
                  key={track.id}
                  onClick={() => handleSelect(track.id)}
                  className={`flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative select-none group ${
                    isSelected
                      ? `bg-white ${track.theme.accentBorder} ring-2 ${track.theme.ringColor} shadow-md`
                      : "bg-[#FFFFFF] border-[#1E2227]/15 hover:border-[#1E2227]/40 hover:bg-[#FDFBF7] shadow-xs"
                  }`}
                >
                  <div className="space-y-3.5 flex-1">
                    {/* 1. [Иконка в матовом цветном квадрате + Бейдж роли] + [Индикатор выбора справа] */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${
                            isSelected
                              ? "bg-[#1E2227] text-white border-[#1E2227]"
                              : `${track.theme.accentBg} ${track.theme.accentText} ${track.theme.cardBorder}`
                          }`}
                        >
                          <Icon size={18} strokeWidth={2.2} />
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10.5px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${track.theme.accentBg} ${track.theme.accentText} ${track.theme.tagBorder}`}>
                            {t(track.roleBadgeKey)}
                          </span>
                          {isExplorer && (
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#F5EDE6] text-[#C86D32] border border-[#C86D32]/30">
                              ★ СТАРТОВИЙ ТРЕК
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "border-[#1E2227] bg-[#1E2227] text-white"
                            : "border-[#1E2227]/25 bg-transparent text-transparent group-hover:border-[#1E2227]/50"
                        }`}
                      >
                        <CheckCircle2 size={13} strokeWidth={3} />
                      </div>
                    </div>

                    {/* 2. [Жирный крупный заголовок трека] */}
                    <h3 className="font-display font-bold text-base sm:text-lg text-[#1E2227] leading-snug">
                      {t(track.titleKey)}
                    </h3>

                    {/* 3. [Блок "Для кого" с левой цветной чертой] */}
                    <div className={`border-l-2 ${track.theme.leftBarColor} pl-3 py-0.5`}>
                      <span className="font-mono font-bold text-[10px] uppercase text-[#1E2227]/60 block mb-0.5">
                        {t("career.forWhom", "Для кого:")}
                      </span>
                      <p className="font-sans text-xs text-[#1E2227]/80 leading-relaxed">
                        {t(track.audienceKey)}
                      </p>
                    </div>

                    {/* 4. [Блок "Кем сможешь работать" на цветной плашке] */}
                    <div className={`p-2.5 rounded-xl ${track.theme.pillBg} border ${track.theme.cardBorder}`}>
                      <span className="font-mono font-bold text-[10px] uppercase text-[#1E2227]/60 flex items-center gap-1 mb-1">
                        <Briefcase size={11} className={track.theme.accentText} />
                        <span>{t("career.roles", "Ким зможеш працювати:")}</span>
                      </span>
                      <p className="font-mono font-semibold text-xs text-[#1E2227] leading-snug">
                        {t(track.rolesKey)}
                      </p>
                    </div>

                    {/* 5. [Список станций] */}
                    <div className="pt-2 border-t border-[#1E2227]/10">
                      <span className="font-mono font-bold text-[10px] uppercase text-[#1E2227]/60 flex items-center gap-1 mb-1">
                        <Layers size={11} />
                        <span>{t("career.stationsInTrack", "Твої станції в проєкті:")}</span>
                      </span>
                      <p className="font-mono text-[11px] text-[#1E2227]/75 leading-relaxed">
                        {t(track.stationsKey)}
                      </p>
                    </div>
                  </div>

                  {/* 6. [Кнопка / переключатель выбора] */}
                  <div className="mt-4 pt-3 border-t border-[#1E2227]/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#1E2227]/70">
                      {isSelected
                        ? `✓ ${t("career.selectedTrack", "Обрано як фокус")}`
                        : t("career.clickToSelect", "Натисніть для вибору")}
                    </span>
                    <span
                      className={`text-xs font-mono font-extrabold flex items-center gap-1 transition-all ${
                        isSelected ? "text-[#1E2227]" : "text-[#1E2227]/40 group-hover:text-[#1E2227]"
                      }`}
                    >
                      <span>{t(track.shortBadgeKey)}</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="relative z-10 px-5 sm:px-8 py-4 border-t border-[#1E2227]/15 bg-[#FAF8F4] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#1E2227]/80 min-w-0 max-w-full">
            <Compass size={16} className="text-[#C86D32] shrink-0" />
            <span className="truncate">
              {t("career.activeTrackBanner", "Твій кар'єрний трек")}:{" "}
              <strong className="text-[#1E2227]">
                {t(`career.tracks.${selectedTrack}.title`)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-4 py-2 rounded-xl border border-[#1E2227]/25 bg-white hover:bg-[#F0EDE6] text-[#1E2227] font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              {t("career.skipForNow", "Переглянути всі")}
            </button>

            <button
              id="btn-confirm-career-track"
              type="button"
              onClick={handleConfirm}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E2227] hover:bg-black text-white font-mono font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
            >
              <span>{t("career.confirmChoice", "Розпочати навчання за цим треком")}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
