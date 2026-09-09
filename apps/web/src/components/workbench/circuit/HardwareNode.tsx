import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Cpu,
  Zap,
  Radio,
  Tv,
  Volume2,
  Lightbulb,
  Database,
  LucideIcon,
} from "lucide-react";

export interface HardwareNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  chipModel: string;
  role: string;
  nominalVoltage: string;
  voltage: string;
  hasSignal: boolean;
  isFault?: boolean;
  nodeType:
    | "psu"
    | "mcu"
    | "ir"
    | "display"
    | "audio"
    | "led"
    | "eeprom";
}

const ICON_MAP: Record<HardwareNodeData["nodeType"], LucideIcon> = {
  psu: Zap,
  mcu: Cpu,
  ir: Radio,
  display: Tv,
  audio: Volume2,
  led: Lightbulb,
  eeprom: Database,
};

export const HardwareNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as HardwareNodeData;
  const Icon = ICON_MAP[nodeData.nodeType] || Cpu;

  const isLive = nodeData.hasSignal;
  const isFault = nodeData.isFault;

  return (
    <div
      className={`min-w-[170px] max-w-[190px] rounded-xl bg-paper border transition-all duration-200 select-none shadow-paper-sm ${
        selected
          ? "border-accent-blue ring-2 ring-accent-blue/30"
          : isFault
          ? "border-accent-break bg-accent-break-light/30"
          : isLive
          ? "border-accent-ok-border hover:border-accent-ok"
          : "border-paper-border hover:border-ink-muted/50"
      }`}
    >
      {/* Solder Handles */}
      {nodeData.nodeType !== "psu" && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !rounded-full !bg-[#4A5059] !border-2 !border-paper hover:!bg-accent-blue transition-colors"
        />
      )}

      {nodeData.nodeType !== "display" &&
        nodeData.nodeType !== "audio" &&
        nodeData.nodeType !== "led" && (
          <Handle
            type="source"
            position={Position.Right}
            className="!w-2.5 !h-2.5 !rounded-full !bg-[#4A5059] !border-2 !border-paper hover:!bg-accent-blue transition-colors"
          />
        )}

      {/* Internal Content */}
      <div className="p-2.5 space-y-1.5">
        {/* Header: Icon + Chip Name + Chip Model */}
        <div className="flex items-center justify-between gap-1.5 border-b border-paper-border/70 pb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 border ${
                isFault
                  ? "bg-accent-break/10 border-accent-break/40 text-accent-break"
                  : isLive
                  ? "bg-accent-ok/10 border-accent-ok/40 text-accent-ok"
                  : "bg-paper-muted border-paper-border text-ink-muted"
              }`}
            >
              <Icon size={13} strokeWidth={2} />
            </div>
            <span className="font-display font-bold text-xs text-ink truncate tracking-tight">
              {nodeData.name}
            </span>
          </div>

          <span className="font-mono text-[9px] px-1 py-0.5 rounded bg-paper-muted border border-paper-border text-ink-subtle shrink-0">
            {nodeData.chipModel}
          </span>
        </div>

        {/* Ukrainian Role description */}
        <p className="font-balsamiq text-[10px] text-ink-muted leading-tight line-clamp-2">
          {nodeData.role}
        </p>

        {/* Live Voltage / State Pill */}
        <div className="flex items-center justify-between pt-0.5 text-[10px]">
          <span className="font-mono text-ink-subtle text-[9px]">
            {nodeData.voltage}
          </span>

          <div className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isFault
                  ? "bg-accent-break animate-pulse"
                  : isLive
                  ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
                  : "bg-gray-400"
              }`}
            />
            <span
              className={`font-balsamiq font-bold text-[9px] ${
                isFault
                  ? "text-accent-break"
                  : isLive
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-ink-subtle"
              }`}
            >
              {isFault ? "Обрив" : isLive ? "Активний" : "Черговий"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
