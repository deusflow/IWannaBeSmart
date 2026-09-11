import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import type { ArchitectureNodeData, EntityType } from "./types";
import { FileCode, Box, Cpu, Zap, X, LucideIcon } from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";

// ── Entity accent colors (dot + icon only) ──
const ENTITY_ACCENT: Record<
  EntityType,
  { dot: string; icon: string }
> = {
  interface: { dot: "#A855F7", icon: "text-purple-400" },
  class: { dot: "#3B82F6", icon: "text-blue-400" },
  controller: { dot: "#F59E0B", icon: "text-amber-400" },
  service: { dot: "#10B981", icon: "text-emerald-400" },
};

const ICON_MAP: Record<EntityType, LucideIcon> = {
  interface: FileCode,
  class: Box,
  controller: Cpu,
  service: Zap,
};

export const ArchitectureNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { t } = useTranslation();
  const { deleteElements, getNode } = useReactFlow();
  const nodeData = data as unknown as ArchitectureNodeData;
  const Icon = ICON_MAP[nodeData.entityType] || Box;
  const accent = ENTITY_ACCENT[nodeData.entityType] || ENTITY_ACCENT.class;

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
        w-[280px] rounded-xl select-none group/node
        bg-[#25262B] border transition-all duration-200
        shadow-[0_8px_24px_rgba(0,0,0,0.5)]
        ${
          selected
            ? "border-white/30 shadow-[0_0_0_1.5px_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.6)]"
            : nodeData.isMemoryCrashing
            ? "border-red-500/90 shadow-[0_0_24px_rgba(239,68,68,0.7)] ring-2 ring-red-500/80 animate-pulse"
            : nodeData.isPulsing
            ? "border-amber-400/90 shadow-[0_0_24px_rgba(245,158,11,0.7)] ring-2 ring-amber-400/80"
            : nodeData.isVTableTarget
            ? "border-blue-400/80 shadow-[0_0_20px_rgba(59,130,246,0.5)] ring-1 ring-blue-400/60"
            : isTargetForStep
            ? "border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-1 ring-purple-500/40"
            : nodeData.isFlashing
            ? "border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            : "border-white/[0.08] hover:border-white/[0.16]"
        }
      `}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-white/[0.015]">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${nodeData.isPulsing ? "animate-ping" : ""}`}
            style={{ backgroundColor: nodeData.isPulsing ? "#F59E0B" : accent.dot }}
          />
          <div className={`shrink-0 ${nodeData.isPulsing ? "text-amber-400" : accent.icon}`}>
            <Icon size={13} strokeWidth={2} />
          </div>
          <span className="font-mono font-bold text-[11.5px] text-gray-100 truncate">
            {nodeData.name.replace(/\.cs$/, "")}
          </span>
          {nodeData.isPulsing && (
            <span className="font-mono text-[7px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase shrink-0 animate-pulse">
              ⚡ EXEC
            </span>
          )}
          {nodeData.isVTableTarget && (
            <span className="font-mono text-[7px] font-bold px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase shrink-0">
              VTable
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {nodeData.implementsInterface && (
            <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
              :{nodeData.implementsInterface}
            </span>
          )}
          {nodeData.entityType === "interface" && (
            <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
              interface
            </span>
          )}
          <button
            onClick={handleClose}
            title={t("architecture.deleteNode", "Видалити")}
            className="p-0.5 rounded text-gray-500 hover:text-gray-200 hover:bg-white/10 transition-colors cursor-pointer opacity-0 group-hover/node:opacity-100"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Ports Body (Sockets on Left, Plugs on Right) ── */}
      <div className="p-3 grid grid-cols-2 gap-3">
        {/* Left: Inputs (DI Slots) */}
        <div className="space-y-1.5">
          <div className="text-[8px] font-mono font-medium text-gray-400 uppercase tracking-wider">
            {t("architecture.inputsDI", "Входи (DI)")}
          </div>
          {hasInputs ? (
            nodeData.inputs.map((inp) => {
              const isPortTarget =
                isTvController &&
                inp.id === "in-command-handler" &&
                ((mentorPhase === "GUIDED" && (guidedStep === 1 || guidedStep === 3)) ||
                  (mentorPhase === "PRACTICE" && isHintActive));

              // Format clean port name: "ctor(IRemoteCommand command)" -> "ctor(command)"
              const cleanName = inp.name.replace(/ctor\(.*?\s+(\w+)\)/, "ctor($1)");

              return (
                <div key={inp.id} className="relative flex items-start py-0.5 group">
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={inp.id}
                    className={`!w-3 !h-3 !rounded-xs !-left-[18px] !border-2 !border-[#25262B] shadow-inner transition-all group-hover:scale-125 cursor-crosshair ${
                      isPortTarget
                        ? "!ring-3 !ring-purple-400 !shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-pulse !scale-125 z-10"
                        : "hover:border-purple-300"
                    }`}
                    style={{ backgroundColor: inp.color || "#3B82F6" }}
                  />
                  <div className="min-w-0 pl-1">
                    <span
                      className={`font-mono text-[9.5px] block leading-tight truncate ${
                        isPortTarget ? "text-purple-300 font-bold" : "text-gray-200"
                      }`}
                    >
                      {cleanName}
                    </span>
                    <span className="font-mono text-[7.5px] text-gray-400 block truncate">
                      {inp.portType}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <span className="text-[8px] font-mono text-gray-600 italic block">
              {t("architecture.noInputs", "Немає входів")}
            </span>
          )}
        </div>

        {/* Right: Outputs (Command Plugs) */}
        <div className="space-y-1.5 text-right">
          <div className="text-[8px] font-mono font-medium text-gray-400 uppercase tracking-wider text-right">
            {t("architecture.methodsOutputs", "Виходи")}
          </div>
          {hasOutputs ? (
            nodeData.outputs.map((out) => {
              const isPortTarget =
                isPowerCommand &&
                out.id === "out-execute" &&
                ((mentorPhase === "GUIDED" && guidedStep === 3) ||
                  (mentorPhase === "PRACTICE" && isHintActive));

              // Format clean port name: "IRemoteCommand.Execute()" -> "Execute()"
              const cleanName = out.name.replace(/^[A-Za-z0-9_]+\./, "");

              return (
                <div
                  key={out.id}
                  className="relative flex items-start justify-end py-0.5 group"
                >
                  <div className="min-w-0 pr-1 text-right">
                    <span
                      className={`font-mono text-[9.5px] block leading-tight truncate ${
                        isPortTarget ? "text-purple-300 font-bold" : "text-gray-200"
                      }`}
                    >
                      {cleanName}
                    </span>
                    <span className="font-mono text-[7.5px] text-gray-400 block truncate">
                      {out.portType === "IRemoteCommand" ? "IRemoteCommand" : out.typeAnnotation || out.portType}
                    </span>
                  </div>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={out.id}
                    className={`!w-3 !h-3 !rounded-r-md !rounded-l-xs !-right-[18px] !border-2 !border-[#25262B] shadow-md transition-all group-hover:scale-125 cursor-crosshair ${
                      isPortTarget
                        ? "!ring-3 !ring-purple-400 !shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-pulse !scale-125 z-10"
                        : "hover:border-emerald-300"
                    }`}
                    style={{ backgroundColor: out.color || "#10B981" }}
                  />
                </div>
              );
            })
          ) : (
            <span className="text-[8px] font-mono text-gray-600 italic block">
              {t("architecture.noOutputs", "Немає методів")}
            </span>
          )}
        </div>
      </div>

      {/* ── Memory Field X-Ray Slot (TVController Internal State) ── */}
      {isTvController && (
        <div className="mx-3 mb-2 px-2.5 py-1.5 rounded-md bg-[#16171A] border border-white/[0.08] font-mono text-[10px] flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-gray-500 text-[8px] uppercase font-bold tracking-wider">RAM</span>
            <span className="text-gray-400 font-medium">_cmd:</span>
            {nodeData.injectedDependency ? (
              <span className="text-emerald-400 font-semibold truncate">
                [{nodeData.injectedDependency.address}] {nodeData.injectedDependency.name}
              </span>
            ) : (
              <span
                className={`font-semibold flex items-center gap-1 ${
                  nodeData.isMemoryCrashing ? "text-red-400 animate-pulse font-black" : "text-red-400/90"
                }`}
              >
                null <span className="text-[9px]">⚠️</span>
              </span>
            )}
          </div>
          <div className="shrink-0 ml-2">
            {nodeData.injectedDependency ? (
              <span className="text-[7.5px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                ✓ Active
              </span>
            ) : (
              <span
                className={`text-[7.5px] px-1.5 py-0.5 rounded uppercase font-bold ${
                  nodeData.isMemoryCrashing
                    ? "bg-red-500/30 text-red-200 border border-red-500/60 animate-bounce shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                    : "bg-red-500/15 text-red-300 border border-red-500/30"
                }`}
              >
                NullRef
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Role description ── */}
      <div className="px-3 py-1.5 border-t border-white/[0.05] bg-white/[0.01]">
        <p className="font-mono text-[8.5px] text-gray-400 leading-snug truncate" title={nodeData.role}>
          {nodeData.role}
        </p>
      </div>
    </div>
  );
};
