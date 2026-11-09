/**
 * @file apps/web/src/components/workbench/playground/guided/GuidedSolutionLayer.tsx
 * @description Layer 1: Reference solution code, GRR progress bar, hardware effect, terminal telemetry, and didactics.
 */

import React from "react";
import {
  Lightbulb,
  CheckCircle2,
  Play,
  Terminal,
  Activity,
} from "lucide-react";
import type { TFunction } from "i18next";
import type { WorkedExample, TechnologyInsight } from "@iw/sim-engine";
import type { TaskDidacticInfo } from "../taskDidacticContext";

export interface GuidedSolutionLayerProps {
  t: TFunction;
  simpleText: string;
  workedExample?: WorkedExample;
  codeLang: "csharp" | "go" | "python" | "yaml" | "typescript" | string;
  readyCode: string;
  handleRunDemo: () => void;
  isDemoRunning: boolean;
  demoExecuted: boolean;
  getLocStr: (val?: string | Record<string, string> | null) => string;
  didactic?: TaskDidacticInfo;
  onOpenArchitectureStudio?: () => void;
  currentLang?: "ua" | "en" | "da";
  techInsight?: TechnologyInsight;
  onSelectTechStack?: () => void;
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
  currentLang = "ua",
}) => {
  return (
    <div className="space-y-3">
      {/* ── 1. Вступ і контекст ── */}
      <div className="p-3.5 rounded-xl bg-slate-50/70 border border-black/[0.06] space-y-1.5 shadow-2xs">
        <div className="flex items-start gap-2">
          <Lightbulb size={13} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 w-full min-w-0">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t("guide.introContextTitle", "1. Контекст і завдання:")}
            </span>
            <p className="font-sans text-xs text-obsidian font-medium leading-relaxed">
              {simpleText || didactic?.pacingLeading?.leading[currentLang] || t("guide.leadingDefault", "Виконайте команду для взаємодії з пристроєм.")}
            </p>
            {didactic?.pacingLeading?.leading?.[currentLang] && simpleText && (
              <div className="pt-1 border-t border-black/[0.04] text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                <span className="text-[#C5A059] font-bold">👉</span>
                <span>{didactic.pacingLeading.leading[currentLang]}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Еталонний код та демонстрація ── */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-600 mb-1.5 flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-700" />
            <span>{t("guide.section2Title", "2. Еталонний код та демонстрація:")}</span>
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
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-obsidian border border-black/[0.08] font-bold">
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

      {/* Hardware Effect & Telemetry */}
      {workedExample && (
        <div className="space-y-2">
          <div
            className={`p-3 rounded-xl border transition-all duration-300 ${
              isDemoRunning
                ? "bg-amber-500/25 border-amber-500 shadow-md ring-2 ring-amber-400/50"
                : demoExecuted
                ? "bg-emerald-900/10 border-emerald-700/40 text-emerald-950"
                : "bg-slate-50/70 border border-black/[0.06]"
            }`}
          >
            <div className="text-[10px] font-mono font-bold uppercase text-slate-600 flex items-center gap-1.5 mb-1">
              <Activity size={12} className="text-emerald-700 shrink-0" />
              <span>{t("guide.hardwareEffectTitle", "Апаратний ефект пристрою:")}</span>
            </div>
            <p className="font-sans text-xs text-obsidian font-semibold leading-relaxed">
              {getLocStr(workedExample.demonstrationLog.hardwareEffect)}
            </p>
          </div>

          <div className="rounded-xl bg-[#0F141C] border border-[#1F2937] p-2.5 shadow-inner font-mono text-[11px] text-gray-200 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-800 pb-1 mb-1">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Terminal size={12} />
                <span>{t("guide.terminalTitle", "Системна телеметрія:")}</span>
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
        </div>
      )}

      {/* ── 3. Підсумок і правило інженера ── */}
      <div className="p-3.5 rounded-xl bg-slate-50/70 border border-black/[0.06] space-y-1.5 shadow-2xs">
        <div className="text-[10px] font-mono font-bold uppercase text-slate-500 flex items-center gap-1">
          <Lightbulb size={11} className="text-amber-700" />
          <span>{t("guide.conclusionTitle", "3. Головний висновок (Запам'ятайте):")}</span>
        </div>
        <p className="font-sans text-xs text-obsidian leading-relaxed">
          {didactic?.whyThisCode?.[codeLang] ||
            (workedExample ? getLocStr(workedExample.explanation) : t("guide.defaultTakeaway", "Крапка з комою завершує команду в C#, а круглі дужки виконують дію."))}
        </p>
        {didactic?.primitiveMemoryNote?.[codeLang] && (
          <div className="pt-1.5 border-t border-black/[0.04] text-[11px] text-slate-600 font-mono flex items-start gap-1">
            <span className="text-indigo-600 font-bold shrink-0">🧠 Пам'ять:</span>
            <span>{didactic.primitiveMemoryNote[codeLang]}</span>
          </div>
        )}
      </div>
    </div>
  );
};
