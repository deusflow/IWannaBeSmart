/**
 * @file apps/web/src/components/workbench/career/ExplorerTourStepModal.tsx
 * @description Transition modal between Explorer Tour steps (Step 1 -> 2, Step 2 -> 3).
 * Follows Matte Industrial Workshop aesthetic.
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
      className="fixed inset-0 z-50 bg-[#1E2227]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#FAF8F4] border border-[#1E2227]/15 shadow-xl relative overflow-hidden flex flex-col p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Background drafting grid */}
        <div className="absolute inset-0 bg-notebook-grid opacity-30 pointer-events-none" />

        {/* Close / Dismiss */}
        <button
          type="button"
          onClick={() => setTourStepModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl border border-[#1E2227]/15 hover:border-[#1E2227]/40 text-[#1E2227]/60 hover:text-[#1E2227] bg-white transition-all cursor-pointer z-20"
          title={t("common.close", "Закрити")}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3EE] border border-[#3E7A5E]/30 text-[#3E7A5E] text-[10px] font-mono font-bold uppercase tracking-wider">
              <CheckCircle2 size={12} className="text-[#3E7A5E]" />
              <span>{content.stepBadge}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5EDE6] text-[#C86D32] border border-[#C86D32]/30 text-[10px] font-mono font-bold">
              <Sparkles size={11} />
              <span>+50 XP</span>
            </span>
          </div>

          <div className="flex items-start gap-3.5 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-[#1E2227] text-white flex items-center justify-center shrink-0 shadow-md">
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-[#1E2227] tracking-tight">
                {content.title}
              </h3>
              <p className="text-xs sm:text-sm font-sans text-[#1E2227]/80 mt-1 leading-relaxed">
                {content.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Technical Artifact Blueprint Box */}
        <div className="relative z-10 my-5 p-3.5 rounded-xl bg-white border border-[#1E2227]/15 space-y-2">
          <span className="text-[10px] font-mono font-bold text-[#1E2227]/50 uppercase tracking-wider block">
            {t("career.tour.diagReportLabel", "СИСТЕМНИЙ ЗВІТ ДІАГНОСТИКИ")}
          </span>
          <p className="font-mono text-xs text-[#1E2227] bg-[#FAF8F4] p-2 rounded-lg border border-[#1E2227]/10 leading-snug break-all">
            {content.techNote}
          </p>

          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#1E2227]/70">
            <NextIcon size={14} className="text-[#C86D32]" />
            <span>{t("career.tour.nextModule", "Наступний модуль:")} <strong>{content.nextStationName}</strong></span>
          </div>
        </div>

        {/* Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={exitExplorerTour}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#1E2227]/20 bg-white hover:bg-[#F0EDE6] text-[#1E2227] font-mono text-xs font-bold transition-all cursor-pointer text-center"
          >
            {t("career.tour.exitTour", "Вийти до Хабу")}
          </button>

          <button
            type="button"
            id="btn-tour-step-next"
            onClick={nextExplorerStep}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E2227] hover:bg-black text-white font-mono font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
          >
            <span>{content.nextBtnLabel}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
