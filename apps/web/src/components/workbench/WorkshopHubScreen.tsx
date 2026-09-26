/**
 * @file apps/web/src/components/workbench/WorkshopHubScreen.tsx
 * @description Workshop Station Hub screen with Engineer Dossier Bar and Station Showcase Cards.
 *              Decomposed into modular subcomponents (EngineerDossierBar, StationShowcaseCard, StationBlueprintIllustrations).
 */

import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Cpu,
  Compass,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { audioFx } from "../../utils/audioFx";
import { isStationInTrack } from "./career/careerTracks";
import { getTrackCompletionStats } from "./career/trackManifest";
import {
  FINTECH_TASKS,
  CODING_TASKS,
  API_FORGE_TASKS,
  GIT_TASKS,
  BANDIT_TASKS,
  VERTEX_TASKS,
  FDE_TASKS,
  RAG_TASKS,
  CYBER_TASKS,
  TOTAL_MAX_STARS,
} from "@iw/sim-engine";
import { useShallow } from "zustand/react/shallow";
import { EngineerDossierBar, PatternItem } from "./hub/EngineerDossierBar";
import { StationShowcaseCard } from "./hub/StationShowcaseCard";
import {
  TvBlueprintSvg,
  PosBlueprintSvg,
  IotBlueprintSvg,
  ApiForgeBlueprintSvg,
  GitBlueprintSvg,
  BanditBlueprintSvg,
  VertexBlueprintSvg,
  FdeBlueprintSvg,
} from "./hub/StationBlueprintIllustrations";

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
    setApiVictoryModalOpen,
    setGitVictoryModalOpen,
    setBanditVictoryModalOpen,
    setVertexVictoryModalOpen,
    setFdeVictoryModalOpen,
    setRagVictoryModalOpen,
    setCyberVictoryModalOpen,
    userTrack,
    setIsCareerModalOpen,
  } = useWorkbenchStore(
    useShallow((s) => ({
      xp: s.xp,
      completedCodingTasks: s.completedCodingTasks,
      taskMasteryStars: s.taskMasteryStars,
      setCurrentStationId: s.setCurrentStationId,
      setCurrentView: s.setCurrentView,
      setStationVictoryModalOpen: s.setStationVictoryModalOpen,
      setPosVictoryModalOpen: s.setPosVictoryModalOpen,
      setApiVictoryModalOpen: s.setApiVictoryModalOpen,
      setGitVictoryModalOpen: s.setGitVictoryModalOpen,
      setBanditVictoryModalOpen: s.setBanditVictoryModalOpen,
      setVertexVictoryModalOpen: s.setVertexVictoryModalOpen,
      setFdeVictoryModalOpen: s.setFdeVictoryModalOpen,
      setRagVictoryModalOpen: s.setRagVictoryModalOpen,
      setCyberVictoryModalOpen: s.setCyberVictoryModalOpen,
      userTrack: s.userTrack,
      setIsCareerModalOpen: s.setIsCareerModalOpen,
    }))
  );

  type HubTab = "my_track" | "backend" | "ai" | "security" | "all";
  const [selectedTab, setSelectedTab] = useState<HubTab>("all");

  const isStationVisible = useCallback(
    (stationId: string): boolean => {
      if (selectedTab === "all") return true;
      if (selectedTab === "my_track") {
        if (!userTrack || userTrack === "explorer") return true;
        return isStationInTrack(stationId, userTrack);
      }
      if (selectedTab === "backend") {
        return isStationInTrack(stationId, "backend");
      }
      if (selectedTab === "ai") {
        return isStationInTrack(stationId, "ai");
      }
      if (selectedTab === "security") {
        return isStationInTrack(stationId, "security");
      }
      return true;
    },
    [selectedTab, userTrack]
  );

  const hubTabs = useMemo(
    () => [
      {
        id: "my_track" as const,
        label: t("hub.tabs.myTrack", "🌟 Мій трек"),
        count: !userTrack
          ? 10
          : userTrack === "explorer"
          ? 9
          : userTrack === "backend"
          ? 4
          : userTrack === "ai"
          ? 3
          : 3,
      },
      {
        id: "backend" as const,
        label: t("hub.tabs.backend", "🖥️ Backend"),
        count: 4,
      },
      {
        id: "ai" as const,
        label: t("hub.tabs.ai", "🤖 AI & MLOps"),
        count: 3,
      },
      {
        id: "security" as const,
        label: t("hub.tabs.security", "🛡️ Безпека"),
        count: 3,
      },
      {
        id: "all" as const,
        label: `${t("hub.tabs.all", "🧭 Всі станції")} (10)`,
        count: 10,
      },
    ],
    [userTrack, t]
  );

  // Helper for computing module completion & stars
  const getStationStats = useCallback(
    (tasks: Array<{ id: string }>, starsPerTask: number) => {
      const max = tasks.length * starsPerTask;
      const current = tasks.reduce((sum, task) => sum + (taskMasteryStars[task.id] || 0), 0);
      const isMastered = current >= max;
      const isEligible = tasks.every(
        (task) => (taskMasteryStars[task.id] || 0) >= 1 || completedCodingTasks[task.id]
      );
      const isCompleted = isMastered || isEligible;
      const statusType: "mastered" | "completed" | "available" = isMastered
        ? "mastered"
        : isCompleted
        ? "completed"
        : "available";
      return { max, current, isMastered, isEligible, isCompleted, statusType };
    },
    [taskMasteryStars, completedCodingTasks]
  );

  // 1. Smart TV Station (4 stars per task: TRACE, COPY, SPEED, BUGFIX)
  const tvStats = useMemo(() => getStationStats(CODING_TASKS, 4), [getStationStats]);

  // 2. Fintech POS Terminal (4 stars per task)
  const posStats = useMemo(() => getStationStats(FINTECH_TASKS, 4), [getStationStats]);

  // 3. API Forge (4 stars per task)
  const apiStats = useMemo(() => getStationStats(API_FORGE_TASKS, 4), [getStationStats]);

  // 4. Git Time Machine (4 stars per task)
  const gitStats = useMemo(() => getStationStats(GIT_TASKS, 4), [getStationStats]);

  // 5. Cyber Bandit Lab (4 stars per task)
  const banditStats = useMemo(() => getStationStats(BANDIT_TASKS, 4), [getStationStats]);

  // 6. Vertex AI Architect (4 stars per task)
  const vertexStats = useMemo(() => getStationStats(VERTEX_TASKS, 4), [getStationStats]);

  // 7. Field AI Deployer (4 stars per task)
  const fdeStats = useMemo(() => getStationStats(FDE_TASKS, 4), [getStationStats]);

  // 8. IBM RAG & Agentic AI (4 stars per task)
  const ragStats = useMemo(() => getStationStats(RAG_TASKS, 4), [getStationStats]);

  // 9. Google Cybersecurity & SOC Analyst (4 stars per task)
  const cyberStats = useMemo(() => getStationStats(CYBER_TASKS, 4), [getStationStats]);

  // Total stars across platform
  const totalStars =
    tvStats.current +
    posStats.current +
    apiStats.current +
    gitStats.current +
    banditStats.current +
    vertexStats.current +
    fdeStats.current +
    ragStats.current +
    cyberStats.current;

  // Active track completion statistics (Data-driven Questline)
  const isStationCompleted = useCallback(
    (stationId: string) => {
      switch (stationId) {
        case "tv":
          return tvStats.isCompleted;
        case "pos":
          return posStats.isCompleted;
        case "api":
          return apiStats.isCompleted;
        case "git":
          return gitStats.isCompleted;
        case "bandit":
          return banditStats.isCompleted;
        case "vertex":
          return vertexStats.isCompleted;
        case "fde":
          return fdeStats.isCompleted;
        case "rag":
          return ragStats.isCompleted;
        case "cyber":
          return cyberStats.isCompleted;
        default:
          return false;
      }
    },
    [
      tvStats.isCompleted,
      posStats.isCompleted,
      apiStats.isCompleted,
      gitStats.isCompleted,
      banditStats.isCompleted,
      vertexStats.isCompleted,
      fdeStats.isCompleted,
      ragStats.isCompleted,
      cyberStats.isCompleted,
    ]
  );

  const trackStats = useMemo(() => {
    return getTrackCompletionStats(userTrack, isStationCompleted);
  }, [userTrack, isStationCompleted]);

  // Station 3 unlock condition (200+ XP or both modules finished)
  const isStation3Unlocked = xp >= 200 || (tvStats.isCompleted && posStats.isEligible);
  const station3XpTarget = 200;
  const station3ProgressPercent = isStation3Unlocked
    ? 100
    : Math.min(100, Math.round((xp / station3XpTarget) * 100));

  // Architectural patterns mastery detection
  const patterns: PatternItem[] = useMemo(() => [
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
  ], [completedCodingTasks, taskMasteryStars]);

  const handleEnterStation = (stationId: string) => {
    audioFx.playRelayClick();
    setCurrentStationId(stationId);
    setCurrentView("STATION");
  };

  const getTrackCardProps = useCallback(
    (stationId: string) => {
      if (!userTrack) return {};
      if (userTrack === "explorer") {
        return {
          isTrackStation: true,
          trackBadgeText: t("career.explorerIntroBadge", "★ Ознайомчий рівень"),
        };
      }
      const inTrack = isStationInTrack(stationId, userTrack);
      if (inTrack) {
        return {
          isTrackStation: true,
          trackBadgeText: t("career.yourTrackBadge", "★ Твій трек"),
        };
      }
      return {
        isSecondaryStation: true,
      };
    },
    [userTrack, t]
  );

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
            {t("hub.title", "Інженерний Хаб")}
          </h1>
          <p className="text-xs sm:text-sm font-sans text-[#1A1D20]/70 max-w-2xl mt-0.5">
            {t(
              "hub.subtitle",
              "Оберіть прилад для тренування архітектурних патернів, логіки та м'язової пам'яті коду"
            )}
          </p>
        </div>

        {/* ── Engineering Telemetry (XP & Stars only) ── */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-auto shrink-0 select-none">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-[#1E2227]/15 shadow-xs shrink-0 whitespace-nowrap">
            <div className="w-6 h-6 rounded-lg bg-[#F5EDE6] border border-[#C86D32]/30 flex items-center justify-center text-[#C86D32] shrink-0">
              <Zap size={13} className="fill-[#C86D32] text-[#C86D32]" />
            </div>
            <div className="text-left leading-none">
              <div className="font-display font-bold text-xs sm:text-sm text-[#1E2227] whitespace-nowrap">
                XP: {xp}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-[#1E2227]/15 shadow-xs shrink-0 whitespace-nowrap">
            <div className="w-6 h-6 rounded-lg bg-[#F5EDE6] border border-[#C86D32]/30 flex items-center justify-center text-[#C86D32] shrink-0">
              <span className="text-xs font-bold leading-none text-amber-600">★</span>
            </div>
            <div className="text-left leading-none">
              <div className="font-display font-bold text-xs sm:text-sm text-[#1E2227] whitespace-nowrap">
                ★ {totalStars} / {TOTAL_MAX_STARS}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Career Focus Banner (Directly under Hub Header) ── */}
      {!userTrack ? (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-[#1E2227]/15 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="absolute inset-0 bg-notebook-grid opacity-20 pointer-events-none" />
          <div className="flex items-start sm:items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-[#F5EDE6] border border-[#C86D32]/30 flex items-center justify-center text-[#C86D32] shrink-0">
              <Compass size={22} className="text-[#C86D32]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F5EDE6] text-[#C86D32] border border-[#C86D32]/30 uppercase tracking-wider">
                  {t("career.careerFocusBadge", "Кар'єрний фокус інженера")}
                </span>
                <span className="text-[11px] font-mono font-medium text-[#3E7A5E]">
                  «{t("career.motto", "Неможливо програти, якщо це експеримент")}»
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold text-[#1E2227] tracking-tight">
                {t("career.onboardingModalTitle", "Обери свій напрямок в IT (Backend, AI, Cyber або Спробувати все)")}
              </h2>
              <p className="text-xs text-[#1E2227]/75 max-w-2xl leading-relaxed">
                {t(
                  "career.onboardingModalSubtitle",
                  "Інженерна гнучкість: кожен вибір розширює архітектурний кругозір, а напрямок можна адаптувати у будь-який момент в один клік."
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-hub-banner-choose-track"
            onClick={() => {
              audioFx.playRelayClick();
              setIsCareerModalOpen(true);
            }}
            className="relative z-10 px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-[#1E2227] hover:bg-black text-white shadow-xs flex items-center justify-center gap-2 transition-all transform active:scale-95 shrink-0 cursor-pointer self-start md:self-auto"
          >
            <span>{t("career.chooseTrackBtn", "Обрати трек 🧭")}</span>
          </button>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-[#1E2227]/15 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="absolute inset-0 bg-notebook-grid opacity-20 pointer-events-none" />
          <div className="flex items-start sm:items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-[#F5EDE6] border border-[#C86D32]/30 flex items-center justify-center text-[#C86D32] shrink-0">
              <Compass size={22} className="text-[#C86D32]" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F5EDE6] text-[#C86D32] border border-[#C86D32]/30 uppercase tracking-wider">
                  {t("career.careerFocusBadge", "Кар'єрний фокус інженера")}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1E2227]/5 text-[#1E2227] border border-[#1E2227]/15 uppercase">
                  {userTrack === "explorer"
                    ? `🧭 ${t("career.tracks.explorer.title", "Спробувати все (Explorer)")}`
                    : userTrack === "backend"
                    ? `🖥️ ${t("career.tracks.backend.title", "Backend & Distributed Systems")}`
                    : userTrack === "ai"
                    ? `🤖 ${t("career.tracks.ai.title", "AI & MLOps Architecture")}`
                    : userTrack === "security"
                    ? `🛡️ ${t("career.tracks.security.title", "Кібербезпека & SOC Analyst")}`
                    : t(`career.tracks.${userTrack}.title`, "Кар'єрний трек")}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3E7A5E]/10 text-[#3E7A5E] border border-[#3E7A5E]/30">
                  {t("career.trackProgressBadge", {
                    completed: trackStats.completedCount,
                    total: trackStats.totalCount,
                    percent: trackStats.percent,
                    defaultValue: `Пройдено ${trackStats.completedCount} з ${trackStats.totalCount} станцій фокусу (${trackStats.percent}%)`,
                  })}
                </span>
                <span className="text-[11px] font-mono font-medium text-[#3E7A5E]">
                  «{t("career.motto", "Неможливо програти, якщо це експеримент")}»
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-display font-bold text-[#1E2227] tracking-tight">
                {t(`career.tracks.${userTrack}.title`, "Кар'єрний трек")}
              </h2>
              <div className="text-xs text-[#1E2227]/75 max-w-2xl leading-relaxed">
                <span className="font-mono font-bold text-[10px] uppercase text-[#1E2227]/60 mr-1.5">
                  {t("career.targetRolesLabel", "Цільові вакансії:")}
                </span>
                <span>
                  {t(`career.tracks.${userTrack}.roles`, "Цільові вакансії інженера")}
                </span>
              </div>
              {/* Dynamic Track Progress Bar */}
              <div className="w-full max-w-md pt-1">
                <div className="w-full bg-[#1E2227]/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#3E7A5E] h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${trackStats.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            id="btn-hub-banner-change-track"
            onClick={() => {
              audioFx.playRelayClick();
              setIsCareerModalOpen(true);
            }}
            className="relative z-10 px-4 py-2 rounded-xl font-mono font-bold text-xs bg-white hover:bg-[#F0EDE6] text-[#1E2227] border border-[#1E2227]/20 shadow-xs flex items-center justify-center gap-2 transition-all transform active:scale-95 shrink-0 cursor-pointer self-start md:self-auto"
          >
            <span>{t("career.changeTrackBtn", "Змінити 🔄")}</span>
          </button>
        </div>
      )}

      {/* ── Global Engineer Dossier Bar ── */}
      <EngineerDossierBar
        xp={xp}
        patterns={patterns}
        station3ProgressPercent={station3ProgressPercent}
      />

      {/* ── 🚨 Incident War Room Emergency Industrial Console ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#24282D] border border-[#1E2227]/25 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Subtle Matte Drafting Grid */}
        <div className="absolute inset-0 bg-notebook-grid opacity-10 pointer-events-none" />

        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-[#2E343B] border border-[#1E2227]/40 flex items-center justify-center shrink-0">
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-[#D9822B] opacity-90 animate-pulse"></span>
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10.5px] font-mono font-bold bg-[#8E3B3B]/25 text-[#EBB5B5] border border-[#8E3B3B]/40 uppercase tracking-wider">
                {t("hub.warRoomBanner.badge", "SEV-1 On-Call SRE Simulator")}
              </span>
              <span className="text-[11px] font-mono font-medium text-[#E0A468] flex items-center gap-1">
                <span>+150 XP</span>
                <span className="text-[#F7F5F0]/60">
                  {t("hub.warRoomBanner.perResolution", "за кожну ліквідацію")}
                </span>
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-display font-bold text-[#F7F5F0] tracking-tight">
              {t("hub.warRoomBanner.title", "Incident War Room: Аварії на прод-системах")}
            </h2>

            <p className="text-xs text-[#F7F5F0]/75 max-w-2xl leading-relaxed">
              {t(
                "hub.warRoomBanner.desc",
                "5 критичних аварій у реальному часі (FinTech подвійні списання, RAG інʼєкції, SYN Flood DDoS, дрифт ML-момоделей). Звучить сирена, рахується збиток — накатіть хотфікс до порушення SLA."
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            audioFx.playWarRoomSiren();
            setCurrentView("WAR_ROOM");
          }}
          className="relative z-10 px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-[#C86D32] hover:bg-[#B35E28] text-white flex items-center justify-center gap-2 transition-all transform active:scale-95 shrink-0 cursor-pointer shadow-sm"
        >
          <span>{t("hub.warRoomBanner.enterBtn", "Увійти в War Room")}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* ── Interactive Track / Category Filter Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none scrollbar-none" role="tablist">
        {hubTabs.map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                audioFx.playKeyClick();
                setSelectedTab(tab.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-display text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 shrink-0 ${
                isActive
                  ? "bg-[#1E2227] text-white shadow-xs"
                  : "bg-white hover:bg-[#FDFBF7] border border-[#1E2227]/15 text-[#1E2227]/75 hover:text-[#1E2227]"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Station Showcase Cards Grid (Strict Order 01 -> 10) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {/* Station 01: TV Station */}
        {isStationVisible("tv") && (
          <StationShowcaseCard
            stationId="tv"
            codeLabel={`${t("hub.stations.tv.code", "Модуль 1")} • 01`}
            title={t("hub.stations.tv.title", "Станція 01: Телевізійна станція")}
            subtitle={t(
              "hub.stations.tv.subtitle",
              "Фундаментальні патерни, змінні, інкапсуляція та диспетчеризація команд"
            )}
            blueprint={<TvBlueprintSvg />}
            specs={t("hub.stations.tv.specs", `${CODING_TASKS.length} tasks • Smart TV • C# / Go`)}
            currentStars={tvStats.current}
            maxStars={tvStats.max}
            statusType={tvStats.statusType}
            {...getTrackCardProps("tv")}
            isRecommended={!userTrack ? (!tvStats.isCompleted || xp < 100) : false}
            beaconText={t("onboarding.beaconStart", "⚡ РЕКОМЕНДОВАНИЙ СТАРТ • 2 ХВ")}
            onEnter={() => handleEnterStation("tv")}
            onViewCert={
              tvStats.isEligible
                ? () => {
                    audioFx.playSuccessFanfare();
                    setStationVictoryModalOpen(true);
                  }
                : undefined
            }
            certTooltip={t("hub.viewTvCertTooltip", "Переглянути матрицю навичок та сертифікат")}
          />
        )}

        {/* Station 02: Fintech POS Terminal */}
        {isStationVisible("pos") && (
          <StationShowcaseCard
            stationId="pos"
            codeLabel={`${t("hub.stations.pos.code", "Модуль 2")} • 02`}
            title={t("hub.stations.pos.title", "Станція 02: Фінтех POS-термінал")}
            subtitle={t(
              "hub.stations.pos.subtitle",
              "Фінансова безпека, Guard Clauses, поліморфізм шлюзів та Dependency Injection"
            )}
            blueprint={<PosBlueprintSvg />}
            specs={t("hub.stations.pos.specs", `${FINTECH_TASKS.length} tasks • Code Gym (4-Star) • C# / Go`)}
            currentStars={posStats.current}
            maxStars={posStats.max}
            statusType={posStats.statusType}
            {...getTrackCardProps("pos")}
            starColorClass="text-amber-700"
            onEnter={() => handleEnterStation("pos")}
            onViewCert={
              posStats.isEligible
                ? () => {
                    audioFx.playSuccessFanfare();
                    setPosVictoryModalOpen(true);
                  }
                : undefined
            }
            certTooltip={t("hub.viewFintechCertTooltip", "Переглянути комерційний сертифікат фінтех-інженера")}
          />
        )}

        {/* Station 03: IoT Garage Gate (In Development / Roadmap) */}
        {isStationVisible("iot") && (
          <StationShowcaseCard
            stationId="iot"
            codeLabel={`${t("hub.stations.iot.code", "Модуль 3")} • 03`}
            title={t("hub.stations.iot.title", "Станція 03: IoT Гаражні ворота")}
            subtitle={t(
              "hub.stations.iot.subtitle",
              "Асинхронний EventBus, брокери повідомлень, черги подій та захисні сенсори"
            )}
            blueprint={<IotBlueprintSvg />}
            specs={t("hub.stations.iot.specs", "В розробці • Event-Driven Architecture • C# / Go")}
            currentStars={0}
            maxStars={0}
            statusType="roadmap"
            {...getTrackCardProps("iot")}
            lockCriteria={{
              conditionText: t("hub.roadmapStatus", "Статус модуля"),
              progressText: t("hub.stations.iot.releaseDate", "Реліз у 2 семестрі"),
              percent: 100,
              badgeText: t("hub.stations.iot.badge", "В розробці: Реліз у 2 семестрі"),
              isRoadmap: true,
            }}
          />
        )}

        {/* Station 04: API Forge */}
        {isStationVisible("api") && (
          <StationShowcaseCard
            stationId="api"
            codeLabel={`${t("hub.stations.api.code", "Модуль 4")} • 04`}
            title={t("hub.stations.api.title", "Станція 04: API Кузня")}
            subtitle={t(
              "hub.stations.api.subtitle",
              "Клієнт-серверний зв'язок, HTTP кабелі, DTO контракти, авторизація та 504 Retries"
            )}
            blueprint={<ApiForgeBlueprintSvg />}
            specs={t("hub.stations.api.specs", `${API_FORGE_TASKS.length} tasks • Code Gym (4-Star) • C# / Go`)}
            currentStars={apiStats.current}
            maxStars={apiStats.max}
            statusType={apiStats.statusType}
            {...getTrackCardProps("api")}
            accentBorderClass="hover:border-cyan-600/60"
            starColorClass="text-cyan-700"
            onEnter={() => handleEnterStation("api")}
            onViewCert={
              apiStats.isEligible
                ? () => {
                    audioFx.playSuccessFanfare();
                    setApiVictoryModalOpen(true);
                  }
                : undefined
            }
            certTooltip={t("hub.viewApiCertTooltip", "Переглянути сертифікат бекенд & API архітектора")}
          />
        )}

        {/* Station 05: Git Time Machine */}
        {isStationVisible("git") && (
          <StationShowcaseCard
            stationId="git"
            codeLabel={`${t("hub.stations.git.code", "Модуль 5")} • 05`}
            title={t("hub.stations.git.title", "Станція 05: Git Time Machine")}
            subtitle={t(
              "hub.stations.git.subtitle",
              "DAG дерево комітів, паралельні гілки, 3-Way злиття, вирішення конфліктів та rebase"
            )}
            blueprint={<GitBlueprintSvg />}
            specs={t("hub.stations.git.specs", `${GIT_TASKS.length} tasks • Code Gym (4-Star) • C# / Go`)}
            currentStars={gitStats.current}
            maxStars={gitStats.max}
            statusType={gitStats.statusType}
            {...getTrackCardProps("git")}
            accentBorderClass="hover:border-purple-600/60"
            starColorClass="text-purple-800"
            onEnter={() => handleEnterStation("git")}
            onViewCert={
              gitStats.isEligible
                ? () => {
                    audioFx.playSuccessFanfare();
                    setGitVictoryModalOpen(true);
                  }
                : undefined
            }
            certTooltip={t("hub.viewGitCertTooltip", "Переглянути сертифікат Git архітектора")}
          />
        )}

        {/* Station 06: Cyber Bandit Lab */}
        {isStationVisible("bandit") && (
          <StationShowcaseCard
            stationId="bandit"
            codeLabel={`${t("hub.stations.bandit.code", "Модуль 6")} • 06`}
            title={t("hub.stations.bandit.title", "Станція 06: Cyber Bandit Lab")}
            subtitle={t(
              "hub.stations.bandit.subtitle",
              "Етичний хакінг, перехоплення пакетів, підміна параметрів, SQL-ін'єкції та Rate Limiting"
            )}
            blueprint={<BanditBlueprintSvg />}
            specs={t("hub.stations.bandit.specs", `${BANDIT_TASKS.length} tasks • Code Gym (4-Star) • C# / Go`)}
            currentStars={banditStats.current}
            maxStars={banditStats.max}
            statusType={banditStats.statusType}
            {...getTrackCardProps("bandit")}
            accentBorderClass="hover:border-emerald-600/60"
            starColorClass="text-emerald-800"
            onEnter={() => handleEnterStation("bandit")}
            onViewCert={
              banditStats.isEligible
                ? () => {
                    audioFx.playSuccessFanfare();
                    setBanditVictoryModalOpen(true);
                  }
                : undefined
            }
            certTooltip={t("hub.viewBanditCertTooltip", "Переглянути сертифікат Cyber Defense архітектора")}
          />
        )}

        {/* Station 07: Vertex AI Architect */}
        {isStationVisible("vertex") && (
          <StationShowcaseCard
            stationId="vertex"
            codeLabel={`${t("hub.stations.vertex.code", "Модуль 7")} • 07`}
            title={t("hub.stations.vertex.title", "Станція 07: Vertex AI Architect")}
            subtitle={t(
              "hub.stations.vertex.subtitle",
              "Хмарний MLOps: GCS пайплайни, GPU інференс, VPC Peering та моніторинг дрейфу"
            )}
            blueprint={<VertexBlueprintSvg />}
            specs={t("hub.stations.vertex.specs", `${VERTEX_TASKS.length} tasks • Vertex AI & MLOps • Python / YAML`)}
            currentStars={vertexStats.current}
            maxStars={vertexStats.max}
            statusType={vertexStats.statusType}
            {...getTrackCardProps("vertex")}
            accentBorderClass="hover:border-blue-600/60"
            starColorClass="text-blue-800"
            onEnter={() => handleEnterStation("vertex")}
            onViewCert={
              vertexStats.isEligible
                ? () => {
                    audioFx.playSuccessFanfare();
                    setVertexVictoryModalOpen(true);
                  }
                : undefined
            }
            certTooltip={t("hub.viewVertexCertTooltip", "Переглянути сертифікат Vertex AI архітектора")}
          />
        )}

        {/* Station 08: Field AI Deployer (FDE) */}
        {isStationVisible("fde") && (
          <StationShowcaseCard
            stationId="fde"
            codeLabel={`${t("hub.stations.fde.code", "Модуль 8")} • 08`}
            title={t("hub.stations.fde.title", "Станція 08: Field AI Deployer (FDE)")}
            subtitle={t(
              "hub.stations.fde.subtitle",
              "Інтерв'ю стейкхолдерів, адаптація legacy API, агентні графи та регламенти передачі"
            )}
            blueprint={<FdeBlueprintSvg />}
            specs={t("hub.stations.fde.specs", `${FDE_TASKS.length} tasks • Applied AI • Python / TS`)}
            currentStars={fdeStats.current}
            maxStars={fdeStats.max}
            statusType={fdeStats.statusType}
            {...getTrackCardProps("fde")}
            accentBorderClass="hover:border-purple-600/60"
            starColorClass="text-purple-800"
            onEnter={() => handleEnterStation("fde")}
            onViewCert={
              fdeStats.isEligible
                ? () => {
                    audioFx.playSuccessFanfare();
                    setFdeVictoryModalOpen(true);
                  }
                : undefined
            }
            certTooltip={t("hub.viewFdeCertTooltip", "Переглянути сертифікат Field AI Deployer")}
          />
        )}

        {/* Station 09: IBM RAG & Agentic AI Track */}
        {isStationVisible("rag") && (
          <StationShowcaseCard
            stationId="rag"
            codeLabel={`${t("hub.stations.rag.code", "Модуль 9")} • 09`}
            title={t("hub.stations.rag.title", "Станція 09: IBM RAG & Agentic AI")}
            subtitle={t(
              "hub.stations.rag.subtitle",
              "Векторний пошук, Reciprocal Rank Fusion, ReAct агентні графи та RAGAS валідація"
            )}
            blueprint={<FdeBlueprintSvg />}
            specs={t("hub.stations.rag.specs", `${RAG_TASKS.length} tasks • IBM RAG & Agentic AI • Python / TS`)}
            currentStars={ragStats.current}
            maxStars={ragStats.max}
            statusType={ragStats.statusType}
            {...getTrackCardProps("rag")}
            accentBorderClass="hover:border-cyan-500/60"
            starColorClass="text-cyan-800"
            onEnter={() => handleEnterStation("rag")}
            onViewCert={
              ragStats.isEligible
                ? () => {
                    audioFx.playSuccessFanfare();
                    setRagVictoryModalOpen(true);
                  }
                : undefined
            }
            certTooltip={t("hub.viewRagCertTooltip", "Переглянути сертифікат IBM RAG & Agentic AI")}
          />
        )}

        {/* Station 10: Google Cybersecurity & SOC Analyst Track */}
        {isStationVisible("cyber") && (
          <StationShowcaseCard
            stationId="cyber"
            codeLabel={`${t("hub.stations.cyber.code", "Модуль 10")} • 10`}
            title={t("hub.stations.cyber.title", "Станція 10: Google Cybersecurity & SOC")}
            subtitle={t(
              "hub.stations.cyber.subtitle",
              "Chronicle SIEM, Web-Wireshark аналізатор пакетів, MITRE ATT&CK та NIST CSF"
            )}
            blueprint={<BanditBlueprintSvg />}
            specs={t("hub.stations.cyber.specs", `${CYBER_TASKS.length} tasks • Google Cybersecurity • Python / TS`)}
            currentStars={cyberStats.current}
            maxStars={cyberStats.max}
            statusType={cyberStats.statusType}
            {...getTrackCardProps("cyber")}
            accentBorderClass="hover:border-emerald-500/60"
            starColorClass="text-emerald-800"
            onEnter={() => handleEnterStation("cyber")}
            onViewCert={
              cyberStats.isEligible
                ? () => {
                    audioFx.playSuccessFanfare();
                    setCyberVictoryModalOpen(true);
                  }
                : undefined
            }
            certTooltip={t("hub.viewCyberCertTooltip", "Переглянути сертифікат Google Cybersecurity & SOC")}
          />
        )}
      </div>
    </div>
  );
};
