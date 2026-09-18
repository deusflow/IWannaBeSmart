/**
 * @file apps/web/src/components/workbench/FdeBlueprintDevice.tsx
 * @description Station 07: Field AI Deployer (Forward Deployed Engineer) Blueprint Device.
 * Interactive cockpit for enterprise AI deployment: Stakeholder discovery dialogue,
 * legacy API adaptation, agent pipeline state machine, security hardening, and client runbook handoff.
 */

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Users,
  Layers,
  Shield,
  ShieldCheck,
  CheckCircle2,
  FileText,
  RotateCcw,
  Server,
  Award,
} from "lucide-react";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";

export const FdeBlueprintDevice: React.FC = () => {
  const { t } = useTranslation();
  const {
    fdeState,
    makeFdeDiscoveryChoiceAction,
    connectFdeLegacyApiAction,
    configureFdeAuthTokenAction,
    connectFdeAgentNodeAction,
    configureFdeRagAction,
    toggleFdeSecurityCheckAction,
    submitFdeRunbookAction,
    resetFdeState,
  } = useWorkbenchStore(
    useShallow((s) => ({
      fdeState: s.fdeState,
      makeFdeDiscoveryChoiceAction: s.makeFdeDiscoveryChoiceAction,
      connectFdeLegacyApiAction: s.connectFdeLegacyApiAction,
      configureFdeAuthTokenAction: s.configureFdeAuthTokenAction,
      connectFdeAgentNodeAction: s.connectFdeAgentNodeAction,
      configureFdeRagAction: s.configureFdeRagAction,
      toggleFdeSecurityCheckAction: s.toggleFdeSecurityCheckAction,
      submitFdeRunbookAction: s.submitFdeRunbookAction,
      resetFdeState: s.resetFdeState,
    }))
  );

  const [legacyUrl, setLegacyUrl] = useState("https://legacy-erp.internal/api/v1/invoices/9821");
  const [authToken, setAuthToken] = useState("bearer_sec_token_99341_enterprise");
  const [chunkSize, setChunkSize] = useState(512);
  const [vectorDbUrl] = useState("https://qdrant.internal:6333");
  const [runbookText, setRunbookText] = useState(
    `# Enterprise AI System Production Runbook and Architecture Operations\n\n## Architecture Overview\nThe pipeline consists of a multi-agent system wired through Vertex AI and legacy ERP connectors. Data flow travels through encrypted VPC Peering channels with strict RBAC access policies.\n\n## Incident Operations Runbook\n1. Check gateway status: curl https://agent.corp/health\n2. Inspect connection pool saturation in Grafana\n3. If error rates spike above 5%, trigger rolling restart: kubectl rollout restart deploy/agent\n4. Fall back to cached replica if timeout persists.\n\n## Troubleshooting Guide\n- Error 401: Verify rotated secret in HashiCorp Vault.\n- Error 503: Check network latency on legacy database link.\n- Hallucination spike: Increase temperature down to 0.1 and check RAG retrieval relevance.`
  );
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [fdeState.deploymentLogs]);

  const handleConnectLegacy = (e: React.FormEvent) => {
    e.preventDefault();
    const res = connectFdeLegacyApiAction(legacyUrl.trim());
    setFeedback({ text: res.output, isError: !res.success });
  };

  const handleConfigureToken = (e: React.FormEvent) => {
    e.preventDefault();
    const res = configureFdeAuthTokenAction(authToken.trim());
    setFeedback({ text: res.output, isError: !res.success });
  };

  const handleConfigureRag = () => {
    const res = configureFdeRagAction(chunkSize, vectorDbUrl);
    setFeedback({ text: res.output, isError: !res.success });
  };

  const handleSubmitRunbook = () => {
    const res = submitFdeRunbookAction(runbookText);
    setFeedback({ text: res.output, isError: !res.success });
  };

  const handleDiscoveryChoice = (choiceId: string, isCorrect: boolean) => {
    makeFdeDiscoveryChoiceAction(
      choiceId,
      isCorrect,
      30,
      isCorrect ? "fde.dialogue.task1.consequence1b" : "fde.dialogue.task1.consequence1a"
    );
    setFeedback({
      text: isCorrect
        ? `✓ Approach approved: Stakeholder trust +15 points`
        : `✗ Approach rejected: Stakeholder trust -10 points`,
      isError: !isCorrect,
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-3 sm:p-4 rounded-xl border border-amber-900/40 shadow-2xl font-mono overflow-y-auto space-y-4">
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/40 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Briefcase className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                STATION 07 // FORWARD DEPLOYED ENGINEER
              </span>
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-900/50 text-amber-300 border border-amber-700/50">
                FIELD APPLIED AI
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-200">
              {t("fde.ui.title", "Client Discovery, Legacy System Adapter & Enterprise Agent Deployment")}
            </h2>
          </div>
        </div>

        {/* Live Client Health Indicators */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-slate-500">TRUST:</span>
            <span
              className={`font-bold ${
                fdeState.clientTrustScore >= 70
                  ? "text-emerald-400"
                  : fdeState.clientTrustScore >= 40
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {fdeState.clientTrustScore}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px] text-slate-500">POSTURE:</span>
            <span
              className={`font-bold uppercase text-[10px] ${
                fdeState.securityPosture === "hardened"
                  ? "text-emerald-400"
                  : fdeState.securityPosture === "moderate"
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {fdeState.securityPosture}
            </span>
          </div>

          <button
            onClick={() => resetFdeState()}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
            title="Reset Field Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Global Feedback Banner ────────────────────────────────────── */}
      {feedback && (
        <div
          className={`px-3 py-2 rounded text-xs border flex items-center justify-between ${
            feedback.isError
              ? "bg-rose-950/60 text-rose-300 border-rose-800/60"
              : "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-200 ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 5-Phase Enterprise Pipeline Strip ─────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        <div
          className={`p-2.5 rounded-lg border transition ${
            fdeState.discoveryComplete
              ? "bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              : "bg-slate-900/40 border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-slate-400">1. DISCOVERY</span>
            {fdeState.discoveryComplete ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Users className="w-3.5 h-3.5 text-slate-600" />
            )}
          </div>
          <div className="font-mono text-[10px]">
            {fdeState.discoveryComplete ? "Pain Point Mapped" : `${fdeState.correctChoicesMade}/4 milestones`}
          </div>
        </div>

        <div
          className={`p-2.5 rounded-lg border transition ${
            fdeState.legacyApiConnected
              ? "bg-sky-950/40 border-sky-500/50 text-sky-200 shadow-[0_0_10px_rgba(14,165,233,0.15)]"
              : "bg-slate-900/40 border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-slate-400">2. INTEGRATION</span>
            <Server className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-mono text-[10px]">
            {fdeState.legacyApiConnected ? "Legacy API Wired" : "Not connected"}
          </div>
        </div>

        <div
          className={`p-2.5 rounded-lg border transition ${
            fdeState.agentPipeline.isValid
              ? "bg-purple-950/40 border-purple-500/50 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
              : "bg-slate-900/40 border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-slate-400">3. AGENT GRAPH</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-mono text-[10px]">
            {fdeState.agentPipeline.isValid
              ? "State Graph Ready"
              : `${fdeState.agentPipeline.nodes.filter((n) => n.connected).length}/5 nodes`}
          </div>
        </div>

        <div
          className={`p-2.5 rounded-lg border transition ${
            fdeState.securityPosture === "hardened"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
              : "bg-slate-900/40 border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-slate-400">4. ZERO TRUST</span>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-mono text-[10px]">
            {fdeState.securityChecks.filter((c) => c.passed).length}/{fdeState.securityChecks.length} checks pass
          </div>
        </div>

        <div
          className={`p-2.5 rounded-lg border transition ${
            fdeState.handoffComplete
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
              : "bg-slate-900/40 border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-slate-400">5. RUNBOOK HANDOFF</span>
            <Award className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-mono text-[10px]">
            {fdeState.handoffComplete ? "Accepted (100%)" : `Score: ${fdeState.documentationScore}/100`}
          </div>
        </div>
      </div>

      {/* ── Main Interactive Cockpit Panels ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-[380px]">
        {/* Panel 1: Discovery & Legacy Connector */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              DISCOVERY & INTEGRATION
            </span>
          </div>

          {/* Stakeholder Dialogue Simulation */}
          <div className="space-y-1.5 bg-slate-950 p-2.5 rounded border border-slate-800">
            <div className="text-[11px] text-amber-300 font-semibold">VP of Operations:</div>
            <div className="text-[11px] text-slate-300 italic">
              "We process 45,000 invoices monthly. How will your AI agent handle discrepancy mismatches?"
            </div>
            <div className="grid grid-cols-1 gap-1.5 pt-1">
              <button
                onClick={() => handleDiscoveryChoice("choice-a", false)}
                className="text-left text-[10px] p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
              >
                A) "It will auto-approve everything with LLM magic and zero human intervention."
              </button>
              <button
                onClick={() => handleDiscoveryChoice("choice-b", true)}
                className="text-left text-[10px] p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
              >
                B) "We'll build a Human-in-the-Loop review queue when confidence score is &lt; 95%."
              </button>
            </div>
          </div>

          {/* Legacy ERP URL */}
          <form onSubmit={handleConnectLegacy} className="space-y-1.5">
            <label className="text-[11px] text-slate-400">Legacy ERP Gateway URL:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={legacyUrl}
                onChange={(e) => setLegacyUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-sky-300 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition"
              >
                Connect
              </button>
            </div>
          </form>

          {/* Auth Bearer Token */}
          <form onSubmit={handleConfigureToken} className="space-y-1.5">
            <label className="text-[11px] text-slate-400">Bearer Auth Token:</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded transition border border-slate-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Panel 2: Agent Architecture & Security Hardening */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              AGENT GRAPH & ZERO TRUST
            </span>
          </div>

          {/* Agent Pipeline Nodes Interactive Connector */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">Pipeline State Machine Nodes:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {fdeState.agentPipeline.nodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => connectFdeAgentNodeAction(node.id)}
                  className={`p-1.5 text-left rounded border transition flex items-center justify-between ${
                    node.connected
                      ? "bg-purple-950/60 border-purple-500/60 text-purple-200"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="text-[10px] font-bold">{node.label}</span>
                  {node.connected && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* RAG Settings */}
          <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-400">RAG Chunk Size:</span>
              <span className="text-purple-300 font-bold">{chunkSize} tokens</span>
            </div>
            <input
              type="range"
              min={128}
              max={2048}
              step={64}
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-800"
            />
            <button
              onClick={handleConfigureRag}
              className="w-full py-1 text-[11px] font-bold rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 transition"
            >
              Apply RAG Chunking
            </button>
          </div>

          {/* Security Checks Checkboxes */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">Zero Trust Guardrails:</label>
            <div className="grid grid-cols-2 gap-1">
              {fdeState.securityChecks.map((check) => (
                <button
                  key={check.id}
                  onClick={() => toggleFdeSecurityCheckAction(check.id)}
                  className={`p-1.5 rounded text-[10px] text-left border flex items-center justify-between transition ${
                    check.passed
                      ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-200"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <span className="truncate">{check.id}</span>
                  {check.passed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 3: Runbook & Incident Operations Handoff */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              RUNBOOK & CLIENT HANDOFF
            </span>
            <span className="text-[10px] text-slate-500">
              Words: {runbookText.trim().split(/\s+/).length}
            </span>
          </div>

          <textarea
            value={runbookText}
            onChange={(e) => setRunbookText(e.target.value)}
            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-emerald-500 resize-none min-h-[160px]"
            placeholder="Author the Incident Operations Runbook..."
          />

          <button
            onClick={handleSubmitRunbook}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-slate-950 font-bold text-xs rounded transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30"
          >
            <Award className="w-3.5 h-3.5" />
            Submit Runbook for Production Handoff
          </button>

          {/* Deployment Logs Mini Stream */}
          <div className="bg-slate-950 border border-slate-800 rounded p-2 text-[10px] font-mono max-h-28 overflow-y-auto space-y-1">
            {fdeState.deploymentLogs.slice(-6).map((log, i) => (
              <div
                key={i}
                className={
                  log.includes("ERROR")
                    ? "text-rose-400"
                    : log.includes("✓")
                    ? "text-emerald-400"
                    : "text-slate-400"
                }
              >
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
