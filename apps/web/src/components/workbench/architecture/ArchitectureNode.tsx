import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import type { ArchitectureNodeData, EntityType } from "./types";
import { FileCode, Box, Cpu, Zap, X, LucideIcon } from "lucide-react";

// ── Type badge colours (port annotations only) ──
const getTypeBadgeStyle = (typeAnnotation?: string): string => {
  if (!typeAnnotation) return "text-gray-500 bg-gray-800/50 border-gray-700/50";
  if (typeAnnotation.includes("IRemoteCommand"))
    return "text-purple-300 bg-purple-950/50 border-purple-600/30";
  if (typeAnnotation.includes("ITVReceiver"))
    return "text-blue-300 bg-blue-950/50 border-blue-600/30";
  if (typeAnnotation.includes("DisplayService") || typeAnnotation.includes("AudioService"))
    return "text-emerald-300 bg-emerald-950/50 border-emerald-600/30";
  if (typeAnnotation.includes("hardware"))
    return "text-orange-300 bg-orange-950/50 border-orange-600/30";
  return "text-gray-400 bg-gray-800/50 border-gray-700/50";
};

// ── Entity accent colours (header badge only) ──
const ENTITY_BADGE: Record<
  EntityType,
  { bg: string; text: string; dot: string; icon: string }
> = {
  interface: {
    bg: "bg-purple-600/20 border-purple-500/40",
    text: "text-purple-300",
    dot: "#8B5CF6",
    icon: "text-purple-400",
  },
  class: {
    bg: "bg-blue-600/20 border-blue-500/40",
    text: "text-blue-300",
    dot: "#3B82F6",
    icon: "text-blue-400",
  },
  controller: {
    bg: "bg-amber-600/20 border-amber-500/40",
    text: "text-amber-300",
    dot: "#F59E0B",
    icon: "text-amber-400",
  },
  service: {
    bg: "bg-emerald-600/20 border-emerald-500/40",
    text: "text-emerald-300",
    dot: "#10B981",
    icon: "text-emerald-400",
  },
};

const ICON_MAP: Record<EntityType, LucideIcon> = {
  interface: FileCode,
  class: Box,
  controller: Cpu,
  service: Zap,
};

import { useWorkbenchStore } from "../../../store/workbenchStore";

export const ArchitectureNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { t } = useTranslation();
  const { deleteElements, getNode } = useReactFlow();
  const nodeData = data as unknown as ArchitectureNodeData;
  const Icon = ICON_MAP[nodeData.entityType] || Box;
  const badge = ENTITY_BADGE[nodeData.entityType] || ENTITY_BADGE.class;

  const { mentorPhase, guidedStep, isHintActive } = useWorkbenchStore();

  const isTvController = nodeData.fileId.includes("tv-controller") || id.includes("tv-controller");
  const isPowerCommand = nodeData.fileId.includes("power-command") || id.includes("power-command");

  const isTargetForStep =
    (mentorPhase === "GUIDED" && (
      (guidedStep === 1 && isTvController) ||
      (guidedStep === 3 && (isTvController || isPowerCommand))
    )) || (mentorPhase === "PRACTICE" && isHintActive && (isTvController || isPowerCommand));

  const hasInputs = nodeData.inputs && nodeData.inputs.length > 0;
  const hasOutputs = nodeData.outputs && nodeData.outputs.length > 0;

  // ── [×] Delete handler ──
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const node = getNode(id);
      if (node) deleteElements({ nodes: [node] });
    },
    [id, deleteElements, getNode]
  );

  return (
    <div
      className={`
        w-[268px] rounded-xl select-none
        bg-[#2B2D33] border transition-all duration-200
        shadow-[0_8px_24px_rgba(0,0,0,0.6)]
        ${
          selected
            ? "border-white/30 shadow-[0_0_0_1.5px_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.6)]"
            : isTargetForStep
            ? "border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-1 ring-purple-500/40"
            : nodeData.isFlashing
            ? "border-white/25"
            : "border-white/[0.07] hover:border-white/[0.14]"
        }
      `}
    >
      {/* ── Header (entity badge + filename + [×]) ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
        {/* Coloured dot — only colour accent in the header */}
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: badge.dot }}
        />

        {/* Icon + Name */}
        <div className={`shrink-0 ${badge.icon}`}>
          <Icon size={13} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-mono font-bold text-[11px] text-gray-100 truncate leading-tight">
            {nodeData.name}
          </h4>
          <span className="font-mono text-[8.5px] text-gray-500 block truncate">
            {nodeData.path}
          </span>
        </div>

        {/* Entity type badge */}
        <span
          className={`font-mono text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${badge.bg} ${badge.text}`}
        >
          {nodeData.entityType}
        </span>

        {/* [×] Close button */}
        <button
          onClick={handleClose}
          title="Видалити з дошки"
          className="
            p-0.5 rounded ml-0.5 shrink-0 cursor-pointer
            text-gray-600 hover:text-gray-200
            hover:bg-red-500/20 transition-colors duration-100
          "
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Ports Body ── */}
      <div className="p-3 grid grid-cols-2 gap-3">
        {/* Left: Inputs */}
        <div className="space-y-1.5">
          <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-gray-600">
            {t("architecture.inputsDI")}
          </div>
          {hasInputs ? (
            nodeData.inputs.map((inp) => {
              const isPortTarget =
                isTvController &&
                inp.id === "in-command-handler" &&
                ((mentorPhase === "GUIDED" && (guidedStep === 1 || guidedStep === 3)) ||
                  (mentorPhase === "PRACTICE" && isHintActive));

              return (
                <div key={inp.id} className="relative flex items-start py-0.5 group">
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={inp.id}
                    className={`!w-3 !h-3 !rounded-full !-left-[17px] !border-[1.5px] !border-[#2B2D33] transition-transform group-hover:scale-125 cursor-crosshair ${
                      isPortTarget
                        ? "!ring-4 !ring-purple-400 !shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-pulse !scale-125 z-10"
                        : ""
                    }`}
                    style={{ backgroundColor: inp.color || "#3B82F6" }}
                  />
                  <div className="min-w-0 pl-1">
                    <span
                      className={`font-mono font-semibold text-[9.5px] block leading-tight truncate ${
                        isPortTarget ? "text-purple-300 font-bold" : "text-gray-200"
                      }`}
                    >
                      {inp.name}
                    </span>
                    {inp.typeAnnotation && (
                      <span
                        className={`font-mono text-[7.5px] font-medium px-1 py-px rounded border inline-block mt-0.5 max-w-full truncate ${getTypeBadgeStyle(
                          inp.typeAnnotation
                        )}`}
                      >
                        {inp.typeAnnotation}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <span className="text-[8.5px] font-mono text-gray-600 italic block">
              {t("architecture.noInputs")}
            </span>
          )}
        </div>

        {/* Right: Outputs */}
        <div className="space-y-1.5 text-right">
          <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-gray-600">
            {t("architecture.methodsOutputs")}
          </div>
          {hasOutputs ? (
            nodeData.outputs.map((out) => {
              const isPortTarget =
                isPowerCommand &&
                out.id === "out-execute" &&
                ((mentorPhase === "GUIDED" && guidedStep === 3) ||
                  (mentorPhase === "PRACTICE" && isHintActive));

              return (
                <div
                  key={out.id}
                  className="relative flex items-start justify-end py-0.5 group"
                >
                  <div className="min-w-0 pr-1 text-right">
                    <span
                      className={`font-mono font-semibold text-[9.5px] block leading-tight truncate ${
                        isPortTarget ? "text-purple-300 font-bold" : "text-gray-200"
                      }`}
                    >
                      {out.name}
                    </span>
                    {out.typeAnnotation && (
                      <span
                        className={`font-mono text-[7.5px] font-medium px-1 py-px rounded border inline-block mt-0.5 max-w-full truncate ${getTypeBadgeStyle(
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
                    className={`!w-3 !h-3 !rounded-full !-right-[17px] !border-[1.5px] !border-[#2B2D33] transition-transform group-hover:scale-125 cursor-crosshair ${
                      isPortTarget
                        ? "!ring-4 !ring-purple-400 !shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-pulse !scale-125 z-10"
                        : ""
                    }`}
                    style={{ backgroundColor: out.color || "#10B981" }}
                  />
                </div>
              );
            })
          ) : (
            <span className="text-[8.5px] font-mono text-gray-600 italic block">
              {t("architecture.noOutputs")}
            </span>
          )}
        </div>
      </div>

      {/* ── Role description ── */}
      <div className="px-3 pb-2.5 border-t border-white/[0.05] pt-2">
        <p className="font-balsamiq text-[9.5px] text-gray-500 leading-snug">
          {nodeData.role}
        </p>
      </div>
    </div>
  );
};
