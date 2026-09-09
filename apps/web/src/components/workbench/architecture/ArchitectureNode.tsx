import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ArchitectureNodeData, EntityType } from "./types";
import { FileCode, Box, Cpu, Zap, LucideIcon } from "lucide-react";

const ICON_MAP: Record<EntityType, LucideIcon> = {
  interface: FileCode,
  class: Box,
  controller: Cpu,
  service: Zap,
};

const COLOR_MAP: Record<
  EntityType,
  {
    headerBg: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    iconColor: string;
  }
> = {
  interface: {
    headerBg: "bg-purple-500/10",
    badgeBg: "bg-purple-500/15 border-purple-500/30",
    badgeText: "text-purple-600 dark:text-purple-400",
    border: "border-purple-300 dark:border-purple-800",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  class: {
    headerBg: "bg-blue-500/10",
    badgeBg: "bg-blue-500/15 border-blue-500/30",
    badgeText: "text-blue-600 dark:text-blue-400",
    border: "border-blue-300 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  controller: {
    headerBg: "bg-amber-500/10",
    badgeBg: "bg-amber-500/15 border-amber-500/30",
    badgeText: "text-amber-600 dark:text-amber-400",
    border: "border-amber-300 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  service: {
    headerBg: "bg-emerald-500/10",
    badgeBg: "bg-emerald-500/15 border-emerald-500/30",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-300 dark:border-emerald-800",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
};

export const ArchitectureNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as ArchitectureNodeData;
  const Icon = ICON_MAP[nodeData.entityType] || Box;
  const theme = COLOR_MAP[nodeData.entityType] || COLOR_MAP.class;

  const hasInputs = nodeData.inputs && nodeData.inputs.length > 0;
  const hasOutputs = nodeData.outputs && nodeData.outputs.length > 0;

  return (
    <div
      className={`min-w-[240px] max-w-[280px] rounded-2xl bg-paper border transition-all duration-200 select-none shadow-paper-md ${
        selected
          ? "border-accent-blue ring-2 ring-accent-blue/30"
          : nodeData.isHighlighted
          ? "border-amber-500 ring-2 ring-amber-400/40"
          : "border-paper-border hover:border-ink-muted/50"
      }`}
    >
      {/* Node Header (Blender/Unreal style with colored accent banner) */}
      <div
        className={`px-3 py-2 rounded-t-2xl border-b border-paper-border flex items-center justify-between gap-2 ${theme.headerBg}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border ${theme.badgeBg} ${theme.iconColor}`}
          >
            <Icon size={14} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h4 className="font-mono font-bold text-xs text-ink truncate leading-tight">
              {nodeData.name}
            </h4>
            <span className="font-mono text-[9px] text-ink-subtle truncate block">
              {nodeData.path}
            </span>
          </div>
        </div>

        <span
          className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${theme.badgeBg} ${theme.badgeText}`}
        >
          {nodeData.entityType}
        </span>
      </div>

      {/* Node Body (Split Inputs / Outputs) */}
      <div className="p-3 space-y-3">
        {/* Ports Section */}
        <div className="grid grid-cols-2 gap-3">
          {/* Left Column: Inputs (DI Dependencies) */}
          <div className="space-y-2">
            <div className="text-[9px] font-balsamiq font-bold uppercase tracking-wider text-ink-subtle">
              Входи (DI)
            </div>
            {hasInputs ? (
              nodeData.inputs.map((inp) => (
                <div key={inp.id} className="relative flex items-center py-1 group">
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={inp.id}
                    className="!w-3 !h-3 !rounded-full !-left-[18px] !border-2 !border-paper transition-transform group-hover:scale-125 cursor-crosshair shadow-xs"
                    style={{ backgroundColor: inp.color || "#3B82F6" }}
                  />
                  <div className="min-w-0 pl-1">
                    <span className="font-mono font-bold text-[10px] text-ink block leading-tight truncate">
                      {inp.name}
                    </span>
                    {inp.typeAnnotation && (
                      <span className="font-mono text-[8.5px] text-ink-subtle block truncate">
                        {inp.typeAnnotation}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <span className="text-[9px] font-balsamiq text-ink-subtle/70 italic">
                Немає входів
              </span>
            )}
          </div>

          {/* Right Column: Outputs (Methods / Events) */}
          <div className="space-y-2 text-right">
            <div className="text-[9px] font-balsamiq font-bold uppercase tracking-wider text-ink-subtle">
              Методи / Події
            </div>
            {hasOutputs ? (
              nodeData.outputs.map((out) => (
                <div
                  key={out.id}
                  className="relative flex items-center justify-end py-1 group"
                >
                  <div className="min-w-0 pr-1 text-right">
                    <span className="font-mono font-bold text-[10px] text-ink block leading-tight truncate">
                      {out.name}
                    </span>
                    {out.typeAnnotation && (
                      <span className="font-mono text-[8.5px] text-ink-subtle block truncate">
                        {out.typeAnnotation}
                      </span>
                    )}
                  </div>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={out.id}
                    className="!w-3 !h-3 !rounded-full !-right-[18px] !border-2 !border-paper transition-transform group-hover:scale-125 cursor-crosshair shadow-xs"
                    style={{ backgroundColor: out.color || "#10B981" }}
                  />
                </div>
              ))
            ) : (
              <span className="text-[9px] font-balsamiq text-ink-subtle/70 italic">
                Немає методів
              </span>
            )}
          </div>
        </div>

        {/* Ukrainian Role & Briefing */}
        <div className="pt-2 border-t border-paper-border/60">
          <p className="font-balsamiq text-[10px] text-ink-muted leading-tight">
            {nodeData.role}
          </p>
        </div>
      </div>
    </div>
  );
};
