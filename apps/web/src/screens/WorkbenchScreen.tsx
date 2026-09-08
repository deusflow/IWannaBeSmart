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

  // Active state for side-by-side layout
  const isDrawerActive = isDrawerOpen || isDrawerPinned;

  return (
    <div className="min-h-screen w-full bg-paper text-ink flex flex-col font-sans relative overflow-x-hidden select-none">
      {/* Background Millimeter Vellum Drafting Grid */}
      <div className="absolute inset-0 bg-notebook-grid opacity-75 pointer-events-none" />

      {/* Top Engineering Navigation Bar */}
      <header className="relative z-30 h-14 border-b border-paper-border/80 bg-paper-subtle/90 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between">
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
              setIsDrawerOpen(!isDrawerOpen);
            }}
            aria-label="Toggle Code and Schematic"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-display text-sm font-semibold shadow-paper-sm transition-all duration-200 active:scale-[0.98] cursor-pointer outline-none ${
              isDrawerActive
                ? "bg-accent-blue-light text-accent-blue border-accent-blue-border"
                : "bg-paper-subtle hover:bg-paper border-paper-border hover:border-accent-blue/40 text-ink"
            }`}
          >
            <BookOpen size={14} strokeWidth={2} className="text-accent-blue" />
            <span className="hidden sm:inline">Code and Schematic</span>
            <Badge variant="accent" size="sm" mono className="text-[9px]">
              {isDrawerPinned ? "DOCKED" : isDrawerOpen ? "OPEN" : "EXPAND"}
            </Badge>
          </button>
        </div>
      </header>

      {/* Main Drafting Canvas: Side-by-Side Dynamic Workbench */}
      <main className="relative z-10 flex-1 flex flex-col justify-center p-3 sm:p-5 lg:p-6 w-full max-w-[1720px] mx-auto overflow-hidden">
        <div
          className={`w-full flex transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isDrawerActive
              ? "flex-col lg:flex-row items-center lg:items-start justify-center gap-5 lg:gap-6"
              : "flex-col items-center justify-center gap-6"
          }`}
        >
          {/* Left Column (or Center when Drawer Closed): Television & Remote Stage */}
          <div
            className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center ${
              isDrawerActive
                ? "w-full lg:w-[54%] xl:w-[56%] gap-3.5"
                : "w-full max-w-5xl gap-6"
            }`}
          >
            {/* 1. When Drawer is CLOSED: TV centered + Remote vertically on right */}
            {!isDrawerActive ? (
              <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 py-2">
                {/* Widescreen Modern Television */}
                <div className="flex-1 w-full max-w-3xl xl:max-w-4xl">
                  <TVBlueprintDevice
                    tvState={tvState}
                    onTogglePower={handlePowerPress}
                    onNextChannel={handleChannelUp}
                    onPrevChannel={handleChannelDown}
                    compact={false}
                  />
                </div>

                {/* Line-of-sight indicator connecting remote to TV */}
                <div className="hidden lg:flex flex-col items-center justify-center text-[9px] font-mono text-ink-subtle px-1">
                  <div className="border-t border-dashed border-ink-subtle/50 w-8" />
                  <span className="text-[8px] tracking-tight py-0.5">38kHz IR</span>
                  <div className="border-t border-dashed border-ink-subtle/50 w-8" />
                </div>

                {/* Vertical Samsung Remote */}
                <div className="shrink-0 pt-2 lg:pt-0">
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
              /* 2. When Drawer is OPEN: TV moved to the left, Remote lying horizontally underneath! */
              <div className="w-full flex flex-col items-center gap-3 py-1">
                {/* Modern TV in Left Column */}
                <div className="w-full">
                  <TVBlueprintDevice
                    tvState={tvState}
                    onTogglePower={handlePowerPress}
                    onNextChannel={handleChannelUp}
                    onPrevChannel={handleChannelDown}
                    compact={true}
                  />
                </div>

                {/* Samsung Remote Lying Flat Horizontally Directly Underneath TV */}
                <div className="w-full">
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

            {/* Bottom Telemetry & Status Pill */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-ink-muted pt-1 w-full">
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-paper-subtle border border-paper-border text-[11px] shadow-paper-sm">
                <span className="text-accent-blue font-bold">BENCH STATUS:</span>
                <span>
                  {tvState.power
                    ? `Signal Synced • CH 0${tvState.channel}: ${tvState.channelNames[tvState.channel]}`
                    : "Mains Connected. Press [PWR] on Samsung Remote."}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Code & Schematics Drawer that descends smoothly beside the TV & Remote */}
          {isDrawerActive && (
            <div className="w-full lg:w-[46%] xl:w-[44%] lg:max-w-[740px] h-[calc(100vh-5.5rem)] min-h-[560px] animate-in slide-in-from-top-6 duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <EngineeringDrawer
                isOpen={true}
                isPinned={isDrawerPinned}
                onTogglePin={() => setIsDrawerPinned(!isDrawerPinned)}
                onClose={() => {
                  setIsDrawerOpen(false);
                  setIsDrawerPinned(false);
                }}
                level={tvLevel01}
                inline={true}
              />
            </div>
          )}
        </div>
      </main>

      {/* Floating Right-Edge Marker Label (When drawer is closed) */}
      {!isDrawerActive && (
        <aside className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden sm:block">
          <button
            onClick={() => setIsDrawerOpen(true)}
            title="Open Code &amp; Hardware Schematics"
            className="bg-paper-subtle hover:bg-paper border-l border-y border-paper-border text-ink font-display text-xs font-bold py-4 px-2.5 rounded-l-xl shadow-[-4px_2px_12px_rgba(26,29,32,0.06)] hover:border-accent-blue/40 transition-all duration-200 active:scale-95 cursor-pointer outline-none [writing-mode:vertical-rl] flex items-center gap-2 tracking-wider text-accent-blue"
          >
            <Terminal size={12} strokeWidth={2} className="rotate-90" />
            <span>Code and Schematic</span>
          </button>
        </aside>
      )}
    </div>
  );
};
