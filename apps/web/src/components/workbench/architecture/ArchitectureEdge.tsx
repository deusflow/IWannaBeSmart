import React from "react";
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { X, Check } from "lucide-react";

export interface ArchitectureEdgeData extends Record<string, unknown> {
  isValidPowerWire?: boolean;
  onDelete?: (edgeId: string) => void;
}

export const ArchitectureEdge: React.FC<EdgeProps> = ({
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
  const edgeData = (data as unknown as ArchitectureEdgeData) || {};
  const isPowerWire = !!edgeData.isValidPowerWire;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.35,
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (edgeData.onDelete) {
      edgeData.onDelete(id);
    }
  };

  return (
    <>
      {/* Invisible wider hit area for easy hover and interactions */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={24}
        className="cursor-pointer"
      />

      {/* Visible Blueprint Cable */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: isPowerWire ? "#10B981" : "#2563EB",
          strokeWidth: isPowerWire ? 3.5 : 2.5,
          filter: isPowerWire
            ? "drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))"
            : undefined,
          transition: "stroke 0.2s ease, stroke-width 0.2s ease",
        }}
      />

      {/* Midpoint Label & Disconnect Button */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <div
            className={`group px-2 py-0.5 rounded-full border text-[9.5px] font-balsamiq font-bold flex items-center gap-1.5 shadow-paper-sm transition-all duration-150 ${
              isPowerWire
                ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 hover:border-emerald-600"
                : "bg-paper text-ink-muted border-paper-border hover:border-ink-muted"
            }`}
          >
            {isPowerWire ? (
              <>
                <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check size={10} strokeWidth={3} />
                </div>
                <span>Активний зв&apos;язок</span>
              </>
            ) : (
              <span>З&apos;єднання</span>
            )}

            {/* Disconnect Wire button */}
            <button
              onClick={handleDelete}
              title="Від'єднати провід"
              className="p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-950/80 text-ink-subtle hover:text-red-600 transition-colors cursor-pointer"
            >
              <X size={10} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
