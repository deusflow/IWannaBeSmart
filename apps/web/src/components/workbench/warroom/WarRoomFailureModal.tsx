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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-[#0F1115] border border-rose-500/40 rounded-2xl shadow-2xl shadow-rose-950/50 overflow-hidden flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-[#0F1115] p-6 border-b border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-widest">
                  SLA Breached
                </span>
                <span className="text-xs font-mono text-rose-300/70">
                  {incident.id}
                </span>
              </div>
              <h2
                id="failure-modal-title"
                className="text-xl font-bold text-white tracking-tight mt-1"
              >
                Production Outage Cascaded
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-rose-400/80 block uppercase tracking-wider">
              Total Loss
            </span>
            <span className="text-2xl font-black font-mono text-rose-400">
              ${warRoomAccumulatedLoss.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="bg-[#161920] border border-[#262B37] rounded-xl p-4 space-y-2">
            <span className="text-xs font-mono font-semibold text-rose-300 uppercase tracking-wider flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>What Happened?</span>
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              The time limit of <strong className="text-white">{incident.timeLimitSec} seconds</strong> expired before the hotfix could be validated. The cascading failure reached critical thresholds and triggered automatic traffic blackholing.
            </p>
          </div>

          <div className="bg-[#14171E] border border-[#232834] rounded-xl p-4 space-y-2">
            <span className="text-xs font-mono font-semibold text-amber-300 uppercase tracking-wider flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Architectural Diagnostic Hint</span>
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {incident.hotfixTask.diagnosticHint}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#12141A] p-4 px-6 border-t border-[#1F232D] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setWarRoomFailureModalOpen(false);
              setCurrentView("HUB");
            }}
            className="px-4 py-2 text-xs font-mono font-medium rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1E26] transition-colors"
          >
            ← Return to Hub
          </button>

          <button
            type="button"
            onClick={() => {
              setWarRoomFailureModalOpen(false);
              startIncidentDrill(incident.id);
            }}
            className="px-5 py-2 text-xs font-mono font-bold rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-black shadow-lg shadow-rose-500/20 flex items-center space-x-2 transition-all transform active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Incident Drill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
