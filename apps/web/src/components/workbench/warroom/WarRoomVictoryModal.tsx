/**
 * @file apps/web/src/components/workbench/warroom/WarRoomVictoryModal.tsx
 * @description Victory modal for successfully mitigated SEV-1 Production Incidents.
 * Displays MTTR, revenue saved, awarded SRE XP, and allows downloading the official Post-Mortem Report.
 */

import React, { useState } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  Flame,
  Download,
  Copy,
  Check,
  ArrowRight,
  TrendingDown,
  RotateCcw,
} from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import {
  INCIDENT_SCENARIOS,
  generatePostMortemReport,
  type IncidentScenario,
} from "@iw/sim-engine";

export const WarRoomVictoryModal: React.FC = () => {
  const {
    isWarRoomVictoryModalOpen,
    setWarRoomVictoryModalOpen,
    activeIncidentId,
    warRoomElapsedSec,
    warRoomAccumulatedLoss,
    setCurrentView,
    startIncidentDrill,
  } = useWorkbenchStore(
    useShallow((s) => ({
      isWarRoomVictoryModalOpen: s.isWarRoomVictoryModalOpen,
      setWarRoomVictoryModalOpen: s.setWarRoomVictoryModalOpen,
      activeIncidentId: s.activeIncidentId,
      warRoomElapsedSec: s.warRoomElapsedSec,
      warRoomAccumulatedLoss: s.warRoomAccumulatedLoss,
      setCurrentView: s.setCurrentView,
      startIncidentDrill: s.startIncidentDrill,
    }))
  );

  const [copied, setCopied] = useState(false);

  if (!isWarRoomVictoryModalOpen) return null;

  const incident: IncidentScenario =
    INCIDENT_SCENARIOS.find((s) => s.id === activeIncidentId) || INCIDENT_SCENARIOS[0];

  const mttrMinutes = Math.floor(warRoomElapsedSec / 60);
  const mttrSeconds = warRoomElapsedSec % 60;
  const mttrFormatted = `${mttrMinutes}m ${mttrSeconds.toString().padStart(2, "0")}s`;

  // Theoretical loss if outage lasted 1 hour vs actual loss
  const fullHourLoss = incident.baseFinancialLossRatePerMin * 60;
  const revenueSaved = Math.max(0, fullHourLoss - warRoomAccumulatedLoss);

  const handleCopyReport = () => {
    const report = generatePostMortemReport(incident, warRoomElapsedSec, true);
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const report = generatePostMortemReport(incident, warRoomElapsedSec, true);
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `post-mortem-${incident.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentIndex = INCIDENT_SCENARIOS.findIndex((s) => s.id === incident.id);
  const nextIncident =
    currentIndex >= 0 && currentIndex < INCIDENT_SCENARIOS.length - 1
      ? INCIDENT_SCENARIOS[currentIndex + 1]
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#0F1115] border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/50 overflow-hidden flex flex-col">
        {/* Glow Accent Header */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-[#0F1115] p-6 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                  SEV-1 Mitigated
                </span>
                <span className="text-xs font-mono text-emerald-300/70">
                  {incident.id}
                </span>
              </div>
              <h2
                id="victory-modal-title"
                className="text-xl font-bold text-white tracking-tight mt-1"
              >
                {incident.title}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-emerald-400/80 block uppercase tracking-wider">
              Earned SRE XP
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 flex items-center justify-end space-x-1">
              <Flame className="w-5 h-5 text-amber-400 inline" />
              <span>+150 XP</span>
            </span>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#161920] border border-[#252A35] rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                MTTR
              </span>
              <span className="text-xl font-mono font-bold text-white">
                {mttrFormatted}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center justify-center space-x-1 mt-1">
                <TrendingDown className="w-3 h-3" />
                <span>Under SLA</span>
              </span>
            </div>

            <div className="bg-[#161920] border border-[#252A35] rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                Revenue Saved
              </span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                ${revenueSaved.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                vs 1h cascade
              </span>
            </div>

            <div className="bg-[#161920] border border-[#252A35] rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                System Health
              </span>
              <span className="text-xl font-mono font-bold text-emerald-400 flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>100%</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                Error Rate: 0.05%
              </span>
            </div>
          </div>

          {/* Root Cause Summary Card */}
          <div className="bg-[#14171E] border border-[#232834] rounded-xl p-4 space-y-2">
            <span className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Root Cause Resolved</span>
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {incident.hotfixTask.description}
            </p>
          </div>

          {/* Post-Mortem Action Strip */}
          <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 px-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
              <span className="text-xs font-mono text-emerald-300">
                Official Incident Post-Mortem Report Ready
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopyReport}
                className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-[#1C202A] hover:bg-[#252B3A] text-zinc-200 border border-[#2F3748] flex items-center space-x-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy RCA"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadReport}
                className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-[#1C202A] hover:bg-[#252B3A] text-zinc-200 border border-[#2F3748] flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export .md</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#12141A] p-4 px-6 border-t border-[#1F232D] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setWarRoomVictoryModalOpen(false);
              setCurrentView("HUB");
            }}
            className="px-4 py-2 text-xs font-mono font-medium rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1E26] transition-colors"
          >
            ← Return to Hub
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                setWarRoomVictoryModalOpen(false);
                startIncidentDrill(incident.id);
              }}
              className="px-4 py-2 text-xs font-mono font-medium rounded-xl bg-[#1C202B] hover:bg-[#242A38] text-zinc-200 border border-[#2A3142] flex items-center space-x-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Drill</span>
            </button>

            {nextIncident ? (
              <button
                type="button"
                onClick={() => {
                  setWarRoomVictoryModalOpen(false);
                  startIncidentDrill(nextIncident.id);
                }}
                className="px-5 py-2 text-xs font-mono font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all transform active:scale-95"
              >
                <span>Next Incident</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setWarRoomVictoryModalOpen(false);
                  setCurrentView("HUB");
                }}
                className="px-5 py-2 text-xs font-mono font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all transform active:scale-95"
              >
                <span>Mastery Achieved</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
