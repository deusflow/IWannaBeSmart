/**
 * @file apps/web/src/store/slices/cyberSlice.ts
 * @description Station 10: Google Cybersecurity & SOC Analyst Track simulation slice.
 * Manages SIEM security logs, Chronicle queries, Web-Wireshark packet dissections,
 * and NIST CSF incident response workflow.
 */

import type { StateCreator } from "zustand";
import {
  SAMPLE_SECURITY_LOGS,
  SAMPLE_PACKETS,
  querySiemLogs,
  generateIptablesBlockRule,
  type IncidentState,
} from "@iw/sim-engine";
import { audioFx } from "../../utils/audioFx";
import type { WorkbenchStore, CyberSlice } from "../types";

const INITIAL_INCIDENT: IncidentState = {
  incidentId: "INC-2026-9042",
  title: "Multi-Stage Active Adversary Intrusion: SSH Brute Force & Data Exfiltration",
  stage: "DETECT",
  compromisedAssets: ["edge-gw01", "srv-app01"],
  containedIps: [],
  isolatedHosts: [],
  revokedTokens: [],
  isContained: false,
  mitreTtp: "T1110.001 / T1071.004",
};

export const createCyberSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  CyberSlice
> = (set, get) => ({
  cyberLogs: SAMPLE_SECURITY_LOGS,
  cyberLogQuery: "",
  cyberFilteredLogs: SAMPLE_SECURITY_LOGS,
  cyberPackets: SAMPLE_PACKETS,
  cyberSelectedPacketId: 3, // Default to suspicious HTTP credential packet
  cyberActiveTab: "siem",
  nistIncident: INITIAL_INCIDENT,
  containmentAuditLog: [
    "[08:14:02Z] SIEM Alert fired: Multiple SSH failed passwords detected from 198.51.100.42",
    "[08:16:30Z] Network Sentinel: High entropy DNS query pattern matched T1071.004",
  ],
  isCyberVictoryModalOpen: false,

  setCyberActiveTab: (tab) => {
    audioFx.playRelayClick();
    set({ cyberActiveTab: tab });
  },

  setCyberLogQuery: (query) => {
    set({ cyberLogQuery: query });
  },

  executeCyberLogQueryAction: () => {
    audioFx.playRelayClick();
    const { cyberLogs, cyberLogQuery } = get();
    const filtered = querySiemLogs(cyberLogs, cyberLogQuery);
    set({ cyberFilteredLogs: filtered });
  },

  selectCyberPacketAction: (frameNumber) => {
    audioFx.playRelayClick();
    set({ cyberSelectedPacketId: frameNumber });
  },

  executeContainmentAction: (actionType) => {
    const { nistIncident, containmentAuditLog } = get();
    const timestamp = new Date().toISOString().substring(11, 19) + "Z";
    let logMessage = "";
    const updatedIncident: IncidentState = {
      ...nistIncident,
      containedIps: [...nistIncident.containedIps],
      isolatedHosts: [...nistIncident.isolatedHosts],
      revokedTokens: [...nistIncident.revokedTokens],
    };

    if (actionType === "BLOCK_IP") {
      const adversaryIp = "198.51.100.42";
      if (!updatedIncident.containedIps.includes(adversaryIp)) {
        updatedIncident.containedIps.push(adversaryIp);
      }
      const rule = generateIptablesBlockRule(adversaryIp);
      logMessage = `[${timestamp}] Firewall Policy updated: ${rule}`;
      audioFx.playSuccessFanfare();
    } else if (actionType === "ISOLATE_HOST") {
      const host = "srv-app01";
      if (!updatedIncident.isolatedHosts.includes(host)) {
        updatedIncident.isolatedHosts.push(host);
      }
      logMessage = `[${timestamp}] Endpoint Isolated: Disabled eth0 interface on ${host}`;
      audioFx.playRelayClick();
    } else if (actionType === "REVOKE_TOKEN") {
      const token = "JWT_SEC_VAULT_99";
      if (!updatedIncident.revokedTokens.includes(token)) {
        updatedIncident.revokedTokens.push(token);
      }
      logMessage = `[${timestamp}] Identity Revocation: Invalidated compromised session token ${token}`;
      audioFx.playRelayClick();
    }

    const isFullyContained =
      updatedIncident.containedIps.length > 0 &&
      updatedIncident.isolatedHosts.length > 0 &&
      updatedIncident.revokedTokens.length > 0;

    updatedIncident.isContained = isFullyContained;
    if (isFullyContained && updatedIncident.stage === "RESPOND") {
      updatedIncident.stage = "RECOVER";
    }

    set({
      nistIncident: updatedIncident,
      containmentAuditLog: [logMessage, ...containmentAuditLog],
    });
  },

  advanceNistStageAction: () => {
    audioFx.playRelayClick();
    const { nistIncident } = get();
    const stages: Array<IncidentState["stage"]> = ["IDENTIFY", "PROTECT", "DETECT", "RESPOND", "RECOVER"];
    const currentIndex = stages.indexOf(nistIncident.stage);
    const nextStage = stages[Math.min(stages.length - 1, currentIndex + 1)];
    set({
      nistIncident: {
        ...nistIncident,
        stage: nextStage,
      },
    });
  },

  setCyberVictoryModalOpen: (open) => set({ isCyberVictoryModalOpen: open }),

  resetCyberState: () => {
    set({
      cyberLogs: SAMPLE_SECURITY_LOGS,
      cyberLogQuery: "",
      cyberFilteredLogs: SAMPLE_SECURITY_LOGS,
      cyberPackets: SAMPLE_PACKETS,
      cyberSelectedPacketId: 3,
      cyberActiveTab: "siem",
      nistIncident: INITIAL_INCIDENT,
      containmentAuditLog: [
        "[08:14:02Z] SIEM Alert fired: Multiple SSH failed passwords detected from 198.51.100.42",
        "[08:16:30Z] Network Sentinel: High entropy DNS query pattern matched T1071.004",
      ],
      isCyberVictoryModalOpen: false,
    });
  },
});
