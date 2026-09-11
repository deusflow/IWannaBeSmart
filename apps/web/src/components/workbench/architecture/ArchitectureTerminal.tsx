import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Terminal,
  Minimize2,
  Maximize2,
  Trash2,
  Target,
  Code2,
  ChevronUp,
  BookOpen,
  Filter,
} from "lucide-react";
import type { TerminalLogEntry, SubsystemTag } from "./types";

interface ArchitectureTerminalProps {
  logs: TerminalLogEntry[];
  onClearLogs: () => void;
  currentMission?: string;
  codePreview?: { csharp: string; go: string };
  onFocusNode?: (nodeId: string) => void;
}

// ── Subsystem Badge Visual Styles ──
const SUBSYSTEM_CONFIG: Record<
  SubsystemTag,
  { bg: string; text: string; border: string; label: string }
> = {
  IoC: {
    bg: "bg-purple-950/80",
    text: "text-purple-300",
    border: "border-purple-500/50",
    label: "[IoC]",
  },
  VTABLE: {
    bg: "bg-blue-950/80",
    text: "text-blue-300",
    border: "border-blue-500/50",
    label: "[VTABLE]",
  },
  BUS: {
    bg: "bg-amber-950/80",
    text: "text-amber-300",
    border: "border-amber-500/50",
    label: "[BUS]",
  },
  HARDWARE: {
    bg: "bg-emerald-950/80",
    text: "text-emerald-300",
    border: "border-emerald-500/50",
    label: "[HARDWARE]",
  },
  FAULT: {
    bg: "bg-red-950/80",
    text: "text-red-300",
    border: "border-red-500/60 animate-pulse",
    label: "[FAULT]",
  },
  GRAPH: {
    bg: "bg-gray-800/80",
    text: "text-gray-400",
    border: "border-gray-600/40",
    label: "[GRAPH]",
  },
};

// Auto-tag legacy or untagged logs
function resolveSubsystem(entry: TerminalLogEntry): SubsystemTag {
  if (entry.subsystem) return entry.subsystem;
  if (entry.type === "error") return "FAULT";
  const str = `${entry.title || ""} ${entry.message} ${entry.operation || ""}`.toLowerCase();
  if (str.includes("ioc") || str.includes("di") || str.includes("transient") || str.includes("singleton") || str.includes("inject"))
    return "IoC";
  if (str.includes("vtable") || str.includes("iremotecommand") || str.includes("contract") || str.includes("interface"))
    return "VTABLE";
  if (str.includes("hardware") || str.includes("relay") || str.includes("crt") || str.includes("rail") || str.includes("rail"))
    return "HARDWARE";
  if (str.includes("dispatch") || str.includes("bus") || str.includes("remote") || str.includes("execute"))
    return "BUS";
  return "GRAPH";
}

// ── Educational step guide (always visible, 3 levels) ──
const STEPS = [
  {
    num: "01",
    color: "#8B5CF6",
    title: "Контракт (Interface)",
    desc: "IRemoteCommand визначає метод Execute() — спільний контракт для всіх команд пульта.",
    code: "public interface IRemoteCommand {\n    void Execute();\n}",
  },
  {
    num: "02",
    color: "#3B82F6",
    title: "Реалізація (Implements)",
    desc: "PowerCommand реалізує IRemoteCommand — конкретна логіка вмикання TV.",
    code: "public class PowerCommand : IRemoteCommand {\n    public void Execute() => _tv.TogglePowerState();\n}",
  },
  {
    num: "03",
    color: "#10B981",
    title: "Впровадження (DI)",
    desc: "TVController отримує IRemoteCommand через вхідний порт CommandHandler — з'єднайте їх проводом.",
    code: "public TVController(IRemoteCommand cmd) {\n    _cmd = cmd;\n}",
  },
];

export const ArchitectureTerminal: React.FC<ArchitectureTerminalProps> = ({
  logs,
  onClearLogs,
  currentMission,
  codePreview,
  onFocusNode,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [codeLang, setCodeLang] = useState<"csharp" | "go">("csharp");
  const [activeTab, setActiveTab] = useState<"log" | "theory" | "code">("log");
  const [filterSubsystem, setFilterSubsystem] = useState<SubsystemTag | "ALL">("ALL");
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log
  useEffect(() => {
    if (isExpanded && activeTab === "log") {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isExpanded, activeTab]);

  const toggle = useCallback(() => setIsExpanded((p) => !p), []);

  const filteredLogs = useMemo(() => {
    if (filterSubsystem === "ALL") return logs;
    return logs.filter((log) => resolveSubsystem(log) === filterSubsystem);
  }, [logs, filterSubsystem]);

  // ── Collapsed ──────────────────────────────────────────
  if (!isExpanded) {
    return (
      <div
        onClick={toggle}
        className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-1.5 cursor-pointer select-none"
        style={{
          background: "#151617",
          borderTop: "1px solid #2A2B2F",
        }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-emerald-400" />
          <span className="font-mono text-[10px] font-bold text-gray-400">
            {t("architecture.terminal")}
          </span>
          {logs.length > 0 && (
            <span className="font-mono text-[9px] text-gray-400 bg-gray-800 px-1.5 py-px rounded-full border border-gray-700">
              {logs.length} events
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <ChevronUp size={13} />
          <Maximize2 size={11} />
        </div>
      </div>
    );
  }

  // ── Expanded ───────────────────────────────────────────
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 flex flex-col"
      style={{
        maxHeight: "44%",
        minHeight: "160px",
        background: "#101113",
        borderTop: "1px solid #282A30",
        boxShadow: "0 -6px 28px rgba(0,0,0,0.6)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0 border-b flex-wrap gap-2"
        style={{ borderColor: "#202226" }}
      >
        {/* Tabs & Subsystem Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Terminal size={12} className="text-emerald-400" />
            <span className="font-mono text-[10px] font-bold text-gray-400">
              HIGH-SIGNAL BUS
            </span>
          </div>

          <div className="flex items-center rounded border border-[#303035] overflow-hidden">
            {(["log", "theory", "code"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-0.5 text-[9.5px] font-mono font-bold transition-colors cursor-pointer border-r border-[#303035] last:border-r-0 ${
                  activeTab === tab
                    ? tab === "log"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : tab === "theory"
                      ? "bg-purple-500/15 text-purple-300"
                      : "bg-blue-500/15 text-blue-300"
                    : "bg-transparent text-gray-600 hover:text-gray-400"
                }`}
              >
                {tab === "log" && `${t("architecture.liveLog")} (${filteredLogs.length})`}
                {tab === "theory" && (
                  <span className="flex items-center gap-1">
                    <BookOpen size={9} />
                    {t("architecture.theoryTab")}
                  </span>
                )}
                {tab === "code" && (
                  <span className="flex items-center gap-1">
                    <Code2 size={9} />
                    {t("architecture.codeTab")}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Subsystem Filters (Log Tab) */}
          {activeTab === "log" && (
            <div className="hidden sm:flex items-center gap-1 bg-[#16181B] p-0.5 rounded border border-[#2B2D33] text-[8.5px] font-mono">
              <span className="text-gray-500 px-1 flex items-center gap-0.5">
                <Filter size={9} />
              </span>
              {(["ALL", "IoC", "VTABLE", "BUS", "HARDWARE", "FAULT"] as const).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterSubsystem(tag)}
                  className={`px-1.5 py-0.2 rounded transition-colors cursor-pointer font-bold ${
                    filterSubsystem === tag
                      ? "bg-white/15 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {activeTab === "code" && (
            <div className="flex items-center rounded border border-[#303035] overflow-hidden mr-2">
              {(["csharp", "go"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCodeLang(lang)}
                  className={`px-2 py-0.5 text-[9px] font-mono font-bold cursor-pointer transition-colors border-r border-[#303035] last:border-r-0 ${
                    codeLang === lang
                      ? lang === "csharp"
                        ? "bg-purple-500/15 text-purple-300"
                        : "bg-cyan-500/15 text-cyan-300"
                      : "bg-transparent text-gray-600 hover:text-gray-400"
                  }`}
                >
                  {lang === "csharp" ? "C#" : "Go"}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={onClearLogs}
            title={t("architecture.clearLog")}
            className="p-1 rounded hover:bg-[#252628] text-gray-600 hover:text-gray-400 cursor-pointer transition-colors"
          >
            <Trash2 size={11} />
          </button>
          <button
            onClick={toggle}
            title={t("architecture.collapse")}
            className="p-1 rounded hover:bg-[#252628] text-gray-600 hover:text-gray-400 cursor-pointer transition-colors"
          >
            <Minimize2 size={11} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2 space-y-1 font-mono text-[10px]">

        {/* ── TAB: Log ──────────────────────────── */}
        {activeTab === "log" && (
          <>
            {/* Mission banner (compact) */}
            {currentMission && (
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded mb-1.5"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <Target size={11} className="text-amber-400 shrink-0" />
                <span className="font-mono text-[9px] font-bold text-amber-400 uppercase tracking-wider shrink-0">
                  GOAL:
                </span>
                <p className="font-mono text-[9.5px] text-amber-200/85 truncate">
                  {currentMission}
                </p>
              </div>
            )}

            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center font-mono">
                <Terminal size={18} className="text-gray-700 mx-auto mb-1.5" />
                <p className="text-[10px] text-gray-600">
                  {t("architecture.terminalEmpty", "Журнал подій порожній. Підключіть порт або надішліть команду.")}
                </p>
              </div>
            ) : (
              filteredLogs.map((entry) => {
                const sub = resolveSubsystem(entry);
                const subStyle = SUBSYSTEM_CONFIG[sub] || SUBSYSTEM_CONFIG.GRAPH;
                const isClickable = Boolean(entry.targetNodeId && onFocusNode);

                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      if (entry.targetNodeId && onFocusNode) {
                        onFocusNode(entry.targetNodeId);
                      }
                    }}
                    className={`px-2 py-0.5 rounded font-mono text-[10px] leading-tight flex items-center gap-2 border border-transparent hover:border-white/15 transition-all select-text ${
                      isClickable ? "cursor-pointer hover:bg-white/[0.04]" : ""
                    }`}
                  >
                    {/* Timestamp: [HH:mm:ss.SSS] */}
                    <span className="text-gray-600 text-[9px] shrink-0 font-mono select-none">
                      [{entry.timestamp}]
                    </span>

                    {/* Subsystem Badge: [IoC] / [VTABLE] / [BUS] / [HARDWARE] */}
                    <span
                      className={`px-1.5 py-0.2 rounded border text-[8px] font-black uppercase shrink-0 ${
                        subStyle.bg
                      } ${subStyle.text} ${subStyle.border}`}
                    >
                      {subStyle.label}
                    </span>

                    {/* Operation (if any): RESOLVE / REGISTER / DISPATCH */}
                    {entry.operation && (
                      <span className="text-gray-300 font-extrabold uppercase shrink-0 text-[9px]">
                        {entry.operation}
                      </span>
                    )}

                    {/* Message / Call Arrow: TVController.ctor -> injected PowerCommand */}
                    <span className="text-gray-200 truncate flex-1">
                      {entry.message}
                    </span>

                    {/* Optional Details */}
                    {entry.details && (
                      <span className="text-gray-500 text-[8.5px] shrink-0 font-mono hidden md:inline">
                        ({entry.details})
                      </span>
                    )}

                    {/* Focus Target Button / Pill if targetNodeId exists */}
                    {entry.targetNodeId && onFocusNode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusNode(entry.targetNodeId!);
                        }}
                        className="px-1.5 py-0.2 rounded bg-white/10 hover:bg-accent-blue hover:text-white text-gray-400 text-[8px] font-mono shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Центрувати ноду на полотні"
                      >
                        <span>🎯 Focus</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
            <div ref={logEndRef} />
          </>
        )}

        {/* ── TAB: Theory (3-step guide) ─────── */}
        {activeTab === "theory" && (
          <div className="space-y-2 py-1">
            <p className="font-balsamiq text-[9.5px] text-gray-500 mb-2">
              Command Pattern &amp; Dependency Injection (3 Steps):
            </p>
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="rounded-lg px-3 py-2.5 border-l-2"
                style={{
                  borderLeftColor: step.color,
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid rgba(255,255,255,0.05)`,
                  borderLeft: `2px solid ${step.color}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[8.5px] font-bold" style={{ color: step.color }}>
                    {step.num}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-gray-200">
                    {step.title}
                  </span>
                </div>
                <p className="font-balsamiq text-[9.5px] text-gray-400 leading-snug mb-1.5">
                  {step.desc}
                </p>
                <pre
                  className="text-[8.5px] font-mono text-emerald-300 px-2 py-1.5 rounded overflow-x-auto whitespace-pre-wrap"
                  style={{ background: "#0B0C0D", border: "1px solid #252628" }}
                >
                  {step.code}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: Code Sync ─────────────────── */}
        {activeTab === "code" && (
          <div className="py-1">
            <div className="flex items-center gap-2 mb-2">
              <Code2 size={11} className="text-blue-400" />
              <span className="font-mono text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                {codeLang === "csharp" ? "C# — Generated DI Config" : "Go — Generated Wiring"}
              </span>
            </div>
            <pre
              className="text-[9.5px] font-mono text-gray-300 px-3 py-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed min-h-[80px]"
              style={{ background: "#0B0C0D", border: "1px solid #252628" }}
            >
              {codePreview
                ? codeLang === "csharp"
                  ? codePreview.csharp
                  : codePreview.go
                : t("architecture.noCodeYet")}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
