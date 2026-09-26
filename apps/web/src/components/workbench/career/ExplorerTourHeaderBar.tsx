/**
 * @file apps/web/src/components/workbench/career/ExplorerTourHeaderBar.tsx
 * @description Fixed sticky progress banner during Express Guided Tasting Route.
 * Follows Matte Industrial Workshop design tokens (no neon, matte graphite & terracotta).
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Compass,
  ArrowRight,
  X,
  Sparkles,
  ShieldCheck,
  Cpu,
  Tv,
} from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";

export const ExplorerTourHeaderBar: React.FC = () => {
  const { t } = useTranslation();
  const {
    isExplorerTourActive,
    explorerStep,
    completeExplorerStep,
    exitExplorerTour,
  } = useWorkbenchStore(
    useShallow((s) => ({
      isExplorerTourActive: s.isExplorerTourActive,
      explorerStep: s.explorerStep,
      completeExplorerStep: s.completeExplorerStep,
      exitExplorerTour: s.exitExplorerTour,
    }))
  );

  if (!isExplorerTourActive) return null;

  const stepMeta = [
    {
      step: 1,
      title: t("career.tour.step1Title", "Бекенд та архітектурні зв'язки (Станція 01 — TV & DI)"),
      prompt: t("career.tour.step1Prompt", "«Інженер, давай оживимо систему. З'єднай штекер команди живлення з гніздом телевізора»"),
      actionLabel: t("career.tour.step1Action", "🔌 Замкнути дріт живлення"),
      icon: Tv,
      color: "text-[#3B6B88]",
      bgBadge: "bg-[#EBF2F7] text-[#3B6B88] border-[#3B6B88]/30",
    },
    {
      step: 2,
      title: t("career.tour.step2Title", "Штучний інтелект (Станція 09 — IBM RAG)"),
      prompt: t("career.tour.step2Prompt", "«Нейромережа не вигадує факти, якщо знаходить точний шматок тексту. Натисни кнопку, щоб нарізати базу знань на вектори»"),
      actionLabel: t("career.tour.step2Action", "⚡ Нарізати базу знань на вектори"),
      icon: Cpu,
      color: "text-[#C86D32]",
      bgBadge: "bg-[#F5EDE6] text-[#C86D32] border-[#C86D32]/30",
    },
    {
      step: 3,
      title: t("career.tour.step3Title", "Кібербезпека (Станція 10 — Google Cybersecurity)"),
      prompt: t("career.tour.step3Prompt", "«Хакер сканує наші порти. Знайди червоний підозрілий пакет та натисни 'Блокувати IP'»"),
      actionLabel: t("career.tour.step3Action", "🛡️ Блокувати IP зловмисника"),
      icon: ShieldCheck,
      color: "text-[#3E7A5E]",
      bgBadge: "bg-[#EAF3EE] text-[#3E7A5E] border-[#3E7A5E]/30",
    },
  ];

  const current = stepMeta[explorerStep - 1] || stepMeta[0];

  return (
    <div
      id="explorer-tour-header-bar"
      className="sticky top-0 z-40 w-full bg-[#1E2227] text-[#FAF8F4] border-b border-[#FAF8F4]/15 shadow-md px-3 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 select-none animate-in slide-in-from-top duration-200"
    >
      {/* ── Left: Tour Badge & Step Indicator ── */}
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C86D32]/20 border border-[#C86D32]/40 text-[#E8935D] text-[10px] font-mono font-bold uppercase tracking-wider">
            <Compass size={12} className="animate-spin" style={{ animationDuration: "12s" }} />
            <span>{t("career.tour.badge", "ЕКСПРЕС-ТУР")}</span>
          </span>

          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${current.bgBadge}`}>
            <span>
              {t("career.tour.stepIndicator", { current: explorerStep, total: 3 })}
            </span>
          </span>
        </div>

        {/* 3-segment progress bars */}
        <div className="flex items-center gap-1.5 shrink-0">
          {[1, 2, 3].map((stepNum) => {
            const isCompleted = stepNum < explorerStep;
            const isCurrent = stepNum === explorerStep;
            return (
              <div
                key={stepNum}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "w-6 bg-[#3E7A5E]"
                    : isCurrent
                    ? "w-8 bg-[#C86D32] ring-1 ring-white/30"
                    : "w-5 bg-white/20"
                }`}
                title={`Крок ${stepNum}`}
              />
            );
          })}
        </div>
      </div>

      {/* ── Center: Mentor Scaffolding Prompt ── */}
      <div className="flex-1 w-full md:w-auto px-2 flex items-center justify-center text-center">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-sans text-white/90 max-w-2xl">
          <Sparkles size={15} className="text-[#C86D32] shrink-0 hidden sm:inline-block animate-pulse" />
          <p className="line-clamp-2 leading-tight italic">
            {current.prompt}
          </p>
        </div>
      </div>

      {/* ── Right: Scaffolding Quick Action Button & Exit ── */}
      <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
        <button
          type="button"
          id={`btn-tour-step-action-${explorerStep}`}
          onClick={() => completeExplorerStep(explorerStep)}
          className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FAF8F4] hover:bg-white text-[#1E2227] font-mono font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer active:scale-95 border border-[#1E2227]/20"
        >
          <span>{current.actionLabel}</span>
          <ArrowRight size={13} />
        </button>

        <button
          type="button"
          onClick={exitExplorerTour}
          className="px-2.5 py-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-mono text-xs transition-all cursor-pointer flex items-center gap-1"
          title={t("career.tour.exitTour", "Вийти з туру")}
        >
          <X size={14} />
          <span className="hidden lg:inline">{t("career.tour.exitTour", "Вийти")}</span>
        </button>
      </div>
    </div>
  );
};
