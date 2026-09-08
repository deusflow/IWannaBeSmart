import React from "react";
import { Power, Volume2, Volume1, VolumeX, ChevronUp, ChevronDown, Radio } from "lucide-react";

interface RemoteBlueprintDeviceProps {
  isIrEmitting: boolean;
  orientation?: "vertical" | "horizontal";
  onPowerPress: () => void;
  onChannelUp: () => void;
  onChannelDown: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onMuteToggle: () => void;
  onSelectChannel: (channel: number) => void;
}

export const RemoteBlueprintDevice: React.FC<RemoteBlueprintDeviceProps> = ({
  isIrEmitting,
  orientation = "vertical",
  onPowerPress,
  onChannelUp,
  onChannelDown,
  onVolumeUp,
  onVolumeDown,
  onMuteToggle,
  onSelectChannel,
}) => {
  /* =========================================================================
     HORIZONTAL CONSOLE MODE (When drawer is pinned/open beneath the TV)
     ========================================================================= */
  if (orientation === "horizontal") {
    return (
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Annotation */}
        <div className="w-full flex items-center justify-between text-[10px] font-mono text-ink-subtle pb-1.5 px-2">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
            <span className="font-bold text-ink font-display">
              RC-38 // HORIZONTAL BENCH HANDSET
            </span>
          </span>
          <span>IR BEAM ALIGNED 38 kHz</span>
        </div>

        {/* Long Horizontal Remote Console Chassis */}
        <div className="w-full bg-[#202327] rounded-2xl border-2 border-[#16181B] p-3 shadow-[0_12px_28px_rgba(26,29,32,0.12)] relative flex items-center justify-between gap-4">
          {/* Top IR Emitter Diode (Pointing directly up toward TV) */}
          <div className="absolute -top-2 left-12">
            <div
              className={`h-2.5 w-5 rounded-t-full border transition-all duration-100 flex items-center justify-center ${
                isIrEmitting
                  ? "bg-red-500 border-red-300 shadow-[0_0_12px_rgba(239,68,68,1)] scale-110"
                  : "bg-[#451412] border-[#2A0E0C]"
              }`}
            >
              <div
                className={`h-1 w-1.5 rounded-full ${
                  isIrEmitting ? "bg-white" : "bg-red-950/60"
                }`}
              />
            </div>
          </div>

          {/* Left Block: Power + Mute */}
          <div className="flex items-center gap-2 pl-2">
            <button
              onClick={onPowerPress}
              title="Power Toggle"
              className="h-9 px-3.5 rounded-lg bg-accent-break hover:bg-accent-break-hover active:scale-95 text-white flex items-center gap-1.5 font-mono text-xs font-bold border border-red-600/70 shadow-sm cursor-pointer outline-none"
            >
              <Power size={13} strokeWidth={2.2} />
              <span>PWR</span>
            </button>

            <button
              onClick={onMuteToggle}
              title="Mute Audio"
              className="h-9 px-2.5 rounded-lg bg-[#2D3137] hover:bg-[#383E46] active:scale-95 text-[#D5CFC3] flex items-center gap-1 font-mono text-xs border border-[#3E454E] cursor-pointer outline-none"
            >
              <VolumeX size={13} strokeWidth={1.75} />
            </button>
          </div>

          {/* Middle Block: Channel & Volume Rockers */}
          <div className="flex items-center gap-3 bg-[#17191C] px-3 py-1.5 rounded-xl border border-[#2B3037]">
            {/* Channel Rockers */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono text-[#858D94] mr-1">CH:</span>
              <button
                onClick={onChannelDown}
                title="Channel Down"
                className="h-7 w-8 rounded bg-[#2A2E35] hover:bg-[#373C45] active:scale-90 text-[#EFE9DF] flex items-center justify-center font-mono text-xs border border-[#3A414C] cursor-pointer"
              >
                <ChevronDown size={13} strokeWidth={2} />
              </button>
              <button
                onClick={onChannelUp}
                title="Channel Up"
                className="h-7 w-8 rounded bg-[#2A2E35] hover:bg-[#373C45] active:scale-90 text-[#EFE9DF] flex items-center justify-center font-mono text-xs border border-[#3A414C] cursor-pointer"
              >
                <ChevronUp size={13} strokeWidth={2} />
              </button>
            </div>

            <div className="h-5 w-px bg-[#2B3037]" />

            {/* Volume Rockers */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono text-[#858D94] mr-1">VOL:</span>
              <button
                onClick={onVolumeDown}
                title="Volume Down"
                className="h-7 w-8 rounded bg-[#2A2E35] hover:bg-[#373C45] active:scale-90 text-[#EFE9DF] flex items-center justify-center font-mono text-xs border border-[#3A414C] cursor-pointer"
              >
                <Volume1 size={13} strokeWidth={2} />
              </button>
              <button
                onClick={onVolumeUp}
                title="Volume Up"
                className="h-7 w-8 rounded bg-[#2A2E35] hover:bg-[#373C45] active:scale-90 text-[#EFE9DF] flex items-center justify-center font-mono text-xs border border-[#3A414C] cursor-pointer"
              >
                <Volume2 size={13} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Right Block: Direct Channel Keypad */}
          <div className="flex items-center gap-1.5 pr-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => onSelectChannel(num)}
                title={`Tune Channel ${num}`}
                className="h-7 w-7 rounded bg-[#2A2E35] hover:bg-[#383E48] active:scale-90 text-[#EFE9DF] font-mono text-xs font-bold flex items-center justify-center border border-[#3A414C] cursor-pointer outline-none"
              >
                {num}
              </button>
            ))}

            <div className="ml-2 flex items-center gap-1 text-[9px] font-mono text-[#858D94]">
              <Radio
                size={12}
                className={isIrEmitting ? "text-accent-break animate-ping" : "text-[#4A5059]"}
              />
              <span className="hidden sm:inline">NEC TX</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     COMPACT VERTICAL HANDSET MODE (When drawer is closed)
     ========================================================================= */
  return (
    <div className="relative flex flex-col items-center">
      {/* Blueprint Marker */}
      <div className="w-full flex items-center justify-between text-[9px] font-mono text-ink-subtle pb-2 px-1">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
          <span className="font-bold text-ink font-display">RC-38 // HANDSET</span>
        </span>
        <span>IR 38kHz</span>
      </div>

      {/* Slender, compact Braun-style remote chassis */}
      <div className="w-36 sm:w-40 bg-[#202327] rounded-2xl border-2 border-[#151719] p-3 shadow-[0_10px_28px_rgba(26,29,32,0.12)] relative flex flex-col items-center transition-all duration-300">
        {/* Top Infrared LED Transmitter Diode */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <div
            title="38 kHz IR Transmitter LED"
            className={`h-2.5 w-4 rounded-t-full border transition-all duration-100 flex items-center justify-center ${
              isIrEmitting
                ? "bg-red-500 border-red-300 shadow-[0_0_10px_rgba(239,68,68,1)] scale-110"
                : "bg-[#451412] border-[#2A0E0C]"
            }`}
          >
            <div
              className={`h-1 w-1 rounded-full ${
                isIrEmitting ? "bg-white" : "bg-red-950/60"
              }`}
            />
          </div>
        </div>

        {/* Brand Stamp */}
        <div className="w-full flex items-center justify-between border-b border-[#2E3339] pb-2 mb-2.5 pt-0.5 text-[8px] font-mono text-[#858D94]">
          <span className="tracking-wider">RC-MINI</span>
          <div className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isIrEmitting ? "bg-accent-break animate-ping" : "bg-[#3A4047]"
              }`}
            />
            <span>TX</span>
          </div>
        </div>

        {/* Primary Row: Power & Mute */}
        <div className="w-full grid grid-cols-2 gap-1.5 mb-2.5">
          <button
            onClick={onPowerPress}
            title="Power Toggle"
            className="py-1.5 rounded-md bg-accent-break hover:bg-accent-break-hover active:scale-90 text-white flex items-center justify-center gap-1 transition-all duration-100 shadow-xs border border-red-700/60 cursor-pointer outline-none"
          >
            <Power size={11} strokeWidth={2.2} />
            <span className="text-[9px] font-mono font-bold">PWR</span>
          </button>

          <button
            onClick={onMuteToggle}
            title="Audio Mute"
            className="py-1.5 rounded-md bg-[#2B3036] hover:bg-[#363D46] active:scale-90 text-[#D5CFC3] flex items-center justify-center gap-1 transition-all duration-100 border border-[#38404A] cursor-pointer outline-none"
          >
            <VolumeX size={11} strokeWidth={1.75} />
            <span className="text-[9px] font-mono">MUTE</span>
          </button>
        </div>

        {/* Rocker Section: Channel & Volume */}
        <div className="w-full grid grid-cols-2 gap-1.5 p-1.5 bg-[#17191C] rounded-xl border border-[#282D33] mb-2.5">
          {/* Channel */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[7px] font-mono text-[#858D94] uppercase tracking-wider">
              CH
            </span>
            <button
              onClick={onChannelUp}
              title="CH Up"
              className="w-full py-1.5 rounded bg-[#272B31] hover:bg-[#333942] active:scale-90 text-[#EFE9DF] flex items-center justify-center border border-[#363C46] cursor-pointer"
            >
              <ChevronUp size={12} strokeWidth={2} />
            </button>
            <button
              onClick={onChannelDown}
              title="CH Down"
              className="w-full py-1.5 rounded bg-[#272B31] hover:bg-[#333942] active:scale-90 text-[#EFE9DF] flex items-center justify-center border border-[#363C46] cursor-pointer"
            >
              <ChevronDown size={12} strokeWidth={2} />
            </button>
          </div>

          {/* Volume */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[7px] font-mono text-[#858D94] uppercase tracking-wider">
              VOL
            </span>
            <button
              onClick={onVolumeUp}
              title="VOL Up"
              className="w-full py-1.5 rounded bg-[#272B31] hover:bg-[#333942] active:scale-90 text-[#EFE9DF] flex items-center justify-center border border-[#363C46] cursor-pointer"
            >
              <Volume2 size={12} strokeWidth={2} />
            </button>
            <button
              onClick={onVolumeDown}
              title="VOL Down"
              className="w-full py-1.5 rounded bg-[#272B31] hover:bg-[#333942] active:scale-90 text-[#EFE9DF] flex items-center justify-center border border-[#363C46] cursor-pointer"
            >
              <Volume1 size={12} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Numeric Keypad (Channels 1 - 4) */}
        <div className="w-full grid grid-cols-2 gap-1 mb-1">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => onSelectChannel(num)}
              className="h-6 rounded bg-[#272B31] hover:bg-[#333942] active:scale-90 text-[#EFE9DF] font-mono text-[10px] font-semibold flex items-center justify-center border border-[#363C46] cursor-pointer outline-none"
            >
              0{num}
            </button>
          ))}
        </div>

        {/* Minimalist Tactile Ridges */}
        <div className="flex justify-center gap-1 pt-2 pb-0.5 opacity-30">
          <div className="h-0.5 w-3 bg-[#6A727C] rounded" />
          <div className="h-0.5 w-3 bg-[#6A727C] rounded" />
        </div>
      </div>
    </div>
  );
};
