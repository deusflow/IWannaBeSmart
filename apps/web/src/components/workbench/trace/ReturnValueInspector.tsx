/**
 * @file apps/web/src/components/workbench/trace/ReturnValueInspector.tsx
 * @description Inspector for function completion and stack unwinding (Notional Machine).
 *              Explains exactly why execution terminated at this point and what value
 *              is returned to the calling stack frame.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { CornerDownLeft, Layers, Info } from "lucide-react";
import type { ExecutionTraceReturnValue, TraceStepLocation } from "@iw/sim-engine";

interface ReturnValueInspectorProps {
  returnValue?: ExecutionTraceReturnValue;
  currentLocation: TraceStepLocation;
  targetLocation?: TraceStepLocation;
  callStack: string[];
  scopeVariables?: Record<string, string | number | boolean>;
  className?: string;
}

export const ReturnValueInspector: React.FC<ReturnValueInspectorProps> = ({
  returnValue,
  currentLocation,
  targetLocation,
  callStack,
  scopeVariables,
  className = "",
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.startsWith("da")
    ? "da"
    : i18n.language?.startsWith("en")
    ? "en"
    : "ua") as "ua" | "en" | "da";

  if (!returnValue) {
    const stackTitle =
      currentLang === "en"
        ? `Active Call Stack (${callStack.length} frames) — ${currentLocation.fileName}`
        : currentLang === "da"
        ? `Aktiv Kalde-stak (${callStack.length} rammer) — ${currentLocation.fileName}`
        : `Активний стек викликів (${callStack.length} фреймів) — ${currentLocation.fileName}`;

    const varsLabel =
      currentLang === "en"
        ? "Local Variables in Scope:"
        : currentLang === "da"
        ? "Lokale variable i scope:"
        : "Локальні змінні у Scope:";

    const levelLabel =
      currentLang === "en" ? "Level" : currentLang === "da" ? "Niveau" : "Рівень";

    return (
      <div className={`p-3 rounded-lg border border-slate-800 bg-[#0B0F17] text-xs ${className}`}>
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>{stackTitle}</span>
        </div>
        <div className="space-y-1">
          {callStack.map((frame, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-2 py-1 rounded font-mono ${
                index === callStack.length - 1
                  ? "bg-blue-950/40 border border-blue-800/50 text-blue-200 font-semibold"
                  : "bg-slate-900/40 text-slate-400"
              }`}
            >
              <span className="truncate">{frame}</span>
              <span className="text-[10px] text-slate-400">
                {levelLabel} {index + 1}
              </span>
            </div>
          ))}
        </div>

        {scopeVariables && Object.keys(scopeVariables).length > 0 && (
          <div className="mt-3 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
              {varsLabel}
            </span>
            <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
              {Object.entries(scopeVariables).map(([k, v]) => (
                <div key={k} className="bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">{k}:</span>
                  <span className="text-emerald-400 font-semibold truncate ml-1">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const localizedSummary =
    typeof returnValue.summary === "string"
      ? returnValue.summary
      : returnValue.summary[currentLang] || returnValue.summary.ua || "";

  const localizedReason =
    typeof returnValue.terminationReason === "string"
      ? returnValue.terminationReason
      : returnValue.terminationReason[currentLang] || returnValue.terminationReason.ua || "";

  const returnPointLabel =
    currentLang === "en"
      ? "Stack Return Point"
      : currentLang === "da"
      ? "Stak Returpunkt"
      : "Точка повернення зі стеку";

  const whyTerminatedLabel =
    currentLang === "en"
      ? "Why method terminated (Notional Machine):"
      : currentLang === "da"
      ? "Hvorfor metoden afsluttedes (Notional Machine):"
      : "Чому метод завершився (Notional Machine):";

  const returningToLabel =
    currentLang === "en"
      ? "Returning to:"
      : currentLang === "da"
      ? "Returnerer til:"
      : "Повернення у:";

  return (
    <div
      className={`p-3.5 rounded-xl border border-emerald-600/40 bg-gradient-to-br from-[#061510] to-[#0A1017] text-xs text-slate-200 shadow-md ${className}`}
      data-testid="return-value-inspector"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
          <CornerDownLeft className="w-4 h-4 text-emerald-400" />
          <span className="uppercase tracking-wider">{returnPointLabel}</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold">
          {returnValue.type}: {returnValue.value}
        </span>
      </div>

      <div className="mb-2.5">
        <p className="text-slate-200 text-xs font-medium leading-relaxed">{localizedSummary}</p>
      </div>

      <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-[11px] leading-relaxed text-emerald-200/90 mb-2">
        <div className="flex items-center gap-1 font-semibold text-emerald-300 mb-0.5">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{whyTerminatedLabel}</span>
        </div>
        <p>{localizedReason}</p>
      </div>

      {targetLocation && (
        <div className="flex items-center justify-between pt-2 border-t border-emerald-900/30 text-[11px] text-slate-400 font-mono">
          <span>{returningToLabel}</span>
          <span className="text-emerald-300 font-semibold truncate max-w-[220px]">
            {targetLocation.fileName}:{targetLocation.lineStart} ({targetLocation.symbol})
          </span>
        </div>
      )}
    </div>
  );
};
