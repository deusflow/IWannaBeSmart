import React from "react";

export type ProgressBarVariant = "accent" | "ok" | "signal" | "break";
export type ProgressBarSize = "sm" | "md" | "lg";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 - 100
  max?: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  showLabel?: boolean;
  label?: string;
}

const variantBarStyles: Record<ProgressBarVariant, string> = {
  accent: "bg-accent-blue",
  ok: "bg-accent-ok",
  signal: "bg-accent-signal",
  break: "bg-accent-break",
};

const sizeTrackStyles: Record<ProgressBarSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = "accent",
  size = "md",
  showLabel = false,
  label,
  className = "",
  ...props
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  return (
    <div className={`w-full space-y-1.5 ${className}`} {...props}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs">
          {label && (
            <span className="font-medium text-ink-muted">{label}</span>
          )}
          {showLabel && (
            <span className="font-mono text-ink-subtle ml-auto">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full overflow-hidden rounded-full bg-paper-muted border border-paper-border/80 ${sizeTrackStyles[size]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${variantBarStyles[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
