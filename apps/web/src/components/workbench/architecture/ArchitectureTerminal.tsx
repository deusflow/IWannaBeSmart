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
} from "lucide-react";
import type { TerminalLogEntry, LogType } from "./types";

interface ArchitectureTerminalProps {
  logs: TerminalLogEntry[];
  onClearLogs: () => void;
  currentMission?: string;
  codePreview?: { csharp: string; go: string };
}

const LOG_ICON_MAP: Record<LogType, React.ReactNode> = {
  success: <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />,
  error: <XCircle size={13} className="text-red-400 shrink-0" />,
  info: <Info size={13} className="text-blue-400 shrink-0" />,
  warning: <AlertTriangle size={13} className="text-amber-400 shrink-0" />,
};

const LOG_BORDER_MAP: Record<LogType, string> = {
  success: "border-l-emerald-500",
  error: "border-l-red-500",
  info: "border-l-blue-500",
  warning: "border-l-amber-500",
};

const LOG_BG_MAP: Record<LogType, string> = {
  success: "bg-emerald-950/20",
  error: "bg-red-950/20",
  info: "bg-blue-950/20",
  warning: "bg-amber-950/20",
};

export const ArchitectureTerminal: React.FC<ArchitectureTerminalProps> = ({
  logs,
  onClearLogs,
  currentMission,
  codePreview,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [codeLang, setCodeLang] = useState<"csharp" | "go">("csharp");
  const [activeTab, setActiveTab] = useState<"log" | "code">("log");
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest log
  useEffect(() => {
    if (isExpanded && activeTab === "log") {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isExpanded, activeTab]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Collapsed state — thin bottom bar
  if (!isExpanded) {
    return (
      <div
        className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-1.5 cursor-pointer select-none transition-all duration-200"
        style={{
          background: "linear-gradient(180deg, #1A1B1D 0%, #151617 100%)",
          borderTop: "1px solid #2A2B2F",
        }}
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-emerald-400" />
          <span className="font-mono text-[11px] font-bold text-gray-300">
            {t("architecture.terminal")}
          </span>
          {logs.length > 0 && (
            <span className="font-mono text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-full border border-gray-700">
              {logs.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <ChevronUp size={14} className="text-gray-500" />
          <Maximize2 size={12} className="text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 flex flex-col transition-all duration-300"
      style={{
        maxHeight: "45%",
        background: "linear-gradient(180deg, #1A1B1D 0%, #131415 100%)",
        borderTop: "1px solid #2E2F33",
        boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.55)",
      }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1.5 shrink-0 border-b border-[#2A2B2F]">
        {/* Left — Title and Tabs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Terminal size={13} className="text-emerald-400" />
            <span className="font-mono text-[11px] font-bold text-gray-200">
              {t("architecture.terminal")}
            </span>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center rounded-md border border-[#3A3B40] overflow-hidden">
            <button
              onClick={() => setActiveTab("log")}
              className={`px-2.5 py-0.5 text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                activeTab === "log"
                  ? "bg-emerald-500/20 text-emerald-300 border-r border-[#3A3B40]"
                  : "bg-transparent text-gray-500 hover:text-gray-300 border-r border-[#3A3B40]"
              }`}
            >
              {t("architecture.liveLog")}
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-2.5 py-0.5 text-[10px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === "code"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              <Code2 size={10} />
              Code
            </button>
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-1">
          {activeTab === "code" && (
            <div className="flex items-center rounded-md border border-[#3A3B40] overflow-hidden mr-2">
              <button
                onClick={() => setCodeLang("csharp")}
                className={`px-2 py-0.5 text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                  codeLang === "csharp"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                C#
              </button>
              <button
                onClick={() => setCodeLang("go")}
                className={`px-2 py-0.5 text-[9px] font-mono font-bold cursor-pointer transition-colors border-l border-[#3A3B40] ${
                  codeLang === "go"
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "bg-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                Go
              </button>
            </div>
          )}

          <button
            onClick={onClearLogs}
            title={t("architecture.clearLog")}
            className="p-1 rounded hover:bg-[#2A2B2F] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
          </button>
          <button
            onClick={toggleExpand}
            title={t("architecture.collapse")}
            className="p-1 rounded hover:bg-[#2A2B2F] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            <Minimize2 size={12} />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2 space-y-2">
        {/* Current Mission Banner */}
        {currentMission && activeTab === "log" && (
          <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-amber-950/20 border border-amber-500/30">
            <Target size={13} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-mono text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                {t("architecture.currentGoal")}
              </div>
              <p className="font-balsamiq text-[11px] text-amber-100/90 leading-snug mt-0.5">
                {currentMission}
              </p>
            </div>
          </div>
        )}

        {/* Log Entries */}
        {activeTab === "log" && (
          <div className="space-y-1.5">
            {logs.length === 0 ? (
              <div className="py-8 text-center">
                <Terminal
                  size={24}
                  className="text-gray-700 mx-auto mb-2"
                />
                <p className="font-mono text-[11px] text-gray-600">
                  {t("architecture.terminalEmpty")}
                </p>
              </div>
            ) : (
              logs.map((entry) => (
                <div
                  key={entry.id}
                  className={`px-2.5 py-2 rounded-md border-l-2 ${LOG_BORDER_MAP[entry.type]} ${LOG_BG_MAP[entry.type]} transition-all duration-150`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {LOG_ICON_MAP[entry.type]}
                    <span className="font-mono text-[10px] font-bold text-gray-200 leading-tight">
                      {entry.title}
                    </span>
                    <span className="ml-auto font-mono text-[9px] text-gray-600">
                      {entry.timestamp}
                    </span>
                  </div>
                  <p className="font-balsamiq text-[10.5px] text-gray-300 leading-snug pl-5">
                    {entry.message}
                  </p>
                  {entry.codeContext && (
                    <pre className="mt-1.5 ml-5 px-2 py-1.5 rounded bg-[#0D0E10] border border-[#2A2B2F] font-mono text-[9.5px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                      {entry.codeContext}
                    </pre>
                  )}
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        )}

        {/* Code Sync Preview */}
        {activeTab === "code" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Code2 size={12} className="text-blue-400" />
              <span className="font-mono text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                {codeLang === "csharp" ? "C# (Generated)" : "Go (Generated)"}
              </span>
            </div>
            <pre className="px-3 py-2.5 rounded-lg bg-[#0D0E10] border border-[#2A2B2F] font-mono text-[10.5px] text-gray-200 overflow-x-auto whitespace-pre-wrap leading-relaxed min-h-[80px]">
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
