/**
 * @file apps/web/src/components/ui/luxury/PorcelainCard.tsx
 * @description Pure Porcelain luxury surface container with crisp hairline border and ambient elevation
 */

import React from "react";

export interface PorcelainCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "flat" | "elevated" | "glass" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

export const PorcelainCard: React.FC<PorcelainCardProps> = ({
  children,
  variant = "elevated",
  padding = "md",
  className = "",
  ...props
}) => {
  const variantStyles = {
    flat: "bg-white border border-black/[0.06]",
    elevated: "bg-white border border-black/[0.06] shadow-porcelain hover:shadow-luxury transition-shadow duration-300",
    glass: "porcelain-glass shadow-porcelain",
    interactive: "bg-white border border-black/[0.06] shadow-porcelain hover:border-black/[0.12] hover:shadow-luxury transition-all duration-200 cursor-pointer active:scale-[0.99]",
  }[variant];

  const paddingStyles = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  }[padding];

  return (
    <div
      className={`rounded-2xl relative overflow-hidden ${variantStyles} ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

