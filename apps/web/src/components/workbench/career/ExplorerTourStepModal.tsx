/**
 * @file apps/web/src/components/workbench/career/ExplorerTourStepModal.tsx
 * @description Transition modal between Explorer Tour steps (Step 1 -> 2, Step 2 -> 3).
 * Styled in Pure Porcelain Luxury.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Cpu,
  Tv,
  ShieldCheck,
  X,
} from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";

export const ExplorerTourStepModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    isTourStepModalOpen,
    tourStepJustCompleted,
    nextExplorerStep,
    exitExplorerTour,
    setTourStepModalOpen,
  } = useWorkbenchStore(
    useShallow((s) => ({
      isTourStepModalOpen: s.isTourStepModalOpen,
      tourStepJustCompleted: s.tourStepJustCompleted,
      nextExplorerStep: s.nextExplorerStep,
      exitExplorerTour: s.exitExplorerTour,
      setTourStepModalOpen: s.setTourStepModalOpen,
    }))
  );

  if (!isTourStepModalOpen || !tourStepJustCompleted) return null;

  const isStep1 = tourStepJustCompleted === 1;

  const content = isStep1
    ? {
        stepBadge: t("career.tour.step1StepBadge", "КРОК 1/3 • БЕКЕНД ТА АРХІТЕКТУРА"),
        title: t("career.tour.step1SuccessTitle", "Крок 1/3 завершено: Бекенд у кишені!"),
        desc: t(
          "career.tour.step1SuccessDesc",
          "Ти щойно зібрав архітектурний зв'язок між двома модулями. Тепер погляньмо, як працює штучний інтелект."
        ),
        techNote: "DI Injection: PowerCommand.Execute() ➔ TVController._cmd.CommandHandler() [220V RELAY CLOSED]",
        nextBtnLabel: t("career.tour.step1NextBtn", "Перейти до ШІ ➔"),
        icon: Tv,
        nextIcon: Cpu,
        nextStationName: t("career.tour.step1NextStation", "Станція 09: IBM RAG Chunker & Vector Search"),
      }
    : {
        stepBadge: t("career.tour.step2StepBadge", "КРОК 2/3 • ШТУЧНИЙ ІНТЕЛЕКТ"),
        title: t("career.tour.step2SuccessTitle", "Крок 2/3 завершено: Нейропошук підкорено!"),
        desc: t(
          "career.tour.step2SuccessDesc",
          "Текст перетворено на координати сенсу. Залишився останній рубеж — захистити систему від кібератаки."
        ),
        techNote: "Embeddings Computed: Chunk Size 128 chars • HNSW 2D Projection Synchronized",
        nextBtnLabel: t("career.tour.step2NextBtn", "На лінію оборони ➔"),
        icon: Cpu,
        nextIcon: ShieldCheck,
        nextStationName: t("career.tour.step2NextStation", "Станція 10: Google Cybersecurity & WireSniffer"),
      };

  const Icon = content.icon;
  const NextIcon = content.nextIcon;

  return (
    <div
      id="explorer-tour-step-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in select-none"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white border border-black/[0.08] shadow-luxury relative overflow-hidden flex flex-col p-6 sm:p-8 animate-in zoom-in-95 duration-200 text-obsidian">
        {/* Close / Dismiss */}
        <button
          type="button"
          onClick={() => setTourStepModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer z-20"
          title={t("common.close", "Закрити")}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-600/25 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider">
              <CheckCircle2 size={12} className="text-emerald-700" />
              <span>{content.stepBadge}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-600/25 text-[10px] font-mono font-bold">
              <Sparkles size={11} className="text-[#C5A059]" />
              <span>+50 XP</span>
            </span>
          </div>

          <div className="flex items-start gap-3.5 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-[#252932] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-extrabold text-obsidian tracking-tight">
                {content.title}
              </h3>
              <p className="text-xs sm:text-sm font-sans text-slate-600 mt-1 leading-relaxed">
                {content.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Technical Artifact Blueprint Box */}
        <div className="relative z-10 my-5 p-3.5 rounded-2xl bg-slate-50 border border-black/[0.06] space-y-2 shadow-2xs">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
            {t("career.tour.diagReportLabel", "СИСТЕМНИЙ ЗВІТ ДІАГНОСТИКИ")}
          </span>
          <p className="font-mono text-xs text-obsidian bg-white p-2.5 rounded-xl border border-black/[0.06] leading-snug break-all">
            {content.techNote}
          </p>

          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-600">
            <NextIcon size={14} className="text-[#C5A059]" />
            <span>{t("career.tour.nextModule", "Наступний модуль:")} <strong className="text-obsidian">{content.nextStationName}</strong></span>
          </div>
        </div>

        {/* Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={exitExplorerTour}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-black/[0.08] bg-white hover:bg-slate-50 text-obsidian font-mono text-xs font-bold transition-all cursor-pointer text-center shadow-2xs"
          >
            {t("career.tour.exitTour", "Вийти до Хабу")}
          </button>

          <button
            type="button"
            id="btn-tour-step-next"
            onClick={nextExplorerStep}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#252932] hover:bg-[#1A1D20] text-white font-mono font-bold text-xs sm:text-sm shadow-luxury transition-all cursor-pointer active:scale-95"
          >
            <span>{content.nextBtnLabel}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
