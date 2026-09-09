/**
 * @file apps/web/src/components/workbench/playground/PlaygroundConsole.tsx
 * @description Execution log console, mentor feedback badge, and live TV state summary
 */

import React from "react";
import { useTranslation } from "react-i18next";
import type { RuntimeResult, VirtualTvState } from "@iw/sim-engine";
import { Terminal, CheckCircle2, XCircle, Info, Zap } from "lucide-react";

interface PlaygroundConsoleProps {
  result: RuntimeResult | null;
  taskPassed: boolean | null;
  feedbackMessage?: string;
  currentTvState: VirtualTvState;
}

export const PlaygroundConsole: React.FC<PlaygroundConsoleProps> = ({
  result,
  taskPassed,
  feedbackMessage,
  currentTvState,
}) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-[#2B2D33] overflow-hidden bg-[#151619] shadow-md space-y-0">
      {/* Console Header */}
      <div className="px-3.5 py-1.5 bg-[#1C1D21] border-b border-[#2B2D33] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-gray-400" />
          <span className="font-mono text-[11px] font-bold text-gray-300">
            {t("playground.consoleTitle")}
          </span>
        </div>

        {/* Live TV State Pill */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-gray-500">{t("playground.tvStateHeading")}:</span>
          <span
            className={`px-1.5 py-0.5 rounded font-bold border ${
              currentTvState.isOn
                ? "bg-emerald-950/60 text-emerald-400 border-emerald-600/40"
                : "bg-gray-800/80 text-gray-400 border-gray-700/60"
            }`}
          >
            PWR: {currentTvState.isOn ? "ON" : "OFF"}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-300 border border-gray-700/60">
            CH: {currentTvState.channel}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-300 border border-gray-700/60">
            VOL: {currentTvState.volume}
          </span>
        </div>
      </div>

      {/* Console Output Body */}
      <div className="p-3 font-mono text-xs space-y-2 min-h-[75px] max-h-[140px] overflow-y-auto">
        {!result ? (
          <div className="text-gray-600 text-xs italic flex items-center gap-1.5 py-2">
            <Info size={13} />
            <span>Натисніть «Запустити код», щоб виконати програму</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Logs from parser / runtime */}
            {result.logs.map((log, i) => (
              <div
                key={i}
                className={`flex items-start gap-1.5 leading-relaxed ${
                  log.type === "mutation"
                    ? "text-purple-300 font-bold"
                    : log.type === "error"
                    ? "text-red-400 font-bold"
                    : "text-gray-400"
                }`}
              >
                {log.type === "mutation" && (
                  <Zap size={12} className="text-purple-400 shrink-0 mt-0.5" />
                )}
                {log.type === "error" && (
                  <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
                )}
                {log.type === "info" && (
                  <Info size={12} className="text-gray-500 shrink-0 mt-0.5" />
                )}
                <span>{log.message}</span>
              </div>
            ))}

            {/* Validation Feedback */}
            {feedbackMessage && (
              <div
                className={`p-2 rounded-xl flex items-start gap-2 text-xs border ${
                  taskPassed
                    ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-300"
                    : "bg-red-950/40 border-red-600/40 text-red-300"
                }`}
              >
                {taskPassed ? (
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="leading-snug">{feedbackMessage}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
