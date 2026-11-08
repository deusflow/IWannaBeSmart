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
  Sparkles,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white text-obsidian rounded-3xl border border-black/[0.08] shadow-luxury p-6 sm:p-8 space-y-6">
        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-600/25 text-emerald-800 text-xs font-mono font-bold tracking-wider uppercase">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>SEV-1 PRODUCTION INCIDENT MITIGATED • {incident.id}</span>
          </div>

          <h2
            id="victory-modal-title"
            className="font-display font-extrabold text-2xl sm:text-3xl text-obsidian tracking-tight"
          >
            {incident.title}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Emergency mitigation successful. Root cause permanently patched and SLA targets preserved.
          </p>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50/80 border border-black/[0.06] rounded-2xl p-4 text-center shadow-2xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              MTTR (Time to Mitigate)
            </span>
            <span className="text-xl font-display font-extrabold text-obsidian">
              {mttrFormatted}
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-700 flex items-center justify-center gap-1 mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Under SLA</span>
            </span>
          </div>

          <div className="bg-slate-50/80 border border-black/[0.06] rounded-2xl p-4 text-center shadow-2xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Revenue Protected
            </span>
            <span className="text-xl font-display font-extrabold text-[#C5A059]">
              ${revenueSaved.toLocaleString()}
            </span>
            <span className="text-[11px] font-mono text-slate-500 block mt-1">
              vs 1h cascade
            </span>
          </div>

          <div className="bg-slate-50/80 border border-black/[0.06] rounded-2xl p-4 text-center shadow-2xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              SRE XP Earned
            </span>
            <span className="text-xl font-display font-extrabold text-emerald-700 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>+150 XP</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-700 block mt-1">
              Error Rate 0.05%
            </span>
          </div>
        </div>

        {/* Root Cause Summary Card */}
        <div className="bg-slate-50/70 border border-black/[0.06] rounded-2xl p-4 space-y-1.5 shadow-2xs">
          <span className="text-xs font-mono font-bold text-obsidian uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>Root Cause Resolved & Verified</span>
          </span>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {incident.hotfixTask.description}
          </p>
        </div>

        {/* Post-Mortem Action Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50/70 border border-black/[0.06] rounded-2xl p-3.5 px-4 gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#C5A059]" />
            <span className="text-xs font-mono font-bold text-obsidian">
              Official Post-Mortem RCA Document Ready
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-white hover:bg-slate-50 text-obsidian border border-black/[0.08] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? "Copied" : "Copy RCA"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadReport}
              className="px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-[#C5A059] border border-[#C5A059]/40 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .md</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-2 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setWarRoomVictoryModalOpen(false);
              setCurrentView("HUB");
            }}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-mono font-bold rounded-xl bg-white hover:bg-slate-50 text-obsidian border border-black/[0.08] transition-colors cursor-pointer shadow-2xs"
          >
            ← Return to Hub
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setWarRoomVictoryModalOpen(false);
                startIncidentDrill(incident.id);
              }}
              className="px-4 py-2.5 text-xs font-mono font-bold rounded-xl bg-white hover:bg-slate-50 text-obsidian border border-black/[0.08] flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Replay Drill</span>
            </button>

            {nextIncident ? (
              <button
                type="button"
                onClick={() => {
                  setWarRoomVictoryModalOpen(false);
                  startIncidentDrill(nextIncident.id);
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-mono font-bold rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-luxury active:scale-95"
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
                className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-mono font-bold rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-[#C5A059] border border-[#C5A059]/40 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-luxury active:scale-95"
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
