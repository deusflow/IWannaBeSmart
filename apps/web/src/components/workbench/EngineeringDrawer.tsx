import React, { useState, useEffect } from "react";
import type { StationLevel } from "@iw/sim-engine";
import { Badge, Tabs, type TabItem } from "@iw/ui";
import {
  X,
  Code2,
  Cpu,
  GitBranch,
  Terminal,
  Pin,
  PinOff,
  Minimize2,
  ExternalLink,
} from "lucide-react";

interface EngineeringDrawerProps {
  isOpen: boolean;
  isPinned: boolean;
  onTogglePin: () => void;
  onClose: () => void;
  level: StationLevel;
}

const DRAWER_TABS: TabItem[] = [
  { id: "code", label: "Code (C# / Go)" },
  { id: "hardware", label: "Hardware Nodes" },
  { id: "architecture", label: "Architecture" },
];

export const EngineeringDrawer: React.FC<EngineeringDrawerProps> = ({
  isOpen,
  isPinned,
  onTogglePin,
  onClose,
  level,
}) => {
  const [activeTab, setActiveTab] = useState("code");
  const [codeLang, setCodeLang] = useState<"csharp" | "go">("csharp");

  // Handle ESC key (closes only if unpinned)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPinned) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPinned, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed backdrop ONLY when unpinned / overlay mode */}
      {!isPinned && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-ink/15 backdrop-blur-[2px] transition-opacity duration-200"
        />
      )}

      {/* Floating Blueprint Document Sheet with Rounded-3xl Corners */}
      <aside
        style={{
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={`fixed z-40 top-16 bottom-4 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[500px] lg:w-[560px] bg-paper-subtle rounded-3xl border-2 border-paper-border shadow-paper-lg flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-right-8 ${
          isPinned ? "ring-2 ring-accent-blue/25" : ""
        }`}
      >
        {/* Drawer Header with Pin & Close Controls */}
        <div className="p-4 sm:p-5 border-b border-paper-border/80 bg-paper-subtle flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm" mono>
                LEVEL {level.levelNumber.toString().padStart(2, "0")}
              </Badge>
              <span className="text-[11px] font-mono text-ink-subtle truncate">
                {level.stationTitle}
              </span>
              {isPinned && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent-blue-light text-accent-blue border border-accent-blue-border">
                  PINNED DOCK
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-ink font-display truncate">
              {level.title}
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed font-sans line-clamp-2">
              {level.briefing}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            {/* Pin / Dock Toggle Button */}
            <button
              onClick={onTogglePin}
              title={isPinned ? "Unpin Drawer (Floating Overlay)" : "Pin Drawer (Side-by-side Dock)"}
              className={`p-1.5 rounded-lg border transition-all duration-150 cursor-pointer outline-none ${
                isPinned
                  ? "bg-accent-blue-light text-accent-blue border-accent-blue-border shadow-xs"
                  : "bg-paper text-ink-muted hover:text-ink border-paper-border hover:bg-paper-muted"
              }`}
            >
              {isPinned ? (
                <PinOff size={15} strokeWidth={1.75} />
              ) : (
                <Pin size={15} strokeWidth={1.75} />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close Drawer (ESC)"
              className="p-1.5 rounded-lg bg-paper hover:bg-paper-muted text-ink-muted hover:text-ink transition-colors cursor-pointer border border-paper-border"
            >
              <X size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 bg-paper-subtle border-b border-paper-border">
          <Tabs
            tabs={DRAWER_TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="line"
          />
        </div>

        {/* Content Area with Vellum Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-notebook-grid space-y-4">
          {/* Objective Callout */}
          <div className="p-3 rounded-xl bg-paper border border-paper-border shadow-paper-sm text-xs space-y-1">
            <span className="font-mono font-semibold text-accent-blue flex items-center gap-1.5 text-[11px]">
              <Terminal size={12} strokeWidth={1.75} />
              BLUEPRINT SPECIFICATION:
            </span>
            <p className="text-ink leading-relaxed font-sans">{level.objective}</p>
          </div>

          {/* TAB 1: CODE (C# & Go) */}
          {activeTab === "code" && (
            <div className="space-y-3.5">
              {/* Language Switcher */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-paper p-1 rounded-lg border border-paper-border">
                  <button
                    onClick={() => setCodeLang("csharp")}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all ${
                      codeLang === "csharp"
                        ? "bg-paper-subtle text-accent-blue shadow-paper-sm border border-paper-border/60"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    C# (.NET Contract)
                  </button>
                  <button
                    onClick={() => setCodeLang("go")}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all ${
                      codeLang === "go"
                        ? "bg-paper-subtle text-accent-blue shadow-paper-sm border border-paper-border/60"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    Go (Interfaces)
                  </button>
                </div>

                <Badge variant="neutral" size="sm" mono>
                  Syntax Verified
                </Badge>
              </div>

              {/* Code Box */}
              <div className="rounded-2xl border border-paper-border bg-[#181B1F] text-[#D8DEE9] p-4 font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                <pre>
                  <code>
                    {codeLang === "csharp"
                      ? level.codeSnippet.csharp
                      : level.codeSnippet.go}
                  </code>
                </pre>
              </div>

              {/* Architecture Explanation */}
              <div className="p-4 rounded-xl bg-paper-subtle border border-paper-border space-y-1.5">
                <span className="text-xs font-mono font-bold text-ink flex items-center gap-1.5">
                  <Code2 size={13} strokeWidth={1.75} className="text-accent-blue" />
                  PHYSICAL-TO-SOFTWARE MAPPING
                </span>
                <p className="text-xs text-ink-muted leading-relaxed font-sans">
                  {level.codeSnippet.explanation}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HARDWARE SCHEMATIC NODES */}
          {activeTab === "hardware" && (
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono text-ink-subtle uppercase">
                Circuit Bus Traces &amp; Test Points
              </span>

              <div className="space-y-2">
                {level.hardwareNodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-3 rounded-xl bg-paper-subtle border border-paper-border shadow-paper-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded border border-paper-border bg-paper flex items-center justify-center text-ink-muted shrink-0 mt-0.5">
                        <Cpu size={14} strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-ink">
                            {node.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-paper border border-paper-border text-ink-subtle">
                            {node.chipModel}
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted mt-0.5 font-sans">
                          {node.role}
                        </p>
                        <p className="text-[10px] font-mono text-ink-subtle mt-0.5">
                          {node.testPoint}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={node.status === "nominal" ? "ok" : "signal"}
                      size="sm"
                      dot
                      mono
                    >
                      {node.nominalVoltage}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE */}
          {activeTab === "architecture" && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-paper-subtle border border-paper-border space-y-2.5">
                <div className="flex items-center gap-2 text-ink font-mono text-xs font-bold">
                  <GitBranch size={14} strokeWidth={1.75} className="text-accent-blue" />
                  <span>INVERSION OF CONTROL (DI CONTRACT)</span>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed font-sans">
                  The TV receiver does not instantiate commands directly. It
                  accepts abstractions adhering to <code className="text-ink font-mono font-semibold">IRemoteCommand</code>.
                  This mirrors real hardware where the IR photodiode doesn&apos;t
                  know what action a button executes.
                </p>

                <div className="p-3 bg-paper rounded-lg border border-paper-border font-mono text-xs text-ink-muted space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-ink">
                    <span>Signal Demux</span>
                    <span className="text-accent-ok font-semibold">→ 38kHz Carrier OK</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-ink">
                    <span>Command Registry</span>
                    <span className="text-accent-blue font-semibold">→ Injected via DI</span>
                  </div>
                </div>
              </div>

              {/* Technical Glossary */}
              <div className="p-4 rounded-xl bg-paper-subtle border border-paper-border space-y-2">
                <span className="text-[10px] font-mono text-ink-subtle uppercase">
                  Technical Glossary (Rule 6 • Untranslated)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {level.untranslatedTerms.map((term) => (
                    <span
                      key={term}
                      className="px-2 py-0.5 rounded bg-paper text-ink font-mono text-xs border border-paper-border"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-5 py-3 border-t border-paper-border bg-paper-subtle flex items-center justify-between text-xs font-mono text-ink-subtle">
          <span className="flex items-center gap-1.5">
            <Minimize2 size={12} strokeWidth={1.75} />
            <span>{isPinned ? "Pinned in dock mode" : "Esc or click outside to dismiss"}</span>
          </span>
          <span className="flex items-center gap-1 text-accent-blue font-semibold">
            <span>Level 01 Active</span>
            <ExternalLink size={12} strokeWidth={1.75} />
          </span>
        </div>
      </aside>
    </>
  );
};
