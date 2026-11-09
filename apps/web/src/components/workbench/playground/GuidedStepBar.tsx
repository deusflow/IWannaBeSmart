/**
 * @file apps/web/src/components/workbench/playground/GuidedStepBar.tsx
 * @description Interactive Tutorial Briefing & Reference Solution Card:
 *   Step 1: [  Зразок і контекст ] — ready solution code, memory allocation & project file architecture
 *   Step 2: [  Простими словами ] — plain-language intuition analogy
 *   Step 3: [ ⚙ Інженерна суть ] — strict CS engineering definitions & mechanics
 *   Step 4: [  Анатомія токенів ] — syntax breakdown (why dot, parenthesis, semicolon, interface)
 *   Step 5: [  Карта архітектури ] — project files hierarchy & Architecture Canvas node wiring
 *
 * Design: Pure Porcelain (#FFFFFF / #F8F9FA bg, #0F141C obsidian text, hairline borders)
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Lightbulb,
  Cpu,
  ChevronRight,
  PenLine,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Code2,
  Layers,
} from "lucide-react";
import { audioFx } from "../../../utils/audioFx";
import { getTaskDidacticInfo } from "./taskDidacticContext";
import { theoryUa, theoryEn, theoryDa, type TaskTheory, getLocalizedWorkedExample } from "@iw/i18n";
import { getWorkedExample, type WorkedExample, getTechnologyInsight } from "@iw/sim-engine";
import { GuidedSolutionLayer } from "./guided/GuidedSolutionLayer";
import { GuidedArchitectureLayer } from "./guided/GuidedArchitectureLayer";
import { GuidedTokensLayer } from "./guided/GuidedTokensLayer";
import { GuidedDeepDiveCard } from "./guided/GuidedDeepDiveCard";
import { GuidedTechStackLayer } from "./guided/GuidedTechStackLayer";

// ─── Type definitions ─────────────────────────────────────────────────────────

interface GuidedStepData {
  /** i18n key for the "simple words" layer */
  simpleKey: string;
  /** i18n key for the engineering-precision layer */
  engineeringKey: string;
  /** Task ID for didactic lookup */
  taskId?: string;
  tier?: 0 | 1 | 2;
  codeLang?: string;
  workedExample?: WorkedExample;
  targetCode?: Record<string, string>;
  onOpenArchitectureStudio?: () => void;
}

interface GuidedStepBarProps {
  data: GuidedStepData;
  onStartPractice: () => void;
  persistent?: boolean;
  defaultExpanded?: boolean;
  forceExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  isTheoryUnlocked?: boolean;
  onUnlockPractice?: () => void;
  onOpenArchitectureStudio?: () => void;
  className?: string;
  activeRound?: 1 | 2 | 3 | 4;
}

type TutorialLayer = "solution" | "tokens" | "deepdive";

// ─── Component ────────────────────────────────────────────────────────────────

export const GuidedStepBar: React.FC<GuidedStepBarProps> = ({
  data,
  onStartPractice,
  persistent = true,
  defaultExpanded = false,
  forceExpanded,
  onToggleExpand,
  isTheoryUnlocked = true,
  onUnlockPractice,
  onOpenArchitectureStudio,
  className = "",
  activeRound = 1,
}) => {
  const { t, i18n } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeLayer, setActiveLayer] = useState<TutorialLayer>("solution");
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoExecuted, setDemoExecuted] = useState(false);

  // Progressive disclosure: adapt default active layer to round
  useEffect(() => {
    if (activeRound === 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional state reset on prop/round change
      setActiveLayer("tokens");
    } else if (activeRound === 1) {
      setActiveLayer("solution");
    } else if (activeRound === 4) {
      setActiveLayer("deepdive");
    }
  }, [activeRound]);

  const [prevTaskId, setPrevTaskId] = useState(data.taskId);
  const [prevForceExpanded, setPrevForceExpanded] = useState(forceExpanded);

  if (data.taskId !== prevTaskId) {
    setPrevTaskId(data.taskId);
    setIsExpanded(defaultExpanded);
    setDemoExecuted(false);
  }

  if (forceExpanded !== undefined && forceExpanded !== prevForceExpanded) {
    setPrevForceExpanded(forceExpanded);
    setIsExpanded(forceExpanded);
  }

  if (dismissed && !persistent) return null;

  const currentLang = (i18n.language?.startsWith("da")
    ? "da"
    : i18n.language?.startsWith("en")
    ? "en"
    : "ua") as "ua" | "en" | "da";

  const theoryDict =
    currentLang === "da" ? theoryDa : currentLang === "en" ? theoryEn : theoryUa;

  const codeLang = data.codeLang || "csharp";
  const taskId = data.taskId || "";
  const didactic = taskId ? getTaskDidacticInfo(taskId, currentLang) : undefined;
  const rawWorked = data.workedExample || (taskId ? getWorkedExample(taskId) : undefined);
  const workedExample = getLocalizedWorkedExample(rawWorked, taskId, currentLang);

  // Retrieve theory tokens for syntax breakdown
  const translatedTheory = t(`theory.tasks.${taskId}`, { returnObjects: true }) as TaskTheory;
  const theory: TaskTheory | undefined =
    translatedTheory && translatedTheory.tokens
      ? translatedTheory
      : theoryDict.tasks[taskId] || (taskId.startsWith("task-0") ? theoryDict.tasks["task-0-1-power-on"] : undefined);

  const techInsight = taskId ? getTechnologyInsight(taskId, currentLang) : undefined;

  const simpleText = t(data.simpleKey, { defaultValue: "" });
  const engineeringText = t(data.engineeringKey, { defaultValue: "" });


  const getLocStr = (val?: string | Record<string, string> | null): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val[currentLang] || val.ua || val.en || "";
  };

  const sampleWorkedCode = workedExample
    ? typeof workedExample.sampleCode === "string"
      ? workedExample.sampleCode
      : workedExample.sampleCode[codeLang]
    : undefined;

  const defaultFallbackCode =
    codeLang === "python"
      ? "# Implementation goes here\n"
      : codeLang === "yaml"
      ? "# Pipeline configuration\n"
      : codeLang === "typescript"
      ? "// Implementation\n"
      : codeLang === "go"
      ? "tv.PowerOn()"
      : "tv.PowerOn();";

  const readyCode =
    sampleWorkedCode ||
    data.targetCode?.[codeLang] ||
    defaultFallbackCode;

  const hasArchitecture = Boolean(didactic?.architectureMap);

  const toggleExpanded = () => {
    audioFx.playRelayClick();
    const next = !isExpanded;
    setIsExpanded(next);
    onToggleExpand?.(next);
  };

  const handleRunDemo = () => {
    audioFx.playRelayClick();
    audioFx.playRemoteBeep();
    setIsDemoRunning(true);
    onUnlockPractice?.();
    setTimeout(() => {
      setIsDemoRunning(false);
      setDemoExecuted(true);
      audioFx.playSuccessFanfare();
    }, 500);
  };

  const handleStartPractice = () => {
    audioFx.playSuccessFanfare();
    setIsExpanded(false);
    onToggleExpand?.(false);
    onUnlockPractice?.();
    onStartPractice();
  };

  const selectLayer = (layer: TutorialLayer) => {
    audioFx.playRelayClick();
    setActiveLayer(layer);
    if (!isExpanded) {
      setIsExpanded(true);
      onToggleExpand?.(true);
    }
  };

  const handleOpenStudio = onOpenArchitectureStudio || data.onOpenArchitectureStudio;

  return (
    <div
      id="guided-step-bar-container"
      className={`${className ? `${className} ` : ""}w-full rounded-2xl transition-all duration-300 select-none overflow-hidden ${
        !isTheoryUnlocked
          ? "border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-2 ring-amber-400/30 bg-white"
          : "border border-black/[0.07] bg-white shadow-porcelain"
      }`}
      role="region"
      aria-label="Tutorial Briefing and Guided Explanation"
    >
      {/* ── Top Header Bar (Clickable accordion trigger & 3 clear depth levels) ── */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-black/[0.06] bg-slate-50/80 flex-wrap gap-2">
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-2 cursor-pointer text-left group"
          title={isExpanded ? t("guide.collapse", "Згорнути інструкцію") : t("guide.expand", "Розгорнути еталон і туторіал")}
        >
          <div className="w-6 h-6 rounded-lg bg-[#252932] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles size={13} className="text-[#C5A059]" />
          </div>
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-obsidian group-hover:text-black transition-colors flex items-center gap-1.5 flex-wrap">
            <span>{t("guide.title", "Еталонний зразок та інструкція")}</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-700">
              {codeLang === "csharp" ? "C#" : "Go"}
            </span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 group-hover:text-obsidian flex items-center gap-0.5 transition-colors">
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        </button>

        {/* 3 Clear Layers of Depth */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-slate-100/80 rounded-lg border border-black/[0.06] p-0.5 flex-wrap">
            {/* Level 1: Ready solution */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                selectLayer("solution");
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                activeLayer === "solution" && isExpanded
                  ? "bg-[#252932] text-white shadow-2xs"
                  : "text-slate-600 hover:text-obsidian"
              }`}
            >
              <Code2 size={11} className={activeLayer === "solution" && isExpanded ? "text-[#C5A059]" : ""} />
              <span>{t("guide.solutionTab", "Суть і приклад")}</span>
            </button>

            {/* Level 2: Tokens & Syntax Breakdown */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                selectLayer("tokens");
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                activeLayer === "tokens" && isExpanded
                  ? "bg-[#252932] text-white shadow-2xs"
                  : "text-slate-600 hover:text-obsidian"
              }`}
            >
              <Layers size={11} className={activeLayer === "tokens" && isExpanded ? "text-cyan-400" : ""} />
              <span>{t("guide.tokensTab", "Розбір коду")}</span>
            </button>

            {/* Level 3: Under the Hood (PRO) - progressively revealed in Tier 1+ */}
            {data.tier !== 0 && (
              <button
                id="guided-step-tab-deepdive"
                onClick={(e) => {
                  e.stopPropagation();
                  selectLayer("deepdive");
                }}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeLayer === "deepdive" && isExpanded
                    ? "bg-[#252932] text-white shadow-2xs"
                    : "text-slate-600 hover:text-obsidian"
                }`}
              >
                <Cpu size={11} className={activeLayer === "deepdive" && isExpanded ? "text-indigo-400" : ""} />
                <span>{t("guide.deepDiveTab", "Під капотом")}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-900 border border-amber-600/30 font-extrabold">PRO</span>
              </button>
            )}
          </div>

          {!persistent && (
            <button
              onClick={() => setDismissed(true)}
              className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-obsidian hover:bg-slate-100 transition-colors cursor-pointer"
              title={t("guide.hide", "Приховати")}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Content Area (Expanded View) ── */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200 p-4 space-y-3.5">
          {/* ══════════════════════════════════════════════════════════════════
               LEVEL 1: [ Суть і приклад ]
             ══════════════════════════════════════════════════════════════════ */}
          {activeLayer === "solution" && (
            <GuidedSolutionLayer
              t={t}
              simpleText={simpleText}
              workedExample={workedExample}
              codeLang={codeLang}
              readyCode={readyCode}
              handleRunDemo={handleRunDemo}
              isDemoRunning={isDemoRunning}
              demoExecuted={demoExecuted}
              getLocStr={getLocStr}
              didactic={didactic}
              onOpenArchitectureStudio={handleOpenStudio}
              currentLang={currentLang}
              techInsight={techInsight}
              onSelectTechStack={() => selectLayer("deepdive")}
            />
          )}

          {/* ══════════════════════════════════════════════════════════════════
               LEVEL 2: [ Розбір коду (Токени та аналогія) ]
             ══════════════════════════════════════════════════════════════════ */}
          {activeLayer === "tokens" && (
            <div className="space-y-3">
              {simpleText && (
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-black/[0.06] space-y-1 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-slate-500">
                    <Lightbulb size={11} className="text-amber-700" />
                    <span>{t("guide.simpleLabel", "Аналогія простими словами")}:</span>
                  </div>
                  <p className="font-sans text-xs text-obsidian leading-relaxed">{simpleText}</p>
                </div>
              )}
              {theory?.tokens && theory.tokens.length > 0 ? (
                <GuidedTokensLayer tokens={theory.tokens} t={t} />
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-black/[0.06] font-mono text-xs text-slate-600">
                  {t("guide.whySyntaxTitle", "Синтаксис команди: об'єкт.Метод();")}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
               LEVEL 3: [ Під капотом (PRO) - Архітектура, Технології, Джерела ]
             ══════════════════════════════════════════════════════════════════ */}
          {activeLayer === "deepdive" && (
            <div className="space-y-3">
              {/* Optional Real-World Tech Stack */}
              {techInsight && (
                <div id="guided-step-tab-techstack">
                  <GuidedTechStackLayer insight={techInsight} currentLang={currentLang} />
                </div>
              )}

              {/* Processor Memory & Types */}
              {didactic?.primitiveMemoryNote && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-700/30 space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase text-amber-900 flex items-center gap-1">
                    <Cpu size={12} className="text-amber-800" />
                    <span>{t("guide.memoryAllocationTitle", "Пам'ять процесора та типи (Stack vs Heap):")}</span>
                  </div>
                  <p className="font-sans text-xs text-amber-950 leading-relaxed whitespace-pre-wrap">
                    {didactic.primitiveMemoryNote[codeLang]}
                  </p>
                </div>
              )}

              {/* Full Architecture Map */}
              {hasArchitecture && (
                <GuidedArchitectureLayer didactic={didactic} t={t} onOpenArchitectureStudio={handleOpenStudio} />
              )}

              {/* Engineering definition */}
              {engineeringText && !hasArchitecture && (
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-black/[0.06] space-y-1 shadow-2xs">
                  <div className="font-mono text-[10px] font-bold uppercase text-slate-500">
                    {t("guide.engineeringLabel", "Інженерна суть:")}
                  </div>
                  <p className="font-mono text-xs text-obsidian leading-relaxed whitespace-pre-wrap">{engineeringText}</p>
                </div>
              )}

              {/* Curated Authoritative Sources */}
              {didactic?.curatedResources && didactic.curatedResources.length > 0 && (
                <GuidedDeepDiveCard resources={didactic.curatedResources} currentLang={currentLang} defaultExpanded={true} />
              )}
            </div>
          )}

          {/* ── Footer CTA: Motor Drill Action ── */}
          <div className="px-1 pt-2 flex items-center justify-between border-t border-black/[0.06] flex-wrap gap-2">
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
              <ChevronRight size={11} />
              <span>
                {activeLayer === "solution"
                  ? t("guide.solutionCtaHint", "Переглянули еталон? Тисніть «В бій» для закріплення на трафареті.")
                  : t("guide.otherLayerHint", "Оберіть вкладку для додаткових роз'яснень.")}
              </span>
            </div>

            <button
              id="guided-step-bar-start-practice"
              onClick={handleStartPractice}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-[#C5A059] border border-[#C5A059]/40 font-display font-extrabold text-xs active:scale-95 transition-all cursor-pointer shadow-2xs"
              title={t("guide.startPracticeTooltip", "Згорнути інструкцію та перейти до практики")}
            >
              <PenLine size={13} className="text-[#C5A059]" />
              <span>{t("guide.understoodStartPractice", " Я зрозумів! До практики →")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
