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
  codeLang?: "csharp" | "go" | "python" | "yaml" | "typescript";
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
  const [activeSubTab, setActiveSubTab] = React.useState<"concept" | "tokens" | "diff">("concept");

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
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
          isOpen
            ? "bg-[#252932] text-white border-[#252932] shadow-sm"
            : "bg-white hover:bg-slate-50 border-black/[0.08] hover:border-black/[0.16] text-obsidian"
        }`}
        title={t("theory.badgeBtn", " Теорія та анатомія коду")}
      >
        <BookOpen size={13} className={isOpen ? "text-[#C5A059]" : "text-[#252932]"} />
        <span>{t("theory.badgeBtn", " Теорія та анатомія коду")}</span>
        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {/* ── Expanded Pure Porcelain Theory & Token Breakdown Card ── */}
      {isOpen && (
        <div className="p-4 rounded-2xl bg-white border border-black/[0.08] text-obsidian space-y-3.5 shadow-luxury animate-in fade-in slide-in-from-top-1">
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 border border-black/[0.06] text-slate-700">
                [ {t("theory.headerTitle", "Теорія та анатомія коду")} ]
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                {codeLang === "csharp" ? "C# (.NET)" : "Go (Golang)"}
              </span>
            </div>

            <button
              onClick={handleToggleClick}
              className="text-[11px] font-mono font-bold text-slate-400 hover:text-obsidian transition-colors cursor-pointer"
            >
              ✕ {t("theory.hideBtn", "Згорнути")}
            </button>
          </div>

          {/* Internal Tab Selector within Theory Card */}
          <div className="flex items-center gap-1.5 border-b border-black/[0.06] pb-2">
            <button
              onClick={() => setActiveSubTab("concept")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "concept"
                  ? "bg-[#252932] text-white shadow-2xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-black/[0.06]"
              }`}
            >
              <Sparkles size={12} className={activeSubTab === "concept" ? "text-[#C5A059]" : "text-amber-600"} />
              <span>{t("theory.conceptTitle", "Концепція")}</span>
            </button>

            <button
              onClick={() => setActiveSubTab("tokens")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "tokens"
                  ? "bg-[#252932] text-white shadow-2xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-black/[0.06]"
              }`}
            >
              <Layers size={12} className={activeSubTab === "tokens" ? "text-emerald-400" : "text-emerald-700"} />
              <span>{t("theory.tokensTitle", "Токени")} ({theory.tokens.length})</span>
            </button>

            {theory.diff && (
              <button
                onClick={() => setActiveSubTab("diff")}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === "diff"
                    ? "bg-[#252932] text-white shadow-2xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-black/[0.06]"
                }`}
              >
                <ArrowLeftRight size={12} className={activeSubTab === "diff" ? "text-sky-300" : "text-slate-600"} />
                <span>{t("theory.diffTitle", "C# vs Go")}</span>
              </button>
            )}
          </div>

          {/* Tab 1: Concept & Notes */}
          {activeSubTab === "concept" && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-black/[0.06] space-y-1 shadow-2xs">
                <p className="text-xs font-sans font-medium text-obsidian leading-relaxed">
                  {theory.concept}
                </p>
              </div>

              {theory.notes && (
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-start gap-2.5 shadow-2xs">
                  <AlertCircle size={15} className="text-amber-800 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono font-bold uppercase text-amber-900/80">
                      {t("theory.notesTitle", "Важливі інженерні нюанси")}:
                    </div>
                    <p className="text-xs font-sans font-medium text-amber-950 leading-relaxed">
                      {theory.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Token Breakdown */}
          {activeSubTab === "tokens" && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {theory.tokens.map((item, idx) => (
                  <div
                    key={`${item.token}-${idx}`}
                    className="p-2.5 rounded-xl bg-slate-50/70 border border-black/[0.06] hover:border-black/[0.14] transition-colors shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-white border border-black/[0.08] text-obsidian shadow-2xs">
                        {item.token}
                      </span>
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-600/25 text-emerald-900">
                        {item.role}
                      </span>
                    </div>
                    <p className="text-xs font-sans font-medium text-obsidian leading-snug">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: C# vs Go Differences */}
          {activeSubTab === "diff" && theory.diff && (
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-black/[0.06] flex items-start gap-2.5 shadow-2xs animate-in fade-in duration-150">
              <ArrowLeftRight size={15} className="text-[#252932] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-500">
                  {t("theory.diffTitle", "Різниця C# та Go")}:
                </div>
                <p className="text-xs font-mono font-medium text-obsidian leading-relaxed">
                  {theory.diff}
                </p>
              </div>
            </div>
          )}

          {/* Bottom Collapse Button */}
          <div className="pt-1 flex justify-end">
            <button
              onClick={handleToggleClick}
              className="text-xs font-mono font-bold text-slate-500 hover:text-obsidian flex items-center gap-1 transition-colors cursor-pointer"
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
