/**
 * @file apps/web/src/components/common/FeatureNudge.tsx
 * @description Lightweight Feature Discovery Nudge component with an animate-pulse beacon
 * and localStorage persistence for guided progressive onboarding.
 */

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { audioFx } from "../../utils/audioFx";

export interface FeatureNudgeProps {
  storageKey: string;
  badge?: string;
  text: string;
  dismissText?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "inline";
  pulseColor?: "rose" | "amber" | "blue" | "emerald";
  className?: string;
  onDismiss?: () => void;
}

export const FeatureNudge: React.FC<FeatureNudgeProps> = ({
  storageKey,
  badge = "FEATURE DISCOVERY",
  text,
  dismissText = "Зрозуміло",
  position = "bottom-right",
  pulseColor = "rose",
  className = "",
  onDismiss,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== "true") {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, [storageKey]);

  if (isDismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioFx.playRelayClick();
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // Ignore storage errors in sandbox
    }
    setIsDismissed(true);
    onDismiss?.();
  };

  const colorStyles = {
    rose: {
      ping: "bg-rose-400",
      dot: "bg-rose-600",
      badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
      boxBorder: "border-rose-400/80 shadow-rose-900/10",
      btnBg: "bg-rose-600 hover:bg-rose-700 text-white",
    },
    amber: {
      ping: "bg-amber-400",
      dot: "bg-amber-600",
      badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
      boxBorder: "border-amber-400/80 shadow-amber-900/10",
      btnBg: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    blue: {
      ping: "bg-blue-400",
      dot: "bg-blue-600",
      badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
      boxBorder: "border-blue-400/80 shadow-blue-900/10",
      btnBg: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    emerald: {
      ping: "bg-emerald-400",
      dot: "bg-emerald-600",
      badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      boxBorder: "border-emerald-400/80 shadow-emerald-900/10",
      btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  }[pulseColor];

  const positionClasses = {
    "bottom-right": "absolute right-0 top-full mt-2.5 z-50 w-72 sm:w-80",
    "bottom-left": "absolute left-0 top-full mt-2.5 z-50 w-72 sm:w-80",
    "top-right": "absolute right-0 bottom-full mb-2.5 z-50 w-72 sm:w-80",
    inline: "relative z-20 w-full",
  }[position];

  return (
    <div
      role="tooltip"
      className={`${positionClasses} ${className} animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto`}
    >
      <div
        className={`p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border-2 ${colorStyles.boxBorder} shadow-xl flex flex-col gap-2.5 text-left`}
      >
        {/* Pointer Triangle for dropdowns */}
        {position === "bottom-right" && (
          <div className="absolute -top-2 right-6 w-3.5 h-3.5 bg-white border-t-2 border-l-2 border-inherit rotate-45" />
        )}
        {position === "bottom-left" && (
          <div className="absolute -top-2 left-6 w-3.5 h-3.5 bg-white border-t-2 border-l-2 border-inherit rotate-45" />
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorStyles.ping} opacity-75`}
              />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${colorStyles.dot}`} />
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${colorStyles.badgeBg}`}
            >
              {badge}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-[#1E2227]/10 text-[#1E2227]/60 hover:text-[#1E2227] transition-colors cursor-pointer"
            title="Закрити підказку"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body Text */}
        <p className="text-xs font-display font-semibold text-[#1E2227] leading-relaxed">
          {text}
        </p>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${colorStyles.btnBg}`}
          >
            {dismissText}
          </button>
        </div>
      </div>
    </div>
  );
};
