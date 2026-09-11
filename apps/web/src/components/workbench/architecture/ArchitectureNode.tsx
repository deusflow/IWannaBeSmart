import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import type { ArchitectureNodeData, EntityType } from "./types";
import { FileCode, Box, Cpu, Zap, X, LucideIcon } from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";

// ── Entity accent colors (dot + icon) ──
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
        w-[290px] rounded-xl select-none group/node
        bg-[#23252A] border transition-all duration-200
        shadow-[0_8px_28px_rgba(0,0,0,0.55)]
        ${
          selected
            ? "border-white/40 shadow-[0_0_0_1.5px_rgba(255,255,255,0.25),0_8px_28px_rgba(0,0,0,0.6)]"
            : nodeData.isMemoryCrashing
            ? "border-red-500/90 shadow-[0_0_24px_rgba(239,68,68,0.7)] ring-2 ring-red-500/80 animate-pulse"
            : nodeData.isPulsing
            ? "border-amber-400/90 shadow-[0_0_24px_rgba(245,158,11,0.7)] ring-2 ring-amber-400/80"
            : nodeData.isVTableTarget
            ? "border-blue-400/80 shadow-[0_0_20px_rgba(59,130,246,0.5)] ring-1 ring-blue-400/60"
            : isTargetForStep
            ? "border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.4)] ring-2 ring-purple-500/50"
            : nodeData.isFlashing
            ? "border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.45)]"
            : "border-white/[0.09] hover:border-white/[0.18]"
        }
      `}
    >
      {/* ── Header: Class name + Interface Contract chip + Close [x] ── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${nodeData.isPulsing ? "animate-ping" : ""}`}
            style={{ backgroundColor: nodeData.isPulsing ? "#F59E0B" : accent.dot }}
          />
          <div className={`shrink-0 ${nodeData.isPulsing ? "text-amber-400" : accent.icon}`}>
            <Icon size={14} strokeWidth={2} />
          </div>
          <span className="font-mono font-bold text-[12px] text-gray-100 truncate tracking-tight">
            {nodeData.name.replace(/\.cs$/, "")}
          </span>
          {nodeData.isPulsing && (
            <span className="font-mono text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase shrink-0 animate-pulse">
              ⚡ EXEC
            </span>
          )}
          {nodeData.isVTableTarget && (
            <span className="font-mono text-[8px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase shrink-0">
              VTable
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {nodeData.implementsInterface && (
            <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
              :{nodeData.implementsInterface}
            </span>
          )}
          {nodeData.entityType === "interface" && (
            <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
              interface
            </span>
          )}
          <button
            onClick={handleClose}
            title={t("architecture.deleteNode", "Видалити")}
            className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:text-gray-200 hover:bg-white/10 transition-colors cursor-pointer opacity-0 group-hover/node:opacity-100"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Ports Body (Sockets on Left, Plugs on Right) ── */}
      <div className="p-3 grid grid-cols-2 gap-3">
        {/* Left: Inputs (DI Slots) */}
        <div className="space-y-2">
          <div className="text-[9px] font-mono font-medium text-stone-400 uppercase tracking-wider">
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
                <div key={inp.id} className="relative flex items-center py-1 group">
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={inp.id}
                    className={`!w-3.5 !h-3.5 !rounded-xs !-left-[19px] !border-2 !border-[#23252A] shadow-inner transition-all group-hover:scale-125 cursor-crosshair ${
                      isPortTarget
                        ? "!ring-3 !ring-purple-400 !shadow-[0_0_14px_rgba(168,85,247,0.9)] animate-pulse !scale-125 z-10"
                        : "hover:border-purple-300"
                    }`}
                    style={{ backgroundColor: inp.color || "#3B82F6" }}
                  />
                  <div className="min-w-0 pl-1">
                    <span
                      className={`font-mono text-[10.5px] block leading-tight truncate ${
                        isPortTarget ? "text-purple-300 font-bold" : "text-gray-200"
                      }`}
                    >
                      {cleanName}
                    </span>
                    <span className="font-mono text-[9px] text-stone-400 block truncate mt-0.5">
                      {inp.portType}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <span className="text-[9.5px] font-mono text-stone-500 italic block py-1">
              {t("architecture.noInputs", "Немає входів")}
            </span>
          )}
        </div>

        {/* Right: Outputs (Command Plugs) */}
        <div className="space-y-2 text-right">
          <div className="text-[9px] font-mono font-medium text-stone-400 uppercase tracking-wider text-right">
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
                  className="relative flex items-center justify-end py-1 group"
                >
                  <div className="min-w-0 pr-1 text-right">
                    <span
                      className={`font-mono text-[10.5px] block leading-tight truncate ${
                        isPortTarget ? "text-purple-300 font-bold" : "text-gray-200"
                      }`}
                    >
                      {cleanName}
                    </span>
                    <span className="font-mono text-[9px] text-stone-400 block truncate mt-0.5">
                      {out.portType === "IRemoteCommand" ? "IRemoteCommand" : out.typeAnnotation || out.portType}
                    </span>
                  </div>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={out.id}
                    className={`!w-3.5 !h-3.5 !rounded-r-md !rounded-l-xs !-right-[19px] !border-2 !border-[#23252A] shadow-md transition-all group-hover:scale-125 cursor-crosshair ${
                      isPortTarget
                        ? "!ring-3 !ring-purple-400 !shadow-[0_0_14px_rgba(168,85,247,0.9)] animate-pulse !scale-125 z-10"
                        : "hover:border-emerald-300"
                    }`}
                    style={{ backgroundColor: out.color || "#10B981" }}
                  />
                </div>
              );
            })
          ) : (
            <span className="text-[9.5px] font-mono text-stone-500 italic block py-1">
              {t("architecture.noOutputs", "Немає методів")}
            </span>
          )}
        </div>
      </div>

      {/* ── Memory Field X-Ray Slot (TVController Internal State) ── */}
      {isTvController && (
        <div className="mx-3 mb-2.5 px-2.5 py-1.5 rounded-lg bg-[#15161A] border border-white/[0.08] font-mono text-[10.5px] flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-stone-400 text-[8.5px] uppercase font-bold tracking-wider">RAM</span>
            <span className="text-gray-300 font-semibold">_cmd:</span>
            {nodeData.injectedDependency ? (
              <span className="text-emerald-400 font-semibold truncate">
                [{nodeData.injectedDependency.address}] {nodeData.injectedDependency.name}
              </span>
            ) : (
              <span
                className={`font-semibold flex items-center gap-1 ${
                  nodeData.isMemoryCrashing ? "text-red-400 animate-pulse font-black" : "text-red-400"
                }`}
              >
                null <span className="text-[10px]">⚠️</span>
              </span>
            )}
          </div>
          <div className="shrink-0 ml-2">
            {nodeData.injectedDependency ? (
              <span className="text-[8.5px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 font-bold uppercase">
                ✓ Active
              </span>
            ) : (
              <span
                className={`text-[8.5px] px-2 py-0.5 rounded uppercase font-bold ${
                  nodeData.isMemoryCrashing
                    ? "bg-red-500/30 text-red-200 border border-red-500/60 animate-bounce shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                    : "bg-red-500/20 text-red-300 border border-red-500/35"
                }`}
              >
                NullRef
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Role description (Footer) ── */}
      <div className="px-3 py-2 border-t border-white/[0.05] bg-white/[0.01] rounded-b-xl">
        <p className="font-mono text-[9.5px] text-stone-400 leading-snug truncate" title={nodeData.role}>
          {nodeData.role}
        </p>
      </div>
    </div>
  );
};
