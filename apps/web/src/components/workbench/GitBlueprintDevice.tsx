/**
 * @file apps/web/src/components/workbench/GitBlueprintDevice.tsx
 * @description Blueprint-styled Git Time Machine device: Interactive UNIX Git CLI Terminal,
 * SVG DAG Commit Graph with Bezier links, Branch/HEAD pointers, and Merge Conflict Studio.
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  GitBranch,
  GitCommit as GitCommitIcon,
  GitMerge,
  Terminal,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Send,
} from "lucide-react";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import type { GitCommit } from "@iw/sim-engine";

export const GitBlueprintDevice: React.FC = () => {
  const { t } = useTranslation();
  const {
    gitRepoState,
    gitCliInput,
    gitTerminalLogs,
    selectedCommitId,
    setGitCliInput,
    runGitCommand,
    resolveActiveConflict,
    setSelectedCommitId,
    resetGitRepo,
  } = useWorkbenchStore(
    useShallow((s) => ({
      gitRepoState: s.gitRepoState,
      gitCliInput: s.gitCliInput,
      gitTerminalLogs: s.gitTerminalLogs,
      selectedCommitId: s.selectedCommitId,
      setGitCliInput: s.setGitCliInput,
      runGitCommand: s.runGitCommand,
      resolveActiveConflict: s.resolveActiveConflict,
      setSelectedCommitId: s.setSelectedCommitId,
      resetGitRepo: s.resetGitRepo,
    }))
  );

  const [selectedFile, setSelectedFile] = useState<string>("device.config");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom on new output
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gitTerminalLogs]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitCliInput.trim()) return;
    runGitCommand(gitCliInput);
  };

  const handlePresetCommand = (cmd: string) => {
    setGitCliInput(cmd);
    runGitCommand(cmd);
  };

  // ── DAG Layout Computation ─────────────────────────────────────────
  const { nodes, links, width, height } = useMemo(() => {
    const commitList = Object.values(gitRepoState.commits).sort(
      (a, b) => a.timestamp - b.timestamp
    );

    // Compute topological order / depth
    const depths: Record<string, number> = {};
    for (const c of commitList) {
      if (!c.parents || c.parents.length === 0) {
        depths[c.id] = 0;
      } else {
        const maxParentDepth = Math.max(
          ...c.parents.map((p) => depths[p] ?? 0)
        );
        depths[c.id] = maxParentDepth + 1;
      }
    }

    // Branch vertical lanes
    const branchLanes: Record<string, number> = {
      main: 110,
      dev: 170,
    };
    let nextAvailableLane = 50;

    const nodePositions: Record<
      string,
      { x: number; y: number; commit: GitCommit }
    > = {};

    commitList.forEach((c) => {
      const depth = depths[c.id] ?? 0;
      const x = 50 + depth * 100;

      const branchName = c.branch || "main";
      let y = branchLanes[branchName];
      if (y === undefined) {
        y = nextAvailableLane;
        branchLanes[branchName] = nextAvailableLane;
        nextAvailableLane = nextAvailableLane === 50 ? 210 : nextAvailableLane + 50;
      }

      nodePositions[c.id] = { x, y, commit: c };
    });

    // Generate links (Bezier curves from parents to child)
    const generatedLinks: Array<{
      id: string;
      d: string;
      isMerge: boolean;
    }> = [];

    commitList.forEach((c) => {
      const childPos = nodePositions[c.id];
      if (!childPos) return;

      c.parents.forEach((parentId) => {
        const parentPos = nodePositions[parentId];
        if (!parentPos) return;

        const path =
          parentPos.y === childPos.y
            ? `M ${parentPos.x} ${parentPos.y} L ${childPos.x} ${childPos.y}`
            : `M ${parentPos.x} ${parentPos.y} C ${(parentPos.x + childPos.x) / 2} ${parentPos.y}, ${(parentPos.x + childPos.x) / 2} ${childPos.y}, ${childPos.x} ${childPos.y}`;

        generatedLinks.push({
          id: `${parentId}->${c.id}`,
          d: path,
          isMerge: c.parents.length > 1,
        });
      });
    });

    const maxX = Math.max(
      450,
      ...Object.values(nodePositions).map((n) => n.x + 90)
    );
    const maxY = 240;

    return {
      nodes: Object.values(nodePositions),
      links: generatedLinks,
      width: maxX,
      height: maxY,
    };
  }, [gitRepoState.commits]);

  // Selected commit snapshot files
  const activeCommit =
    gitRepoState.commits[selectedCommitId || "c1"] ||
    gitRepoState.commits["c1"];

  const availableFiles = useMemo(() => {
    if (gitRepoState.conflictState) {
      return Object.keys(gitRepoState.workingTree);
    }
    return Object.keys(activeCommit?.files || gitRepoState.workingTree);
  }, [gitRepoState.conflictState, gitRepoState.workingTree, activeCommit]);

  const activeFileContent =
    (gitRepoState.conflictState
      ? gitRepoState.workingTree[selectedFile]
      : activeCommit?.files[selectedFile]) ??
    gitRepoState.workingTree[selectedFile] ??
    "// Empty file";

  return (
    <div className="w-full h-full flex flex-col bg-[#0D1117] text-[#C9D1D9] border-2 border-[#30363D] rounded-2xl overflow-hidden shadow-2xl select-none">
      {/* ── Top Hardware Control Header ─────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#161B22] border-b border-[#30363D]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#A855F7]" />
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <GitBranch size={16} className="text-purple-400" />
              <span>{t("git.stationTitle", "Station 05: Git Time Machine")}</span>
            </h2>
            <p className="text-[11px] font-mono text-stone-400">
              {t("git.stationSubtitle", "Interactive DAG Commit Graph, CLI Terminal & Conflict Studio")}
            </p>
          </div>
        </div>

        {/* Status Indicators & Reset */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0D1117] border border-[#30363D] text-[11px] font-mono">
            <span className="text-stone-400">HEAD:</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded ${
                gitRepoState.head.type === "branch"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {gitRepoState.head.type === "branch"
                ? `refs/heads/${gitRepoState.head.target}`
                : `detached at ${gitRepoState.head.target}`}
            </span>
          </div>

          <button
            onClick={() => resetGitRepo()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-stone-300 text-xs font-mono transition-colors border border-[#30363D] cursor-pointer"
            title={t("git.resetRepo", "Reset repository to genesis commit")}
          >
            <RotateCcw size={13} />
            <span>{t("git.reset", "Reset Repo")}</span>
          </button>
        </div>
      </div>

      {/* ── Main 3-Column Studio Body ───────────────────────────────── */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* ── Left Column: Interactive UNIX Git Terminal (4 cols) ────── */}
        <div className="col-span-4 flex flex-col bg-[#0D1117] border-r border-[#30363D] p-3 space-y-3 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-[#21262D]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-300">
              <Terminal size={14} className="text-purple-400" />
              <span>{t("git.terminalTitle", "Git CLI Terminal")}</span>
            </div>
            <span className="text-[10px] font-mono text-stone-500">v2.45.0-virtual</span>
          </div>

          {/* Preset Quick Actions */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
              {t("git.quickCommands", "Quick Commands:")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handlePresetCommand("git status")}
                className="px-2 py-1 rounded bg-[#161B22] hover:bg-purple-900/30 border border-[#30363D] hover:border-purple-500/50 text-[10px] font-mono text-stone-300 cursor-pointer transition-colors"
              >
                status
              </button>
              <button
                onClick={() => handlePresetCommand("git log")}
                className="px-2 py-1 rounded bg-[#161B22] hover:bg-purple-900/30 border border-[#30363D] hover:border-purple-500/50 text-[10px] font-mono text-stone-300 cursor-pointer transition-colors"
              >
                log
              </button>
              <button
                onClick={() => handlePresetCommand('git commit -m "feat: add sensor"')}
                className="px-2 py-1 rounded bg-[#161B22] hover:bg-emerald-900/30 border border-[#30363D] hover:border-emerald-500/50 text-[10px] font-mono text-emerald-300 cursor-pointer transition-colors"
              >
                commit
              </button>
              <button
                onClick={() => handlePresetCommand("git checkout -b feature/ir")}
                className="px-2 py-1 rounded bg-[#161B22] hover:bg-cyan-900/30 border border-[#30363D] hover:border-cyan-500/50 text-[10px] font-mono text-cyan-300 cursor-pointer transition-colors"
              >
                branch -b
              </button>
              <button
                onClick={() => handlePresetCommand("git checkout main")}
                className="px-2 py-1 rounded bg-[#161B22] hover:bg-blue-900/30 border border-[#30363D] hover:border-blue-500/50 text-[10px] font-mono text-blue-300 cursor-pointer transition-colors"
              >
                checkout main
              </button>
              <button
                onClick={() => handlePresetCommand("git merge feature/ir")}
                className="px-2 py-1 rounded bg-[#161B22] hover:bg-purple-900/30 border border-[#30363D] hover:border-purple-500/50 text-[10px] font-mono text-purple-300 cursor-pointer transition-colors"
              >
                merge
              </button>
              <button
                onClick={() => handlePresetCommand("git rebase main")}
                className="px-2 py-1 rounded bg-[#161B22] hover:bg-amber-900/30 border border-[#30363D] hover:border-amber-500/50 text-[10px] font-mono text-amber-300 cursor-pointer transition-colors"
              >
                rebase
              </button>
              <button
                onClick={() => handlePresetCommand("git reset HEAD~1")}
                className="px-2 py-1 rounded bg-[#161B22] hover:bg-rose-900/30 border border-[#30363D] hover:border-rose-500/50 text-[10px] font-mono text-rose-300 cursor-pointer transition-colors"
              >
                reset ~1
              </button>
            </div>
          </div>

          {/* Terminal Console Viewport */}
          <div className="flex-1 bg-[#090D13] border border-[#21262D] rounded-xl p-3 font-mono text-[11px] overflow-y-auto space-y-2">
            {gitTerminalLogs.map((log, idx) => (
              <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                {log.startsWith(">") ? (
                  <span className="text-purple-400 font-bold">{log}</span>
                ) : log.includes("CONFLICT") || log.includes("error:") || log.includes("fatal:") ? (
                  <span className="text-rose-400">{log}</span>
                ) : log.includes("Fast-forward") || log.includes("Merge made") || log.includes("Switched to") ? (
                  <span className="text-emerald-400">{log}</span>
                ) : (
                  <span className="text-stone-300">{log}</span>
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Command Input Form */}
          <form onSubmit={handleCommandSubmit} className="flex items-center gap-2">
            <span className="text-purple-400 font-mono text-xs font-bold">$</span>
            <input
              type="text"
              value={gitCliInput}
              onChange={(e) => setGitCliInput(e.target.value)}
              placeholder='e.g. git commit -m "feat: sensor"'
              className="flex-1 px-3 py-2 rounded-lg bg-[#161B22] border border-[#30363D] focus:border-purple-500 text-xs font-mono text-stone-100 placeholder-stone-500 outline-none transition-colors"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* ── Center Column: SVG Interactive DAG Commit Graph (5 cols) ─ */}
        <div className="col-span-5 flex flex-col bg-[#161B22] p-4 border-r border-[#30363D] overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#30363D]/60">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-300">
              <GitCommitIcon size={16} className="text-emerald-400" />
              <span>{t("git.dagGraphTitle", "DAG Commit Graph (Visual History)")}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-stone-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> main
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> feature
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> HEAD
              </span>
            </div>
          </div>

          {/* SVG Canvas with Horizontal Scroll */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden relative flex items-center justify-center py-4">
            <div className="absolute inset-0 bg-notebook-grid opacity-10 pointer-events-none" />
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="min-w-full overflow-visible"
            >
              <defs>
                {/* Neon Glow Filters */}
                <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Draw Commit Edges / Bezier Curves */}
              {links.map((link) => (
                <path
                  key={link.id}
                  d={link.d}
                  fill="none"
                  stroke={link.isMerge ? "#A855F7" : "#38BDF8"}
                  strokeWidth={link.isMerge ? "2.5" : "2"}
                  strokeDasharray={link.isMerge ? "3 3" : "none"}
                  className="transition-all duration-300"
                />
              ))}

              {/* Draw Commit Nodes */}
              {nodes.map(({ x, y, commit }) => {
                const isSelected = selectedCommitId === commit.id;
                const isHead =
                  (gitRepoState.head.type === "commit" &&
                    gitRepoState.head.target === commit.id) ||
                  (gitRepoState.head.type === "branch" &&
                    gitRepoState.branches[gitRepoState.head.target] === commit.id);

                // Find branch tags pointing to this commit
                const branchTags = Object.entries(gitRepoState.branches)
                  .filter(([_, cId]) => cId === commit.id)
                  .map(([name]) => name);

                return (
                  <g
                    key={commit.id}
                    onClick={() => setSelectedCommitId(commit.id)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing Selection Ring */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="20"
                        fill="none"
                        stroke="#A855F7"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        className="animate-spin"
                      />
                    )}

                    {/* Commit Base Circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r="14"
                      fill="#0D1117"
                      stroke={
                        isHead
                          ? "#10B981"
                          : commit.branch === "main"
                          ? "#06B6D4"
                          : "#A855F7"
                      }
                      strokeWidth="2.5"
                      className="group-hover:scale-110 transition-transform"
                    />

                    {/* Commit Short ID */}
                    <text
                      x={x}
                      y={y + 3.5}
                      textAnchor="middle"
                      fill="#F3F4F6"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {commit.id}
                    </text>

                    {/* Branch Tags */}
                    {branchTags.map((bName, bIdx) => {
                      const isHeadBranch =
                        gitRepoState.head.type === "branch" &&
                        gitRepoState.head.target === bName;

                      return (
                        <g key={bName} transform={`translate(${x - 30}, ${y - 32 - bIdx * 20})`}>
                          <rect
                            x="0"
                            y="0"
                            width={bName.length * 6.5 + 24}
                            height="16"
                            rx="3"
                            fill={isHeadBranch ? "#065F46" : "#1E293B"}
                            stroke={isHeadBranch ? "#10B981" : "#06B6D4"}
                            strokeWidth="1"
                          />
                          <text
                            x="6"
                            y="11"
                            fill={isHeadBranch ? "#34D399" : "#38BDF8"}
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {isHeadBranch ? `HEAD -> ${bName}` : bName}
                          </text>
                        </g>
                      );
                    })}

                    {/* Detached HEAD Badge */}
                    {gitRepoState.head.type === "commit" &&
                      gitRepoState.head.target === commit.id && (
                        <g transform={`translate(${x - 35}, ${y + 20})`}>
                          <rect
                            x="0"
                            y="0"
                            width="70"
                            height="15"
                            rx="3"
                            fill="#78350F"
                            stroke="#F59E0B"
                            strokeWidth="1"
                          />
                          <text
                            x="35"
                            y="11"
                            textAnchor="middle"
                            fill="#FDE68A"
                            fontSize="7.5"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            HEAD (detached)
                          </text>
                        </g>
                      )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Commit Info Strip */}
          <div className="p-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className="text-purple-400 font-bold">{activeCommit.id}:</span>
              <span className="text-stone-300 truncate">{activeCommit.message}</span>
            </div>
            <span className="text-stone-500 text-[10px] shrink-0">
              {new Date(activeCommit.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* ── Right Column: File Inspector & Conflict Resolver (3 cols) ─ */}
        <div className="col-span-3 flex flex-col bg-[#0D1117] p-3 space-y-3 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#21262D]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-300">
              <FileCode size={15} className="text-cyan-400" />
              <span>
                {gitRepoState.conflictState
                  ? t("git.conflictStudio", "Conflict Studio")
                  : t("git.fileTree", "Working Tree")}
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-500">
              {availableFiles.length} file(s)
            </span>
          </div>

          {/* CONFLICT RESOLVER VIEW */}
          {gitRepoState.conflictState ? (
            <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-300 text-[11px] font-mono space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={13} className="text-rose-400" />
                  <span>{t("git.conflictAlert", "Merge Conflict Detected!")}</span>
                </div>
                <p className="text-[10px] text-rose-300/80">
                  {t(
                    "git.conflictDesc",
                    "Choose which changes to accept to resolve the conflict and complete the merge."
                  )}
                </p>
              </div>

              {/* Conflict Action Buttons */}
              <div className="space-y-1.5">
                <button
                  onClick={() => resolveActiveConflict("ours")}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-mono text-xs text-left flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Accept Current (HEAD)</span>
                  <CheckCircle2 size={13} />
                </button>
                <button
                  onClick={() => resolveActiveConflict("theirs")}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-blue-300 font-mono text-xs text-left flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Accept Incoming (Branch)</span>
                  <GitMerge size={13} />
                </button>
                <button
                  onClick={() => resolveActiveConflict("both")}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-mono text-xs text-left flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Combine Both Changes</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* File Content Preview */}
              <div className="flex-1 bg-[#090D13] border border-rose-800/40 rounded-xl p-2.5 font-mono text-[10px] text-stone-200 overflow-y-auto whitespace-pre leading-relaxed">
                {activeFileContent}
              </div>
            </div>
          ) : (
            /* NORMAL FILE INSPECTOR VIEW */
            <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
              {/* File Selector Pills */}
              <div className="flex flex-wrap gap-1">
                {availableFiles.map((file) => (
                  <button
                    key={file}
                    onClick={() => setSelectedFile(file)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                      selectedFile === file
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        : "bg-[#161B22] text-stone-400 hover:text-stone-200 border border-[#30363D]"
                    }`}
                  >
                    {file}
                  </button>
                ))}
              </div>

              {/* Code Viewer */}
              <div className="flex-1 bg-[#090D13] border border-[#21262D] rounded-xl p-3 font-mono text-[10px] text-stone-300 overflow-y-auto whitespace-pre leading-relaxed">
                {activeFileContent}
              </div>

              {/* Snapshot Metadata */}
              <div className="p-2 rounded-lg bg-[#161B22] border border-[#21262D] text-[10px] font-mono text-stone-400 space-y-0.5">
                <div>Author: {activeCommit?.author || "Engineer"}</div>
                <div>Parents: {activeCommit?.parents.join(", ") || "none (root)"}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
