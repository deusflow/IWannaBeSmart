import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { tvLevel01 } from "@iw/sim-engine";
import { useWorkbenchStore } from "../store/workbenchStore";
import { BlueprintStationSwitcher } from "../components/workbench/BlueprintStationSwitcher";
import { TVBlueprintDevice } from "../components/workbench/TVBlueprintDevice";
import { RemoteBlueprintDevice } from "../components/workbench/RemoteBlueprintDevice";
import { EngineeringDrawer } from "../components/workbench/EngineeringDrawer";
import { ArchitectureCanvas } from "../components/workbench/architecture/ArchitectureCanvas";
import { LanguageSwitcher } from "../components/workbench/LanguageSwitcher";
import { POSBlueprintDevice } from "../components/workbench/POSBlueprintDevice";
import { CodeGymRunner } from "../components/workbench/playground/CodeGymRunner";
import { StationCompletionModal } from "../components/workbench/StationCompletionModal";
import { FintechStationVictoryModal } from "../components/workbench/FintechStationVictoryModal";
import { WorkshopHubScreen } from "../components/workbench/WorkshopHubScreen";
import { audioFx } from "../utils/audioFx";
import { ArrowLeft, Terminal, Network, Volume2, VolumeX, Trophy, LayoutGrid } from "lucide-react";

/**
 * Engineering Microchip XP icon — silicon die with contact pins.
 */
const EngineeringChipXpIcon: React.FC<{ className?: string; size?: number }> = ({
  className = "w-3.5 h-3.5",
  size = 14,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect x="3.5" y="3.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.25" fill="currentColor" fillOpacity="0.15" />
    <line x1="5.5" y1="1" x2="5.5" y2="3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="10.5" y1="1" x2="10.5" y2="3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="5.5" y1="12.5" x2="5.5" y2="15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="10.5" y1="12.5" x2="10.5" y2="15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="1" y1="5.5" x2="3.5" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="1" y1="10.5" x2="3.5" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="12.5" y1="5.5" x2="15" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="12.5" y1="10.5" x2="15" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <rect x="6" y="6" width="4" height="4" rx="0.5" fill="currentColor" />
  </svg>
);

export const WorkbenchScreen: React.FC = () => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<"device" | "architecture">("device");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerPinned, setIsDrawerPinned] = useState(false);
  const [isMuted, setIsMuted] = useState(audioFx.isMuted());

  const {
    power,
    channel,
    volume,
    channelNames,
    isBeamFlying,
    xp,
    mentorPhase,
    completedCodingTasks,
    isStationVictoryModalOpen,
    setStationVictoryModalOpen,
    isPosVictoryModalOpen,
    setPosVictoryModalOpen,
    currentStationId,
    setCurrentStationId,
    currentView,
    setCurrentView,
  } = useWorkbenchStore();

  const handleToggleSound = () => {
    const nextMuted = audioFx.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      audioFx.playRelayClick();
    }
  };

  const isCompletedAllTasks = Object.keys(completedCodingTasks).length >= 10;
  const isDrawerActive = isDrawerOpen || isDrawerPinned;

  return (
    <div
      className={`w-full bg-paper text-ink flex flex-col font-sans relative select-none ${
        activeView === "architecture"
          ? "h-screen overflow-hidden"
          : "min-h-screen overflow-x-hidden"
      }`}
    >
      {/* Background drafting grid */}
      <div className="absolute inset-0 bg-notebook-grid opacity-75 pointer-events-none" />

      {/* ── Header ── */}
      <header className="relative z-30 h-14 border-b border-paper-border/80 bg-paper-subtle/90 backdrop-blur-xs px-3 sm:px-6 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentView === "HUB" ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1A1D20] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                📐
              </div>
              <span className="font-display font-extrabold text-sm sm:text-base text-[#1A1D20]">
                {t("hub.title", "Інженерний Хаб верстака")}
              </span>
            </div>
          ) : (
            <>
              {/* Back to Hub Button */}
              <button
                id="btn-back-to-hub"
                onClick={() => {
                  audioFx.playRelayClick();
                  setCurrentView("HUB");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper hover:bg-paper-muted border border-paper-border hover:border-[#1A1D20]/60 text-ink font-balsamiq font-bold text-xs sm:text-sm shadow-paper-sm transition-all cursor-pointer active:scale-95"
                title={t("hub.backToHub", "До верстака / Hub")}
              >
                <LayoutGrid size={15} className="text-[#1A1D20] shrink-0" />
                <span>{t("hub.backToHub", "До верстака / Hub")}</span>
              </button>

              {activeView === "architecture" ? (
                <button
                  onClick={() => setActiveView("device")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper hover:bg-paper-muted border border-paper-border hover:border-accent-blue/60 text-ink font-balsamiq font-bold text-xs sm:text-sm shadow-paper-sm transition-all cursor-pointer active:scale-95"
                  title={t("workbench.backToTv")}
                >
                  <ArrowLeft size={15} className="text-accent-blue shrink-0" />
                  <span>{t("workbench.backToTv")}</span>
                </button>
              ) : (
                <BlueprintStationSwitcher
                  currentStationId={currentStationId}
                  onSelectStation={setCurrentStationId}
                />
              )}

              <div className="hidden sm:flex items-center gap-2 text-xs font-balsamiq text-ink-muted whitespace-nowrap">
                <span>•</span>
                <span className="text-ink font-bold truncate max-w-[180px] lg:max-w-[320px]">
                  {activeView === "architecture"
                    ? t("architecture.title")
                    : currentStationId === "pos"
                    ? t("posStation.title")
                    : t("level.level1Title", { defaultValue: tvLevel01.title })}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Sound Mute/Unmute Toggle [ 🔊 / 🔇 ] */}
          <button
            id="btn-sound-toggle"
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-paper-sm flex items-center justify-center active:scale-95 ${
              isMuted
                ? "bg-paper-muted border-paper-border text-ink-muted hover:text-ink"
                : "bg-paper border-paper-border hover:border-accent-blue text-accent-blue"
            }`}
            title={isMuted ? t("workbench.soundOff") : t("workbench.soundOn")}
            aria-label={isMuted ? t("workbench.soundOff") : t("workbench.soundOn")}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Station Mastery Trophy (Re-opens Victory Modal if all 10 tasks passed) */}
          {isCompletedAllTasks && (
            <button
              onClick={() => setStationVictoryModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-600/40 text-amber-800 hover:bg-amber-500/25 font-balsamiq font-bold text-xs shadow-paper-sm transition-all cursor-pointer active:scale-95"
              title={t("victoryModal.title")}
            >
              <Trophy size={14} className="text-amber-600" />
              <span className="hidden sm:inline font-mono">10/10 ✓</span>
            </button>
          )}

          <LanguageSwitcher />

          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-paper border border-paper-border text-xs font-bold text-ink shadow-paper-sm shrink-0"
            title={t("workbench.xpTooltip")}
          >
            <EngineeringChipXpIcon className="text-accent-signal shrink-0" size={15} />
            <span className="text-accent-signal font-balsamiq text-sm font-extrabold leading-none">{xp}</span>
            <span className="text-ink-muted text-[10px] font-balsamiq font-bold uppercase tracking-wider">
              {t("common.xp")}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      {currentView === "HUB" ? (
        <main className="relative z-10 flex-1 w-full overflow-y-auto flex flex-col">
          <WorkshopHubScreen />
        </main>
      ) : activeView === "architecture" ? (
        <main className="relative z-10 flex-1 w-full h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden flex flex-col">
          <ArchitectureCanvas onBackToTv={() => setActiveView("device")} />
        </main>
      ) : currentStationId === "pos" ? (
        <main className="relative z-10 flex-1 flex flex-col justify-start p-4 sm:p-6 w-full max-w-[1700px] mx-auto overflow-y-auto">
          <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-6 xl:gap-8">
            {/* Left: POS Device */}
            <div className="w-full lg:w-[460px] xl:w-[500px] shrink-0 sticky top-2">
              <POSBlueprintDevice />
            </div>

            {/* Right: Code Gym Runner */}
            <div className="flex-1 w-full min-w-0">
              <CodeGymRunner />
            </div>
          </div>
        </main>
      ) : (
        <main className="relative z-10 flex-1 flex flex-col justify-center p-3 sm:p-4 lg:p-5 w-full max-w-[1840px] mx-auto overflow-hidden">
          <div
            className={`w-full flex transition-all duration-300 ease-in-out ${
              isDrawerActive
                ? "flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-6"
                : "flex-col items-center justify-center gap-6"
            }`}
          >
            {/* Left column: TV + Remote (scales down smoothly by ~30% when Drawer is active) */}
            <div
              className={`transition-all duration-300 ease-in-out flex flex-col items-center justify-center ${
                isDrawerActive
                  ? "w-full lg:flex-1 min-w-0"
                  : "w-full max-w-5xl mx-auto gap-6"
              }`}
            >
              <div
                className={`w-full transition-all duration-300 ease-in-out flex flex-col items-center justify-center ${
                  isDrawerActive
                    ? "transform scale-[0.75] origin-center -my-6"
                    : "transform scale-100 origin-center my-0"
                }`}
              >
                {!isDrawerActive ? (
                  <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 xl:gap-8 py-2">
                    <div className="flex-1 w-full max-w-3xl xl:max-w-4xl">
                      <TVBlueprintDevice compact={false} />
                    </div>

                    <div className="hidden lg:flex flex-col items-center justify-center text-[10px] font-balsamiq text-ink-subtle px-1 relative w-24 shrink-0">
                      <div className="relative w-full flex items-center justify-center h-2 overflow-visible">
                        <div className="w-full border-t border-dashed border-ink-subtle/50" />
                        {isBeamFlying && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center animate-ir-beam-horizontal pointer-events-none z-20">
                            <div className="h-3 w-7 rounded-full bg-gradient-to-l from-red-500 via-amber-400 to-white shadow-[0_0_14px_rgba(239,68,68,1)] animate-pulse" />
                          </div>
                        )}
                      </div>
                      <span className="tracking-tight py-0.5 font-bold whitespace-nowrap">
                        {t("workbench.carrierLabel")}
                      </span>
                      <div className="relative w-full flex items-center justify-center h-2 overflow-visible">
                        <div className="w-full border-t border-dashed border-ink-subtle/50" />
                      </div>
                    </div>

                    <div className="shrink-0 pt-2 lg:pt-0">
                      <RemoteBlueprintDevice orientation="vertical" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center gap-1 py-1">
                    <div className="w-full">
                      <TVBlueprintDevice compact={true} />
                    </div>
                    <div className="flex items-center justify-center gap-3 text-[10px] font-balsamiq text-ink-subtle relative py-0.5">
                      <div className="relative h-6 flex flex-col items-center justify-center w-2 overflow-visible">
                        <div className="h-full border-l border-dashed border-ink-subtle/50" />
                        {isBeamFlying && (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center animate-ir-beam-vertical pointer-events-none z-20">
                            <div className="w-3 h-7 rounded-full bg-gradient-to-t from-red-500 via-amber-400 to-white shadow-[0_0_14px_rgba(239,68,68,1)] animate-pulse" />
                          </div>
                        )}
                      </div>
                      <span className="tracking-tight font-bold">{t("workbench.carrierLabel")}</span>
                      <div className="relative h-6 flex flex-col items-center justify-center w-2 overflow-visible">
                        <div className="h-full border-l border-dashed border-ink-subtle/50" />
                      </div>
                    </div>
                    <div className="w-full flex items-center justify-center">
                      <RemoteBlueprintDevice orientation="horizontal" />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom hint */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 w-full">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-paper-subtle border border-paper-border font-balsamiq text-xs shadow-paper-sm text-ink-muted">
                  <span className="text-accent-blue font-bold">{t("workbench.hintTitle")}</span>
                  <span className="text-ink font-medium">
                    {power
                      ? t("workbench.tvPlayingHint", { channel, channelName: channelNames[channel], volume })
                      : mentorPhase === "VERIFY"
                      ? t("workbench.tvVerifyHint")
                      : t("workbench.tvStandbyHint")}
                  </span>
                </div>
              </div>
            </div>

            {/* Right column: Wide Ergonomic IDE Drawer (55vw, min 640px) */}
            {isDrawerActive && (
              <div className="w-full lg:w-[55vw] lg:min-w-[640px] lg:max-w-[860px] xl:max-w-[900px] h-[calc(100vh-4.8rem)] min-h-[580px] shrink-0 transition-all duration-300 ease-in-out animate-in slide-in-from-right-4">
                <EngineeringDrawer
                  isOpen={true}
                  isPinned={isDrawerPinned}
                  onTogglePin={() => setIsDrawerPinned(!isDrawerPinned)}
                  onClose={() => { setIsDrawerOpen(false); setIsDrawerPinned(false); }}
                  level={tvLevel01}
                  inline={true}
                />
              </div>
            )}
          </div>
        </main>
      )}

      {/* ══════════════════════════════════════════════
           Notebook Edge Tabs — visible on TV device view
           Two sticker-tabs protruding from the right edge
          ══════════════════════════════════════════════ */}
      {currentView === "STATION" && activeView === "device" && currentStationId === "tv" && (
        <aside className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-0">
          {/* Tab 1: Code & Schematic */}
          <button
            id="tab-code-schematic"
            onClick={() => {
              if (isDrawerActive) {
                setIsDrawerOpen(false);
                setIsDrawerPinned(false);
              } else {
                setIsDrawerOpen(true);
              }
            }}
            title={t("workbench.codeAndSchematic")}
            className={`
              group flex items-center gap-2 py-5 px-2.5
              rounded-l-2xl border-y-2 border-l-2
              [writing-mode:vertical-rl] rotate-180
              font-balsamiq font-bold text-[11px] tracking-wider
              transition-all duration-200 cursor-pointer active:scale-95
              shadow-[-4px_2px_12px_rgba(0,0,0,0.10)]
              ${
                isDrawerActive
                  ? "bg-accent-blue/10 border-accent-blue text-accent-blue"
                  : "bg-paper-subtle hover:bg-paper border-accent-blue/40 hover:border-accent-blue text-ink-muted hover:text-accent-blue"
              }
            `}
          >
            <Terminal
              size={12}
              strokeWidth={2.2}
              className="shrink-0 group-hover:scale-110 transition-transform"
            />
            <span>{t("workbench.codeAndSchematic")}</span>
          </button>

          {/* Thin divider between tabs */}
          <div className="w-8 h-px bg-paper-border/60" />

          {/* Tab 2: Architecture Studio */}
          <button
            id="tab-architecture-studio"
            onClick={() => {
              setIsDrawerOpen(false);
              setIsDrawerPinned(false);
              setActiveView("architecture");
            }}
            title={t("workbench.switchToArchitecture")}
            className="
              group flex items-center gap-2 py-5 px-2.5
              rounded-l-2xl border-y-2 border-l-2
              [writing-mode:vertical-rl] rotate-180
              bg-paper-subtle hover:bg-[#1E1E22] border-purple-500/40 hover:border-purple-500
              text-ink-muted hover:text-purple-300
              font-balsamiq font-bold text-[11px] tracking-wider
              transition-all duration-200 cursor-pointer active:scale-95
              shadow-[-4px_2px_12px_rgba(0,0,0,0.10)]
            "
          >
            <Network
              size={12}
              strokeWidth={2.2}
              className="shrink-0 group-hover:scale-110 transition-transform"
            />
            <span>{t("workbench.switchToArchitecture")}</span>
          </button>
        </aside>
      )}

      {/* Station Victory & Mastery Matrix Modal */}
      <StationCompletionModal
        isOpen={isStationVictoryModalOpen}
        onClose={() => setStationVictoryModalOpen(false)}
        xp={xp}
      />

      {/* Module 2: Fintech POS Terminal Station Victory Modal */}
      <FintechStationVictoryModal
        isOpen={isPosVictoryModalOpen}
        onClose={() => setPosVictoryModalOpen(false)}
        xp={xp}
      />
    </div>
  );
};
