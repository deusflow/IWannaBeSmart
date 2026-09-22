/**
 * @file apps/web/src/components/workbench/trace/ArchitecturalBreadcrumbTrail.tsx
 * @description Persistent breadcrumb trail tracking call stack history.
 *              Directly counteracts Mayer & Sweller's Transient Information Effect
 *              by keeping past execution frames visible and clickable.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, CornerDownLeft, ArrowLeftRight, AlertOctagon } from "lucide-react";

export interface BreadcrumbItem {
  stepIndex: number;
  symbol: string;
  file: string;
  folder?: string;
  depth: number;
  isReturn: boolean;
  isException?: boolean;
}

interface ArchitecturalBreadcrumbTrailProps {
  breadcrumbs: BreadcrumbItem[];
  currentStepIndex: number;
  onSeek: (stepIndex: number) => void;
  className?: string;
}

export const ArchitecturalBreadcrumbTrail: React.FC<ArchitecturalBreadcrumbTrailProps> = ({
  breadcrumbs,
  currentStepIndex,
  onSeek,
  className = "",
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.startsWith("da")
    ? "da"
    : i18n.language?.startsWith("en")
    ? "en"
    : "ua") as "ua" | "en" | "da";

  const callTrailLabel =
    currentLang === "en" ? "Call Trail:" : currentLang === "da" ? "Kaldespor:" : "Шлях викликів:";
  const jumpToStepLabel =
    currentLang === "en" ? "Jump to step" : currentLang === "da" ? "Hop til trin" : "Перейти до кроку";

  return (
    <div
      className={`flex items-center gap-1.5 overflow-x-auto py-2 px-3 bg-[#0c1017] border-b border-slate-800/80 select-none text-xs font-mono scrollbar-thin ${className}`}
      data-testid="architectural-breadcrumb-trail"
    >
      <div className="flex items-center gap-1 text-slate-400 shrink-0 font-medium mr-1">
        <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[11px] uppercase tracking-wider text-slate-400">{callTrailLabel}</span>
      </div>

      {breadcrumbs.map((item, idx) => {
        const isCurrent = item.stepIndex === currentStepIndex;
        const isPast = item.stepIndex < currentStepIndex;
        const pathDisplay = item.folder ? `${item.folder}/${item.file}` : item.file;

        return (
          <React.Fragment key={`${item.stepIndex}-${item.symbol}`}>
            {idx > 0 && (
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0 mx-0.5 opacity-60" />
            )}
            <button
              onClick={() => onSeek(item.stepIndex)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all shrink-0 cursor-pointer ${
                isCurrent
                  ? "bg-blue-600/25 border border-blue-500/60 text-blue-200 shadow-sm shadow-blue-900/30 ring-1 ring-blue-500/30 font-semibold"
                  : isPast
                  ? "bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 text-slate-300 hover:text-white"
                  : "bg-slate-900/40 border border-slate-800/40 text-slate-500 hover:text-slate-400"
              }`}
              title={`Step ${item.stepIndex + 1}: ${pathDisplay} -> ${item.symbol} (Depth: ${item.depth})`}
              aria-label={`${jumpToStepLabel} ${item.stepIndex + 1}`}
            >
              {item.isException ? (
                <AlertOctagon className="w-3 h-3 text-rose-400 shrink-0" />
              ) : item.isReturn ? (
                <CornerDownLeft className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <span className="text-[10px] px-1 py-0.2 rounded bg-slate-700/50 text-slate-300 font-mono">
                  D{item.depth}
                </span>
              )}
              <span className="truncate max-w-[140px] text-slate-200">{item.file}</span>
              <span className="text-slate-400 text-[11px]">::{item.symbol.split("(")[0]}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};
