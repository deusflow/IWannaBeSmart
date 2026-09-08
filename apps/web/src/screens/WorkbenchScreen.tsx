import React, { useState } from "react";
import { tvLevel01, type TVState } from "@iw/sim-engine";
import { BlueprintStationSwitcher } from "../components/workbench/BlueprintStationSwitcher";
import { TVBlueprintDevice } from "../components/workbench/TVBlueprintDevice";
import { RemoteBlueprintDevice } from "../components/workbench/RemoteBlueprintDevice";
import { EngineeringDrawer } from "../components/workbench/EngineeringDrawer";
import { Badge } from "@iw/ui";
import { Sparkles, Terminal, BookOpen } from "lucide-react";

export const WorkbenchScreen: React.FC = () => {
  const [stationId, setStationId] = useState("tv");
  const [tvState, setTvState] = useState<TVState>({ ...tvLevel01.tvInitialState });
  const [isIrEmitting, setIsIrEmitting] = useState(false);
  const [lastOpcode, setLastOpcode] = useState<string>("STANDBY // IDLE");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerPinned, setIsDrawerPinned] = useState(false);

  // Optical IR packet transmission pulse
  const triggerIrPulse = (opcodeText: string, callback: () => void) => {
    setIsIrEmitting(true);
    setLastOpcode(opcodeText);
    setTvState((prev) => ({ ...prev, irSignalPulse: true }));

    setTimeout(() => {
      setIsIrEmitting(false);
      setTvState((prev) => ({ ...prev, irSignalPulse: false }));
    }, 220);

    callback();
  };

  // Remote Actions
  const handlePowerPress = () => {
    triggerIrPulse("NEC: 0x00FF (POWER_TOGGLE)", () => {
      setTvState((prev) => ({ ...prev, power: !prev.power }));
    });
  };

  const handleChannelUp = () => {
    triggerIrPulse("NEC: 0x001A (CH_UP)", () => {
      setTvState((prev) => {
        if (!prev.power) return prev;
        const next = prev.channel >= prev.maxChannels ? 1 : prev.channel + 1;
        return { ...prev, channel: next };
      });
    });
  };

  const handleChannelDown = () => {
    triggerIrPulse("NEC: 0x001B (CH_DOWN)", () => {
      setTvState((prev) => {
        if (!prev.power) return prev;
        const prevChan = prev.channel <= 1 ? prev.maxChannels : prev.channel - 1;
        return { ...prev, channel: prevChan };
      });
    });
  };

  const handleVolumeUp = () => {
    triggerIrPulse("NEC: 0x002A (VOL_UP)", () => {
      setTvState((prev) => {
        if (!prev.power) return prev;
        return { ...prev, volume: Math.min(30, prev.volume + 2), isMuted: false };
      });
    });
  };

  const handleVolumeDown = () => {
    triggerIrPulse("NEC: 0x002B (VOL_DOWN)", () => {
      setTvState((prev) => {
        if (!prev.power) return prev;
        return { ...prev, volume: Math.max(0, prev.volume - 2) };
      });
    });
  };

  const handleMuteToggle = () => {
    triggerIrPulse("NEC: 0x000C (MUTE_TOGGLE)", () => {
      setTvState((prev) => {
        if (!prev.power) return prev;
        return { ...prev, isMuted: !prev.isMuted };
      });
    });
  };

  const handleSelectChannel = (ch: number) => {
    triggerIrPulse(`NEC: 0x000${ch} (CH_DIRECT)`, () => {
      setTvState((prev) => {
        if (!prev.power) return prev;
        return { ...prev, channel: ch };
      });
    });
  };

  // When drawer is open or pinned, adapt remote orientation under TV
  const isDrawerActive = isDrawerOpen || isDrawerPinned;

  return (
    <div className="min-h-screen w-full bg-paper text-ink flex flex-col font-sans relative overflow-x-hidden select-none">
      {/* Background Millimeter Vellum Drafting Grid */}
      <div className="absolute inset-0 bg-notebook-grid opacity-75 pointer-events-none" />

      {/* Top Engineering Navigation Bar */}
      <header className="relative z-30 h-14 border-b border-paper-border/80 bg-paper-subtle/80 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Technical Station Index */}
        <div className="flex items-center gap-3 sm:gap-4">
          <BlueprintStationSwitcher
            currentStationId={stationId}
            onSelectStation={setStationId}
          />

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-ink-subtle">
            <span>•</span>
            <span className="text-ink-muted font-display">{tvLevel01.title}</span>
          </div>
        </div>

        {/* Center: Live Telemetry Bus */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-lg bg-paper border border-paper-border font-mono text-[11px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isIrEmitting ? "bg-accent-break animate-ping" : "bg-ink-subtle"
              }`}
            />
            CARRIER: 38.0 kHz
          </span>
          <span className="text-ink-subtle">|</span>
          <span className="text-accent-blue font-semibold">{lastOpcode}</span>
        </div>

        {/* Right: Telemetry & Drawer Open Trigger */}
        <div className="flex items-center gap-3">
          {/* XP Stamp */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-paper border border-paper-border text-xs font-mono text-ink">
            <Sparkles size={12} strokeWidth={1.75} className="text-accent-signal" />
            <span className="font-semibold text-accent-signal">0</span>
            <span className="text-ink-subtle text-[10px]">XP</span>
          </div>

          {/* Drawer Trigger Button in Header */}
          <button
            onClick={() => {
              setIsDrawerOpen(true);
            }}
            aria-label="Toggle Code & Schematics"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold shadow-paper-sm transition-all duration-150 active:scale-[0.98] cursor-pointer outline-none ${
              isDrawerActive
                ? "bg-accent-blue-light text-accent-blue border-accent-blue-border"
                : "bg-paper-subtle hover:bg-paper border-paper-border hover:border-accent-blue/40 text-ink"
            }`}
          >
            <BookOpen size={13} strokeWidth={1.75} className="text-accent-blue" />
            <span className="hidden sm:inline">CODE &amp; SCHEMATICS</span>
            <Badge variant="accent" size="sm" mono className="text-[9px]">
              {isDrawerPinned ? "DOCK" : "EXPAND"}
            </Badge>
          </button>
        </div>
      </header>

      {/* Main Drafting Canvas (Stage adapts seamlessly when drawer is pinned) */}
      <main
        className={`relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
          isDrawerPinned ? "xl:mr-[780px] lg:mr-[720px]" : ""
        }`}
      >
        {/* Drafting Calibration Marks */}
        <div className="w-full max-w-5xl flex justify-between text-[9px] font-mono text-ink-subtle/50 pb-2 pointer-events-none hidden sm:flex">
          <span>SCALE: 1:1 // BRAUN GERMANIUM ARCHITECTURE</span>
          <span>CALIBRATED VIEWPORT // LEVEL 01</span>
        </div>

        {/* Device Presentation Stage */}
        <div className="w-full max-w-5xl flex flex-col items-center justify-center gap-6">
          {/* Layout Variant A: SIDE-BY-SIDE (When drawer is closed) */}
          {!isDrawerActive ? (
            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 py-2">
              {/* CRT Television (Expanded size) */}
              <div className="flex-1 w-full max-w-2xl">
                <TVBlueprintDevice
                  tvState={tvState}
                  onTogglePower={handlePowerPress}
                  onNextChannel={handleChannelUp}
                  onPrevChannel={handleChannelDown}
                />
              </div>

              {/* Optical Line of Sight Ray */}
              <div className="hidden lg:flex flex-col items-center justify-center gap-1.5 text-ink-subtle font-mono text-[9px] select-none shrink-0">
                <span className="text-[8px] uppercase tracking-wider text-[#858D94]">
                  {isIrEmitting ? "PULSE 38kHz" : "LINE OF SIGHT"}
                </span>
                <div
                  className={`w-12 h-0.5 border-t-2 border-dashed transition-all duration-150 ${
                    isIrEmitting
                      ? "border-accent-break scale-x-110"
                      : "border-paper-border/80"
                  }`}
                />
                <span>~1.2 M</span>
              </div>

              {/* Slender Compact Remote */}
              <div className="shrink-0">
                <RemoteBlueprintDevice
                  isIrEmitting={isIrEmitting}
                  orientation="vertical"
                  onPowerPress={handlePowerPress}
                  onChannelUp={handleChannelUp}
                  onChannelDown={handleChannelDown}
                  onVolumeUp={handleVolumeUp}
                  onVolumeDown={handleVolumeDown}
                  onMuteToggle={handleMuteToggle}
                  onSelectChannel={handleSelectChannel}
                />
              </div>
            </div>
          ) : (
            /* Layout Variant B: HORIZONTAL BENCH CONSOLE (When drawer is open/pinned) */
            <div className="w-full flex flex-col items-center gap-4 py-1 animate-in fade-in duration-200">
              {/* CRT Television */}
              <div className="w-full max-w-2xl">
                <TVBlueprintDevice
                  tvState={tvState}
                  onTogglePower={handlePowerPress}
                  onNextChannel={handleChannelUp}
                  onPrevChannel={handleChannelDown}
                />
              </div>

              {/* Elongated Horizontal Remote Bar Lying Under TV */}
              <div className="w-full max-w-2xl">
                <RemoteBlueprintDevice
                  isIrEmitting={isIrEmitting}
                  orientation="horizontal"
                  onPowerPress={handlePowerPress}
                  onChannelUp={handleChannelUp}
                  onChannelDown={handleChannelDown}
                  onVolumeUp={handleVolumeUp}
                  onVolumeDown={handleVolumeDown}
                  onMuteToggle={handleMuteToggle}
                  onSelectChannel={handleSelectChannel}
                />
              </div>
            </div>
          )}

          {/* Bottom Telemetry & Interaction Hint */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-ink-muted pt-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-paper-subtle border border-paper-border text-[11px] shadow-paper-sm">
              <span className="text-accent-blue font-bold">BENCH TELEMETRY:</span>
              <span>
                {tvState.power
                  ? `Active Channel: ${tvState.channelNames[tvState.channel]} • Vol: ${tvState.volume}`
                  : "Mains Connected (Standby). Click [PWR] on remote to boot CRT."}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Right-Edge Marker Label (Quick Access to Engineering Drawer) */}
      {!isDrawerPinned && (
        <aside className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden sm:block">
          <button
            onClick={() => setIsDrawerOpen(true)}
            title="Open Code &amp; Hardware Schematics"
            className="bg-paper-subtle hover:bg-paper border-l border-y border-paper-border text-ink font-mono text-[11px] font-bold py-4 px-2 rounded-l-xl shadow-[-4px_2px_12px_rgba(26,29,32,0.06)] hover:border-accent-blue/40 transition-all duration-200 active:scale-95 cursor-pointer outline-none [writing-mode:vertical-rl] flex items-center gap-2 tracking-widest text-accent-blue"
          >
            <Terminal size={12} strokeWidth={2} className="rotate-90" />
            <span>CODE &amp; SCHEMATICS</span>
          </button>
        </aside>
      )}

      {/* Sliding / Floating Engineering Sheet Drawer with Pin Capability */}
      <EngineeringDrawer
        isOpen={isDrawerActive}
        isPinned={isDrawerPinned}
        onTogglePin={() => setIsDrawerPinned(!isDrawerPinned)}
        onClose={() => {
          setIsDrawerOpen(false);
          setIsDrawerPinned(false);
        }}
        level={tvLevel01}
      />
    </div>
  );
};
