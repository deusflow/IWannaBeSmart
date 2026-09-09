import React from "react";
import { useTranslation } from "react-i18next";
import { useWorkbenchStore } from "../../store/workbenchStore";
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
  orientation?: "vertical" | "horizontal";
}

export const RemoteBlueprintDevice: React.FC<RemoteBlueprintDeviceProps> = ({
  orientation = "vertical",
}) => {
  const { t } = useTranslation();
  const {
    isIrEmitting,
    osdMessage,
    pressPower,
    pressChannelUp,
    pressChannelDown,
    pressVolumeUp,
    pressVolumeDown,
    pressMuteToggle,
    pressSelectChannel,
  } = useWorkbenchStore();

  const isCalcMode = osdMessage === "CALC_MODE";
  const isHorizontal = orientation === "horizontal";

  // -------------------------------------------------------------
  // LANDSCAPE CONSOLE LAYOUT (When drawer is open, placed under TV)
  // -------------------------------------------------------------
  if (isHorizontal) {
    return (
      <div className="relative flex flex-col items-center select-none w-full max-w-[560px]">
        {/* Handset Header */}
        <div className="w-full flex items-center justify-between font-display text-xs text-ink-muted pb-1 px-2 whitespace-nowrap">
          <span className="flex items-center gap-1.5 font-bold text-ink text-xs">
            <span className="h-2 w-2 rounded-full bg-accent-blue shrink-0" />
            <span>{t("workbench.remoteConsoleTitle", "Пульт ДК (Консоль)")}</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-paper border border-paper-border text-ink-muted font-mono">
            BN59-01315Q
          </span>
        </div>

        {/* Horizontal Remote Enclosure */}
        <div className="w-full bg-[#181B1E] rounded-2xl border-2 border-[#101214] p-3 shadow-[0_12px_32px_rgba(26,29,32,0.16)] relative flex flex-col select-none shrink-0">
          {/* Top IR Diode Emitter Dome - directly points straight up towards the TV! */}
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
                className={`h-1.5 w-1.5 rounded-full ${
                  isIrEmitting ? "bg-white" : "bg-red-950/70"
                }`}
              />
            </div>
          </div>

          {/* Sub-header inside chassis */}
          <div className="w-full flex items-center justify-between border-b border-[#292D33] pb-1.5 mb-2 text-[9px] font-mono text-[#858D94]">
            <span className="tracking-wider font-bold">SMART REMOTE CONTROLLER</span>
            <div className="flex items-center gap-1">
              <Radio
                size={11}
                className={isIrEmitting ? "text-accent-break animate-ping" : "text-[#4A5059]"}
              />
              <span className="text-[9px]">38 kHz ІЧ-передавач</span>
            </div>
          </div>

          {/* Landscape 4-Section Grid: All Upright Buttons! */}
          <div className="w-full grid grid-cols-12 gap-2 items-center">
            {/* 1. POWER, SOURCE & SYSTEM (Cols 1-3) */}
            <div className="col-span-3 flex flex-col justify-between h-full gap-1.5 border-r border-[#292D33]/80 pr-2">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={pressPower}
                  title="Живлення (Power)"
                  data-guide="remote-pwr"
                  className="py-1.5 rounded-xl bg-accent-break hover:bg-accent-break-hover active:scale-95 text-white flex items-center justify-center gap-1 transition-all duration-100 shadow-sm border border-red-600/70 cursor-pointer outline-none"
                >
                  <Power size={11} strokeWidth={2.5} />
                  <span className="text-[9.5px] font-sans font-bold">PWR</span>
                </button>
                <button
                  onClick={() => pressSelectChannel(1)}
                  title="Джерело сигналу"
                  className="py-1.5 rounded-xl bg-[#24282E] hover:bg-[#2F343D] active:scale-95 text-[#D5CFC3] flex items-center justify-center gap-1 transition-all duration-100 border border-[#343A43] cursor-pointer outline-none"
                >
                  <Tv size={11} />
                  <span className="text-[9px] font-sans font-semibold">SRC</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={pressChannelDown}
                  className="py-1 rounded-lg bg-[#20242A] hover:bg-[#2C3139] active:scale-95 text-[#858D94] hover:text-white text-[8px] font-sans font-bold flex items-center justify-center cursor-pointer border border-[#2E333B]"
                  title="Назад"
                >
                  <RotateCcw size={9} />
                </button>
                <button
                  onClick={() => pressSelectChannel(1)}
                  className="py-1 rounded-lg bg-[#20242A] hover:bg-[#2C3139] active:scale-95 text-white text-[8px] font-sans font-bold flex items-center justify-center cursor-pointer border border-[#2E333B]"
                  title="Головна"
                >
                  <Home size={9} />
                </button>
                <button
                  onClick={pressPower}
                  className="py-1 rounded-lg bg-[#20242A] hover:bg-[#2C3139] active:scale-95 text-[#858D94] hover:text-white text-[8px] font-sans font-bold flex items-center justify-center cursor-pointer border border-[#2E333B]"
                  title="Вихід"
                >
                  EXIT
                </button>
              </div>
            </div>

            {/* 2. NUMERIC KEYPAD: Standard 3 Columns × 4 Rows (Cols 4-6) */}
            <div className="col-span-3 p-1.5 bg-[#121416] rounded-xl border border-[#23272D]">
              <div className="grid grid-cols-3 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                  const isAvailable = isCalcMode || num <= 4;
                  return (
                    <button
                      key={num}
                      disabled={!isAvailable}
                      onClick={() => pressSelectChannel(num)}
                      title={isCalcMode ? `Цифра ${num}` : `Канал ${num}`}
                      className={`h-5 rounded font-sans text-[10px] font-bold flex items-center justify-center transition-all duration-100 outline-none border ${
                        isAvailable
                          ? "bg-[#252930] hover:bg-[#333842] text-[#EFE9DF] border-[#363C46] active:scale-90 cursor-pointer"
                          : "bg-[#16181B] text-[#444850] border-transparent cursor-not-allowed opacity-30"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
                <button
                  onClick={() => pressSelectChannel(1)}
                  className="h-5 rounded bg-[#1D2024] hover:bg-[#2A2E35] text-[#858D94] font-sans text-[8px] font-semibold flex items-center justify-center border border-[#2C3138] cursor-pointer"
                >
                  TTX
                </button>
                <button
                  onClick={() => pressSelectChannel(0)}
                  className="h-5 rounded bg-[#252930] hover:bg-[#333842] text-[#EFE9DF] font-sans text-[10px] font-bold flex items-center justify-center border border-[#363C46] active:scale-90 cursor-pointer"
                  title="Цифра 0"
                >
                  0
                </button>
                <button
                  onClick={pressChannelDown}
                  className="h-5 rounded bg-[#1D2024] hover:bg-[#2A2E35] text-[#858D94] font-sans text-[8px] font-semibold flex items-center justify-center border border-[#2C3138] cursor-pointer"
                >
                  PRE
                </button>
              </div>
            </div>

            {/* 3. DUAL ROCKER VOL / MUTE / CH (Cols 7-9) */}
            <div className="col-span-3 flex items-center justify-center gap-2 border-l border-r border-[#292D33]/80 px-2">
              {/* VOL Rocker */}
              <div className="flex flex-col items-center bg-[#24282E] rounded-lg border border-[#343A43] overflow-hidden p-1 shadow-inner">
                <button
                  onClick={pressVolumeUp}
                  title="Гучність +"
                  className="w-6 py-0.5 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
                >
                  <ChevronUp size={11} strokeWidth={2.5} />
                </button>
                <span className="text-[7.5px] font-mono font-bold text-[#858D94] py-0.5">VOL</span>
                <button
                  onClick={pressVolumeDown}
                  title="Гучність -"
                  data-guide="remote-vol-down"
                  className="w-6 py-0.5 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
                >
                  <ChevronDown size={11} strokeWidth={2.5} />
                </button>
              </div>

              {/* MUTE Button */}
              <button
                onClick={pressMuteToggle}
                title="Вимкнути звук"
                className="p-2 rounded-xl bg-[#24282E] hover:bg-[#2F343D] active:scale-90 text-[#D5CFC3] flex items-center justify-center border border-[#343A43] cursor-pointer shadow-sm"
              >
                <VolumeX size={12} />
              </button>

              {/* CH Rocker */}
              <div className="flex flex-col items-center bg-[#24282E] rounded-lg border border-[#343A43] overflow-hidden p-1 shadow-inner">
                <button
                  onClick={pressChannelUp}
                  title="Канал вперед"
                  data-guide="remote-ch-up"
                  className="w-6 py-0.5 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
                >
                  <ChevronUp size={11} strokeWidth={2.5} />
                </button>
                <span className="text-[7.5px] font-mono font-bold text-[#858D94] py-0.5">CH</span>
                <button
                  onClick={pressChannelDown}
                  title="Канал назад"
                  className="w-6 py-0.5 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
                >
                  <ChevronDown size={11} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* 4. CIRCULAR D-PAD & COLOR BUTTONS (Cols 10-12) */}
            <div className="col-span-3 flex flex-col items-center gap-1.5 pl-1">
              <div className="relative h-16 w-16 rounded-full bg-[#121416] border border-[#2A2E35] flex items-center justify-center shadow-inner">
                {/* Up */}
                <button
                  onClick={pressChannelUp}
                  className="absolute top-0.5 left-1/2 -translate-x-1/2 h-4 w-6 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
                  title="Вгору"
                >
                  <ArrowUp size={10} />
                </button>
                {/* Down */}
                <button
                  onClick={pressChannelDown}
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-4 w-6 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
                  title="Вниз"
                >
                  <ArrowDown size={10} />
                </button>
                {/* Left */}
                <button
                  onClick={pressVolumeDown}
                  className="absolute left-0.5 top-1/2 -translate-y-1/2 h-6 w-4 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
                  title="Вліво"
                >
                  <ArrowLeft size={10} />
                </button>
                {/* Right */}
                <button
                  onClick={pressVolumeUp}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-4 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
                  title="Вправо"
                >
                  <ArrowRight size={10} />
                </button>
                {/* OK */}
                <button
                  onClick={() => pressSelectChannel(1)}
                  className="h-6 w-6 rounded-full bg-[#2A2F37] hover:bg-[#353B45] active:scale-90 text-white text-[9px] font-bold flex items-center justify-center border border-[#404753] cursor-pointer shadow-sm"
                  title="OK"
                >
                  <Check size={10} strokeWidth={2.5} />
                </button>
              </div>

              {/* Engineering 4 Color Buttons */}
              <div className="w-full grid grid-cols-4 gap-1 px-1">
                <button
                  onClick={() => pressSelectChannel(1)}
                  className="h-1.5 rounded bg-[#A82D24] hover:opacity-80 active:scale-90 cursor-pointer"
                  title="Red (A)"
                />
                <button
                  onClick={() => pressSelectChannel(2)}
                  className="h-1.5 rounded bg-[#1D5C42] hover:opacity-80 active:scale-90 cursor-pointer"
                  title="Green (B)"
                />
                <button
                  onClick={() => pressSelectChannel(3)}
                  className="h-1.5 rounded bg-[#C06A1B] hover:opacity-80 active:scale-90 cursor-pointer"
                  title="Yellow (C)"
                />
                <button
                  onClick={() => pressSelectChannel(4)}
                  className="h-1.5 rounded bg-[#1E3A8A] hover:opacity-80 active:scale-90 cursor-pointer"
                  title="Blue (D)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VERTICAL HANDSET LAYOUT (When drawer is closed, next to TV)
  // -------------------------------------------------------------
  return (
    <div className="relative flex flex-col items-center select-none transition-all duration-300 ease-out">
      {/* Handset Header */}
      <div className="w-44 flex items-center justify-between font-display text-xs text-ink-muted pb-1.5 px-1 whitespace-nowrap">
        <span className="flex items-center gap-1.5 font-bold text-ink text-sm">
          <span className="h-2 w-2 rounded-full bg-accent-blue shrink-0" />
          <span>{t("workbench.remoteHandsetTitle", "Пульт ДК")}</span>
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-paper border border-paper-border text-ink-muted font-mono">
          BN59-01315Q
        </span>
      </div>

      {/* Vertical Handset Body */}
      <div className="w-44 h-[470px] bg-[#181B1E] rounded-3xl border-2 border-[#101214] p-3 shadow-[0_16px_40px_rgba(26,29,32,0.16)] relative flex flex-col items-center select-none shrink-0">
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
        <div className="w-full flex items-center justify-between border-b border-[#292D33] pb-1.5 mb-2.5 pt-0.5 text-[9px] font-mono font-medium text-[#858D94]">
          <span className="tracking-wider font-bold">BN59-01315Q</span>
          <div className="flex items-center gap-1">
            <Radio
              size={11}
              className={isIrEmitting ? "text-accent-break animate-ping" : "text-[#4A5059]"}
            />
            <span className="text-[9px]">38 kHz ІЧ</span>
          </div>
        </div>

        {/* 1. TOP ROW: Power (Red) & Source Button */}
        <div className="w-full grid grid-cols-2 gap-1.5 mb-2.5">
          <button
            onClick={pressPower}
            title="Живлення (Power)"
            className="py-1.5 rounded-xl bg-accent-break hover:bg-accent-break-hover active:scale-95 text-white flex items-center justify-center gap-1 transition-all duration-100 shadow-sm border border-red-600/70 cursor-pointer outline-none"
          >
            <Power size={12} strokeWidth={2.4} />
            <span className="text-[10px] font-sans font-bold">PWR</span>
          </button>

          <button
            onClick={() => pressSelectChannel(1)}
            title="Джерело сигналу"
            className="py-1.5 rounded-xl bg-[#24282E] hover:bg-[#2F343D] active:scale-95 text-[#D5CFC3] flex items-center justify-center gap-1 transition-all duration-100 border border-[#343A43] cursor-pointer outline-none"
          >
            <Tv size={11} strokeWidth={1.75} />
            <span className="text-[10px] font-sans font-semibold">SOURCE</span>
          </button>
        </div>

        {/* 2. NUMERIC KEYPAD: 3 Columns × 4 Rows */}
        <div className="w-full grid grid-cols-3 gap-1 p-1.5 bg-[#121416] rounded-2xl border border-[#23272D] mb-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const isAvailable = isCalcMode || num <= 4;
            return (
              <button
                key={num}
                disabled={!isAvailable}
                onClick={() => pressSelectChannel(num)}
                title={isCalcMode ? `Цифра ${num}` : `Канал ${num}`}
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
            onClick={() => pressSelectChannel(1)}
            className="h-6 rounded-md bg-[#1D2024] hover:bg-[#2A2E35] text-[#858D94] font-sans text-[9px] font-semibold flex items-center justify-center border border-[#2C3138] cursor-pointer"
          >
            TTX
          </button>
          <button
            onClick={() => pressSelectChannel(0)}
            className="h-6 rounded-md bg-[#252930] hover:bg-[#333842] text-[#EFE9DF] font-sans text-xs font-bold flex items-center justify-center border border-[#363C46] cursor-pointer"
            title="Цифра 0"
          >
            0
          </button>
          <button
            onClick={pressChannelDown}
            className="h-6 rounded-md bg-[#1D2024] hover:bg-[#2A2E35] text-[#858D94] font-sans text-[9px] font-semibold flex items-center justify-center border border-[#2C3138] cursor-pointer"
          >
            PRE
          </button>
        </div>

        {/* 3. DUAL ROCKER SECTION: Distinctive Engineering VOL and CH Bars */}
        <div className="w-full grid grid-cols-3 gap-1.5 items-center px-0.5 mb-2.5">
          {/* Left Rocker: Volume Bar */}
          <div className="flex flex-col items-center bg-[#24282E] rounded-xl border border-[#343A43] overflow-hidden p-0.5">
            <button
              onClick={pressVolumeUp}
              title="Гучність +"
              className="w-full py-1 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
            >
              <Volume2 size={12} strokeWidth={2} />
            </button>
            <span className="text-[8px] font-sans font-bold text-[#858D94] py-0.5">VOL</span>
            <button
              onClick={pressVolumeDown}
              title="Гучність -"
              className="w-full py-1 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
            >
              <Volume1 size={12} strokeWidth={2} />
            </button>
          </div>

          {/* Center Column: MUTE */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={pressMuteToggle}
              title="Вимкнути звук"
              className="w-full py-1.5 rounded-lg bg-[#24282E] hover:bg-[#2F343D] active:scale-90 text-[#D5CFC3] flex items-center justify-center border border-[#343A43] cursor-pointer"
            >
              <VolumeX size={12} strokeWidth={1.75} />
            </button>
            <span className="text-[7px] font-sans font-bold text-[#6C747E]">MUTE</span>
          </div>

          {/* Right Rocker: Channel Bar */}
          <div className="flex flex-col items-center bg-[#24282E] rounded-xl border border-[#343A43] overflow-hidden p-0.5">
            <button
              onClick={pressChannelUp}
              title="Канал вперед"
              className="w-full py-1 flex items-center justify-center hover:bg-[#323842] active:scale-90 text-[#EFE9DF] cursor-pointer"
            >
              <ChevronUp size={13} strokeWidth={2} />
            </button>
            <span className="text-[8px] font-sans font-bold text-[#858D94] py-0.5">CH</span>
            <button
              onClick={pressChannelDown}
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
              onClick={pressChannelUp}
              className="absolute top-1 left-1/2 -translate-x-1/2 h-6 w-8 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
              title="Вгору"
            >
              <ArrowUp size={12} />
            </button>
            {/* Down */}
            <button
              onClick={pressChannelDown}
              className="absolute bottom-1 left-1/2 -translate-x-1/2 h-6 w-8 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
              title="Вниз"
            >
              <ArrowDown size={12} />
            </button>
            {/* Left */}
            <button
              onClick={pressVolumeDown}
              className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-6 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
              title="Вліво"
            >
              <ArrowLeft size={12} />
            </button>
            {/* Right */}
            <button
              onClick={pressVolumeUp}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-6 flex items-center justify-center text-[#858D94] hover:text-white active:scale-90 cursor-pointer"
              title="Вправо"
            >
              <ArrowRight size={12} />
            </button>
            {/* Center OK button */}
            <button
              onClick={() => pressSelectChannel(1)}
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
            onClick={pressChannelDown}
            className="py-1 rounded-lg bg-[#20242A] hover:bg-[#2C3139] active:scale-90 text-[#858D94] hover:text-white text-[8px] font-sans font-bold flex items-center justify-center gap-0.5 border border-[#2E333B] cursor-pointer"
            title="Назад"
          >
            <RotateCcw size={10} />
            <span>RETURN</span>
          </button>
          <button
            onClick={() => pressSelectChannel(1)}
            className="py-1 rounded-lg bg-[#20242A] hover:bg-[#2C3139] active:scale-90 text-white text-[8px] font-sans font-bold flex items-center justify-center gap-0.5 border border-[#2E333B] cursor-pointer"
            title="Головна"
          >
            <Home size={10} />
            <span>HOME</span>
          </button>
          <button
            onClick={pressPower}
            className="py-1 rounded-lg bg-[#20242A] hover:bg-[#2C3139] active:scale-90 text-[#858D94] hover:text-white text-[8px] font-sans font-bold flex items-center justify-center border border-[#2E333B] cursor-pointer"
            title="Вихід"
          >
            <span>EXIT</span>
          </button>
        </div>

        {/* 6. 4 COLOR BUTTONS (A, B, C, D) */}
        <div className="w-full grid grid-cols-4 gap-1 py-1 border-t border-[#292D33]">
          <button
            onClick={() => pressSelectChannel(1)}
            className="h-2 rounded bg-[#A82D24] hover:opacity-80 active:scale-90 cursor-pointer"
            title="Red (A)"
          />
          <button
            onClick={() => pressSelectChannel(2)}
            className="h-2 rounded bg-[#1D5C42] hover:opacity-80 active:scale-90 cursor-pointer"
            title="Green (B)"
          />
          <button
            onClick={() => pressSelectChannel(3)}
            className="h-2 rounded bg-[#C06A1B] hover:opacity-80 active:scale-90 cursor-pointer"
            title="Yellow (C)"
          />
          <button
            onClick={() => pressSelectChannel(4)}
            className="h-2 rounded bg-[#1E3A8A] hover:opacity-80 active:scale-90 cursor-pointer"
            title="Blue (D)"
          />
        </div>

        {/* Bottom Brand Emboss */}
        <div className="pt-1.5 text-center">
          <span className="font-display tracking-[0.25em] text-[9px] font-bold text-[#646A74]">
            SMART REMOTE
          </span>
        </div>
      </div>
    </div>
  );
};
