import React from "react";
import {
  Power,
  Volume2,
  Volume1,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Radio,
  Tv,
  RotateCcw,
  Home,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

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
     HORIZONTAL CONSOLE MODE (Under the +40% expanded TV)
     ========================================================================= */
  if (orientation === "horizontal") {
    return (
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Annotation */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-ink-subtle pb-2 px-3">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
            <span className="font-bold text-ink font-display">
              SAMSUNG BN59-01315Q // HORIZONTAL BENCH HANDSET
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span>IR 38kHz NEC PROTOCOL</span>
            <span>•</span>
            <span className="text-accent-ok">LINE OF SIGHT ALIGNED</span>
          </span>
        </div>

        {/* Elongated Horizontal Remote Console Chassis */}
        <div className="w-full bg-[#1A1D20] rounded-2xl border-2 border-[#121416] p-4 shadow-[0_16px_36px_rgba(26,29,32,0.14)] relative flex items-center justify-between gap-5 select-none">
          {/* Top IR Emitter Diode (Aligned towards TV) */}
          <div className="absolute -top-3 left-14">
            <div
              title="Samsung 38 kHz IR Transmitter LED"
              className={`h-3 w-6 rounded-t-full border transition-all duration-100 flex items-center justify-center ${
                isIrEmitting
                  ? "bg-red-500 border-red-300 shadow-[0_0_14px_rgba(239,68,68,1)] scale-110"
                  : "bg-[#451412] border-[#2A0E0C]"
              }`}
            >
              <div
                className={`h-1.5 w-2 rounded-full ${
                  isIrEmitting ? "bg-white" : "bg-red-950/70"
                }`}
              />
            </div>
          </div>

          {/* Section 1: Power & Source */}
          <div className="flex items-center gap-2.5 pl-2 border-r border-[#2C3138] pr-4">
            <button
              onClick={onPowerPress}
              title="Power Toggle (Samsung NEC 0xE0E040BF)"
              className="h-10 px-4 rounded-xl bg-accent-break hover:bg-accent-break-hover active:scale-95 text-white flex items-center gap-2 font-mono text-xs font-bold border border-red-600/70 shadow-sm cursor-pointer outline-none"
            >
              <Power size={14} strokeWidth={2.4} />
              <span>POWER</span>
            </button>

            <button
              onClick={() => onSelectChannel(1)}
              title="Source / Input"
              className="h-10 px-3 rounded-xl bg-[#262A30] hover:bg-[#32373F] active:scale-95 text-[#D5CFC3] flex items-center gap-1.5 font-mono text-xs border border-[#373D46] cursor-pointer outline-none"
            >
              <Tv size={13} strokeWidth={1.75} />
              <span>SOURCE</span>
            </button>
          </div>

          {/* Section 2: Samsung Dual Rocker Controls (VOL +/- and CH +/-) */}
          <div className="flex items-center gap-4 bg-[#121417] px-4 py-2 rounded-xl border border-[#262A30]">
            {/* VOL Rocker */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-[#858D94] font-bold">
                VOL
              </span>
              <button
                onClick={onVolumeDown}
                title="Volume Down (-)"
                className="h-8 w-9 rounded-lg bg-[#252930] hover:bg-[#323842] active:scale-90 text-[#EFE9DF] flex items-center justify-center font-mono text-xs border border-[#353C47] cursor-pointer"
              >
                <Volume1 size={14} strokeWidth={2} />
              </button>
              <button
                onClick={onVolumeUp}
                title="Volume Up (+)"
                className="h-8 w-9 rounded-lg bg-[#252930] hover:bg-[#323842] active:scale-90 text-[#EFE9DF] flex items-center justify-center font-mono text-xs border border-[#353C47] cursor-pointer"
              >
                <Volume2 size={14} strokeWidth={2} />
              </button>
            </div>

            {/* Mute Center Key */}
            <button
              onClick={onMuteToggle}
              title="Mute"
              className="h-8 px-2.5 rounded-lg bg-[#252930] hover:bg-[#323842] active:scale-90 text-[#D5CFC3] flex items-center justify-center font-mono text-xs border border-[#353C47] cursor-pointer"
            >
              <VolumeX size={13} strokeWidth={1.75} />
            </button>

            {/* CH Rocker */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-[#858D94] font-bold">
                CH
              </span>
              <button
                onClick={onChannelDown}
                title="Channel Down (-)"
                className="h-8 w-9 rounded-lg bg-[#252930] hover:bg-[#323842] active:scale-90 text-[#EFE9DF] flex items-center justify-center font-mono text-xs border border-[#353C47] cursor-pointer"
              >
                <ChevronDown size={14} strokeWidth={2} />
              </button>
              <button
                onClick={onChannelUp}
                title="Channel Up (+)"
                className="h-8 w-9 rounded-lg bg-[#252930] hover:bg-[#323842] active:scale-90 text-[#EFE9DF] flex items-center justify-center font-mono text-xs border border-[#353C47] cursor-pointer"
              >
                <ChevronUp size={14} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Section 3: Navigation D-Pad Cluster */}
          <div className="flex items-center gap-1.5 border-r border-[#2C3138] pr-4">
            <button
              onClick={onChannelDown}
              className="h-8 w-8 rounded-full bg-[#252930] hover:bg-[#323842] active:scale-90 text-[#EFE9DF] flex items-center justify-center border border-[#353C47] cursor-pointer"
              title="Left / Back"
            >
              <ArrowLeft size={13} />
            </button>
            <button
              onClick={() => onSelectChannel(1)}
              className="h-9 w-9 rounded-full bg-[#2C313A] hover:bg-[#383F4A] active:scale-90 text-white font-mono text-xs font-bold flex items-center justify-center border border-[#444D5A] cursor-pointer"
              title="OK / ENTER"
            >
              <Check size={14} strokeWidth={2.5} />
            </button>
            <button
              onClick={onChannelUp}
              className="h-8 w-8 rounded-full bg-[#252930] hover:bg-[#323842] active:scale-90 text-[#EFE9DF] flex items-center justify-center border border-[#353C47] cursor-pointer"
              title="Right / Forward"
            >
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Section 4: Direct Channels 1-4 */}
          <div className="flex items-center gap-1.5 pr-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => onSelectChannel(num)}
                title={`Tune Channel 0${num}`}
                className="h-8 w-8 rounded-lg bg-[#252930] hover:bg-[#323842] active:scale-90 text-[#EFE9DF] font-mono text-xs font-bold flex items-center justify-center border border-[#353C47] cursor-pointer outline-none"
              >
                0{num}
              </button>
            ))}

            {/* Samsung 4 Color Teletext Buttons (A/B/C/D) */}
            <div className="flex items-center gap-1 ml-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#A82D24]" title="Red (A)" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#1D5C42]" title="Green (B)" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#C06A1B]" title="Yellow (C)" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#1E3A8A]" title="Blue (D)" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     VERTICAL MODE: AUTHENTIC SAMSUNG BN59-01315Q HANDHELD REMOTE
     ========================================================================= */
  return (
    <div className="relative flex flex-col items-center">
      {/* Blueprint Marker */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-ink-subtle pb-2 px-2">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
          <span className="font-bold text-ink font-display">
            SAMSUNG BN59-01315Q
          </span>
        </span>
        <span>IR 38kHz</span>
      </div>

      {/* Authentic Samsung Remotely Proportioned Handset (w-48, sleek elongated profile) */}
      <div className="w-48 bg-[#181B1E] rounded-3xl border-2 border-[#101214] p-3.5 shadow-[0_16px_40px_rgba(26,29,32,0.16)] relative flex flex-col items-center select-none transition-all duration-300">
        {/* Top Infrared Diode Emitter Dome */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div
            title="38 kHz IR Transmitter LED"
            className={`h-3 w-6 rounded-t-full border transition-all duration-100 flex items-center justify-center ${
              isIrEmitting
                ? "bg-red-500 border-red-300 shadow-[0_0_14px_rgba(239,68,68,1)] scale-110"
                : "bg-[#451412] border-[#2A0E0C]"
            }`}
          >
            <div
              className={`h-1.5 w-2 rounded-full ${
                isIrEmitting ? "bg-white" : "bg-red-950/70"
              }`}
            />
          </div>
        </div>

        {/* Brand Stamp & TX indicator */}
        <div className="w-full flex items-center justify-between border-b border-[#292D33] pb-2 mb-3 pt-1 text-[9px] font-mono text-[#858D94]">
          <span className="tracking-widest font-bold">BN59-01315Q</span>
          <div className="flex items-center gap-1">
            <Radio
              size={11}
              className={isIrEmitting ? "text-accent-break animate-ping" : "text-[#4A5059]"}
            />
            <span className="text-[8px]">IR TX</span>
          </div>
        </div>

        {/* 1. TOP ROW: Power (Red) & Source Button */}
        <div className="w-full grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={onPowerPress}
            title="Power Toggle (NEC)"
            className="py-2 rounded-xl bg-accent-break hover:bg-accent-break-hover active:scale-95 text-white flex items-center justify-center gap-1.5 transition-all duration-100 shadow-sm border border-red-600/70 cursor-pointer outline-none"
          >
            <Power size={13} strokeWidth={2.4} />
            <span className="text-[10px] font-mono font-bold">PWR</span>
          </button>

          <button
            onClick={() => onSelectChannel(1)}
            title="Source / Input"
            className="py-2 rounded-xl bg-[#24282E] hover:bg-[#2F343D] active:scale-95 text-[#D5CFC3] flex items-center justify-center gap-1.5 transition-all duration-100 border border-[#343A43] cursor-pointer outline-none"
          >
            <Tv size={12} strokeWidth={1.75} />
            <span className="text-[10px] font-mono">SOURCE</span>
          </button>
        </div>

        {/* 2. NUMERIC KEYPAD: 3 Columns × 4 Rows (Iconic Samsung Soft Rubber Keys) */}
        <div className="w-full grid grid-cols-3 gap-1.5 p-2 bg-[#121416] rounded-2xl border border-[#23272D] mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const isAvailable = num <= 4;
            return (
              <button
                key={num}
                disabled={!isAvailable}
                onClick={() => onSelectChannel(num)}
                title={`Channel 0${num}`}
                className={`h-7 rounded-lg font-mono text-xs font-semibold flex items-center justify-center transition-all duration-100 outline-none border ${
                  isAvailable
                    ? "bg-[#252930] hover:bg-[#333842] text-[#EFE9DF] border-[#363C46] active:scale-90 cursor-pointer"
                    : "bg-[#16181B] text-[#444850] border-transparent cursor-not-allowed opacity-35"
                }`}
              >
                {num}
              </button>
            );
          })}
          {/* Bottom row: TTX, 0, PRE-CH */}
          <button
            onClick={() => onSelectChannel(1)}
            className="h-7 rounded-lg bg-[#1D2024] hover:bg-[#2A2E35] text-[#858D94] font-mono text-[9px] flex items-center justify-center border border-[#2C3138] cursor-pointer"
          >
            TTX
          </button>
          <button
            onClick={() => onSelectChannel(1)}
            className="h-7 rounded-lg bg-[#252930] hover:bg-[#333842] text-[#EFE9DF] font-mono text-xs font-semibold flex items-center justify-center border border-[#363C46] cursor-pointer"
          >
            0
          </button>
          <button
            onClick={onChannelDown}
            className="h-7 rounded-lg bg-[#1D2024] hover:bg-[#2A2E35] text-[#858D94] font-mono text-[8px] flex items-center justify-center border border-[#2C3138] cursor-pointer"
          >
            PRE
          </button>
        </div>

        {/* 3. DUAL ROCKER SECTION: Distinctive Samsung + VOL - and + CH - Bars */}
        <div className="w-full grid grid-cols-3 gap-2 items-center px-1 mb-3">
          {/* Left Rocker: Volume Bar */}
          <div className="flex flex-col items-center bg-[#24282E] rounded-xl border border-[#343A43] overflow-hidden p-0.5">
            <button
              onClick={onVolumeUp}
              title="Volume Up (+)"
              className="w-full py-1.5 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
            >
              <Volume2 size={13} strokeWidth={2} />
            </button>
            <span className="text-[8px] font-mono text-[#858D94] py-0.5">VOL</span>
            <button
              onClick={onVolumeDown}
              title="Volume Down (-)"
              className="w-full py-1.5 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
            >
              <Volume1 size={13} strokeWidth={2} />
            </button>
          </div>

          {/* Center Column: MUTE & INFO */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={onMuteToggle}
              title="Mute Audio"
              className="w-full py-2 rounded-lg bg-[#24282E] hover:bg-[#2F343D] active:scale-90 text-[#D5CFC3] flex items-center justify-center border border-[#343A43] cursor-pointer"
            >
              <VolumeX size={13} strokeWidth={1.75} />
            </button>
            <span className="text-[7px] font-mono text-[#6C747E]">MUTE</span>
          </div>

          {/* Right Rocker: Channel Bar */}
          <div className="flex flex-col items-center bg-[#24282E] rounded-xl border border-[#343A43] overflow-hidden p-0.5">
            <button
              onClick={onChannelUp}
              title="Channel Up (+)"
              className="w-full py-1.5 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
            >
              <ChevronUp size={14} strokeWidth={2} />
            </button>
            <span className="text-[8px] font-mono text-[#858D94] py-0.5">CH</span>
            <button
              onClick={onChannelDown}
              title="Channel Down (-)"
              className="w-full py-1.5 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
            >
              <ChevronDown size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* 4. CIRCULAR NAVIGATION D-PAD CLUSTER */}
        <div className="w-full flex items-center justify-center my-1.5">
          <div className="relative h-28 w-28 rounded-full bg-[#121416] border border-[#2A2E35] flex items-center justify-center shadow-inner">
            {/* Up */}
            <button
              onClick={onChannelUp}
              className="absolute top-1 left-1/2 -translate-x-1/2 h-7 w-9 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
              title="Up"
            >
              <ArrowUp size={14} />
            </button>
            {/* Down */}
            <button
              onClick={onChannelDown}
              className="absolute bottom-1 left-1/2 -translate-x-1/2 h-7 w-9 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
              title="Down"
            >
              <ArrowDown size={14} />
            </button>
            {/* Left */}
            <button
              onClick={onVolumeDown}
              className="absolute left-1 top-1/2 -translate-y-1/2 h-9 w-7 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
              title="Left"
            >
              <ArrowLeft size={14} />
            </button>
            {/* Right */}
            <button
              onClick={onVolumeUp}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-7 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
              title="Right"
            >
              <ArrowRight size={14} />
            </button>
            {/* Center OK button */}
            <button
              onClick={() => onSelectChannel(1)}
              className="h-10 w-10 rounded-full bg-[#2A2F37] hover:bg-[#353B45] active:scale-90 text-white font-mono text-xs font-bold flex items-center justify-center border border-[#404753] cursor-pointer shadow-sm"
              title="OK"
            >
              <Check size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* 5. RETURN, HOME, EXIT BUTTONS */}
        <div className="w-full grid grid-cols-3 gap-1.5 my-2">
          <button
            onClick={onChannelDown}
            className="py-1.5 rounded-lg bg-[#20242A] hover:bg-[#2C3139] active:scale-90 text-[#858D94] hover:text-white text-[9px] font-mono flex items-center justify-center gap-1 border border-[#2E333B] cursor-pointer"
            title="Return"
          >
            <RotateCcw size={11} />
            <span>RETURN</span>
          </button>
          <button
            onClick={() => onSelectChannel(1)}
            className="py-1.5 rounded-lg bg-[#20242A] hover:bg-[#2C3139] active:scale-90 text-white text-[9px] font-mono flex items-center justify-center gap-1 border border-[#2E333B] cursor-pointer"
            title="Home / Smart Hub"
          >
            <Home size={11} />
            <span>HOME</span>
          </button>
          <button
            onClick={onPowerPress}
            className="py-1.5 rounded-lg bg-[#20242A] hover:bg-[#2C3139] active:scale-90 text-[#858D94] hover:text-white text-[9px] font-mono flex items-center justify-center border border-[#2E333B] cursor-pointer"
            title="Exit"
          >
            <span>EXIT</span>
          </button>
        </div>

        {/* 6. SAMSUNG 4 COLOR BUTTONS (A, B, C, D) */}
        <div className="w-full grid grid-cols-4 gap-1.5 py-1.5 border-t border-[#292D33]">
          <button
            onClick={() => onSelectChannel(1)}
            className="h-2.5 rounded bg-[#A82D24] hover:opacity-80 active:scale-90 cursor-pointer"
            title="Red (A)"
          />
          <button
            onClick={() => onSelectChannel(2)}
            className="h-2.5 rounded bg-[#1D5C42] hover:opacity-80 active:scale-90 cursor-pointer"
            title="Green (B)"
          />
          <button
            onClick={() => onSelectChannel(3)}
            className="h-2.5 rounded bg-[#C06A1B] hover:opacity-80 active:scale-90 cursor-pointer"
            title="Yellow (C)"
          />
          <button
            onClick={() => onSelectChannel(4)}
            className="h-2.5 rounded bg-[#1E3A8A] hover:opacity-80 active:scale-90 cursor-pointer"
            title="Blue (D)"
          />
        </div>

        {/* Bottom Samsung Brand Emboss */}
        <div className="pt-2 text-center">
          <span className="font-display tracking-[0.25em] text-[10px] font-bold text-[#646A74]">
            SAMSUNG
          </span>
        </div>
      </div>
    </div>
  );
};
