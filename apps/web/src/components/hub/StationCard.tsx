import React from "react";
import { Badge, Button, ProgressBar } from "@iw/ui";
import { Lock, ArrowRight, Clock, Layers, Code2 } from "lucide-react";

export interface StationData {
  id: string;
  title: string;
  metaphor: string;
  description: string;
  icon: React.ReactNode;
  technologies: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  totalLevels: number;
  completedLevels: number;
  isLocked: boolean;
  statusText: "Ready" | "Coming Soon";
}

interface StationCardProps {
  station: StationData;
  onEnter: (id: string) => void;
}

const difficultyStyles: Record<
  StationData["difficulty"],
  { label: string; variant: "ok" | "signal" | "accent" }
> = {
  Beginner: { label: "Level 1 • Fundamental", variant: "ok" },
  Intermediate: { label: "Level 2 • Distributed", variant: "signal" },
  Advanced: { label: "Level 3 • Systems", variant: "accent" },
};

export const StationCard: React.FC<StationCardProps> = ({ station, onEnter }) => {
  const {
    id,
    title,
    metaphor,
    description,
    icon,
    technologies,
    difficulty,
    estimatedTime,
    totalLevels,
    completedLevels,
    isLocked,
    statusText,
  } = station;

  const diffConfig = difficultyStyles[difficulty];
  const progressPercent =
    totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
        isLocked
          ? "border-paper-border/60 bg-paper-subtle/50 opacity-75 shadow-none"
          : "border-paper-border bg-paper-subtle shadow-paper hover:shadow-paper-lg hover:border-accent-blue/30"
      }`}
    >
      {/* Top Graphic Zone with Notebook Grid Background */}
      <div className="relative p-6 border-b border-paper-border/70 bg-notebook-grid overflow-hidden">
        {/* Subtle gradient overlay to fade the grid nicely into paper */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-paper-subtle/20 to-paper-subtle/90 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-4">
            {/* Station Icon */}
            <div
              className={`h-11 w-11 rounded-lg border flex items-center justify-center transition-transform duration-200 ${
                isLocked
                  ? "bg-paper border-paper-border text-ink-subtle"
                  : "bg-paper-subtle border-accent-blue-border text-accent-blue group-hover:scale-105 shadow-paper-sm"
              }`}
            >
              {icon}
            </div>

            {/* Status Stamp */}
            {isLocked ? (
              <Badge variant="neutral" size="sm" mono className="gap-1">
                <Lock size={11} strokeWidth={1.75} />
                {statusText}
              </Badge>
            ) : (
              <Badge variant="ok" size="sm" dot pulse mono>
                {statusText}
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
            <span>{title}</span>
          </h3>

          <p className="text-xs font-mono font-semibold text-accent-blue mt-1">
            {metaphor}
          </p>

          <p className="text-xs text-ink-muted mt-2.5 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      {/* Details & Specs Zone */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5 bg-paper-subtle">
        <div className="space-y-4">
          {/* Metadata Row: Difficulty & Time */}
          <div className="flex items-center justify-between text-xs font-mono text-ink-subtle pt-1">
            <span className="flex items-center gap-1.5">
              <Layers size={13} strokeWidth={1.75} className="text-ink-muted" />
              {diffConfig.label}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} strokeWidth={1.75} className="text-ink-muted" />
              {estimatedTime}
            </span>
          </div>

          {/* Technologies Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono text-ink-subtle mr-1 flex items-center gap-1">
              <Code2 size={12} strokeWidth={1.75} />
              Stack:
            </span>
            {technologies.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[11px] rounded bg-paper border border-paper-border text-ink font-mono"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Progress Tracker (if active station) */}
          {!isLocked && (
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono text-ink-muted">
                <span>Station Progress</span>
                <span>
                  {completedLevels} / {totalLevels} levels ({progressPercent}%)
                </span>
              </div>
              <ProgressBar
                value={progressPercent}
                size="sm"
                variant={progressPercent > 0 ? "ok" : "accent"}
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-paper-border/60">
          {isLocked ? (
            <div className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-mono text-ink-subtle bg-paper/60 rounded-md border border-paper-border/50 select-none">
              <Lock size={13} strokeWidth={1.75} />
              <span>Station Locked in Alpha</span>
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              className="w-full justify-between group/btn text-xs font-semibold"
              onClick={() => onEnter(id)}
              rightIcon={
                <ArrowRight
                  size={14}
                  strokeWidth={1.75}
                  className="transition-transform duration-150 group-hover/btn:translate-x-1"
                />
              }
            >
              <span>Enter Station</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
