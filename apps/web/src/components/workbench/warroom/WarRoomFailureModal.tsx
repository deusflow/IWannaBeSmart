/**
 * @file apps/web/src/components/workbench/warroom/WarRoomFailureModal.tsx
 * @description Outage modal when SLA timer expires during an active SEV-1 incident.
 * Explains what happened, details the root cause, and allows immediate retry.
 */

import React from "react";
import {
  AlertTriangle,
  RotateCcw,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import {
  INCIDENT_SCENARIOS,
  type IncidentScenario,
} from "@iw/sim-engine";

export const WarRoomFailureModal: React.FC = () => {
  const {
    isWarRoomFailureModalOpen,
    setWarRoomFailureModalOpen,
    activeIncidentId,
    warRoomAccumulatedLoss,
    setCurrentView,
    startIncidentDrill,
  } = useWorkbenchStore(
    useShallow((s) => ({
      isWarRoomFailureModalOpen: s.isWarRoomFailureModalOpen,
      setWarRoomFailureModalOpen: s.setWarRoomFailureModalOpen,
      activeIncidentId: s.activeIncidentId,
      warRoomAccumulatedLoss: s.warRoomAccumulatedLoss,
      setCurrentView: s.setCurrentView,
      startIncidentDrill: s.startIncidentDrill,
    }))
  );

  if (!isWarRoomFailureModalOpen) return null;

  const incident: IncidentScenario =
    INCIDENT_SCENARIOS.find((s) => s.id === activeIncidentId) || INCIDENT_SCENARIOS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="failure-modal-title"
      data-testid="warroom-failure-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none duration-200"
    >
      <div className="relative w-full max-w-xl bg-white text-obsidian border border-black/[0.08] rounded-3xl shadow-luxury overflow-hidden flex flex-col">
        {/* Header Banner */}
        <div className="bg-slate-50/80 p-6 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-700 border border-rose-500/25 uppercase tracking-widest">
                  SLA Breached
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {incident.id}
                </span>
              </div>
              <h2
                id="failure-modal-title"
                className="text-xl font-display font-extrabold text-obsidian tracking-tight mt-1"
              >
                Production Outage Cascaded
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider font-semibold">
              Total Loss
            </span>
            <span className="text-2xl font-black font-display text-rose-600">
              ${warRoomAccumulatedLoss.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="bg-rose-50/50 border border-rose-200/70 rounded-2xl p-4 space-y-1.5 shadow-2xs">
            <span className="text-xs font-mono font-bold text-rose-800 uppercase tracking-wider flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>What Happened?</span>
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              The time limit of <strong className="text-obsidian">{incident.timeLimitSec} seconds</strong> expired before the hotfix could be validated. The cascading failure reached critical thresholds and triggered automatic traffic blackholing.
            </p>
          </div>

          <div className="bg-amber-50/40 border border-amber-200/70 rounded-2xl p-4 space-y-1.5 shadow-2xs">
            <span className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Architectural Diagnostic Hint</span>
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {incident.hotfixTask.diagnosticHint}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50/80 p-4 px-6 border-t border-black/[0.06] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setWarRoomFailureModalOpen(false);
              setCurrentView("HUB");
            }}
            className="px-4 py-2.5 text-xs font-mono font-semibold rounded-xl text-slate-600 hover:text-obsidian hover:bg-slate-200/60 transition-colors"
          >
            ← Return to Hub
          </button>

          <button
            type="button"
            onClick={() => {
              setWarRoomFailureModalOpen(false);
              startIncidentDrill(incident.id);
            }}
            className="px-5 py-2.5 text-xs font-mono font-bold rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-white shadow-luxury flex items-center space-x-2 transition-all transform active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Incident Drill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
