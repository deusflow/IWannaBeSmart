/**
 * @file apps/web/src/components/workbench/career/ExplorerTourFinaleModal.tsx
 * @description Finale verdict screen completing the 3-step Express Tour.
 * Features 3 interactive career track cards + link to keep free explorer mode.
 * Styled in Pure Porcelain Luxury.
 */

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Trophy,
  Server,
  Bot,
  ShieldCheck,
  ArrowRight,
  Compass,
  Sparkles,
  Layers,
} from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../utils/audioFx";
import { LanguageSwitcher } from "../LanguageSwitcher";

export const ExplorerTourFinaleModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    isTourFinaleModalOpen,
    finishExplorerTour,
  } = useWorkbenchStore(
    useShallow((s) => ({
      isTourFinaleModalOpen: s.isTourFinaleModalOpen,
      finishExplorerTour: s.finishExplorerTour,
    }))
  );

  useEffect(() => {
    if (isTourFinaleModalOpen) {
      audioFx.playSuccessFanfare();
    }
  }, [isTourFinaleModalOpen]);

  if (!isTourFinaleModalOpen) return null;

  const tracks = [
    {
      id: "backend" as const,
      icon: Server,
      title: t("career.tour.cardBackend", "Хочу будувати надійні сервери"),
      tag: "Backend & Systems",
      desc: t(
        "career.tour.cardBackendDesc",
        "Бекенд-інженерія: архітектура, API, надійність та розподілені сервери"
      ),
      stations: t("career.tour.backendStations", "Станції: 01 (TV & DI), 02 (POS Terminal), 04 (API Forge), 05 (Git)"),
    },
    {
      id: "ai" as const,
      icon: Bot,
      title: t("career.tour.cardAi", "Хочу навчати та з'єднувати ШІ"),
      tag: "AI & MLOps",
      desc: t(
        "career.tour.cardAiDesc",
        "Штучний інтелект: нейромережі, семантичний RAG-пошук та автономні агенти"
      ),
      stations: t("career.tour.aiStations", "Станції: 07 (Vertex AI), 08 (Field AI Deployer), 09 (IBM RAG)"),
    },
    {
      id: "security" as const,
      icon: ShieldCheck,
      title: t("career.tour.cardSecurity", "Хочу захищати системи від зломів"),
      tag: "Cybersecurity & SOC",
      desc: t(
        "career.tour.cardSecurityDesc",
        "Кібербезпека: захист від атак, мережеві файрволи та розслідування інцидентів"
      ),
      stations: t("career.tour.securityStations", "Станції: 06 (Cyber Bandit Lab), 10 (Google Cybersecurity)"),
    },
  ];

  return (
    <div
      id="explorer-tour-finale-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in select-none"
    >
      <div className="w-full max-w-4xl rounded-3xl bg-white border border-black/[0.08] shadow-luxury relative overflow-hidden flex flex-col my-auto max-h-[94vh] text-obsidian">
        {/* ── Top Bar & Header ── */}
        <div className="relative z-10 px-6 sm:px-8 pt-6 pb-4 border-b border-black/[0.06] bg-white shrink-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-600/25 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Trophy size={12} className="text-emerald-700" />
                <span>{t("career.tour.finaleBadge", "ФІНАЛ ТЕСТ-ДРАЙВУ • 3/3 ПРОЙДЕНО")}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-600/25 text-[10px] font-mono font-bold">
                <Sparkles size={11} className="text-[#C5A059]" />
                <span>{t("career.tour.finaleXpBadge", "+150 XP У СКАРБНИЧКУ")}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-display font-extrabold text-obsidian tracking-tight">
              {t("career.tour.finaleTitle", "Ти пройшов інженерний тест-драйв!")}
            </h2>

            <p className="text-xs sm:text-sm font-sans text-slate-600 leading-relaxed">
              {t(
                "career.tour.finaleSubtitle",
                "Ти спробував три абсолютно різні світи IT. Що тобі відгукнулося найбільше?"
              )}
            </p>
          </div>

          <div className="self-end sm:self-start shrink-0">
            <LanguageSwitcher compact />
          </div>
        </div>

        {/* ── 3 Focus Track Cards Grid ── */}
        <div className="relative z-10 p-5 sm:p-8 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tracks.map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.id}
                  id={`btn-select-track-${track.id}`}
                  onClick={() => finishExplorerTour(track.id)}
                  className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-black/[0.06] hover:border-black/[0.18] transition-all duration-200 cursor-pointer shadow-2xs group select-none hover:bg-slate-50/50"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-black/[0.06] text-obsidian group-hover:scale-105 transition-transform">
                        <Icon size={20} />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border bg-slate-100 text-slate-700 border-black/[0.06]">
                        {track.tag}
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-base text-obsidian leading-snug group-hover:text-black">
                      {track.title}
                    </h3>

                    <p className="text-xs font-sans text-slate-600 leading-relaxed">
                      {track.desc}
                    </p>

                    <div className="pt-2 border-t border-black/[0.06] flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                      <Layers size={11} />
                      <span className="truncate">{track.stations}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs font-mono font-bold text-obsidian group-hover:translate-x-0.5 transition-transform">
                    <span>{t("career.tour.selectTrack", "Обрати цей трек")}</span>
                    <ArrowRight size={14} className="text-[#C5A059]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer with Free Explorer Link ── */}
        <div className="relative z-10 px-6 sm:px-8 py-4 border-t border-black/[0.06] bg-white shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
            <Compass size={15} className="text-[#C5A059]" />
            <span>{t("career.tour.notSurePrompt", "Не впевнений? Напрямок можна змінити у будь-який момент на Хабі.")}</span>
          </div>

          <button
            type="button"
            id="btn-keep-free-explorer"
            onClick={() => finishExplorerTour("explorer")}
            className="text-xs font-mono text-slate-500 hover:text-obsidian underline underline-offset-4 cursor-pointer transition-colors"
          >
            {t("career.tour.keepExplorer", "Залишити вільний режим дослідника")}
          </button>
        </div>
      </div>
    </div>
  );
};
