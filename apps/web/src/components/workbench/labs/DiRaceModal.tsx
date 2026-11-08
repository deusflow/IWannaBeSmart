/**
 * @file apps/web/src/components/workbench/labs/DiRaceModal.tsx
 * @description DI Survival Race:
 * Hands-on educational drill contrasting manual refactoring across multiple files (Without DI)
 * against a 1-line configuration change with automatic injection (With DI).
 */

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Timer,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  RotateCcw,
  Sparkles,
  Layers,
  FileCode,
} from "lucide-react";
import {
  DI_RACE_SCENARIOS,
  type DiRaceScenario,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { audioFx } from "../../../utils/audioFx";

export interface DiRaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId?: string;
  initialScenarioId?: string;
}

export const DiRaceModal: React.FC<DiRaceModalProps> = ({
  isOpen,
  onClose,
  stationId = "tv",
  initialScenarioId,
}) => {
  const { t } = useTranslation();
  const addXp = useWorkbenchStore((s) => s.addXp);
  const completeLab = useWorkbenchStore((s) => s.completeLab);
  const isLabCompleted = useWorkbenchStore((s) => s.isLabCompleted);

  const scenario: DiRaceScenario =
    DI_RACE_SCENARIOS.find(
      (s) => (initialScenarioId ? s.id === initialScenarioId : !stationId || s.stationId === stationId)
    ) || DI_RACE_SCENARIOS[0];

  // Mode: 'without-di' (Round 1) | 'with-di' (Round 2)
  const [mode, setMode] = useState<"without-di" | "with-di">("without-di");

  // Round 1 state
  const [hasStartedR1, setHasStartedR1] = useState(false);
  const [timeLeft, setTimeLeft] = useState(scenario.timeLimitSeconds);
  const [fixedFiles, setFixedFiles] = useState<Record<number, boolean>>({});
  const [activeEditingIdx, setActiveEditingIdx] = useState<number | null>(null);
  const [typingInput, setTypingInput] = useState("");
  const [isFailedR1, setIsFailedR1] = useState(false);

  // Round 2 state
  const [isDiSwapped, setIsDiSwapped] = useState(false);
  const [consumerUpdatedCount, setConsumerUpdatedCount] = useState(0);
  const [isSuccessR2, setIsSuccessR2] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const staggerTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Timer loop for Round 1
  useEffect(() => {
    if (!isOpen || !hasStartedR1 || isFailedR1 || mode !== "without-di") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          audioFx.playErrorBuzz();
          setIsFailedR1(true);
          setActiveEditingIdx(null);
          return 0;
        }
        if (prev <= 3) {
          audioFx.playHeartbeat();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, hasStartedR1, isFailedR1, mode]);

  // Clean up stagger timers
  useEffect(() => {
    return () => {
      staggerTimerRef.current.forEach((tId) => clearTimeout(tId));
    };
  }, []);

  if (!isOpen) return null;

  const handleStartRound1 = () => {
    audioFx.playWarRoomSiren();
    setHasStartedR1(true);
    setTimeLeft(scenario.timeLimitSeconds);
    setFixedFiles({});
    setActiveEditingIdx(null);
    setTypingInput("");
    setIsFailedR1(false);
  };

  const handleOpenFix = (idx: number) => {
    if (isFailedR1 || !hasStartedR1) return;
    audioFx.playKeyClick();
    setActiveEditingIdx(idx);
    setTypingInput("");
  };

  const handleSaveFix = (idx: number) => {
    if (typingInput.trim() === scenario.newService) {
      audioFx.playRelayClick();
      setFixedFiles((prev) => ({ ...prev, [idx]: true }));
      setActiveEditingIdx(null);
      setTypingInput("");
    } else {
      audioFx.playErrorBuzz();
    }
  };

  const handleSwitchToDi = () => {
    audioFx.playRelayClick();
    if (timerRef.current) clearInterval(timerRef.current);
    setMode("with-di");
    setIsDiSwapped(false);
    setConsumerUpdatedCount(0);
    setIsSuccessR2(false);
  };

  const handleSwapToStripe = () => {
    if (isDiSwapped) return;
    audioFx.playRelayClick();
    setIsDiSwapped(true);

    // Staggered propagation across consumer files (100ms interval)
    staggerTimerRef.current.forEach((tId) => clearTimeout(tId));
    staggerTimerRef.current = [];

    scenario.consumerFiles.forEach((_, idx) => {
      const tId = setTimeout(() => {
        audioFx.playKeyClick();
        setConsumerUpdatedCount((c) => Math.max(c, idx + 1));
      }, (idx + 1) * 100);
      staggerTimerRef.current.push(tId);
    });

    const completionTimer = setTimeout(() => {
      audioFx.playSuccessFanfare();
      setIsSuccessR2(true);

      const labKey = `di-race-${scenario.id}`;
      if (!isLabCompleted(labKey)) {
        addXp(scenario.rewardXp);
        completeLab(labKey);
      }
    }, scenario.consumerFiles.length * 100 + 200);

    staggerTimerRef.current.push(completionTimer);
  };

  const handleResetAll = () => {
    audioFx.playRelayClick();
    if (timerRef.current) clearInterval(timerRef.current);
    staggerTimerRef.current.forEach((tId) => clearTimeout(tId));
    setMode("without-di");
    setHasStartedR1(false);
    setTimeLeft(scenario.timeLimitSeconds);
    setFixedFiles({});
    setActiveEditingIdx(null);
    setTypingInput("");
    setIsFailedR1(false);
    setIsDiSwapped(false);
    setConsumerUpdatedCount(0);
    setIsSuccessR2(false);
  };

  const fixedCount = Object.keys(fixedFiles).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="di-race-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm font-sans text-obsidian"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-black/[0.08] shadow-luxury flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-600/25 text-rose-900">
              <Timer size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 border border-black/[0.06] text-slate-700">
                  {t("labs.diRace.badge", "DI Survival Race")}
                </span>
                <span className="text-xs font-mono font-bold text-amber-700">
                  +{scenario.rewardXp} XP
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold text-obsidian mt-0.5">
                {t(scenario.titleKey, scenario.defaultTitle)}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              audioFx.playRelayClick();
              onClose();
            }}
            data-testid="di-close-btn"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-obsidian transition-colors cursor-pointer"
            aria-label={t("common.close", "Закрити")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-5 py-2.5 bg-white border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (mode !== "without-di") {
                  audioFx.playRelayClick();
                  setMode("without-di");
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                mode === "without-di"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200/70 text-slate-700"
              }`}
            >
              {t("labs.diRace.tabWithoutDi", "Раунд 1: Без DI (Таймер 10 с)")}
            </button>

            <button
              onClick={handleSwitchToDi}
              data-testid="di-toggle"
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === "with-di"
                  ? "bg-[#252932] text-[#C5A059] border border-[#C5A059]/40 shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200/70 text-slate-700"
              }`}
            >
              <Sparkles size={13} />
              <span>{t("labs.diRace.tabWithDi", "Раунд 2: З DI (1 рядок)")}</span>
            </button>
          </div>

          <button
            onClick={handleResetAll}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-obsidian text-xs font-mono flex items-center gap-1 transition-colors"
            title={t("labs.diRace.resetAllTooltip", "Скинути обидва раунди")}
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">{t("labs.diRace.resetBtn", "Скинути")}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
          {mode === "without-di" ? (
            /* ROUND 1: WITHOUT DI */
            <div className="space-y-4">
              {/* Mission Premise */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-600/30 flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-display font-bold text-xs uppercase tracking-wider text-amber-950">
                    {t("labs.diRace.missionTitle", "Термінове завдання від ліда")}
                  </div>
                  <p className="text-xs text-[#1A1D20] leading-relaxed">
                    {t("labs.diRace.missionDesc", "Банк вимкнув старий шлюз! Потрібно терміново замінити LegacyPaymentGateway на StripePaymentGateway у 5 файлах одночасно.")}
                  </p>
                  <p className="font-mono text-[11px] font-bold text-rose-800">
                    {t("labs.diRace.impossibleNotice", "Цей раунд майже неможливо пройти — так і задумано")}
                  </p>
                </div>
              </div>

              {/* Start Bar / Countdown */}
              {!hasStartedR1 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-50 border border-black/[0.06] space-y-3 shadow-2xs">
                  <div className="font-mono text-xs text-slate-600">
                    {t("labs.diRace.timerNotice", "У вас є лише 10 секунд на ручне виправлення 5 файлів.")}
                  </div>
                  <button
                    onClick={handleStartRound1}
                    data-testid="di-start-btn"
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-sm transition-transform active:scale-95 shadow-sm cursor-pointer inline-flex items-center gap-2"
                  >
                    <Timer size={16} />
                    <span>{t("labs.diRace.startBtn", "Почати гонку (10 с)")}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#1A1D20] text-white">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span>{t("labs.diRace.filesFixedLabel", "Виправлено:")}</span>
                    <span className="font-bold text-amber-400">
                      {fixedCount} / {scenario.consumerFiles.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-sm font-extrabold">
                    <Timer size={16} className={timeLeft <= 3 ? "text-rose-400 animate-pulse" : "text-amber-400"} />
                    <span className={timeLeft <= 3 ? "text-rose-400 animate-pulse" : "text-white"}>
                      00:0{timeLeft}
                    </span>
                  </div>
                </div>
              )}

              {/* Failure View */}
              {isFailedR1 && (
                <div
                  data-testid="di-fail-view"
                  className="p-4 rounded-xl bg-rose-500/15 border-2 border-rose-600/40 text-rose-950 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center gap-2 font-display font-bold text-sm text-rose-900">
                    <XCircle size={18} className="text-rose-700" />
                    <span>{t("labs.diRace.failTitle", "Час вичерпано! Аварія на продакшені!")}</span>
                  </div>

                  <p className="text-xs text-rose-950 leading-relaxed font-mono">
                    <span>{t("labs.diRace.failSummaryPrefix", "Не встиг:")} </span>
                    <span>{fixedCount} </span>
                    <span>{t("labs.diRace.failSummaryOf", "з")} </span>
                    <span>{scenario.consumerFiles.length} </span>
                    <span>{t("labs.diRace.failSummaryFiles", "файлів")}</span>
                  </p>

                  <p className="text-xs text-[#1A1D20] leading-relaxed">
                    {t("labs.diRace.failLesson", "Без Dependency Injection компоненти жорстко привєднані до конкретних класів. Кожна зміна вимагає переписування всього проєкту.")}
                  </p>

                  <button
                    onClick={handleSwitchToDi}
                    data-testid="di-toggle"
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm cursor-pointer"
                  >
                    <span>{t("labs.diRace.tryWithDiBtn", "Спробувати з Dependency Injection ▶")}</span>
                  </button>
                </div>
              )}

              {/* 5 Consumer Files Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {scenario.consumerFiles.map((fileName, idx) => {
                  const isFixed = Boolean(fixedFiles[idx]);
                  const isEditing = activeEditingIdx === idx;

                  return (
                    <div
                      key={fileName}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all shadow-2xs ${
                        isFixed
                          ? "bg-emerald-500/10 border-emerald-600/30"
                          : "bg-white border-black/[0.08]"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs font-bold text-obsidian truncate">
                            {fileName}
                          </span>
                          {isFixed ? (
                            <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                          ) : (
                            <FileCode size={14} className="text-slate-400 shrink-0" />
                          )}
                        </div>

                        <div className="font-mono text-[10px] p-1.5 rounded bg-[#1A1D24] text-gray-200 overflow-x-auto select-none">
                          {isFixed ? (
                            <span className="text-emerald-400">
                              var gateway = new StripePaymentGateway();
                            </span>
                          ) : (
                            <span className="text-rose-400">
                              var gateway = new LegacyPaymentGateway();
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Manual edit prompt */}
                      {hasStartedR1 && !isFailedR1 && !isFixed && (
                        <div className="mt-2 pt-2 border-t border-black/[0.06]">
                          {isEditing ? (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={typingInput}
                                onChange={(e) => setTypingInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveFix(idx);
                                }}
                                placeholder={scenario.newService}
                                className="w-full px-2 py-1 text-[11px] font-mono bg-white border border-black/[0.15] rounded outline-none focus:border-[#252932]"
                                autoFocus
                              />
                              <div className="flex items-center justify-between gap-1">
                                <button
                                  onClick={() => handleSaveFix(idx)}
                                  className="px-2 py-0.5 rounded bg-[#252932] text-white font-mono text-[10px] font-bold"
                                >
                                  {t("labs.diRace.saveBtn", "OK")}
                                </button>
                                <button
                                  onClick={() => setActiveEditingIdx(null)}
                                  className="text-[10px] font-mono text-slate-400 hover:text-obsidian"
                                >
                                  {t("common.cancel", "Скасувати")}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenFix(idx)}
                              data-testid={`di-fix-btn-${idx}`}
                              className="w-full py-1 px-2 rounded bg-slate-100 hover:bg-slate-200 border border-black/[0.08] text-obsidian font-mono text-[11px] font-bold transition-all shadow-2xs"
                            >
                              {t("labs.diRace.fixBtn", "Виправити")}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ROUND 2: WITH DI */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-600/30 flex items-start gap-3">
                <Sparkles size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-display font-bold text-xs uppercase tracking-wider text-emerald-950">
                    {t("labs.diRace.withDiTitle", "Архітектура з Dependency Injection")}
                  </div>
                  <p className="text-xs text-[#1A1D20] leading-relaxed">
                    {t("labs.diRace.withDiDesc", "Всі 5 файлів залежать лише від інтерфейсу IPaymentGateway. Щоб замінити весь шлюз для системи, змініть всього 1 рядок у точці конфігурації (Program.cs).")}
                  </p>
                </div>
              </div>

              {/* Composition Root: Program.cs */}
              <div className="p-4 rounded-xl bg-[#212429] border border-[#1A1D20]/40 text-gray-200 space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-amber-400">Program.cs (Composition Root)</span>
                  <span className="text-gray-400 text-[10px]">DI Container Registration</span>
                </div>

                <div className="p-3 rounded-lg bg-[#181A1E] border border-[#32363D] font-mono text-xs">
                  {isDiSwapped ? (
                    <div className="text-emerald-400 font-semibold animate-in fade-in">
                      services.AddScoped&lt;IPaymentGateway, StripePaymentGateway&gt;();
                    </div>
                  ) : (
                    <div className="text-amber-400 font-semibold">
                      services.AddScoped&lt;IPaymentGateway, LegacyPaymentGateway&gt;();
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={handleSwapToStripe}
                    disabled={isDiSwapped}
                    data-testid="di-swap-btn"
                    className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                      isDiSwapped
                        ? "bg-emerald-600 text-white cursor-default"
                        : "bg-[#C86D32] hover:bg-[#B35E28] text-white active:scale-95"
                    }`}
                  >
                    <Zap size={14} />
                    <span>
                      {isDiSwapped
                        ? t("labs.diRace.swappedBtn", "Шлюз замінено!")
                        : t("labs.diRace.swapBtn", "Замінити на Stripe (1 клік)")}
                    </span>
                  </button>

                  <div className="text-right font-mono text-[10px] text-gray-400">
                    {t("labs.diRace.diTimeStat", "Час операції: ~1 секунда")}
                  </div>
                </div>
              </div>

              {/* 5 Consumers with staggered automatic update */}
              <div className="space-y-2">
                <div className="font-mono text-xs font-bold text-[#1A1D20]/80">
                  {t("labs.diRace.consumersTitle", "5 споживачів сервісу (жодного рядка не змінено вручну):")}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {scenario.consumerFiles.map((fileName, idx) => {
                    const isUpdated = consumerUpdatedCount > idx;

                    return (
                      <div
                        key={fileName}
                        data-testid={`di-consumer-${idx}`}
                        className={`p-3 rounded-xl border transition-all duration-300 shadow-2xs ${
                          isUpdated
                            ? "bg-emerald-500/15 border-emerald-600/40 text-emerald-950"
                            : "bg-white border-black/[0.08] text-obsidian"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono text-xs font-bold truncate">{fileName}</span>
                          {isUpdated ? (
                            <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                          ) : (
                            <Layers size={14} className="text-gray-400 shrink-0" />
                          )}
                        </div>

                        <div className="font-mono text-[10px] p-1.5 rounded bg-[#212429] text-gray-300 overflow-x-auto select-none">
                          {isUpdated ? (
                            <span className="text-emerald-400">
                              Resolved: StripePaymentGateway
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              Resolved: LegacyPaymentGateway
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Success Comparison View */}
              {isSuccessR2 && (
                <div
                  data-testid="di-success-view"
                  className="p-5 rounded-xl bg-emerald-500/15 border-2 border-emerald-600/40 text-emerald-950 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center gap-2 font-display font-bold text-sm text-emerald-900">
                    <CheckCircle2 size={18} className="text-emerald-700" />
                    <span>{t("labs.diRace.successTitle", "Перемога архітектури! Порівняння результатів:")}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-600/20 text-rose-950">
                      <div className="font-mono font-bold text-rose-900 mb-1">
                        {t("labs.diRace.statWithoutDiLabel", "Без DI:")}
                      </div>
                      <p>{t("labs.diRace.statWithoutDiDesc", "10 секунд і провал. Потрібно вручну переписати 5 файлів, ризик помилок 100%.")}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-600/20 text-emerald-950">
                      <div className="font-mono font-bold text-emerald-900 mb-1">
                        {t("labs.diRace.statWithDiLabel", "З DI:")}
                      </div>
                      <p>{t("labs.diRace.statWithDiDesc", "1 рядок, ~1 секунда. Всі 5 споживачів автоматично підхопили новий шлюз.")}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-black/[0.06] flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            {t("labs.diRace.hintNote", "Dependency Injection звільняє бізнес-логіку від створення залежностей")}
          </div>

          <button
            onClick={() => {
              audioFx.playRelayClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-black/[0.08] font-mono text-xs font-bold text-obsidian transition-colors cursor-pointer shadow-2xs"
          >
            {t("common.close", "Закрити")}
          </button>
        </div>
      </div>
    </div>
  );
};
