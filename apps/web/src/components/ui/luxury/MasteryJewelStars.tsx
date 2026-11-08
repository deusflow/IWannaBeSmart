/**
 * @file apps/web/src/components/ui/luxury/MasteryJewelStars.tsx
 * @description Jewelry-grade mastery indicators using champagne gold / platinum sheen
 */

import React from "react";
import { Star } from "lucide-react";

export interface MasteryJewelStarsProps {
  currentStars: number;
  maxStars?: number;
  size?: number;
  showCount?: boolean;
  className?: string;
}

export const MasteryJewelStars: React.FC<MasteryJewelStarsProps> = ({
  currentStars,
  maxStars = 4,
  size = 14,
  showCount = false,
  className = "",
}) => {
  return (
    <div className={`inline-flex items-center gap-1 select-none ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const starNumber = idx + 1;
          const isFilled = currentStars >= starNumber;
          const isTransferStar = starNumber === 4;

          return (
            <span key={idx} className="relative inline-flex items-center justify-center">
              <Star
                size={size}
                className={`transition-all duration-300 ${
                  isFilled
                    ? isTransferStar
                      ? "text-cyan-500 fill-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]"
                      : "text-[#C5A059] fill-[#C5A059] drop-shadow-[0_0_6px_rgba(197,160,89,0.5)]"
                    : "text-slate-200 fill-transparent"
                }`}
              />
            </span>
          );
        })}
      </div>
      {showCount && (
        <span className="font-mono text-xs font-bold text-ink-muted ml-1">
          {currentStars}/{maxStars}
        </span>
      )}
    </div>
  );
};

