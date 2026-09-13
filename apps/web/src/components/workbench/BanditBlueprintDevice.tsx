/**
 * @file apps/web/src/components/workbench/BanditBlueprintDevice.tsx
 * @description Blueprint-styled Cyber Bandit Lab device: Hacker UNIX CLI Terminal,
 * Network Sniffer & Packet Tampering Studio, and Blue Team SOC Defense Inspector.
 */

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Terminal,
  Shield,
  ShieldCheck,
  Radio,
  Database,
  AlertTriangle,
  CheckCircle2,
  Send,
  Sliders,
  Flame,
  Zap,
  Flag,
  Globe,
  Binary,
} from "lucide-react";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import type { DefenseStatus } from "@iw/sim-engine";

export const BanditBlueprintDevice: React.FC = () => {
  const { t } = useTranslation();
  const {
    banditState,
    banditCliInput,
    sqlQueryInput,
    sqlQueryResult,
    rateLimitStatus,
    setBanditCliInput,
    runBanditCommand,
    submitFlagDirect,
    setTamperJson,
    forwardTransitPacketAction,
    dropTransitPacketAction,
    toggleBanditDefenseAction,
    setSqlQueryInput,
    runSqlQueryAction,
    simulateRateLimitAction,
    resetBanditStationToLevel,
  } = useWorkbenchStore(
    useShallow((s) => ({
      banditState: s.banditState,
      banditCliInput: s.banditCliInput,
      sqlQueryInput: s.sqlQueryInput,
      sqlQueryResult: s.sqlQueryResult,
      rateLimitStatus: s.rateLimitStatus,
      setBanditCliInput: s.setBanditCliInput,
      runBanditCommand: s.runBanditCommand,
      submitFlagDirect: s.submitFlagDirect,
      setTamperJson: s.setTamperJson,
      forwardTransitPacketAction: s.forwardTransitPacketAction,
      dropTransitPacketAction: s.dropTransitPacketAction,
      toggleBanditDefenseAction: s.toggleBanditDefenseAction,
      setSqlQueryInput: s.setSqlQueryInput,
      runSqlQueryAction: s.runSqlQueryAction,
      simulateRateLimitAction: s.simulateRateLimitAction,
      resetBanditStationToLevel: s.resetBanditStationToLevel,
    }))
  );

  const [directFlagInput, setDirectFlagInput] = useState("");
  const [decoderInput, setDecoderInput] = useState("YmFuZGl0e2I2NF9kM2MwZDNkX3QwazNuX2MwbmYxcm0zZH0=");
  const [decoderResult, setDecoderResult] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal on new output
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [banditState.cliOutput]);

  // Decode helper
  useEffect(() => {
    try {
      setDecoderResult(atob(decoderInput.trim()));
    } catch {
      setDecoderResult("[Invalid Base64 string]");
    }
  }, [decoderInput]);

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!banditCliInput.trim()) return;
    runBanditCommand(banditCliInput);
  };

  const handleDirectFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directFlagInput.trim()) return;
    const ok = submitFlagDirect(directFlagInput.trim());
    if (ok) {
      setFeedbackMessage({ text: t("bandit.ui.flagAccepted", "Flag Verified & Captured!"), isError: false });
      setDirectFlagInput("");
    } else {
      setFeedbackMessage({ text: t("bandit.ui.flagRejected", "Access Denied: Invalid Flag!"), isError: true });
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleForwardPacket = () => {
    const { responseStatus, message } = forwardTransitPacketAction();
    setFeedbackMessage({ text: `${responseStatus}: ${message}`, isError: responseStatus !== 200 });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleDropPacket = () => {
    dropTransitPacketAction();
    setFeedbackMessage({ text: t("bandit.ui.packetDropped", "Packet dropped from transit!"), isError: true });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleTamperPreset = (type: "price" | "role" | "admin") => {
    if (type === "price") {
      setTamperJson(JSON.stringify({ price: 1, item: "Quantum Cryptographic Key", orderId: "ORD-942" }, null, 2));
    } else if (type === "role") {
      setTamperJson(JSON.stringify({ requestedRole: "admin", user: "bandit", permission: "ALL" }, null, 2));
    } else {
      setTamperJson(JSON.stringify({ price: 0, requestedRole: "root", account: "ACC-HACKER" }, null, 2));
    }
  };

  const handleRapidFireBruteForce = () => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        simulateRateLimitAction();
      }, i * 150);
    }
  };

  const defconLevel = banditState.defenseState.rateLimitActive &&
    banditState.defenseState.hmacActive &&
    banditState.defenseState.sqlParametrized &&
    banditState.defenseState.tlsEnabled
      ? 5
      : banditState.defenseState.hmacActive || banditState.defenseState.sqlParametrized
      ? 3
      : 1;

  return (
    <div className="w-full bg-[#070B12] rounded-xl border border-emerald-950/60 p-4 shadow-2xl space-y-4 font-mono select-none">
      {/* ── Top Header Toolbar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/40 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-emerald-500 font-bold">
                STATION 06 // CYBER BANDIT LAB
              </span>
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-900/50 text-emerald-300 border border-emerald-700/50">
                ACTIVE LAB
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-200">
              {t("bandit.ui.title", "Ethical Hacking & Blue/Red Team Defense Studio")}
            </h2>
          </div>
        </div>

        {/* Level Selector Bar */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 px-2 font-bold flex items-center gap-1">
            <Flag className="w-3.5 h-3.5 text-emerald-400" />
            LEVELS:
          </span>
          {[1, 2, 3, 4, 5, 6].map((lvl) => {
            const isCurrent = banditState.level === lvl;
            const isCaptured = Boolean(banditState.capturedFlags[lvl]);
            return (
              <button
                key={lvl}
                onClick={() => resetBanditStationToLevel(lvl)}
                className={`px-2.5 py-1 text-xs rounded font-bold transition-all flex items-center gap-1 ${
                  isCurrent
                    ? "bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    : isCaptured
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/40"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>L{lvl}</span>
                {isCaptured && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Direct Flag Submit Bar */}
        <form onSubmit={handleDirectFlagSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={directFlagInput}
              onChange={(e) => setDirectFlagInput(e.target.value)}
              placeholder="bandit{...}"
              className="bg-slate-950 border border-emerald-900/60 rounded-md px-2.5 py-1 text-xs text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 w-44 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded transition-colors flex items-center gap-1"
          >
            <Flag className="w-3.5 h-3.5" />
            {t("bandit.ui.submitFlag", "Submit")}
          </button>
        </form>
      </div>

      {/* Global Feedback Alert Banner */}
      {feedbackMessage && (
        <div
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 border transition-all ${
            feedbackMessage.isError
              ? "bg-rose-950/60 border-rose-800 text-rose-300"
              : "bg-emerald-950/60 border-emerald-800 text-emerald-300"
          }`}
        >
          {feedbackMessage.isError ? (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* ── 3-Panel Main Layout ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ── LEFT CHASSIS: Virtual UNIX Terminal (4 cols) ──────────── */}
        <div className="lg:col-span-4 bg-slate-950/90 rounded-lg border border-emerald-900/40 p-3 flex flex-col h-[560px] shadow-inner">
          <div className="flex items-center justify-between border-b border-emerald-950 pb-2 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Terminal className="w-4 h-4" />
              <span>BANDIT UNIX CLI // TTY1</span>
            </div>
            <span className="text-[10px] text-slate-500">uid=1001(bandit)</span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[
              "ls -la",
              "cat .secret_pass",
              "cat .env",
              "base64 -d data.b64",
              "grep API_SECRET .env",
              "chmod 0600 .secret_pass",
              "clear",
            ].map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  setBanditCliInput(cmd);
                  runBanditCommand(cmd);
                }}
                className="px-2 py-0.5 bg-slate-900 hover:bg-emerald-950/80 border border-slate-800 hover:border-emerald-700/60 text-[11px] text-emerald-300/80 rounded transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Terminal Console Output Screen */}
          <div className="flex-1 bg-[#05080E] rounded p-2.5 overflow-y-auto font-mono text-[11px] text-emerald-400/90 space-y-1 border border-emerald-950 shadow-inner">
            {banditState.cliOutput.map((line, idx) => (
              <div
                key={idx}
                className={`leading-relaxed whitespace-pre-wrap ${
                  line.startsWith("$")
                    ? "text-cyan-400 font-bold"
                    : line.startsWith("[✓]")
                    ? "text-emerald-300 font-bold bg-emerald-950/30 p-1 rounded"
                    : line.startsWith("[✗]") || line.includes("command not found")
                    ? "text-rose-400"
                    : "text-emerald-400/80"
                }`}
              >
                {line}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Command Prompt Input */}
          <form onSubmit={handleCliSubmit} className="mt-2 flex items-center gap-1.5">
            <span className="text-emerald-500 font-bold text-xs">$</span>
            <input
              type="text"
              value={banditCliInput}
              onChange={(e) => setBanditCliInput(e.target.value)}
              placeholder="type command (e.g. ls -la, cat ...)"
              className="flex-1 bg-slate-900/90 border border-emerald-950 rounded px-2 py-1 text-xs text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="p-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-400 rounded transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* ── CENTER CHASSIS: Wire Tap & Packet Tampering (4 cols) ───── */}
        <div className="lg:col-span-4 bg-slate-950/90 rounded-lg border border-cyan-900/40 p-3 flex flex-col h-[560px] shadow-inner space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>WIRE TAP // PACKET INTERCEPTOR</span>
            </div>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-950 border border-cyan-800/60 text-cyan-300">
              {banditState.transitPacket?.status ?? "IDLE"}
            </span>
          </div>

          {/* Transit Packet Card */}
          {banditState.transitPacket && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-md p-2.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-cyan-600 text-slate-950">
                    {banditState.transitPacket.method}
                  </span>
                  <span className="text-slate-300 font-mono text-[11px] truncate max-w-[160px]">
                    {banditState.transitPacket.url}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {banditState.transitPacket.id}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Host: {banditState.transitPacket.headers["Host"]}
              </div>
              <div className="text-[10px] text-slate-400 truncate font-mono">
                X-Signature: {banditState.transitPacket.signature || "none"}
              </div>
            </div>
          )}

          {/* Quick Exploit Presets */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              PARAMETER TAMPERING SHORTCUTS:
            </span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleTamperPreset("price")}
                className="px-2 py-1 bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 text-[10px] text-cyan-300 rounded text-center transition-colors"
              >
                Price -&gt; $1
              </button>
              <button
                onClick={() => handleTamperPreset("role")}
                className="px-2 py-1 bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 text-[10px] text-cyan-300 rounded text-center transition-colors"
              >
                Role -&gt; Admin
              </button>
              <button
                onClick={() => handleTamperPreset("admin")}
                className="px-2 py-1 bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 text-[10px] text-cyan-300 rounded text-center transition-colors"
              >
                Root Hijack
              </button>
            </div>
          </div>

          {/* JSON Tamper Editor */}
          <div className="flex-1 flex flex-col min-h-0 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold flex items-center justify-between">
              <span>PAYLOAD INSPECTOR (JSON):</span>
              {banditState.transitPacket?.isTampered && (
                <span className="text-amber-400 text-[10px] flex items-center gap-1">
                  <Flame className="w-3 h-3" /> TAMPERED
                </span>
              )}
            </span>
            <textarea
              value={banditState.tamperBuffer}
              onChange={(e) => setTamperJson(e.target.value)}
              className="flex-1 bg-[#05080E] border border-cyan-950 rounded p-2 text-xs font-mono text-cyan-300 resize-none focus:outline-none focus:border-cyan-500 shadow-inner"
            />
          </div>

          {/* Forward / Drop Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleForwardPacket}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            >
              <Zap className="w-3.5 h-3.5" />
              Forward Packet
            </button>
            <button
              onClick={handleDropPacket}
              className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Drop Packet
            </button>
          </div>

          {/* Quick Base64 Tool */}
          <div className="border-t border-slate-800/80 pt-2 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <Binary className="w-3 h-3 text-cyan-400" />
              INSTANT BASE64 DECODER:
            </span>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={decoderInput}
                onChange={(e) => setDecoderInput(e.target.value)}
                placeholder="Paste base64 string..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-300 focus:outline-none"
              />
            </div>
            <div className="bg-[#05080E] border border-slate-900 rounded p-1 text-[10px] text-emerald-400 font-mono truncate">
              -&gt; {decoderResult}
            </div>
          </div>
        </div>

        {/* ── RIGHT CHASSIS: Blue Team SOC & Defense Inspector (4 cols) ─ */}
        <div className="lg:col-span-4 bg-slate-950/90 rounded-lg border border-purple-900/40 p-3 flex flex-col h-[560px] shadow-inner space-y-3">
          <div className="flex items-center justify-between border-b border-purple-950 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>BLUE TEAM SOC // DEFENSE SHIELDS</span>
            </div>
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                defconLevel === 5
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : defconLevel === 3
                  ? "bg-amber-950 text-amber-300 border border-amber-800"
                  : "bg-rose-950 text-rose-300 border border-rose-800 animate-pulse"
              }`}
            >
              DEFCON {defconLevel}
            </span>
          </div>

          {/* Defense Shield Toggle Switches */}
          <div className="space-y-1.5 bg-slate-900/60 p-2 rounded-md border border-slate-800">
            {[
              {
                key: "tlsEnabled" as keyof DefenseStatus,
                label: "TLS 1.3 / HTTPS Encryption",
                icon: Globe,
              },
              {
                key: "hmacActive" as keyof DefenseStatus,
                label: "HMAC-SHA256 Signature Guard",
                icon: ShieldCheck,
              },
              {
                key: "sqlParametrized" as keyof DefenseStatus,
                label: "SQL Parameterized Statements",
                icon: Database,
              },
              {
                key: "rateLimitActive" as keyof DefenseStatus,
                label: "Token Bucket Rate Limiting",
                icon: Sliders,
              },
            ].map(({ key, label, icon: Icon }) => {
              const active = banditState.defenseState[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleBanditDefenseAction(key)}
                  className={`w-full px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors border ${
                    active
                      ? "bg-emerald-950/40 border-emerald-700/60 text-emerald-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-emerald-400" : "text-slate-500"}`} />
                    <span className="text-[11px] font-semibold">{label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      active ? "bg-emerald-800 text-white" : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {active ? "ACTIVE" : "DISABLED"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SQL Injection Sandbox Tester */}
          <div className="bg-slate-900/70 border border-slate-800 rounded p-2 space-y-1.5">
            <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
              <Database className="w-3 h-3" />
              SQL INJECTION SIMULATOR:
            </span>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={sqlQueryInput}
                onChange={(e) => setSqlQueryInput(e.target.value)}
                placeholder="' OR 1=1 --"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-purple-300 focus:outline-none"
              />
              <button
                onClick={() => runSqlQueryAction(sqlQueryInput)}
                className="px-2.5 py-0.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-bold rounded"
              >
                Test
              </button>
            </div>
            {sqlQueryResult && (
              <div
                className={`p-1.5 rounded text-[10px] font-mono leading-tight border ${
                  sqlQueryResult.vulnerabilityExploited
                    ? "bg-rose-950/60 border-rose-800 text-rose-300"
                    : "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                }`}
              >
                {sqlQueryResult.message}
              </div>
            )}
          </div>

          {/* Rate Limiting Brute Force Sandbox */}
          <div className="bg-slate-900/70 border border-slate-800 rounded p-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                <Sliders className="w-3 h-3" />
                BRUTE-FORCE & RATE LIMITER TEST:
              </span>
              <span className="text-[10px] text-slate-400">
                Tokens: {banditState.rateLimiter.tokens}/{banditState.rateLimiter.maxTokens}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => simulateRateLimitAction()}
                className="flex-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
              >
                Send 1 Request
              </button>
              <button
                onClick={handleRapidFireBruteForce}
                className="flex-1 px-2 py-1 bg-rose-900/60 hover:bg-rose-800/80 border border-rose-700/60 text-rose-200 text-xs font-bold rounded transition-colors"
              >
                Rapid 6x Burst
              </button>
            </div>
            {rateLimitStatus && (
              <div
                className={`p-1.5 rounded text-[10px] font-mono leading-tight border ${
                  rateLimitStatus.statusCode === 429
                    ? "bg-rose-950/60 border-rose-800 text-rose-300 font-bold"
                    : "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                }`}
              >
                {rateLimitStatus.message}
              </div>
            )}
          </div>

          {/* Live Security Log Stream */}
          <div className="flex-1 flex flex-col min-h-0 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold">LIVE SOC EVENT STREAM:</span>
            <div className="flex-1 bg-[#05080E] border border-purple-950 rounded p-2 overflow-y-auto space-y-1 text-[10px] font-mono shadow-inner">
              {banditState.securityLogs.map((log) => (
                <div
                  key={log.id}
                  className={`leading-tight p-1 rounded ${
                    log.type === "BREACH"
                      ? "bg-rose-950/80 text-rose-300 font-bold border border-rose-800"
                      : log.type === "BLOCKED"
                      ? "bg-amber-950/60 text-amber-300"
                      : "text-slate-400"
                  }`}
                >
                  <span className="text-slate-500">[{log.timestamp}]</span>{" "}
                  <span className="font-bold">[{log.source}]</span>: {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
