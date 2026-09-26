/**
 * @file apps/web/src/components/workbench/express/ExpressTastingScreen.tsx
 * @description Isolated Express Tasting Route for absolute beginners ("Посібник для чайників").
 * Completely decoupled from complex code editors and raw stations.
 * Features 3 foolproof interactive micro-scenes:
 * 1. Backend: "Оживи прилад" (Wiring + Remote control + CRT Kinescope)
 * 2. AI: "Смисловий радар" (2D Semantic vector embeddings & cosine proximity)
 * 3. Cybersecurity: "Мережевий щит" (Packet stream inspector + Firewall IP blocking)
 * Followed by an empowering career choice finale.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Zap,
  Power,
  Tv,
  Sparkles,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Server,
  Radar,
  Compass,
  CheckCircle2,
  ChevronRight,
  Bot,
  Cpu,
} from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../utils/audioFx";
import type { CareerTrack } from "../../../store/types";

interface ExpressTastingScreenProps {
  onClose: () => void;
}

export const ExpressTastingScreen: React.FC<ExpressTastingScreenProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { addXp, setUserTrack, setCurrentStationId, setCurrentView } = useWorkbenchStore(
    useShallow((s) => ({
      addXp: s.addXp,
      setUserTrack: s.setUserTrack,
      setCurrentStationId: s.setCurrentStationId,
      setCurrentView: s.setCurrentView,
    }))
  );

  // Active step: 1 (Backend) | 2 (AI) | 3 (Cyber) | 4 (Finale)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // XP tracking for this session
  const [xpAwardedSteps, setXpAwardedSteps] = useState<Record<number, boolean>>({});

  // ── Step 1 State: Backend ──
  const [isWireConnected, setIsWireConnected] = useState<boolean>(false);
  const [isTvPowered, setIsTvPowered] = useState<boolean>(false);

  // ── Step 2 State: AI Semantic Radar ──
  const [isRadarAnalyzed, setIsRadarAnalyzed] = useState<boolean>(false);
  const [isRadarScanning, setIsRadarScanning] = useState<boolean>(false);

  // ── Step 3 State: Cybersecurity Shield ──
  const [isAttackPacketSelected, setIsAttackPacketSelected] = useState<boolean>(false);
  const [isFirewallBlocked, setIsFirewallBlocked] = useState<boolean>(false);

  // Helper to award +50 XP once per step
  const awardStepXp = (stepNum: number) => {
    if (!xpAwardedSteps[stepNum]) {
      addXp(50);
      setXpAwardedSteps((prev) => ({ ...prev, [stepNum]: true }));
    }
  };

  // Step 1: Wire Click
  const handleConnectWire = () => {
    if (isWireConnected) return;
    audioFx.playRelayClick();
    setIsWireConnected(true);
  };

  // Step 1: Power Button Click
  const handleTogglePower = () => {
    if (!isWireConnected) {
      audioFx.playErrorBuzz();
      return;
    }
    audioFx.playRelayClick();
    audioFx.playCrtHum();
    setIsTvPowered(true);
    awardStepXp(1);
    setTimeout(() => {
      audioFx.playSuccessFanfare();
    }, 200);
  };

  // Step 2: AI Radar Click
  const handleAnalyzeRadar = () => {
    if (isRadarAnalyzed || isRadarScanning) return;
    audioFx.playRelayClick();
    setIsRadarScanning(true);
    setTimeout(() => {
      setIsRadarScanning(false);
      setIsRadarAnalyzed(true);
      awardStepXp(2);
      audioFx.playSuccessFanfare();
    }, 900);
  };

  // Step 3: Select Attack Packet
  const handleSelectAttackPacket = () => {
    if (isFirewallBlocked) return;
    audioFx.playRemoteBeep();
    setIsAttackPacketSelected(true);
  };

  // Step 3: Block IP Firewall
  const handleBlockIp = () => {
    if (isFirewallBlocked) return;
    audioFx.playIncidentResolved();
    setIsFirewallBlocked(true);
    awardStepXp(3);
    setTimeout(() => {
      audioFx.playSuccessFanfare();
    }, 250);
  };

  // Finale: Select Career Track
  const handleSelectTrack = (track: CareerTrack) => {
    audioFx.playSuccessFanfare();
    setUserTrack(track);
    if (track === "backend") {
      setCurrentStationId("tv");
    } else if (track === "ai") {
      setCurrentStationId("vertex");
    } else if (track === "security") {
      setCurrentStationId("bandit");
    } else {
      setCurrentStationId("tv");
    }
    setCurrentView("HUB");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2227] flex flex-col font-sans select-none relative pb-12">
      {/* Background drafting grid */}
      <div className="absolute inset-0 bg-notebook-grid opacity-60 pointer-events-none" />

      {/* ── Top Navigation Bar ── */}
      <header className="relative z-20 border-b border-[#1E2227]/15 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-white border border-[#1E2227]/20 text-xs font-mono font-bold text-[#1E2227] transition-all cursor-pointer shadow-paper-xs active:scale-95"
            title={t("expressTour.exitToHub", "До верстака / Hub")}
          >
            <ArrowLeft size={14} className="text-accent-blue" />
            <span>{t("expressTour.exitToHub", "До верстака / Hub")}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#C86D32]/15 text-[#C86D32] border border-[#C86D32]/30 uppercase tracking-wider">
              {t("expressTour.badge", "EXPLORER L0")}
            </span>
            <h1 className="font-display font-extrabold text-sm sm:text-base text-[#1E2227] tracking-tight">
              {t("expressTour.title", "Експрес тест-драйв IT-професій")}
            </h1>
          </div>
        </div>

        {/* Stepper Progress Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {[
            { step: 1, label: t("expressTour.stepBackend", "1. Бекенд") },
            { step: 2, label: t("expressTour.stepAi", "2. ШІ") },
            { step: 3, label: t("expressTour.stepCyber", "3. Кібербезпека") },
            { step: 4, label: t("expressTour.stepFinale", "Фінал") },
          ].map((item) => (
            <div
              key={item.step}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                activeStep === item.step
                  ? "bg-[#C86D32] text-white shadow-xs"
                  : activeStep > item.step
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-white/60 border border-[#1E2227]/10 text-[#1E2227]/40"
              }`}
            >
              <span>{item.label}</span>
              {activeStep > item.step && <CheckCircle2 size={13} className="text-emerald-700" />}
            </div>
          ))}

          {/* XP Pill */}
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-mono font-bold">
            <Zap size={13} className="fill-amber-500 text-amber-500" />
            <span>{t("expressTour.xpEarned", "+50 XP за крок!")}</span>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* ══════════════════════════════════════════════════════════════
            SCENE 1: BACKEND («Оживи прилад»)
           ══════════════════════════════════════════════════════════════ */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Teacher Pacing & Leading Card */}
            <div className="rounded-3xl bg-white border-2 border-[#C86D32]/40 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F5EDE6] border border-[#C86D32]/40 text-[#C86D32] flex items-center justify-center shrink-0 shadow-2xs">
                <Cpu size={26} className="text-[#C86D32]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C86D32]/15 text-[#C86D32] uppercase">
                    🎓 КРОК 1: БЕКЕНД & ЛОГІКА СИСТЕМ
                  </span>
                </div>
                <p className="text-sm font-display font-medium text-[#1E2227]/80">
                  <strong className="text-[#1E2227]">Підстройка:</strong>{" "}
                  {t(
                    "expressTour.step1.pacing",
                    "Бекенд — це просто з'єднання команд. Сигнал іде від пульта до екрана."
                  )}
                </p>
                <p className="text-sm font-display font-bold text-[#C86D32]">
                  <strong>Ведення:</strong>{" "}
                  {t(
                    "expressTour.step1.leading",
                    "Клікни на синій провід живлення та з'єднай його з екраном, потім натисни кнопку пульта."
                  )}
                </p>
              </div>
            </div>

            {/* Interactive Stage */}
            <div className="rounded-3xl bg-gradient-to-b from-[#1E2227] to-[#12161A] p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-[#1E2227]/30">
              <div className="absolute inset-0 bg-notebook-grid opacity-10 pointer-events-none" />

              {/* 1. Virtual IR Remote Control */}
              <div className="w-48 sm:w-56 p-5 rounded-3xl bg-[#23272E] border-2 border-white/10 shadow-2xl flex flex-col items-center gap-4 relative">
                {/* IR Diode */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border border-white/20 transition-all ${
                      isTvPowered
                        ? "bg-cyan-400 shadow-[0_0_15px_#22d3ee]"
                        : "bg-red-500/50"
                    }`}
                  />
                  <span className="text-[9px] font-mono text-white/40 mt-1 uppercase tracking-widest">
                    IR TRANSMITTER
                  </span>
                </div>

                {/* Big Power Button */}
                <div className="relative py-2">
                  <button
                    type="button"
                    id="btn-remote-power"
                    onClick={handleTogglePower}
                    className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white transition-all transform active:scale-90 cursor-pointer shadow-lg ${
                      isWireConnected
                        ? "bg-rose-600 hover:bg-rose-500 ring-4 ring-rose-500/30 animate-pulse"
                        : "bg-rose-900/60 hover:bg-rose-800 text-white/50"
                    }`}
                    title={t("expressTour.step1.btnPower", "Увімкнути")}
                  >
                    <Power size={26} strokeWidth={2.5} />
                  </button>

                  {isWireConnected && !isTvPowered && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rose-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                      ↑ ТИСНИ СЮДИ
                    </div>
                  )}
                </div>

                <div className="text-center font-mono text-[10px] text-white/50 pt-2">
                  <span>VIRTUAL REMOTE v1.0</span>
                </div>
              </div>

              {/* 2. Interactive Connecting Power Cable */}
              <div className="flex-1 flex flex-col items-center justify-center relative w-full py-4">
                <button
                  type="button"
                  id="btn-connect-wire"
                  onClick={handleConnectWire}
                  className={`group relative p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${
                    isWireConnected
                      ? "bg-blue-950/60 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      : "bg-blue-500/10 border-blue-400/80 hover:bg-blue-500/20 hover:border-blue-400 animate-bounce"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 animate-ping" />
                    <span className="font-mono font-bold text-xs sm:text-sm text-blue-300">
                      {isWireConnected
                        ? `⚡ ${t("expressTour.step1.wireConnected", "Ланцюг живлення замкнено!")}`
                        : `🔌 ${t("expressTour.step1.wireHint", "Клікни на синій провід для з'єднання")}`}
                    </span>
                  </div>

                  {/* SVG Wire Line */}
                  <svg width="180" height="24" className="overflow-visible">
                    <path
                      d="M 10 12 C 50 2, 130 22, 170 12"
                      fill="none"
                      stroke={isWireConnected ? "#3B82F6" : "#60A5FA"}
                      strokeWidth={isWireConnected ? "5" : "3"}
                      strokeDasharray={isWireConnected ? "none" : "6,6"}
                      className={isWireConnected ? "drop-shadow-[0_0_8px_#3b82f6]" : ""}
                    />
                  </svg>
                </button>
              </div>

              {/* 3. Retro CRT Kinescope */}
              <div className="w-64 sm:w-72 p-5 rounded-3xl bg-[#1A1D20] border-2 border-white/15 shadow-2xl flex flex-col items-center gap-3">
                <div className="flex items-center justify-between w-full px-1">
                  <div className="flex items-center gap-1.5">
                    <Tv size={14} className="text-white/60" />
                    <span className="font-mono text-[10px] text-white/60 font-bold">CRT KINESCOPE</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isTvPowered
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {isTvPowered ? "● 200 OK" : "● STANDBY"}
                  </span>
                </div>

                {/* CRT Screen Tube */}
                <div
                  className={`w-full h-36 rounded-2xl border-2 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden transition-all duration-500 ${
                    isTvPowered
                      ? "bg-[#0B2518] border-emerald-500/70 shadow-[0_0_35px_rgba(16,185,129,0.3)] text-emerald-400"
                      : "bg-[#0D1013] border-white/10 text-white/30"
                  }`}
                >
                  {isTvPowered ? (
                    <div className="space-y-1.5 z-10 animate-in zoom-in-95 duration-300">
                      <div className="text-xs font-mono font-black tracking-wider text-emerald-300 animate-pulse">
                        HELLO WORLD!
                      </div>
                      <div className="text-[11px] font-mono font-bold text-emerald-400">
                        {t("expressTour.step1.tvActive", "200 OK • SIGNAL DETECTED")}
                      </div>
                      <div className="text-[9px] font-mono text-emerald-500/80">
                        BACKEND BUS CONNECTED
                      </div>
                    </div>
                  ) : (
                    <div className="font-mono text-xs text-white/40">
                      {t("expressTour.step1.tvOff", "Живлення вимкнено")}
                    </div>
                  )}

                  {/* Scanline simulation */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
                </div>
              </div>
            </div>

            {/* Bottom Victory & Advance bar */}
            {isTvPowered && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Sparkles size={20} className="text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm sm:text-base text-emerald-950">
                      {t("expressTour.step1.successBadge", "+50 XP нараховано! Перший контур ожив!")}
                    </h4>
                    <p className="text-xs text-emerald-800/80">
                      Бекенд відправив сигнал по ланцюгу живлення, і прилад успішно запустився.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-next-step-2"
                  onClick={() => {
                    audioFx.playRelayClick();
                    setActiveStep(2);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-mono font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span>{t("expressTour.step1.nextBtn", "До кроку 2: ШІ ➔")}</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SCENE 2: ARTIFICIAL INTELLIGENCE («Смисловий радар»)
           ══════════════════════════════════════════════════════════════ */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Teacher Pacing & Leading Card */}
            <div className="rounded-3xl bg-white border-2 border-[#1E3A8A]/40 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-[#1E3A8A]/30 text-[#1E3A8A] flex items-center justify-center shrink-0 shadow-2xs">
                <Bot size={26} className="text-[#1E3A8A]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1E3A8A]/15 text-[#1E3A8A] uppercase">
                    🎓 КРОК 2: ШТУЧНИЙ ІНТЕЛЕКТ & СЕНСИ
                  </span>
                </div>
                <p className="text-sm font-display font-medium text-[#1E2227]/80">
                  <strong className="text-[#1E2227]">Підстройка:</strong>{" "}
                  {t(
                    "expressTour.step2.pacing",
                    "ШІ розуміє сенс, вимірюючи відстань між поняттями у векторному просторі."
                  )}
                </p>
                <p className="text-sm font-display font-bold text-[#1E3A8A]">
                  <strong>Ведення:</strong>{" "}
                  {t(
                    "expressTour.step2.leading",
                    "Натисни кнопку 'Аналізувати запит: Хочу перекусити'."
                  )}
                </p>
              </div>
            </div>

            {/* Interactive 2D Semantic Radar Field */}
            <div className="rounded-3xl bg-gradient-to-b from-[#0F172A] to-[#090D16] p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center border-2 border-[#1E3A8A]/40">
              <div className="w-full max-w-lg aspect-square relative flex items-center justify-center">
                {/* Radar Background Circles */}
                <div className="absolute inset-0 rounded-full border border-blue-500/20" />
                <div className="absolute inset-8 rounded-full border border-blue-500/20" />
                <div className="absolute inset-20 rounded-full border border-blue-500/25" />
                <div className="absolute inset-32 rounded-full border border-blue-500/30" />

                {/* Radar Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-blue-500/25 pointer-events-none" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-blue-500/25 pointer-events-none" />

                {/* Rotating Sweep Beam */}
                <div
                  className={`absolute inset-0 rounded-full origin-center pointer-events-none transition-all ${
                    isRadarScanning ? "animate-spin duration-700" : ""
                  }`}
                  style={{
                    background: isRadarScanning
                      ? "conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.4) 60deg, transparent 65deg)"
                      : "none",
                  }}
                />

                {/* Center Node (User Query) */}
                <div className="relative z-20 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white shadow-[0_0_20px_#3b82f6] flex items-center justify-center">
                    <Radar size={20} className="text-white animate-spin duration-3000" />
                  </div>
                  <div className="mt-2 px-3 py-1 rounded-xl bg-blue-950/90 border border-blue-400/80 text-blue-200 font-mono font-bold text-xs shadow-md whitespace-nowrap">
                    {t("expressTour.step2.queryText", "Запит: «Хочу перекусити»")}
                  </div>
                </div>

                {/* Node 1: Піца (Relevant) */}
                <div className="absolute top-12 right-14 z-20 flex flex-col items-center transition-all duration-500">
                  <div
                    className={`px-3 py-1.5 rounded-xl border-2 font-mono font-bold text-xs transition-all flex items-center gap-1.5 shadow-md ${
                      isRadarAnalyzed
                        ? "bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110"
                        : "bg-slate-900 border-blue-400/30 text-white/80"
                    }`}
                  >
                    <span>🍕</span>
                    <span>{t("expressTour.step2.pizza", "Піца")}</span>
                    {isRadarAnalyzed && (
                      <span className="text-[10px] bg-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-300">
                        98%
                      </span>
                    )}
                  </div>
                </div>

                {/* Node 2: Бургер (Relevant) */}
                <div className="absolute top-28 right-8 z-20 flex flex-col items-center transition-all duration-500">
                  <div
                    className={`px-3 py-1.5 rounded-xl border-2 font-mono font-bold text-xs transition-all flex items-center gap-1.5 shadow-md ${
                      isRadarAnalyzed
                        ? "bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110"
                        : "bg-slate-900 border-blue-400/30 text-white/80"
                    }`}
                  >
                    <span>🍔</span>
                    <span>{t("expressTour.step2.burger", "Бургер")}</span>
                    {isRadarAnalyzed && (
                      <span className="text-[10px] bg-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-300">
                        96%
                      </span>
                    )}
                  </div>
                </div>

                {/* Node 3: Галактика (Irrelevant) */}
                <div
                  className={`absolute bottom-16 left-12 z-20 flex flex-col items-center transition-opacity duration-500 ${
                    isRadarAnalyzed ? "opacity-25" : "opacity-80"
                  }`}
                >
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 font-mono font-bold text-xs text-white/60 flex items-center gap-1.5">
                    <span>🌌</span>
                    <span>{t("expressTour.step2.galaxy", "Галактика")}</span>
                  </div>
                </div>

                {/* Node 4: Двигун (Irrelevant) */}
                <div
                  className={`absolute top-16 left-12 z-20 flex flex-col items-center transition-opacity duration-500 ${
                    isRadarAnalyzed ? "opacity-25" : "opacity-80"
                  }`}
                >
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 font-mono font-bold text-xs text-white/60 flex items-center gap-1.5">
                    <span>⚙️</span>
                    <span>{t("expressTour.step2.engine", "Двигун")}</span>
                  </div>
                </div>

                {/* Vector connection laser rays when analyzed */}
                {isRadarAnalyzed && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
                    <line
                      x1="50%"
                      y1="50%"
                      x2="78%"
                      y2="20%"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeDasharray="4,4"
                      className="animate-pulse"
                    />
                    <line
                      x1="50%"
                      y1="50%"
                      x2="84%"
                      y2="34%"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeDasharray="4,4"
                      className="animate-pulse"
                    />
                  </svg>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4 z-20">
                {!isRadarAnalyzed ? (
                  <button
                    type="button"
                    id="btn-analyze-radar"
                    onClick={handleAnalyzeRadar}
                    disabled={isRadarScanning}
                    className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-mono font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Radar size={18} className={isRadarScanning ? "animate-spin" : ""} />
                    <span>
                      {isRadarScanning
                        ? t("expressTour.step2.analyzing", "Сканування смислового простору...")
                        : t("expressTour.step2.analyzeBtn", "⚡ Аналізувати запит: «Хочу перекусити»")}
                    </span>
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{t("expressTour.step2.matchBadge", "Збіг 98% (Семантичний зв'язок: Їжа)")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Victory banner */}
            {isRadarAnalyzed && (
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border-2 border-blue-400 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <Sparkles size={20} className="text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm sm:text-base text-blue-950">
                      +50 XP нараховано! Смисловий вектор знайдено!
                    </h4>
                    <p className="text-xs text-blue-900/80">
                      {t(
                        "expressTour.step2.insight",
                        "RAG & Embeddings: ШІ шукає не букви, а математичну близькість сенсів!"
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-next-step-3"
                  onClick={() => {
                    audioFx.playRelayClick();
                    setActiveStep(3);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-mono font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span>{t("expressTour.step2.nextBtn", "До кроку 3: Кібербезпека ➔")}</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SCENE 3: CYBERSECURITY («Мережевий щит»)
           ══════════════════════════════════════════════════════════════ */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Teacher Pacing & Leading Card */}
            <div className="rounded-3xl bg-white border-2 border-emerald-600/40 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-600/30 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
                <Shield size={26} className="text-emerald-700" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 uppercase">
                    🎓 КРОК 3: КІБЕРБЕЗПЕКА & ЗАХИСТ СЕРВЕРА
                  </span>
                </div>
                <p className="text-sm font-display font-medium text-[#1E2227]/80">
                  <strong className="text-[#1E2227]">Підстройка:</strong>{" "}
                  {t(
                    "expressTour.step3.pacing",
                    "Спеціаліст із безпеки бачить небезпечні пакети в загальному потоці."
                  )}
                </p>
                <p className="text-sm font-display font-bold text-emerald-800">
                  <strong>Ведення:</strong>{" "}
                  {t(
                    "expressTour.step3.leading",
                    "Клікни на червоний пакет та натисни 'Заблокувати IP'."
                  )}
                </p>
              </div>
            </div>

            {/* Interactive Network Stream & Server Shield */}
            <div className="rounded-3xl bg-gradient-to-b from-[#111827] to-[#0A0E17] p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-emerald-600/40">
              <div className="absolute inset-0 bg-notebook-grid opacity-10 pointer-events-none" />

              {/* Traffic Stream Column */}
              <div className="flex-1 w-full space-y-3 z-10">
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/50 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>TRAFFIC FLOW MONITOR (WIRESHARK LIVE)</span>
                </div>

                {/* Packet 1: Normal */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/80">{t("expressTour.step3.packetGet", "GET /api/catalog (200 OK)")}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">✓ SAFE</span>
                </div>

                {/* Packet 2: Normal */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/80">{t("expressTour.step3.packetPost", "POST /auth/token (Valid)")}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">✓ SAFE</span>
                </div>

                {/* Packet 3: ATTACK PACKET (Interactive) */}
                <button
                  type="button"
                  id="btn-select-attack-packet"
                  onClick={handleSelectAttackPacket}
                  disabled={isFirewallBlocked}
                  className={`w-full p-3.5 rounded-xl border-2 flex items-center justify-between text-xs font-mono font-bold transition-all cursor-pointer text-left ${
                    isFirewallBlocked
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                      : isAttackPacketSelected
                      ? "bg-rose-950/90 border-rose-500 text-rose-200 ring-4 ring-rose-500/40 shadow-lg"
                      : "bg-rose-900/40 hover:bg-rose-900/60 border-rose-500/80 text-rose-300 animate-pulse"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className={isFirewallBlocked ? "text-emerald-400" : "text-rose-400"} />
                    <span>
                      {isFirewallBlocked
                        ? "IP 198.51.100.42 [BLOCKED BY FIREWALL]"
                        : t("expressTour.step3.packetAttack", "АТАКА! SYN Flood [198.51.100.42]")}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isFirewallBlocked
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-rose-500 text-white animate-bounce"
                    }`}
                  >
                    {isFirewallBlocked ? "✓ NEUTRALIZED" : "🔴 КЛІКНИ СЮДИ!"}
                  </span>
                </button>

                {/* Packet 4: Normal */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/80">{t("expressTour.step3.packetPing", "Ping keep-alive")}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">✓ SAFE</span>
                </div>
              </div>

              {/* Firewall & Server Column */}
              <div className="w-full md:w-72 flex flex-col items-center gap-4 z-10">
                {/* Firewall Shield Status */}
                <div
                  className={`w-full p-5 rounded-2xl border-2 text-center transition-all ${
                    isFirewallBlocked
                      ? "bg-emerald-950/80 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)]"
                      : isAttackPacketSelected
                      ? "bg-rose-950/80 border-rose-500 animate-pulse"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    {isFirewallBlocked ? (
                      <ShieldCheck size={36} className="text-emerald-400 animate-bounce" />
                    ) : (
                      <ShieldAlert size={36} className={isAttackPacketSelected ? "text-rose-400" : "text-white/40"} />
                    )}
                  </div>

                  <div className="font-display font-bold text-sm">
                    {isFirewallBlocked
                      ? "FIREWALL: АТАКУ ВІДБИТО"
                      : isAttackPacketSelected
                      ? t("expressTour.step3.targetAlert", "⚠️ ВИЯВЛЕНО ШКІДЛИВИЙ ТРАФІК")
                      : "FIREWALL: МОНІТОРИНГ"}
                  </div>

                  <p className="text-[11px] font-mono text-white/60 mt-1">
                    {isFirewallBlocked
                      ? "Правило DROP 198.51.100.42 застосовано."
                      : isAttackPacketSelected
                      ? t(
                          "expressTour.step3.targetDesc",
                          "Ботнет намагається перевантажити чергу запитів прод-сервера."
                        )
                      : "Очікування вибору підозрілого пакета."}
                  </p>

                  {/* Firewall Action Button */}
                  {isAttackPacketSelected && !isFirewallBlocked && (
                    <button
                      type="button"
                      id="btn-block-ip"
                      onClick={handleBlockIp}
                      className="mt-4 w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs shadow-lg shadow-rose-900/50 flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-bounce"
                    >
                      <Shield size={15} />
                      <span>{t("expressTour.step3.blockBtn", "🛡️ Заблокувати IP (Firewall Shield)")}</span>
                    </button>
                  )}
                </div>

                {/* Production Server Icon */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-white/70">
                  <Server size={16} className={isFirewallBlocked ? "text-emerald-400" : "text-white/60"} />
                  <span>PRODUCTION SERVER (SLA: 100%)</span>
                </div>
              </div>
            </div>

            {/* Victory banner */}
            {isFirewallBlocked && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Sparkles size={20} className="text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm sm:text-base text-emerald-950">
                      {t("expressTour.step3.neutralizedBadge", "🛡️ АТАКУ НЕЙТРАЛІЗОВАНО! IP 198.51.100.42 заблоковано")}
                    </h4>
                    <p className="text-xs text-emerald-800/80">
                      Всі 3 мікросцени успішно пройдено! Час визначитися з кар'єрним напрямком.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-finish-tour"
                  onClick={() => {
                    audioFx.playRelayClick();
                    setActiveStep(4);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-mono font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span>{t("expressTour.step3.finishTourBtn", "Завершити тест-драйв: Обрати професію ➔")}</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SCENE 4: FINALE / CAREER SELECTION
           ══════════════════════════════════════════════════════════════ */}
        {activeStep === 4 && (
          <div className="space-y-6 animate-in zoom-in-95 duration-400 text-center">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold">
                <Sparkles size={14} className="text-emerald-600" />
                <span>{t("expressTour.finale.badge", "ТЕСТ-ДРАЙВ ЗАВЕРШЕНО • 3 З 3 ОПАНОВАНО")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1E2227] tracking-tight">
                {t("expressTour.finale.title", "Тест-драйв пройдено! Що викликало найбільше азарту?")}
              </h2>
              <p className="text-xs sm:text-sm text-[#1E2227]/75 max-w-2xl mx-auto leading-relaxed">
                {t(
                  "expressTour.finale.subtitle",
                  "Твій вибір налаштує навчальний тренажер і відкриє профільні станції. Ти завжди зможеш змінити напрямок в один клік."
                )}
              </p>
            </div>

            {/* 3 Career Choices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left pt-2">
              {/* Choice 1: Backend */}
              <div className="p-6 rounded-3xl bg-white border-2 border-[#1E2227]/15 hover:border-[#C86D32] hover:shadow-lg transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5EDE6] border border-[#C86D32]/30 text-[#C86D32] flex items-center justify-center">
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-[#1E2227]">
                      {t("expressTour.finale.backendTitle", "Будувати логіку систем (Backend)")}
                    </h3>
                    <p className="text-xs text-[#1E2227]/70 mt-1 leading-relaxed">
                      {t(
                        "expressTour.finale.backendDesc",
                        "C# / Go • Архітектура, бази даних, API та стійкість сервісів"
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    id="btn-choose-backend-finale"
                    onClick={() => handleSelectTrack("backend")}
                    className="w-full py-3 rounded-xl bg-[#C86D32] hover:bg-[#B35E28] active:scale-95 text-white font-mono font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>{t("expressTour.finale.backendBtn", "Обрати Backend ➔")}</span>
                  </button>
                </div>
              </div>

              {/* Choice 2: AI */}
              <div className="p-6 rounded-3xl bg-white border-2 border-[#1E2227]/15 hover:border-blue-600 hover:shadow-lg transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-500/30 text-blue-600 flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-[#1E2227]">
                      {t("expressTour.finale.aiTitle", "Навчати та поєднувати ШІ (AI)")}
                    </h3>
                    <p className="text-xs text-[#1E2227]/70 mt-1 leading-relaxed">
                      {t(
                        "expressTour.finale.aiDesc",
                        "Python • Векторні бази, RAG, агентні графи та нейромережі"
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    id="btn-choose-ai-finale"
                    onClick={() => handleSelectTrack("ai")}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-mono font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>{t("expressTour.finale.aiBtn", "Обрати AI & MLOps ➔")}</span>
                  </button>
                </div>
              </div>

              {/* Choice 3: Cybersecurity */}
              <div className="p-6 rounded-3xl bg-white border-2 border-[#1E2227]/15 hover:border-emerald-600 hover:shadow-lg transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-600/30 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-[#1E2227]">
                      {t("expressTour.finale.cyberTitle", "Захищати дані від атак (Cybersecurity)")}
                    </h3>
                    <p className="text-xs text-[#1E2227]/70 mt-1 leading-relaxed">
                      {t(
                        "expressTour.finale.cyberDesc",
                        "Linux / SIEM • Аналіз загроз, аудит пакетів та відбиття атак"
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    id="btn-choose-cyber-finale"
                    onClick={() => handleSelectTrack("security")}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-mono font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>{t("expressTour.finale.cyberBtn", "Обрати Cybersecurity ➔")}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Explorer general button */}
            <div className="pt-3">
              <button
                type="button"
                id="btn-choose-explorer-finale"
                onClick={() => handleSelectTrack("explorer")}
                className="px-6 py-2.5 rounded-xl border border-[#1E2227]/20 bg-white hover:bg-[#FAF8F2] text-xs font-mono font-bold text-[#1E2227]/80 hover:text-[#1E2227] transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95 shadow-paper-xs"
              >
                <Compass size={15} />
                <span>{t("expressTour.finale.allTracksBtn", "🧭 Мені сподобалося все! (Explorer Mode)")}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
