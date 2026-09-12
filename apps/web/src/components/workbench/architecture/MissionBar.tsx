import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Sparkles, RotateCcw, Cable, Maximize2, Zap, AlertTriangle } from "lucide-react";
import type { ActiveJourneyState } from "./types";

interface MissionBarProps {
  canvasMode: "TRACE" | "WIRING";
  onSetCanvasMode: (mode: "TRACE" | "WIRING") => void;
  selectedTraceEntityId: string | null;
  isTraceBroken: boolean;
  isAnyCommandWired: boolean;
  isVolumeWired: boolean;
  diMode: "WITH_DI" | "WITHOUT_DI";
  onToggleDiMode: (mode: "WITH_DI" | "WITHOUT_DI") => void;
  onHotSwap: () => void;
  activeJourney: ActiveJourneyState | null;
  onToggleJourney: () => void;
  isTracing: boolean;
  onTriggerTrace: () => void;
  onAutoWire: () => void;
  onReset: () => void;
  onFitView: () => void;
}

export const MissionBar: React.FC<MissionBarProps> = ({
  canvasMode,
  onSetCanvasMode,
  selectedTraceEntityId,
  isTraceBroken,
  isAnyCommandWired,
  isVolumeWired,
  diMode,
  onToggleDiMode,
  onHotSwap,
  activeJourney,
  onToggleJourney,
  isTracing,
  onTriggerTrace,
  onAutoWire,
  onReset,
  onFitView,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div
        className={`px-4 py-2 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none shrink-0 transition-colors duration-200 ${
          isAnyCommandWired
            ? "bg-[#1A1E1C] border-emerald-900/40"
            : "bg-[#1B1C20] border-white/[0.06]"
        }`}
      >
        {/* Left: Mission status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              canvasMode === "TRACE"
                ? isTraceBroken
                  ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : isAnyCommandWired
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse"
            }`}
          >
            {canvasMode === "TRACE" ? (
              isTraceBroken ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />
            ) : isAnyCommandWired ? (
              <CheckCircle2 size={15} />
            ) : (
              <Cable size={15} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[12px] text-gray-200 truncate">
                {canvasMode === "TRACE"
                  ? `EntityTraceView ➔ ${selectedTraceEntityId}`
                  : "TVController ➔ IRemoteCommand"}
              </span>
              <span
                className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                  canvasMode === "TRACE"
                    ? isTraceBroken
                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : isAnyCommandWired
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                }`}
              >
                {canvasMode === "TRACE"
                  ? isTraceBroken
                    ? "Ланцюг розірвано (Bypassed)"
                    : "Ланцюг замкнено (6 вузлів)"
                  : isAnyCommandWired
                  ? "З'єднано"
                  : t("architecture.waitingConnection", "Очікує з'єднання")}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* Canvas View Mode Toggle (Trace-Chain vs Freeform Wiring) */}
          <div className="flex items-center bg-[#151619] p-0.5 rounded-lg border border-white/[0.08]">
            <button
              onClick={() => onSetCanvasMode("TRACE")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                canvasMode === "TRACE"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-xs"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Trace-Chain
            </button>
            <button
              onClick={() => onSetCanvasMode("WIRING")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                canvasMode === "WIRING"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Freeform
            </button>
          </div>
          {/* DI Mode Toggle */}
          <div className="flex items-center bg-[#151619] p-0.5 rounded-lg border border-white/[0.08]">
            <button
              onClick={() => onToggleDiMode("WITH_DI")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                diMode === "WITH_DI"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t("architecture.withDi", "З DI")}
            </button>
            <button
              onClick={() => onToggleDiMode("WITHOUT_DI")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                diMode === "WITHOUT_DI"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-xs"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t("architecture.withoutDi", "Без DI")}
            </button>
          </div>

          {/* Hot Swap Quick-Action Button */}
          <button
            onClick={onHotSwap}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-[11px] font-mono font-semibold transition-all cursor-pointer active:scale-95"
            title={t("architecture.hotSwapBtn", "Швидка заміна (Hot Swap)")}
          >
            <RotateCcw size={12} className="text-purple-400" />
            <span>{isVolumeWired ? "Hot Swap: Power" : "Hot Swap: Volume"}</span>
          </button>

          {/* Journey Inspector Button */}
          <button
            onClick={onToggleJourney}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition-all cursor-pointer active:scale-95 ${
              activeJourney
                ? "bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                : "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300"
            }`}
            title={t("journey.interfaceTitle", "Шлях контракту: IRemoteCommand")}
          >
            <Sparkles size={12} className="text-purple-400" />
            <span>{activeJourney ? t("journey.close", "Закрити") : t("journey.startJourney", "Дослідити зв'язок")}</span>
          </button>

          {/* Trace Button */}
          <button
            onClick={onTriggerTrace}
            disabled={isTracing}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-mono font-semibold transition-all cursor-pointer active:scale-95 ${
              isTracing
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse cursor-wait"
                : isAnyCommandWired
                ? "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-200"
                : "bg-red-500/15 hover:bg-red-500/25 border-red-500/30 text-red-300"
            }`}
          >
            <Zap
              size={12}
              className={
                isTracing
                  ? "animate-spin text-amber-400"
                  : isAnyCommandWired
                  ? "text-amber-400"
                  : "text-red-400"
              }
            />
            <span>{isTracing ? t("architecture.tracing", "Трасування...") : t("architecture.testCall", "⚡ Тест виклику")}</span>
          </button>

          {/* Auto-wire */}
          <button
            onClick={onAutoWire}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#27282D] hover:bg-[#32333A] border border-white/[0.06] text-gray-300 text-[11px] font-mono transition-all cursor-pointer active:scale-95"
            title={t("architecture.autoWire")}
          >
            <Sparkles size={12} className="text-blue-400" />
            <span>{t("architecture.autoWire")}</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-[#27282D] hover:bg-[#32333A] border border-white/[0.06] text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
            title={t("architecture.reset")}
          >
            <RotateCcw size={12} />
          </button>

          {/* Fit View */}
          <button
            onClick={onFitView}
            title={t("architecture.centerView")}
            className="p-1.5 rounded-lg bg-[#27282D] hover:bg-[#32333A] border border-white/[0.06] text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>

      {/* Educational Hint for Tight Coupling vs Dependency Injection */}
      {diMode === "WITHOUT_DI" && (
        <div className="px-4 py-1.5 bg-[#2A1417] border-b border-red-900/50 flex items-center justify-between text-[11px] font-sans text-red-200 select-none shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2 truncate">
            <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-mono font-bold shrink-0">
              {t("architecture.antiPatternBadge", "АНТИПАТЕРН")}
            </span>
            <span className="truncate">
              <strong>{t("architecture.tightCouplingHint", "Жорстка зв'язаність: new PowerCommand() вшито в TVController. Заміна деталі неможлива без редагування коду.")}</strong>
            </span>
          </div>
          <button
            onClick={() => onToggleDiMode("WITH_DI")}
            className="text-red-300 hover:text-white underline font-mono text-[10px] shrink-0 ml-3 cursor-pointer"
          >
            {t("architecture.enableDi", "Увімкнути DI →")}
          </button>
        </div>
      )}
    </>
  );
};
