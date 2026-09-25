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
  HelpCircle,
} from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { CAREER_TRACKS, type CareerTrackItem } from "./careerTracks";
import type { CareerTrack } from "../../../store/types";
import { audioFx } from "../../../utils/audioFx";

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
      className="fixed inset-0 z-50 bg-[#0E1012]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-5xl rounded-3xl bg-[#FAF8F2] border-2 border-[#1A1D20]/30 shadow-2xl relative overflow-hidden flex flex-col my-auto max-h-[94vh] animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.45)",
        }}
      >
        {/* Background Drafting Grid */}
        <div className="absolute inset-0 bg-notebook-grid opacity-35 pointer-events-none" />

        {/* ── Top Bar & Header ── */}
        <div className="relative z-10 px-5 sm:px-8 pt-6 pb-4 border-b border-[#1A1D20]/15 bg-[#F4EFE6]/80 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-600/30 text-amber-900 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles size={12} className="text-amber-700" />
                <span>{hasCompletedOnboarding ? "CAREER TRACK FOCUS" : "CAREER ONBOARDING"}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-600/25 text-emerald-800 text-[10px] font-mono font-bold tracking-tight">
                <span>«{t("career.motto", "Неможливо програти, якщо це експеримент")}»</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold text-[#1A1D20] tracking-tight">
              {t("career.onboardingModalTitle", "Обери свій інженерний шлях")}
            </h2>

            <p className="text-xs sm:text-sm font-sans text-[#1A1D20]/75 leading-relaxed">
              {t(
                "career.onboardingModalSubtitle",
                "Не бійся помилитися: будь-який вибір — це експеримент, а напрямок можна змінити у будь-який момент в один клік."
              )}
            </p>
          </div>

          {/* Close button (always accessible) */}
          <button
            type="button"
            onClick={handleDismiss}
            className="self-end sm:self-start p-2 rounded-xl border border-[#1A1D20]/15 hover:border-[#1A1D20]/40 text-[#1A1D20]/60 hover:text-[#1A1D20] bg-white/70 hover:bg-white transition-all cursor-pointer shrink-0"
            title={t("common.close", "Закрити")}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── 4 Career Track Cards Grid ── */}
        <div className="relative z-10 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {CAREER_TRACKS.map((track: CareerTrackItem) => {
              const isSelected = selectedTrack === track.id;
              const Icon = track.icon;
              const isExplorer = track.id === "explorer";

              return (
                <div
                  key={track.id}
                  onClick={() => handleSelect(track.id)}
                  className={`flex flex-col justify-between p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative select-none group ${
                    isSelected
                      ? isExplorer
                        ? "bg-amber-500/[0.08] border-amber-600 shadow-md ring-2 ring-amber-500/30"
                        : "bg-white border-[#1A1D20] shadow-md ring-2 ring-[#1A1D20]/20"
                      : "bg-white/80 border-[#1A1D20]/20 hover:border-[#1A1D20]/50 hover:bg-white shadow-2xs hover:shadow-paper-sm"
                  }`}
                >
                  {/* Selected Indicator */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${
                          isSelected
                            ? "bg-[#1A1D20] text-white border-[#1A1D20]"
                            : `${track.theme.accentBg} ${track.theme.accentText} ${track.theme.cardBorder}`
                        }`}
                      >
                        <Icon size={20} strokeWidth={2.2} />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#1A1D20]/10 text-[#1A1D20]/80">
                            {t(track.roleBadgeKey)}
                          </span>
                          {isExplorer && (
                            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-900 border border-amber-600/30 animate-pulse">
                              🌟 РЕКОМЕНДОВАНО ДЛЯ СТАРТУ
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-bold text-base sm:text-lg text-[#1A1D20] mt-0.5 leading-snug">
                          {t(track.titleKey)}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "border-[#1A1D20] bg-[#1A1D20] text-white"
                          : "border-[#1A1D20]/30 bg-transparent text-transparent"
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-3 flex-1 text-xs">
                    {/* Audience (Для кого) */}
                    <div>
                      <div className="font-mono font-bold text-[10px] uppercase text-[#1A1D20]/60 flex items-center gap-1 mb-1">
                        <HelpCircle size={11} />
                        <span>{t("career.forWhom", "Для кого:")}</span>
                      </div>
                      <p className="font-sans text-[#1A1D20]/80 leading-relaxed">
                        {t(track.audienceKey)}
                      </p>
                    </div>

                    {/* Roles (Ким зможеш працювати) */}
                    <div>
                      <div className="font-mono font-bold text-[10px] uppercase text-[#1A1D20]/60 flex items-center gap-1 mb-1">
                        <Briefcase size={11} />
                        <span>{t("career.roles", "Ким зможеш працювати:")}</span>
                      </div>
                      <p className="font-mono font-semibold text-[#1A1D20] leading-snug">
                        {t(track.rolesKey)}
                      </p>
                    </div>

                    {/* Stations in Track (Твої станції) */}
                    <div className="pt-1 border-t border-[#1A1D20]/10">
                      <div className="font-mono font-bold text-[10px] uppercase text-[#1A1D20]/60 flex items-center gap-1 mb-1">
                        <Layers size={11} />
                        <span>{t("career.stationsInTrack", "Твої станції в проєкті:")}</span>
                      </div>
                      <p className="font-mono text-[11px] text-[#1A1D20]/75">
                        {t(track.stationsKey)}
                      </p>
                    </div>
                  </div>

                  {/* Select button strip inside card */}
                  <div className="mt-4 pt-3 border-t border-[#1A1D20]/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#1A1D20]/60">
                      {isSelected
                        ? `✓ ${t("career.selectedTrack", "Обрано як фокус")}`
                        : t("career.clickToSelect", "Натисніть для вибору")}
                    </span>
                    <span
                      className={`text-xs font-mono font-extrabold flex items-center gap-1 transition-all ${
                        isSelected ? "text-[#1A1D20]" : "text-[#1A1D20]/40 group-hover:text-[#1A1D20]/70"
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
        <div className="relative z-10 px-5 sm:px-8 py-4 border-t border-[#1A1D20]/15 bg-[#F4EFE6]/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#1A1D20]/70">
            <Compass size={15} className="text-[#1A1D20]" />
            <span>
              {t("career.activeTrackBanner", "Обраний напрямок")}:{" "}
              <strong className="text-[#1A1D20]">
                {t(`career.tracks.${selectedTrack}.title`)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDismiss}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-[#1A1D20]/25 bg-white hover:bg-paper-muted text-[#1A1D20] font-display font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
            >
              {t("career.skipForNow", "Переглянути всі")}
            </button>

            <button
              id="btn-confirm-career-track"
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A1D20] hover:bg-black text-white font-display font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
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
