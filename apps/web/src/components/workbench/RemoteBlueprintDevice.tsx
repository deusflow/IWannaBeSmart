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
  const isHorizontal = orientation === "horizontal";

  return (
    <div className="relative flex flex-col items-center select-none transition-all duration-500 ease-out">
      {/* Clean Remote Header in Sniglet font-display */}
      <div
        className={`flex items-center justify-between font-display text-xs text-ink-muted pb-1.5 px-1 whitespace-nowrap transition-all duration-500 ${
          isHorizontal ? "w-[470px]" : "w-44"
        }`}
      >
        <span className="flex items-center gap-1.5 font-bold text-ink text-sm">
          <span className="h-2 w-2 rounded-full bg-accent-blue shrink-0" />
          <span>Пульт Samsung</span>
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-paper border border-paper-border text-ink-muted font-sans">
          BN59-01315Q
        </span>
      </div>

      {/* Frame Container for Smooth Dynamic Rotation:
          When horizontal, it reserves the rotated 470px x 180px box so layout doesn't shift or squash */}
      <div
        className={`relative flex items-center justify-center transition-all duration-500 ease-out ${
          isHorizontal ? "w-[470px] h-[185px]" : "w-44 h-[470px]"
        }`}
      >
        {/* Authentic Samsung BN59-01315Q Handset:
            Identical pixel size, identical buttons, simply rotated horizontally when drawer is open! */}
        <div
          style={{
            transform: isHorizontal ? "rotate(-90deg)" : "rotate(0deg)",
            transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="w-44 h-[470px] bg-[#181B1E] rounded-3xl border-2 border-[#101214] p-3 shadow-[0_16px_40px_rgba(26,29,32,0.16)] relative flex flex-col items-center select-none shrink-0 origin-center"
        >
          {/* Top Infrared Diode Emitter Dome */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div
              title="38 kHz IR Transmitter LED"
              className={`h-3 w-5 rounded-t-full border transition-all duration-100 flex items-center justify-center ${
                isIrEmitting
                  ? "bg-red-500 border-red-300 shadow-[0_0_12px_rgba(239,68,68,1)] scale-110"
                  : "bg-[#451412] border-[#2A0E0C]"
              }`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  isIrEmitting ? "bg-white" : "bg-red-950/70"
                }`}
              />
            </div>
          </div>

          {/* Brand Stamp & TX indicator */}
          <div className="w-full flex items-center justify-between border-b border-[#292D33] pb-1.5 mb-2.5 pt-0.5 text-[9px] font-sans font-medium text-[#858D94]">
            <span className="tracking-wider font-bold">BN59-01315Q</span>
            <div className="flex items-center gap-1">
              <Radio
                size={11}
                className={isIrEmitting ? "text-accent-break animate-ping" : "text-[#4A5059]"}
              />
              <span className="text-[9px]">38 kHz ИК</span>
            </div>
          </div>

          {/* 1. TOP ROW: Power (Red) & Source Button */}
          <div className="w-full grid grid-cols-2 gap-1.5 mb-2.5">
            <button
              onClick={onPowerPress}
              title="Питание (Power)"
              className="py-1.5 rounded-xl bg-accent-break hover:bg-accent-break-hover active:scale-95 text-white flex items-center justify-center gap-1 transition-all duration-100 shadow-sm border border-red-600/70 cursor-pointer outline-none"
            >
              <Power size={12} strokeWidth={2.4} />
              <span className="text-[10px] font-sans font-bold">PWR</span>
            </button>

            <button
              onClick={() => onSelectChannel(1)}
              title="Источник сигнала"
              className="py-1.5 rounded-xl bg-[#24282E] hover:bg-[#2F343D] active:scale-95 text-[#D5CFC3] flex items-center justify-center gap-1 transition-all duration-100 border border-[#343A43] cursor-pointer outline-none"
            >
              <Tv size={11} strokeWidth={1.75} />
              <span className="text-[10px] font-sans font-semibold">SOURCE</span>
            </button>
          </div>

          {/* 2. NUMERIC KEYPAD: 3 Columns × 4 Rows */}
          <div className="w-full grid grid-cols-3 gap-1 p-1.5 bg-[#121416] rounded-2xl border border-[#23272D] mb-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const isAvailable = num <= 4;
              return (
                <button
                  key={num}
                  disabled={!isAvailable}
                  onClick={() => onSelectChannel(num)}
                  title={`Канал ${num}`}
                  className={`h-6 rounded-md font-sans text-xs font-bold flex items-center justify-center transition-all duration-100 outline-none border ${
                    isAvailable
                      ? "bg-[#252930] hover:bg-[#333842] text-[#EFE9DF] border-[#363C46] active:scale-90 cursor-pointer"
                      : "bg-[#16181B] text-[#444850] border-transparent cursor-not-allowed opacity-35"
                  }`}
                >
                  {num}
                </button>
              );
            })}
            {/* Bottom row: TTX, 0, PRE */}
            <button
              onClick={() => onSelectChannel(1)}
              className="h-6 rounded-md bg-[#1D2024] hover:bg-[#2A2E35] text-[#858D94] font-sans text-[9px] font-semibold flex items-center justify-center border border-[#2C3138] cursor-pointer"
            >
              TTX
            </button>
            <button
              onClick={() => onSelectChannel(1)}
              className="h-6 rounded-md bg-[#252930] hover:bg-[#333842] text-[#EFE9DF] font-sans text-xs font-bold flex items-center justify-center border border-[#363C46] cursor-pointer"
            >
              0
            </button>
            <button
              onClick={onChannelDown}
              className="h-6 rounded-md bg-[#1D2024] hover:bg-[#2A2E35] text-[#858D94] font-sans text-[9px] font-semibold flex items-center justify-center border border-[#2C3138] cursor-pointer"
            >
              PRE
            </button>
          </div>

          {/* 3. DUAL ROCKER SECTION: Distinctive Samsung VOL and CH Bars */}
          <div className="w-full grid grid-cols-3 gap-1.5 items-center px-0.5 mb-2.5">
            {/* Left Rocker: Volume Bar */}
            <div className="flex flex-col items-center bg-[#24282E] rounded-xl border border-[#343A43] overflow-hidden p-0.5">
              <button
                onClick={onVolumeUp}
                title="Громкость +"
                className="w-full py-1 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
              >
                <Volume2 size={12} strokeWidth={2} />
              </button>
              <span className="text-[8px] font-sans font-bold text-[#858D94] py-0.5">VOL</span>
              <button
                onClick={onVolumeDown}
                title="Громкость -"
                className="w-full py-1 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
              >
                <Volume1 size={12} strokeWidth={2} />
              </button>
            </div>

            {/* Center Column: MUTE */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onMuteToggle}
                title="Отключить звук"
                className="w-full py-1.5 rounded-lg bg-[#24282E] hover:bg-[#2F343D] active:scale-90 text-[#D5CFC3] flex items-center justify-center border border-[#343A43] cursor-pointer"
              >
                <VolumeX size={12} strokeWidth={1.75} />
              </button>
              <span className="text-[7px] font-sans font-bold text-[#6C747E]">MUTE</span>
            </div>

            {/* Right Rocker: Channel Bar */}
            <div className="flex flex-col items-center bg-[#24282E] rounded-xl border border-[#343A43] overflow-hidden p-0.5">
              <button
                onClick={onChannelUp}
                title="Канал вперед"
                className="w-full py-1 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
              >
                <ChevronUp size={13} strokeWidth={2} />
              </button>
              <span className="text-[8px] font-sans font-bold text-[#858D94] py-0.5">CH</span>
              <button
                onClick={onChannelDown}
                title="Канал назад"
                className="w-full py-1 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
              >
                <ChevronDown size={13} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* 4. CIRCULAR NAVIGATION D-PAD CLUSTER */}
          <div className="w-full flex items-center justify-center my-1">
            <div className="relative h-24 w-24 rounded-full bg-[#121416] border border-[#2A2E35] flex items-center justify-center shadow-inner">
              {/* Up */}
              <button
                onClick={onChannelUp}
                className="absolute top-1 left-1/2 -translate-x-1/2 h-6 w-8 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
                title="Вверх"
              >
                <ArrowUp size={12} />
              </button>
              {/* Down */}
              <button
                onClick={onChannelDown}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 h-6 w-8 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
                title="Вниз"
              >
                <ArrowDown size={12} />
              </button>
              {/* Left */}
              <button
                onClick={onVolumeDown}
                className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-6 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
                title="Влево"
              >
                <ArrowLeft size={12} />
              </button>
              {/* Right */}
              <button
                onClick={onVolumeUp}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-6 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
                title="Вправо"
              >
                <ArrowRight size={12} />
              </button>
              {/* Center OK button */}
              <button
                onClick={() => onSelectChannel(1)}
                className="h-8 w-8 rounded-full bg-[#2A2F37] hover:bg-[#353B45] active:scale-90 text-white font-sans text-xs font-bold flex items-center justify-center border border-[#404753] cursor-pointer shadow-sm"
                title="OK"
              >
                <Check size={12} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* 5. RETURN, HOME, EXIT BUTTONS */}
          <div className="w-full grid grid-cols-3 gap-1 my-1.5">
            <button
              onClick={onChannelDown}
              className="py-1 rounded-lg bg-[#20242A] hover:bg-[#2C3139] active:scale-90 text-[#858D94] hover:text-white text-[8px] font-sans font-bold flex items-center justify-center gap-0.5 border border-[#2E333B] cursor-pointer"
              title="Назад"
            >
              <RotateCcw size={10} />
              <span>RETURN</span>
            </button>
            <button
              onClick={() => onSelectChannel(1)}
              className="py-1 rounded-lg bg-[#20242A] hover:bg-[#2C3139] active:scale-90 text-white text-[8px] font-sans font-bold flex items-center justify-center gap-0.5 border border-[#2E333B] cursor-pointer"
              title="Домой"
            >
              <Home size={10} />
              <span>HOME</span>
            </button>
            <button
              onClick={onPowerPress}
              className="py-1 rounded-lg bg-[#20242A] hover:bg-[#2C3139] active:scale-90 text-[#858D94] hover:text-white text-[8px] font-sans font-bold flex items-center justify-center border border-[#2E333B] cursor-pointer"
              title="Выход"
            >
              <span>EXIT</span>
            </button>
          </div>

          {/* 6. SAMSUNG 4 COLOR BUTTONS (A, B, C, D) */}
          <div className="w-full grid grid-cols-4 gap-1 py-1 border-t border-[#292D33]">
            <button
              onClick={() => onSelectChannel(1)}
              className="h-2 rounded bg-[#A82D24] hover:opacity-80 active:scale-90 cursor-pointer"
              title="Red (A)"
            />
            <button
              onClick={() => onSelectChannel(2)}
              className="h-2 rounded bg-[#1D5C42] hover:opacity-80 active:scale-90 cursor-pointer"
              title="Green (B)"
            />
            <button
              onClick={() => onSelectChannel(3)}
              className="h-2 rounded bg-[#C06A1B] hover:opacity-80 active:scale-90 cursor-pointer"
              title="Yellow (C)"
            />
            <button
              onClick={() => onSelectChannel(4)}
              className="h-2 rounded bg-[#1E3A8A] hover:opacity-80 active:scale-90 cursor-pointer"
              title="Blue (D)"
            />
          </div>

          {/* Bottom Samsung Brand Emboss */}
          <div className="pt-1.5 text-center">
            <span className="font-display tracking-[0.25em] text-[9px] font-bold text-[#646A74]">
              SAMSUNG
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
