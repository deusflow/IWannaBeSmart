/**
 * @file apps/web/src/components/profile/ProfileOnboardingGuide.tsx
 * @description 3-Step Guided Mini-Onboarding Tour inside UserProfileModal.
 * Displays rank explanation, patterns dossier, and quick shortcuts with localStorage persistence.
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Award, ShieldCheck, Command, X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { audioFx } from "../../utils/audioFx";

export const ProfileOnboardingGuide: React.FC = () => {
  const { t } = useTranslation();
  const storageKey = "iw_profile_onboarding_completed";
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== "true") {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, []);

  if (isDismissed) return null;

  const handleFinish = () => {
    audioFx.playSuccessFanfare();
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // Storage sandbox fallback
    }
    setIsDismissed(true);
  };

  const handleClose = () => {
    audioFx.playRelayClick();
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // Storage sandbox fallback
    }
    setIsDismissed(true);
  };

  const handleNext = () => {
    audioFx.playRelayClick();
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else handleFinish();
  };

  const handlePrev = () => {
    audioFx.playRelayClick();
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const stepsConfig = [
    {
      stepNum: 1,
      icon: Award,
      iconColor: "text-amber-700",
      iconBg: "bg-amber-100 border-amber-300",
      title: t("profile.onboarding.step1Title", "1. Інженерний ранг"),
      desc: t(
        "profile.onboarding.step1Desc",
        "Твій професійний рівень (від L1 до L4). Зростає за чисті архітектурні рішення."
      ),
    },
    {
      stepNum: 2,
      icon: ShieldCheck,
      iconColor: "text-emerald-700",
      iconBg: "bg-emerald-100 border-emerald-300",
      title: t("profile.onboarding.step2Title", "2. Досьє патернів"),
      desc: t(
        "profile.onboarding.step2Desc",
        "Твій практичний багаж: тут збираються опановані патерни проектування."
      ),
    },
    {
      stepNum: 3,
      icon: Command,
      iconColor: "text-blue-700",
      iconBg: "bg-blue-100 border-blue-300",
      title: t("profile.onboarding.step3Title", "3. Швидкі команди"),
      desc: t(
        "profile.onboarding.step3Desc",
        "Гарячі клавіші для керування верстаком без миші."
      ),
    },
  ];

  const currentStepData = stepsConfig[step - 1];
  const IconComponent = currentStepData.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F5EDE6] via-white to-[#F5EDE6] border-2 border-[#C86D32] p-4 sm:p-5 shadow-sm animate-in slide-in-from-top-2 duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C86D32] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C86D32]" />
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C86D32]/15 text-[#C86D32] uppercase tracking-wider border border-[#C86D32]/30">
            {t("profile.onboarding.badge", "МІНІ-ОНБОРДИНГ")} •{" "}
            {t("profile.onboarding.stepIndicator", { current: step, total: 3 })}
          </span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                audioFx.playRelayClick();
                setStep(s as 1 | 2 | 3);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                step === s ? "w-6 bg-[#C86D32]" : "w-2 bg-[#1E2227]/20 hover:bg-[#1E2227]/40"
              }`}
              title={`Крок ${s}`}
            />
          ))}

          <button
            type="button"
            onClick={handleClose}
            className="ml-2 p-1 rounded-lg hover:bg-[#1E2227]/10 text-[#1E2227]/50 hover:text-[#1E2227] transition-colors cursor-pointer"
            title={t("common.close", "Закрити")}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex items-start gap-3.5 my-2">
        <div
          className={`w-11 h-11 rounded-2xl border-2 ${currentStepData.iconBg} ${currentStepData.iconColor} flex items-center justify-center shrink-0 shadow-xs`}
        >
          <IconComponent size={22} strokeWidth={2.2} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-display font-bold text-sm sm:text-base text-[#1E2227] tracking-tight">
            {currentStepData.title}
          </h4>
          <p className="text-xs sm:text-sm text-[#1E2227]/80 mt-0.5 leading-relaxed font-sans">
            {currentStepData.desc}
          </p>
        </div>
      </div>

      {/* Actions footer */}
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#1E2227]/10">
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-xl border border-[#1E2227]/20 bg-white hover:bg-[#FAF8F2] text-xs font-mono font-bold text-[#1E2227] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <ChevronLeft size={13} />
              <span>{t("profile.onboarding.prev", "← Назад")}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-[#C86D32] hover:bg-[#B35E28] text-white text-xs font-mono font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span>{t("profile.onboarding.next", "Далі ➔")}</span>
              <ChevronRight size={13} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Check size={14} strokeWidth={2.4} />
              <span>{t("profile.onboarding.finish", "Зрозуміло! 🚀")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
