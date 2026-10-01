/**
 * @file apps/web/src/components/workbench/express/guided/SpotlightOverlay.tsx
 * @description Dynamic Spotlight Overlay with SVG cutout, ResizeObserver,
 * floating Mentor Speech Bubble, and bottom-sheet fallback on mobile.
 * Guarantees atomic focus: dims everything outside the active target.
 */

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SpotlightOverlayProps {
  targetId: string;
  badgeText: string;
  mentorText: string;
  subText?: string;
  actionSlot?: React.ReactNode;
  failureCount?: number;
  onShowSolution?: () => void;
  onClose?: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({
  targetId,
  badgeText,
  mentorText,
  subText,
  actionSlot,
  failureCount = 0,
  onShowSolution,
  onClose,
}) => {
  const { t } = useTranslation();
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Measure target element position
  useEffect(() => {
    const updatePosition = () => {
      const el = document.getElementById(targetId);
      if (!el) {
        setRect(null);
        return;
      }
      const b = el.getBoundingClientRect();
      setRect({
        top: b.top,
        left: b.left,
        width: b.width,
        height: b.height,
      });
      setIsMobile(window.innerWidth < 640);
    };

    updatePosition();

    // Listen to resize and scroll
    window.addEventListener("resize", updatePosition, { passive: true });
    window.addEventListener("scroll", updatePosition, { passive: true, capture: true });

    const el = document.getElementById(targetId);
    let ro: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updatePosition());
      ro.observe(el);
    }

    // Polling retry for initial dynamic render
    const frameId = requestAnimationFrame(updatePosition);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      if (ro && el) ro.unobserve(el);
    };
  }, [targetId]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Compute position for floating mentor card
  const padding = 8;
  const targetTop = rect ? rect.top - padding : 0;
  const targetLeft = rect ? rect.left - padding : 0;
  const targetWidth = rect ? rect.width + padding * 2 : 0;
  const targetHeight = rect ? rect.height + padding * 2 : 0;

  // Determine if mentor bubble should be placed below or above
  const spaceBelow = rect ? window.innerHeight - (rect.top + rect.height) : 0;
  const placeAbove = spaceBelow < 200 && rect ? rect.top > 200 : false;

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none transition-all duration-300"
      aria-live="polite"
    >
      {/* Dimmed backdrop with cutout for target */}
      {rect ? (
        <div
          className="absolute rounded-2xl pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: `${Math.max(0, targetTop)}px`,
            left: `${Math.max(0, targetLeft)}px`,
            width: `${targetWidth}px`,
            height: `${targetHeight}px`,
            boxShadow: "0 0 0 9999px rgba(10, 15, 29, 0.82), 0 0 25px rgba(200, 109, 50, 0.35)",
            border: "2px solid rgba(200, 109, 50, 0.7)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#0A0F1D]/80 pointer-events-auto" />
      )}

      {/* Floating Mentor Speech Card */}
      {isMobile ? (
        // Mobile bottom sheet
        <aside
          ref={cardRef}
          aria-label="Mentor guidance"
          className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md rounded-t-3xl border-t-2 border-[#C86D32] shadow-2xl pointer-events-auto z-50 space-y-3 animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#C86D32]/15 text-[#C86D32] uppercase">
              {badgeText}
            </span>
            {failureCount >= 2 && onShowSolution && (
              <button
                type="button"
                onClick={onShowSolution}
                className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 hover:text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-300"
              >
                <HelpCircle size={12} />
                <span>{t("taster.showSolutionBtn", "Показати, як треба")}</span>
              </button>
            )}
          </div>

          <p className="text-sm font-sans font-medium text-[#1E2227] leading-relaxed">
            {mentorText}
          </p>

          {subText && (
            <p className="text-xs font-sans text-[#1E2227]/70">
              {subText}
            </p>
          )}

          {actionSlot && <div className="pt-1">{actionSlot}</div>}
        </aside>
      ) : (
        // Desktop floating card
        rect && (
          <aside
            ref={cardRef}
            aria-label="Mentor guidance"
            className="absolute pointer-events-auto z-50 w-[360px] sm:w-[420px] p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#C86D32]/40 shadow-2xl space-y-3 transition-all duration-200"
            style={{
              top: placeAbove
                ? `${Math.max(16, targetTop - 190)}px`
                : `${Math.min(window.innerHeight - 200, targetTop + targetHeight + 14)}px`,
              left: `${Math.min(
                window.innerWidth - 440,
                Math.max(16, targetLeft + targetWidth / 2 - 210)
              )}px`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#C86D32]" />
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#C86D32]/15 text-[#C86D32] uppercase">
                  {badgeText}
                </span>
              </div>

              {failureCount >= 2 && onShowSolution && (
                <button
                  type="button"
                  onClick={onShowSolution}
                  className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 transition-all cursor-pointer"
                >
                  <HelpCircle size={12} />
                  <span>{t("taster.showSolutionBtn", "Показати, як треба")}</span>
                </button>
              )}
            </div>

            <p className="text-sm font-sans font-medium text-[#1E2227] leading-relaxed">
              {mentorText}
            </p>

            {subText && (
              <p className="text-xs font-sans text-[#1E2227]/70">
                {subText}
              </p>
            )}

            {actionSlot && <div className="pt-2">{actionSlot}</div>}
          </aside>
        )
      )}
    </div>
  );
};
