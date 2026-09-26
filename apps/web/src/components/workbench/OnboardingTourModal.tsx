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
      badgeColor: "bg-[#EAF0F4] text-[#3B6B88] border-[#3B6B88]/30",
      iconBg: "bg-[#EAF0F4] border-[#3B6B88]/25 text-[#3B6B88]",
      icon: <Compass className="w-7 h-7 text-[#3B6B88]" />,
      title: t("onboarding.slide1Title", "Ласкаво просимо до Інженерного верстака!"),
      desc: t(
        "onboarding.slide1Desc",
        "Це не просто тренажер синтаксису — це повнофункціональний віртуальний апаратний стенд. Тут ви керуєте мікросхемами, шинами даних та архітектурними патернами C#, Go та Python."
      ),
    },
    {
      badge: t("onboarding.slide2Badge", "РЕАЛЬНИЙ ЧАС"),
      badgeColor: "bg-[#EAF0F4] text-[#3B6B88] border-[#3B6B88]/30",
      iconBg: "bg-[#EAF0F4] border-[#3B6B88]/25 text-[#3B6B88]",
      icon: <Cpu className="w-7 h-7 text-[#3B6B88]" />,
      title: t("onboarding.slide2Title", "Апаратне залізо та віртуальні шини"),
      desc: t(
        "onboarding.slide2Desc",
        "Прилади на екрані справжні: кнопки пульта відправляють інфрачервоні пакети 38 kHz, на платі течуть сигнали VCC/GND, а будь-яку доріжку можна кліком розірвати для діагностики."
      ),
    },
    {
      badge: t("onboarding.slide3Badge", "4-STAR MASTERY"),
      badgeColor: "bg-[#F5EDE6] text-[#C86D32] border-[#C86D32]/30",
      iconBg: "bg-[#F5EDE6] border-[#C86D32]/25 text-[#C86D32]",
      icon: <Terminal className="w-7 h-7 text-[#C86D32]" />,
      title: t("onboarding.slide3Title", "Code Gym: Тренування м'язової пам'яті"),
      desc: t(
        "onboarding.slide3Desc",
        "Кожне завдання проходить 4 такти навчання: швидкісний тайпінг синтаксису, заповнення прогалин, спринт на WPM та виправлення багів. Це формує рефлекси рівня Senior."
      ),
    },
    {
      badge: t("onboarding.slide4Badge", "ПРОФЕСІЙНИЙ СТЕК"),
      badgeColor: "bg-[#EAF3EE] text-[#3E7A5E] border-[#3E7A5E]/30",
      iconBg: "bg-[#EAF3EE] border-[#3E7A5E]/25 text-[#3E7A5E]",
      icon: <Keyboard className="w-7 h-7 text-[#3E7A5E]" />,
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
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#1E2227]/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleSkip();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-[#FAF8F4] border border-[#1E2227]/15 rounded-2xl shadow-xl p-6 sm:p-8 overflow-hidden text-[#1E2227] flex flex-col justify-between min-h-[440px]"
      >
        {/* Subtle Matte Architectural Grid */}
        <div className="absolute inset-0 bg-notebook-grid opacity-30 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-[#1E2227]/10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EAF0F4] text-[#3B6B88] border border-[#3B6B88]/20">
              <Sparkles size={15} />
            </span>
            <span className="text-xs font-mono tracking-wider uppercase text-[#1E2227]/70 font-bold">
              {t("onboarding.tourTitle", "Інженерний інструктаж")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <button
              type="button"
              onClick={handleSkip}
              className="text-[#1E2227]/50 hover:text-[#1E2227] transition-colors p-1.5 rounded-lg hover:bg-[#1E2227]/5 cursor-pointer"
              aria-label={t("onboarding.skip", "Пропустити")}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="relative z-10 py-6 flex flex-col items-center text-center">
          <div className={`mb-4 p-4 rounded-2xl ${currentSlide.iconBg} border shadow-xs flex items-center justify-center`}>
            {currentSlide.icon}
          </div>

          <span
            className={`inline-block text-[11px] font-mono font-bold tracking-wider px-3 py-1 rounded-full border mb-3 ${currentSlide.badgeColor}`}
          >
            {currentSlide.badge}
          </span>

          <h2
            id="onboarding-tour-title"
            className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#1E2227] mb-2.5"
          >
            {currentSlide.title}
          </h2>

          <p className="text-sm font-sans text-[#1E2227]/75 leading-relaxed max-w-md">
            {currentSlide.desc}
          </p>
        </div>

        {/* Footer & Controls */}
        <div className="relative z-10 pt-4 border-t border-[#1E2227]/10 flex flex-col gap-4">
          {/* Steps and Dots */}
          <div className="flex items-center justify-between text-xs text-[#1E2227]/60 font-mono">
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
                      ? "w-6 bg-[#1E2227]"
                      : "w-2 bg-[#1E2227]/20 hover:bg-[#1E2227]/40"
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
                  className="px-3.5 py-2 text-xs font-mono font-bold rounded-xl text-[#1E2227] bg-white hover:bg-[#F0EDE6] border border-[#1E2227]/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <ChevronLeft size={14} />
                  {t("onboarding.back", "← Назад")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-3 py-2 text-xs font-mono font-medium rounded-xl text-[#1E2227]/60 hover:text-[#1E2227] hover:bg-[#1E2227]/5 transition-colors cursor-pointer"
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
                  className="px-4.5 py-2 text-xs font-mono font-bold rounded-xl bg-[#1E2227] text-white hover:bg-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  {t("onboarding.next", "Далі →")}
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-5 py-2 text-xs font-mono font-bold rounded-xl bg-[#3E7A5E] hover:bg-[#34664F] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
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
