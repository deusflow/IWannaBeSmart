/**
 * @file apps/web/src/components/workbench/AudioVolumeWidget.tsx
 * @description 2026 Interactive Web Audio Synthesizer Master Volume Controller
 * Supports fine-grained slider, instant mute/unmute, quick presets (25%, 50%, 75%, 100%), and tactile preview.
 */

import React, { useState, useEffect, useRef } from "react";
import { audioFx } from "../../utils/audioFx";
import { Volume2, Volume1, VolumeX, Sliders } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "../../store/toastStore";

export const AudioVolumeWidget: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(audioFx.isMuted());
  const [volume, setVolumeState] = useState(Math.round(audioFx.getVolume() * 100));
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggleMute = () => {
    const nextMuted = audioFx.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      audioFx.playRelayClick();
      toast.info(t("audio.unmutedToast", "Звук увімкнено"), `${volume}%`);
    } else {
      toast.info(t("audio.mutedToast", "Звук вимкнено"));
    }
  };

  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(100, newVol));
    setVolumeState(clamped);
    audioFx.setVolume(clamped / 100);
    if (isMuted && clamped > 0) {
      audioFx.setMuted(false);
      setIsMuted(false);
    }
    audioFx.playKeyClick();
  };

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX size={15} className="text-accent-break shrink-0" />;
    }
    if (volume < 50) {
      return <Volume1 size={15} className="text-accent-blue shrink-0" />;
    }
    return <Volume2 size={15} className="text-accent-blue shrink-0" />;
  };

  return (
    <div className="relative inline-block shrink-0" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => {
          audioFx.playRelayClick();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 shrink-0 ${
          isOpen
            ? "bg-accent-blue/15 border-accent-blue text-accent-blue shadow-md"
            : "bg-paper hover:bg-paper-muted border-paper-border hover:border-accent-blue/60 text-ink shadow-paper-sm"
        }`}
        title={t("audio.volumeSettings", "Налаштування аудіосинтезатора")}
        aria-label={t("audio.volumeSettings", "Налаштування аудіосинтезатора")}
      >
        {renderVolumeIcon()}
        <span className="font-mono text-xs font-bold leading-none hidden sm:inline">
          {isMuted ? "OFF" : `${volume}%`}
        </span>
      </button>

      {/* Flyout Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={t("audio.volumeSettings", "Налаштування аудіосинтезатора")}
          className="absolute right-0 top-full mt-2 w-64 p-3.5 rounded-2xl bg-paper/95 backdrop-blur-xl border border-paper-border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-ink"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-paper-border/70 mb-3">
            <div className="flex items-center gap-2">
              <Sliders size={14} className="text-accent-blue" />
              <span className="font-display font-bold text-xs">
                {t("audio.synthTitle", "Аудіосинтезатор")}
              </span>
            </div>
            <button
              onClick={handleToggleMute}
              className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold border transition-all cursor-pointer ${
                isMuted
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-600 hover:bg-rose-500/25"
                  : "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/25"
              }`}
            >
              {isMuted ? t("audio.unmute", "ВКЛ") : t("audio.mute", "ВИМК")}
            </button>
          </div>

          {/* Slider Row */}
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between items-center text-[11px] font-mono text-ink-muted">
              <span>{t("audio.masterGain", "Рівень Master Gain")}</span>
              <span className="font-bold text-ink">{isMuted ? "0%" : `${volume}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-paper-border rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[25, 50, 75, 100].map((preset) => (
              <button
                key={preset}
                onClick={() => handleVolumeChange(preset)}
                className={`py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  !isMuted && volume === preset
                    ? "bg-accent-blue text-white border-accent-blue shadow-xs"
                    : "bg-paper-subtle hover:bg-paper-muted border-paper-border text-ink-muted hover:text-ink"
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
