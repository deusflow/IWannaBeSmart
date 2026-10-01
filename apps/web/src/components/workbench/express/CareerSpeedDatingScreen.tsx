/**
 * @file apps/web/src/components/workbench/express/CareerSpeedDatingScreen.tsx
 * @description Career Speed-Dating Screen (~15 min taste-test for beginners).
 * Follows the didactic framework: Scene (1) -> I Do (2) -> We Do + Verify (3) -> You Do (4) -> Honest Routine (5).
 * Completely zero-hardcode, pure deterministic engine validation from @iw/sim-engine.
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Play,
  Clock,
  ChevronRight,
  Shield,
  Swords,
  Cpu,
} from "lucide-react";
import {
  ROLE_TASTER_REGISTRY,
  type RoleTasterDefinition,
  validateBackendWeDo,
  validateBackendYouDo,
  validateCyberWeDo,
  validateCyberYouDo,
  CYBER_WE_DO_LOGS,
  CYBER_YOU_DO_LOGS,
  validateGameDesignWeDo,
  validateGameDesignYouDo,
  type DuelParams,
  type DuelSimulationSummary,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../utils/audioFx";
import { ShopStand } from "./stands/ShopStand";
import { TrafficStand } from "./stands/TrafficStand";
import { DuelArenaStand } from "./stands/DuelArenaStand";
import type { CareerTrack } from "../../../store/types";

interface CareerSpeedDatingScreenProps {
  onClose: () => void;
}

interface RoleSessionTelemetry {
  timeSec: number;
  attempts: number;
  hintsUsedCount: number;
  solutionRevealed: boolean;
  passedIndependently: boolean;
  continueRating?: number; // 1-5
  boringRating?: number;   // 1-5
}

export const CareerSpeedDatingScreen: React.FC<CareerSpeedDatingScreenProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();
  const { setUserTrack, setCurrentStationId, setCurrentView } = useWorkbenchStore(
    useShallow((s) => ({
      setUserTrack: s.setUserTrack,
      setCurrentStationId: s.setCurrentStationId,
      setCurrentView: s.setCurrentView,
    }))
  );

  // ── Mode: 'CATALOG' | 'TASTING' | 'FINALE' ──
  const [screenMode, setScreenMode] = useState<"CATALOG" | "TASTING" | "FINALE">("CATALOG");

  // Selected roles queue
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [activeRoleIndex, setActiveRoleIndex] = useState<number>(0);

  // 5-step framework: 1: Scene | 2: I Do | 3: We Do | 4: You Do | 5: Routine
  const [tastingStep, setTastingStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Telemetry map per role id
  const [telemetry, setTelemetry] = useState<Record<string, RoleSessionTelemetry>>({});
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Active hints ladder state (level 0: none, 1, 2, 3)
  const [currentHintLevel, setCurrentHintLevel] = useState<number>(0);

  // ── Role Specific Interactive States ──
  // Backend
  const [backendCode, setBackendCode] = useState<string>("");
  const [backendBoundaryInputs, setBackendBoundaryInputs] = useState<number[]>([4, 5, 6]);
  const [backendWeDoAssertChecked, setBackendWeDoAssertChecked] = useState<boolean>(false);

  // Cyber
  const [cyberSelectedIp, setCyberSelectedIp] = useState<string>("");
  const [cyberBlockedIp, setCyberBlockedIp] = useState<string | null>(null);
  const [cyberIsFalsePositive, setCyberIsFalsePositive] = useState<boolean>(false);
  const [cyberWeDoVerified, setCyberWeDoVerified] = useState<boolean>(false);

  // Game Design
  const [gdArmor, setGdArmor] = useState<number>(0);
  const [gdParams, setGdParams] = useState<DuelParams>({
    bossDamage: 80,
    bossCooldownSec: 1.8,
    potionHeal: 20,
    potionCount: 1,
  });
  const [gdLastSim, setGdLastSim] = useState<DuelSimulationSummary | null>(null);

  // Validation output logs & status
  const [lastValidationLogs, setLastValidationLogs] = useState<string[]>([]);
  const [isStepPassed, setIsStepPassed] = useState<boolean>(false);

  // Timer interval for speed-dating
  useEffect(() => {
    if (screenMode !== "TASTING") return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [screenMode]);

  // Current active role definition
  const activeRole: RoleTasterDefinition | undefined = ROLE_TASTER_REGISTRY.find(
    (r) => r.id === selectedRoleIds[activeRoleIndex]
  );

  // Initialize or reset role state on switch
  const initRoleSession = (role: RoleTasterDefinition) => {
    setTastingStep(1);
    setIsStepPassed(false);
    setCurrentHintLevel(0);
    setLastValidationLogs([]);
    setTimerSeconds(0);

    if (role.id === "role-backend") {
      setBackendCode(role.youDoStep.initialCode);
      setBackendBoundaryInputs([4, 5, 6]);
      setBackendWeDoAssertChecked(false);
    } else if (role.id === "role-cyber") {
      setCyberSelectedIp("");
      setCyberBlockedIp(null);
      setCyberIsFalsePositive(false);
      setCyberWeDoVerified(false);
    } else if (role.id === "role-gamedesign") {
      setGdArmor(0);
      setGdParams({
        bossDamage: 80,
        bossCooldownSec: 1.8,
        potionHeal: 20,
        potionCount: 1,
      });
      setGdLastSim(null);
    }
  };

  // Toggle role in catalog (up to 3)
  const handleToggleCatalogRole = (roleId: string) => {
    setSelectedRoleIds((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, roleId];
    });
  };

  // "Don't know" button -> auto-select 3 contrasting roles
  const handleSelectContrastingRoles = () => {
    const defaultThree = ["role-backend", "role-cyber", "role-gamedesign"];
    setSelectedRoleIds(defaultThree);
  };

  // Start tasting session
  const handleStartTasting = () => {
    if (selectedRoleIds.length === 0) return;
    setActiveRoleIndex(0);
    const firstRole = ROLE_TASTER_REGISTRY.find((r) => r.id === selectedRoleIds[0]);
    if (firstRole) initRoleSession(firstRole);
    setScreenMode("TASTING");
    audioFx.playRelayClick();
  };

  // Record an attempt for current role
  const recordAttempt = () => {
    if (!activeRole) return;
    setTelemetry((prev) => {
      const current = prev[activeRole.id] || {
        timeSec: 0,
        attempts: 0,
        hintsUsedCount: 0,
        solutionRevealed: false,
        passedIndependently: true,
      };
      return {
        ...prev,
        [activeRole.id]: {
          ...current,
          attempts: current.attempts + 1,
        },
      };
    });
  };

  // Handle Hint Request
  const handleRequestHint = () => {
    if (!activeRole || currentHintLevel >= 3) return;
    const nextLevel = currentHintLevel + 1;
    setCurrentHintLevel(nextLevel);

    setTelemetry((prev) => {
      const current = prev[activeRole.id] || {
        timeSec: 0,
        attempts: 0,
        hintsUsedCount: 0,
        solutionRevealed: false,
        passedIndependently: true,
      };
      return {
        ...prev,
        [activeRole.id]: {
          ...current,
          hintsUsedCount: Math.max(current.hintsUsedCount, nextLevel),
          solutionRevealed: nextLevel === 3 ? true : current.solutionRevealed,
          passedIndependently: nextLevel === 3 ? false : current.passedIndependently,
        },
      };
    });

    // Auto-fill solution if level 3
    if (nextLevel === 3) {
      if (activeRole.id === "role-backend") {
        setBackendCode(activeRole.youDoStep.solutionCode);
        setBackendBoundaryInputs([4, 5, 6]);
      } else if (activeRole.id === "role-cyber") {
        setCyberSelectedIp(activeRole.youDoStep.solutionCode);
      } else if (activeRole.id === "role-gamedesign") {
        setGdParams({
          bossDamage: 40,
          bossCooldownSec: 1.8,
          potionHeal: 45,
          potionCount: 2,
        });
      }
    }
  };

  // ── Validation Handlers ──
  const handleValidateWeDo = () => {
    if (!activeRole) return;

    if (activeRole.id === "role-backend") {
      const res = validateBackendWeDo(activeRole.weDoStep.targetSnippet, backendWeDoAssertChecked);
      setLastValidationLogs(res.logs);
      if (res.passed) {
        setIsStepPassed(true);
        audioFx.playSuccessFanfare();
      } else {
        setIsStepPassed(false);
        audioFx.playErrorBuzz();
      }
    } else if (activeRole.id === "role-cyber") {
      const res = validateCyberWeDo(cyberSelectedIp, cyberWeDoVerified);
      setLastValidationLogs(res.logs);
      if (res.passed) {
        setIsStepPassed(true);
        setCyberBlockedIp(cyberSelectedIp);
        audioFx.playSuccessFanfare();
      } else {
        setIsStepPassed(false);
        audioFx.playErrorBuzz();
      }
    } else if (activeRole.id === "role-gamedesign") {
      const res = validateGameDesignWeDo(gdArmor, true);
      setLastValidationLogs(res.logs);
      if (res.passed) {
        setIsStepPassed(true);
        audioFx.playSuccessFanfare();
      } else {
        setIsStepPassed(false);
        audioFx.playErrorBuzz();
      }
    }
  };

  const handleValidateYouDo = () => {
    if (!activeRole) return;
    recordAttempt();

    if (activeRole.id === "role-backend") {
      const res = validateBackendYouDo(backendCode, backendBoundaryInputs);
      setLastValidationLogs(res.logs);
      if (res.passed) {
        setIsStepPassed(true);
        audioFx.playSuccessFanfare();
      } else {
        setIsStepPassed(false);
        audioFx.playErrorBuzz();
      }
    } else if (activeRole.id === "role-cyber") {
      const res = validateCyberYouDo(cyberSelectedIp);
      setLastValidationLogs(res.logs);
      setCyberBlockedIp(cyberSelectedIp);
      setCyberIsFalsePositive(res.isFalsePositive);

      if (res.passed) {
        setIsStepPassed(true);
        audioFx.playSuccessFanfare();
      } else {
        setIsStepPassed(false);
        audioFx.playErrorBuzz();
      }
    } else if (activeRole.id === "role-gamedesign") {
      const res = validateGameDesignYouDo(gdParams, [42, 99, 1337]);
      setGdLastSim(res);
      setLastValidationLogs(res.logs);
      if (res.passed) {
        setIsStepPassed(true);
        audioFx.playSuccessFanfare();
      } else {
        setIsStepPassed(false);
        audioFx.playErrorBuzz();
      }
    }
  };

  // Step Advancement
  const handleAdvanceStep = () => {
    if (tastingStep < 5) {
      const nextStep = (tastingStep + 1) as 1 | 2 | 3 | 4 | 5;
      setTastingStep(nextStep);
      setIsStepPassed(false);
      setLastValidationLogs([]);
      audioFx.playRelayClick();
    } else {
      // Step 5 completed -> update total elapsed time for this role
      if (activeRole) {
        setTelemetry((prev) => ({
          ...prev,
          [activeRole.id]: {
            ...(prev[activeRole.id] || {
              attempts: 1,
              hintsUsedCount: 0,
              solutionRevealed: false,
              passedIndependently: true,
            }),
            timeSec: timerSeconds,
          },
        }));
      }

      // Check if there are more roles in queue
      if (activeRoleIndex + 1 < selectedRoleIds.length) {
        const nextIdx = activeRoleIndex + 1;
        setActiveRoleIndex(nextIdx);
        const nextRole = ROLE_TASTER_REGISTRY.find((r) => r.id === selectedRoleIds[nextIdx]);
        if (nextRole) initRoleSession(nextRole);
      } else {
        // Finale screen
        setScreenMode("FINALE");
        audioFx.playSuccessFanfare();
      }
    }
  };

  // ═════════════════════════════════════════════════════════════════════
  // RENDER: CATALOG SCREEN
  // ═════════════════════════════════════════════════════════════════════
  if (screenMode === "CATALOG") {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1E2227] flex flex-col font-sans select-none p-4 sm:p-8">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#1E2227]/15">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#1E2227]/20 font-mono font-bold text-xs hover:bg-[#FAF8F2] active:scale-95 transition-all shadow-paper-xs"
          >
            <ArrowLeft size={14} className="text-[#C86D32]" />
            <span>{t("taster.exitToHub", "До верстака / Hub")}</span>
          </button>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#C86D32]/15 text-[#C86D32] border border-[#C86D32]/30 uppercase">
            {t("taster.badge", "CAREER SCOUT")}
          </span>
        </header>

        <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center py-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1E2227]">
              {t("taster.catalogTitle", "Обери до 3 професій для тест-драйву")}
            </h1>
            <p className="text-sm text-[#1E2227]/75 max-w-xl mx-auto">
              {t("taster.catalogSubtitle", "Спробуй ядро кожної ролі на реальних мікро-задачах за 15 хвилин.")}
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {ROLE_TASTER_REGISTRY.map((role) => {
              const isSelected = selectedRoleIds.includes(role.id);
              const categoryLabel =
                role.category === "build"
                  ? t("taster.categoryBuild", "Будуєш")
                  : role.category === "investigate"
                  ? t("taster.categoryInvestigate", "Шукаєш і захищаєш")
                  : t("taster.categoryBalance", "Налаштовуєш");

              return (
                <div
                  key={role.id}
                  onClick={() => handleToggleCatalogRole(role.id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? "bg-white border-[#C86D32] shadow-md ring-2 ring-[#C86D32]/20"
                      : "bg-white/70 border-[#1E2227]/15 hover:border-[#1E2227]/40 hover:bg-white"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FAF8F2] border border-[#1E2227]/15 text-[#1E2227]/70 uppercase">
                        {categoryLabel}
                      </span>
                      {isSelected && <CheckCircle2 size={18} className="text-[#C86D32]" />}
                    </div>

                    <div className="flex items-center gap-2.5">
                      {role.id === "role-backend" && <Cpu size={22} className="text-[#C86D32]" />}
                      {role.id === "role-cyber" && <Shield size={22} className="text-emerald-700" />}
                      {role.id === "role-gamedesign" && <Swords size={22} className="text-purple-700" />}
                      <h3 className="font-display font-bold text-sm text-[#1E2227]">
                        {t(role.roleTitleKey)}
                      </h3>
                    </div>

                    <p className="text-xs text-[#1E2227]/70 line-clamp-3">
                      {t(role.mentorIntroKey)}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#1E2227]/10 mt-3 text-[11px] font-mono">
                    <span className="text-[#1E2227]/50">~4,5 хв</span>
                    <span className={`font-bold ${isSelected ? "text-[#C86D32]" : "text-[#1E2227]/60"}`}>
                      {isSelected ? "Обрано" : "Обрати +"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1E2227]/15">
            <button
              type="button"
              onClick={handleSelectContrastingRoles}
              className="px-4 py-2.5 rounded-xl border border-[#1E2227]/25 bg-white hover:bg-[#FAF8F2] text-xs font-mono font-bold text-[#1E2227] transition-all cursor-pointer shadow-paper-xs"
            >
              {t("taster.dontKnowBtn", "Не знаю (Дати 3 контрастні ролі)")}
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#1E2227]/60">
                {t("taster.selectedCount", { count: selectedRoleIds.length })}
              </span>
              <button
                type="button"
                onClick={handleStartTasting}
                disabled={selectedRoleIds.length === 0}
                className="px-6 py-2.5 rounded-xl bg-[#C86D32] hover:bg-[#B35E28] active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("taster.startTastingBtn", "Розпочати Speed-Dating →")}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // RENDER: FINALE SCREEN
  // ═════════════════════════════════════════════════════════════════════
  if (screenMode === "FINALE") {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1E2227] flex flex-col font-sans select-none p-4 sm:p-8">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#1E2227]/15">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#1E2227]/20 font-mono font-bold text-xs hover:bg-[#FAF8F2] active:scale-95 transition-all shadow-paper-xs"
          >
            <ArrowLeft size={14} className="text-[#C86D32]" />
            <span>{t("taster.exitToHub", "До верстака / Hub")}</span>
          </button>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
            3 OF 3 COMPLETED
          </span>
        </header>

        <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center py-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1E2227]">
              {t("taster.finale.title", "Підсумки Career Speed-Dating")}
            </h1>
            <p className="text-sm text-[#1E2227]/75 max-w-xl mx-auto">
              {t("taster.finale.subtitle", "Об'єктивні сигнали та спостереження за твоєю роботою.")}
            </p>
          </div>

          {/* Results Summary per Role */}
          <div className="space-y-4">
            {selectedRoleIds.map((roleId) => {
              const rDef = ROLE_TASTER_REGISTRY.find((r) => r.id === roleId);
              const data = telemetry[roleId] || {
                timeSec: 45,
                attempts: 1,
                hintsUsedCount: 0,
                solutionRevealed: false,
                passedIndependently: true,
              };
              if (!rDef) return null;

              return (
                <div
                  key={roleId}
                  className="p-5 rounded-2xl bg-white border border-[#1E2227]/15 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1E2227]/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-[#1E2227]">
                        {t(rDef.roleTitleKey)}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          data.passedIndependently
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {data.passedIndependently
                          ? t("taster.solSelfBadge", "Пройдено самостійно")
                          : t("taster.solAssistedBadge", "Використано розв'язок")}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-[#1E2227]/70">
                      <span>{t("taster.finale.metricTime", "Час")}: <strong>{Math.floor(data.timeSec / 60)}хв {data.timeSec % 60}с</strong></span>
                      <span>{t("taster.finale.metricAttempts", "Спроб")}: <strong>{data.attempts}</strong></span>
                      <span>{t("taster.finale.metricHints", "Підказок")}: <strong>{data.hintsUsedCount}/3</strong></span>
                    </div>
                  </div>

                  {/* Objective Signal */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#1E2227]/10 text-xs font-sans text-[#1E2227]/85 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#C86D32] uppercase">
                      {t("taster.finale.signalHeading", "Об'єктивний сигнал платформи:")}
                    </span>
                    <p>
                      {data.passedIndependently && data.attempts === 1
                        ? "Завдання вирішено з першої спроби без відкриття готового рішення. Ти впевнено відчуваєш базову логіку цієї дисципліни."
                        : data.passedIndependently
                        ? "Завдання вирішено самостійно, знадобилося кілька спроб для вирівнювання крайових умов."
                        : "Використано підказку з розв'язком — це нормально для першого знайомства з незвичним синтаксисом або форматом логів."}
                    </p>
                  </div>

                  {/* Self Assessment (1-5) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#1E2227]/80 block font-sans">
                        {t("taster.finale.questionContinue", "Хотілося продовжувати цю задачу?")}
                      </label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() =>
                              setTelemetry((prev) => ({
                                ...prev,
                                [roleId]: { ...(prev[roleId] || data), continueRating: score },
                              }))
                            }
                            className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all ${
                              data.continueRating === score
                                ? "bg-[#C86D32] text-white shadow-xs"
                                : "bg-[#FAF8F2] border border-[#1E2227]/15 text-[#1E2227]/70 hover:bg-white"
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[#1E2227]/80 block font-sans">
                        {t("taster.finale.questionBoring", "Було нудно або втомливо?")}
                      </label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() =>
                              setTelemetry((prev) => ({
                                ...prev,
                                [roleId]: { ...(prev[roleId] || data), boringRating: score },
                              }))
                            }
                            className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all ${
                              data.boringRating === score
                                ? "bg-[#1E2227] text-white shadow-xs"
                                : "bg-[#FAF8F2] border border-[#1E2227]/15 text-[#1E2227]/70 hover:bg-white"
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Career Track Destination CTA */}
                  <div className="pt-3 border-t border-[#1E2227]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-[#1E2227]/60 block font-mono">
                        {t("taster.finale.readyToStartTrack", "Рекомендований стартовий трек:")}
                      </span>
                      <strong className="text-xs text-[#1E2227] font-mono">
                        {rDef.targetTrack.toUpperCase()} TRACK
                      </strong>
                    </div>

                    {rDef.targetStationId !== null ? (
                      <button
                        type="button"
                        onClick={() => {
                          audioFx.playSuccessFanfare();
                          setUserTrack(rDef.targetTrack as CareerTrack);
                          setCurrentStationId(rDef.targetStationId as string);
                          setCurrentView("STATION");
                        }}
                        className="px-5 py-2 rounded-xl bg-[#1E2227] hover:bg-black text-white font-mono font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{t("taster.finale.startTrackBtn", "Перейти до треку станцій ➔")}</span>
                        <ChevronRight size={14} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-mono text-xs font-bold">
                          {t("taster.finale.comingSoonBadge", "Трек у розробці (незабаром)")}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            audioFx.playRelayClick();
                            setUserTrack("explorer");
                            setCurrentView("HUB");
                          }}
                          className="px-4 py-1.5 rounded-xl bg-white border border-[#1E2227]/20 text-xs font-mono font-bold text-[#1E2227] hover:bg-[#FAF8F2] active:scale-95 transition-all cursor-pointer"
                        >
                          {t("taster.finale.exploreOtherBtn", "Переглянути всі станції (Explorer) ➔")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                audioFx.playRelayClick();
                setCurrentView("HUB");
              }}
              className="px-6 py-2.5 rounded-xl border border-[#1E2227]/25 bg-white hover:bg-[#FAF8F2] text-xs font-mono font-bold text-[#1E2227] transition-all cursor-pointer shadow-paper-xs"
            >
              {t("taster.exitToHub", "До верстака / Hub")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // RENDER: TASTING WORKBENCH (3 ZONES + 5 STEPS)
  // ═════════════════════════════════════════════════════════════════════
  if (!activeRole) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2227] flex flex-col font-sans select-none pb-8">
      {/* Top Header */}
      <header className="border-b border-[#1E2227]/15 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-white border border-[#1E2227]/20 text-xs font-mono font-bold text-[#1E2227] transition-all cursor-pointer shadow-paper-xs"
          >
            <ArrowLeft size={14} className="text-[#C86D32]" />
            <span>{t("taster.exitToHub", "До верстака / Hub")}</span>
          </button>
          <h2 className="font-display font-extrabold text-sm sm:text-base text-[#1E2227]">
            {t(activeRole.roleTitleKey)}
          </h2>
        </div>

        {/* 5 Steps Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                tastingStep === s
                  ? "bg-[#C86D32] text-white shadow-xs"
                  : tastingStep > s
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-white/60 border border-[#1E2227]/10 text-[#1E2227]/40"
              }`}
            >
              {s === 1 && "1. Сцена"}
              {s === 2 && "2. Я роблю"}
              {s === 3 && "3. Повтори"}
              {s === 4 && "4. Сам"}
              {s === 5 && "5. Рутина"}
            </div>
          ))}

          <div className="hidden sm:flex items-center gap-1 font-mono text-xs text-[#1E2227]/60 ml-2">
            <Clock size={13} />
            <span>{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, "0")}</span>
          </div>
        </div>
      </header>

      {/* ── Main 3-Column Interactive Layout ── */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* ══════════════════════════════════════════════════════════════
            ZONE 1 (LEFT, 4 cols): MENTOR, CONTEXT, HINT LADDER
           ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Mentor Speech Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#1E2227]/15 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[#1E2227]/60 uppercase">
                {tastingStep === 1 && t("taster.stepPacingBadge", "КРОК 1: СЦЕНА")}
                {tastingStep === 2 && t("taster.stepIDoBadge", "КРОК 2: Я РОБЛЮ (МЕНТОР)")}
                {tastingStep === 3 && t("taster.stepWeDoBadge", "КРОК 3: ПОВТОРИ + ПЕРЕВІРКА")}
                {tastingStep === 4 && t("taster.stepYouDoBadge", "КРОК 4: САМ (МІКРО-ЗАДАЧА)")}
                {tastingStep === 5 && t("taster.stepRoutineBadge", "КРОК 5: ЧЕСТНА РУТИНА")}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#1E2227]/85 leading-relaxed font-sans">
              {tastingStep === 1 && t(activeRole.mentorIntroKey)}
              {tastingStep === 2 && t(activeRole.iDoStep.explanationKey)}
              {tastingStep === 3 && t(activeRole.weDoStep.instructionKey)}
              {tastingStep === 4 && t(activeRole.youDoStep.requirementTextKey)}
              {tastingStep === 5 && t(activeRole.routineFactKey)}
            </p>
          </div>

          {/* Hints Ladder (Strictly for Step 4 "You Do") */}
          {tastingStep === 4 && (
            <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-amber-300 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-900 flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-amber-700" />
                  <span>Лесенка підказок</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                  {currentHintLevel}/3
                </span>
              </div>

              {currentHintLevel >= 1 && (
                <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-amber-950 font-sans">
                  <strong>{t("taster.hintLevel1", "Рівень 1: На що подивитися")}:</strong>{" "}
                  {t(activeRole.youDoStep.hintsKeys[0])}
                </div>
              )}

              {currentHintLevel >= 2 && (
                <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-amber-950 font-sans">
                  <strong>{t("taster.hintLevel2", "Рівень 2: Яке правило")}:</strong>{" "}
                  {t(activeRole.youDoStep.hintsKeys[1])}
                </div>
              )}

              {currentHintLevel >= 3 && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-950 font-sans">
                  <strong>{t("taster.hintLevel3Solution", "Рівень 3: Показати рішення")}:</strong>{" "}
                  {t(activeRole.youDoStep.hintsKeys[2])}
                </div>
              )}

              {currentHintLevel < 3 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    className="w-full py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-mono font-bold text-xs border border-amber-300 cursor-pointer active:scale-95 transition-all text-center"
                  >
                    {currentHintLevel === 0 && "Отримати підказку 1 (На що подивитися)"}
                    {currentHintLevel === 1 && "Отримати підказку 2 (Яке правило)"}
                    {currentHintLevel === 2 && "Показати готове рішення (Фіксується штраф)"}
                  </button>
                  {currentHintLevel === 2 && (
                    <p className="text-[10px] text-amber-800/80 mt-1 leading-tight text-center">
                      {t("taster.hintWarning", "Увага: відкриття рішення зафіксує підказку і крок не вважатиметься пройденим самостійно.")}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Validation Logs Terminal */}
          {lastValidationLogs.length > 0 && (
            <div className="p-3 rounded-2xl bg-[#0F141C] border border-[#21262D] space-y-1 font-mono text-[11px] text-zinc-300">
              <span className="text-[10px] text-zinc-500 uppercase">Engine Diagnostic Stream:</span>
              <div className="space-y-0.5 max-h-36 overflow-y-auto">
                {lastValidationLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes("[PASS]")
                        ? "text-emerald-400"
                        : log.includes("[FAIL]") || log.includes("[ERROR]") || log.includes("[CRITICAL")
                        ? "text-rose-400 font-bold"
                        : "text-zinc-400"
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action / Next Step Button */}
          <div className="mt-auto pt-4">
            {tastingStep < 3 && (
              <button
                type="button"
                onClick={handleAdvanceStep}
                className="w-full py-3 rounded-xl bg-[#C86D32] hover:bg-[#B35E28] active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t("taster.nextStepBtn", "Далі ➔")}</span>
              </button>
            )}

            {tastingStep === 3 && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleValidateWeDo}
                  className="w-full py-2.5 rounded-xl bg-[#1E2227] hover:bg-black active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play size={14} className="text-emerald-400" />
                  <span>{t("taster.runVerifyBtn", "Запустити перевірку")}</span>
                </button>
                {isStepPassed && (
                  <button
                    type="button"
                    onClick={handleAdvanceStep}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 animate-in fade-in"
                  >
                    <span>{t("taster.nextStepBtn", "Далі до кроку «Сам» ➔")}</span>
                  </button>
                )}
              </div>
            )}

            {tastingStep === 4 && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleValidateYouDo}
                  className="w-full py-2.5 rounded-xl bg-[#1E2227] hover:bg-black active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play size={14} className="text-emerald-400" />
                  <span>{t("taster.runVerifyBtn", "Запустити перевірку")}</span>
                </button>
                {isStepPassed && (
                  <button
                    type="button"
                    onClick={handleAdvanceStep}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 animate-in fade-in"
                  >
                    <span>{t("taster.nextStepBtn", "Далі до рутини ➔")}</span>
                  </button>
                )}
              </div>
            )}

            {tastingStep === 5 && (
              <button
                type="button"
                onClick={handleAdvanceStep}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>
                  {activeRoleIndex + 1 < selectedRoleIds.length
                    ? t("taster.routineNextRoleBtn", "До наступної ролі ➔")
                    : t("taster.routineToFinaleBtn", "До підсумків тесту ➔")}
                </span>
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ZONE 2 (CENTER, 5 cols): CODE / CONFIG / TERMINAL WORKBENCH
           ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* BACKEND EDITOR */}
          {activeRole.id === "role-backend" && (
            <div className="rounded-2xl bg-[#0D1117] border border-[#30363D] overflow-hidden flex flex-col shadow-lg flex-1">
              <div className="p-3 bg-[#161B22] border-b border-[#30363D] flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-stone-200">
                  {tastingStep <= 3 ? "OrderService.cs (We Do)" : "LoyaltyService.cs (You Do)"}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  C# / Go Syntax
                </span>
              </div>

              <div className="p-4 flex-1 font-mono text-xs text-stone-300 space-y-4">
                {tastingStep === 2 && (
                  <div className="space-y-3">
                    <div className="text-rose-400 line-through bg-rose-950/30 p-2 rounded">
                      {activeRole.iDoStep.initialSnippet}
                    </div>
                    <div className="text-emerald-400 bg-emerald-950/30 p-2 rounded font-bold">
                      {activeRole.iDoStep.fixedSnippet}
                    </div>
                  </div>
                )}

                {tastingStep === 3 && (
                  <div className="space-y-3">
                    <p className="text-zinc-400 text-xs">Правило безкоштовної доставки (від 500 DKK):</p>
                    <div className="p-2.5 rounded bg-black/50 border border-zinc-700 text-emerald-400 font-bold">
                      cartTotal &gt;= 500
                    </div>

                    <div className="pt-2 border-t border-zinc-800 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={backendWeDoAssertChecked}
                          onChange={(e) => setBackendWeDoAssertChecked(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-500"
                        />
                        <span className="text-xs text-zinc-300 font-bold">
                          Assert.Equal(true, hasFreeShipping(500))
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {tastingStep === 4 && (
                  <div className="space-y-3">
                    <p className="text-zinc-400 text-xs">
                      Введи булеве правило (напр. purchasesCount &gt;= 5):
                    </p>
                    <input
                      type="text"
                      value={backendCode}
                      onChange={(e) => setBackendCode(e.target.value)}
                      placeholder="purchasesCount >= 5"
                      className="w-full p-2.5 rounded-xl bg-black border border-zinc-700 text-emerald-400 font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none"
                    />

                    <div className="pt-2 border-t border-zinc-800 space-y-2">
                      <span className="text-[11px] text-zinc-400 block">
                        Вибери 3 граничні значення для тесту (n-1, n, n+1):
                      </span>
                      <div className="flex gap-2">
                        {[3, 4, 5, 6, 7].map((num) => {
                          const isPicked = backendBoundaryInputs.includes(num);
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                setBackendBoundaryInputs((prev) =>
                                  prev.includes(num)
                                    ? prev.filter((n) => n !== num)
                                    : [...prev, num]
                                );
                              }}
                              className={`w-9 h-9 rounded-lg font-mono font-bold text-xs flex items-center justify-center cursor-pointer transition-all ${
                                isPicked
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-[#1E2227] text-zinc-400 hover:text-white"
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {tastingStep >= 5 && (
                  <div className="p-4 rounded-xl bg-[#161B22] text-zinc-300 text-xs">
                    Завдання успішно верифіковано!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CYBERSECURITY TERMINAL */}
          {activeRole.id === "role-cyber" && (
            <div className="rounded-2xl bg-[#0D1017] border border-[#202636] p-4 flex flex-col gap-3 shadow-lg flex-1">
              <div className="flex items-center justify-between border-b border-[#202636] pb-2">
                <span className="text-xs font-mono font-bold text-zinc-200">
                  FIREWALL CONTAINMENT CONSOLE
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                  iptables CLI
                </span>
              </div>

              {tastingStep === 3 && (
                <div className="space-y-3 text-xs font-mono">
                  <p className="text-zinc-400">
                    Вибери в правому моніторі підозрілий IP (який спамить 401 на /login):
                  </p>
                  <div className="p-2.5 rounded bg-black border border-zinc-800 text-zinc-200">
                    sudo iptables -I INPUT 1 -s {cyberSelectedIp || "<SELECT_IP>"} -j DROP
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cyberWeDoVerified}
                      onChange={(e) => setCyberWeDoVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500"
                    />
                    <span className="text-zinc-300 font-bold">
                      Підтверджую перевірку: легітимний трафік 200 OK зберігся
                    </span>
                  </label>
                </div>
              )}

              {tastingStep === 4 && (
                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs">
                    ⚠ ПАСТКА: Найактивніший IP у лозі — легітимний клієнт (200 OK). Бан невиновного призведе до штрафу.
                  </div>
                  <p className="text-zinc-400">
                    Ціль для блокування: <strong className="text-white">{cyberSelectedIp || "Клікни рядок у правому лозі"}</strong>
                  </p>
                  <div className="p-2.5 rounded bg-black border border-zinc-800 text-rose-400 font-bold">
                    ACTION: DROP {cyberSelectedIp || "???.???.???.???"}
                  </div>
                </div>
              )}

              {tastingStep !== 3 && tastingStep !== 4 && (
                <div className="p-4 rounded-xl bg-[#141923] text-zinc-300 text-xs font-mono">
                  Готово до моніторингу черги інцидентів.
                </div>
              )}
            </div>
          )}

          {/* GAME DESIGN BALANCER */}
          {activeRole.id === "role-gamedesign" && (
            <div className="rounded-2xl bg-[#13111C] border border-[#2D2640] p-4 flex flex-col gap-3 shadow-lg flex-1">
              <div className="flex items-center justify-between border-b border-[#2D2640] pb-2">
                <span className="text-xs font-mono font-bold text-purple-300">
                  COMBAT NUMERIC BALANCER
                </span>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded">
                  Config Sliders
                </span>
              </div>

              {tastingStep === 3 && (
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Броня гравця (playerArmor):</span>
                    <span className="text-emerald-400 font-bold text-sm">{gdArmor}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={gdArmor}
                    onChange={(e) => setGdArmor(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-zinc-400">
                    Ціль: підбери броню так, щоб середня тривалість бою була 10-12с (підказка: спробуй біля 20).
                  </p>
                </div>
              )}

              {tastingStep === 4 && (
                <div className="space-y-3 text-xs font-mono">
                  {/* Boss Damage */}
                  <div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Шкода боса (bossDamage):</span>
                      <span className="text-rose-400 font-bold text-sm">{gdParams.bossDamage}</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="5"
                      value={gdParams.bossDamage}
                      onChange={(e) =>
                        setGdParams((prev) => ({ ...prev, bossDamage: parseInt(e.target.value, 10) }))
                      }
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  {/* Potion Heal */}
                  <div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Сила зілля (potionHeal):</span>
                      <span className="text-amber-400 font-bold text-sm">{gdParams.potionHeal} HP</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="5"
                      value={gdParams.potionHeal}
                      onChange={(e) =>
                        setGdParams((prev) => ({ ...prev, potionHeal: parseInt(e.target.value, 10) }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Potion Count */}
                  <div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Кількість зіллів:</span>
                      <span className="text-amber-400 font-bold text-sm">{gdParams.potionCount} шт</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      {[1, 2, 3].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setGdParams((prev) => ({ ...prev, potionCount: cnt }))}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                            gdParams.potionCount === cnt
                              ? "bg-purple-600 text-white"
                              : "bg-[#201B2E] text-zinc-400"
                          }`}
                        >
                          {cnt}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tastingStep !== 3 && tastingStep !== 4 && (
                <div className="p-4 rounded-xl bg-[#1D192B] text-zinc-300 text-xs font-mono">
                  Готово до симуляції боїв.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ZONE 3 (RIGHT, 3 cols): REACTIVE LIVE TEST-STAND
           ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {activeRole.id === "role-backend" && (
            <ShopStand
              cartTotal={1000}
              discountApplied={tastingStep >= 2}
              freeShippingApplied={tastingStep >= 3}
              purchasesCount={5}
              bonusPointsEarned={isStepPassed && tastingStep >= 4}
            />
          )}

          {activeRole.id === "role-cyber" && (
            <TrafficStand
              logs={tastingStep <= 3 ? CYBER_WE_DO_LOGS : CYBER_YOU_DO_LOGS}
              selectedIp={cyberSelectedIp}
              blockedIp={cyberBlockedIp}
              isFalsePositive={cyberIsFalsePositive}
              onSelectIp={(ip) => setCyberSelectedIp(ip)}
            />
          )}

          {activeRole.id === "role-gamedesign" && (
            <DuelArenaStand
              params={
                tastingStep === 3
                  ? { bossDamage: 45, bossCooldownSec: 1.8, potionHeal: 0, potionCount: 0, playerArmor: gdArmor }
                  : gdParams
              }
              lastSimResult={gdLastSim}
            />
          )}
        </div>
      </main>
    </div>
  );
};
