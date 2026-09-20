/**
 * @file apps/web/src/components/ui/ToastContainer.tsx
 * @description Sleek, modern 2026 glassmorphic toast notification container
 */

import React from "react";
import { useToastStore, type ToastType } from "../../store/toastStore";
import { CheckCircle2, Info, AlertTriangle, AlertOctagon, X } from "lucide-react";

function getToastIcon(type: ToastType) {
  switch (type) {
    case "success":
      return <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />;
    case "info":
      return <Info size={16} className="text-sky-400 shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />;
    case "warning":
      return <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />;
    case "error":
      return <AlertOctagon size={16} className="text-rose-400 shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />;
  }
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full sm:w-auto"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-[#14161B]/95 backdrop-blur-xl border border-white/12 shadow-[0_12px_32px_rgba(0,0,0,0.45)] transition-all duration-200 hover:border-white/25 active:scale-[0.99] text-left"
          role="status"
        >
          {getToastIcon(item.type)}
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="font-display font-bold text-xs text-white tracking-wide leading-tight">
              {item.title}
            </h4>
            {item.description && (
              <p className="font-sans text-[11px] text-gray-300/80 mt-0.5 leading-snug break-words">
                {item.description}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(item.id)}
            className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};
