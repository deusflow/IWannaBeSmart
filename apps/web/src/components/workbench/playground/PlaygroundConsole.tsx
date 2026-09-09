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
      <div className="p-3.5 font-mono text-xs space-y-2.5 min-h-[95px] max-h-[190px] overflow-y-auto">
        {!result ? (
          <div className="text-gray-500 text-xs italic flex items-center gap-2 py-3">
            <Info size={14} className="text-gray-500 shrink-0" />
            <span>Натисніть «Запустити код», щоб виконати програму</span>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Logs from parser / runtime */}
            {result.logs.map((log, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 leading-relaxed ${
                  log.type === "mutation"
                    ? "text-purple-300 font-bold"
                    : log.type === "error"
                    ? "text-red-400 font-bold"
                    : "text-gray-400"
                }`}
              >
                {log.type === "mutation" && (
                  <Zap size={13} className="text-purple-400 shrink-0 mt-0.5" />
                )}
                {log.type === "error" && (
                  <XCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                )}
                {log.type === "info" && (
                  <Info size={13} className="text-gray-500 shrink-0 mt-0.5" />
                )}
                <span>{log.message}</span>
              </div>
            ))}

            {/* Validation Feedback */}
            {feedbackMessage && (
              <div
                className={`p-3 rounded-xl flex items-start gap-2.5 text-xs border ${
                  taskPassed
                    ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-300 shadow-xs"
                    : "bg-red-950/40 border-red-600/40 text-red-300 shadow-xs"
                }`}
              >
                {taskPassed ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed font-sans font-medium">{feedbackMessage}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
