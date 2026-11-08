/**
 * @file apps/web/src/components/workbench/labs/StationCrashTestGateModal.tsx
 * @description Station Certification Crash Test Gate:
 * High-stakes 75-second timed drill to prove station mastery and earn certification.
 */

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Trophy,
  AlertOctagon,
  Clock,
  XCircle,
  X,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  STATION_CRASH_GATES,
  type StationCrashGate,
  type CrashIncident,
  type CrashIncidentAction,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { audioFx } from "../../../utils/audioFx";

export interface StationCrashTestGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId?: string;
  onPassed?: () => void;
}

export const StationCrashTestGateModal: React.FC<StationCrashTestGateModalProps> = ({
  isOpen,
  onClose,
  stationId = "pos",
  onPassed,
}) => {
  const { t } = useTranslation();
  const addXp = useWorkbenchStore((s) => s.addXp);
  const completeLab = useWorkbenchStore((s) => s.completeLab);
  const isLabCompleted = useWorkbenchStore((s) => s.isLabCompleted);

  const gate: StationCrashGate | undefined =
    STATION_CRASH_GATES[stationId] || STATION_CRASH_GATES["pos"];

  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(gate.timeLimitSeconds);
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState(0);
  const [isFailed, setIsFailed] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [failureReason, setFailureReason] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer loop
  useEffect(() => {
    if (!isOpen || !hasStarted || isPassed || isFailed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          audioFx.playAlarmSound();
          setIsFailed(true);
          setFailureReason(t("labs.crash.timeExpired", "Час вичерпано! Аварія на станції призвела до простою."));
          return 0;
        }
        if (prev <= 15) {
          audioFx.playHeartbeat();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, hasStarted, isPassed, isFailed, t]);

  if (!isOpen) return null;

  const currentIncident: CrashIncident | undefined = gate.incidents[currentIncidentIndex];

  const handleStart = () => {
    audioFx.playWarRoomSiren();
    setHasStarted(true);
    setTimeLeft(gate.timeLimitSeconds);
    setCurrentIncidentIndex(0);
    setIsFailed(false);
    setIsPassed(false);
    setFailureReason("");
  };

  const handleAction = (action: CrashIncidentAction) => {
    if (isFailed || isPassed) return;

    if (!action.isCorrect) {
      audioFx.playErrorBuzz();
      setIsFailed(true);
      setFailureReason(t(action.consequenceKey, action.defaultConsequence));
      return;
    }

    audioFx.playRelayClick();

    if (currentIncidentIndex < gate.incidents.length - 1) {
      setCurrentIncidentIndex((i) => i + 1);
    } else {
      // Completed all incidents!
      audioFx.playSuccessFanfare();
      setIsPassed(true);
      const gateKey = `${gate.stationId}-crash-gate`;
      if (!isLabCompleted(gateKey)) {
        addXp(gate.rewardXp);
        completeLab(gateKey);
      }
    }
  };

  const handleRetry = () => {
    handleStart();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="crash-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm font-sans text-obsidian"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-black/[0.08] shadow-luxury flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-600/25 text-rose-900">
              <ShieldAlert size={16} />
            </span>
            <div>
              <h2 className="font-display font-extrabold text-sm text-obsidian leading-none">
                {t("labs.crash.title", "Аттестаційний Краш-Тест Станції")}
              </h2>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                {t(gate.titleKey, gate.defaultTitle)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasStarted && !isPassed && !isFailed && (
              <div
                className={`flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                  timeLeft <= 15
                    ? "bg-rose-500/15 border-rose-600 text-rose-900 animate-pulse"
                    : "bg-slate-100 border-black/[0.06] text-slate-700"
                }`}
              >
                <Clock size={13} />
                <span>{timeLeft}s</span>
              </div>
            )}
            <button
              onClick={() => {
                audioFx.playRelayClick();
                onClose();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-obsidian hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!hasStarted ? (
            <div className="text-center py-6 px-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-600/25 text-amber-900 flex items-center justify-center mx-auto shadow-2xs">
                <AlertOctagon size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-obsidian">
                  {t("labs.crash.drillIntroTitle", "Фінальна бойова перевірка знань")}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  {t("labs.crash.drillIntroDesc", {
                    count: gate.timeLimitSeconds,
                    defaultValue: `На станції змодельовано серію аварійних інцидентів у пікову годину. У вас буде ${gate.timeLimitSeconds} секунд, щоб діагностувати кожну проблему та прийняти правильні інженерні рішення.`,
                  })}
                </p>
              </div>

              <div className="pt-2">
                <button
                  data-testid="crash-start-btn"
                  onClick={handleStart}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-2xs active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <ShieldAlert size={15} />
                  <span>{t("labs.crash.startDrill", "Почати краш-тест")}</span>
                </button>
              </div>
            </div>
          ) : isPassed ? (
            <div data-testid="crash-success-view" className="text-center py-6 px-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-600/25 text-emerald-900 flex items-center justify-center mx-auto shadow-2xs">
                <Trophy size={32} className="text-[#C5A059]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-obsidian">
                  {t("labs.crash.drillSuccess", "Краш-тест складено успішно!")}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  <span>{t("labs.crash.drillSuccessDesc", "Всі інциденти успішно ліквідовані без втрати коштів і порушення протоколів. Ви підтвердили кваліфікацію:")} </span>
                  <strong className="text-emerald-800">{gate.certBadgeTitle}</strong>.
                </p>
              </div>
              <div className="pt-2 font-mono text-xs font-bold text-emerald-700">
                +{gate.rewardXp} {t("labs.crash.xpRatingReward", "XP Кваліфікаційного рейтингу")}
              </div>
            </div>
          ) : isFailed ? (
            <div className="text-center py-6 px-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-600/25 text-rose-900 flex items-center justify-center mx-auto shadow-2xs">
                <XCircle size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-rose-950">
                  {t("labs.crash.drillFailedTitle", "Краш-тест провалено")}
                </h3>
                <p className="text-xs text-rose-800 max-w-md mx-auto leading-relaxed font-mono">
                  {failureReason}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 rounded-xl bg-[#252932] text-white font-mono text-xs font-bold flex items-center gap-1.5 mx-auto hover:bg-[#1A1D20] transition-colors cursor-pointer shadow-2xs"
                >
                  <RotateCcw size={13} />
                  <span>{t("labs.crash.tryAgain", "Спробувати ще раз")}</span>
                </button>
              </div>
            </div>
          ) : (
            currentIncident && (
              <div className="space-y-4">
                {/* Incident Progress */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="font-bold uppercase tracking-wider text-rose-700">
                    {currentIncident.severity}
                  </span>
                  <span>
                    {t("labs.crash.incidentProgress", {
                      current: currentIncidentIndex + 1,
                      total: gate.incidents.length,
                      defaultValue: `Інцидент ${currentIncidentIndex + 1} з ${gate.incidents.length}`,
                    })}
                  </span>
                </div>

                {/* Incident Card */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-black/[0.06] space-y-2">
                  <h4 className="font-display font-extrabold text-sm text-obsidian">
                    {t(currentIncident.titleKey, currentIncident.defaultTitle)}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t(currentIncident.descriptionKey, currentIncident.defaultDescription)}
                  </p>
                </div>

                {/* Mitigation Actions */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    {t("labs.crash.chooseAction", "Оберіть реакцію інженера:")}
                  </div>
                  {currentIncident.actions.map((act) => (
                    <button
                      key={act.id}
                      data-testid={`crash-action-${act.id}`}
                      onClick={() => handleAction(act)}
                      className="w-full text-left p-3.5 rounded-xl border border-black/[0.06] bg-white hover:bg-slate-50 hover:border-black/[0.14] text-xs font-medium text-obsidian shadow-2xs transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <span>{t(act.labelKey, act.defaultLabel)}</span>
                      <ArrowRight
                        size={14}
                        className="text-slate-400 group-hover:text-obsidian shrink-0 transition-transform group-hover:translate-x-0.5"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-black/[0.06] flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            {isPassed
              ? t("labs.crash.certificationPassed", "Сертифікацію пройдено")
              : t("labs.crash.realtimeMode", "Режим реального часу")}
          </div>
          {isPassed && (
            <button
              data-testid="crash-claim-btn"
              onClick={() => {
                audioFx.playRelayClick();
                onClose();
                if (onPassed) {
                  onPassed();
                }
              }}
              className="px-4 py-1.5 rounded-xl bg-[#252932] text-white text-xs font-mono font-bold hover:bg-[#1A1D20] transition-colors cursor-pointer shadow-2xs"
            >
              {t("labs.crash.claimCertificate", "Закрити")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
