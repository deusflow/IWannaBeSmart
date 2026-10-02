/**
 * @file apps/web/src/components/workbench/express/CareerSpeedDatingScreen.tsx
 * @description Guided Walkthrough ("Career Speed-Dating", ~15 min).
 * Pure atomic focus: At any single moment: ONE highlighted element (Spotlight),
 * ONE imperative sentence, ONE active action. Everything else is dimmed.
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Clock, Play, ArrowRight, CheckCircle2 } from "lucide-react";
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
import { audioFx } from "../../../utils/audioFx";
import { ShopStand } from "./stands/ShopStand";
import { TrafficStand } from "./stands/TrafficStand";
import { DuelArenaStand } from "./stands/DuelArenaStand";
import { CatalogStep } from "./guided/CatalogStep";
import { FinaleStep, type RoleSessionTelemetry } from "./guided/FinaleStep";
import { RoutineStepCard } from "./guided/RoutineStepCard";
import { SpotlightOverlay } from "./guided/SpotlightOverlay";
import { GUIDED_STEPS_BY_ROLE } from "./guided/walkthroughStateMachine";

interface CareerSpeedDatingScreenProps {
  onClose: () => void;
}

const BACKEND_YOUDO_BROKEN_METHOD = `// Правило: VIP надається від 5 покупок включно
public bool IsVip(int purchasesCount) {
    return purchasesCount > 5; // <-- Виправ знак тут
}`;

const extractBackendVipCondition = (methodCode: string): string | null => {
  const match = methodCode.match(/return\s+([^;]+);/);
  return match?.[1]?.trim() ?? null;
};

export const CareerSpeedDatingScreen: React.FC<CareerSpeedDatingScreenProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();

  // Screen mode: CATALOG -> TASTING -> FINALE
  const [screenMode, setScreenMode] = useState<"CATALOG" | "TASTING" | "FINALE">("CATALOG");

  // Selected roles queue
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([
    "role-backend",
    "role-cyber",
    "role-gamedesign",
  ]);
  const [activeRoleIndex, setActiveRoleIndex] = useState<number>(0);

  // Active sub-step index in current role
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState<number>(0);

  // Failure attempts counter for current sub-step (to show "Show how it's done" after 2 failures)
  const [failureCount, setFailureCount] = useState<number>(0);

  // Telemetry map per role
  const [telemetry, setTelemetry] = useState<Record<string, RoleSessionTelemetry>>({});
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // ── Role Specific Interactive States ──
  // Backend
  const [backendWeDoOperator, setBackendWeDoOperator] = useState<string>("");
  const [backendYouDoMethodCode, setBackendYouDoMethodCode] = useState<string>(
    BACKEND_YOUDO_BROKEN_METHOD
  );

  // Cyber
  const [cyberWeDoFilterInput, setCyberWeDoFilterInput] = useState<string>("");
  const [cyberWeDoBlockInput, setCyberWeDoBlockInput] = useState<string>("");
  const [cyberYouDoIpInput, setCyberYouDoIpInput] = useState<string>("");
  const [cyberBlockedIp, setCyberBlockedIp] = useState<string | null>(null);
  const [cyberIsFalsePositive, setCyberIsFalsePositive] = useState<boolean>(false);

  // Game Design
  const [gdArmor, setGdArmor] = useState<number>(0);
  const [gdParams, setGdParams] = useState<DuelParams>({
    bossDamage: 80,
    bossCooldownSec: 1.8,
    potionHeal: 45,
    potionCount: 1,
  });
  const [gdLastSim, setGdLastSim] = useState<DuelSimulationSummary | null>(null);

  // Validation feedback
  const [lastValidationLogs, setLastValidationLogs] = useState<string[]>([]);
  const [isActionSuccess, setIsActionSuccess] = useState<boolean>(false);

  // Timer interval for speed-dating
  useEffect(() => {
    if (screenMode !== "TASTING") return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [screenMode]);

  // Active role definition
  const activeRole: RoleTasterDefinition | undefined = ROLE_TASTER_REGISTRY.find(
    (r) => r.id === selectedRoleIds[activeRoleIndex]
  );

  const subSteps = activeRole
    ? GUIDED_STEPS_BY_ROLE[activeRole.id as keyof typeof GUIDED_STEPS_BY_ROLE] || []
    : [];
  const currentSubStepDef = subSteps[currentSubStepIndex];

  // Initialize or reset role state on switch
  const initRoleSession = (role: RoleTasterDefinition) => {
    setCurrentSubStepIndex(0);
    setFailureCount(0);
    setIsActionSuccess(false);
    setLastValidationLogs([]);
    setTimerSeconds(0);

    if (role.id === "role-backend") {
      setBackendWeDoOperator("");
      setBackendYouDoMethodCode(BACKEND_YOUDO_BROKEN_METHOD);
    } else if (role.id === "role-cyber") {
      setCyberWeDoFilterInput("");
      setCyberWeDoBlockInput("");
      setCyberYouDoIpInput("");
      setCyberBlockedIp(null);
      setCyberIsFalsePositive(false);
    } else if (role.id === "role-gamedesign") {
      setGdArmor(0);
      setGdParams({
        bossDamage: 80,
        bossCooldownSec: 1.8,
        potionHeal: 45,
        potionCount: 1,
      });
      setGdLastSim(null);
    }
  };

  // Toggle role in catalog (up to 3)
  const handleToggleCatalogRole = (roleId: string) => {
    setSelectedRoleIds((prev) => {
      if (prev.includes(roleId)) return prev.filter((id) => id !== roleId);
      if (prev.length >= 3) return prev;
      return [...prev, roleId];
    });
  };

  const handleSelectContrastingRoles = () => {
    setSelectedRoleIds(["role-backend", "role-cyber", "role-gamedesign"]);
  };

  const handleStartTasting = () => {
    if (selectedRoleIds.length === 0) return;
    setActiveRoleIndex(0);
    const firstRole = ROLE_TASTER_REGISTRY.find((r) => r.id === selectedRoleIds[0]);
    if (firstRole) initRoleSession(firstRole);
    setScreenMode("TASTING");
    audioFx.playRelayClick();
  };

  const recordAttempt = (passed: boolean) => {
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

    if (!passed) {
      setFailureCount((prev) => prev + 1);
    }
  };

  // Auto-fill solution when student clicks "Show how it's done" after 2 failures
  const handleShowSolution = () => {
    if (!activeRole || !currentSubStepDef) return;

    // Log penalty in telemetry
    setTelemetry((prev) => {
      const current = prev[activeRole.id] || {
        timeSec: 0,
        attempts: 1,
        hintsUsedCount: 0,
        solutionRevealed: false,
        passedIndependently: true,
      };
      return {
        ...prev,
        [activeRole.id]: {
          ...current,
          solutionRevealed: true,
          passedIndependently: false,
          hintsUsedCount: 3,
        },
      };
    });

    // Auto-fill exact solution based on current sub-step
    if (currentSubStepDef.id === "backend-wedo") {
      setBackendWeDoOperator(">=");
      setIsActionSuccess(true);
      audioFx.playSuccessFanfare();
    } else if (currentSubStepDef.id === "backend-youdo-cond") {
      setBackendYouDoMethodCode(BACKEND_YOUDO_BROKEN_METHOD.replace("> 5", ">= 5"));
      setIsActionSuccess(true);
      audioFx.playSuccessFanfare();
    } else if (currentSubStepDef.id === "cyber-wedo-filter") {
      setCyberWeDoFilterInput("status=401");
      setIsActionSuccess(true);
      audioFx.playSuccessFanfare();
    } else if (currentSubStepDef.id === "cyber-wedo-block") {
      setCyberWeDoBlockInput("block 203.0.113.77");
      setIsActionSuccess(true);
      audioFx.playSuccessFanfare();
    } else if (currentSubStepDef.id === "cyber-youdo") {
      setCyberYouDoIpInput("192.0.2.144");
      setCyberBlockedIp("192.0.2.144");
      setIsActionSuccess(true);
      audioFx.playSuccessFanfare();
    } else if (currentSubStepDef.id === "gamedesign-wedo-armor") {
      setGdArmor(20);
      setIsActionSuccess(true);
      audioFx.playSuccessFanfare();
    } else if (currentSubStepDef.id === "gamedesign-youdo") {
      setGdParams({
        bossDamage: 40,
        bossCooldownSec: 1.8,
        potionHeal: 45,
        potionCount: 2,
      });
      setIsActionSuccess(true);
      audioFx.playSuccessFanfare();
    }
  };

  // Next step transition
  const handleAdvanceSubStep = () => {
    if (currentSubStepIndex + 1 < subSteps.length) {
      setCurrentSubStepIndex((prev) => prev + 1);
      setFailureCount(0);
      setIsActionSuccess(false);
      setLastValidationLogs([]);
      audioFx.playRelayClick();
    } else {
      // Completed role -> record total time
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

      if (activeRoleIndex + 1 < selectedRoleIds.length) {
        const nextIdx = activeRoleIndex + 1;
        setActiveRoleIndex(nextIdx);
        const nextRole = ROLE_TASTER_REGISTRY.find((r) => r.id === selectedRoleIds[nextIdx]);
        if (nextRole) initRoleSession(nextRole);
      } else {
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
      <CatalogStep
        selectedRoleIds={selectedRoleIds}
        onToggleRole={handleToggleCatalogRole}
        onSelectContrasting={handleSelectContrastingRoles}
        onStart={handleStartTasting}
        onClose={onClose}
      />
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // RENDER: FINALE SCREEN
  // ═════════════════════════════════════════════════════════════════════
  if (screenMode === "FINALE") {
    return (
      <FinaleStep
        selectedRoleIds={selectedRoleIds}
        telemetry={telemetry}
        onUpdateRating={(roleId, key, value) => {
          setTelemetry((prev) => ({
            ...prev,
            [roleId]: {
              ...(prev[roleId] || {
                timeSec: 45,
                attempts: 1,
                hintsUsedCount: 0,
                solutionRevealed: false,
                passedIndependently: true,
              }),
              [key]: value,
            },
          }));
        }}
        onClose={onClose}
      />
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // RENDER: TASTING SCREEN WITH ATOMIC SPOTLIGHT FOCUS
  // ═════════════════════════════════════════════════════════════════════
  if (!activeRole || !currentSubStepDef) return null;

  // Compute Mentor Text dynamically for current sub-step
  let mentorPrompt = "";
  let mentorSubText = "";

  if (activeRole.id === "role-backend") {
    if (currentSubStepDef.id === "backend-scene") {
      mentorPrompt = t(
        "taster.backend.iDo.problemDesc",
        "Покупець зібрав кошик рівно на 1000 крон, але не отримав знижку 10%. Замовлення зависло в суперечці."
      );
      mentorSubText = "Поглянь на підсумок кошика: 1000 DKK, знижка не застосована.";
    } else if (currentSubStepDef.id === "backend-ido") {
      mentorPrompt = t(
        "taster.backend.iDo.explanation",
        "Дивись: розробник написав 'cartTotal > 1000' замість '>='. Значення 1000 випало з умови. Виправляємо на '>=' і запускаємо тест."
      );
      mentorSubText = "Суворе '>' не враховує граничне число 1000.";
    } else if (currentSubStepDef.id === "backend-wedo") {
      mentorPrompt = "Твоя черга: надрукуй оператор '>=' для безкоштовної доставки від 500 крон включно.";
      mentorSubText = "Введи '>=' в поле нижче та натисни «Запустити Assertion».";
    } else if (currentSubStepDef.id === "backend-youdo-cond") {
      mentorPrompt = t(
        "taster.backend.youDo.requirement",
        "В інтернет-магазині діє правило: клієнт стає VIP від 5 покупок включно. Колега помилився та написав суворе '> 5', через що клієнт із рівно 5 покупками не отримує знижку. Виправ метод IsVip і запусти тести."
      );
      mentorSubText =
        "Заміни в коді 'return purchasesCount > 5;' на 'return purchasesCount >= 5;' і натисни «Запустити тести ▶».";
    }
  } else if (activeRole.id === "role-cyber") {
    if (currentSubStepDef.id === "cyber-scene") {
      mentorPrompt = t(
        "taster.cyber.iDo.problemDesc",
        "Автентифікаційний шлюз перевантажений. Лог сипле нескінченними помилками."
      );
      mentorSubText = "Поглянь на монітор: потік запитів заповнений рядками 401 Auth Storm.";
    } else if (currentSubStepDef.id === "cyber-ido") {
      mentorPrompt = t(
        "taster.cyber.iDo.explanation",
        "Дивимося на статуси: бот шле POST /login зі статусом 401 Unauthorized кілька разів на секунду з одного IP. Легітимні клієнти отримують 200. Блокуємо IP бота."
      );
      mentorSubText = "Зверни увагу на колонку статусів: 401 проти 200.";
    } else if (currentSubStepDef.id === "cyber-wedo-filter") {
      mentorPrompt = "Надрукуй фільтр точнісінько: status=401 щоб виокремити підозрілий трафік.";
      mentorSubText = "Введи status=401 в термінал.";
    } else if (currentSubStepDef.id === "cyber-wedo-block") {
      mentorPrompt = "Бот знайдений! Надрукуй команду блокування: block 203.0.113.77";
      mentorSubText = "Введи команду блокування бота.";
    } else if (currentSubStepDef.id === "cyber-youdo") {
      mentorPrompt = t(
        "taster.cyber.youDo.requirement",
        "Сервер під навантаженням. Проаналізуй потік запитів, вияви атакуючий IP та заблокуй його. Помилкове блокування легітимного клієнта неприпустиме."
      );
      mentorSubText = "Знайди IP, що спамить 401, введи його та натисни «Заблокувати».";
    }
  } else if (activeRole.id === "role-gamedesign") {
    if (currentSubStepDef.id === "gamedesign-scene") {
      // Dynamic numbers strictly matching tasterEngine
      mentorPrompt = t("taster.gamedesign.iDo.problemDesc", {
        brokenDmg: 120,
        brokenCd: 0.5,
        brokenTtk: 1.0,
      });
      mentorSubText = "Бос б'є занадто швидко і сильно — гравець не має шансів зреагувати.";
    } else if (currentSubStepDef.id === "gamedesign-ido") {
      // Dynamic numbers strictly matching tasterEngine
      mentorPrompt = t("taster.gamedesign.iDo.explanation", {
        fixedCd: 1.8,
        fixedDmg: 45,
        fixedTtk: 11,
      });
      mentorSubText = "Зменшення шкоди і збільшення кулдауну створюють здорове вікно реакції.";
    } else if (currentSubStepDef.id === "gamedesign-wedo-armor") {
      mentorPrompt = "Перетягни повзунок броні гравця (playerArmor) рівно на 20.";
      mentorSubText = "Броня зменшить шкоду боса і збалансує бій.";
    } else if (currentSubStepDef.id === "gamedesign-wedo-sim") {
      mentorPrompt = "Чудово! Тепер натисни «Запустити 100 боїв», щоб перевірити середній час виживання.";
      mentorSubText = "Ціль: середня тривалість бою 10–12 секунд.";
    } else if (currentSubStepDef.id === "gamedesign-youdo") {
      mentorPrompt = t(
        "taster.gamedesign.youDo.requirement",
        "Збалансуй параметри дуелі: налаштуй шкоду боса (bossDamage) та запас зіллів (potionHeal, potionCount), щоб одночасно: середня тривалість була 10-15с І вінрейт гравця складав 45-55% на 500 боях на різних seed."
      );
      mentorSubText = "Налаштуй 2 повзунки (Шкода боса та Кількість зіллів) і натисни симуляцію.";
    }
  }

  // ── Sub-step Action Button Slot inside Spotlight Bubble ──
  const renderActionSlot = () => {
    if (currentSubStepDef.actionType === "next") {
      return (
        <button
          type="button"
          onClick={handleAdvanceSubStep}
          className="w-full py-2.5 px-4 rounded-xl bg-[#C86D32] hover:bg-[#B35E28] active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>{t("taster.nextStepBtn", "Далі ➔")}</span>
          <ArrowRight size={14} />
        </button>
      );
    }

    if (isActionSuccess) {
      return (
        <button
          type="button"
          onClick={handleAdvanceSubStep}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-in fade-in"
        >
          <CheckCircle2 size={14} />
          <span>{t("taster.nextStepBtn", "Успішно! Далі ➔")}</span>
        </button>
      );
    }

    // Step-specific action buttons
    if (currentSubStepDef.id === "backend-wedo") {
      return (
        <button
          type="button"
          onClick={() => {
            const res = validateBackendWeDo(backendWeDoOperator, true);
            setLastValidationLogs(res.logs);
            recordAttempt(res.passed);
            if (res.passed) {
              setIsActionSuccess(true);
              audioFx.playSuccessFanfare();
            } else {
              audioFx.playErrorBuzz();
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1E2227] hover:bg-black active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Play size={13} className="text-emerald-400" />
          <span>{t("taster.runAssertBtn", "Запустити Assertion")}</span>
        </button>
      );
    }

    if (currentSubStepDef.id === "backend-youdo-cond") {
      const hasReturn = /return\s+[^;]+;/.test(backendYouDoMethodCode);
      return (
        <button
          type="button"
          disabled={!hasReturn}
          onClick={() => {
            const condition = extractBackendVipCondition(backendYouDoMethodCode);
            if (!condition) {
              setLastValidationLogs([
                "[SYNTAX_ERROR] Не знайдено рядок return ...; у методі IsVip.",
              ]);
              recordAttempt(false);
              audioFx.playErrorBuzz();
              return;
            }

            const res = validateBackendYouDo(condition);
            setLastValidationLogs(res.logs);
            recordAttempt(res.passed);
            if (res.passed) {
              setIsActionSuccess(true);
              audioFx.playSuccessFanfare();
            } else {
              audioFx.playErrorBuzz();
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1E2227] hover:bg-black active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <Play size={13} className="text-emerald-400" />
          <span>{t("taster.runBackendTestsBtn", "Запустити тести ▶")}</span>
        </button>
      );
    }

    if (currentSubStepDef.id === "cyber-wedo-filter") {
      return (
        <button
          type="button"
          onClick={() => {
            if (cyberWeDoFilterInput.trim().toLowerCase() === "status=401") {
              setIsActionSuccess(true);
              audioFx.playSuccessFanfare();
            } else {
              recordAttempt(false);
              audioFx.playErrorBuzz();
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1E2227] hover:bg-black active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Застосувати фільтр ➔</span>
        </button>
      );
    }

    if (currentSubStepDef.id === "cyber-wedo-block") {
      return (
        <button
          type="button"
          onClick={() => {
            const clean = cyberWeDoBlockInput.trim().toLowerCase();
            const res = validateCyberWeDo(
              clean.replace("block ", "").trim(),
              true
            );
            setLastValidationLogs(res.logs);
            recordAttempt(res.passed);
            if (res.passed) {
              setIsActionSuccess(true);
              audioFx.playSuccessFanfare();
            } else {
              audioFx.playErrorBuzz();
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1E2227] hover:bg-black active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Play size={13} className="text-emerald-400" />
          <span>{t("taster.runVerifyBtn", "Запустити перевірку")}</span>
        </button>
      );
    }

    if (currentSubStepDef.id === "cyber-youdo") {
      return (
        <button
          type="button"
          onClick={() => {
            const res = validateCyberYouDo(cyberYouDoIpInput.trim());
            setLastValidationLogs(res.logs);
            setCyberBlockedIp(cyberYouDoIpInput.trim());
            setCyberIsFalsePositive(res.isFalsePositive);
            recordAttempt(res.passed);
            if (res.passed) {
              setIsActionSuccess(true);
              audioFx.playSuccessFanfare();
            } else {
              audioFx.playErrorBuzz();
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1E2227] hover:bg-black active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Play size={13} className="text-emerald-400" />
          <span>{t("taster.runVerifyBtn", "Запустити перевірку")}</span>
        </button>
      );
    }

    if (currentSubStepDef.id === "gamedesign-wedo-armor") {
      return (
        <button
          type="button"
          onClick={() => {
            if (gdArmor === 20) {
              setIsActionSuccess(true);
              audioFx.playSuccessFanfare();
            } else {
              recordAttempt(false);
              audioFx.playErrorBuzz();
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1E2227] hover:bg-black active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Зафіксувати броню ➔</span>
        </button>
      );
    }

    if (currentSubStepDef.id === "gamedesign-wedo-sim") {
      return (
        <button
          type="button"
          onClick={() => {
            const res = validateGameDesignWeDo(gdArmor, true);
            setLastValidationLogs(res.logs);
            recordAttempt(res.passed);
            if (res.passed) {
              setIsActionSuccess(true);
              audioFx.playSuccessFanfare();
            } else {
              audioFx.playErrorBuzz();
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1E2227] hover:bg-black active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Play size={13} className="text-purple-400" />
          <span>{t("taster.runSimBtn", "Запустити 100 боїв")}</span>
        </button>
      );
    }

    if (currentSubStepDef.id === "gamedesign-youdo") {
      return (
        <button
          type="button"
          onClick={() => {
            const res = validateGameDesignYouDo(gdParams, [42, 99, 1337]);
            setGdLastSim(res);
            setLastValidationLogs(res.logs);
            recordAttempt(res.passed);
            if (res.passed) {
              setIsActionSuccess(true);
              audioFx.playSuccessFanfare();
            } else {
              audioFx.playErrorBuzz();
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1E2227] hover:bg-black active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Play size={13} className="text-purple-400" />
          <span>{t("taster.runMultiSimBtn", "Прогнати 500 боїв (3 Seed)")}</span>
        </button>
      );
    }

    return null;
  };

  // Render Step 5 (Honest Routine) full screen
  if (currentSubStepDef.id.includes("routine")) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1E2227] flex flex-col font-sans select-none p-4 sm:p-8 justify-center">
        <RoutineStepCard
          role={activeRole}
          isLastRole={activeRoleIndex + 1 >= selectedRoleIds.length}
          onNext={handleAdvanceSubStep}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2227] flex flex-col font-sans select-none pb-8 relative">
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

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#1E2227]/70">
            {t("taster.guidedStepLabel", {
              step: currentSubStepDef.stepNumber,
              total: currentSubStepDef.totalSubSteps,
            })}
          </span>
          <div className="flex items-center gap-1 font-mono text-xs text-[#1E2227]/60 ml-2">
            <Clock size={13} />
            <span>
              {Math.floor(timerSeconds / 60)}:
              {(timerSeconds % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </header>

      {/* Main Workbench Stage (Hosts Stands & Inputs) */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1 flex flex-col justify-center">
        {/* ── BACKEND ROLE CONTENT ── */}
        {activeRole.id === "role-backend" && (
          <div className="space-y-6">
            {/* Shop Stand */}
            <div id="express-shop-stand">
              <ShopStand
                cartTotal={1000}
                discountApplied={currentSubStepIndex >= 2}
                freeShippingApplied={currentSubStepIndex >= 3}
                purchasesCount={5}
                bonusPointsEarned={
                  currentSubStepDef.id === "backend-youdo-cond" ? isActionSuccess : currentSubStepIndex >= 4
                }
              />
            </div>

            {/* I Do Code Snippet */}
            <div
              id="express-backend-code-snippet"
              className="p-4 rounded-2xl bg-[#0D1117] border border-[#30363D] font-mono text-xs text-stone-300 space-y-2"
            >
              <span className="text-[10px] text-zinc-500 uppercase block">DiscountRule.cs</span>
              <div className="text-rose-400 line-through bg-rose-950/30 p-2 rounded">
                if (cartTotal &gt; 1000) applyDiscount(0.10);
              </div>
              <div className="text-emerald-400 bg-emerald-950/30 p-2 rounded font-bold">
                if (cartTotal &gt;= 1000) applyDiscount(0.10);
              </div>
            </div>

            {/* We Do Typing Box */}
            <div
              id="express-backend-wedo-box"
              className="p-4 rounded-2xl bg-white border border-[#1E2227]/15 shadow-sm space-y-3"
            >
              <span className="text-xs font-mono font-bold text-[#1E2227]">
                ShippingRule.cs (Правило доставки від 500 крон):
              </span>
              <div className="flex items-center gap-2 font-mono text-sm bg-[#0D1117] p-3 rounded-xl border border-zinc-700 text-stone-300">
                <span>hasFreeShipping = cartTotal</span>
                <input
                  type="text"
                  value={backendWeDoOperator}
                  onChange={(e) => setBackendWeDoOperator(e.target.value)}
                  placeholder=">="
                  className="w-16 px-2 py-1 bg-black border border-emerald-500 rounded text-emerald-400 font-bold text-center focus:outline-none"
                />
                <span>500;</span>
              </div>
            </div>

            {/* You Do Condition Box (Screen 4A) */}
            <div
              id="express-backend-youdo-cond-box"
              className="p-4 rounded-2xl bg-white border border-[#1E2227]/15 shadow-sm space-y-3"
            >
              <span className="text-xs font-mono font-bold text-[#1E2227]">
                LoyaltyService.cs (Виправ правило VIP для межі 5):
              </span>
              <textarea
                value={backendYouDoMethodCode}
                onChange={(e) => setBackendYouDoMethodCode(e.target.value)}
                spellCheck={false}
                className="w-full min-h-[128px] p-3 rounded-xl bg-black border border-zinc-700 text-emerald-400 font-mono text-sm leading-6 focus:border-emerald-500 focus:outline-none [font-variant-ligatures:none]"
              />
              <p className="text-[11px] text-[#1E2227]/65 font-mono">
                Пиши лише ASCII-оператори: <code>&gt;=</code> (не символ <code>≥</code>).
              </p>
            </div>
          </div>
        )}

        {/* ── CYBER ROLE CONTENT ── */}
        {activeRole.id === "role-cyber" && (
          <div className="space-y-6">
            {/* Traffic Stand */}
            <div id="express-traffic-stand">
              <TrafficStand
                logs={currentSubStepIndex >= 4 ? CYBER_YOU_DO_LOGS : CYBER_WE_DO_LOGS}
                selectedIp={cyberYouDoIpInput}
                blockedIp={cyberBlockedIp}
                isFalsePositive={cyberIsFalsePositive}
                onSelectIp={(ip) => setCyberYouDoIpInput(ip)}
              />
            </div>

            {/* I Do Highlight */}
            <div
              id="express-cyber-ido-highlight"
              className="p-4 rounded-2xl bg-[#0D1017] border border-[#202636] font-mono text-xs text-zinc-300 space-y-2"
            >
              <span className="text-[10px] text-zinc-500 uppercase block">
                SOC Analysis: Pattern Recognition
              </span>
              <div className="text-rose-400 bg-rose-950/30 p-2.5 rounded border border-rose-900/50">
                POST /login - 401 Unauthorized (10 запитів/сек з IP 203.0.113.77) ➔ Атака брутфорсу!
              </div>
            </div>

            {/* We Do Terminal */}
            <div
              id="express-cyber-wedo-terminal"
              className="p-4 rounded-2xl bg-[#07090D] border border-[#1A202C] font-mono text-xs text-zinc-300 space-y-3"
            >
              <span className="text-[10px] text-zinc-500 uppercase block">iptables terminal</span>
              {currentSubStepDef.id === "cyber-wedo-filter" ? (
                <div className="space-y-2">
                  <span className="text-zinc-400 block text-[11px]">Фільтр потоку логів:</span>
                  <input
                    type="text"
                    value={cyberWeDoFilterInput}
                    onChange={(e) => setCyberWeDoFilterInput(e.target.value)}
                    placeholder="status=401"
                    className="w-full p-2.5 rounded-lg bg-black border border-zinc-700 text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-zinc-400 block text-[11px]">Команда блокування:</span>
                  <input
                    type="text"
                    value={cyberWeDoBlockInput}
                    onChange={(e) => setCyberWeDoBlockInput(e.target.value)}
                    placeholder="block 203.0.113.77"
                    className="w-full p-2.5 rounded-lg bg-black border border-zinc-700 text-rose-400 font-mono font-bold focus:border-rose-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* You Do Box */}
            <div
              id="express-cyber-youdo-box"
              className="p-4 rounded-2xl bg-white border border-[#1E2227]/15 shadow-sm space-y-3"
            >
              <span className="text-xs font-mono font-bold text-[#1E2227]">
                Введи знайдений IP атакуючого для блокування:
              </span>
              <input
                type="text"
                value={cyberYouDoIpInput}
                onChange={(e) => setCyberYouDoIpInput(e.target.value)}
                placeholder="192.0.2.144"
                className="w-full p-3 rounded-xl bg-black border border-zinc-700 text-emerald-400 font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ── GAME DESIGN ROLE CONTENT ── */}
        {activeRole.id === "role-gamedesign" && (
          <div className="space-y-6">
            {/* Duel Arena Stand */}
            <div id="express-duel-arena-stand">
              <DuelArenaStand params={gdParams} lastSimResult={gdLastSim} />
            </div>

            {/* I Do Box */}
            <div
              id="express-duel-ido-box"
              className="p-4 rounded-2xl bg-[#13111C] border border-[#2D2640] font-mono text-xs text-purple-300 space-y-2"
            >
              <span className="text-[10px] text-zinc-500 uppercase block">TTK Balancing Rule</span>
              <div className="bg-purple-950/40 p-2.5 rounded border border-purple-800/40 text-purple-200">
                Зменшення шкоди боса зі 120 до 45 і кулдаун 1.8с дають гравцеві 11 секунд на захист.
              </div>
            </div>

            {/* We Do Armor Slider */}
            <div
              id="express-gd-armor-slider-box"
              className="p-4 rounded-2xl bg-white border border-[#1E2227]/15 shadow-sm space-y-2"
            >
              <div className="flex justify-between items-center text-xs font-mono font-bold text-[#1E2227]">
                <span>Броня гравця (playerArmor):</span>
                <span className="text-emerald-700 text-sm font-black">{gdArmor}</span>
              </div>
              <input
                id="express-armor-slider"
                type="range"
                min="0"
                max="30"
                value={gdArmor}
                onChange={(e) => setGdArmor(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#C86D32]"
              />
            </div>

            {/* We Do Run Sim Box */}
            <div
              id="express-gd-wedo-run-box"
              className="p-4 rounded-2xl bg-white border border-[#1E2227]/15 shadow-sm text-center"
            >
              <span className="text-xs font-mono font-bold text-[#1E2227]">
                Готово до перевірочної симуляції на 100 боїв
              </span>
            </div>

            {/* You Do Duel Controls (Screen 4, Max 2 Controls) */}
            <div
              id="express-gd-youdo-box"
              className="p-4 rounded-2xl bg-white border border-[#1E2227]/15 shadow-sm space-y-4"
            >
              <span className="text-xs font-mono font-bold text-[#1E2227] block">
                Налаштування балансу дуелі:
              </span>

              {/* Control 1: Boss Damage */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#1E2227]/70">Шкода боса (bossDamage):</span>
                  <span className="font-bold text-rose-700">{gdParams.bossDamage}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={gdParams.bossDamage}
                  onChange={(e) =>
                    setGdParams((prev) => ({ ...prev, bossDamage: Number(e.target.value) }))
                  }
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>

              {/* Control 2: Potion Count */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#1E2227]/70">Кількість зіллів (potionCount):</span>
                  <span className="font-bold text-amber-700">{gdParams.potionCount}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={gdParams.potionCount}
                  onChange={(e) =>
                    setGdParams((prev) => ({ ...prev, potionCount: Number(e.target.value) }))
                  }
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Validation Output Logs */}
        {lastValidationLogs.length > 0 && (
          <div className="p-3 rounded-2xl bg-[#0F141C] border border-[#21262D] space-y-1 font-mono text-[11px] text-zinc-300">
            {lastValidationLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes("[PASS]")
                    ? "text-emerald-400"
                    : log.includes("[FAIL]") || log.includes("[ERROR]")
                    ? "text-rose-400 font-bold"
                    : "text-zinc-400"
                }
              >
                {log}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── ATOMIC SPOTLIGHT OVERLAY ── */}
      <SpotlightOverlay
        targetId={currentSubStepDef.targetId}
        badgeText={t(currentSubStepDef.badgeKey)}
        mentorText={mentorPrompt}
        subText={mentorSubText}
        actionSlot={renderActionSlot()}
        failureCount={failureCount}
        onShowSolution={currentSubStepDef.canShowSolutionAfterFails ? handleShowSolution : undefined}
        onClose={onClose}
      />
    </div>
  );
};
