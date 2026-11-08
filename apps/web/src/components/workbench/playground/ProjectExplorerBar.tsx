/**
 * @file apps/web/src/components/workbench/playground/ProjectExplorerBar.tsx
 * @description Interactive Project Explorer and Blueprint Solution Drawer.
 *              Demystifies the "magic one-liner" global scope by showing real project
 *              structure (.csproj, classes, Main entrypoint, Heap/Stack allocation).
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FolderTree,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  ChevronRight,
  ChevronDown,
  Layers,
  Cpu,
  X,
  Database,
  Sparkles,
} from "lucide-react";
import { audioFx } from "../../../utils/audioFx";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import {
  STATION_CALLOUTS,
  getStationProjectFiles,
  flattenProjectFiles,
  type ProjectFile,
} from "./stationProjectData";
import { ExecutionFlowPlayer } from "../trace";

interface ProjectExplorerBarProps {
  currentCode?: string;
  codeLang?: "csharp" | "go" | "python" | "yaml" | "typescript";
  isFintech?: boolean;
  className?: string;
  stationId?: string;
}

export const ProjectExplorerBar: React.FC<ProjectExplorerBarProps> = ({
  currentCode = "// tv.PowerOn();",
  codeLang = "csharp",
  isFintech = false,
  className = "",
  stationId,
}) => {
  const { t, i18n } = useTranslation();
  const currentStationId = useWorkbenchStore((s) => s.currentStationId);
  const currentLang = (i18n.language?.startsWith("da")
    ? "da"
    : i18n.language?.startsWith("en")
    ? "en"
    : "ua") as "ua" | "en" | "da";

  const [isOpen, setIsOpen] = useState(false);
  const [isFlowPlayerOpen, setIsFlowPlayerOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string>("program-cs");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    "solution-root": true,
    "solution-root-api": true,
    "solution-root-git": true,
    commands: true,
    "folder-commands": true,
    hardware: true,
    "folder-hardware": true,
    controllers: true,
    "folder-controllers": true,
    services: true,
    "folder-services": true,
    repositories: true,
    "folder-repositories": true,
    middleware: true,
    "folder-middleware": true,
    cmd: true,
    "folder-cmd": true,
    "folder-storage": true,
    "folder-refs": true,
    client: true,
  });

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const activeStation = stationId || currentStationId;
  const projectFiles = getStationProjectFiles(activeStation, isFintech, codeLang, currentCode);
  const rootFolder = projectFiles[0];
  const rawChildren = rootFolder?.children || [];
  const allSelectableFiles = flattenProjectFiles(rawChildren);

  const selectedFile =
    allSelectableFiles.find((f) => f.id === selectedFileId) ||
    allSelectableFiles.find((f) => f.id === "program-cs") ||
    allSelectableFiles[0];

  const handleOpenModal = () => {
    audioFx.playRelayClick();
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    audioFx.playRelayClick();
    setIsOpen(false);
  };

  const handleSelectFile = (id: string) => {
    audioFx.playKeyClick();
    setSelectedFileId(id);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const primaryCodeFile =
    allSelectableFiles.find((f) => f.id === "program-cs") || allSelectableFiles[0];

  return (
    <>
      {/* ── Top Inlined Breadcrumbs & Solution Explorer Trigger ── */}
      <div
        className={`flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-black/[0.07] bg-white text-xs font-mono select-none shadow-2xs ${className}`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-slate-500">
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <FolderTree className="w-3.5 h-3.5 text-emerald-600" />
            {rootFolder?.name || "Solution"}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
          <span className="text-obsidian font-bold flex items-center gap-1">
            <FileCode className="w-3.5 h-3.5 text-[#252932]" />
            {primaryCodeFile?.name ||
              (codeLang === "csharp"
                ? "Program.cs"
                : codeLang === "go"
                ? "main.go"
                : codeLang === "python"
                ? "main.py"
                : codeLang === "yaml"
                ? "config.yaml"
                : "index.ts")}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-black/[0.06] font-semibold text-[10px]">
            {primaryCodeFile?.badge ||
              (codeLang === "csharp"
                ? "entrypoint"
                : codeLang === "go"
                ? "package main"
                : codeLang === "python"
                ? "python3"
                : codeLang === "yaml"
                ? "yaml config"
                : "module")}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <button
            onClick={() => {
              audioFx.playRelayClick();
              setIsFlowPlayerOpen(true);
            }}
            title={t("playground.flowTrace", "Візуалізувати ланцюг виконання (POE)")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-black/[0.08] text-slate-700 text-[11px] font-bold font-mono transition-all active:scale-95 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>{t("playground.flowTrace", "Flow Trace")}</span>
          </button>

          <button
            onClick={handleOpenModal}
            title={t("playground.solutionExplorer", "Оглядач проєкту")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-black/[0.08] text-slate-700 text-[11px] font-bold font-mono transition-all active:scale-95 cursor-pointer shadow-2xs"
          >
            <FolderTree className="w-3.5 h-3.5 text-slate-500" />
            <span>{t("playground.solutionExplorer", "Файли")} ({allSelectableFiles.length})</span>
          </button>
        </div>
      </div>

      {/* ── Blueprint Solution Drawer / Modal (SOLID 100% OPAQUE BACKGROUND) ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F141C]/60 backdrop-blur-md animate-in fade-in duration-200 font-sans">
          <div className="relative w-full max-w-5xl h-[85vh] max-h-[720px] rounded-2xl border border-[#E4E7EC] bg-[#FFFFFF] shadow-luxury flex flex-col overflow-hidden text-[#0F141C] isolate">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E7EC] bg-[#F8F9FA]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-[#0F141C] flex items-center gap-2">
                    <span>{rootFolder?.name || "Solution"}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 font-semibold">
                      {codeLang === "csharp"
                        ? "C# (.NET 9.0)"
                        : codeLang === "go"
                        ? "Go 1.23"
                        : codeLang === "python"
                        ? "Python 3.11"
                        : codeLang === "yaml"
                        ? "YAML Spec"
                        : "TypeScript 5.7"}
                    </span>
                  </h3>
                  <p className="text-xs text-[#525866] font-sans">
                    {t(
                      "playground.inspectArchitecture",
                      "Архітектура та файли реального комерційного проєкту"
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg hover:bg-[#F1F3F5] border border-[#E4E7EC] flex items-center justify-center text-[#525866] hover:text-[#0F141C] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content: 2-column layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-[#FFFFFF]">
              {/* Left Column: File Tree */}
              <div className="md:col-span-4 border-r border-[#E4E7EC] p-3 bg-[#F8F9FA] overflow-y-auto space-y-1">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8A909E] px-2 py-1 flex items-center justify-between">
                  <span>FILES & CLASSES</span>
                  <span className="text-[10px] text-emerald-600">SOLUTION EXPLORER</span>
                </div>

                <div className="space-y-1 font-mono text-xs">
                  {(() => {
                    const renderItem = (item: ProjectFile, depth = 0): React.ReactNode => {
                      if (item.type === "folder") {
                        const isExpanded = expandedFolders[item.id] ?? true;
                        return (
                          <div key={item.id} className="space-y-0.5">
                            <button
                              onClick={() => toggleFolder(item.id)}
                              className="w-full flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-left text-xs font-mono text-[#525866] hover:bg-[#F1F3F5] hover:text-[#0F141C] transition-colors cursor-pointer"
                              style={{ paddingLeft: `${Math.max(8, depth * 14 + 8)}px` }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-[#8A909E] shrink-0" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-[#8A909E] shrink-0" />
                              )}
                              {isExpanded ? (
                                <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                              ) : (
                                <Folder className="w-4 h-4 text-amber-600 shrink-0" />
                              )}
                              <span className="truncate font-semibold text-[#0F141C]">{item.name}</span>
                            </button>
                            {isExpanded && item.children && (
                              <div className="space-y-0.5">
                                {item.children.map((child) => renderItem(child, depth + 1))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      const isSelected = item.id === selectedFile?.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectFile(item.id)}
                          className={`w-full flex items-center justify-between py-1.5 px-2 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#252932] text-[#F8F9FA] font-bold shadow-sm"
                              : "text-[#525866] hover:bg-[#F1F3F5] hover:text-[#0F141C]"
                          }`}
                          style={{ paddingLeft: `${Math.max(16, depth * 14 + 16)}px` }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {item.icon === "config" ? (
                              <FileText className={`w-4 h-4 shrink-0 ${isSelected ? "text-emerald-400" : "text-emerald-600"}`} />
                            ) : item.icon === "interface" ? (
                              <Layers className={`w-4 h-4 shrink-0 ${isSelected ? "text-purple-400" : "text-purple-600"}`} />
                            ) : item.icon === "data" ? (
                              <Database className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-400" : "text-amber-600"}`} />
                            ) : (
                              <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? "text-cyan-400" : "text-cyan-600"}`} />
                            )}
                            <span className="truncate">{item.name}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                                isSelected
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : item.badge === "Main()" || item.badge === "Endpoints"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-[#E4E7EC] text-[#525866]"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    };

                    return rawChildren.map((item) => renderItem(item));
                  })()}
                </div>

                {/* Educational Callout inside File Tree */}
                {(() => {
                  const callout = STATION_CALLOUTS[activeStation] || STATION_CALLOUTS.tv;
                  return (
                    <div className="mt-4 p-3 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 text-xs space-y-1.5 font-sans">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <Cpu className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{callout.title[currentLang] || callout.title.en}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800/90">
                        {callout.body[currentLang] || callout.body.en}
                      </p>
                      <p className="text-[10px] text-amber-700/80 font-mono">
                        {callout.note[currentLang] || callout.note.en}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: Code Viewer & Context Explanation */}
              <div className="md:col-span-8 flex flex-col overflow-hidden bg-[#252932]">
                {/* File Header Tab */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#323846] bg-[#1E222A] font-mono text-xs">
                  <div className="flex items-center gap-2 text-[#F8F9FA] font-semibold">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span>{selectedFile?.name || ""}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    UTF-8 • {codeLang.toUpperCase()}
                  </span>
                </div>

                {/* Code Container (Solid opaque titanium background) */}
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed bg-[#252932] text-emerald-300 select-text border-b border-[#323846]">
                  <pre className="whitespace-pre-wrap">
                    <code>
                      {selectedFile?.codeSnippet?.[codeLang] ??
                        selectedFile?.codeSnippet?.csharp ??
                        selectedFile?.codeSnippet?.python ??
                        selectedFile?.codeSnippet?.go ??
                        selectedFile?.codeSnippet?.yaml ??
                        selectedFile?.codeSnippet?.typescript ??
                        ""}
                    </code>
                  </pre>
                </div>

                {/* File Didactic Summary Footer */}
                <div className="p-3 bg-[#F8F9FA] border-t border-[#E4E7EC] text-xs text-[#525866] flex items-center justify-between font-sans">
                  <span className="leading-relaxed">
                    {selectedFile?.description?.[currentLang] || selectedFile?.description?.en || selectedFile?.description?.ua || ""}
                  </span>
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-1.5 rounded-lg bg-[#252932] hover:bg-[#1E2229] text-[#F8F9FA] font-bold font-mono text-xs transition-all cursor-pointer shrink-0 ml-3 shadow-sm"
                  >
                    {t("common.understood", "Зрозуміло")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Execution Flow Visualizer Player ── */}
      <ExecutionFlowPlayer
        stationId={activeStation || "tv"}
        isOpen={isFlowPlayerOpen}
        onClose={() => setIsFlowPlayerOpen(false)}
      />
    </>
  );
};
