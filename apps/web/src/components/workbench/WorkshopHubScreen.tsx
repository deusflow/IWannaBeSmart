/**
 * @file apps/web/src/components/workbench/WorkshopHubScreen.tsx
 * @description Workshop Station Hub screen with Engineer Dossier Bar and Station Showcase Cards.
 *              Decomposed into modular subcomponents (EngineerDossierBar, StationShowcaseCard, StationBlueprintIllustrations).
 */

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Award,
  Cpu,
} from "lucide-react";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { audioFx } from "../../utils/audioFx";
import {
  FINTECH_TASKS,
  CODING_TASKS,
  API_FORGE_TASKS,
  GIT_TASKS,
  BANDIT_TASKS,
  VERTEX_TASKS,
  FDE_TASKS,
  TOTAL_MAX_STARS,
} from "@iw/sim-engine";
import { UserNavBadge } from "../auth/UserNavBadge";
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
    }))
  );

  // Helper for computing module completion & stars
  const getStationStats = (tasks: Array<{ id: string }>, starsPerTask: number) => {
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
  };

  // 1. Smart TV Station (4 stars per task: TRACE, COPY, SPEED, BUGFIX)
  const tvStats = useMemo(() => getStationStats(CODING_TASKS, 4), [taskMasteryStars, completedCodingTasks]);

  // 2. Fintech POS Terminal (4 stars per task)
  const posStats = useMemo(() => getStationStats(FINTECH_TASKS, 4), [taskMasteryStars, completedCodingTasks]);

  // 3. API Forge (4 stars per task)
  const apiStats = useMemo(() => getStationStats(API_FORGE_TASKS, 4), [taskMasteryStars, completedCodingTasks]);

  // 4. Git Time Machine (4 stars per task)
  const gitStats = useMemo(() => getStationStats(GIT_TASKS, 4), [taskMasteryStars, completedCodingTasks]);

  // 5. Cyber Bandit Lab (4 stars per task)
  const banditStats = useMemo(() => getStationStats(BANDIT_TASKS, 4), [taskMasteryStars, completedCodingTasks]);

  // 6. Vertex AI Architect (4 stars per task)
  const vertexStats = useMemo(() => getStationStats(VERTEX_TASKS, 4), [taskMasteryStars, completedCodingTasks]);

  // 7. Field AI Deployer (4 stars per task)
  const fdeStats = useMemo(() => getStationStats(FDE_TASKS, 4), [taskMasteryStars, completedCodingTasks]);

  // Total stars across platform
  const totalStars =
    tvStats.current +
    posStats.current +
    apiStats.current +
    gitStats.current +
    banditStats.current +
    vertexStats.current +
    fdeStats.current;

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
          <p className="text-xs sm:text-sm font-sans text-[#1A1D20]/70 max-w-2xl mt-0.5">
            {t(
              "hub.subtitle",
              "Оберіть прилад для тренування архітектурних патернів, логіки та м'язової пам'яті коду"
            )}
          </p>
        </div>

        {/* Global XP & Stars Quick Counter */}
        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <UserNavBadge />
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
                {totalStars} / {TOTAL_MAX_STARS}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Global Engineer Dossier Bar ── */}
      <EngineerDossierBar
        xp={xp}
        patterns={patterns}
        station3ProgressPercent={station3ProgressPercent}
      />

      {/* ── Station Showcase Cards Grid (6 Stations) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-5">
        {/* Station 01: TV Station */}
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
          isRecommended={!tvStats.isCompleted || xp < 100}
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

        {/* Station 02: Fintech POS Terminal */}
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

        {/* Station 03: IoT Garage Gate (Locked Preview) */}
        <StationShowcaseCard
          stationId="iot"
          codeLabel={`${t("hub.stations.iot.code", "Модуль 3")} • 03`}
          title={t("hub.stations.iot.title", "Станція 03: IoT Гаражні ворота")}
          subtitle={t(
            "hub.stations.iot.subtitle",
            "Асинхронний EventBus, брокери повідомлень, черги подій та захисні сенсори"
          )}
          blueprint={<IotBlueprintSvg />}
          specs="EventBus • Async I/O • C# / Go"
          currentStars={0}
          maxStars={0}
          statusType="locked"
          lockCriteria={{
            conditionText: t("hub.unlockCondition", "Потрібно 200+ XP або Модулі 1 та 2"),
            progressText: isStation3Unlocked ? "200/200 XP ✓" : `${xp}/200 XP`,
            percent: station3ProgressPercent,
            badgeText: t("hub.stations.iot.badge", "НЕЗАБАРОМ: EventBus & Async I/O"),
          }}
        />

        {/* Station 04: API Forge */}
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

        {/* Station 05: Git Time Machine */}
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

        {/* Station 06: Cyber Bandit Lab */}
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

        {/* Station 07: Vertex AI Architect */}
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

        {/* Station 08: Field AI Deployer (FDE) */}
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
      </div>
    </div>
  );
};
