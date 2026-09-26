/**
 * @file apps/web/src/components/workbench/CyberBlueprintDevice.tsx
 * @description Station 10: Google Cybersecurity & SOC Analyst Architecture Blueprint Device.
 * Interactive Cockpit:
 * 1. SOC SIEM Studio (Google Chronicle / Splunk live query filter & MITRE ATT&CK mapping)
 * 2. Web-Wireshark Packet Dissector (3-pane packet list, dissected layer tree, ASCII hex dump)
 * 3. NIST CSF Incident Response Command Post (5-stage containment state machine & firewall push)
 */

import React from "react";
import {
  ShieldAlert,
  Search,
  Radio,
  Terminal,
  Activity,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  Filter,
  Eye,
  Zap,
} from "lucide-react";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { dissectPacket } from "@iw/sim-engine";

export const CyberBlueprintDevice: React.FC = () => {
  const {
    cyberFilteredLogs,
    cyberLogQuery,
    cyberPackets,
    cyberSelectedPacketId,
    cyberActiveTab,
    nistIncident,
    containmentAuditLog,
    setCyberActiveTab,
    setCyberLogQuery,
    executeCyberLogQueryAction,
    selectCyberPacketAction,
    executeContainmentAction,
    advanceNistStageAction,
    resetCyberState,
  } = useWorkbenchStore(
    useShallow((s) => ({
      cyberFilteredLogs: s.cyberFilteredLogs,
      cyberLogQuery: s.cyberLogQuery,
      cyberPackets: s.cyberPackets,
      cyberSelectedPacketId: s.cyberSelectedPacketId,
      cyberActiveTab: s.cyberActiveTab,
      nistIncident: s.nistIncident,
      containmentAuditLog: s.containmentAuditLog,
      setCyberActiveTab: s.setCyberActiveTab,
      setCyberLogQuery: s.setCyberLogQuery,
      executeCyberLogQueryAction: s.executeCyberLogQueryAction,
      selectCyberPacketAction: s.selectCyberPacketAction,
      executeContainmentAction: s.executeContainmentAction,
      advanceNistStageAction: s.advanceNistStageAction,
      resetCyberState: s.resetCyberState,
    }))
  );

  const selectedPacket = cyberPackets.find(
    (p) => p.frameNumber === cyberSelectedPacketId
  ) || cyberPackets[0];

  const dissected = selectedPacket ? dissectPacket(selectedPacket) : null;

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100">
      {/* ── Top Command Bar ── */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <ShieldAlert size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide text-red-200">
                GOOGLE CYBERSECURITY LAB
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-red-950 text-red-400 border border-red-800/50">
                SOC TIER-1 / MITRE ATT&CK
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live Chronicle SIEM • Web-Wireshark Dissector • NIST CSF Response
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCyberActiveTab("siem")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              cyberActiveTab === "siem"
                ? "bg-red-500 text-slate-950 shadow-md shadow-red-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Activity size={13} />
            <span>1. Chronicle SIEM</span>
          </button>
          <button
            onClick={() => setCyberActiveTab("wireshark")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              cyberActiveTab === "wireshark"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Radio size={13} />
            <span>2. Web-Wireshark</span>
          </button>
          <button
            onClick={() => setCyberActiveTab("nist")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              cyberActiveTab === "nist"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Lock size={13} />
            <span>3. NIST Incident Response</span>
          </button>
        </div>
      </div>

      {/* ── Main Interactive Cockpit Area ── */}
      <div className="flex-1 p-5 overflow-y-auto">
        {/* TAB 1: SOC Chronicle SIEM Studio */}
        {cyberActiveTab === "siem" && (
          <div className="space-y-4">
            {/* Search / Filter Bar */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={cyberLogQuery}
                    onChange={(e) => setCyberLogQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && executeCyberLogQueryAction()}
                    placeholder="Chronicle / KQL Query (e.g. severity = CRITICAL AND eventCategory = auth)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500/80"
                  />
                </div>
                <button
                  onClick={executeCyberLogQueryAction}
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 text-slate-950 rounded-xl text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-red-500/20"
                >
                  <Filter size={14} />
                  <span>Execute Query</span>
                </button>
              </div>

              {/* Quick Query Presets */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-500">Швидкі пресети:</span>
                {[
                  { label: "Усі Critical алерти", q: "severity = CRITICAL" },
                  { label: "SSH Brute Force", q: "eventCategory = auth AND message contains SSH" },
                  { label: "WAF SQL Injection", q: "message contains SQL" },
                  { label: "DNS Tunneling", q: "eventCategory = dns" },
                  { label: "Скинути фільтр (*)", q: "*" },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCyberLogQuery(p.q);
                      setTimeout(executeCyberLogQueryAction, 20);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/50 text-slate-300 font-mono transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SIEM Log Telemetry Table */}
            <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Журнал Подій Безпеки ({cyberFilteredLogs.length} записів)</span>
                <span className="text-[10px] text-red-400">Chronicle Ingestion: Active</span>
              </div>
              <div className="divide-y divide-slate-800/60 max-h-[360px] overflow-y-auto font-mono text-xs">
                {cyberFilteredLogs.map((log) => {
                  const isCrit = log.severity === "CRITICAL";
                  const isHigh = log.severity === "HIGH";
                  return (
                    <div
                      key={log.id}
                      className="p-3 hover:bg-slate-900/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCrit
                              ? "bg-red-950 text-red-300 border border-red-800/80 animate-pulse"
                              : isHigh
                              ? "bg-orange-950 text-orange-300 border border-orange-800/80"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {log.severity}
                        </span>
                        <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                        <span className="text-slate-300 font-semibold truncate">
                          {log.sourceIp} → {log.destIp}
                        </span>
                        <span className="text-slate-400 truncate max-w-md">
                          {log.message}
                        </span>
                      </div>
                      {log.mitreTtp && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[10px] font-semibold">
                            {log.mitreTtp} ({log.mitreName || "ATT&CK"})
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Web-Wireshark Packet Dissector */}
        {cyberActiveTab === "wireshark" && (
          <div className="space-y-4">
            {/* Top Packet Stream Grid */}
            <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 overflow-hidden">
              <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Wireshark Live Capture (PCAP Frame Stream)</span>
                <span className="text-[10px] text-cyan-400">Promiscuous Mode: ON</span>
              </div>
              <div className="divide-y divide-slate-800/50 max-h-[160px] overflow-y-auto font-mono text-xs">
                {cyberPackets.map((pkt) => {
                  const isSelected = pkt.frameNumber === cyberSelectedPacketId;
                  return (
                    <div
                      key={pkt.frameNumber}
                      onClick={() => selectCyberPacketAction(pkt.frameNumber)}
                      className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-cyan-950/70 border-l-4 border-cyan-400 text-cyan-100"
                          : "hover:bg-slate-900/60 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-bold">#{pkt.frameNumber}</span>
                        <span className="text-slate-400 text-[11px]">{pkt.timestamp}ms</span>
                        <span className="text-slate-200">{pkt.sourceIp}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-slate-200">{pkt.destIp}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            pkt.protocol === "HTTP"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : pkt.protocol === "ARP"
                              ? "bg-purple-950 text-purple-400 border border-purple-800"
                              : "bg-blue-950 text-blue-400 border border-blue-800"
                          }`}
                        >
                          {pkt.protocol}
                        </span>
                        <span className="text-slate-400 text-[11px] truncate max-w-xs">
                          Len: {pkt.length} bytes
                        </span>
                      </div>
                      {pkt.isMalicious && (
                        <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-300 text-[10px] font-bold animate-pulse">
                          ANOMALY
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Split Inspection: Layer Tree & Hex Dump */}
            {selectedPacket && dissected && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Dissected Layer Tree */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400 font-bold border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Eye size={14} className="text-cyan-400" />
                      <span>Packet Dissection (Frame #{selectedPacket.frameNumber})</span>
                    </span>
                    <span className="text-[10px] text-cyan-400">{selectedPacket.protocol}</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800 text-slate-300">
                      <div className="text-slate-500 text-[10px] font-bold">LAYER 2 (DATA LINK):</div>
                      <div>{dissected.layer2}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800 text-slate-300">
                      <div className="text-slate-500 text-[10px] font-bold">LAYER 3 (NETWORK):</div>
                      <div>{dissected.layer3}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800 text-slate-300">
                      <div className="text-slate-500 text-[10px] font-bold">LAYER 4 (TRANSPORT):</div>
                      <div>{dissected.layer4}</div>
                    </div>
                    {dissected.layer7 && (
                      <div className="p-2 rounded bg-slate-950/70 border border-emerald-900/50 text-emerald-300">
                        <div className="text-emerald-500 text-[10px] font-bold">LAYER 7 (APPLICATION):</div>
                        <div className="break-all">{dissected.layer7}</div>
                      </div>
                    )}
                  </div>
                  {selectedPacket.threatReason && (
                    <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/70 text-red-200 text-xs flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={15} className="shrink-0 text-red-400" />
                        <span>{selectedPacket.threatReason}</span>
                      </div>
                      <button
                        type="button"
                        id="btn-block-ip-wireshark"
                        onClick={() => executeContainmentAction("BLOCK_IP")}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold font-mono transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldAlert size={13} />
                        <span>Блокувати IP</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ASCII Hex Dump Pane */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Terminal size={14} className="text-amber-400" />
                      <span>Payload Hex Dump & ASCII Decoder</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Offset | Hex | ASCII</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-amber-200/90 leading-relaxed overflow-x-auto max-h-[220px]">
                    {selectedPacket.hexDump || "No hex payload for transport handshake."}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NIST CSF Incident Response Command Post */}
        {cyberActiveTab === "nist" && (
          <div className="space-y-4">
            {/* 5-Phase NIST Stepper */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-amber-300">
                    {nistIncident.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Incident ID: {nistIncident.incidentId} • ATT&CK: {nistIncident.mitreTtp}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      nistIncident.isContained
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                        : "bg-red-950 text-red-300 border border-red-700 animate-pulse"
                    }`}
                  >
                    {nistIncident.isContained ? "CONTAINED / SECURED" : "ACTIVE THREAT"}
                  </span>
                  <button
                    onClick={advanceNistStageAction}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors"
                  >
                    Next Stage →
                  </button>
                </div>
              </div>

              {/* Visual NIST Steps */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {[
                  { id: "IDENTIFY", label: "1. Identify", desc: "Asset mapping" },
                  { id: "PROTECT", label: "2. Protect", desc: "Hardening & IAM" },
                  { id: "DETECT", label: "3. Detect", desc: "Anomalies & SIEM" },
                  { id: "RESPOND", label: "4. Respond", desc: "Containment block" },
                  { id: "RECOVER", label: "5. Recover", desc: "Restoration" },
                ].map((s) => {
                  const isActive = nistIncident.stage === s.id;
                  return (
                    <div
                      key={s.id}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isActive
                          ? "bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-lg shadow-amber-400/20"
                          : "bg-slate-950/60 border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="text-xs font-mono">{s.label}</div>
                      <div className={`text-[10px] mt-0.5 ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                        {s.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Response Containment Levers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => executeContainmentAction("BLOCK_IP")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  nistIncident.containedIps.includes("198.51.100.42")
                    ? "bg-emerald-950/60 border-emerald-700 text-emerald-200"
                    : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-red-500/60 text-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold">1. Firewall IP Block</span>
                  {nistIncident.containedIps.includes("198.51.100.42") ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <Zap size={16} className="text-red-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Inject automated iptables DROP rule on boundary gateway for 198.51.100.42.
                </p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {nistIncident.containedIps.includes("198.51.100.42") ? "RULE ACTIVE (DROPPED)" : "CLICK TO INJECT RULE"}
                </span>
              </button>

              <button
                onClick={() => executeContainmentAction("ISOLATE_HOST")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  nistIncident.isolatedHosts.includes("srv-app01")
                    ? "bg-emerald-950/60 border-emerald-700 text-emerald-200"
                    : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-red-500/60 text-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold">2. Isolate Compromised Host</span>
                  {nistIncident.isolatedHosts.includes("srv-app01") ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <Lock size={16} className="text-red-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Quarantine host srv-app01 from internal VPC to prevent lateral movement.
                </p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {nistIncident.isolatedHosts.includes("srv-app01") ? "HOST ISOLATED (DOWN)" : "CLICK TO QUARANTINE"}
                </span>
              </button>

              <button
                onClick={() => executeContainmentAction("REVOKE_TOKEN")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  nistIncident.revokedTokens.includes("JWT_SEC_VAULT_99")
                    ? "bg-emerald-950/60 border-emerald-700 text-emerald-200"
                    : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-red-500/60 text-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold">3. Revoke Session Tokens</span>
                  {nistIncident.revokedTokens.includes("JWT_SEC_VAULT_99") ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <Unlock size={16} className="text-red-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Flush stolen credentials and invalidate Vault bearer token JWT_SEC_VAULT_99.
                </p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {nistIncident.revokedTokens.includes("JWT_SEC_VAULT_99") ? "TOKEN REVOKED" : "CLICK TO INVALIDATE"}
                </span>
              </button>
            </div>

            {/* SOC Incident Audit Trail */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 font-bold border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Terminal size={14} className="text-emerald-400" />
                  <span>SOC Incident Containment Audit Trail</span>
                </span>
                <button
                  onClick={resetCyberState}
                  className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                >
                  Reset Incident State
                </button>
              </div>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto text-[11px]">
                {containmentAuditLog.map((entry, idx) => (
                  <div key={idx} className="text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">❯</span>
                    <span>{entry}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
