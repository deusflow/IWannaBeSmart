/**
 * @file apps/web/src/components/workbench/IotGarageBlueprintDevice.tsx
 * @description Station 03: Interactive IoT Garage Gate Hardware Device.
 * Visual garage shutter, limit switches (endstops), IR obstacle beam,
 * motor relay interlock, and live asynchronous EventBus stream.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Radio,
  Power,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Terminal,
  Activity,
} from "lucide-react";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";

export const IotGarageBlueprintDevice: React.FC = () => {
  const { t } = useTranslation();
  const {
    iotState,
    triggerIotRemote,
    triggerIotObstacle,
    resetIotState,
  } = useWorkbenchStore(
    useShallow((s) => ({
      iotState: s.iotState,
      triggerIotRemote: s.triggerIotRemote,
      triggerIotObstacle: s.triggerIotObstacle,
      resetIotState: s.resetIotState,
    }))
  );

  const [isSimulatingObstacle, setIsSimulatingObstacle] = useState(false);

  const handleToggleObstacle = () => {
    const next = !isSimulatingObstacle;
    setIsSimulatingObstacle(next);
    triggerIotObstacle(next);
  };

  const isRelayOn = iotState.relayPower;
  const isEmergency = iotState.safetyInterlockEngaged;
  const isOpening = iotState.doorState === "OPENING";
  const isClosing = iotState.doorState === "CLOSING";

  return (
    <div
      id="iot-garage-device"
      className="w-full rounded-2xl bg-[#1E2227] border-2 border-[#1E2227]/30 shadow-xl overflow-hidden text-white font-sans select-none flex flex-col"
    >
      {/* ── Rack Header ── */}
      <div className="bg-[#15181C] px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isEmergency
                  ? "bg-rose-500"
                  : isRelayOn
                  ? "bg-emerald-400"
                  : "bg-sky-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isEmergency
                  ? "bg-rose-500"
                  : isRelayOn
                  ? "bg-emerald-400"
                  : "bg-sky-400"
              }`}
            />
          </span>
          <div>
            <h2 className="font-mono text-xs font-bold tracking-wider text-white/90 uppercase flex items-center gap-2">
              <span>IOT GATE CONTROLLER</span>
              <span className="text-[10px] text-white/40">• MOD-03</span>
            </h2>
            <p className="font-mono text-[10px] text-white/50 tracking-tight">
              EVENT-DRIVEN BUS • ASYNC RELAY INTERLOCK
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          {/* Relay Status */}
          <div
            className={`px-2 py-0.5 rounded border flex items-center gap-1.5 transition-colors ${
              isRelayOn
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                : "bg-white/5 border-white/10 text-white/40"
            }`}
          >
            <Power size={11} className={isRelayOn ? "text-emerald-400" : "text-white/30"} />
            <span>RELAY: {isRelayOn ? "ARMED" : "CUT"}</span>
          </div>

          {/* Safety Interlock */}
          <div
            className={`px-2 py-0.5 rounded border flex items-center gap-1.5 transition-colors ${
              isEmergency
                ? "bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse"
                : "bg-white/5 border-white/10 text-white/40"
            }`}
          >
            {isEmergency ? (
              <ShieldAlert size={11} className="text-rose-400" />
            ) : (
              <ShieldCheck size={11} className="text-white/30" />
            )}
            <span>{isEmergency ? "SAFETY ENGAGED" : "NOMINAL"}</span>
          </div>
        </div>
      </div>

      {/* ── Main Mechanical Schematic Section ── */}
      <div className="p-4 sm:p-5 flex flex-col gap-4 bg-gradient-to-b from-[#1A1D21] to-[#14171A]">
        {/* Physical Garage Door Bay */}
        <div className="relative w-full h-56 bg-[#0E1013] rounded-xl border border-white/10 p-3 flex flex-col justify-between overflow-hidden shadow-inner">
          {/* Upper Limit Switch (TOP_OPEN) */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] font-mono">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full transition-all ${
                  iotState.limitSwitchOpen
                    ? "bg-emerald-400 shadow-[0_0_8px_#10B981]"
                    : "bg-white/20"
                }`}
              />
              <span className={iotState.limitSwitchOpen ? "text-emerald-300 font-bold" : "text-white/40"}>
                UPPER LIMIT (OPEN 100%)
              </span>
            </div>
            {/* Motor direction indicator */}
            <div className="flex items-center gap-1.5 text-white/60">
              {isOpening && (
                <span className="flex items-center gap-1 text-sky-400 animate-pulse font-bold">
                  <ArrowUp size={12} /> {t("iotStation.motorUp", "MOTOR UP")}
                </span>
              )}
              {isClosing && (
                <span className="flex items-center gap-1 text-amber-400 animate-pulse font-bold">
                  <ArrowDown size={12} /> {t("iotStation.motorDown", "MOTOR DOWN")}
                </span>
              )}
              {!isOpening && !isClosing && (
                <span className="text-white/30">MOTOR IDLE</span>
              )}
            </div>
          </div>

          {/* Gate Visual Shutter Bay */}
          <div className="relative flex-1 my-2 bg-[#171A1F] rounded-lg border border-white/5 overflow-hidden flex flex-col justify-start">
            {/* Animated Slat Door Height */}
            <div
              className="w-full bg-gradient-to-b from-[#3A4048] to-[#252930] border-b-4 border-amber-500/70 transition-all duration-300 flex flex-col justify-end"
              style={{
                height: `${Math.max(10, 100 - iotState.positionPercent)}%`,
              }}
            >
              {/* Slats Texture */}
              <div className="w-full h-full flex flex-col justify-between p-1.5 opacity-60">
                <div className="h-1 bg-white/20 rounded-full w-full mb-1" />
                <div className="h-1 bg-white/20 rounded-full w-full mb-1" />
                <div className="h-1 bg-white/20 rounded-full w-full mb-1" />
                <div className="h-1 bg-white/20 rounded-full w-full" />
              </div>
            </div>

            {/* Optical IR Obstacle Sensor Beam Line */}
            <div className="absolute bottom-6 left-0 right-0 h-4 flex items-center justify-between px-3 pointer-events-none">
              {/* Left IR TX */}
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-600/80 border border-rose-400 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-rose-200" />
                </span>
                <span className="text-[9px] font-mono text-rose-400">IR-TX</span>
              </div>

              {/* Laser Beam Crossing */}
              <div className="flex-1 mx-2 relative h-[2px]">
                <div
                  className={`w-full h-full transition-all ${
                    isSimulatingObstacle || iotState.obstacleDetected
                      ? "bg-rose-500 shadow-[0_0_10px_#EF4444] animate-pulse"
                      : "bg-rose-500/40 border-t border-dashed border-rose-400/50"
                  }`}
                />
                {(isSimulatingObstacle || iotState.obstacleDetected) && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-rose-950 border border-rose-500 text-rose-300 font-mono text-[9px] font-bold tracking-wider uppercase whitespace-nowrap shadow-md">
                    ⚠️ OBSTACLE TRIPPED
                  </div>
                )}
              </div>

              {/* Right IR RX */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-rose-400">IR-RX</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-600/80 border border-rose-400 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-rose-200" />
                </span>
              </div>
            </div>
          </div>

          {/* Lower Limit Switch (BOTTOM_CLOSED) */}
          <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] font-mono">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full transition-all ${
                  iotState.limitSwitchClosed
                    ? "bg-sky-400 shadow-[0_0_8px_#38BDF8]"
                    : "bg-white/20"
                }`}
              />
              <span className={iotState.limitSwitchClosed ? "text-sky-300 font-bold" : "text-white/40"}>
                LOWER LIMIT (CLOSED 0%)
              </span>
            </div>
            <div className="text-[10px] text-white/50">
              STATE: <span className="font-bold text-white/90">{iotState.doorState}</span>
            </div>
          </div>
        </div>

        {/* ── Interactive Physical Controls Bar ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
          {/* Remote Button Click */}
          <button
            type="button"
            id="btn-iot-remote-click"
            onClick={triggerIotRemote}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Radio size={14} className="text-white" />
            <span>{t("iotStation.remoteBtn", "⚡ ПУЛЬТ (CLICK)")}</span>
          </button>

          {/* Simulate Obstacle Toggle */}
          <button
            type="button"
            id="btn-iot-simulate-obstacle"
            onClick={handleToggleObstacle}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-bold transition-all border shadow-md active:scale-95 cursor-pointer ${
              isSimulatingObstacle || iotState.obstacleDetected
                ? "bg-rose-600 border-rose-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                : "bg-white/10 hover:bg-white/15 border-white/15 text-white/80"
            }`}
          >
            <AlertTriangle size={14} className={isSimulatingObstacle ? "text-white" : "text-amber-400"} />
            <span>
              {isSimulatingObstacle
                ? t("iotStation.obstacleActive", "🛑 ЗАВАДА АКТИВНА")
                : t("iotStation.tripObstacle", "⚠️ ПЕРЕШКОДА (IR BEAM)")}
            </span>
          </button>

          {/* Reset Gate State */}
          <button
            type="button"
            id="btn-iot-reset"
            onClick={() => {
              setIsSimulatingObstacle(false);
              resetIotState();
            }}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>{t("iotStation.resetBtn", "СКИДАННЯ ВОРІТ")}</span>
          </button>
        </div>

        {/* ── Live Asynchronous EventBus Stream ── */}
        <div className="bg-[#111317] rounded-xl border border-white/10 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-white/10 pb-1.5 text-white/70">
            <span className="flex items-center gap-1.5 text-white/80 font-bold">
              <Terminal size={12} className="text-sky-400" />
              <span>LIVE EVENTBUS MONITOR</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <Activity size={11} className="animate-pulse" />
              <span>LISTENING</span>
            </span>
          </div>

          <div
            id="iot-eventbus-log"
            className="h-28 overflow-y-auto font-mono text-[10px] space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/20"
          >
            {iotState.eventBusLog.slice(-8).map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-2 p-1 rounded bg-white/5 border border-white/5"
              >
                <span className="text-white/40 text-[9px]">{ev.timestamp}</span>
                <span
                  className={`px-1.5 py-0.2 rounded font-bold text-[9px] uppercase tracking-wider ${
                    ev.topic.includes("OBSTACLE") || ev.topic.includes("SAFETY")
                      ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                      : ev.topic.includes("MOTOR")
                      ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                      : "bg-sky-950 text-sky-300 border border-sky-500/40"
                  }`}
                >
                  {ev.topic}
                </span>
                <span className="text-white/60 truncate flex-1">
                  {typeof ev.payload === "object" ? JSON.stringify(ev.payload) : String(ev.payload ?? "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
