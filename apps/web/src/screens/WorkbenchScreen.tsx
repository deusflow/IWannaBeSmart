import React, { useState } from "react";
import { tvLevel01 } from "@iw/sim-engine";
import { useWorkbenchStore } from "../store/workbenchStore";
import { BlueprintStationSwitcher } from "../components/workbench/BlueprintStationSwitcher";
import { TVBlueprintDevice } from "../components/workbench/TVBlueprintDevice";
import { RemoteBlueprintDevice } from "../components/workbench/RemoteBlueprintDevice";
import { EngineeringDrawer } from "../components/workbench/EngineeringDrawer";
import { Badge } from "@iw/ui";
import { Terminal, BookOpen } from "lucide-react";

/**
 * Custom tactile XP Token / Coin SVG icon
 * Replaces generic AI sparkles with an engraved physical engineering blueprint token.
 */
const XpTokenIcon: React.FC<{ className?: string; size?: number }> = ({
  className = "w-4 h-4",
  size = 15,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Outer engraved coin rim */}
    <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
    {/* Inner dashed blueprint drafting circle */}
    <circle
      cx="10"
      cy="10"
      r="6"
      stroke="currentColor"
      strokeWidth="1"
      strokeDasharray="1.5 1.5"
      className="opacity-70"
    />
    {/* Center tactile engraved 4-point star token stamp */}
    <path
      d="M10 5.2L11.3 8.7L14.8 10L11.3 11.3L10 14.8L8.7 11.3L5.2 10L8.7 8.7L10 5.2Z"
      fill="currentColor"
    />
  </svg>
);

export const WorkbenchScreen: React.FC = () => {
  const [stationId, setStationId] = useState("tv");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerPinned, setIsDrawerPinned] = useState(false);

  // Centralized Zustand Workbench Store (Block F, Items 51–56)
  const {
    power,
    channel,
    volume,
    channelNames,
    isIrEmitting,
    isBeamFlying,
    lastOpcode,
  } = useWorkbenchStore();

  // Active state for side-by-side layout
  const isDrawerActive = isDrawerOpen || isDrawerPinned;

  return (
    <div className="min-h-screen w-full bg-paper text-ink flex flex-col font-sans relative overflow-x-hidden select-none">
      {/* Background Millimeter Drafting Grid */}
      <div className="absolute inset-0 bg-notebook-grid opacity-75 pointer-events-none" />

      {/* Top Engineering Navigation Bar with Balsamiq Sans / Sniglet Typography */}
      <header className="relative z-30 h-14 border-b border-paper-border/80 bg-paper-subtle/90 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Station Index */}
        <div className="flex items-center gap-3 sm:gap-4">
          <BlueprintStationSwitcher
            currentStationId={stationId}
            onSelectStation={setStationId}
          />

          <div className="hidden md:flex items-center gap-2 text-xs font-balsamiq text-ink-muted">
            <span>•</span>
            <span className="text-ink-muted font-bold">{tvLevel01.title}</span>
          </div>
        </div>

        {/* Center: Live Signal Status from Zustand */}
        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-paper-subtle border border-paper-border font-balsamiq text-xs text-ink-muted shadow-paper-sm">
          <span className="flex items-center gap-1.5 text-ink">
            <span
              className={`h-2 w-2 rounded-full transition-colors ${
                isIrEmitting || isBeamFlying
                  ? "bg-accent-break animate-ping"
                  : "bg-accent-ok"
              }`}
            />
            <span className="font-bold text-ink">ІЧ-приймач:</span>
            <span className="text-ink-muted">38 kHz</span>
          </span>
          <span className="text-ink-subtle">•</span>
          <span className="text-accent-blue font-bold">{lastOpcode}</span>
        </div>

        {/* Right: Bespoke XP Coin & Drawer Trigger */}
        <div className="flex items-center gap-3">
          {/* Tactile XP Coin Pill in Balsamiq Sans */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper-subtle border border-paper-border text-xs font-bold text-ink shadow-paper-sm"
            title="Очки досвіду (XP)"
          >
            <XpTokenIcon className="text-accent-signal shrink-0" size={15} />
            <span className="text-accent-signal font-balsamiq text-sm font-extrabold leading-none">
              0
            </span>
            <span className="text-ink-muted text-xs font-balsamiq font-bold uppercase tracking-wider">
              XP
            </span>
          </div>

          {/* Drawer Trigger Button in Sniglet & Balsamiq Font */}
          <button
            onClick={() => {
              setIsDrawerOpen(!isDrawerOpen);
            }}
            aria-label="Toggle Code and Schematic"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-sniglet text-sm font-bold shadow-paper-sm transition-all duration-200 active:scale-[0.98] cursor-pointer outline-none ${
              isDrawerActive
                ? "bg-accent-blue-light text-accent-blue border-accent-blue-border"
                : "bg-paper-subtle hover:bg-paper border-paper-border hover:border-accent-blue/40 text-ink"
            }`}
          >
            <BookOpen size={14} strokeWidth={2} className="text-accent-blue" />
            <span className="hidden sm:inline font-sniglet text-[15px] font-extrabold tracking-wide">
              Code and Schematic
            </span>
            <Badge variant="accent" size="sm" className="text-[10px] font-balsamiq font-bold">
              {isDrawerPinned ? "Закріплено" : isDrawerOpen ? "Відкрито" : "Відкрити"}
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
              <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 xl:gap-8 py-2">
                {/* Widescreen Modern Television */}
                <div className="flex-1 w-full max-w-3xl xl:max-w-4xl">
                  <TVBlueprintDevice compact={false} />
                </div>

                {/* Horizontal Line-of-sight indicator connecting Remote to TV with 200ms IR beam flight */}
                <div className="hidden lg:flex flex-col items-center justify-center text-[10px] font-balsamiq text-ink-subtle px-1 relative w-24 shrink-0">
                  <div className="relative w-full flex items-center justify-center h-2 overflow-visible">
                    {/* Dashed baseline */}
                    <div className="w-full border-t border-dashed border-ink-subtle/50" />
                    {/* Animated IR photon packet flying Right (Remote) -> Left (TV) for 200ms */}
                    {isBeamFlying && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center animate-ir-beam-horizontal pointer-events-none z-20">
                        <div className="h-3 w-7 rounded-full bg-gradient-to-l from-red-500 via-amber-400 to-white shadow-[0_0_14px_rgba(239,68,68,1)] animate-pulse" />
                      </div>
                    )}
                  </div>
                  <span className="tracking-tight py-0.5 font-bold whitespace-nowrap">38 kHz ІЧ</span>
                  <div className="relative w-full flex items-center justify-center h-2 overflow-visible">
                    <div className="w-full border-t border-dashed border-ink-subtle/50" />
                  </div>
                </div>

                {/* Vertical Samsung Remote */}
                <div className="shrink-0 pt-2 lg:pt-0">
                  <RemoteBlueprintDevice orientation="vertical" />
                </div>
              </div>
            ) : (
              /* 2. When Drawer is OPEN: TV moved to the left, Remote lying horizontally underneath! */
              <div className="w-full flex flex-col items-center gap-1 py-1">
                {/* Modern TV in Left Column */}
                <div className="w-full">
                  <TVBlueprintDevice compact={true} />
                </div>

                {/* Vertical Line-of-sight indicator connecting horizontal remote below to TV above */}
                <div className="flex items-center justify-center gap-3 text-[10px] font-balsamiq text-ink-subtle relative py-0.5">
                  <div className="relative h-6 flex flex-col items-center justify-center w-2 overflow-visible">
                    <div className="h-full border-l border-dashed border-ink-subtle/50" />
                    {/* Animated IR photon packet flying Bottom (Remote) -> Top (TV) for 200ms */}
                    {isBeamFlying && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center animate-ir-beam-vertical pointer-events-none z-20">
                        <div className="w-3 h-7 rounded-full bg-gradient-to-t from-red-500 via-amber-400 to-white shadow-[0_0_14px_rgba(239,68,68,1)] animate-pulse" />
                      </div>
                    )}
                  </div>
                  <span className="tracking-tight font-bold">38 kHz ІЧ</span>
                  <div className="relative h-6 flex flex-col items-center justify-center w-2 overflow-visible">
                    <div className="h-full border-l border-dashed border-ink-subtle/50" />
                  </div>
                </div>

                {/* Samsung Remote Lying Flat Horizontally Directly Underneath TV */}
                <div className="w-full flex items-center justify-center">
                  <RemoteBlueprintDevice orientation="horizontal" />
                </div>
              </div>
            )}

            {/* Bottom Status Hint in Balsamiq font */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 w-full">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-paper-subtle border border-paper-border font-balsamiq text-xs shadow-paper-sm text-ink-muted">
                <span className="text-accent-blue font-bold">Підказка:</span>
                <span className="text-ink font-medium">
                  {power
                    ? `Канал ${channel}: ${channelNames[channel]} • Гучність: ${volume}/100`
                    : "Телевізор у мережі. Натисніть кнопку живлення [PWR] на пульті Samsung"}
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
            title="Відкрити Code and Schematic"
            className="bg-paper-subtle hover:bg-paper border-l border-y border-paper-border text-ink font-sniglet text-xs font-bold py-4 px-2.5 rounded-l-xl shadow-[-4px_2px_12px_rgba(26,29,32,0.06)] hover:border-accent-blue/40 transition-all duration-200 active:scale-95 cursor-pointer outline-none [writing-mode:vertical-rl] flex items-center gap-2 tracking-wider text-accent-blue"
          >
            <Terminal size={12} strokeWidth={2} className="rotate-90" />
            <span className="font-sniglet font-extrabold tracking-wide">Code and Schematic</span>
          </button>
        </aside>
      )}
    </div>
  );
};
