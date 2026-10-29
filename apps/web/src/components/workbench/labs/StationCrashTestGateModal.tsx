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

  const gate: StationCrashGate | undefined =
    STATION_CRASH_GATES[stationId] || STATION_CRASH_GATES["pos"];

  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(gate.timeLimitSeconds);
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState(0);
  const [isFailed, setIsFailed] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [failureReason, setFailureReason] = useState<string>("");
  const [hasAwarded, setHasAwarded] = useState(false);

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
      if (!hasAwarded) {
        addXp(gate.rewardXp);
        setHasAwarded(true);
      }
      if (onPassed) {
        onPassed();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1A1D20]/75 backdrop-blur-xs font-sans text-[#1A1D20]"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF8F2] rounded-2xl border-2 border-[#1A1D20]/30 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#EFE9DC] border-b border-[#1A1D20]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-600/30 text-rose-900">
              <ShieldAlert size={16} />
            </span>
            <div>
              <h2 className="font-display font-extrabold text-sm text-[#1A1D20] leading-none">
                {t("labs.crash.title", "Аттестаційний Краш-Тест Станції")}
              </h2>
              <p className="text-[11px] font-mono text-[#1A1D20]/60 mt-0.5">
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
                    : "bg-[#1A1D20]/10 border-[#1A1D20]/20 text-[#1A1D20]"
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
              className="p-1 rounded-lg text-[#1A1D20]/60 hover:text-[#1A1D20] hover:bg-[#1A1D20]/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!hasStarted ? (
            <div className="text-center py-6 px-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-600/30 text-amber-900 flex items-center justify-center mx-auto shadow-inner">
                <AlertOctagon size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-[#1A1D20]">
                  Фінальна бойова перевірка знань
                </h3>
                <p className="text-xs text-[#1A1D20]/75 max-w-md mx-auto leading-relaxed">
                  На станції змодельовано серію аварійних інцидентів у пікову годину. У вас буде {gate.timeLimitSeconds} секунд, щоб діагностувати кожну проблему та прийняти правильні інженерні рішення.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStart}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <ShieldAlert size={15} />
                  <span>{t("labs.crash.startDrill", "Почати краш-тест")}</span>
                </button>
              </div>
            </div>
          ) : isPassed ? (
            <div className="text-center py-6 px-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border-2 border-emerald-600/30 text-emerald-900 flex items-center justify-center mx-auto shadow-inner">
                <Trophy size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-[#1A1D20]">
                  {t("labs.crash.drillSuccess", "Краш-тест складено успішно!")}
                </h3>
                <p className="text-xs text-[#1A1D20]/75 max-w-md mx-auto leading-relaxed">
                  Всі інциденти успішно ліквідовані без втрати коштів і порушення протоколів. Ви підтвердили кваліфікацію: <strong className="text-emerald-800">{gate.certBadgeTitle}</strong>.
                </p>
              </div>
              <div className="pt-2 font-mono text-xs font-bold text-emerald-700">
                +{gate.rewardXp} XP Кваліфікаційного рейтингу
              </div>
            </div>
          ) : isFailed ? (
            <div className="text-center py-6 px-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border-2 border-rose-600/30 text-rose-900 flex items-center justify-center mx-auto shadow-inner">
                <XCircle size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-rose-950">
                  Краш-тест провалено
                </h3>
                <p className="text-xs text-rose-800/90 max-w-md mx-auto leading-relaxed font-mono">
                  {failureReason}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 rounded-xl bg-[#1A1D20] text-white font-mono text-xs font-bold flex items-center gap-1.5 mx-auto hover:bg-black transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Спробувати ще раз</span>
                </button>
              </div>
            </div>
          ) : (
            currentIncident && (
              <div className="space-y-4">
                {/* Incident Progress */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#1A1D20]/60">
                  <span className="font-bold uppercase tracking-wider text-rose-700">
                    {currentIncident.severity}
                  </span>
                  <span>
                    Інцидент {currentIncidentIndex + 1} з {gate.incidents.length}
                  </span>
                </div>

                {/* Incident Card */}
                <div className="p-4 rounded-xl bg-[#EFE9DC]/70 border border-[#1A1D20]/20 space-y-2">
                  <h4 className="font-display font-extrabold text-sm text-[#1A1D20]">
                    {t(currentIncident.titleKey, currentIncident.defaultTitle)}
                  </h4>
                  <p className="text-xs text-[#1A1D20]/80 leading-relaxed">
                    {t(currentIncident.descriptionKey, currentIncident.defaultDescription)}
                  </p>
                </div>

                {/* Mitigation Actions */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1A1D20]/70">
                    Оберіть реакцію інженера:
                  </div>
                  {currentIncident.actions.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => handleAction(act)}
                      className="w-full text-left p-3.5 rounded-xl border border-[#1A1D20]/25 bg-[#FAF8F2] hover:bg-[#EFE9DC] hover:border-[#1A1D20]/40 text-xs font-medium text-[#1A1D20] transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <span>{t(act.labelKey, act.defaultLabel)}</span>
                      <ArrowRight
                        size={14}
                        className="text-[#1A1D20]/40 group-hover:text-[#1A1D20] shrink-0 transition-transform group-hover:translate-x-0.5"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#EFE9DC] border-t border-[#1A1D20]/20 flex items-center justify-between">
          <div className="text-[11px] font-mono text-[#1A1D20]/60">
            {isPassed ? "Сертифікацію пройдено" : "Режим реального часу"}
          </div>
          {isPassed && (
            <button
              onClick={() => {
                audioFx.playRelayClick();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-[#1A1D20] text-[#FAF8F2] text-xs font-mono font-bold hover:bg-black transition-colors cursor-pointer"
            >
              {t("labs.crash.claimCertificate", "Закрити")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
