/**
 * @file apps/web/src/components/workbench/playground/GuidedStepBar.tsx
 * @description Pre-round guided step bar with two explanation layers:
 *   Layer 1 — [ 💡 Простими словами ] — plain-language analogy
 *   Layer 2 — [ ⚙️ Інженерна суть ] — strict CS definition with English terms
 *
 * Design: Blueprint parchment (#EBE5D8 bg, #1A1D20 graphite text, subtle border)
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lightbulb, Cpu, ChevronRight, PenLine, X } from "lucide-react";

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface GuidedStepData {
  /** i18n key for the "simple words" layer */
  simpleKey: string;
  /** i18n key for the engineering-precision layer */
  engineeringKey: string;
}

interface GuidedStepBarProps {
  data: GuidedStepData;
  onStartPractice: () => void;
  persistent?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GuidedStepBar: React.FC<GuidedStepBarProps> = ({
  data,
  onStartPractice,
  persistent = false,
}) => {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const [activeLayer, setActiveLayer] = useState<"simple" | "engineering">("simple");

  if (dismissed && !persistent) return null;

  const simpleText = t(data.simpleKey, { defaultValue: "" });
  const engineeringText = t(data.engineeringKey, { defaultValue: "" });

  if (!simpleText && !engineeringText) return null;

  const handleStartPractice = () => {
    setDismissed(true);
    onStartPractice();
  };

  return (
    <div
      className="w-full rounded-2xl border border-[#1A1D20]/20 bg-[#EBE5D8] shadow-[0_2px_12px_rgba(26,29,32,0.07)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
      role="region"
      aria-label="Guided explanation"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1A1D20]/12 bg-[#E4DDD0]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#1A1D20]/40 shrink-0" />
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#1A1D20]/60">
            {t("guide.title", "Architect's Guide")}
          </span>
        </div>

        {/* Layer toggle pills */}
        <div className="flex items-center gap-1 bg-[#DDD7CC] rounded-lg border border-[#1A1D20]/15 p-0.5">
          <button
            onClick={() => setActiveLayer("simple")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
              activeLayer === "simple"
                ? "bg-[#1A1D20] text-[#EBE5D8] shadow-xs"
                : "text-[#1A1D20]/60 hover:text-[#1A1D20]"
            }`}
          >
            <Lightbulb size={11} />
            <span>{t("guide.simpleTab", "Simple words")}</span>
          </button>
          <button
            onClick={() => setActiveLayer("engineering")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
              activeLayer === "engineering"
                ? "bg-[#1A1D20] text-[#EBE5D8] shadow-xs"
                : "text-[#1A1D20]/60 hover:text-[#1A1D20]"
            }`}
          >
            <Cpu size={11} />
            <span>{t("guide.engineeringTab", "Engineering essence")}</span>
          </button>
        </div>

        {!persistent && (
          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[#1A1D20]/40 hover:text-[#1A1D20] hover:bg-[#1A1D20]/10 transition-colors cursor-pointer"
            title={t("guide.hide", "Hide explanation")}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Content area */}
      <div className="px-4 py-3.5 space-y-1 min-h-[64px]">
        {activeLayer === "simple" ? (
          <div className="animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-[#1A1D20]/8 border border-[#1A1D20]/15">
              <Lightbulb size={11} className="text-[#1A1D20]/60" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A1D20]/60">
                {`[ 💡 ${t("guide.simpleLabel", "Simple words")} ]`}
              </span>
            </div>
            <p className="font-balsamiq text-sm text-[#1A1D20] leading-relaxed">
              {simpleText}
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-[#1A1D20]/8 border border-[#1A1D20]/15">
              <Cpu size={11} className="text-[#1A1D20]/60" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A1D20]/60">
                {`[ ⚙️ ${t("guide.engineeringLabel", "Engineering essence")} ]`}
              </span>
            </div>
            <p className="font-mono text-xs text-[#1A1D20] leading-relaxed whitespace-pre-wrap">
              {engineeringText}
            </p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-4 pb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] font-mono text-[#1A1D20]/40">
          <ChevronRight size={10} />
          <span>
            {activeLayer === "simple"
              ? t("guide.simpleHint", "Tap ‘Engineering essence’ for the technical definition")
              : t("guide.engineeringHint", "Tap ‘Simple words’ for a plain-language comparison")}
          </span>
        </div>

        <button
          id="guided-step-bar-start-practice"
          onClick={handleStartPractice}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1D20] text-[#EBE5D8] font-mono font-bold text-xs hover:bg-[#2A2D35] active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <PenLine size={13} />
          <span>{t("guide.startPractice", "✍️ Start practice / Begin typing")}</span>
        </button>
      </div>
    </div>
  );
};
