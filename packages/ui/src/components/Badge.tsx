import React from "react";

export type BadgeVariant = "ok" | "broken" | "signal" | "neutral" | "accent";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  mono?: boolean;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  ok: {
    container: "bg-accent-ok-light text-accent-ok border-accent-ok-border",
    dot: "bg-accent-ok",
  },
  broken: {
    container: "bg-accent-break-light text-accent-break border-accent-break-border",
    dot: "bg-accent-break",
  },
  signal: {
    container: "bg-accent-signal-light text-accent-signal hover:bg-amber-100/60 border-accent-signal-border",
    dot: "bg-accent-signal",
  },
  neutral: {
    container: "bg-paper text-ink-muted border-paper-border",
    dot: "bg-ink-subtle",
  },
  accent: {
    container: "bg-accent-blue-light text-accent-blue border-accent-blue-border",
    dot: "bg-accent-blue",
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] gap-1.5",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  pulse = false,
  mono = false,
  className = "",
  ...props
}) => {
  const currentVariant = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-sm border select-none transition-colors duration-150 ${
        mono ? "font-mono tracking-tight" : "font-sans"
      } ${currentVariant.container} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentVariant.dot}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${currentVariant.dot}`}
          />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};
