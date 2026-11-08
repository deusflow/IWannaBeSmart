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
import { LanguageSwitcher } from "./LanguageSwitcher";

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
      badgeColor: "bg-slate-100 text-slate-700 border-black/[0.08]",
      iconBg: "bg-slate-100 border-black/[0.06] text-[#252932]",
      icon: <Compass className="w-7 h-7 text-[#252932]" />,
      title: t("onboarding.slide1Title", "Ласкаво просимо до Інженерного верстака!"),
      desc: t(
        "onboarding.slide1Desc",
        "Це не просто тренажер синтаксису — це повнофункціональний віртуальний апаратний стенд. Тут ви керуєте мікросхемами, шинами даних та архітектурними патернами C#, Go та Python."
      ),
    },
    {
      badge: t("onboarding.slide2Badge", "РЕАЛЬНИЙ ЧАС"),
      badgeColor: "bg-slate-100 text-slate-700 border-black/[0.08]",
      iconBg: "bg-slate-100 border-black/[0.06] text-[#252932]",
      icon: <Cpu className="w-7 h-7 text-[#252932]" />,
      title: t("onboarding.slide2Title", "Апаратне залізо та віртуальні шини"),
      desc: t(
        "onboarding.slide2Desc",
        "Прилади на екрані справжні: кнопки пульта відправляють інфрачервоні пакети 38 kHz, на платі течуть сигнали VCC/GND, а будь-яку доріжку можна кліком розірвати для діагностики."
      ),
    },
    {
      badge: t("onboarding.slide3Badge", "4-STAR MASTERY"),
      badgeColor: "bg-amber-500/10 text-amber-800 border-amber-600/20",
      iconBg: "bg-amber-500/10 border-amber-600/20 text-amber-700",
      icon: <Terminal className="w-7 h-7 text-amber-700" />,
      title: t("onboarding.slide3Title", "Code Gym: Тренування м'язової пам'яті"),
      desc: t(
        "onboarding.slide3Desc",
        "Кожне завдання проходить 4 такти навчання: швидкісний тайпінг синтаксису, заповнення прогалин, спринт на WPM та виправлення багів. Це формує рефлекси рівня Senior."
      ),
    },
    {
      badge: t("onboarding.slide4Badge", "ПРОФЕСІЙНИЙ СТЕК"),
      badgeColor: "bg-emerald-500/10 text-emerald-800 border-emerald-600/20",
      iconBg: "bg-emerald-500/10 border-emerald-600/20 text-emerald-700",
      icon: <Keyboard className="w-7 h-7 text-emerald-700" />,
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
      data-testid="onboarding-modal"
      aria-labelledby="onboarding-tour-title"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleSkip();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white border border-black/[0.08] rounded-2xl shadow-luxury p-6 sm:p-8 overflow-hidden text-obsidian flex flex-col justify-between min-h-[440px]"
      >
        {/* Subtle Matte Architectural Grid */}
        <div className="absolute inset-0 bg-notebook-grid opacity-20 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-100 text-[#252932] border border-black/[0.06]">
              <Sparkles size={15} className="text-[#C5A059]" />
            </span>
            <span className="text-xs font-mono tracking-wider uppercase text-slate-500 font-bold">
              {t("onboarding.tourTitle", "Інженерний інструктаж")}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C5A059]/15 text-amber-900 border border-[#C5A059]/30">
              +25 XP GRANT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <button
              type="button"
              onClick={handleSkip}
              className="text-slate-400 hover:text-obsidian transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label={t("onboarding.skip", "Пропустити")}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="relative z-10 py-6 flex flex-col items-center text-center">
          <div className={`mb-4 p-4 rounded-2xl ${currentSlide.iconBg} border shadow-2xs flex items-center justify-center`}>
            {currentSlide.icon}
          </div>

          <span
            className={`inline-block text-[11px] font-mono font-bold tracking-wider px-3 py-1 rounded-full border mb-3 ${currentSlide.badgeColor}`}
          >
            {currentSlide.badge}
          </span>

          <h2
            id="onboarding-tour-title"
            className="text-xl sm:text-2xl font-display font-bold tracking-tight text-obsidian mb-2.5"
          >
            {currentSlide.title}
          </h2>

          <p className="text-sm font-sans text-slate-600 leading-relaxed max-w-md">
            {currentSlide.desc}
          </p>
        </div>

        {/* Footer & Controls */}
        <div className="relative z-10 pt-4 border-t border-black/[0.06] flex flex-col gap-4">
          {/* Steps and Dots */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
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
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    idx === currentStep
                      ? "w-6 bg-[#252932]"
                      : "w-2 bg-slate-200 hover:bg-slate-300"
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
                  className="px-3.5 py-2 text-xs font-mono font-bold rounded-xl text-obsidian bg-white hover:bg-slate-50 border border-black/[0.08] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <ChevronLeft size={14} />
                  {t("onboarding.back", "← Назад")}
                </button>
              ) : (
                <button
                  data-testid="onboarding-skip-btn"
                  type="button"
                  onClick={handleSkip}
                  className="px-3 py-2 text-xs font-mono font-medium rounded-xl text-slate-500 hover:text-obsidian hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {t("onboarding.skip", "Пропустити")}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentStep < slides.length - 1 ? (
                <button
                  data-testid="onboarding-next-btn"
                  type="button"
                  onClick={handleNext}
                  className="px-4.5 py-2 text-xs font-mono font-bold rounded-xl bg-[#252932] text-white hover:bg-[#1A1D24] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  {t("onboarding.next", "Далі →")}
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  data-testid="onboarding-finish-btn"
                  type="button"
                  onClick={handleFinish}
                  className="px-5 py-2 text-xs font-mono font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <CheckCircle2 size={15} />
                  {t("onboarding.start", "Почати роботу ")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
