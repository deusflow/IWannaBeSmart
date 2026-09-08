import React from "react";
import type { TVState } from "@iw/sim-engine";
import { Power, Volume2, VolumeX, Activity, Radio, Cpu } from "lucide-react";

interface TVBlueprintDeviceProps {
  tvState: TVState;
  onTogglePower: () => void;
  onNextChannel: () => void;
  onPrevChannel: () => void;
  compact?: boolean;
}

export const TVBlueprintDevice: React.FC<TVBlueprintDeviceProps> = ({
  tvState,
  onTogglePower,
  onNextChannel,
  onPrevChannel,
  compact = false,
}) => {
  const currentChannelName =
    tvState.channelNames[tvState.channel] || "CHANNEL UNTUNED";

  return (
    <div className="relative flex flex-col items-center w-full select-none transition-all duration-300">
      {/* Blueprint Header Annotation */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-ink-subtle pb-2 px-1">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-blue animate-pulse" />
          <span className="font-bold tracking-wider text-ink font-display">
            SAMSUNG // WORKBENCH DISPLAY 65&quot; [MODEL: QN65-SLIM]
          </span>
        </span>
        <span className="hidden sm:inline-flex items-center gap-2.5 text-ink-muted">
          <span>16:9 WIDESCREEN</span>
          <span>•</span>
          <span>RASTER 625L PAL/50Hz</span>
          <span>•</span>
          <span className="text-accent-ok font-semibold">PANEL ACTIVE</span>
        </span>
      </div>

      {/* Modern Television Screen Frame (Ultra-thin bezel, wide 16:9 cinematic aspect) */}
      <div className="w-full relative flex flex-col items-center">
        {/* Outer TV Panel with Hairline Graphite Rim */}
        <div
          className={`w-full bg-[#16181B] rounded-2xl border-[5px] border-[#22252A] shadow-[0_20px_60px_rgba(26,29,32,0.18),0_4px_16px_rgba(26,29,32,0.08)] relative overflow-hidden flex flex-col transition-all duration-300 ${
            compact
              ? "h-[360px] sm:h-[400px]"
              : "h-[420px] sm:h-[480px] md:h-[520px]"
          }`}
        >
          {/* Active Screen Surface (98% of TV Area) */}
          <div
            className={`relative flex-1 rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between p-5 sm:p-7 ${
              tvState.power
                ? "bg-[#060D0B] shadow-[inset_0_0_80px_rgba(29,92,66,0.35)]"
                : "bg-[#0E1012]"
            }`}
          >
            {/* Scanlines / Phosphor Texture when ON */}
            {tvState.power && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.8) 50%)",
                  backgroundSize: "100% 3px",
                }}
              />
            )}

            {/* Subtle Glass Diagonal Reflection Sheen */}
            <div className="absolute -top-32 -left-32 w-96 h-64 bg-gradient-to-br from-white/8 to-transparent rounded-full transform rotate-12 pointer-events-none" />

            {/* Screen Content when ON */}
            {tvState.power ? (
              <>
                {/* Top Widescreen Status Bar */}
                <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm font-mono text-emerald-400/90 tracking-wider">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-700/60 font-bold text-xs sm:text-sm shadow-xs">
                      <Activity size={14} className="animate-pulse text-emerald-400" />
                      CH {tvState.channel.toString().padStart(2, "0")}
                    </span>
                    <span className="text-xs text-emerald-400/70 font-mono hidden sm:inline">
                      1080p // 60Hz NOMINAL
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 rounded text-emerald-300 flex items-center gap-1.5">
                      <Radio size={12} className="text-emerald-400" />
                      <span>38.0 kHz RX</span>
                    </span>
                    <span className="text-[10px] bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded text-emerald-500/80 hidden md:inline">
                      VCC: 5.02V
                    </span>
                  </div>
                </div>

                {/* Center Cinematic Display: Channel Title & Wide Visualizer */}
                <div className="relative z-10 my-auto text-center space-y-4 py-4 sm:py-8">
                  <div className="inline-block px-6 py-2 rounded-xl bg-emerald-950/70 border border-emerald-600/70 shadow-lg backdrop-blur-xs">
                    <h2 className="font-display text-xl sm:text-3xl md:text-4xl font-bold text-emerald-300 tracking-wider uppercase">
                      {currentChannelName}
                    </h2>
                  </div>

                  {/* Wide Stereo Visualizer Waveform */}
                  <div className="h-14 flex items-center justify-center gap-1 sm:gap-1.5 opacity-85 pt-2">
                    {[
                      25, 45, 75, 50, 95, 70, 35, 85, 45, 100, 80, 60, 35, 90, 70, 45,
                      85, 55, 30, 75, 60, 90, 40, 80, 50, 95, 65, 30, 85, 45, 70, 55,
                    ].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 sm:w-1.5 bg-emerald-400 rounded-full transition-all duration-150"
                        style={{
                          height: `${Math.max(6, (h * tvState.volume) / 22)}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom OSD Bar: Volume & Status */}
                <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm font-mono text-emerald-400/90 pt-3 border-t border-emerald-900/60">
                  <div className="flex items-center gap-2.5">
                    {tvState.isMuted ? (
                      <VolumeX size={17} className="text-red-400" />
                    ) : (
                      <Volume2 size={17} />
                    )}
                    <span className="font-bold text-xs sm:text-sm">
                      VOLUME {tvState.isMuted ? "[MUTED]" : `${tvState.volume} / 30`}
                    </span>
                  </div>

                  {/* Segmented Volume Meter (24 segments) */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-3.5 w-1.5 sm:w-2 rounded-xs transition-colors duration-100 ${
                          !tvState.isMuted && i < Math.round((tvState.volume / 30) * 24)
                            ? "bg-emerald-400"
                            : "bg-emerald-950/60 border border-emerald-900/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Screen Content when OFF (Standby obsidian screen) */
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="text-sm font-mono text-[#5A6065]/70 tracking-widest font-semibold">
                  // STANDBY // CRT UNPOWERED
                </span>
                <span className="text-xs font-mono text-[#5A6065]/40">
                  CLICK [PWR] ON REMOTE OR BOTTOM SENSOR TO BOOT DISPLAY
                </span>
              </div>
            )}
          </div>

          {/* Slim TV Bottom Chin (Modern Samsung TV Chin with Logo, Power LED, & IR Lens) */}
          <div className="h-7 bg-[#1A1D20] border-t border-[#262A30] px-4 flex items-center justify-between text-[10px] font-mono text-ink-subtle">
            {/* Left Model ID */}
            <div className="flex items-center gap-2">
              <span className="font-display font-bold tracking-widest text-[#858D94] text-[9px]">
                SAMSUNG
              </span>
              <span className="text-[#454B54]">•</span>
              <span className="text-[9px] text-[#606772] hidden sm:inline">
                QN65 // ULTRA SLIM
              </span>
            </div>

            {/* Center Quick Power Button */}
            <button
              onClick={onTogglePower}
              title="Manual TV Power Toggle"
              className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                tvState.power
                  ? "bg-accent-break/20 text-accent-break border border-accent-break/40"
                  : "bg-[#252930] text-[#A5ABB5] hover:bg-[#323842] border border-[#373E49]"
              }`}
            >
              <Power size={10} strokeWidth={2.2} />
              <span>{tvState.power ? "PWR OFF" : "PWR ON"}</span>
            </button>

            {/* Right: Power LED & IR Photodiode Eye */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-[#858D94]">IR</span>
                <div
                  title="TSOP38238 38kHz Photodiode Receptor"
                  className={`h-3 w-5 rounded-xs border flex items-center justify-center transition-all duration-100 ${
                    tvState.irSignalPulse
                      ? "bg-accent-break border-red-300 shadow-[0_0_12px_rgba(168,45,36,1)] scale-110"
                      : "bg-[#331110] border-[#220B0A]"
                  }`}
                >
                  <div
                    className={`h-1 w-1.5 rounded-xs ${
                      tvState.irSignalPulse ? "bg-white" : "bg-red-900/60"
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-[#858D94]">LED</span>
                <div
                  className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
                    tvState.power
                      ? "bg-accent-ok border-emerald-400 shadow-[0_0_10px_rgba(29,92,66,1)]"
                      : "bg-red-900/60 border-red-800/40"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sleek Dual Angled Television Feet / Pedestal Stand */}
        <div className="w-full flex justify-between px-16 sm:px-24 -mt-0.5">
          <div className="w-8 h-3.5 bg-gradient-to-b from-[#2E3339] to-[#1D2024] border-x border-b border-[#121417] rounded-b shadow-md" />
          <div className="w-8 h-3.5 bg-gradient-to-b from-[#2E3339] to-[#1D2024] border-x border-b border-[#121417] rounded-b shadow-md" />
        </div>
      </div>
    </div>
  );
};
