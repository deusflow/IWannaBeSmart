/**
 * @file apps/web/src/components/workbench/playground/GuidedStepBar.tsx
 * @description Interactive Tutorial Briefing & Reference Solution Card:
 *   Step 1: [ 🎯 Зразок і контекст ] — ready solution code, memory allocation & project file architecture
 *   Step 2: [ 💡 Простими словами ] — plain-language intuition analogy
 *   Step 3: [ ⚙️ Інженерна суть ] — strict CS engineering definitions & mechanics
 *   Step 4: [ 🧩 Анатомія токенів ] — syntax breakdown (why dot, parenthesis, semicolon, interface)
 *   Step 5: [ 🗺️ Карта архітектури ] — project files hierarchy & Architecture Canvas node wiring
 *
 * Design: Blueprint parchment (#EBE5D8 bg, #1A1D20 graphite text, elegant tactile borders)
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
  Network,
  Sparkles,
  Code2,
  Layers,
} from "lucide-react";
import { audioFx } from "../../../utils/audioFx";
import { getTaskDidacticInfo } from "./taskDidacticContext";
import { theoryUa, theoryEn, theoryDa, type TaskTheory, getLocalizedWorkedExample } from "@iw/i18n";
import { getWorkedExample, type WorkedExample } from "@iw/sim-engine";
import { GuidedSolutionLayer } from "./guided/GuidedSolutionLayer";
import { GuidedArchitectureLayer } from "./guided/GuidedArchitectureLayer";
import { GuidedTokensLayer } from "./guided/GuidedTokensLayer";

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface GuidedStepData {
  /** i18n key for the "simple words" layer */
  simpleKey: string;
  /** i18n key for the engineering-precision layer */
  engineeringKey: string;
  /** Task ID for didactic lookup */
  taskId?: string;
  tier?: 0 | 1 | 2;
  codeLang?: "csharp" | "go";
  workedExample?: WorkedExample;
  targetCode?: {
    csharp: string;
    go: string;
  };
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
}

export type TutorialLayer = "solution" | "simple" | "engineering" | "tokens" | "architecture";

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
}) => {
  const { t, i18n } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeLayer, setActiveLayer] = useState<TutorialLayer>("solution");
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoExecuted, setDemoExecuted] = useState(false);

  useEffect(() => {
    setIsExpanded(defaultExpanded);
    setDemoExecuted(false);
  }, [data.taskId, defaultExpanded]);

  useEffect(() => {
    if (forceExpanded !== undefined) {
      setIsExpanded(forceExpanded);
    }
  }, [forceExpanded]);

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

  const simpleText = t(data.simpleKey, { defaultValue: "" });
  const engineeringText = t(data.engineeringKey, { defaultValue: "" });


  const getLocStr = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val[currentLang] || val.ua || val.en || "";
  };

  const sampleWorkedCode = workedExample
    ? typeof workedExample.sampleCode === "string"
      ? workedExample.sampleCode
      : workedExample.sampleCode[codeLang]
    : undefined;

  const readyCode =
    sampleWorkedCode ||
    data.targetCode?.[codeLang] ||
    (codeLang === "go" ? "tv.PowerOn()" : "tv.PowerOn();");

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
          ? "border-2 border-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/40 bg-[#EBE5D8]"
          : "border border-[#1A1D20]/20 bg-[#EBE5D8] shadow-[0_2px_14px_rgba(26,29,32,0.08)]"
      }`}
      role="region"
      aria-label="Tutorial Briefing and Guided Explanation"
    >
      {/* ── Top Header Bar (Clickable accordion trigger & layer selector pills) ── */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#1A1D20]/12 bg-[#E4DDD0] flex-wrap gap-2">
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-2 cursor-pointer text-left group"
          title={isExpanded ? t("guide.collapse", "Згорнути інструкцію") : t("guide.expand", "Розгорнути еталон і туторіал")}
        >
          <div className="w-6 h-6 rounded-lg bg-[#1A1D20] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={13} className="text-amber-400" />
          </div>
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#1A1D20] group-hover:text-black transition-colors flex items-center gap-1.5 flex-wrap">
            <span>{t("guide.title", "Еталонний зразок та інструкція")}</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#1A1D20]/10 text-[#1A1D20]/80">
              {codeLang === "csharp" ? "C#" : "Go"}
            </span>
            {!isTheoryUnlocked && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-mono text-[9px] font-extrabold flex items-center gap-1 animate-pulse shadow-xs">
                <Sparkles size={10} className="fill-stone-950" />
                <span>{t("guide.theoryRequirementBadge", "✨ Почніть тут: ознайомтесь із поясненням")}</span>
              </span>
            )}
          </span>
          <span className="text-[10px] font-mono text-[#1A1D20]/50 group-hover:text-[#1A1D20] flex items-center gap-0.5 transition-colors">
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        </button>

        {/* Layer toggle pills */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-[#DDD7CC] rounded-lg border border-[#1A1D20]/15 p-0.5 flex-wrap">
            {/* Tab 1: Ready solution */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                selectLayer("solution");
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                activeLayer === "solution" && isExpanded
                  ? "bg-[#1A1D20] text-white shadow-xs"
                  : "text-[#1A1D20]/70 hover:text-[#1A1D20]"
              }`}
            >
              <Code2 size={11} className={activeLayer === "solution" && isExpanded ? "text-amber-400" : ""} />
              <span>{t("guide.solutionTab", "🎯 Зразок")}</span>
            </button>

            {/* Tab 2: Simple words */}
            {simpleText && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectLayer("simple");
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeLayer === "simple" && isExpanded
                    ? "bg-[#1A1D20] text-white shadow-xs"
                    : "text-[#1A1D20]/70 hover:text-[#1A1D20]"
                }`}
              >
                <Lightbulb size={11} className={activeLayer === "simple" && isExpanded ? "text-amber-300" : ""} />
                <span>{t("guide.simpleTab", "💡 Аналогія")}</span>
              </button>
            )}

            {/* Tab 3: Engineering */}
            {engineeringText && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectLayer("engineering");
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeLayer === "engineering" && isExpanded
                    ? "bg-[#1A1D20] text-white shadow-xs"
                    : "text-[#1A1D20]/70 hover:text-[#1A1D20]"
                }`}
              >
                <Cpu size={11} className={activeLayer === "engineering" && isExpanded ? "text-emerald-400" : ""} />
                <span>{t("guide.engineeringTab", "⚙️ Інженерія")}</span>
              </button>
            )}

            {/* Tab 4: Architecture map (Tier 2 / Architecture tasks) */}
            {hasArchitecture && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectLayer("architecture");
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeLayer === "architecture" && isExpanded
                    ? "bg-[#1A1D20] text-white shadow-xs"
                    : "text-[#1A1D20]/70 hover:text-[#1A1D20]"
                }`}
              >
                <Network size={11} className={activeLayer === "architecture" && isExpanded ? "text-purple-400" : ""} />
                <span>{t("guide.architectureTab", "🗺️ Архітектура")}</span>
              </button>
            )}

            {/* Tab 5: Tokens */}
            {theory?.tokens && theory.tokens.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectLayer("tokens");
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeLayer === "tokens" && isExpanded
                    ? "bg-[#1A1D20] text-white shadow-xs"
                    : "text-[#1A1D20]/70 hover:text-[#1A1D20]"
                }`}
              >
                <Layers size={11} className={activeLayer === "tokens" && isExpanded ? "text-cyan-400" : ""} />
                <span>{t("guide.tokensTab", "🧩 Токени")}</span>
              </button>
            )}
          </div>

          {!persistent && (
            <button
              onClick={() => setDismissed(true)}
              className="w-5 h-5 rounded-md flex items-center justify-center text-[#1A1D20]/40 hover:text-[#1A1D20] hover:bg-[#1A1D20]/10 transition-colors cursor-pointer"
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
               LAYER 1: [ 🎯 Зразок і контекст ] (Reference Solution & Context)
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
            />
          )}

          {/* ══════════════════════════════════════════════════════════════════
               LAYER 2: [ 💡 Простими словами ] (Plain Intuition)
             ══════════════════════════════════════════════════════════════════ */}
          {activeLayer === "simple" && (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1A1D20]/8 border border-[#1A1D20]/15">
                <Lightbulb size={11} className="text-amber-800" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A1D20]/70">
                  {t("guide.simpleLabel", "Простими словами (Intuition Analogy)")}
                </span>
              </div>
              <p className="font-balsamiq text-xs text-[#1A1D20] leading-relaxed">
                {simpleText}
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
               LAYER 3: [ ⚙️ Інженерна суть ] (Technical Engineering)
             ══════════════════════════════════════════════════════════════════ */}
          {activeLayer === "engineering" && (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1A1D20]/8 border border-[#1A1D20]/15">
                <Cpu size={11} className="text-emerald-800" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A1D20]/70">
                  {t("guide.engineeringLabel", "Інженерна суть (CS Architecture Definition)")}
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#1A1D20] leading-relaxed whitespace-pre-wrap">
                {engineeringText}
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
               LAYER 4: [ 🗺️ Архітектура ] (Full Architecture Map)
             ══════════════════════════════════════════════════════════════════ */}
          {activeLayer === "architecture" && (
            <GuidedArchitectureLayer
              didactic={didactic}
              t={t}
              onOpenArchitectureStudio={handleOpenStudio}
            />
          )}

          {/* ══════════════════════════════════════════════════════════════════
               LAYER 5: [ 🧩 Токени ] (Syntax Token Anatomy Breakdown)
             ══════════════════════════════════════════════════════════════════ */}
          {activeLayer === "tokens" && theory?.tokens && (
            <GuidedTokensLayer
              tokens={theory.tokens}
              t={t}
            />
          )}

          {/* ── Footer CTA: Motor Drill Action ── */}
          <div className="px-1 pt-2 flex items-center justify-between border-t border-[#1A1D20]/10 flex-wrap gap-2">
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#1A1D20]/60">
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-extrabold text-xs active:scale-95 transition-all cursor-pointer shadow-md shadow-amber-500/20"
              title={t("guide.startPracticeTooltip", "Згорнути інструкцію та перейти до практики")}
            >
              <PenLine size={13} className="text-stone-950" />
              <span>{t("guide.understoodStartPractice", "👉 Я зрозумів! До практики →")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
