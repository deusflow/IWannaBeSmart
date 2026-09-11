import React from "react";
import { useTranslation } from "react-i18next";
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { X, Check, AlertCircle } from "lucide-react";

export interface ArchitectureEdgeData extends Record<string, unknown> {
  isValidPowerWire?: boolean;
  isError?: boolean;
  isPulsing?: boolean;
  pulseLabel?: string;
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
  const { t } = useTranslation();
  const edgeData = (data as unknown as ArchitectureEdgeData) || {};
  const isPowerWire = !!edgeData.isValidPowerWire;
  const isError = !!edgeData.isError;
  const isPulsing = !!edgeData.isPulsing;

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

  const wireColor = isError
    ? "#EF4444"
    : isPulsing
    ? "#F59E0B"
    : isPowerWire
    ? "#22C55E"
    : "#3B82F6";

  return (
    <>
      <style>
        {`
          @keyframes flowDash {
            from { stroke-dashoffset: 24; }
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>

      {/* Invisible wider hit area for easy hover and interactions */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={24}
        className="cursor-pointer"
      />

      {/* Visible High-Contrast Blueprint Cable */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: wireColor,
          strokeWidth: isPulsing ? 3.5 : 2.5,
          filter: isPulsing
            ? "drop-shadow(0 0 12px rgba(245, 158, 11, 0.95))"
            : isPowerWire
            ? "drop-shadow(0 0 8px rgba(34, 197, 94, 0.75))"
            : isError
            ? "drop-shadow(0 0 8px rgba(239, 68, 68, 0.75))"
            : "drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))",
          transition: "stroke 0.2s ease, filter 0.2s ease, stroke-width 0.2s ease",
        }}
      />

      {/* Animated Photon / Electric Charge Pulse along the wire */}
      {(isPowerWire || isPulsing) && !isError && (
        <>
          <path
            d={edgePath}
            fill="none"
            stroke={isPulsing ? "#FBBF24" : isPowerWire ? "#4ADE80" : "#60A5FA"}
            strokeWidth={1.5}
            strokeDasharray="4 8"
            className="pointer-events-none opacity-80"
            style={{
              animation: "flowDash 1.2s linear infinite",
            }}
          />
          <circle
            r={isPulsing ? 4.5 : 3.5}
            fill={isPulsing ? "#FDE68A" : isPowerWire ? "#86EFAC" : "#93C5FD"}
            filter="drop-shadow(0 0 6px #fff)"
          >
            <animateMotion
              dur={isPulsing ? "0.8s" : "1.8s"}
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
          <circle r={2} fill="#FFFFFF">
            <animateMotion
              dur={isPulsing ? "0.8s" : "1.8s"}
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
        </>
      )}

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
            className={`group px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.6)] backdrop-blur-xs transition-all duration-150 ${
              isError
                ? "bg-red-950/90 text-red-200 border-red-500/60 hover:border-red-400"
                : isPulsing
                ? "bg-amber-950/90 text-amber-200 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse"
                : isPowerWire
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/60 hover:border-emerald-400"
                : "bg-gray-900/90 text-gray-200 border-gray-700 hover:border-gray-500"
            }`}
          >
            {isError ? (
              <>
                <div className="h-3.5 w-3.5 rounded-full bg-red-500 text-white flex items-center justify-center">
                  <AlertCircle size={10} strokeWidth={3} />
                </div>
                <span>Помилка типів</span>
              </>
            ) : isPulsing ? (
              <>
                <div className="h-3.5 w-3.5 rounded-full bg-amber-500 text-stone-900 flex items-center justify-center text-[9px] font-black">
                  ⚡
                </div>
                <span>{edgeData.pulseLabel || "Виклик функції (Call Pulse)"}</span>
              </>
            ) : isPowerWire ? (
              <>
                <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check size={10} strokeWidth={3} />
                </div>
                <span>{t("architecture.activeWire")}</span>
              </>
            ) : (
              <span>{t("architecture.connection")}</span>
            )}

            {/* Disconnect Wire button */}
            <button
              onClick={handleDelete}
              title={t("architecture.disconnect")}
              className="p-0.5 rounded-full hover:bg-white/20 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={10} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

