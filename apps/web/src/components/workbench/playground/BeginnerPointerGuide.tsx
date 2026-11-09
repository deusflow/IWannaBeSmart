/**
 * @file apps/web/src/components/workbench/playground/BeginnerPointerGuide.tsx
 * @description Guided Didactic Pointer & Aha-Moment Celebration for beginner coders.
 *              Sequentially guides: Mission (Goal) -> Target Command -> Editor Terminal -> Aha! Victory
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Tv, CheckCircle2 } from "lucide-react";
import { audioFx } from "../../../utils/audioFx";

export interface BeginnerPointerGuideProps {
  taskId: string;
  codeLang: "csharp" | "go" | string;
  targetCode: string;
  pointerStep: 1 | 2 | 3 | null;
  onAdvancePointerStep: () => void;
  onDismissPointer: () => void;
  showAhaMoment: boolean;
  onCloseAhaMoment: () => void;
}

export const BeginnerPointerGuide: React.FC<BeginnerPointerGuideProps> = ({
  taskId,
  codeLang,
  targetCode,
  pointerStep,
  onDismissPointer,
  showAhaMoment,
  onCloseAhaMoment,
}) => {
  const { t } = useTranslation();

  // Determine localized Aha texts based on task
  const getAhaContent = () => {
    switch (taskId) {
      case "task-0-2-types":
        return {
          title: t("codegym.pointer.ahaTitleTypes", "Вау! Канал налаштовано!"),
          desc: t(
            "codegym.pointer.ahaDescTypes",
            "Телевізор перемкнувся на 1-й канал і отримав назву. Типи даних int та string спрацювали бездоганно!"
          ),
        };
      case "task-0-3-sequential":
        return {
          title: t("codegym.pointer.ahaTitleSequential", "Вау! Ланцюжок команд спрацював!"),
          desc: t(
            "codegym.pointer.ahaDescSequential",
            "Процесор виконав інструкції одна за одною зверху вниз: увімкнув телевізор і одразу встановив гучність!"
          ),
        };
      case "task-0-1-power-on":
      default:
        return {
          title: t("codegym.pointer.ahaTitlePowerOn", "Вау! Телевізор увімкнувся!"),
          desc: t(
            "codegym.pointer.ahaDescPowerOn",
            "Ось так, однією простою командою ми подали струм на апаратні схеми. Програмування — це керування реальними речами!"
          ),
        };
    }
  };

  const ahaContent = getAhaContent();

  return (
    <>
      {/* ── Step 3 Pointer Banner (Displayed directly above Code Editor) ── */}
      {pointerStep === 3 && (
        <div
          data-testid="pointer-step-3-banner"
          className="p-3.5 rounded-2xl bg-[#252932] border-2 border-[#C5A059] shadow-[0_0_24px_rgba(197,160,89,0.35)] text-white flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#C5A059] text-black flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs">
              👉
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.2 rounded bg-[#C5A059] text-black font-mono text-[9px] font-extrabold uppercase">
                  {t("codegym.pointer.step3Badge", "Крок 3 із 3")}
                </span>
                <span className="font-mono text-xs font-bold text-[#C5A059]">
                  {t("codegym.pointer.step3Title", "Просто повторіть у редакторі")}
                </span>
              </div>
              <p className="text-xs text-gray-200 leading-snug">
                {t(
                  "codegym.pointer.step3Desc",
                  "Зараз не потрібно розуміти глибоко — ми розберемо все потім. Просто надрукуйте команду символ у символ:"
                )}{" "}
                <code className="text-[#C5A059] font-mono font-extrabold bg-black/40 px-1.5 py-0.2 rounded border border-[#C5A059]/30">
                  {targetCode || (codeLang === "go" ? "tv.PowerOn()" : "tv.PowerOn();")}
                </code>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioFx.playRelayClick();
              onDismissPointer();
            }}
            className="text-[11px] font-mono text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title={t("codegym.pointer.skip", "Пропустити підказки")}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Aha! Moment Celebration Modal (Triggered on hardware activation) ── */}
      {showAhaMoment && (
        <div
          data-testid="aha-moment-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#C5A059]/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-luxury text-center space-y-4 animate-in zoom-in-95">
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-[#C5A059] to-amber-600 text-white flex items-center justify-center shadow-md">
              <Tv size={32} className="text-white drop-shadow-sm" />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles size={13} />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold uppercase tracking-wider">
                <CheckCircle2 size={12} />
                <span>{t("codegym.pointer.ahaBadge", "🎉 Перша перемога інженера!")}</span>
              </span>
              <h3 className="text-xl font-display font-extrabold text-obsidian">
                {ahaContent.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {ahaContent.desc}
              </p>
            </div>

            <button
              data-testid="aha-moment-close-btn"
              onClick={() => {
                audioFx.playSuccessFanfare();
                onCloseAhaMoment();
              }}
              className="w-full py-2.5 rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-[#C5A059] border border-[#C5A059]/40 font-mono font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {t("codegym.pointer.ahaBtn", "Чудово, закріпимо результат! ⭐")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

