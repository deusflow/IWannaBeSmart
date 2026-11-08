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
    startExplorerTour,
  } = useWorkbenchStore(
    useShallow((s) => ({
      userTrack: s.userTrack,
      hasCompletedOnboarding: s.hasCompletedOnboarding,
      isCareerModalOpen: s.isCareerModalOpen,
      setUserTrack: s.setUserTrack,
      setIsCareerModalOpen: s.setIsCareerModalOpen,
      startExplorerTour: s.startExplorerTour,
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
    if (selectedTrack === "explorer") {
      startExplorerTour();
    } else {
      audioFx.playSuccessFanfare();
      setUserTrack(selectedTrack);
    }
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in select-none"
    >
      <div
        className="w-full max-w-5xl rounded-3xl bg-white border border-black/[0.08] shadow-luxury relative overflow-hidden flex flex-col my-auto max-h-[92vh] text-obsidian"
      >
        {/* ── Top Bar & Header ── */}
        <div className="relative z-10 px-5 sm:px-8 pt-6 pb-4 border-b border-black/[0.06] bg-white shrink-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-black/[0.06] text-obsidian text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles size={12} className="text-[#C5A059]" />
                <span>{hasCompletedOnboarding ? "CAREER TRACK FOCUS" : "CAREER ONBOARDING"}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-600/25 text-emerald-800 text-[10px] font-mono font-bold tracking-tight">
                <span>«{t("career.motto", "Неможливо програти, якщо це експеримент")}»</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-obsidian tracking-tight">
              {t("career.onboardingModalTitle", "Обери свій інженерний шлях")}
            </h2>

            <p className="text-xs sm:text-sm font-sans text-slate-600 leading-relaxed">
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
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0"
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
                  data-testid={`track-card-${track.id}`}
                  onClick={() => handleSelect(track.id)}
                  className={`flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative select-none group shadow-2xs ${
                    isSelected
                      ? `bg-slate-50/80 border-[#252932] ring-1 ring-[#252932]/10 shadow-sm`
                      : "bg-white border-black/[0.06] hover:border-black/[0.14] hover:bg-slate-50/50"
                  }`}
                >
                  <div className="space-y-3.5 flex-1">
                    {/* 1. Icon in matte square + role badge + selection check */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${
                            isSelected
                              ? "bg-[#252932] text-white border-[#252932]"
                              : "bg-slate-100 text-slate-700 border-black/[0.06]"
                          }`}
                        >
                          <Icon size={18} strokeWidth={2.2} />
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10.5px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                            isSelected ? "bg-white border-black/[0.08] text-obsidian" : "bg-slate-100 text-slate-700 border-black/[0.06]"
                          }`}>
                            {t(track.roleBadgeKey)}
                          </span>
                          {isExplorer && (
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 border border-amber-600/25">
                              ★ СТАРТОВИЙ ТРЕК
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "border-[#252932] bg-[#252932] text-white"
                            : "border-black/[0.18] bg-transparent text-transparent group-hover:border-black/[0.4]"
                        }`}
                      >
                        <CheckCircle2 size={13} strokeWidth={3} />
                      </div>
                    </div>

                    {/* 2. Track Title */}
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-obsidian leading-snug">
                      {t(track.titleKey)}
                    </h3>

                    {/* 3. For whom */}
                    <div className="border-l-2 border-[#252932]/40 pl-3 py-0.5">
                      <span className="font-mono font-bold text-[10px] uppercase text-slate-500 block mb-0.5">
                        {t("career.forWhom", "Для кого:")}
                      </span>
                      <p className="font-sans text-xs text-slate-600 leading-relaxed">
                        {t(track.audienceKey)}
                      </p>
                    </div>

                    {/* 4. Roles */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-black/[0.06]">
                      <span className="font-mono font-bold text-[10px] uppercase text-slate-500 flex items-center gap-1 mb-1">
                        <Briefcase size={11} className="text-[#C5A059]" />
                        <span>{t("career.roles", "Ким зможеш працювати:")}</span>
                      </span>
                      <p className="font-mono font-semibold text-xs text-obsidian leading-snug">
                        {t(track.rolesKey)}
                      </p>
                    </div>

                    {/* 5. Stations list */}
                    <div className="pt-2 border-t border-black/[0.06]">
                      <span className="font-mono font-bold text-[10px] uppercase text-slate-500 flex items-center gap-1 mb-1">
                        <Layers size={11} />
                        <span>{t("career.stationsInTrack", "Твої станції в проєкті:")}</span>
                      </span>
                      <p className="font-mono text-[11px] text-slate-600 leading-relaxed">
                        {t(track.stationsKey)}
                      </p>
                    </div>
                  </div>

                  {/* 6. Selection footer */}
                  <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-600">
                      {isSelected
                        ? `✓ ${t("career.selectedTrack", "Обрано як фокус")}`
                        : t("career.clickToSelect", "Натисніть для вибору")}
                    </span>
                    <span
                      className={`text-xs font-mono font-extrabold flex items-center gap-1 transition-all ${
                        isSelected ? "text-obsidian" : "text-slate-400 group-hover:text-obsidian"
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
        <div className="relative z-10 px-5 sm:px-8 py-4 border-t border-black/[0.06] bg-white shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 min-w-0 max-w-full">
            <Compass size={16} className="text-[#C5A059] shrink-0" />
            <span className="truncate">
              {t("career.activeTrackBanner", "Твій кар'єрний трек")}:{" "}
              <strong className="text-obsidian">
                {t(`career.tracks.${selectedTrack}.title`)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-4 py-2.5 rounded-xl border border-black/[0.08] bg-white hover:bg-slate-50 text-obsidian font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              {t("career.skipForNow", "Переглянути всі")}
            </button>

            <button
              id="btn-confirm-career-track"
              type="button"
              onClick={handleConfirm}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-white font-mono font-bold text-xs sm:text-sm shadow-luxury transition-all cursor-pointer active:scale-95"
            >
              <span>
                {selectedTrack === "explorer"
                  ? t("career.tour.startTourBtn", "Розпочати експрес-тур (3 кроки)")
                  : t("career.confirmChoice", "Розпочати навчання за цим треком")}
              </span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
