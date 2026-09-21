/**
 * @file apps/web/src/components/workbench/OnboardingTourModal.tsx
 * @description 2026 Engineering Cadet Onboarding Tour Modal with Endowed Progress Starter Grant (+25 XP)
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Compass,
  Cpu,
  Terminal,
  Keyboard,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { audioFx } from "../../utils/audioFx";
import { toast } from "../../store/toastStore";
import { useWorkbenchStore } from "../../store/workbenchStore";

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const grantStarterBonus = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("iw_onboarding_seen", "true");
      const hasBonus = localStorage.getItem("iw_starter_xp_awarded");
      if (!hasBonus) {
        localStorage.setItem("iw_starter_xp_awarded", "true");
        useWorkbenchStore.getState().addXp(25);
        audioFx.playSuccessFanfare();
        toast.success(
          t("onboarding.bonusToastTitle", "Акредитація курсанта (+25 XP)"),
          t("onboarding.bonusToastDesc", "Стартовий грант нараховано! Ласкаво просимо до верстака.")
        );
      }
    } catch {
      // safe fallback if storage unavailable
    }
  }, [t]);

  const handleFinish = useCallback(() => {
    audioFx.playRelayClick();
    grantStarterBonus();
    onClose();
  }, [grantStarterBonus, onClose]);

  const handleSkip = useCallback(() => {
    audioFx.playRelayClick();
    grantStarterBonus();
    onClose();
  }, [grantStarterBonus, onClose]);

  const handleNext = useCallback(() => {
    audioFx.playKeyClick();
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentStep, handleFinish]);

  const handlePrev = useCallback(() => {
    audioFx.playKeyClick();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleSkip, handleNext, handlePrev]);

  if (!isOpen) return null;

  const slides = [
    {
      badge: t("onboarding.slide1Badge", "ТАКТИЛЬНА ІНЖЕНЕРІЯ"),
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: <Compass className="w-8 h-8 text-blue-400" />,
      title: t("onboarding.slide1Title", "Ласкаво просимо до Інженерного верстака!"),
      desc: t(
        "onboarding.slide1Desc",
        "Це не просто тренажер синтаксису — це повнофункціональний віртуальний апаратний стенд. Тут ви керуєте мікросхемами, шинами даних та архітектурними патернами C#, Go та Python."
      ),
    },
    {
      badge: t("onboarding.slide2Badge", "РЕАЛЬНИЙ ЧАС"),
      badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      icon: <Cpu className="w-8 h-8 text-cyan-400" />,
      title: t("onboarding.slide2Title", "Апаратне залізо та віртуальні шини"),
      desc: t(
        "onboarding.slide2Desc",
        "Прилади на екрані справжні: кнопки пульта відправляють інфрачервоні пакети 38 kHz, на платі течуть сигнали VCC/GND, а будь-яку доріжку можна кліком розірвати для діагностики."
      ),
    },
    {
      badge: t("onboarding.slide3Badge", "4-STAR MASTERY"),
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      icon: <Terminal className="w-8 h-8 text-amber-400" />,
      title: t("onboarding.slide3Title", "Code Gym: Тренування м'язової пам'яті"),
      desc: t(
        "onboarding.slide3Desc",
        "Кожне завдання проходить 4 такти навчання: швидкісний тайпінг синтаксису, заповнення прогалин, спринт на WPM та виправлення багів. Це формує рефлекси рівня Senior."
      ),
    },
    {
      badge: t("onboarding.slide4Badge", "ПРОФЕСІЙНИЙ СТЕК"),
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      icon: <Keyboard className="w-8 h-8 text-emerald-400" />,
      title: t("onboarding.slide4Title", "Швидка навігація та інструменти 2026"),
      desc: t(
        "onboarding.slide4Desc",
        "Натискайте ⌘K або Ctrl+K для глобального пошуку, '?' для шпаргалки гарячих клавіш, а мікшер у шапці налаштує звук аналогових реле. Успішного старту!"
      ),
    },
  ];

  const currentSlide = slides[currentStep];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleSkip();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-100 flex flex-col justify-between min-h-[420px]"
      >
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-accent-blue/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-accent-blue/20 text-accent-blue">
              <Sparkles size={16} />
            </span>
            <span className="text-xs font-mono tracking-wider uppercase text-slate-400 font-semibold">
              {t("onboarding.tourTitle", "Інженерний інструктаж")}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800/80"
            aria-label={t("onboarding.skip", "Пропустити")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Slide Content */}
        <div className="py-6 flex flex-col items-center text-center">
          <div className="mb-4 p-4 rounded-2xl bg-slate-800/90 border border-slate-700/60 shadow-inner flex items-center justify-center">
            {currentSlide.icon}
          </div>

          <span
            className={`inline-block text-[11px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full border mb-3 ${currentSlide.badgeColor}`}
          >
            {currentSlide.badge}
          </span>

          <h2
            id="onboarding-tour-title"
            className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3"
          >
            {currentSlide.title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            {currentSlide.desc}
          </p>
        </div>

        {/* Footer & Controls */}
        <div className="pt-4 border-t border-slate-800 flex flex-col gap-4">
          {/* Steps and Dots */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              {t("onboarding.stepIndicator", {
                current: currentStep + 1,
                total: slides.length,
                defaultValue: `Крок ${currentStep + 1} з ${slides.length}`,
              })}
            </span>

            <div className="flex items-center gap-1.5" aria-hidden="true">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    audioFx.playKeyClick();
                    setCurrentStep(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? "w-6 bg-accent-blue"
                      : "w-2 bg-slate-700 hover:bg-slate-600"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            <div>
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-300 bg-slate-800/80 hover:bg-slate-750 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft size={14} />
                  {t("onboarding.back", "← Назад")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-3 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {t("onboarding.skip", "Пропустити")}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentStep < slides.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent-blue text-white hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  {t("onboarding.next", "Далі →")}
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  {t("onboarding.start", "Почати роботу 🚀")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
