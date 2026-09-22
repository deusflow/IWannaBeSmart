/**
 * @file apps/web/src/components/workbench/trace/ReturnValueInspector.tsx
 * @description Inspector for function completion and stack unwinding (Notional Machine).
 *              Explains exactly why execution terminated at this point and what value
 *              is returned to the calling stack frame.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { CornerDownLeft, Layers, Info, AlertOctagon } from "lucide-react";
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

  const isException =
    returnValue.type.toLowerCase().includes("exception") ||
    returnValue.type.toLowerCase().includes("error") ||
    returnValue.type.toLowerCase().includes("fault");

  const localizedSummary =
    typeof returnValue.summary === "string"
      ? returnValue.summary
      : returnValue.summary[currentLang] || returnValue.summary.ua || "";

  const localizedReason =
    typeof returnValue.terminationReason === "string"
      ? returnValue.terminationReason
      : returnValue.terminationReason[currentLang] || returnValue.terminationReason.ua || "";

  const returnPointLabel = isException
    ? currentLang === "en"
      ? "Exception Stack Unwind"
      : currentLang === "da"
      ? "Undtagelse Stak-afvikling"
      : "Розмотка стеку через виключення"
    : currentLang === "en"
    ? "Stack Return Point"
    : currentLang === "da"
    ? "Stak Returpunkt"
    : "Точка повернення зі стеку";

  const whyTerminatedLabel = isException
    ? currentLang === "en"
      ? "Why exception was thrown (Notional Machine):"
      : currentLang === "da"
      ? "Hvorfor undtagelsen opstod (Notional Machine):"
      : "Чому виникло виключення (Notional Machine):"
    : currentLang === "en"
    ? "Why method terminated (Notional Machine):"
    : currentLang === "da"
    ? "Hvorfor metoden afsluttedes (Notional Machine):"
    : "Чому метод завершився (Notional Machine):";

  const returningToLabel = isException
    ? currentLang === "en"
      ? "Unwinding caught in:"
      : currentLang === "da"
      ? "Afvikling fanget i:"
      : "Перехоплено у:"
    : currentLang === "en"
    ? "Returning to:"
    : currentLang === "da"
    ? "Returnerer til:"
    : "Повернення у:";

  return (
    <div
      className={`p-3.5 rounded-xl border text-xs text-slate-200 shadow-md ${
        isException
          ? "border-rose-600/50 bg-gradient-to-br from-[#1c080e] to-[#0a0507]"
          : "border-emerald-600/40 bg-gradient-to-br from-[#061510] to-[#0A1017]"
      } ${className}`}
      data-testid="return-value-inspector"
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={`flex items-center gap-1.5 font-semibold text-xs ${
            isException ? "text-rose-400" : "text-emerald-400"
          }`}
        >
          {isException ? (
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CornerDownLeft className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="uppercase tracking-wider">{returnPointLabel}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border ${
            isException
              ? "bg-rose-950/80 border-rose-500/50 text-rose-300"
              : "bg-emerald-950/70 border-emerald-500/40 text-emerald-300"
          }`}
        >
          {returnValue.type}: {returnValue.value}
        </span>
      </div>

      <div className="mb-2.5">
        <p className="text-slate-200 text-xs font-medium leading-relaxed">{localizedSummary}</p>
      </div>

      <div
        className={`p-2 rounded-lg border text-[11px] leading-relaxed mb-2 ${
          isException
            ? "bg-rose-950/30 border-rose-800/40 text-rose-200/90"
            : "bg-emerald-950/20 border-emerald-800/30 text-emerald-200/90"
        }`}
      >
        <div
          className={`flex items-center gap-1 font-semibold mb-0.5 ${
            isException ? "text-rose-300" : "text-emerald-300"
          }`}
        >
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{whyTerminatedLabel}</span>
        </div>
        <p>{localizedReason}</p>
      </div>

      {targetLocation && (
        <div
          className={`flex items-center justify-between pt-2 border-t text-[11px] font-mono ${
            isException
              ? "border-rose-900/40 text-rose-300/80"
              : "border-emerald-900/30 text-slate-400"
          }`}
        >
          <span>{returningToLabel}</span>
          <span
            className={`font-semibold truncate max-w-[220px] ${
              isException ? "text-rose-300" : "text-emerald-300"
            }`}
          >
            {targetLocation.fileName}:{targetLocation.lineStart} ({targetLocation.symbol})
          </span>
        </div>
      )}
    </div>
  );
};
