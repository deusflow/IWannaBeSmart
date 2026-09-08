import React from "react";

export type CardElevation = "flat" | "paper" | "elevated";
export type CardGrid = "none" | "default" | "dense";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  elevation?: CardElevation;
  grid?: CardGrid;
  padding?: CardPadding;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
}

const elevationStyles: Record<CardElevation, string> = {
  flat: "border border-paper-border bg-paper-subtle shadow-none",
  paper: "border border-paper-border bg-paper-subtle shadow-paper",
  elevated: "border border-paper-border bg-paper-subtle shadow-paper-lg",
};

const gridStyles: Record<CardGrid, string> = {
  none: "",
  default: "bg-notebook-grid",
  dense: "bg-notebook-grid-dense",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      elevation = "paper",
      grid = "none",
      padding = "md",
      title,
      subtitle,
      headerAction,
      className = "",
      ...props
    },
    ref
  ) => {
    const hasHeader = Boolean(title || subtitle || headerAction);

    return (
      <div
        ref={ref}
        className={`rounded-lg transition-all duration-150 relative overflow-hidden ${elevationStyles[elevation]} ${gridStyles[grid]} ${className}`}
        {...props}
      >
        {hasHeader && (
          <div className="flex items-center justify-between border-b border-paper-border px-5 py-3.5 bg-paper-subtle/90 backdrop-blur-xs">
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-ink tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>
              )}
            </div>
            {headerAction && (
              <div className="flex items-center gap-2">{headerAction}</div>
            )}
          </div>
        )}
        <div className={paddingStyles[padding]}>{children}</div>
      </div>
    );
  }
);

Card.displayName = "Card";
