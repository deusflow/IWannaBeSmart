/**
 * @file apps/web/src/components/workbench/warroom/WarRoomScreen.tsx
 * @description Incident War Room (SEV-1 Production Outage Drills & SRE Mission Control).
 * High-adrenaline live outage simulator with PagerDuty Slack feed, architecture blast radius,
 * live telemetry gauges, and emergency hotfix code runner.
 */

import React, { useEffect, useState, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  AlertOctagon,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  ArrowLeft,
  Activity,
  DollarSign,
  Radio,
  Clock,
  Terminal,
  Server,
  Layers,
  XCircle,
  Copy,
  Check,
  Send,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import {
  INCIDENT_SCENARIOS,
  type IncidentScenario,
} from "@iw/sim-engine";
import { WarRoomVictoryModal } from "./WarRoomVictoryModal";
import { WarRoomFailureModal } from "./WarRoomFailureModal";
import { audioFx } from "../../../utils/audioFx";

export const WarRoomScreen: React.FC = () => {
  const {
    activeIncidentId,
    warRoomStatus,
    warRoomTimeRemainingSec,
    warRoomAccumulatedLoss,
    warRoomErrorRate,
    warRoomLatencyMs,
    warRoomHealthStatus,
    warRoomActiveTab,
    warRoomChatMessages,
    warRoomHotfixCode,
    warRoomHotfixLanguage,
    warRoomHotfixLogs,
    warRoomHotfixError,
    isWarRoomAudioEnabled,
    startIncidentDrill,
    abortIncidentDrill,
    tickWarRoomTimer,
    setWarRoomActiveTab,
    setWarRoomHotfixCode,
    setWarRoomHotfixLanguage,
    runWarRoomHotfixAction,
    toggleWarRoomAudio,
    setCurrentView,
  } = useWorkbenchStore(
    useShallow((s) => ({
      activeIncidentId: s.activeIncidentId,
      warRoomStatus: s.warRoomStatus,
      warRoomElapsedSec: s.warRoomElapsedSec,
      warRoomTimeRemainingSec: s.warRoomTimeRemainingSec,
      warRoomAccumulatedLoss: s.warRoomAccumulatedLoss,
      warRoomErrorRate: s.warRoomErrorRate,
      warRoomLatencyMs: s.warRoomLatencyMs,
      warRoomHealthStatus: s.warRoomHealthStatus,
      warRoomActiveTab: s.warRoomActiveTab,
      warRoomChatMessages: s.warRoomChatMessages,
      warRoomHotfixCode: s.warRoomHotfixCode,
      warRoomHotfixLanguage: s.warRoomHotfixLanguage,
      warRoomHotfixLogs: s.warRoomHotfixLogs,
      warRoomHotfixError: s.warRoomHotfixError,
      isWarRoomAudioEnabled: s.isWarRoomAudioEnabled,
      startIncidentDrill: s.startIncidentDrill,
      abortIncidentDrill: s.abortIncidentDrill,
      tickWarRoomTimer: s.tickWarRoomTimer,
      setWarRoomActiveTab: s.setWarRoomActiveTab,
      setWarRoomHotfixCode: s.setWarRoomHotfixCode,
      setWarRoomHotfixLanguage: s.setWarRoomHotfixLanguage,
      runWarRoomHotfixAction: s.runWarRoomHotfixAction,
      toggleWarRoomAudio: s.toggleWarRoomAudio,
      setCurrentView: s.setCurrentView,
    }))
  );

  const [copiedLog, setCopiedLog] = useState(false);

  const currentIncident: IncidentScenario = useMemo(
    () => INCIDENT_SCENARIOS.find((s) => s.id === activeIncidentId) || INCIDENT_SCENARIOS[0],
    [activeIncidentId]
  );

  // Active Timer Interval
  useEffect(() => {
    if (warRoomStatus !== "IN_PROGRESS") return;
    const interval = setInterval(() => {
      tickWarRoomTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [warRoomStatus, tickWarRoomTimer]);

  const minutesRemaining = Math.floor(warRoomTimeRemainingSec / 60);
  const secondsRemaining = warRoomTimeRemainingSec % 60;
  const timeFormatted = `${minutesRemaining.toString().padStart(2, "0")}:${secondsRemaining
    .toString()
    .padStart(2, "0")}`;

  const isUrgent = warRoomTimeRemainingSec <= 45;
  const isWarning = warRoomTimeRemainingSec <= 90 && !isUrgent;

  const currentCode = warRoomHotfixCode[warRoomHotfixLanguage] || "";

  const handleCopyStackTrace = () => {
    navigator.clipboard.writeText(currentIncident.stackTraceLog);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const handleResetBrokenCode = () => {
    audioFx.playRelayClick();
    const broken = currentIncident.hotfixTask.initialBrokenCode[warRoomHotfixLanguage];
    setWarRoomHotfixCode(broken);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#08090C] text-zinc-100 min-h-screen select-none font-sans">
      {/* ── SEV-1 Top Emergency HUD ── */}
      <header className="sticky top-0 z-30 bg-[#0D0F14]/95 backdrop-blur-md border-b border-rose-500/30 shadow-lg shadow-black/60 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Incident Title & Selector */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                audioFx.playRelayClick();
                abortIncidentDrill();
                setCurrentView("HUB");
              }}
              className="p-1.5 rounded-lg bg-[#151922] hover:bg-[#1E2431] text-zinc-400 hover:text-white border border-[#273042] transition-colors"
              title="Return to Workshop Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase tracking-widest flex items-center space-x-1">
                <AlertOctagon className="w-3 h-3" />
                <span>SEV-1 OUTAGE</span>
              </span>
            </div>

            {/* Scenario Dropdown */}
            <select
              value={currentIncident.id}
              onChange={(e) => {
                audioFx.playRelayClick();
                startIncidentDrill(e.target.value);
              }}
              className="bg-[#131720] border border-[#252C3D] hover:border-rose-500/50 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              {INCIDENT_SCENARIOS.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.order}. {inc.title}
                </option>
              ))}
            </select>
          </div>

          {/* Center: Countdown Timer & Loss Ticker */}
          <div className="flex items-center space-x-4 sm:space-x-6 justify-center">
            {/* SLA Timer */}
            <div className="flex items-center space-x-2 bg-[#12151E] px-3.5 py-1.5 rounded-xl border border-[#232938]">
              <Clock
                className={`w-4 h-4 ${
                  isUrgent ? "text-rose-500 animate-spin" : isWarning ? "text-amber-400" : "text-emerald-400"
                }`}
              />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                  SLA Remaining
                </span>
                <span
                  className={`text-base font-mono font-black tracking-tight ${
                    isUrgent
                      ? "text-rose-400 animate-pulse"
                      : isWarning
                      ? "text-amber-300"
                      : "text-emerald-400"
                  }`}
                >
                  {timeFormatted}
                </span>
              </div>
            </div>

            {/* Revenue Loss Burn Ticker */}
            <div className="flex items-center space-x-2 bg-[#12151E] px-3.5 py-1.5 rounded-xl border border-[#232938]">
              <DollarSign className="w-4 h-4 text-rose-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                  Revenue Burn
                </span>
                <span className="text-base font-mono font-black text-rose-400">
                  ${warRoomAccumulatedLoss.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Error Rate */}
            <div className="hidden sm:flex items-center space-x-2 bg-[#12151E] px-3 py-1.5 rounded-xl border border-[#232938]">
              <Activity className="w-4 h-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                  Error Rate
                </span>
                <span className="text-base font-mono font-black text-amber-300">
                  {warRoomErrorRate}%
                </span>
              </div>
            </div>

            {/* P99 Latency */}
            <div className="hidden md:flex items-center space-x-2 bg-[#12151E] px-3 py-1.5 rounded-xl border border-[#232938]">
              <Activity className="w-4 h-4 text-rose-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                  P99 Latency
                </span>
                <span className="text-base font-mono font-black text-rose-300">
                  {warRoomLatencyMs}ms
                </span>
              </div>
            </div>
          </div>

          {/* Right: Audio Siren & Action Controls */}
          <div className="flex items-center space-x-2 justify-end">
            <button
              type="button"
              onClick={toggleWarRoomAudio}
              className={`p-2 rounded-xl border transition-colors flex items-center space-x-1.5 text-xs font-mono ${
                isWarRoomAudioEnabled
                  ? "bg-rose-950/40 text-rose-300 border-rose-500/40"
                  : "bg-[#141822] text-zinc-400 border-[#262E3E]"
              }`}
              title={isWarRoomAudioEnabled ? "Mute Siren & Audio" : "Enable Siren Audio"}
            >
              {isWarRoomAudioEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Siren ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                  <span className="hidden sm:inline">Muted</span>
                </>
              )}
            </button>

            {warRoomStatus === "STANDBY" ? (
              <button
                type="button"
                onClick={() => startIncidentDrill(currentIncident.id)}
                className="px-4 py-2 text-xs font-mono font-bold rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-900/40 flex items-center space-x-2 transition-all transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Drill</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetBrokenCode}
                className="px-3 py-1.5 text-xs font-mono rounded-lg bg-[#161B24] hover:bg-[#202735] text-zinc-300 border border-[#2B3447] flex items-center space-x-1.5 transition-colors"
                title="Reset code to initial broken defect"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Code</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile / Tablet View Switcher Tab Bar ── */}
      <div className="lg:hidden flex items-center justify-around border-b border-[#1E2433] bg-[#0E1117] p-2">
        <button
          type="button"
          onClick={() => setWarRoomActiveTab("feed")}
          className={`flex-1 py-1.5 text-xs font-mono text-center rounded-lg transition-colors ${
            warRoomActiveTab === "feed"
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          #ops-warroom ({warRoomChatMessages.length})
        </button>
        <button
          type="button"
          onClick={() => setWarRoomActiveTab("diagnostics")}
          className={`flex-1 py-1.5 text-xs font-mono text-center rounded-lg transition-colors ${
            warRoomActiveTab === "diagnostics"
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Diagnostics
        </button>
        <button
          type="button"
          onClick={() => setWarRoomActiveTab("hotfix")}
          className={`flex-1 py-1.5 text-xs font-mono text-center rounded-lg transition-colors ${
            warRoomActiveTab === "hotfix"
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Hotfix Editor
        </button>
      </div>

      {/* ── Main 3-Column Mission Control Grid ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Column 1: Live Team Feed (#ops-warroom Slack / PagerDuty) ── */}
        <div
          className={`lg:col-span-3 flex flex-col bg-[#0D1017] border border-[#202636] rounded-2xl overflow-hidden shadow-xl ${
            warRoomActiveTab !== "feed" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="p-3.5 bg-[#121620] border-b border-[#202737] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-zinc-200">
                #incident-war-room
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              Live Stream
            </span>
          </div>

          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[560px]">
            {warRoomChatMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-[#141824] border border-[#232B3C] rounded-xl p-3 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white font-mono"
                      style={{ backgroundColor: msg.avatarColor }}
                    >
                      {msg.sender.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-zinc-200">
                      {msg.sender}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    +{msg.delaySec}s
                  </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-400">
                  {msg.role}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          {/* Incident Status Footer */}
          <div className="p-3 bg-[#11141D] border-t border-[#1F2535] text-[11px] font-mono text-zinc-400 flex items-center justify-between">
            <span>Status:</span>
            <span
              className={`font-bold ${
                warRoomHealthStatus === "OPERATIONAL"
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {warRoomHealthStatus}
            </span>
          </div>
        </div>

        {/* ── Column 2: Telemetry, Blast Radius & Stack Trace ── */}
        <div
          className={`lg:col-span-4 flex flex-col space-y-4 ${
            warRoomActiveTab !== "diagnostics" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Target Station & Blast Radius */}
          <div className="bg-[#0D1017] border border-[#202636] rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-amber-400" />
                <span>Blast Radius</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {currentIncident.stationName}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {currentIncident.summary}
            </p>

            {/* Affected Services Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentIncident.affectedComponents.map((comp) => (
                <span
                  key={comp}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-rose-950/40 text-rose-300 border border-rose-500/30 flex items-center space-x-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                  <span>{comp}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Architecture Topology SVG */}
          <div className="bg-[#0D1017] border border-[#202636] rounded-2xl p-4 shadow-xl flex flex-col space-y-2">
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Service Bus Topology</span>
            </span>

            <div className="w-full bg-[#121622] border border-[#1E2536] rounded-xl p-3 flex items-center justify-around text-center py-4">
              <div className="flex flex-col items-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Server className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-zinc-400">Clients / CDN</span>
                <span className="text-[9px] font-mono text-emerald-400">NORMAL</span>
              </div>

              <div className="h-0.5 w-8 bg-zinc-600"></div>

              <div className="flex flex-col items-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/60 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/60">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <span className="text-[10px] font-mono text-rose-300 font-bold">
                  {currentIncident.affectedComponents[0]}
                </span>
                <span className="text-[9px] font-mono text-rose-400 animate-pulse">FAILING</span>
              </div>

              <div className="h-0.5 w-8 bg-zinc-600"></div>

              <div className="flex flex-col items-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-[#181E2C] border border-[#2C364C] flex items-center justify-center text-zinc-400">
                  <Server className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-zinc-400">Persistence</span>
                <span className="text-[9px] font-mono text-zinc-500">STANDBY</span>
              </div>
            </div>
          </div>

          {/* Stack Trace Log Terminal */}
          <div className="flex-1 bg-[#0D1017] border border-[#202636] rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="p-3 bg-[#121620] border-b border-[#202737] flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-200 flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-rose-400" />
                <span>Panic Stack Trace</span>
              </span>
              <button
                type="button"
                onClick={handleCopyStackTrace}
                className="text-[10px] font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-[#1C2230] border border-[#2B354A] flex items-center space-x-1"
              >
                {copiedLog ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLog ? "Copied" : "Copy Log"}</span>
              </button>
            </div>
            <div className="p-3 font-mono text-[11px] leading-relaxed text-rose-300/90 bg-[#090B10] overflow-x-auto whitespace-pre flex-1">
              {currentIncident.stackTraceLog}
            </div>
          </div>
        </div>

        {/* ── Column 3: Hotfix Terminal & Code Gym Runner ── */}
        <div
          className={`lg:col-span-5 flex flex-col bg-[#0D1017] border border-[#202636] rounded-2xl overflow-hidden shadow-xl ${
            warRoomActiveTab !== "hotfix" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Editor Header Bar */}
          <div className="p-3 bg-[#121620] border-b border-[#202737] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-zinc-200">
                {currentIncident.hotfixTask.title}
              </span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-[#181D29] p-0.5 rounded-lg border border-[#293245]">
              <button
                type="button"
                onClick={() => {
                  audioFx.playRelayClick();
                  setWarRoomHotfixLanguage("typescript");
                }}
                className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md transition-colors ${
                  warRoomHotfixLanguage === "typescript"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                TypeScript
              </button>
              <button
                type="button"
                onClick={() => {
                  audioFx.playRelayClick();
                  setWarRoomHotfixLanguage("python");
                }}
                className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md transition-colors ${
                  warRoomHotfixLanguage === "python"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Python
              </button>
            </div>
          </div>

          {/* Diagnostic Hint Banner */}
          <div className="bg-[#141822] border-b border-[#202636] p-2.5 px-3.5 text-xs font-mono text-amber-300/90 flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] leading-tight">
              {currentIncident.hotfixTask.diagnosticHint}
            </span>
          </div>

          {/* CodeMirror Editor Area */}
          <div className="flex-1 bg-[#0A0C11] overflow-hidden min-h-[300px] border-b border-[#202736]">
            <CodeMirror
              value={currentCode}
              onChange={(val) => setWarRoomHotfixCode(val)}
              theme={oneDark}
              height="340px"
              className="text-xs font-mono"
            />
          </div>

          {/* Compiler Logs & Validation Output */}
          <div className="p-3 bg-[#0A0C11] max-h-36 overflow-y-auto font-mono text-[11px] space-y-1">
            {warRoomHotfixLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes("PASS")
                    ? "text-emerald-400"
                    : log.includes("FAIL")
                    ? "text-rose-400 font-bold"
                    : "text-zinc-400"
                }
              >
                {log}
              </div>
            ))}
            {warRoomHotfixError && (
              <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center space-x-2 mt-1">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{warRoomHotfixError}</span>
              </div>
            )}
          </div>

          {/* Deploy CTA Button */}
          <div className="p-3 bg-[#11151F] border-t border-[#202636] flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500">
              Hotfix is evaluated live against production test suite.
            </span>
            <button
              type="button"
              onClick={() => runWarRoomHotfixAction()}
              className="px-5 py-2 text-xs font-mono font-black rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-black shadow-lg shadow-emerald-500/30 flex items-center space-x-2 transition-all transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Deploy Hotfix to Prod</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <WarRoomVictoryModal />
      <WarRoomFailureModal />
    </div>
  );
};
