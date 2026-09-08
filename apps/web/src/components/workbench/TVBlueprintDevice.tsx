import React from "react";
import type { TVState } from "@iw/sim-engine";
import { Power, Volume2, VolumeX, Activity, Sliders, Radio } from "lucide-react";

interface TVBlueprintDeviceProps {
  tvState: TVState;
  onTogglePower: () => void;
  onNextChannel: () => void;
  onPrevChannel: () => void;
}

export const TVBlueprintDevice: React.FC<TVBlueprintDeviceProps> = ({
  tvState,
  onTogglePower,
  onNextChannel,
  onPrevChannel,
}) => {
  const currentChannelName =
    tvState.channelNames[tvState.channel] || "CHANNEL UNTUNED";

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Blueprint Top Header Annotation */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono text-ink-subtle pb-2.5 px-3">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent-blue animate-pulse" />
          <span className="font-bold tracking-wider text-ink font-display text-xs">
            DEVICE 01 // CATHODE RAY DISPLAY [CRT-940 EXPANDED STUDIO UNIT]
          </span>
        </span>
        <span className="hidden sm:inline-flex items-center gap-3 text-ink-muted text-xs">
          <span>RASTER 625-LINE ACTIVE</span>
          <span>•</span>
          <span>50Hz REFRESH</span>
          <span>•</span>
          <span className="text-accent-ok font-semibold">HIGH TENSION RAIL 12.0V</span>
        </span>
      </div>

      {/* Main Television Chassis — Expanded by +40% (max-w-[960px]) */}
      <div className="w-full max-w-4xl bg-[#EBE5DA] rounded-3xl border-2 border-[#D3CBBD] p-6 sm:p-8 shadow-[0_20px_50px_rgba(26,29,32,0.10),0_4px_12px_rgba(26,29,32,0.05)] relative transition-all duration-300">
        {/* Top ventilation louvers (Architectural slotted vents) */}
        <div className="flex justify-center gap-2 mb-5 opacity-55">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="h-1.5 w-4 bg-[#9C9484] rounded-full" />
          ))}
        </div>

        {/* Chassis Front Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* CRT Screen Outer Frame (Spans 9 of 12 columns on desktop) */}
          <div className="md:col-span-9 bg-[#1A1D20] rounded-2xl p-4 sm:p-5 border-2 border-[#121417] shadow-[inset_0_6px_20px_rgba(0,0,0,0.7)] relative overflow-hidden flex flex-col">
            {/* Curved CRT Tube Face — +40% Height (min-h-[460px] on desktop) */}
            <div
              className={`relative flex-1 min-h-[320px] sm:min-h-[400px] md:min-h-[460px] rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between p-6 select-none ${
                tvState.power
                  ? "bg-[#08100D] shadow-[inset_0_0_70px_rgba(29,92,66,0.50)]"
                  : "bg-[#111316]"
              }`}
            >
              {/* Scanlines Overlay when power is ON */}
              {tvState.power && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.85) 50%)",
                    backgroundSize: "100% 4px",
                  }}
                />
              )}

              {/* CRT Phosphor Reflection Curve */}
              <div className="absolute -top-20 -left-20 w-80 h-44 bg-gradient-to-br from-white/12 to-transparent rounded-full transform rotate-12 pointer-events-none" />

              {/* Screen Content when ON */}
              {tvState.power ? (
                <>
                  {/* Top CRT Status Row */}
                  <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm font-mono text-emerald-400/90 tracking-wider">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/90 border border-emerald-700/70 font-bold text-xs sm:text-sm">
                        <Activity size={14} className="animate-pulse text-emerald-400" />
                        CHANNEL {tvState.channel.toString().padStart(2, "0")}
                      </span>
                      <span className="text-[11px] text-emerald-500/80 hidden sm:inline font-mono">
                        PAL // 5.02V LOGIC BUS
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 rounded text-emerald-300 flex items-center gap-1.5">
                        <Radio size={12} className="text-emerald-400" />
                        <span>38.0 kHz RX</span>
                      </span>
                    </div>
                  </div>

                  {/* Center CRT Screen: Channel Name & Visualizer */}
                  <div className="relative z-10 my-auto text-center space-y-4 py-8">
                    <div className="inline-block px-5 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-600/60 shadow-md backdrop-blur-xs">
                      <p className="font-display text-lg sm:text-2xl md:text-3xl font-bold text-emerald-300 tracking-wider uppercase">
                        {currentChannelName}
                      </p>
                    </div>

                    {/* Analog Oscilloscope Waveform — Higher dynamic range */}
                    <div className="h-12 flex items-center justify-center gap-1.5 opacity-85 pt-2">
                      {[30, 60, 90, 45, 100, 75, 40, 95, 50, 85, 35, 70, 100, 80, 45, 65, 90, 55, 35, 75, 60, 85, 40].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-emerald-400 rounded-full transition-all duration-150"
                            style={{
                              height: `${Math.max(6, (h * tvState.volume) / 20)}px`,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Bottom OSD Bar: Volume & Status */}
                  <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm font-mono text-emerald-400/90 pt-3.5 border-t border-emerald-900/60">
                    <div className="flex items-center gap-2.5">
                      {tvState.isMuted ? (
                        <VolumeX size={16} className="text-red-400" />
                      ) : (
                        <Volume2 size={16} />
                      )}
                      <span className="font-semibold text-xs sm:text-sm">
                        VOL {tvState.isMuted ? "MUTED" : `${tvState.volume} / 30`}
                      </span>
                    </div>

                    {/* Segmented Volume Level Meter (18 segments) */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 18 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-3.5 w-1.5 sm:w-2 rounded-xs transition-colors duration-100 ${
                            !tvState.isMuted && i < Math.round((tvState.volume / 30) * 18)
                              ? "bg-emerald-400"
                              : "bg-emerald-950/70 border border-emerald-900/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Screen Content when OFF */
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="text-sm font-mono text-[#5A6065]/70 tracking-widest font-semibold">
                    // STANDBY // CRT UNPOWERED
                  </span>
                  <span className="text-xs font-mono text-[#5A6065]/45">
                    PRESS [PWR] ON REMOTE OR MANUAL CHASSIS SWITCH
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Engineering Control Column (Spans 3 cols on desktop) */}
          <div className="md:col-span-3 bg-[#E2DBD0] rounded-2xl p-5 border border-[#CFC5B4] flex flex-col justify-between gap-5">
            {/* Top Brand Plate */}
            <div className="border-b border-[#C8BEAB] pb-3 text-center">
              <span className="font-display text-sm font-bold tracking-widest text-[#1A1D20]">
                TELEVISION 940
              </span>
              <p className="text-[10px] font-mono text-ink-subtle mt-0.5">
                EXPANDED STUDIO CHASSIS
              </p>
            </div>

            {/* Hardware Status Sensors */}
            <div className="space-y-4 py-2">
              {/* Power LED Indicator */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono font-medium text-ink-muted uppercase">
                  MAINS PWR
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3.5 w-3.5 rounded-full border transition-all duration-300 ${
                      tvState.power
                        ? "bg-accent-ok border-emerald-400 shadow-[0_0_14px_rgba(29,92,66,1)]"
                        : "bg-[#8A8170] border-transparent opacity-40"
                    }`}
                  />
                </div>
              </div>

              {/* IR Photodiode Receptor Window */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono font-medium text-ink-muted uppercase">
                  IR PHOTODIODE
                </span>
                <div
                  title="TSOP38238 38kHz Photodiode Window"
                  className={`h-5 w-8 rounded border flex items-center justify-center transition-all duration-100 ${
                    tvState.irSignalPulse
                      ? "bg-accent-break border-red-300 shadow-[0_0_14px_rgba(168,45,36,1)] scale-110"
                      : "bg-[#331110] border-[#220B0A]"
                  }`}
                >
                  <div
                    className={`h-2 w-2.5 rounded-xs ${
                      tvState.irSignalPulse ? "bg-white" : "bg-red-900/60"
                    }`}
                  />
                </div>
              </div>

              {/* Dial Thumbnail Simulation */}
              <div className="pt-2 flex items-center justify-between px-1 text-xs font-mono text-ink-subtle">
                <span className="flex items-center gap-1.5">
                  <Sliders size={13} strokeWidth={1.75} />
                  TUNER
                </span>
                <span className="text-ink font-semibold">
                  CH {tvState.channel.toString().padStart(2, "0")} / 04
                </span>
              </div>
            </div>

            {/* Physical Push Buttons on Chassis */}
            <div className="space-y-2.5 border-t border-[#C8BEAB] pt-4">
              <button
                onClick={onTogglePower}
                title="Manual Power Toggle"
                className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 cursor-pointer outline-none border shadow-paper-sm ${
                  tvState.power
                    ? "bg-accent-break text-white border-red-700/70 hover:bg-accent-break-hover"
                    : "bg-[#D8D0C0] text-ink hover:bg-[#CEC4B2] border-[#C2B7A3]"
                }`}
              >
                <Power size={14} strokeWidth={2.2} />
                <span>{tvState.power ? "POWER OFF" : "POWER ON"}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onPrevChannel}
                  disabled={!tvState.power}
                  className="py-2 px-2 rounded-md bg-[#D8D0C0] hover:bg-[#CEC4B2] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-bold text-ink border border-[#C2B7A3] active:scale-95 transition-all cursor-pointer"
                >
                  CH ▾
                </button>
                <button
                  onClick={onNextChannel}
                  disabled={!tvState.power}
                  className="py-2 px-2 rounded-md bg-[#D8D0C0] hover:bg-[#CEC4B2] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-bold text-ink border border-[#C2B7A3] active:scale-95 transition-all cursor-pointer"
                >
                  CH ▴
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chassis Footer Screws & Tech Calibration Data */}
        <div className="flex justify-between items-center pt-4 mt-4 border-t border-[#D3CBBD] text-[11px] font-mono text-ink-subtle">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#B2A895]" />
            TEST POINT: TP-CRT-PRIMARY (ANODE 12.0V)
          </span>
          <span className="hidden sm:inline">PAL/SECAM 625-LINE // NOMINAL RASTER</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#B2A895]" />
            SER: IW-940-EXP
          </span>
        </div>
      </div>
    </div>
  );
};
