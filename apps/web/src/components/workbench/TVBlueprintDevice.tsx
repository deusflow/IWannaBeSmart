import React from "react";
import type { TVState } from "@iw/sim-engine";
import { Power, Volume2, VolumeX, Activity, Sliders } from "lucide-react";

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
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-ink-subtle pb-2.5 px-2">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-blue animate-pulse" />
          <span className="font-bold tracking-wider text-ink font-display">
            DEVICE 01 // CATHODE RAY RECEIVER [MOD: TV-620]
          </span>
        </span>
        <span className="hidden sm:inline-flex items-center gap-2 text-ink-muted">
          <span>RASTER 625-LINE</span>
          <span>•</span>
          <span>PAL/SECAM 50Hz</span>
          <span>•</span>
          <span className="text-accent-ok">CIRCUIT NOMINAL</span>
        </span>
      </div>

      {/* Main Television Chassis (Expanded & Deeply Styled Braun / Dieter Rams aesthetic) */}
      <div className="w-full max-w-2xl bg-[#EBE5DA] rounded-3xl border-2 border-[#D3CBBD] p-6 shadow-[0_16px_40px_rgba(26,29,32,0.08),0_2px_6px_rgba(26,29,32,0.04)] relative transition-all duration-300">
        {/* Top ventilation louvers (Architectural slotted vents) */}
        <div className="flex justify-center gap-2 mb-4 opacity-50">
          {Array.from({ length: 22 }).map((_, i) => (
            <div key={i} className="h-1.5 w-3.5 bg-[#9C9484] rounded-full" />
          ))}
        </div>

        {/* Chassis Front Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* CRT Screen Outer Frame (Spans 9 of 12 columns on desktop) */}
          <div className="md:col-span-9 bg-[#1E2124] rounded-2xl p-3.5 border-2 border-[#151719] shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col">
            {/* Curved CRT Tube Face */}
            <div
              className={`relative flex-1 min-h-[260px] sm:min-h-[300px] md:min-h-[330px] rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between p-5 select-none ${
                tvState.power
                  ? "bg-[#09110E] shadow-[inset_0_0_50px_rgba(29,92,66,0.45)]"
                  : "bg-[#121517]"
              }`}
            >
              {/* Scanlines Overlay when power is ON */}
              {tvState.power && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.8) 50%)",
                    backgroundSize: "100% 4px",
                  }}
                />
              )}

              {/* CRT Phosphor Reflection Curve */}
              <div className="absolute -top-16 -left-16 w-64 h-36 bg-gradient-to-br from-white/12 to-transparent rounded-full transform rotate-12 pointer-events-none" />

              {/* Screen Content when ON */}
              {tvState.power ? (
                <>
                  {/* Top CRT Status Row */}
                  <div className="relative z-10 flex items-center justify-between text-xs font-mono text-emerald-400/90 tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/70 font-bold">
                        <Activity size={12} className="animate-pulse text-emerald-400" />
                        CH {tvState.channel.toString().padStart(2, "0")}
                      </span>
                      <span className="text-[10px] text-emerald-500/80 hidden sm:inline">
                        5.02V LOGIC BUS
                      </span>
                    </div>

                    <span className="text-[10px] font-mono bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded text-emerald-300">
                      38.0 kHz RX READY
                    </span>
                  </div>

                  {/* Center CRT Screen: Channel Name & Visualizer */}
                  <div className="relative z-10 my-auto text-center space-y-3 py-6">
                    <div className="inline-block px-4 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-700/50 shadow-sm backdrop-blur-xs">
                      <p className="font-display text-sm sm:text-base font-bold text-emerald-300 tracking-wider uppercase">
                        {currentChannelName}
                      </p>
                    </div>

                    {/* Analog Oscilloscope Waveform */}
                    <div className="h-8 flex items-center justify-center gap-1 opacity-80 pt-1">
                      {[25, 50, 80, 45, 95, 60, 30, 85, 40, 100, 70, 55, 35, 90, 65, 40, 75, 50].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="w-1 bg-emerald-400 rounded-full transition-all duration-150"
                            style={{
                              height: `${Math.max(4, (h * tvState.volume) / 24)}px`,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Bottom OSD Bar: Volume & Status */}
                  <div className="relative z-10 flex items-center justify-between text-xs font-mono text-emerald-400/90 pt-3 border-t border-emerald-900/50">
                    <div className="flex items-center gap-2">
                      {tvState.isMuted ? (
                        <VolumeX size={14} className="text-red-400" />
                      ) : (
                        <Volume2 size={14} />
                      )}
                      <span className="font-semibold">
                        VOL {tvState.isMuted ? "MUTED" : `${tvState.volume}/30`}
                      </span>
                    </div>

                    {/* Segmented Volume Meter */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-3 w-1.5 rounded-xs transition-colors duration-100 ${
                            !tvState.isMuted && i < Math.round((tvState.volume / 30) * 15)
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
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                  <span className="text-xs font-mono text-[#5A6065]/70 tracking-widest font-medium">
                    // STANDBY // CRT UNPOWERED
                  </span>
                  <span className="text-[10px] font-mono text-[#5A6065]/40">
                    PRESS [PWR] ON REMOTE OR CHASSIS
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Engineering Control Column (Spans 3 cols on desktop) */}
          <div className="md:col-span-3 bg-[#E2DBD0] rounded-2xl p-4 border border-[#CFC5B4] flex flex-col justify-between gap-4">
            {/* Top Brand Plate */}
            <div className="border-b border-[#C8BEAB] pb-3 text-center">
              <span className="font-display text-xs font-bold tracking-widest text-[#1A1D20]">
                TELEVISION 620
              </span>
              <p className="text-[9px] font-mono text-ink-subtle mt-0.5">
                GERMANIUM LINEAR
              </p>
            </div>

            {/* Hardware Status Sensors */}
            <div className="space-y-3.5 py-1">
              {/* Power LED Indicator */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono font-medium text-ink-muted uppercase">
                  MAINS PWR
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full border transition-all duration-300 ${
                      tvState.power
                        ? "bg-accent-ok border-emerald-400 shadow-[0_0_12px_rgba(29,92,66,1)]"
                        : "bg-[#8A8170] border-transparent opacity-40"
                    }`}
                  />
                </div>
              </div>

              {/* IR Photodiode Receptor Window */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono font-medium text-ink-muted uppercase">
                  IR SENSOR
                </span>
                <div
                  title="TSOP38238 38kHz Photodiode Window"
                  className={`h-4 w-7 rounded border flex items-center justify-center transition-all duration-100 ${
                    tvState.irSignalPulse
                      ? "bg-accent-break border-red-300 shadow-[0_0_12px_rgba(168,45,36,1)] scale-110"
                      : "bg-[#331110] border-[#220B0A]"
                  }`}
                >
                  <div
                    className={`h-1.5 w-2 rounded-xs ${
                      tvState.irSignalPulse ? "bg-white" : "bg-red-900/60"
                    }`}
                  />
                </div>
              </div>

              {/* Dial Thumbnail Simulation */}
              <div className="pt-1 flex items-center justify-between px-1 text-[10px] font-mono text-ink-subtle">
                <span className="flex items-center gap-1">
                  <Sliders size={12} strokeWidth={1.75} />
                  TUNING
                </span>
                <span className="text-ink font-semibold">
                  {tvState.channel}/04
                </span>
              </div>
            </div>

            {/* Physical Push Buttons on Chassis */}
            <div className="space-y-2 border-t border-[#C8BEAB] pt-3">
              <button
                onClick={onTogglePower}
                title="Manual Power Toggle"
                className={`w-full py-2 px-2.5 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 cursor-pointer outline-none border shadow-paper-sm ${
                  tvState.power
                    ? "bg-accent-break text-white border-red-700/70"
                    : "bg-[#D8D0C0] text-ink hover:bg-[#CEC4B2] border-[#C2B7A3]"
                }`}
              >
                <Power size={13} strokeWidth={2.2} />
                <span>{tvState.power ? "POWER OFF" : "POWER ON"}</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={onPrevChannel}
                  disabled={!tvState.power}
                  className="py-1.5 px-2 rounded-md bg-[#D8D0C0] hover:bg-[#CEC4B2] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-bold text-ink border border-[#C2B7A3] active:scale-95 transition-all cursor-pointer"
                >
                  CH ▾
                </button>
                <button
                  onClick={onNextChannel}
                  disabled={!tvState.power}
                  className="py-1.5 px-2 rounded-md bg-[#D8D0C0] hover:bg-[#CEC4B2] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-bold text-ink border border-[#C2B7A3] active:scale-95 transition-all cursor-pointer"
                >
                  CH ▴
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chassis Footer Screws & Tech Calibration Data */}
        <div className="flex justify-between items-center pt-3.5 mt-3.5 border-t border-[#D3CBBD] text-[10px] font-mono text-ink-subtle">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#B2A895]" />
            TEST POINT: TP-CRT-PRIMARY
          </span>
          <span className="hidden sm:inline">HIGH VOLTAGE DEFLECTION // 12.0V</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#B2A895]" />
            SER: IW-2026-B
          </span>
        </div>
      </div>
    </div>
  );
};
