import React from "react";
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { useWorkbenchStore, type CircuitEdgeId } from "../../../store/workbenchStore";
import { AlertTriangle } from "lucide-react";

export interface CircuitEdgeData extends Record<string, unknown> {
  isBroken: boolean;
  label: string;
  signalType?: string;
}

export const CircuitEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) => {
  const toggleCircuitEdge = useWorkbenchStore((s) => s.toggleCircuitEdge);
  const edgeData = (data as unknown as CircuitEdgeData) || { isBroken: false, label: "" };
  const isBroken = !!edgeData.isBroken;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const handleEdgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCircuitEdge(id as CircuitEdgeId);
  };

  return (
    <>
      {/* Invisible wider path for effortless clicking / hit-testing */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={24}
        className="cursor-pointer"
        onClick={handleEdgeClick}
      />

      {/* Visible PCB Copper Trace */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: isBroken ? "#A82D24" : "#1A1D20",
          strokeWidth: isBroken ? 2.5 : 2,
          strokeDasharray: isBroken ? "6 4" : undefined,
          transition: "stroke 0.2s ease, stroke-width 0.2s ease",
          cursor: "pointer",
        }}
      />

      {/* Interactive Midpoint Signal Label & Break Indicator */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            onClick={handleEdgeClick}
            title={
              isBroken
                ? `Лінія «${edgeData.label}» обірвана. Натисніть, щоб відновити зв'язок.`
                : `Лінія «${edgeData.label}» справна. Натисніть, щоб змоделювати обрив.`
            }
            className={`group px-2 py-0.5 rounded-md border text-[9px] font-balsamiq font-bold flex items-center gap-1 shadow-xs transition-all duration-150 cursor-pointer ${
              isBroken
                ? "bg-[#FDF2F1] text-accent-break border-accent-break hover:bg-accent-break hover:text-white animate-pulse"
                : "bg-paper hover:bg-paper-muted text-ink-muted hover:text-ink border-paper-border hover:border-ink-muted/60"
            }`}
          >
            {isBroken ? (
              <>
                <AlertTriangle size={10} className="shrink-0 text-accent-break group-hover:text-white" />
                <span>Обрив: {edgeData.label}</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-ink-subtle group-hover:bg-accent-break" />
                <span>{edgeData.label}</span>
              </>
            )}
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
