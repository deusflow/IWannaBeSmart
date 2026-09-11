/**
 * @file apps/web/src/components/workbench/WorkshopHubScreen.tsx
 * @description Workshop Station Hub screen with Engineer Dossier Bar and Station Showcase Cards
 */

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Lock,
  ArrowRight,
  Trophy,
  Award,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { audioFx } from "../../utils/audioFx";
import { FINTECH_TASKS, CODING_TASKS } from "@iw/sim-engine";

export const WorkshopHubScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    xp,
    completedCodingTasks,
    taskMasteryStars,
    setCurrentStationId,
    setCurrentView,
    setStationVictoryModalOpen,
    setPosVictoryModalOpen,
  } = useWorkbenchStore();

  const [isDossierExpanded, setIsDossierExpanded] = useState<boolean>(false);

  // TV module stats (13 tasks * 3 stars = 39 max stars)
  const maxTvStars = CODING_TASKS.length * 3;
  const totalTvStars = useMemo(() => {
    return CODING_TASKS.reduce((sum, task) => sum + (taskMasteryStars[task.id] || 0), 0);
  }, [taskMasteryStars]);
  const isTvFullyMastered = totalTvStars >= maxTvStars;
  const isTvEligibleForCert = CODING_TASKS.every(
    (task) => (taskMasteryStars[task.id] || 0) >= 1 || completedCodingTasks[task.id]
  );
  const isTvCompleted = isTvFullyMastered || isTvEligibleForCert;

  // POS module stats (6 tasks * 3 stars = 18 max stars)
  const totalPosStars = useMemo(() => {
    return FINTECH_TASKS.reduce((sum, task) => sum + (taskMasteryStars[task.id] || 0), 0);
  }, [taskMasteryStars]);
  const isPosFullyMastered = totalPosStars >= 18;
  const isPosEligibleForCert = FINTECH_TASKS.every(
    (task) => (taskMasteryStars[task.id] || 0) >= 1 || completedCodingTasks[task.id]
  );

  // Total stars across platform (TV 39 ★ + POS 18 ★ = 57 ★)
  const totalStars = totalTvStars + totalPosStars;
  const maxPlatformStars = CODING_TASKS.length * 3 + FINTECH_TASKS.length * 3;

  // Station 3 unlock condition (200+ XP or both modules finished)
  const isStation3Unlocked = xp >= 200 || (isTvCompleted && isPosEligibleForCert);
  const station3XpTarget = 200;
  const station3ProgressPercent = isStation3Unlocked
    ? 100
    : Math.min(100, Math.round((xp / station3XpTarget) * 100));

  // Pattern mastery detection
  const patterns = useMemo(() => {
    return [
      {
        id: "state-machine",
        name: "State Machine",
        unlocked: Boolean(
          completedCodingTasks["task-2-branching"] ||
          (taskMasteryStars["task-2-branching"] || 0) >= 1 ||
          completedCodingTasks["task-pos-pin-lockout"] ||
          (taskMasteryStars["task-pos-pin-lockout"] || 0) >= 1
        ),
      },
      {
        id: "guard-clauses",
        name: "Guard Clauses",
        unlocked: Boolean(
          completedCodingTasks["task-boundary-guard"] ||
          (taskMasteryStars["task-boundary-guard"] || 0) >= 1 ||
          completedCodingTasks["task-pos-guard-clause"] ||
          (taskMasteryStars["task-pos-guard-clause"] || 0) >= 1
        ),
      },
      {
        id: "polymorphism",
        name: "Polymorphism",
        unlocked: Boolean(
          completedCodingTasks["task-interface-polymorphism"] ||
          (taskMasteryStars["task-interface-polymorphism"] || 0) >= 1 ||
          completedCodingTasks["task-pos-interface-polymorphism"] ||
          (taskMasteryStars["task-pos-interface-polymorphism"] || 0) >= 1
        ),
      },
      {
        id: "dependency-injection",
        name: "Dependency Injection",
        unlocked: Boolean(
          completedCodingTasks["task-di-container"] ||
          (taskMasteryStars["task-di-container"] || 0) >= 1 ||
          completedCodingTasks["task-pos-dependency-injection"] ||
          (taskMasteryStars["task-pos-dependency-injection"] || 0) >= 1
        ),
      },
      {
        id: "open-closed",
        name: "Open-Closed Principle",
        unlocked: Boolean(
          completedCodingTasks["task-command-registry"] ||
          (taskMasteryStars["task-command-registry"] || 0) >= 1
        ),
      },
    ];
  }, [completedCodingTasks, taskMasteryStars]);

  const handleEnterStation = (stationId: string) => {
    audioFx.playRelayClick();
    setCurrentStationId(stationId);
    setCurrentView("STATION");
  };

  return (
    <div className="w-full flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 select-none">
      {/* ── Blueprint Hub Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1D20]/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#1A1D20]/10 border border-[#1A1D20]/20 text-[#1A1D20] text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5">
            <Cpu size={12} className="text-[#1A1D20]/70" />
            <span>WORKBENCH HUB v2.0 • ENGINEERING WORKSHOP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1A1D20] tracking-tight">
            {t("hub.title", "Інженерний Хаб верстака")}
          </h1>
          <p className="text-xs sm:text-sm font-balsamiq text-[#1A1D20]/70 max-w-2xl mt-0.5">
            {t(
              "hub.subtitle",
              "Оберіть прилад для тренування архітектурних патернів, логіки та м'язової пам'яті коду"
            )}
          </p>
        </div>

        {/* Global XP & Stars Quick Counter */}
        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/25 shadow-paper-xs">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-600/40 flex items-center justify-center text-amber-800">
              <Award size={16} />
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase font-bold text-[#1A1D20]/60 leading-none">
                {t("hub.totalXp", "Загальний досвід")}
              </div>
              <div className="font-display font-extrabold text-sm text-[#1A1D20] flex items-center gap-1">
                <span>{xp}</span>
                <span className="text-[10px] font-mono text-amber-800 font-bold">XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/25 shadow-paper-xs">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-600/40 flex items-center justify-center text-amber-500">
              <span className="text-sm font-bold">★</span>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase font-bold text-[#1A1D20]/60 leading-none">
                {t("hub.totalStars", "Зірки майстерності")}
              </div>
              <div className="font-display font-extrabold text-sm text-[#1A1D20]">
                {totalStars} / {maxPlatformStars}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Global Engineer Dossier Bar (Панель статистики інженера) with progressive disclosure ── */}
      <div className="rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/25 shadow-paper-sm overflow-hidden transition-all duration-300">
        <div className="p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 bg-[#E4DDD0] border-b border-[#1A1D20]/15">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-800 shrink-0" />
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-[#1A1D20]">
              {t("hub.dossierTitle", "Досьє інженера")}
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[#1A1D20]/15 font-mono text-[10px] font-bold text-emerald-800">
              {patterns.filter((p) => p.unlocked).length} / {patterns.length} {t("hub.patternsShort", "Патернів")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[11px] font-mono text-[#1A1D20]/70">
              {t("hub.unlockProgress", "Прогрес")}:{" "}
              <span className="font-bold text-[#1A1D20]">{xp} / 200 XP</span>
            </div>

            <button
              onClick={() => {
                audioFx.playRelayClick();
                setIsDossierExpanded((p) => !p);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#1A1D20]/20 bg-[#FAF8F2] hover:bg-white text-[11px] font-mono font-bold text-[#1A1D20] transition-all cursor-pointer shadow-paper-xs"
              title={isDossierExpanded ? t("common.collapse", "Згорнути досьє") : t("common.details", "Розгорнути досьє")}
            >
              <span>{isDossierExpanded ? t("common.collapse", "Згорнути") : t("common.details", "Деталі")}</span>
              {isDossierExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>

        {/* Milestone Progress Bar (Always visible slim indicator) */}
        <div className="px-4 sm:px-5 py-2">
          <div className="w-full h-2 rounded-full bg-[#DFD7C5] border border-[#1A1D20]/15 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-[#1A1D20] transition-all duration-500 ease-out"
              style={{ width: `${station3ProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Mastered Architectural Patterns (Expandable details) */}
        {isDossierExpanded && (
          <div className="px-4 sm:px-5 pb-4 pt-1 space-y-2 border-t border-[#1A1D20]/10 animate-in fade-in">
            <div className="text-[10px] font-mono font-bold uppercase text-[#1A1D20]/60">
              {t("hub.masteredPatterns", "Освоєні архітектурні патерни")}:
            </div>
            <div className="flex flex-wrap gap-2">
              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-colors ${
                    pattern.unlocked
                      ? "bg-[#FAF8F2] border-emerald-600/40 text-emerald-900 shadow-2xs"
                      : "bg-[#DFD7C5]/50 border-[#1A1D20]/15 text-[#1A1D20]/40"
                  }`}
                >
                  {pattern.unlocked ? (
                    <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A1D20]/30 shrink-0" />
                  )}
                  <span>{pattern.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Station Showcase Cards Grid (3 Stations) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* ── Station 01: TV Station ── */}
        <div className="flex flex-col justify-between p-5 rounded-3xl bg-[#FAF8F2] border-2 border-[#1A1D20]/25 hover:border-[#1A1D20]/50 transition-all shadow-paper-sm hover:shadow-paper-md space-y-4">
          <div className="space-y-3">
            {/* Badge & Status */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-[#1A1D20]/10 border border-[#1A1D20]/20 text-[#1A1D20]">
                {t("hub.stations.tv.code", "Модуль 1")} • 01
              </span>
              <span
                className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${
                  isTvFullyMastered
                    ? "bg-amber-500/15 border-amber-600/30 text-amber-900"
                    : isTvCompleted
                    ? "bg-emerald-500/15 border-emerald-600/30 text-emerald-900"
                    : "bg-blue-500/15 border-blue-600/30 text-blue-900"
                }`}
              >
                {isTvFullyMastered
                  ? `${t("hub.stationCompleted", "ЗАВЕРШЕНО")} (${maxTvStars}/${maxTvStars} ★)`
                  : isTvCompleted
                  ? `${t("hub.stationCompleted", "ЗАВЕРШЕНО")} (${totalTvStars}/${maxTvStars} ★)`
                  : `${t("hub.stationAvailable", "ДОСТУПНО")} (${totalTvStars}/${maxTvStars} ★)`}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h3 className="font-display font-bold text-lg text-[#1A1D20]">
                {t("hub.stations.tv.title", "Станція 01: Телевізійна станція")}
              </h3>
              <p className="text-xs font-balsamiq text-[#1A1D20]/70 mt-0.5 leading-relaxed">
                {t(
                  "hub.stations.tv.subtitle",
                  "Фундаментальні патерни, змінні, інкапсуляція та диспетчеризація команд"
                )}
              </p>
            </div>

            {/* Blueprint Illustration: CRT TV + Remote */}
            <div className="p-4 rounded-2xl bg-[#EFEAE1] border border-[#1A1D20]/15 flex items-center justify-center py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-notebook-grid opacity-40 pointer-events-none" />
              <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="text-[#1A1D20]">
                {/* Antennas */}
                <line x1="45" y1="20" x2="30" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="55" y1="20" x2="70" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                {/* TV Body */}
                <rect x="20" y="20" width="80" height="60" rx="6" stroke="currentColor" strokeWidth="2" fill="#FAF8F2" />
                {/* Screen */}
                <rect x="26" y="26" width="50" height="48" rx="4" stroke="currentColor" strokeWidth="1.5" fill="#1A1D20" />
                <rect x="30" y="30" width="42" height="40" rx="2" fill="#2A3036" />
                <path d="M 36 50 Q 51 40 66 50" stroke="#4ADE80" strokeWidth="1.5" fill="none" />
                {/* Knobs */}
                <circle cx="88" cy="35" r="4" stroke="currentColor" strokeWidth="1.5" fill="#EFEAE1" />
                <circle cx="88" cy="48" r="4" stroke="currentColor" strokeWidth="1.5" fill="#EFEAE1" />
                <line x1="84" y1="62" x2="92" y2="62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="84" y1="68" x2="92" y2="68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                {/* Remote Control */}
                <rect x="120" y="15" width="30" height="70" rx="4" stroke="currentColor" strokeWidth="1.8" fill="#FAF8F2" />
                <circle cx="135" cy="12" r="2.5" fill="#EF4444" />
                <circle cx="135" cy="25" r="3.5" stroke="currentColor" strokeWidth="1.2" fill="#EF4444" />
                <rect x="125" y="35" width="20" height="4" rx="1" fill="#1A1D20" />
                <rect x="125" y="43" width="20" height="4" rx="1" fill="#1A1D20" />
                <rect x="125" y="51" width="20" height="4" rx="1" fill="#1A1D20" />
                <circle cx="135" cy="68" r="7" stroke="currentColor" strokeWidth="1.2" fill="#EFEAE1" />
                {/* Infrared Wave */}
                <path d="M 115 15 C 110 18, 110 22, 115 25" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
                <path d="M 110 12 C 103 17, 103 23, 110 28" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
              </svg>
            </div>

            {/* Specs & Task Progress */}
            <div className="flex items-center justify-between text-xs font-mono text-[#1A1D20]/80">
              <span>{t("hub.stations.tv.specs", "13 завдань • Smart TV • C# / Go")}</span>
              <span className="font-bold">{totalTvStars}/{maxTvStars} ★</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleEnterStation("tv")}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#1A1D20] hover:bg-black text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-sm"
            >
              <span>{t("hub.enterStation", "Увійти на станцію")}</span>
              <ArrowRight size={14} />
            </button>

            {isTvEligibleForCert && (
              <button
                onClick={() => {
                  audioFx.playSuccessFanfare();
                  setStationVictoryModalOpen(true);
                }}
                className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-600/40 text-amber-800 transition-colors cursor-pointer"
                title={t("hub.viewTvCertTooltip", "Переглянути матрицю навичок та сертифікат")}
              >
                <Trophy size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ── Station 02: Fintech POS Terminal ── */}
        <div className="flex flex-col justify-between p-5 rounded-3xl bg-[#FAF8F2] border-2 border-[#1A1D20]/25 hover:border-[#1A1D20]/50 transition-all shadow-paper-sm hover:shadow-paper-md space-y-4">
          <div className="space-y-3">
            {/* Badge & Status */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-[#1A1D20]/10 border border-[#1A1D20]/20 text-[#1A1D20]">
                {t("hub.stations.pos.code", "Модуль 2")} • 02
              </span>
              <span
                className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${
                  isPosFullyMastered
                    ? "bg-amber-500/15 border-amber-600/30 text-amber-900"
                    : "bg-emerald-500/15 border-emerald-600/30 text-emerald-900"
                }`}
              >
                {isPosFullyMastered
                  ? `${t("hub.stationCompleted", "ЗАВЕРШЕНО")} (18/18 ★)`
                  : `${t("hub.stationAvailable", "ДОСТУПНО")} (${totalPosStars}/18 ★)`}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h3 className="font-display font-bold text-lg text-[#1A1D20]">
                {t("hub.stations.pos.title", "Станція 02: Фінтех POS-термінал")}
              </h3>
              <p className="text-xs font-balsamiq text-[#1A1D20]/70 mt-0.5 leading-relaxed">
                {t(
                  "hub.stations.pos.subtitle",
                  "Фінансова безпека, Guard Clauses, поліморфізм шлюзів та Dependency Injection"
                )}
              </p>
            </div>

            {/* Blueprint Illustration: POS Terminal + Thermal Receipt */}
            <div className="p-4 rounded-2xl bg-[#EFEAE1] border border-[#1A1D20]/15 flex items-center justify-center py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-notebook-grid opacity-40 pointer-events-none" />
              <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="text-[#1A1D20]">
                {/* Thermal Receipt sticking out */}
                <path d="M 45 15 L 75 15 L 75 0 L 45 0 Z" fill="#FAF8F2" stroke="currentColor" strokeWidth="1.2" />
                <line x1="48" y1="5" x2="72" y2="5" stroke="#1A1D20" strokeWidth="1" strokeDasharray="1.5 1" />
                <line x1="48" y1="9" x2="65" y2="9" stroke="#1A1D20" strokeWidth="1" strokeDasharray="1.5 1" />
                {/* POS Main Body */}
                <rect x="35" y="15" width="50" height="70" rx="5" stroke="currentColor" strokeWidth="2" fill="#FAF8F2" />
                {/* LCD Display */}
                <rect x="40" y="20" width="40" height="22" rx="3" fill="#1A1D20" stroke="currentColor" strokeWidth="1" />
                <rect x="42" y="22" width="36" height="18" fill="#1F2428" />
                <text x="44" y="32" fill="#34D399" fontSize="6" fontFamily="monospace" fontWeight="bold">$ 135.00</text>
                <text x="44" y="38" fill="#38BDF8" fontSize="4" fontFamily="monospace">DANKORT OK</text>
                {/* Keypad Grid */}
                <circle cx="45" cy="50" r="2.2" fill="#1A1D20" />
                <circle cx="53" cy="50" r="2.2" fill="#1A1D20" />
                <circle cx="61" cy="50" r="2.2" fill="#1A1D20" />
                <circle cx="45" cy="58" r="2.2" fill="#1A1D20" />
                <circle cx="53" cy="58" r="2.2" fill="#1A1D20" />
                <circle cx="61" cy="58" r="2.2" fill="#1A1D20" />
                <circle cx="45" cy="66" r="2.2" fill="#EF4444" />
                <circle cx="53" cy="66" r="2.2" fill="#1A1D20" />
                <circle cx="61" cy="66" r="2.2" fill="#10B981" />
                {/* Chip card insertion slot */}
                <line x1="42" y1="78" x2="65" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                {/* Contactless Credit Card */}
                <rect x="110" y="25" width="48" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" fill="#FAF8F2" />
                <rect x="115" y="33" width="10" height="8" rx="1" fill="#D97706" />
                <line x1="110" y1="46" x2="158" y2="46" stroke="#1A1D20" strokeWidth="4" />
                {/* NFC Radio Waves */}
                <path d="M 95 30 C 100 35, 100 45, 95 50" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 90 26 C 97 33, 97 47, 90 54" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Specs & Star Progress */}
            <div className="flex items-center justify-between text-xs font-mono text-[#1A1D20]/80">
              <span>{t("hub.stations.pos.specs", "6 завдань • Code Gym (3-Star) • C# / Go")}</span>
              <span className="font-bold text-amber-700">{totalPosStars}/18 ★</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleEnterStation("pos")}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#1A1D20] hover:bg-black text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-sm"
            >
              <span>{t("hub.enterStation", "Увійти на станцію")}</span>
              <ArrowRight size={14} />
            </button>

            {isPosEligibleForCert && (
              <button
                onClick={() => {
                  audioFx.playSuccessFanfare();
                  setPosVictoryModalOpen(true);
                }}
                className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-600/40 text-amber-800 transition-colors cursor-pointer"
                title={t("hub.viewFintechCertTooltip", "Переглянути комерційний сертифікат фінтех-інженера")}
              >
                <Trophy size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ── Station 03: IoT Garage Gate (Locked) ── */}
        <div className="flex flex-col justify-between p-5 rounded-3xl bg-[#EBE5D8]/70 border-2 border-dashed border-[#1A1D20]/30 space-y-4 relative overflow-hidden">
          <div className="space-y-3">
            {/* Badge & Status */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-[#1A1D20]/10 border border-[#1A1D20]/20 text-[#1A1D20]/60">
                {t("hub.stations.iot.code", "Модуль 3")} • 03
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-stone-500/15 border border-stone-600/30 text-stone-700">
                <Lock size={10} />
                <span>{t("hub.stationLocked", "ЗАБЛОКОВАНО")}</span>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h3 className="font-display font-bold text-lg text-[#1A1D20]/70 flex items-center gap-2">
                <span>{t("hub.stations.iot.title", "Станція 03: IoT Гаражні ворота")}</span>
              </h3>
              <p className="text-xs font-balsamiq text-[#1A1D20]/60 mt-0.5 leading-relaxed">
                {t(
                  "hub.stations.iot.subtitle",
                  "Асинхронний EventBus, брокери повідомлень, черги подій та захисні сенсори"
                )}
              </p>
            </div>

            {/* Blueprint Illustration: Servo + Sensor + Laser */}
            <div className="p-4 rounded-2xl bg-[#DFD7C5]/50 border border-[#1A1D20]/15 flex items-center justify-center py-6 relative overflow-hidden opacity-60">
              <div className="absolute inset-0 bg-notebook-grid opacity-30 pointer-events-none" />
              <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="text-[#1A1D20]">
                {/* Gate Posts */}
                <line x1="30" y1="10" x2="30" y2="80" stroke="currentColor" strokeWidth="3" />
                <line x1="150" y1="10" x2="150" y2="80" stroke="currentColor" strokeWidth="3" />
                <line x1="25" y1="10" x2="155" y2="10" stroke="currentColor" strokeWidth="3" />
                {/* Gate Bars */}
                <line x1="30" y1="30" x2="150" y2="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
                <line x1="30" y1="50" x2="150" y2="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
                {/* Servo Motor Box */}
                <rect x="135" y="12" width="22" height="18" rx="2" fill="#FAF8F2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="146" cy="21" r="4" stroke="currentColor" strokeWidth="1.2" fill="#D97706" />
                {/* Laser Obstacle Sensor */}
                <rect x="25" y="65" width="10" height="10" rx="2" fill="#1A1D20" />
                <rect x="145" y="65" width="10" height="10" rx="2" fill="#1A1D20" />
                <line x1="35" y1="70" x2="145" y2="70" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="65" y="66" fill="#EF4444" fontSize="6" fontFamily="monospace">IR OBSTACLE SENSOR</text>
              </svg>
            </div>

            {/* Lock Criteria & Progress */}
            <div className="p-3 rounded-xl bg-[#DFD7C5]/60 border border-[#1A1D20]/15 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#1A1D20]/70">
                <span>{t("hub.unlockCondition", "Потрібно 200+ XP або Модулі 1 та 2")}</span>
                <span className="font-bold">{isStation3Unlocked ? "200/200 XP ✓" : `${xp}/200 XP`}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1A1D20]/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-600 transition-all duration-300"
                  style={{ width: `${station3ProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action / Future Badge */}
          <div className="pt-2">
            <div className="w-full py-2 px-3 rounded-xl bg-[#DFD7C5]/70 border border-[#1A1D20]/20 text-[#1A1D20]/60 font-mono font-bold text-[11px] text-center flex items-center justify-center gap-1.5">
              <Lock size={12} />
              <span>{t("hub.stations.iot.badge", "НЕЗАБАРОМ: EventBus & Async I/O")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
