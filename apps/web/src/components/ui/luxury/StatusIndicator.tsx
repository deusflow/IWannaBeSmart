/**
 * @file apps/web/src/components/ui/luxury/StatusIndicator.tsx
 * @description Subtle luxury status pill for daily streaks, operational uptime, and system resilience
 */

import React from "react";

export interface StatusIndicatorProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  subValue?: React.ReactNode;
  statusColor?: "emerald" | "gold" | "rose" | "titanium";
  title?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  label,
  value,
  icon,
  subValue,
  statusColor = "titanium",
  title,
}) => {
  const dotColor = {
    emerald: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    gold: "bg-[#C5A059] shadow-[0_0_8px_rgba(197,160,89,0.5)]",
    rose: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
    titanium: "bg-slate-400",
  }[statusColor];

  return (
    <div
      title={title}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-black/[0.06] shadow-paper-sm text-ink select-none transition-all hover:border-black/[0.12]"
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
      {icon && <span className="text-ink-muted shrink-0">{icon}</span>}
      <div className="flex items-center gap-1.5 text-xs font-mono">
        <span className="text-ink-muted text-[11px] uppercase font-semibold">{label}</span>
        <span className="font-extrabold text-[#0F141C]">{value}</span>
        {subValue && <span className="text-[10px] text-ink-muted">{subValue}</span>}
      </div>
    </div>
  );
};

