/**
 * @file apps/web/src/components/workbench/architecture/CounterfactualPanel.tsx
 * @description Compact interactive panel (Fusion / Blender style) for Bypass v1 and cause-effect reasoning.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
  ZapOff,
  Cpu,
} from "lucide-react";
import type { TraceGraph } from "./types";

export interface CounterfactualPanelProps {
  graph: TraceGraph;
  bypassedNodeIds: string[];
  onToggleBypass: (nodeId: string) => void;
  onResetBypasses: () => void;
}

export const CounterfactualPanel: React.FC<CounterfactualPanelProps> = ({
  graph,
  bypassedNodeIds,
  onToggleBypass,
  onResetBypasses,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasBypass = bypassedNodeIds.length > 0;
  const isBroken = graph.isBroken;

  // Key candidates for bypass toggle (interfaces, implementations, DI registrations)
  const toggleableNodes = graph.nodes.filter((n) => n.type !== "Effect");

  // Summary message for student
  const getExplanation = () => {
    if (bypassedNodeIds.includes("node-trace-di-reg")) {
      return {
        title: "Обійдено реєстрацію в DI (Dependency Injection)",
        effect:
          "Контролер TVController не отримає об'єкт через конструктор. Спроба викликати Execute() викличе NullReferenceException, і екран телевізора не увімкнеться.",
      };
    }
    if (bypassedNodeIds.includes("node-trace-decl")) {
      return {
        title: "Обійдено контракт IRemoteCommand",
        effect:
          "Без оголошення інтерфейсу класи команд не мають спільного типу. Архітектура втрачає поліморфізм і взаємозамінність деталей.",
      };
    }
    if (bypassedNodeIds.includes("node-trace-impl-power")) {
      return {
        title: "Обійдено конкретну реалізацію PowerCommand",
        effect:
          "Контейнер не знає, який клас створити для виконання дії. Живлення ТВ не може бути змінено.",
      };
    }
    if (isBroken) {
      return {
        title: "Розрив ланцюга виконання",
        effect:
          graph.brokenReason ||
          "Один із проміжних вузлів відключено. Сигнал не доходить до кінцевого апаратного блоку.",
      };
    }
    return {
      title: "Ланцюг замкнено штатно",
      effect:
        "Всі ланки (оголошення → реалізація → реєстрація в DI → конструктор → виклик → екран) активні. Натискання кнопки пульта увімкне телевізор.",
    };
  };

  const explanation = getExplanation();

  return (
    <div
      className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-[760px] rounded-xl border backdrop-blur-md transition-all duration-200 select-none shadow-2xl ${
        isBroken
          ? "bg-[#1C1315]/95 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          : "bg-[#18191D]/95 border-white/[0.08]"
      }`}
    >
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] rounded-xl transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isBroken
                ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
            }`}
          >
            {isBroken ? <ZapOff size={15} /> : <Cpu size={15} />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-gray-200 truncate">
                {t("counterfactual.title", "Counterfactual (Bypass v1)")}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${
                  isBroken
                    ? "bg-red-500/20 text-red-300 border-red-500/40"
                    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                }`}
              >
                {isBroken ? t("counterfactual.broken", "ЛАНЦЮГ РОЗІРВАНО") : t("counterfactual.nominal", "ШТАТНИЙ СТАН")}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-sans truncate mt-0.5">
              {explanation.title}: <span className="text-gray-300">{explanation.effect}</span>
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {hasBypass && (
            <button
              onClick={onResetBypasses}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-200 text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95"
              title={t("counterfactual.resetAll", "Скинути всі обходи")}
            >
              <RotateCcw size={11} />
              <span>{t("counterfactual.reset", "Скинути")}</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg bg-[#25262B] hover:bg-[#303137] text-gray-400 hover:text-gray-200 border border-white/[0.06] transition-colors cursor-pointer"
            title={isExpanded ? "Згорнути" : "Розгорнути"}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded body: toggles for each node */}
      {isExpanded && (
        <div className="px-4 pb-3 pt-1 border-t border-white/[0.06] space-y-3 animate-fadeIn">
          <div className="text-[11px] text-gray-300 leading-relaxed font-sans">
            <strong>{t("counterfactual.whyTitle", "Як це працює:")}</strong>{" "}
            {t(
              "counterfactual.whyDesc",
              "Вимкніть будь-який вузол (Bypass), щоб перевірити причинно-наслідковий зв'язок: ви побачите, які залежні ланки забарвляться червоним пунктиром і як саме це вплине на телевізор."
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {toggleableNodes.map((node) => {
              const bypassed = bypassedNodeIds.includes(node.id);
              return (
                <div
                  key={node.id}
                  onClick={() => onToggleBypass(node.id)}
                  className={`p-2 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    bypassed
                      ? "bg-red-500/15 border-red-500/40 text-red-200"
                      : "bg-[#222328] border-white/[0.06] hover:border-white/20 text-gray-300"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-bold truncate">
                      {node.type}
                    </div>
                    <div className="text-[9px] text-gray-400 truncate">
                      {node.label}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {bypassed ? (
                      <ToggleRight size={18} className="text-red-400" />
                    ) : (
                      <ToggleLeft size={18} className="text-gray-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isBroken && (
            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/40 flex items-start gap-2 text-[11px] font-sans text-red-200">
              <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong>{explanation.title}</strong>
                <p className="mt-0.5 text-red-300 text-[10px] leading-relaxed">
                  {explanation.effect}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
