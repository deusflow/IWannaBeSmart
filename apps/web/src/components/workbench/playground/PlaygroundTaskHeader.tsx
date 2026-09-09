/**
 * @file apps/web/src/components/workbench/playground/PlaygroundTaskHeader.tsx
 * @description Task selection header, concept badge, and task goal description
 */

import React from "react";
import { useTranslation } from "react-i18next";
import type { CodingTask } from "@iw/sim-engine";
import { BookOpen, Lightbulb } from "lucide-react";

interface PlaygroundTaskHeaderProps {
  tasks: CodingTask[];
  currentTaskId: string;
  onSelectTask: (taskId: string) => void;
  showHint: boolean;
  onToggleHint: () => void;
}

export const PlaygroundTaskHeader: React.FC<PlaygroundTaskHeaderProps> = ({
  tasks,
  currentTaskId,
  onSelectTask,
  showHint,
  onToggleHint,
}) => {
  const { t } = useTranslation();
  const currentTask = tasks.find((t) => t.id === currentTaskId) || tasks[0];

  return (
    <div className="p-3.5 bg-paper rounded-2xl border border-paper-border space-y-2.5">
      {/* Top: Task Selector & Concept Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-paper-subtle rounded-xl border border-paper-border flex-nowrap overflow-x-auto scrollbar-none">
          {tasks.map((task) => {
            const isActive = task.id === currentTaskId;
            return (
              <button
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`px-3 py-1 text-xs font-display font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-accent-blue text-white shadow-paper-sm"
                    : "text-ink-muted hover:text-ink hover:bg-paper"
                }`}
              >
                {t("playground.taskSelectorLabel")} {task.order}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-mono font-bold whitespace-nowrap shrink-0">
          <BookOpen size={13} />
          <span>{t(currentTask.conceptKey)}</span>
        </div>
      </div>

      {/* Task Title & Objective */}
      <div className="space-y-1">
        <h3 className="font-display font-bold text-sm text-ink flex items-center justify-between">
          <span>{t(currentTask.titleKey)}</span>
          <button
            onClick={onToggleHint}
            className={`text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              showHint ? "text-amber-500 font-bold" : "text-ink-muted hover:text-ink"
            }`}
            title="Підказка до завдання"
          >
            <Lightbulb size={13} className={showHint ? "text-amber-500" : "text-ink-muted"} />
            <span>{t("common.hint")}</span>
          </button>
        </h3>
        <p className="font-sans text-xs text-ink-muted leading-relaxed">
          {t(currentTask.descKey)}
        </p>

        {showHint && (
          <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-600 dark:text-amber-300">
            {t(currentTask.hintKey)}
          </div>
        )}
      </div>
    </div>
  );
};
