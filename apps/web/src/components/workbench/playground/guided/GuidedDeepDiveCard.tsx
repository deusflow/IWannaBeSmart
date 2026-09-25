/**
 * @file apps/web/src/components/workbench/playground/guided/GuidedDeepDiveCard.tsx
 * @description Collapsible Deep Dive module rendering verified industry authoritative sources
 * (Microsoft Learn, Go.dev, ByteByteGo, IBM Granite, NIST, RFC, OWASP, Google Cloud).
 * Designed to be non-intrusive for beginner cadets, but immediately accessible for engineers
 * seeking deep architectural mastery.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Compass,
  ExternalLink,
  Clock,
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
  BookOpen,
} from "lucide-react";
import type { CuratedResource, CuratedResourceAuthority } from "../taskDidacticContext";
import { audioFx } from "../../../../utils/audioFx";

interface GuidedDeepDiveCardProps {
  resources?: CuratedResource[];
  currentLang?: "ua" | "en" | "da";
  defaultExpanded?: boolean;
  className?: string;
  onToggleExpand?: (isExpanded: boolean) => void;
}

const getAuthorityBadgeStyles = (source: CuratedResourceAuthority) => {
  switch (source) {
    case "Microsoft Learn":
      return "bg-[#0078D4]/15 text-[#005A9E] border-[#0078D4]/35";
    case "Go.dev":
      return "bg-[#00ADD8]/15 text-[#007A99] border-[#00ADD8]/35";
    case "Google Cloud":
      return "bg-[#EA4335]/15 text-[#C5221F] border-[#EA4335]/35";
    case "IBM Granite":
      return "bg-[#1D70B8]/15 text-[#0F62FE] border-[#1D70B8]/35";
    case "ByteByteGo":
      return "bg-amber-500/15 text-amber-900 border-amber-600/35";
    case "NIST":
      return "bg-teal-600/15 text-teal-900 border-teal-600/35";
    case "RFC":
      return "bg-indigo-600/15 text-indigo-900 border-indigo-600/35";
    case "OWASP":
      return "bg-orange-600/15 text-orange-950 border-orange-600/35";
    case "Computerphile":
      return "bg-rose-600/15 text-rose-950 border-rose-600/35";
    case "MIT OCW":
      return "bg-red-700/15 text-red-950 border-red-700/35";
    default:
      return "bg-[#1A1D20]/10 text-[#1A1D20] border-[#1A1D20]/20";
  }
};

const getGradeBadgeStyles = (grade?: "Junior" | "Middle" | "Senior" | "Architect") => {
  switch (grade) {
    case "Architect":
      return "bg-purple-600/15 text-purple-950 border-purple-600/30";
    case "Senior":
      return "bg-amber-600/15 text-amber-950 border-amber-600/30";
    case "Middle":
      return "bg-blue-600/15 text-blue-950 border-blue-600/30";
    case "Junior":
    default:
      return "bg-emerald-600/15 text-emerald-950 border-emerald-600/30";
  }
};

export const GuidedDeepDiveCard: React.FC<GuidedDeepDiveCardProps> = ({
  resources,
  currentLang = "ua",
  defaultExpanded = false,
  className = "",
  onToggleExpand,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!resources || resources.length === 0) return null;

  const toggleOpen = () => {
    audioFx.playRelayClick();
    const next = !isExpanded;
    setIsExpanded(next);
    onToggleExpand?.(next);
  };

  return (
    <div
      className={`rounded-xl border border-indigo-900/20 bg-indigo-50/40 overflow-hidden transition-all duration-200 ${className}`}
      data-testid="guided-deep-dive-card"
    >
      {/* ── Collapsible Header Toggle ── */}
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-indigo-50/70 hover:bg-indigo-100/50 cursor-pointer transition-colors text-left select-none group"
        aria-expanded={isExpanded}
        title={isExpanded ? t("common.collapse", "Згорнути") : t("common.expand", "Розгорнути")}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Compass size={13} className="text-amber-300" />
          </div>
          <span className="font-mono text-xs font-bold text-indigo-950 flex items-center gap-1.5">
            <span>{t("guide.deepDiveTitle", "Копнути глибше (Deep Dive) • Першоджерела")}</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-indigo-200/60 text-indigo-900 border border-indigo-300/60">
              {resources.length}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-900/70 group-hover:text-indigo-950 transition-colors">
          <span className="hidden sm:inline">
            {isExpanded ? t("common.collapse", "Згорнути") : t("common.expand", "Розгорнути")}
          </span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* ── Expanded Content Area ── */}
      {isExpanded && (
        <div className="p-3.5 space-y-3 border-t border-indigo-900/10 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="text-[11px] font-sans text-indigo-950/80 leading-relaxed flex items-center gap-1.5">
            <BookOpen size={12} className="text-indigo-700 shrink-0" />
            <span>
              {t(
                "guide.deepDiveSubtitle",
                "Офіційні стандарти, RFC та архітектурні пейпери від лідерів індустрії:"
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {resources.map((res, index) => {
              const authorityBadgeClass = getAuthorityBadgeStyles(res.source);
              const gradeBadgeClass = getGradeBadgeStyles(res.targetGrade);
              const whyReadText =
                res.whyRead[currentLang] || res.whyRead.ua || res.whyRead.en || "";

              return (
                <div
                  key={`${res.source}-${index}`}
                  className="p-3 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/15 hover:border-indigo-500/40 hover:bg-white transition-all shadow-2xs space-y-2 group/card"
                >
                  {/* Top metadata tags */}
                  <div className="flex items-center justify-between flex-wrap gap-1.5 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Authority Source */}
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold border ${authorityBadgeClass}`}
                      >
                        {res.source}
                      </span>

                      {/* Resource Type */}
                      <span className="px-1.5 py-0.5 rounded-md bg-[#1A1D20]/8 text-[#1A1D20]/75 uppercase font-medium">
                        {res.type.replace("_", " ")}
                      </span>

                      {/* Target Grade */}
                      {res.targetGrade && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-bold border ${gradeBadgeClass}`}
                        >
                          Grade: {res.targetGrade}
                        </span>
                      )}
                    </div>

                    {/* Estimated reading time */}
                    {res.estimatedMinutes && (
                      <span className="flex items-center gap-1 text-[#1A1D20]/60">
                        <Clock size={11} />
                        <span>
                          ~{res.estimatedMinutes} {t("guide.estMinutes", "хв")}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Resource Title & Direct Link */}
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-2 text-xs font-display font-extrabold text-[#1A1D20] hover:text-indigo-700 transition-colors group-hover/card:text-indigo-700 leading-snug cursor-pointer"
                  >
                    <span>{res.title}</span>
                    <ExternalLink
                      size={13}
                      className="shrink-0 text-indigo-600/70 group-hover/card:text-indigo-700 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-transform mt-0.5"
                    />
                  </a>

                  {/* Why Read This Explanation */}
                  {whyReadText && (
                    <div className="p-2 rounded-lg bg-indigo-500/8 border-l-2 border-indigo-600 text-[11px] font-sans text-indigo-950/90 leading-relaxed flex items-start gap-1.5">
                      <BookmarkCheck size={12} className="text-indigo-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-mono text-[10px] uppercase text-indigo-900 mr-1">
                          {t("guide.whyReadLabel", "Навіщо вивчати:")}
                        </strong>
                        {whyReadText}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
