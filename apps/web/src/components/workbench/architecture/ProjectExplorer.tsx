import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PROJECT_FILES, FOLDER_LABELS } from "./projectData";
import type { ProjectFile, EntityType } from "./types";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileCode,
  Box,
  Cpu,
  Zap,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  FolderTree,
  Search,
  X,
  LucideIcon,
} from "lucide-react";

import { useWorkbenchStore } from "../../../store/workbenchStore";

interface ProjectExplorerProps {
  onAddNode: (fileId: string) => void;
  activeFileIds: Set<string>;
}

const ICON_MAP: Record<EntityType, LucideIcon> = {
  interface: FileCode,
  class: Box,
  controller: Cpu,
  service: Zap,
};

const COLOR_MAP: Record<EntityType, string> = {
  interface: "text-purple-400 bg-purple-500/15",
  class: "text-blue-400 bg-blue-500/15",
  controller: "text-amber-400 bg-amber-500/15",
  service: "text-emerald-400 bg-emerald-500/15",
};

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  onAddNode,
  activeFileIds,
}) => {
  const { t } = useTranslation();
  const { mentorPhase, guidedStep, setGuidedStep } = useWorkbenchStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    interfaces: true,
    commands: true,
    controllers: true,
    services: true,
  });

  const toggleFolder = (folderKey: string) => {
    setOpenFolders((prev) => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  const handleDragStart = (e: React.DragEvent, file: ProjectFile) => {
    e.dataTransfer.setData("application/reactflow", file.id);
    e.dataTransfer.effectAllowed = "move";
    if (mentorPhase === "GUIDED" && guidedStep === 2 && file.id.includes("power-command")) {
      setGuidedStep(3);
    }
  };

  const folders = Object.keys(FOLDER_LABELS) as (keyof typeof FOLDER_LABELS)[];

  // Filter files by search query
  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return PROJECT_FILES;
    return PROJECT_FILES.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.role.toLowerCase().includes(q) ||
        f.path.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (isCollapsed) {
    return (
      <div
        className="w-10 flex flex-col items-center py-3 select-none shrink-0 h-full border-r"
        style={{ background: "#1A1B1D", borderColor: "#2A2B2F" }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          title={t("architecture.projectTree")}
          className="p-1.5 rounded-lg hover:bg-[#2A2B2F] text-gray-500 hover:text-gray-300 cursor-pointer border border-[#2A2B2F]"
        >
          <PanelLeftOpen size={16} />
        </button>
        <div className="mt-4 [writing-mode:vertical-rl] rotate-180 text-[11px] font-display font-bold text-gray-500 tracking-wider">
          {t("architecture.projectTree")}
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-64 sm:w-72 flex flex-col select-none shrink-0 overflow-hidden h-full border-r"
      style={{ background: "#1A1B1D", borderColor: "#2A2B2F" }}
    >
      {/* Header */}
      <div
        className="px-3 py-2.5 border-b flex items-center justify-between gap-2"
        style={{ background: "#17181A", borderColor: "#2A2B2F" }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <FolderTree size={15} className="text-blue-400 shrink-0" />
          <span className="font-display font-bold text-xs text-gray-200 truncate">
            {t("architecture.projectTree")}
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          title="Згорнути панель"
          className="p-1 rounded-md hover:bg-[#2A2B2F] text-gray-500 hover:text-gray-300 cursor-pointer"
        >
          <PanelLeftClose size={14} />
        </button>
      </div>

      {/* Quick Search Input */}
      <div className="p-2 border-b" style={{ borderColor: "#2A2B2F" }}>
        <div className="relative flex items-center">
          <Search
            size={13}
            className="absolute left-2.5 text-gray-600 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("architecture.searchPlaceholder")}
            className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs font-mono text-gray-200 placeholder:text-gray-600 border focus:border-blue-500/60 focus:outline-none transition-colors"
            style={{ background: "#242529", borderColor: "#2E2F33" }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-gray-500 hover:text-gray-300 cursor-pointer p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Subtitle / Drag hint */}
      <div
        className="px-3 py-1.5 border-b"
        style={{ background: "#1D1E20", borderColor: "#2A2B2F" }}
      >
        <p className="font-balsamiq text-[10px] text-gray-500 leading-tight">
          {t("architecture.dragHint")}
        </p>
      </div>

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {folders.map((folderKey) => {
          const filesInFolder = filteredFiles.filter(
            (f) => f.folder === folderKey
          );
          if (searchQuery && filesInFolder.length === 0) return null;

          const isOpen = searchQuery ? true : openFolders[folderKey];

          return (
            <div key={folderKey} className="space-y-0.5">
              {/* Folder Header */}
              <button
                onClick={() => toggleFolder(folderKey)}
                className="w-full px-1.5 py-1 rounded-md hover:bg-[#242529] flex items-center gap-1 text-left text-xs font-mono font-bold text-gray-300 transition-colors cursor-pointer"
              >
                {isOpen ? (
                  <ChevronDown
                    size={12}
                    className="text-gray-500 shrink-0"
                  />
                ) : (
                  <ChevronRight
                    size={12}
                    className="text-gray-500 shrink-0"
                  />
                )}
                {isOpen ? (
                  <FolderOpen
                    size={13}
                    className="text-amber-400 shrink-0"
                  />
                ) : (
                  <Folder size={13} className="text-amber-400 shrink-0" />
                )}
                <span className="truncate">{FOLDER_LABELS[folderKey]}</span>
                <span className="ml-auto font-mono text-[9px] text-gray-600 font-normal">
                  {filesInFolder.length}
                </span>
              </button>

              {/* Folder Content */}
              {isOpen && (
                <div className="pl-3.5 space-y-0.5 border-l border-[#2A2B2F] ml-2.5">
                  {filesInFolder.map((file) => {
                    const Icon = ICON_MAP[file.entityType] || Box;
                    const colorClass = COLOR_MAP[file.entityType];
                    const isOnBoard = activeFileIds.has(file.id);

                    const isTargetFile = mentorPhase === "GUIDED" && guidedStep === 2 && file.id === "file-power-cmd";

                    return (
                      <div
                        key={file.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, file)}
                        onClick={() => {
                          onAddNode(file.id);
                          if (isTargetFile) setGuidedStep(3);
                        }}
                        title={`${file.name}\n${file.role}\n(${t(
                          "architecture.dragHint"
                        )})`}
                        className={`group px-2 py-1.5 rounded-lg flex items-center justify-between gap-1.5 transition-all duration-150 cursor-grab active:cursor-grabbing border ${
                          isTargetFile
                            ? "bg-purple-950/40 border-purple-500/80 ring-2 ring-purple-400/80 shadow-[0_0_14px_rgba(168,85,247,0.7)] animate-pulse text-purple-200"
                            : isOnBoard
                            ? "bg-[#242529] border-blue-500/30 text-gray-200 shadow-xs"
                            : "bg-transparent hover:bg-[#242529] border-transparent hover:border-[#3E3F45] text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`p-1 rounded shrink-0 ${colorClass}`}
                          >
                            <Icon size={12} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-mono text-[11.5px] font-medium block truncate leading-tight">
                              {file.name}
                            </span>
                            <span className="font-balsamiq text-[9.5px] text-gray-500 block truncate">
                              {file.role}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center pl-1">
                          {isOnBoard ? (
                            <span
                              className="h-2 w-2 rounded-full bg-blue-500 shadow-xs"
                              title="Розміщено на дошці"
                            />
                          ) : (
                            <Plus
                              size={13}
                              className="opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredFiles.length === 0 && (
          <div className="p-4 text-center text-xs font-balsamiq text-gray-500">
            Файлів не знайдено
          </div>
        )}
      </div>
    </div>
  );
};
