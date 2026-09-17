/**
 * @file apps/web/src/components/workbench/hub/EngineerDossierBar.tsx
 * @description Progressive disclosure engineer dossier displaying patterns mastery and milestone progression.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { audioFx } from "../../../utils/audioFx";

export interface PatternItem {
  id: string;
  name: string;
  unlocked: boolean;
}

export interface EngineerDossierBarProps {
  xp: number;
  patterns: PatternItem[];
  station3ProgressPercent: number;
}

export const EngineerDossierBar: React.FC<EngineerDossierBarProps> = ({
  xp,
  patterns,
  station3ProgressPercent,
}) => {
  const { t } = useTranslation();
  const [isDossierExpanded, setIsDossierExpanded] = useState<boolean>(false);

  return (
    <div className="rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/25 shadow-paper-sm overflow-hidden transition-all duration-300">
      <div className="p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 bg-[#E4DDD0] border-b border-[#1A1D20]/15">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-800 shrink-0" />
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-[#1A1D20]">
            {t("hub.dossierTitle", "Досьє інженера")}
          </h2>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[#1A1D20]/15 font-mono text-[10px] font-bold text-emerald-800">
            {patterns.filter((p) => p.unlocked).length} / {patterns.length} {t("hub.patternsShort", "Патернів")}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] font-mono text-[#1A1D20]/70">
            {t("hub.unlockProgress", "Прогрес")}:{" "}
            <span className="font-bold text-[#1A1D20]">{xp} / 200 XP</span>
          </div>

          <button
            onClick={() => {
              audioFx.playRelayClick();
              setIsDossierExpanded((p) => !p);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#1A1D20]/20 bg-[#FAF8F2] hover:bg-white text-[11px] font-mono font-bold text-[#1A1D20] transition-all cursor-pointer shadow-paper-xs"
            title={isDossierExpanded ? t("common.collapse", "Згорнути досьє") : t("common.details", "Розгорнути досьє")}
          >
            <span>{isDossierExpanded ? t("common.collapse", "Згорнути") : t("common.details", "Деталі")}</span>
            {isDossierExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Milestone Progress Bar (Always visible slim indicator) */}
      <div className="px-4 sm:px-5 py-2">
        <div className="w-full h-2 rounded-full bg-[#DFD7C5] border border-[#1A1D20]/15 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-[#1A1D20] transition-all duration-500 ease-out"
            style={{ width: `${station3ProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Mastered Architectural Patterns (Expandable details) */}
      {isDossierExpanded && (
        <div className="px-4 sm:px-5 pb-4 pt-1 space-y-2 border-t border-[#1A1D20]/10 animate-in fade-in">
          <div className="text-[10px] font-mono font-bold uppercase text-[#1A1D20]/60">
            {t("hub.masteredPatterns", "Освоєні архітектурні патерни")}:
          </div>
          <div className="flex flex-wrap gap-2">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-colors ${
                  pattern.unlocked
                    ? "bg-[#FAF8F2] border-emerald-600/40 text-emerald-900 shadow-2xs"
                    : "bg-[#DFD7C5]/50 border-[#1A1D20]/15 text-[#1A1D20]/40"
                }`}
              >
                {pattern.unlocked ? (
                  <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A1D20]/30 shrink-0" />
                )}
                <span>{pattern.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
