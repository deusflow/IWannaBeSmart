/**
 * @file apps/web/src/store/slices/warRoomSlice.ts
 * @description Zustand Slice for Incident War Room (SEV-1 Production Outage Drills).
 */

import type { StateCreator } from "zustand";
import type { WorkbenchStore, WarRoomSlice } from "../types";
import {
  INCIDENT_SCENARIOS,
  calculateIncidentTelemetry,
  type IncidentScenario,
  type IncidentSlackMessage,
} from "@iw/sim-engine";
import { audioFx } from "../../utils/audioFx";

const defaultIncident = INCIDENT_SCENARIOS[0];

export const createWarRoomSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  WarRoomSlice
> = (set, get) => ({
  activeIncidentId: defaultIncident.id,
  warRoomStatus: "STANDBY",
  warRoomElapsedSec: 0,
  warRoomTimeRemainingSec: defaultIncident.timeLimitSec,
  warRoomAccumulatedLoss: 0,
  warRoomErrorRate: defaultIncident.initialErrorRate,
  warRoomLatencyMs: defaultIncident.initialLatencyMs,
  warRoomHealthStatus: "CRITICAL",
  warRoomActiveTab: "feed",
  warRoomChatMessages: defaultIncident.slackMessages.filter((m) => m.delaySec <= 2),
  warRoomHotfixCode: {
    typescript: defaultIncident.hotfixTask.initialBrokenCode.typescript,
    python: defaultIncident.hotfixTask.initialBrokenCode.python,
  },
  warRoomHotfixLanguage: "typescript",
  warRoomHotfixLogs: [
    `[SRE_ALERT] Incident ${defaultIncident.id} triggered.`,
    `[SRE_ALERT] System Health: CRITICAL. Initial Error Rate: ${defaultIncident.initialErrorRate}%.`,
    `[SRE_ALERT] Hotfix sandbox initialized. Waiting for engineer patch...`,
  ],
  warRoomHotfixError: null,
  isWarRoomAudioEnabled: true,
  isWarRoomVictoryModalOpen: false,
  isWarRoomFailureModalOpen: false,

  startIncidentDrill: (incidentId: string) => {
    const incident: IncidentScenario =
      INCIDENT_SCENARIOS.find((s) => s.id === incidentId) || INCIDENT_SCENARIOS[0];

    const initialMessages = incident.slackMessages.filter((m) => m.delaySec <= 2);

    set({
      activeIncidentId: incident.id,
      warRoomStatus: "IN_PROGRESS",
      warRoomElapsedSec: 0,
      warRoomTimeRemainingSec: incident.timeLimitSec,
      warRoomAccumulatedLoss: 0,
      warRoomErrorRate: incident.initialErrorRate,
      warRoomLatencyMs: incident.initialLatencyMs,
      warRoomHealthStatus: "CRITICAL",
      warRoomActiveTab: "feed",
      warRoomChatMessages: initialMessages,
      warRoomHotfixCode: {
        typescript: incident.hotfixTask.initialBrokenCode.typescript,
        python: incident.hotfixTask.initialBrokenCode.python,
      },
      warRoomHotfixLogs: [
        `[SRE_ALERT] SEV-1 INCIDENT DEPLOYED: ${incident.title}`,
        `[SRE_ALERT] Target Station: ${incident.stationName}`,
        `[SRE_ALERT] Blast Radius: ${incident.blastRadius}`,
        `[SRE_ALERT] SLA Countdown active (${incident.timeLimitSec}s). Good luck, Commander.`,
      ],
      warRoomHotfixError: null,
      isWarRoomVictoryModalOpen: false,
      isWarRoomFailureModalOpen: false,
    });

    if (get().isWarRoomAudioEnabled) {
      audioFx.playWarRoomSiren();
    }
  },

  abortIncidentDrill: () => {
    set({
      warRoomStatus: "STANDBY",
      isWarRoomVictoryModalOpen: false,
      isWarRoomFailureModalOpen: false,
    });
  },

  tickWarRoomTimer: () => {
    const state = get();
    if (state.warRoomStatus !== "IN_PROGRESS") return;

    const incident: IncidentScenario =
      INCIDENT_SCENARIOS.find((s) => s.id === state.activeIncidentId) || INCIDENT_SCENARIOS[0];

    const nextElapsed = state.warRoomElapsedSec + 1;
    const telemetry = calculateIncidentTelemetry(
      nextElapsed,
      incident.timeLimitSec,
      false,
      incident.baseFinancialLossRatePerMin,
      incident.initialErrorRate,
      incident.initialLatencyMs
    );

    // Check for newly arriving Slack messages
    const newMessages: IncidentSlackMessage[] = incident.slackMessages.filter(
      (m) => m.delaySec <= nextElapsed
    );

    // Audio cue for heartbeat countdown if SLA is running out
    if (state.isWarRoomAudioEnabled && telemetry.timeRemainingSec <= 45 && telemetry.timeRemainingSec > 0) {
      if (telemetry.timeRemainingSec % 2 === 0) {
        audioFx.playHeartbeat();
      }
    }

    if (telemetry.timeRemainingSec <= 0) {
      if (state.isWarRoomAudioEnabled) {
        audioFx.playIncidentFailed();
      }
      set({
        warRoomElapsedSec: nextElapsed,
        warRoomTimeRemainingSec: 0,
        warRoomAccumulatedLoss: telemetry.accumulatedFinancialLossUsd,
        warRoomErrorRate: telemetry.errorRatePercent,
        warRoomLatencyMs: telemetry.p99LatencyMs,
        warRoomHealthStatus: "CRITICAL",
        warRoomStatus: "FAILED",
        warRoomChatMessages: newMessages,
        isWarRoomFailureModalOpen: true,
      });
      return;
    }

    set({
      warRoomElapsedSec: nextElapsed,
      warRoomTimeRemainingSec: telemetry.timeRemainingSec,
      warRoomAccumulatedLoss: telemetry.accumulatedFinancialLossUsd,
      warRoomErrorRate: telemetry.errorRatePercent,
      warRoomLatencyMs: telemetry.p99LatencyMs,
      warRoomHealthStatus: telemetry.systemHealthStatus,
      warRoomChatMessages: newMessages,
    });
  },

  setWarRoomActiveTab: (tab) => set({ warRoomActiveTab: tab }),

  setWarRoomHotfixCode: (code: string) => {
    const lang = get().warRoomHotfixLanguage;
    set((s) => ({
      warRoomHotfixCode: {
        ...s.warRoomHotfixCode,
        [lang]: code,
      },
    }));
  },

  setWarRoomHotfixLanguage: (lang) => set({ warRoomHotfixLanguage: lang }),

  runWarRoomHotfixAction: () => {
    const state = get();
    const incident: IncidentScenario =
      INCIDENT_SCENARIOS.find((s) => s.id === state.activeIncidentId) || INCIDENT_SCENARIOS[0];

    const currentCode = state.warRoomHotfixCode[state.warRoomHotfixLanguage];
    const result = incident.hotfixTask.validateHotfix(currentCode, state.warRoomHotfixLanguage);

    if (result.passed) {
      if (state.isWarRoomAudioEnabled) {
        audioFx.playIncidentResolved();
      }
      // Award SRE Incident Commander XP
      state.addXp(150);

      set({
        warRoomStatus: "RESOLVED",
        warRoomErrorRate: 0.05,
        warRoomLatencyMs: 38,
        warRoomHealthStatus: "OPERATIONAL",
        warRoomHotfixLogs: result.logs,
        warRoomHotfixError: null,
        isWarRoomVictoryModalOpen: true,
      });
      return true;
    } else {
      audioFx.playErrorBuzz();
      set({
        warRoomHotfixLogs: result.logs,
        warRoomHotfixError: result.error || "Hotfix validation failed.",
      });
      return false;
    }
  },

  toggleWarRoomAudio: () => set((s) => ({ isWarRoomAudioEnabled: !s.isWarRoomAudioEnabled })),
  setWarRoomVictoryModalOpen: (open) => set({ isWarRoomVictoryModalOpen: open }),
  setWarRoomFailureModalOpen: (open) => set({ isWarRoomFailureModalOpen: open }),

  resetWarRoomState: () => {
    set({
      warRoomStatus: "STANDBY",
      warRoomElapsedSec: 0,
      warRoomTimeRemainingSec: defaultIncident.timeLimitSec,
      warRoomAccumulatedLoss: 0,
      warRoomErrorRate: defaultIncident.initialErrorRate,
      warRoomLatencyMs: defaultIncident.initialLatencyMs,
      warRoomHealthStatus: "CRITICAL",
      warRoomChatMessages: defaultIncident.slackMessages.filter((m) => m.delaySec <= 2),
      isWarRoomVictoryModalOpen: false,
      isWarRoomFailureModalOpen: false,
      warRoomHotfixError: null,
    });
  },
});
