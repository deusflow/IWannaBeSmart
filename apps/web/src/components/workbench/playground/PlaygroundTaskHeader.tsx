/**
 * @file apps/web/src/components/workbench/playground/PlaygroundTaskHeader.tsx
 * @description Task selection header, concept badge, plain-English popover, and task goal description
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CodingTask } from "@iw/sim-engine";
import { BookOpen, Lightbulb, HelpCircle } from "lucide-react";
import { SyntaxAnatomyCard } from "./SyntaxAnatomyCard";

interface PlaygroundTaskHeaderProps {
  tasks: CodingTask[];
  currentTaskId: string;
  onSelectTask: (taskId: string) => void;
  showHint: boolean;
  onToggleHint: () => void;
  isTaskCompleted?: (taskId: string) => boolean;
  codeLang?: "csharp" | "go";
}

export const PlaygroundTaskHeader: React.FC<PlaygroundTaskHeaderProps> = ({
  tasks,
  currentTaskId,
  onSelectTask,
  showHint,
  onToggleHint,
  isTaskCompleted,
  codeLang = "csharp",
}) => {
  const { t } = useTranslation();
  const [showPlainEnglish, setShowPlainEnglish] = useState(false);
  const [showTheory, setShowTheory] = useState(false);
  const currentTask = tasks.find((t) => t.id === currentTaskId) || tasks[0];

  return (
    <div className="p-3.5 bg-paper rounded-2xl border border-paper-border space-y-2.5">
      {/* Top: Compact Engineering Task Switcher [ 1 ] [ 2✓ ] ... [ 7 ] & Concept Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-[#EBE5D8] rounded-xl border border-[#1A1D20]/20 shrink-0 shadow-paper-xs">
          {tasks.map((task) => {
            const isActive = task.id === currentTaskId;
            const isCompleted = isTaskCompleted?.(task.id);
            return (
              <button
                key={task.id}
                onClick={() => {
                  onSelectTask(task.id);
                  setShowPlainEnglish(false);
                  setShowTheory(false);
                }}
                className={`min-w-[28px] h-7 px-1.5 flex items-center justify-center text-xs font-mono font-bold rounded-lg transition-all cursor-pointer gap-0.5 ${
                  isActive
                    ? "bg-[#1A1D20] text-white shadow-xs border border-[#1A1D20]"
                    : isCompleted
                    ? "text-emerald-700 bg-emerald-500/15 border border-emerald-600/30 hover:bg-emerald-500/25"
                    : "text-[#1A1D20]/60 hover:text-[#1A1D20] hover:bg-[#1A1D20]/10 border border-transparent"
                }`}
                title={`${t("playground.taskSelectorLabel")} ${task.order}: ${t(task.titleKey)}${
                  isCompleted ? ` (${t("playground.taskCompletedBadge", "Пройдено")})` : ""
                }`}
                aria-label={`${t("playground.taskSelectorLabel")} ${task.order}`}
              >
                <span>{task.order}</span>
                {isCompleted && (
                  <span
                    className={`text-[10px] font-extrabold leading-none ${
                      isActive ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1D20]/5 border border-[#1A1D20]/20 text-[#1A1D20] text-xs font-mono font-bold whitespace-nowrap shrink-0">
          <BookOpen size={13} className="text-[#1A1D20]/70 shrink-0" />
          <span>{t(currentTask.conceptKey)}</span>
        </div>
      </div>

      {/* Task Title, Delicate 18x18 '?' Icon Button, and Objective */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs font-bold text-[#1A1D20]/50 shrink-0">
              #{currentTask.order}
            </span>
            <h3 className="font-display font-bold text-sm text-[#1A1D20] truncate">
              {t(currentTask.titleKey)}
            </h3>

            {/* Delicate 18x18 Graphite '?' Tooltip Toggle */}
            <button
              onClick={() => setShowPlainEnglish((p) => !p)}
              className={`w-[18px] h-[18px] min-w-[18px] min-h-[18px] rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                showPlainEnglish
                  ? "bg-[#1A1D20] text-white border-[#1A1D20] shadow-xs"
                  : "bg-[#EFE9DC]/80 hover:bg-[#1A1D20]/15 text-[#1A1D20]/70 hover:text-[#1A1D20] border-[#1A1D20]/30"
              }`}
              title={t("playground.plainEnglishTitle")}
              aria-label={t("playground.plainEnglishTitle")}
            >
              <HelpCircle size={11} strokeWidth={2.4} />
            </button>
          </div>

          <button
            onClick={onToggleHint}
            className={`text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 font-balsamiq font-medium ${
              showHint ? "text-[#1A1D20] font-bold" : "text-ink-muted hover:text-[#1A1D20]"
            }`}
            title="Підказка до завдання"
          >
            <Lightbulb size={13} className={showHint ? "text-[#1A1D20]" : "text-ink-muted"} />
            <span>{t("common.hint")}</span>
          </button>
        </div>

        <p className="font-sans text-xs text-ink-muted leading-relaxed">
          {t(currentTask.descKey)}
        </p>

        {/* Blueprint Style 'Простими словами:' (Plain English Card) */}
        {showPlainEnglish && currentTask.simpleExplanationKey && (
          <div className="p-3 rounded-xl bg-[#EBE5D8] border border-[#1A1D20]/25 text-xs font-balsamiq text-[#1A1D20] animate-in fade-in slide-in-from-top-1 space-y-1.5 shadow-paper-xs">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1A1D20]/10 border border-[#1A1D20]/20 font-mono font-bold text-[#1A1D20] text-[11px]">
              <span>💡</span>
              <span>[ {t("playground.plainEnglishTitle", "Простими словами:")} ]</span>
            </div>
            <p className="leading-relaxed text-[#1A1D20] text-xs font-balsamiq font-medium">
              {t(currentTask.simpleExplanationKey)}
            </p>
          </div>
        )}

        {/* Blueprint Style Regular Syntax Hint Card */}
        {showHint && (
          <div className="p-2.5 rounded-xl bg-[#E6E0D2] border border-[#1A1D20]/25 text-xs font-mono text-[#1A1D20] animate-in fade-in space-y-1 shadow-paper-xs">
            <div className="font-bold text-[#1A1D20] text-[11px]">
              [ 💡 {t("common.hint")}: ]
            </div>
            <div className="text-xs font-mono font-medium text-[#1A1D20]">
              {t(currentTask.hintKey)}
            </div>
          </div>
        )}

        {/* Blueprint Style Theory & Code Anatomy Card */}
        <div className="pt-0.5">
          <SyntaxAnatomyCard
            taskId={currentTaskId}
            codeLang={codeLang}
            isOpen={showTheory}
            onToggle={() => setShowTheory((p) => !p)}
          />
        </div>
      </div>
    </div>
  );
};
