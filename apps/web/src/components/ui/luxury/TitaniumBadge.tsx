/**
 * @file apps/web/src/components/ui/luxury/TitaniumBadge.tsx
 * @description Satin titanium / medium graphite capsule badge for ranks, modules, and tech tags
 */

import React from "react";

export interface TitaniumBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "titanium" | "graphite" | "gold" | "emerald" | "porcelain";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export const TitaniumBadge: React.FC<TitaniumBadgeProps> = ({
  children,
  tone = "titanium",
  size = "md",
  icon,
  className = "",
  ...props
}) => {
  const toneStyles = {
    titanium: "bg-[#252932] text-[#F8F9FA] border border-white/[0.12] shadow-2xs",
    graphite: "bg-[#161920] text-white border border-white/[0.10]",
    gold: "bg-[#FBF7EF] text-[#8C6D28] border border-[#C5A059]/30",
    emerald: "bg-emerald-50 text-emerald-800 border border-emerald-600/20",
    porcelain: "bg-[#F0F2F5] text-[#2B2F38] border border-black/[0.06]",
  }[tone];

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] font-mono",
    md: "px-2.5 py-1 text-xs font-mono",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-bold tracking-tight uppercase select-none ${toneStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

