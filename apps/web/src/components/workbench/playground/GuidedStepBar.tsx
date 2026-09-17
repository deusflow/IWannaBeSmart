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
  FileCode2,
  Network,
  Sparkles,
  CheckCircle2,
  Code2,
  Layers,
  ExternalLink,
  Play,
  Terminal,
  Activity,
} from "lucide-react";
import { audioFx } from "../../../utils/audioFx";
import { getTaskDidacticInfo } from "./taskDidacticContext";
import { theoryUa, type TaskTheory } from "@iw/i18n";
import { getWorkedExample, type WorkedExample } from "@iw/sim-engine";

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

  const codeLang = data.codeLang || "csharp";
  const taskId = data.taskId || "";
  const didactic = taskId ? getTaskDidacticInfo(taskId) : undefined;
  const workedExample = data.workedExample || (taskId ? getWorkedExample(taskId) : undefined);

  // Retrieve theory tokens for syntax breakdown
  const translatedTheory = t(`theory.tasks.${taskId}`, { returnObjects: true }) as TaskTheory;
  const theory: TaskTheory =
    translatedTheory && translatedTheory.tokens
      ? translatedTheory
      : theoryUa.tasks[taskId] || theoryUa.tasks["task-0-1-power-on"];

  const simpleText = t(data.simpleKey, { defaultValue: "" });
  const engineeringText = t(data.engineeringKey, { defaultValue: "" });

  const currentLang = (i18n.language?.startsWith("da")
    ? "da"
    : i18n.language?.startsWith("en")
    ? "en"
    : "ua") as "ua" | "en" | "da";

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

  return (
    <div
      id="guided-step-bar-container"
      className={`w-full rounded-2xl transition-all duration-300 select-none overflow-hidden ${
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
            <div className="space-y-3">
              {/* 3-Tact GRR Progress Navigation Banner */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141820] border border-[#232936] text-[11px] font-mono text-gray-300 flex-wrap gap-2 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400 shrink-0" />
                  <span className="font-bold text-white tracking-wide text-xs">
                    Gradual Release of Responsibility (GRR)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-amber-500/25 text-amber-300 font-extrabold border border-amber-500/40">
                    {t("guide.tact1Header", "Такт 1: Вчитель показує")}
                  </span>
                  <span className="text-gray-500 font-bold">→</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300/80 border border-blue-500/20">
                    {t("guide.tact2Header", "Такт 2: Повтори зі мною")}
                  </span>
                  <span className="text-gray-500 font-bold">→</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300/80 border border-emerald-500/20">
                    {t("guide.tact3Header", "Такт 3: Тепер ти сам")}
                  </span>
                </div>
              </div>

              {/* Upfront Plain-Language Intuition Analogy */}
              {simpleText && (
                <div className="p-3 rounded-xl bg-[#FAF8F2] border border-amber-600/30 space-y-1 shadow-2xs">
                  <div className="text-[10px] font-mono font-bold uppercase text-amber-900 flex items-center gap-1.5">
                    <Lightbulb size={12} className="text-amber-700 shrink-0" />
                    <span>{t("guide.simpleLabel", "Простими словами (Intuition Analogy)")}</span>
                  </div>
                  <p className="font-balsamiq text-xs text-[#1A1D20] leading-relaxed">
                    {simpleText}
                  </p>
                </div>
              )}

              {/* Ready Working Code Box with ▶ Демонстрація button */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#1A1D20]/80 mb-1.5 flex-wrap gap-2">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    <span>{t("guide.readyCodeTitle", "Такт 1: Еталонний код вчителя (Sample Code):")}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {workedExample && (
                      <button
                        id="btn-run-demonstration"
                        onClick={handleRunDemo}
                        disabled={isDemoRunning}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-xs ${
                          isDemoRunning
                            ? "bg-amber-600 text-white animate-pulse"
                            : demoExecuted
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "bg-amber-500 hover:bg-amber-400 text-black active:scale-95"
                        }`}
                        title="Запустити демонстрацію вчителя з апаратним ефектом та телеметрією"
                      >
                        <Play size={12} className="fill-current" />
                        <span>
                          {isDemoRunning
                            ? t("guide.demoRunning", "Виконується...")
                            : demoExecuted
                            ? t("guide.demoRepeated", "✓ Продемонстровано (Повторити)")
                            : t("guide.demoButton", "▶ Демонстрація")}
                        </span>
                      </button>
                    )}
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1A1D20]/10 font-bold">
                      {codeLang === "csharp" ? "C# (.NET)" : "Go (Golang)"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#181A1E] border border-[#2B2E36] p-3 shadow-inner relative overflow-hidden font-mono text-xs text-white">
                  <div className="absolute top-2 right-2.5 flex items-center gap-1 text-[9px] text-gray-500 uppercase font-mono font-bold">
                    <span>{codeLang === "csharp" ? "Program.cs" : "main.go"}</span>
                  </div>
                  <pre className="overflow-x-auto text-emerald-300 font-bold whitespace-pre-wrap leading-relaxed selection:bg-emerald-500/30">
                    <code>{readyCode}</code>
                  </pre>
                </div>
              </div>

              {/* Physical Hardware Effect & Terminal Demonstration Logs */}
              {workedExample && (
                <div className="space-y-2.5">
                  {/* Hardware effect alert */}
                  <div
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      isDemoRunning
                        ? "bg-amber-500/25 border-amber-500 shadow-md ring-2 ring-amber-400/50"
                        : demoExecuted
                        ? "bg-emerald-900/10 border-emerald-700/40 text-emerald-950"
                        : "bg-[#FAF8F2] border-[#1A1D20]/15"
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold uppercase text-[#1A1D20]/80 flex items-center gap-1.5 mb-1">
                      <Activity size={12} className="text-emerald-700 shrink-0" />
                      <span>{t("guide.hardwareEffectTitle", "Апаратний ефект пристрою (Hardware Effect):")}</span>
                    </div>
                    <p className="font-sans text-xs text-[#1A1D20] font-semibold leading-relaxed">
                      {getLocStr(workedExample.demonstrationLog.hardwareEffect)}
                    </p>
                  </div>

                  {/* Terminal telemetry log bus */}
                  <div className="rounded-xl bg-[#0F141C] border border-[#1F2937] p-3 shadow-inner font-mono text-[11px] text-gray-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-800 pb-1 mb-1.5">
                      <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                        <Terminal size={12} />
                        <span>{t("guide.terminalTitle", "Системна телеметрія (Hardware Bus Terminal):")}</span>
                      </span>
                      <span className="text-[9px] text-emerald-400">● LIVE RUNTIME</span>
                    </div>
                    <div className="space-y-0.5 text-emerald-400/90 font-mono">
                      {workedExample.demonstrationLog.terminal.map((line, idx) => (
                        <div key={idx} className="leading-tight flex items-start gap-1">
                          <span className="text-gray-600 select-none">&gt;</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teacher Step-by-Step Explanation */}
                  <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/15 space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase text-[#1A1D20]/70 flex items-center gap-1">
                      <Lightbulb size={11} className="text-amber-700 shrink-0" />
                      <span>{t("guide.teacherCardTitle", "Пояснення вчителя (Teacher Card):")}</span>
                    </div>
                    <p className="font-sans text-xs text-[#1A1D20] leading-relaxed">
                      {getLocStr(workedExample.explanation)}
                    </p>
                  </div>

                  {/* Preview of Tact 2 and Tact 3 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-blue-600/25 space-y-1">
                      <div className="text-[10px] font-mono font-bold uppercase text-blue-900 flex items-center gap-1">
                        <span>{t("guide.tact2ClozeTitle", "Такт 2: Повтори зі мною (Cloze)")}</span>
                      </div>
                      <p className="text-[11px] font-sans text-blue-950">
                        {t(
                          "guide.tact2ClozeDesc",
                          "Заповніть пропуски ___ у коді. Система миттєво перевіряє кожен символ."
                        )}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-emerald-600/25 space-y-1">
                      <div className="text-[10px] font-mono font-bold uppercase text-emerald-900 flex items-center gap-1">
                        <span>{t("guide.tact3PromptTitle", "Такт 3: Тепер ти сам")}</span>
                      </div>
                      <p className="text-[11px] font-sans text-emerald-950">
                        {getLocStr(workedExample.finalChallenge.prompt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Didactic explanation: why this syntax */}
              {didactic?.whyThisCode && (
                <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/15 space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase text-[#1A1D20]/70 flex items-center gap-1">
                    <Lightbulb size={11} className="text-amber-700" />
                    <span>{t("guide.whySyntaxTitle", "Чому саме такий синтаксис:")}</span>
                  </div>
                  <p className="font-sans text-xs text-[#1A1D20] leading-relaxed">
                    {didactic.whyThisCode[codeLang]}
                  </p>
                </div>
              )}

              {/* Primitive & Memory Deep Note (Integer without quotes vs String with quotes) */}
              {didactic?.primitiveMemoryNote && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-700/30 space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase text-amber-900 flex items-center gap-1">
                    <Cpu size={12} className="text-amber-800" />
                    <span>{t("guide.memoryAllocationTitle", "Пам'ять процесора та типи (Memory & Types):")}</span>
                  </div>
                  <p className="font-sans text-xs text-amber-950 leading-relaxed whitespace-pre-wrap">
                    {didactic.primitiveMemoryNote[codeLang]}
                  </p>
                </div>
              )}

              {/* Architecture & Project Files Mapping (For Tier 2 tasks) */}
              {didactic?.architectureMap && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-700/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-purple-900 flex items-center gap-1">
                      <Network size={12} className="text-purple-800" />
                      <span>{t("guide.projectStructureTitle", "Структура проєкту та Architecture Canvas:")}</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-600/20 text-purple-900 font-bold">
                      {didactic.architectureMap.canvasNodeName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    {didactic.architectureMap.contractFile && (
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#FAF8F2] border border-[#1A1D20]/15 text-[#1A1D20]">
                        <FileCode2 size={12} className="text-purple-700 shrink-0" />
                        <span className="truncate">
                          <strong>Контракт:</strong> {didactic.architectureMap.contractFile}
                        </span>
                      </div>
                    )}
                    {didactic.architectureMap.implementationFile && (
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#FAF8F2] border border-[#1A1D20]/15 text-[#1A1D20]">
                        <FileCode2 size={12} className="text-emerald-700 shrink-0" />
                        <span className="truncate">
                          <strong>Клас:</strong> {didactic.architectureMap.implementationFile}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] font-sans text-purple-950 leading-relaxed">
                    {didactic.architectureMap.canvasWiring}
                  </p>

                  {data.onOpenArchitectureStudio && (
                    <button
                      onClick={data.onOpenArchitectureStudio}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-900/15 hover:bg-purple-900/25 border border-purple-800/40 text-purple-950 font-mono font-bold text-xs transition-colors cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      <span>{t("guide.viewOnCanvasBtn", "Відкрити на Architecture Canvas")}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
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
          {activeLayer === "architecture" && didactic?.architectureMap && (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-600/10 border border-purple-600/25">
                <Network size={11} className="text-purple-800" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-purple-900">
                  {t("guide.architectureMapTitle", "Архітектурна карта зв'язків (Architecture Map)")}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/20 space-y-2.5">
                <div className="font-display font-bold text-xs text-[#1A1D20]">
                  {didactic.architectureMap.architectureHint}
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  {didactic.architectureMap.contractFile && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#EBE5D8] border border-[#1A1D20]/15">
                      <span className="text-purple-700 font-bold">📄 {t("architecture.interfaceLabel", "Інтерфейс")}:</span>
                      <code className="text-[#1A1D20]">{didactic.architectureMap.contractFile}</code>
                    </div>
                  )}
                  {didactic.architectureMap.implementationFile && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#EBE5D8] border border-[#1A1D20]/15">
                      <span className="text-emerald-700 font-bold">⚙️ {t("architecture.implementationLabel", "Реалізація")}:</span>
                      <code className="text-[#1A1D20]">{didactic.architectureMap.implementationFile}</code>
                    </div>
                  )}
                  {didactic.architectureMap.clientFile && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#EBE5D8] border border-[#1A1D20]/15">
                      <span className="text-blue-700 font-bold">🔌 {t("architecture.dispatcherLabel", "Диспетчер")}:</span>
                      <code className="text-[#1A1D20]">{didactic.architectureMap.clientFile}</code>
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-600/25 text-[11px] font-mono text-purple-950">
                  <strong>{t("architecture.canvasNodeLabel", "Нода на полотні")}:</strong> {didactic.architectureMap.canvasWiring}
                </div>

                {data.onOpenArchitectureStudio && (
                  <button
                    onClick={data.onOpenArchitectureStudio}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A1D20] text-white font-display font-bold text-xs hover:bg-black transition-colors cursor-pointer shadow-sm"
                  >
                    <Network size={13} />
                    <span>{t("guide.switchStudioBtn", "Перейти до Architecture Studio")}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
               LAYER 5: [ 🧩 Токени ] (Syntax Token Anatomy Breakdown)
             ══════════════════════════════════════════════════════════════════ */}
          {activeLayer === "tokens" && theory?.tokens && (
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1A1D20]/8 border border-[#1A1D20]/15">
                <Layers size={11} className="text-[#1A1D20]/70" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A1D20]/70">
                  {t("theory.tokensTitle", "Анатомія по токенах (Token Breakdown)")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {theory.tokens.map((tok, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/15 space-y-0.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <code className="px-1.5 py-0.2 rounded bg-[#181A1E] text-emerald-400 font-mono text-[11px] font-bold">
                        {tok.token}
                      </code>
                      <span className="text-[9px] font-mono font-bold uppercase text-[#1A1D20]/60 truncate">
                        {tok.role}
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-[#1A1D20]/85 leading-snug">
                      {tok.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
