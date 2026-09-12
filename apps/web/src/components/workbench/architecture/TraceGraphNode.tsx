/**
 * @file apps/web/src/components/workbench/architecture/TraceGraphNode.tsx
 * @description Dedicated ReactFlow node component for Trace-Chain items with Bypass toggles.
 */

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { TraceNode, TraceNodeType } from "./types";
import {
  FileCode,
  Box,
  Cpu,
  Zap,
  Power,
  AlertTriangle,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Tv,
} from "lucide-react";

export interface TraceGraphNodeProps {
  id: string;
  data: TraceNode & {
    onToggleBypass?: (nodeId: string) => void;
    isSelectedEntity?: boolean;
  };
}

const TYPE_CONFIG: Record<
  TraceNodeType,
  {
    label: string;
    icon: React.ReactNode;
    badgeBg: string;
    badgeText: string;
    borderActive: string;
    glow: string;
  }
> = {
  Declaration: {
    label: "DECLARATION",
    icon: <FileCode size={13} />,
    badgeBg: "bg-purple-500/15 border-purple-500/30",
    badgeText: "text-purple-300",
    borderActive: "border-purple-500/60",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.15)]",
  },
  Implementation: {
    label: "IMPLEMENTATION",
    icon: <Box size={13} />,
    badgeBg: "bg-emerald-500/15 border-emerald-500/30",
    badgeText: "text-emerald-300",
    borderActive: "border-emerald-500/60",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
  },
  Registration: {
    label: "REGISTRATION (DI)",
    icon: <Cpu size={13} />,
    badgeBg: "bg-cyan-500/15 border-cyan-500/30",
    badgeText: "text-cyan-300",
    borderActive: "border-cyan-500/60",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]",
  },
  InjectionPoint: {
    label: "INJECTION POINT",
    icon: <Zap size={13} />,
    badgeBg: "bg-amber-500/15 border-amber-500/30",
    badgeText: "text-amber-300",
    borderActive: "border-amber-500/60",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
  },
  CallSite: {
    label: "CALL SITE",
    icon: <Power size={13} />,
    badgeBg: "bg-yellow-500/15 border-yellow-500/30",
    badgeText: "text-yellow-300",
    borderActive: "border-yellow-500/60",
    glow: "shadow-[0_0_15px_rgba(234,179,8,0.15)]",
  },
  Effect: {
    label: "HARDWARE EFFECT",
    icon: <Tv size={13} />,
    badgeBg: "bg-rose-500/15 border-rose-500/30",
    badgeText: "text-rose-300",
    borderActive: "border-rose-500/60",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
  },
};

export const TraceGraphNode: React.FC<TraceGraphNodeProps> = memo(({ id, data }) => {
  const config = TYPE_CONFIG[data.type] || TYPE_CONFIG.Declaration;
  const isBypassed = Boolean(data.isBypassed);
  const isBroken = Boolean(data.isBroken) && !isBypassed;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onToggleBypass) {
      data.onToggleBypass(id);
    }
  };

  return (
    <div
      className={`relative rounded-xl border transition-all select-none w-[260px] text-gray-200 overflow-hidden ${
        isBypassed
          ? "bg-[#18191C]/90 border-dashed border-red-500/50 opacity-80"
          : isBroken
          ? "bg-[#201518]/95 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
          : `bg-[#1C1D21]/95 ${config.borderActive} ${config.glow}`
      }`}
    >
      {/* ReactFlow Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="!w-3 !h-3 !bg-[#26272C] !border-2 !border-gray-400 hover:!border-white transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="!w-3 !h-3 !bg-[#26272C] !border-2 !border-gray-400 hover:!border-white transition-colors"
      />

      {/* Card Header */}
      <div className="px-3 py-2 border-b border-white/[0.08] flex items-center justify-between gap-1.5 bg-black/20">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border shrink-0 ${config.badgeBg} ${config.badgeText}`}
          >
            {config.icon}
            <span>{config.label}</span>
          </span>
        </div>

        {/* Bypass toggle button (v1 feature) */}
        {data.type !== "Effect" && (
          <button
            onClick={handleToggle}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
              isBypassed
                ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:text-gray-200 hover:bg-white/10"
            }`}
            title={isBypassed ? "Увімкнути вузол знову" : "Вимкнути вузол (Bypass v1)"}
          >
            {isBypassed ? <ToggleRight size={13} className="text-red-400" /> : <ToggleLeft size={13} />}
            <span>{isBypassed ? "Bypassed" : "Active"}</span>
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3 space-y-2">
        {/* Node Label */}
        <div>
          <div
            className={`font-mono text-[12px] font-bold tracking-tight leading-tight ${
              isBypassed ? "line-through text-gray-500" : isBroken ? "text-red-300" : "text-gray-100"
            }`}
          >
            {data.label}
          </div>
          <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1 mt-0.5">
            <span>{data.filePath}</span>
            <span className="text-gray-600">({data.lineRange[0]}-{data.lineRange[1]})</span>
          </div>
        </div>

        {/* Code Snippet Box */}
        {data.codeSnippet && (
          <div className="p-1.5 rounded bg-black/40 border border-white/[0.06] font-mono text-[10px] text-gray-300 overflow-x-auto leading-relaxed max-h-20 scrollbar-thin">
            <pre className="whitespace-pre">{data.codeSnippet}</pre>
          </div>
        )}

        {/* Plain-Language Description */}
        {data.description && (
          <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
            {data.description}
          </p>
        )}

        {/* Status Pills */}
        {isBypassed ? (
          <div className="flex items-center gap-1.5 p-1.5 rounded bg-red-950/40 border border-red-900/40 text-red-300 text-[10px] font-mono">
            <AlertTriangle size={12} className="text-red-400 shrink-0" />
            <span>Вузол обійдено: виклик не пройде</span>
          </div>
        ) : isBroken ? (
          <div className="flex items-center gap-1.5 p-1.5 rounded bg-red-950/40 border border-red-900/40 text-red-300 text-[10px] font-mono animate-pulse">
            <AlertTriangle size={12} className="text-red-400 shrink-0" />
            <span>Ланцюг обірвано вище</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono">
            <CheckCircle2 size={11} />
            <span>Ланка зв'язана штатно</span>
          </div>
        )}
      </div>
    </div>
  );
});

TraceGraphNode.displayName = "TraceGraphNode";
