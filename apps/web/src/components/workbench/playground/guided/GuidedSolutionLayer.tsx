/**
 * @file apps/web/src/components/workbench/playground/guided/GuidedSolutionLayer.tsx
 * @description Layer 1: Reference solution code, GRR progress bar, hardware effect, terminal telemetry, and didactics.
 */

import React from "react";
import {
  Lightbulb,
  Cpu,
  FileCode2,
  Network,
  Sparkles,
  CheckCircle2,
  Play,
  Terminal,
  Activity,
  ExternalLink,
} from "lucide-react";
import type { WorkedExample } from "@iw/sim-engine";

export interface GuidedSolutionLayerProps {
  t: (key: string, defaultVal?: any) => string;
  simpleText: string;
  workedExample?: WorkedExample;
  codeLang: "csharp" | "go" | "python" | "yaml" | "typescript" | string;
  readyCode: string;
  handleRunDemo: () => void;
  isDemoRunning: boolean;
  demoExecuted: boolean;
  getLocStr: (val: any) => string;
  didactic?: any;
  onOpenArchitectureStudio?: () => void;
}

const getLangBadge = (lang: string) => {
  switch (lang) {
    case "csharp":
      return "C# (.NET)";
    case "go":
      return "Go (Golang)";
    case "python":
      return "Python 3";
    case "yaml":
      return "YAML Config";
    case "typescript":
      return "TypeScript";
    default:
      return lang.toUpperCase();
  }
};

const getFileName = (lang: string) => {
  switch (lang) {
    case "csharp":
      return "Program.cs";
    case "go":
      return "main.go";
    case "python":
      return "main.py";
    case "yaml":
      return "pipeline.yaml";
    case "typescript":
      return "index.ts";
    default:
      return `${lang}.src`;
  }
};

export const GuidedSolutionLayer: React.FC<GuidedSolutionLayerProps> = ({
  t,
  simpleText,
  workedExample,
  codeLang,
  readyCode,
  handleRunDemo,
  isDemoRunning,
  demoExecuted,
  getLocStr,
  didactic,
  onOpenArchitectureStudio,
}) => {
  return (
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
          <p className="font-sans text-xs text-[#1A1D20] leading-relaxed">
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
                title={t("guide.demoButtonTooltip", "Запустити демонстрацію вчителя з апаратним ефектом та телеметрією")}
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
              {getLangBadge(codeLang)}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-[#181A1E] border border-[#2B2E36] p-3 shadow-inner relative overflow-hidden font-mono text-xs text-white">
          <div className="absolute top-2 right-2.5 flex items-center gap-1 text-[9px] text-gray-500 uppercase font-mono font-bold">
            <span>{getFileName(codeLang)}</span>
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

      {/* Primitive & Memory Deep Note */}
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

      {/* Architecture & Project Files Mapping */}
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
                  <strong>{t("architecture.interfaceLabel", "Контракт")}:</strong> {didactic.architectureMap.contractFile}
                </span>
              </div>
            )}
            {didactic.architectureMap.implementationFile && (
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#FAF8F2] border border-[#1A1D20]/15 text-[#1A1D20]">
                <FileCode2 size={12} className="text-emerald-700 shrink-0" />
                <span className="truncate">
                  <strong>{t("architecture.implementationLabel", "Клас")}:</strong> {didactic.architectureMap.implementationFile}
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] font-sans text-purple-950 leading-relaxed">
            {didactic.architectureMap.canvasWiring}
          </p>

          {onOpenArchitectureStudio && (
            <button
              onClick={onOpenArchitectureStudio}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-900/15 hover:bg-purple-900/25 border border-purple-800/40 text-purple-950 font-mono font-bold text-xs transition-colors cursor-pointer"
            >
              <ExternalLink size={12} />
              <span>{t("guide.viewOnCanvasBtn", "Відкрити на Architecture Canvas")}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
