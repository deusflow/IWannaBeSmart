/**
 * @file apps/web/src/components/workbench/WarRoomLockedModal.tsx
 * @description Modal warning for new users attempting to enter Incident War Room before completing Station 01.
 */

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ShieldAlert, ArrowRight, X } from "lucide-react";
import { audioFx } from "../../utils/audioFx";

interface WarRoomLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToStation01: () => void;
}

export const WarRoomLockedModal: React.FC<WarRoomLockedModalProps> = ({
  isOpen,
  onClose,
  onGoToStation01,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="war-room-locked-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in select-none"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F4] text-[#1A1D20] border-2 border-rose-600/40 shadow-2xl overflow-hidden font-sans animate-in zoom-in-95 duration-200">
        {/* Drafting Grid & Red Hazard Header Accent */}
        <div className="absolute inset-0 bg-notebook-grid opacity-30 pointer-events-none" />
        <div className="h-2 w-full bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600" />

        <div className="relative z-10 p-6 sm:p-8 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border-2 border-rose-600/30 text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert size={26} className="animate-pulse" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-700 border border-rose-500/30 uppercase tracking-wider">
                  <AlertTriangle size={11} className="text-rose-700" />
                  <span>{t("hub.warRoomBanner.lockedModal.badge", "СЕКТОР ПІДВИЩЕНОЇ НЕБЕЗПЕКИ • SEV-1")}</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-extrabold text-[#1A1D20] tracking-tight mt-1">
                  {t("hub.warRoomBanner.lockedModal.title", "Доступ заблоковано!")}
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                audioFx.playRelayClick();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-[#1A1D20]/5 hover:bg-[#1A1D20]/15 border border-[#1A1D20]/15 flex items-center justify-center text-[#1A1D20] transition-colors cursor-pointer shrink-0"
              title={t("common.close", "Закрити")}
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-sm font-sans text-[#1A1D20]/80 leading-relaxed bg-white/80 border border-[#1A1D20]/10 rounded-2xl p-4 shadow-2xs">
            {t(
              "hub.warRoomBanner.lockedModal.desc",
              "Доступ заблоковано! Сектор підвищеної небезпеки. Пройди Станцію 01 та отримай допуск L1: Code Apprentice, щоб ліквідовувати аварії."
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <button
              type="button"
              id="btn-war-room-modal-to-station-01"
              onClick={() => {
                audioFx.playRelayClick();
                onClose();
                onGoToStation01();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl font-mono font-bold text-xs bg-[#C86D32] hover:bg-[#B35E28] active:scale-95 text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>{t("hub.warRoomBanner.lockedModal.cta", "До Станції 01 (Розумний телевізор)")}</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => {
                audioFx.playRelayClick();
                onClose();
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-xl font-mono font-bold text-xs bg-white hover:bg-[#FAF8F4] border border-[#1A1D20]/20 text-[#1A1D20] transition-all cursor-pointer"
            >
              <span>{t("common.understand", "Зрозуміло")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
