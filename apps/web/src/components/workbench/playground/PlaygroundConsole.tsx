/**
 * @file apps/web/src/components/workbench/playground/PlaygroundConsole.tsx
 * @description Execution log console, mentor feedback badge, live TV state summary, and Career Impact card
 */

import React from "react";
import { useTranslation } from "react-i18next";
import type { RuntimeResult, VirtualTvState, CodingTask } from "@iw/sim-engine";
import { Terminal, CheckCircle2, XCircle, Info, Zap, Briefcase } from "lucide-react";

interface PlaygroundConsoleProps {
  result: RuntimeResult | null;
  taskPassed: boolean | null;
  feedbackMessage?: string;
  currentTvState: VirtualTvState;
  currentTask?: CodingTask;
  phase?: "demo" | "practice";
}

export const PlaygroundConsole: React.FC<PlaygroundConsoleProps> = ({
  result,
  taskPassed,
  feedbackMessage,
  currentTvState,
  currentTask,
  phase = "demo",
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[#2B2D33] shadow-lg bg-[#141416] text-gray-200">
      {/* Console Header Bar */}
      <div className="px-3.5 py-1.5 bg-[#18191C] border-b border-[#2B2D33] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-gray-400" />
          <span className="font-mono text-xs font-bold text-gray-300">
            {t("playground.consoleTitle")}
          </span>
          {phase === "demo" && (
            <span className="px-1.5 py-0.2 rounded bg-blue-950/60 border border-blue-600/40 text-[9px] font-mono font-bold text-blue-400 uppercase">
              Demo Output
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">PWR:</span>
            <span className={`font-bold ${currentTvState.isOn ? "text-emerald-400" : "text-gray-500"}`}>
              {currentTvState.isOn ? "ON" : "OFF"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">CH:</span>
            <span className="font-bold text-blue-400">{currentTvState.channel}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">VOL:</span>
            <span className="font-bold text-amber-400">{currentTvState.volume}</span>
          </div>
        </div>
      </div>

      {/* Console Body */}
      <div className="p-3 font-mono text-xs min-h-[95px] max-h-[190px] overflow-y-auto space-y-2 select-text">
        {!result ? (
          <div className="text-gray-500 italic flex items-center gap-2 py-4 justify-center">
            <span>
              {phase === "demo"
                ? "Натисніть «▶ Запустити демо», щоб побачити як працює приклад..."
                : "Введіть код самостійно та натисніть «▶ Перевірити код»..."}
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Step-by-step Execution Logs */}
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

            {/* Validation or Demo Feedback */}
            {feedbackMessage && (
              <div
                className={`p-3 rounded-xl flex items-start gap-2.5 text-xs border ${
                  taskPassed === true
                    ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-300 shadow-xs"
                    : taskPassed === false
                    ? "bg-red-950/40 border-red-600/40 text-red-300 shadow-xs"
                    : "bg-blue-950/40 border-blue-600/40 text-blue-300 shadow-xs"
                }`}
              >
                {taskPassed === true ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : taskPassed === false ? (
                  <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed font-sans font-medium">{feedbackMessage}</div>
              </div>
            )}

            {/* Career Impact Card: Why is this important for your career? */}
            {taskPassed && currentTask?.careerImpactKey && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/50 via-indigo-950/40 to-transparent border border-blue-500/30 text-xs font-sans text-blue-200 space-y-1 animate-in fade-in slide-in-from-bottom-1">
                <div className="flex items-center gap-1.5 font-display font-bold text-blue-400 text-xs">
                  <Briefcase size={13} className="text-blue-400 shrink-0" />
                  <span>{t("playground.careerImpactTitle")}</span>
                </div>
                <p className="leading-relaxed text-gray-300 text-[11px]">
                  {t(currentTask.careerImpactKey)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
