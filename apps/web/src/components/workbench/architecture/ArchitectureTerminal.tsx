import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Terminal,
  Minimize2,
  Maximize2,
  Trash2,
  Target,
  Code2,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import type { TerminalLogEntry, LogType } from "./types";

interface ArchitectureTerminalProps {
  logs: TerminalLogEntry[];
  onClearLogs: () => void;
  currentMission?: string;
  codePreview?: { csharp: string; go: string };
}

// ── Visual config per log type ──
const LOG_STYLES: Record<LogType, { icon: React.ReactNode; borderColor: string; bg: string }> = {
  success: {
    icon: <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />,
    borderColor: "#22c55e",
    bg: "rgba(16,185,129,0.06)",
  },
  error: {
    icon: <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />,
    borderColor: "#ef4444",
    bg: "rgba(239,68,68,0.06)",
  },
  info: {
    icon: <Info size={12} className="text-blue-400 shrink-0 mt-0.5" />,
    borderColor: "#3b82f6",
    bg: "rgba(59,130,246,0.05)",
  },
  warning: {
    icon: <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />,
    borderColor: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
  },
};

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
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [codeLang, setCodeLang] = useState<"csharp" | "go">("csharp");
  const [activeTab, setActiveTab] = useState<"log" | "theory" | "code">("log");
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log
  useEffect(() => {
    if (isExpanded && activeTab === "log") {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isExpanded, activeTab]);

  const toggle = useCallback(() => setIsExpanded((p) => !p), []);

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
            <span className="font-mono text-[9px] text-gray-600 bg-gray-800 px-1.5 py-px rounded-full border border-gray-700">
              {logs.length}
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
        background: "#131415",
        borderTop: "1px solid #2E2F33",
        boxShadow: "0 -6px 28px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0 border-b"
        style={{ borderColor: "#252628" }}
      >
        {/* Tabs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Terminal size={12} className="text-emerald-400" />
            <span className="font-mono text-[10px] font-bold text-gray-400">
              {t("architecture.terminal")}
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
                {tab === "log" && t("architecture.liveLog")}
                {tab === "theory" && (
                  <span className="flex items-center gap-1">
                    <BookOpen size={9} />
                    Теорія
                  </span>
                )}
                {tab === "code" && (
                  <span className="flex items-center gap-1">
                    <Code2 size={9} />
                    Code
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-0.5">
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
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2 space-y-1.5">

        {/* ── TAB: Log ──────────────────────────── */}
        {activeTab === "log" && (
          <>
            {/* Mission banner */}
            {currentMission && (
              <div
                className="flex items-start gap-2 px-2.5 py-2 rounded-lg mb-2"
                style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <Target size={12} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-[8.5px] font-bold text-amber-500 uppercase tracking-wider">
                    {t("architecture.currentGoal")}
                  </div>
                  <p className="font-balsamiq text-[10px] text-amber-100/80 leading-snug mt-0.5">
                    {currentMission}
                  </p>
                </div>
              </div>
            )}

            {logs.length === 0 ? (
              <div className="py-8 text-center">
                <Terminal size={20} className="text-gray-700 mx-auto mb-2" />
                <p className="font-mono text-[10px] text-gray-600">
                  {t("architecture.terminalEmpty")}
                </p>
              </div>
            ) : (
              logs.map((entry) => {
                const style = LOG_STYLES[entry.type];
                return (
                  <div
                    key={entry.id}
                    className="px-2.5 py-2 rounded-lg border-l-2"
                    style={{
                      borderLeftColor: style.borderColor,
                      background: style.bg,
                    }}
                  >
                    <div className="flex items-start gap-1.5 mb-0.5">
                      {style.icon}
                      <span className="font-mono text-[9.5px] font-bold text-gray-200 leading-tight flex-1">
                        {entry.title}
                      </span>
                      <span className="font-mono text-[8px] text-gray-600 shrink-0">
                        {entry.timestamp}
                      </span>
                    </div>
                    <p className="font-balsamiq text-[10px] text-gray-400 leading-snug pl-[18px]">
                      {entry.message}
                    </p>
                    {entry.codeContext && (
                      <pre className="mt-1.5 ml-[18px] px-2 py-1.5 rounded text-[9px] text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed"
                        style={{ background: "#0B0C0D", border: "1px solid #252628" }}>
                        {entry.codeContext}
                      </pre>
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
              Три кроки для реалізації патерну Command та Dependency Injection:
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
