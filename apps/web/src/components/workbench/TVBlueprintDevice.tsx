import React from "react";
import type { TVState } from "@iw/sim-engine";
import { Power, Volume2, VolumeX, Activity, Radio, ChevronUp, ChevronDown } from "lucide-react";

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
    tvState.channelNames[tvState.channel] || "Канал не налаштований";

  return (
    <div className="relative flex flex-col items-center w-full select-none transition-all duration-500 ease-out">
      {/* Clean Device Header in Balsamiq font-display */}
      <div className="w-full flex items-center justify-between font-display text-xs text-ink-muted pb-1.5 px-2">
        <span className="flex items-center gap-2 font-bold text-ink text-sm">
          <span className="h-2 w-2 rounded-full bg-accent-blue animate-pulse" />
          <span>Samsung Smart TV 65&quot;</span>
        </span>
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-md bg-paper border border-paper-border text-ink-muted">
            4K UHD • 16:9
          </span>
          <span className="text-ink-subtle">•</span>
          <span
            className={`font-bold ${
              tvState.power ? "text-accent-ok" : "text-ink-subtle"
            }`}
          >
            {tvState.power ? "У мережі" : "Режим очікування"}
          </span>
        </div>
      </div>

      {/* Modern Television Screen Frame (Ultra-thin bezel, wide 16:9 aspect ratio) */}
      <div className="w-full relative flex flex-col items-center">
        {/* Outer TV Panel with Ultra-Thin Graphite Bezel (Only 3px!) */}
        <div
          className={`w-full bg-[#121417] rounded-xl sm:rounded-2xl border-[3px] border-[#2A2E35] shadow-[0_16px_48px_rgba(26,29,32,0.18),0_2px_8px_rgba(26,29,32,0.08)] relative overflow-hidden flex flex-col transition-all duration-500 ease-out ${
            compact ? "max-h-[360px] sm:max-h-[390px]" : "max-h-[460px] sm:max-h-[500px]"
          } aspect-[16/9]`}
        >
          {/* Active Screen Surface */}
          <div
            className={`relative flex-1 rounded-t-lg sm:rounded-t-xl overflow-hidden transition-all duration-500 flex flex-col justify-between p-4 sm:p-6 ${
              tvState.power
                ? "bg-[#060D0B] shadow-[inset_0_0_80px_rgba(29,92,66,0.35)]"
                : "bg-[#0B0D10]"
            }`}
          >
            {/* Scanlines / Texture when ON */}
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

            {/* Subtle Realistic Glass Reflection */}
            <div className="absolute -top-32 -left-32 w-96 h-64 bg-gradient-to-br from-white/7 to-transparent rounded-full transform rotate-12 pointer-events-none" />

            {/* Screen Content when ON */}
            {tvState.power ? (
              <>
                {/* Top Widescreen Status Bar */}
                <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm font-sans text-emerald-400/90 tracking-wide">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 font-display font-bold text-xs sm:text-sm text-emerald-300 shadow-xs">
                      <Activity size={14} className="animate-pulse text-emerald-400" />
                      Канал {tvState.channel}
                    </span>
                    <span className="text-[11px] sm:text-xs text-emerald-400/70 hidden sm:inline font-sans">
                      4K HDR 60Hz
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-sans">
                    <span className="text-[11px] bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 rounded-lg text-emerald-300 flex items-center gap-1.5">
                      <Radio size={12} className="text-emerald-400" />
                      <span>ІЧ 38 kHz</span>
                    </span>
                  </div>
                </div>

                {/* Center Cinematic Display: Channel Title & Wide Stereo Visualizer */}
                <div className="relative z-10 my-auto text-center space-y-3 sm:space-y-4 py-2 sm:py-4">
                  <div className="inline-block px-5 sm:px-8 py-2 rounded-2xl bg-emerald-950/75 border border-emerald-600/70 shadow-lg backdrop-blur-xs">
                    <h2 className="font-display text-xl sm:text-3xl md:text-4xl font-bold text-emerald-300 tracking-wide">
                      {currentChannelName}
                    </h2>
                  </div>

                  {/* Wide Stereo Visualizer Waveform Reacting to Volume */}
                  <div className="h-10 sm:h-14 flex items-center justify-center gap-1 sm:gap-1.5 opacity-85 pt-1">
                    {[
                      25, 45, 75, 50, 95, 70, 35, 85, 45, 100, 80, 60, 35, 90, 70, 45,
                      85, 55, 30, 75, 60, 90, 40, 80, 50, 95, 65, 30, 85, 45, 70, 55,
                    ].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 sm:w-1.5 bg-emerald-400 rounded-full transition-all duration-150"
                        style={{
                          height: `${Math.max(4, (h * (tvState.isMuted ? 2 : tvState.volume)) / 24)}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom OSD Bar: Volume & Status */}
                <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm font-display text-emerald-400/90 pt-2 border-t border-emerald-900/60">
                  <div className="flex items-center gap-2">
                    {tvState.isMuted ? (
                      <VolumeX size={16} className="text-red-400" />
                    ) : (
                      <Volume2 size={16} />
                    )}
                    <span className="font-bold text-xs sm:text-sm">
                      Гучність: {tvState.isMuted ? "Вимкнено" : `${tvState.volume} / 30`}
                    </span>
                  </div>

                  {/* Segmented Volume Meter (24 segments) */}
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2.5 sm:h-3 w-1 sm:w-1.5 rounded-xs transition-colors duration-100 ${
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
              /* Screen Content when OFF */
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 select-none">
                <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="text-sm sm:text-base font-display text-[#858D94] font-bold">
                  Телевізор у режимі очікування
                </span>
                <span className="text-xs font-sans text-[#6B7280]">
                  Натисніть кнопку живлення (PWR) на пульті, щоб увімкнути
                </span>
              </div>
            )}
          </div>

          {/* Slim TV Bottom Chin */}
          <div className="h-6 sm:h-7 bg-[#16181B] border-t border-[#262A30] px-3 sm:px-4 flex items-center justify-between text-xs font-display text-ink-subtle">
            {/* Left Model & Brand */}
            <div className="flex items-center gap-2">
              <span className="font-display font-bold tracking-wider text-[#858D94] text-[10px]">
                SAMSUNG
              </span>
              <span className="text-[#454B54]">•</span>
              <span className="text-[10px] text-[#606772] hidden sm:inline font-sans">
                Smart TV
              </span>
            </div>

            {/* Center Quick Chassis Controls: PWR, CH ▼, CH ▲ */}
            <div className="flex items-center gap-1">
              <button
                onClick={onTogglePower}
                title="Увімкнення телевізора"
                className={`px-2 py-0.5 rounded text-[10px] font-display font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  tvState.power
                    ? "bg-accent-break/20 text-accent-break border border-accent-break/40"
                    : "bg-[#252930] text-[#A5ABB5] hover:bg-[#323842] border border-[#373E49]"
                }`}
              >
                <Power size={9} strokeWidth={2.2} />
                <span>{tvState.power ? "ВИМК" : "УВІМК"}</span>
              </button>

              <button
                onClick={onPrevChannel}
                disabled={!tvState.power}
                title="Попередній канал"
                className="h-5 w-5 rounded bg-[#20242A] hover:bg-[#2C3138] disabled:opacity-30 disabled:cursor-not-allowed text-[#A5ABB5] flex items-center justify-center border border-[#323740] cursor-pointer"
              >
                <ChevronDown size={11} />
              </button>

              <button
                onClick={onNextChannel}
                disabled={!tvState.power}
                title="Наступний канал"
                className="h-5 w-5 rounded bg-[#20242A] hover:bg-[#2C3138] disabled:opacity-30 disabled:cursor-not-allowed text-[#A5ABB5] flex items-center justify-center border border-[#323740] cursor-pointer"
              >
                <ChevronUp size={11} />
              </button>
            </div>

            {/* Right: Power LED & TSOP IR Photodiode Sensor */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-[#858D94] font-sans">ІЧ</span>
                <div
                  title="TSOP38238 38kHz Photodiode Receptor"
                  className={`h-2.5 w-4 sm:w-5 rounded-xs border flex items-center justify-center transition-all duration-100 ${
                    tvState.irSignalPulse
                      ? "bg-accent-break border-red-300 shadow-[0_0_10px_rgba(168,45,36,1)] scale-110"
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

              <div className="flex items-center gap-1">
                <span className="text-[9px] text-[#858D94] font-sans">Мережа</span>
                <div
                  className={`h-2 w-2 rounded-full border transition-all duration-300 ${
                    tvState.power
                      ? "bg-accent-ok border-emerald-400 shadow-[0_0_8px_rgba(29,92,66,1)]"
                      : "bg-red-900/70 border-red-800/40"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sleek Modern Angled TV Feet (Samsung Dual Blade Stand) */}
        <div className="w-full flex justify-between px-12 sm:px-20 -mt-0.5 pointer-events-none">
          <div className="w-7 sm:w-9 h-3.5 bg-gradient-to-b from-[#2E3339] to-[#16181B] border-x border-b border-[#121417] rounded-b shadow-md transform -skew-x-6" />
          <div className="w-7 sm:w-9 h-3.5 bg-gradient-to-b from-[#2E3339] to-[#16181B] border-x border-b border-[#121417] rounded-b shadow-md transform skew-x-6" />
        </div>
      </div>
    </div>
  );
};
