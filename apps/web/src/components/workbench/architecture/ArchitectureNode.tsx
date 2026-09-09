import React from "react";
import { useTranslation } from "react-i18next";
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
    headerAccent: string;
  }
> = {
  interface: {
    headerBg: "bg-purple-950/70 border-purple-500/40",
    badgeBg: "bg-purple-500/20 border-purple-500/50",
    badgeText: "text-purple-300",
    border: "border-purple-500/50",
    iconColor: "text-purple-400",
    headerAccent: "bg-purple-500",
  },
  class: {
    headerBg: "bg-blue-950/70 border-blue-500/40",
    badgeBg: "bg-blue-500/20 border-blue-500/50",
    badgeText: "text-blue-300",
    border: "border-blue-500/50",
    iconColor: "text-blue-400",
    headerAccent: "bg-blue-500",
  },
  controller: {
    headerBg: "bg-amber-950/70 border-amber-500/40",
    badgeBg: "bg-amber-500/20 border-amber-500/50",
    badgeText: "text-amber-300",
    border: "border-amber-500/50",
    iconColor: "text-amber-400",
    headerAccent: "bg-amber-500",
  },
  service: {
    headerBg: "bg-emerald-950/70 border-emerald-500/40",
    badgeBg: "bg-emerald-500/20 border-emerald-500/50",
    badgeText: "text-emerald-300",
    border: "border-emerald-500/50",
    iconColor: "text-emerald-400",
    headerAccent: "bg-emerald-500",
  },
};

const getTypeBadgeStyle = (typeAnnotation?: string) => {
  if (!typeAnnotation) return "text-gray-400 bg-gray-800/60 border-gray-700";
  if (typeAnnotation.includes("IRemoteCommand"))
    return "text-purple-300 bg-purple-950/60 border-purple-500/40";
  if (typeAnnotation.includes("ITVReceiver"))
    return "text-blue-300 bg-blue-950/60 border-blue-500/40";
  if (typeAnnotation.includes("DisplayService") || typeAnnotation.includes("AudioService"))
    return "text-emerald-300 bg-emerald-950/60 border-emerald-500/40";
  return "text-amber-300 bg-amber-950/60 border-amber-500/40";
};

export const ArchitectureNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { t } = useTranslation();
  const nodeData = data as unknown as ArchitectureNodeData;
  const Icon = ICON_MAP[nodeData.entityType] || Box;
  const theme = COLOR_MAP[nodeData.entityType] || COLOR_MAP.class;

  const hasInputs = nodeData.inputs && nodeData.inputs.length > 0;
  const hasOutputs = nodeData.outputs && nodeData.outputs.length > 0;

  return (
    <div
      className={`w-[270px] rounded-2xl bg-[#26272B] border-2 transition-all duration-200 select-none shadow-[0_12px_32px_rgba(0,0,0,0.65)] ${
        selected
          ? "border-accent-blue ring-2 ring-accent-blue/50 scale-[1.01]"
          : nodeData.isHighlighted
          ? "border-amber-400 ring-2 ring-amber-400/50"
          : "border-[#3F4148] hover:border-[#5B5E68]"
      }`}
    >
      {/* Node Header (Blender / Unreal Blueprints with distinct banner and top accent strip) */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <div className={`h-1 w-full ${theme.headerAccent}`} />
        <div
          className={`px-3 py-2 border-b flex items-center justify-between gap-2 ${theme.headerBg}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border ${theme.badgeBg} ${theme.iconColor}`}
            >
              <Icon size={14} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h4 className="font-mono font-bold text-xs text-white truncate leading-tight">
                {nodeData.name}
              </h4>
              <span className="font-mono text-[9px] text-gray-400 truncate block">
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
      </div>

      {/* Node Body (Split Inputs / Outputs) */}
      <div className="p-3 space-y-3 bg-[#26272B] rounded-b-2xl">
        {/* Ports Section */}
        <div className="grid grid-cols-2 gap-3">
          {/* Left Column: Inputs (DI Dependencies) */}
          <div className="space-y-2">
            <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400">
              {t("architecture.inputsDI")}
            </div>
            {hasInputs ? (
              nodeData.inputs.map((inp) => (
                <div key={inp.id} className="relative flex items-center py-1 group">
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={inp.id}
                    className="!w-3.5 !h-3.5 !rounded-full !-left-[19px] !border-2 !border-[#26272B] transition-transform group-hover:scale-130 cursor-crosshair shadow-md"
                    style={{ backgroundColor: inp.color || "#3B82F6" }}
                  />
                  <div className="min-w-0 pl-1">
                    <span className="font-mono font-bold text-[10px] text-gray-100 block leading-tight truncate">
                      {inp.name}
                    </span>
                    {inp.typeAnnotation && (
                      <span
                        className={`font-mono text-[8px] font-semibold px-1 py-0.2 rounded border inline-block mt-0.5 max-w-full truncate ${getTypeBadgeStyle(
                          inp.typeAnnotation
                        )}`}
                      >
                        {inp.typeAnnotation}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <span className="text-[9px] font-mono text-gray-500 italic block py-1">
                {t("architecture.noInputs")}
              </span>
            )}
          </div>

          {/* Right Column: Outputs (Methods / Events) */}
          <div className="space-y-2 text-right">
            <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400">
              {t("architecture.methodsOutputs")}
            </div>
            {hasOutputs ? (
              nodeData.outputs.map((out) => (
                <div
                  key={out.id}
                  className="relative flex items-center justify-end py-1 group"
                >
                  <div className="min-w-0 pr-1 text-right">
                    <span className="font-mono font-bold text-[10px] text-gray-100 block leading-tight truncate">
                      {out.name}
                    </span>
                    {out.typeAnnotation && (
                      <span
                        className={`font-mono text-[8px] font-semibold px-1 py-0.2 rounded border inline-block mt-0.5 max-w-full truncate ${getTypeBadgeStyle(
                          out.typeAnnotation
                        )}`}
                      >
                        {out.typeAnnotation}
                      </span>
                    )}
                  </div>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={out.id}
                    className="!w-3.5 !h-3.5 !rounded-full !-right-[19px] !border-2 !border-[#26272B] transition-transform group-hover:scale-130 cursor-crosshair shadow-md"
                    style={{ backgroundColor: out.color || "#10B981" }}
                  />
                </div>
              ))
            ) : (
              <span className="text-[9px] font-mono text-gray-500 italic block py-1">
                {t("architecture.noOutputs")}
              </span>
            )}
          </div>
        </div>

        {/* Ukrainian Role & Briefing in High Contrast */}
        <div className="pt-2.5 border-t border-[#383A42]">
          <p className="font-balsamiq text-[10.5px] text-gray-300 leading-snug">
            {nodeData.role}
          </p>
        </div>
      </div>
    </div>
  );
};

