/**
 * @file apps/web/src/components/workbench/playground/SyntaxAnatomyCard.tsx
 * @description Blueprint-styled Code Anatomy & Syntax Theory Card with token breakdown, concept, and C#/Go diffs
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowLeftRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { audioFx } from "../../../utils/audioFx";
import type { TaskTheory } from "@iw/i18n";
import { theoryUa } from "@iw/i18n";

interface SyntaxAnatomyCardProps {
  taskId: string;
  codeLang?: "csharp" | "go";
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const SyntaxAnatomyCard: React.FC<SyntaxAnatomyCardProps> = ({
  taskId,
  codeLang = "csharp",
  isOpen,
  onToggle,
  className = "",
}) => {
  const { t } = useTranslation();

  // Retrieve theory object for the task from i18n
  const translatedTheory = t(`theory.tasks.${taskId}`, { returnObjects: true }) as TaskTheory;

  // Fallback to UA dataset if language key is not yet resolved
  const theory: TaskTheory =
    translatedTheory && translatedTheory.concept
      ? translatedTheory
      : theoryUa.tasks[taskId] || theoryUa.tasks["task-1-assignment"];

  const handleToggleClick = () => {
    audioFx.playRelayClick();
    onToggle();
  };

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {/* ── Blueprint Toggle Badge Button ── */}
      <button
        onClick={handleToggleClick}
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer shadow-paper-xs active:scale-95 ${
          isOpen
            ? "bg-[#1A1D20] text-white border-[#1A1D20] shadow-sm"
            : "bg-[#EBE5D8] hover:bg-[#DFD8CA] border-[#1A1D20]/30 text-[#1A1D20]"
        }`}
        title={t("theory.badgeBtn", "📖 Теорія та анатомія коду")}
      >
        <BookOpen size={13} className={isOpen ? "text-amber-400" : "text-[#1A1D20]"} />
        <span>{t("theory.badgeBtn", "📖 Теорія та анатомія коду")}</span>
        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {/* ── Expanded Parchment Theory & Token Breakdown Card ── */}
      {isOpen && (
        <div className="p-4 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/25 text-[#1A1D20] space-y-3.5 shadow-paper-sm animate-in fade-in slide-in-from-top-1">
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b border-[#1A1D20]/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#1A1D20]/10 border border-[#1A1D20]/20 text-[#1A1D20]">
                [ 📖 {t("theory.headerTitle", "Теорія та анатомія коду")} ]
              </span>
              <span className="text-[11px] font-mono font-bold text-[#1A1D20]/60 uppercase">
                {codeLang === "csharp" ? "C# (.NET)" : "Go (Golang)"}
              </span>
            </div>

            <button
              onClick={handleToggleClick}
              className="text-[11px] font-mono font-bold text-[#1A1D20]/60 hover:text-[#1A1D20] transition-colors cursor-pointer"
            >
              ✕ {t("theory.hideBtn", "Згорнути")}
            </button>
          </div>

          {/* 1. Simple Concept (Physical & Logical intuition) */}
          <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/15 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-[#1A1D20]">
              <Sparkles size={13} className="text-amber-700 shrink-0" />
              <span>{t("theory.conceptTitle", "Фізична та логічна концепція")}</span>
            </div>
            <p className="text-xs font-balsamiq font-medium text-[#1A1D20] leading-relaxed">
              {theory.concept}
            </p>
          </div>

          {/* 2. Token Breakdown (Atomic analysis of each symbol) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-[#1A1D20]">
              <Layers size={13} className="text-emerald-800 shrink-0" />
              <span>{t("theory.tokensTitle", "Анатомія по токенах (Token Breakdown)")}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {theory.tokens.map((item, idx) => (
                <div
                  key={`${item.token}-${idx}`}
                  className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/15 hover:border-[#1A1D20]/30 transition-colors shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-[#E5DFD1] border border-[#1A1D20]/25 text-[#1A1D20]">
                      {item.token}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-600/30 text-emerald-900">
                      {item.role}
                    </span>
                  </div>
                  <p className="text-xs font-balsamiq font-medium text-[#1A1D20] leading-snug">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Key Engineering Insights (Notes) */}
          {theory.notes && (
            <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/15 flex items-start gap-2.5 shadow-2xs">
              <AlertCircle size={15} className="text-amber-800 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono font-bold uppercase text-[#1A1D20]/70">
                  {t("theory.notesTitle", "Важливі інженерні нюанси")}:
                </div>
                <p className="text-xs font-balsamiq font-medium text-[#1A1D20] leading-relaxed">
                  {theory.notes}
                </p>
              </div>
            </div>
          )}

          {/* 4. C# vs Go Differences (Diff) */}
          {theory.diff && (
            <div className="p-3 rounded-xl bg-[#F0EBE0] border border-[#1A1D20]/20 flex items-start gap-2.5 shadow-2xs">
              <ArrowLeftRight size={15} className="text-[#1A1D20] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono font-bold uppercase text-[#1A1D20]/70">
                  {t("theory.diffTitle", "Різниця C# та Go")}:
                </div>
                <p className="text-xs font-mono font-medium text-[#1A1D20] leading-relaxed">
                  {theory.diff}
                </p>
              </div>
            </div>
          )}

          {/* Bottom Collapse Button */}
          <div className="pt-1 flex justify-end">
            <button
              onClick={handleToggleClick}
              className="text-xs font-mono font-bold text-[#1A1D20]/70 hover:text-[#1A1D20] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronUp size={13} />
              <span>{t("theory.hideBtn", "Згорнути теорію")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
