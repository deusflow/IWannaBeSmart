import React from "react";
import { useTranslation } from "react-i18next";
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { X, AlertCircle } from "lucide-react";

export interface ArchitectureEdgeData extends Record<string, unknown> {
  isValidPowerWire?: boolean;
  isError?: boolean;
  isPulsing?: boolean;
  pulseLabel?: string;
  commandName?: string;
  diMode?: "WITH_DI" | "WITHOUT_DI";
  onDelete?: (edgeId: string) => void;
  onInspectDi?: () => void;
  isJourneyActive?: boolean;
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
  const isWithoutDi = edgeData.diMode === "WITHOUT_DI";
  const isJourneyActive = !!edgeData.isJourneyActive;

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
    : isWithoutDi
    ? "#EF4444"
    : isPulsing
    ? "#F59E0B"
    : isJourneyActive
    ? "#C084FC"
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
        strokeWidth={28}
        className="cursor-pointer"
      />

      {/* Visible High-Contrast Blueprint Cable */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: wireColor,
          strokeWidth: isPulsing ? 3.5 : isWithoutDi ? 2.5 : 2.2,
          strokeDasharray: isWithoutDi ? "5 4" : undefined,
          filter: isPulsing
            ? "drop-shadow(0 0 10px rgba(245, 158, 11, 0.9))"
            : isWithoutDi
            ? "drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))"
            : isJourneyActive
            ? "drop-shadow(0 0 10px rgba(168, 85, 247, 0.85))"
            : isPowerWire
            ? "drop-shadow(0 0 6px rgba(34, 197, 94, 0.6))"
            : isError
            ? "drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))"
            : "drop-shadow(0 0 5px rgba(59, 130, 246, 0.4))",
          transition: "stroke 0.2s ease, filter 0.2s ease, stroke-width 0.2s ease",
        }}
      />

      {/* Animated Photon / Electric Charge Pulse along the wire */}
      {(isPowerWire || isPulsing || isJourneyActive) && !isError && !isWithoutDi && (
        <>
          <path
            d={edgePath}
            fill="none"
            stroke={isPulsing ? "#FBBF24" : isJourneyActive ? "#D8B4FE" : isPowerWire ? "#4ADE80" : "#60A5FA"}
            strokeWidth={1.5}
            strokeDasharray="4 8"
            className="pointer-events-none opacity-80"
            style={{
              animation: "flowDash 1.2s linear infinite",
            }}
          />
          <circle
            r={isPulsing ? 4.5 : 3.5}
            fill={isPulsing ? "#FDE68A" : isJourneyActive ? "#F3E8FF" : isPowerWire ? "#86EFAC" : "#93C5FD"}
            filter="drop-shadow(0 0 4px #fff)"
          >
            <animateMotion
              dur={isPulsing ? "0.8s" : isJourneyActive ? "1.4s" : "1.8s"}
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
        </>
      )}

      {/* Compact Midpoint Indicator & Disconnect Button */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {isPulsing ? (
            <div className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 font-mono font-bold text-[10px] flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse">
              <span>⚡</span>
              <span>{edgeData.pulseLabel || "Execute()"}</span>
            </div>
          ) : isWithoutDi ? (
            <div className="px-2.5 py-1 rounded-full bg-red-950/90 text-red-200 border border-red-500/60 font-mono text-[10px] font-semibold flex items-center gap-1.5 shadow-sm">
              <span className="text-red-400 font-bold">✕</span>
              <span>new PowerCommand()</span>
              <button
                onClick={handleDelete}
                title={t("architecture.disconnect", "Від'єднати")}
                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-500/30 text-gray-400 hover:text-white transition-colors cursor-pointer ml-1"
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            </div>
          ) : isError ? (
            <div className="px-2.5 py-1 rounded-full bg-red-950/90 text-red-200 border border-red-500/60 font-mono text-[10px] font-semibold flex items-center gap-1.5">
              <AlertCircle size={11} className="text-red-400" />
              <span>{t("architecture.typeError", "Помилка типів")}</span>
            </div>
          ) : (
            <div
              onClick={(e) => {
                e.stopPropagation();
                edgeData.onInspectDi?.();
              }}
              title={t("journey.inspectDi", "Дослідити шлях впровадження DI")}
              className={`px-2.5 py-1 rounded-full bg-[#16171B]/95 border text-mono text-[10px] flex items-center gap-2 transition-all duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.6)] cursor-pointer ${
                isJourneyActive
                  ? "border-purple-400 text-purple-300 ring-2 ring-purple-400/50 shadow-[0_0_14px_rgba(168,85,247,0.5)]"
                  : "border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:ring-1 hover:ring-emerald-400/40"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isJourneyActive ? "bg-purple-400 animate-pulse" : "bg-emerald-400"}`} />
              <span className="font-semibold">{edgeData.commandName || "DI"}</span>
              <span className="text-[8px] text-purple-400/90 font-mono">🔍</span>
              <button
                onClick={handleDelete}
                title={t("architecture.disconnect", "Від'єднати")}
                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={9} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
