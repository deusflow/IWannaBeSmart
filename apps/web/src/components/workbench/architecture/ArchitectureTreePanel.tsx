/**
 * @file apps/web/src/components/workbench/architecture/ArchitectureTreePanel.tsx
 * @description Left architecture panel showing folder containment (solid lines) and dependency links (dashed) with entity trace selection.
 */

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
  PanelLeftClose,
  PanelLeftOpen,
  FolderTree,
  Search,
  CheckCircle2,
  GitBranch,
  type LucideIcon,
} from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";

export interface ArchitectureTreePanelProps {
  onAddNode?: (fileId: string) => void;
  activeFileIds?: Set<string>;
  selectedEntityId?: string;
  onSelectEntity?: (entityId: string) => void;
}

const ICON_MAP: Record<EntityType, LucideIcon> = {
  interface: FileCode,
  class: Box,
  controller: Cpu,
  service: Zap,
};

const COLOR_MAP: Record<EntityType, string> = {
  interface: "text-purple-400 bg-purple-500/15 border-purple-500/30",
  class: "text-blue-400 bg-blue-500/15 border-blue-500/30",
  controller: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  service: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
};

export const ArchitectureTreePanel: React.FC<ArchitectureTreePanelProps> = ({
  onAddNode: _onAddNode,
  activeFileIds: _activeFileIds = new Set(),
  selectedEntityId,
  onSelectEntity,
}) => {
  const { t } = useTranslation();
  const { selectedTraceEntityId, setSelectedTraceEntityId } = useWorkbenchStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    interfaces: true,
    commands: true,
    controllers: true,
    services: true,
  });

  const activeEntity = selectedEntityId || selectedTraceEntityId || "IRemoteCommand";

  const toggleFolder = (folderKey: string) => {
    setOpenFolders((prev) => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  const folders = Object.keys(FOLDER_LABELS) as (keyof typeof FOLDER_LABELS)[];

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

  const handleEntityClick = (file: ProjectFile) => {
    const entityKey = file.name.replace(".cs", "");
    if (onSelectEntity) {
      onSelectEntity(entityKey);
    } else {
      setSelectedTraceEntityId(entityKey);
    }
  };

  if (isCollapsed) {
    return (
      <div
        className="w-10 flex flex-col items-center py-3 select-none shrink-0 h-full border-r transition-all"
        style={{ background: "#1A1B1D", borderColor: "#2A2B2F" }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          title={t("architecture.projectTree", "Дерево проєкту")}
          className="p-1.5 rounded-lg hover:bg-[#2A2B2F] text-gray-400 hover:text-gray-200 cursor-pointer border border-[#2A2B2F]"
        >
          <PanelLeftOpen size={16} />
        </button>
        <div className="mt-4 [writing-mode:vertical-rl] rotate-180 text-[11px] font-mono font-bold text-gray-400 tracking-wider">
          {t("architecture.projectTree", "ARCHITECTURE TREE")}
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-64 sm:w-72 flex flex-col select-none shrink-0 overflow-hidden h-full border-r z-10"
      style={{ background: "#1A1B1D", borderColor: "#2A2B2F" }}
    >
      {/* Header */}
      <div
        className="px-3 py-2.5 border-b flex items-center justify-between gap-2"
        style={{ background: "#17181A", borderColor: "#2A2B2F" }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <FolderTree size={15} className="text-blue-400 shrink-0" />
          <span className="font-mono font-bold text-xs text-gray-200 truncate">
            {t("architecture.projectTree", "ArchitectureTreePanel")}
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
          <Search size={13} className="absolute left-2.5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("architecture.filterFiles", "Пошук сутності...")}
            className="w-full bg-[#131416] border border-[#2A2B2F] rounded-lg pl-8 pr-2 py-1 text-[11px] font-mono text-gray-200 placeholder-gray-600 focus:outline-hidden focus:border-blue-500/60"
          />
        </div>
      </div>

      {/* Tree Content: Folders & Files */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
        {folders.map((folderKey) => {
          const folderFiles = filteredFiles.filter((f) => f.folder === folderKey);
          if (folderFiles.length === 0 && searchQuery) return null;
          const isOpen = openFolders[folderKey] ?? true;

          return (
            <div key={folderKey} className="space-y-1">
              {/* Folder Node (Solid containment header) */}
              <div
                onClick={() => toggleFolder(folderKey)}
                className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-[#25262B] text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  {isOpen ? (
                    <FolderOpen size={14} className="text-amber-400/80 shrink-0" />
                  ) : (
                    <Folder size={14} className="text-amber-400/80 shrink-0" />
                  )}
                  <span className="font-mono text-[11px] font-semibold tracking-wide">
                    {FOLDER_LABELS[folderKey]}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-600 px-1">
                  {folderFiles.length}
                </span>
              </div>

              {/* Files in Folder (Connected by solid containment line) */}
              {isOpen && (
                <div className="ml-3 pl-2.5 border-l border-white/[0.08] space-y-1 my-0.5">
                  {folderFiles.map((file) => {
                    const IconComponent = ICON_MAP[file.entityType] || FileCode;
                    const colorStyle = COLOR_MAP[file.entityType] || "text-gray-400";
                    const isSelected = activeEntity.includes(file.name.replace(".cs", ""));

                    return (
                      <div
                        key={file.id}
                        onClick={() => handleEntityClick(file)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                          isSelected
                            ? "bg-blue-950/40 border-blue-500/60 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                            : "bg-[#1E2024]/60 border-white/[0.04] hover:bg-[#252830] hover:border-white/10"
                        }`}
                        title={`Клікніть для побудови TraceGraph для ${file.name}`}
                      >
                        <div className="flex items-center justify-between gap-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`p-1 rounded border shrink-0 ${colorStyle}`}>
                              <IconComponent size={12} />
                            </span>
                            <span
                              className={`font-mono text-[11px] font-bold truncate ${
                                isSelected ? "text-blue-300" : "text-gray-200"
                              }`}
                            >
                              {file.name}
                            </span>
                          </div>

                          {isSelected && (
                            <span className="flex items-center gap-0.5 px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[8px] font-mono font-bold shrink-0">
                              <CheckCircle2 size={9} />
                              <span>TRACE</span>
                            </span>
                          )}
                        </div>

                        {/* Dependency links (Dashed indicators) */}
                        {file.implementsInterface && (
                          <div className="flex items-center gap-1 text-[9px] font-mono text-purple-400 pl-1 border-l-2 border-dashed border-purple-500/40 ml-1">
                            <GitBranch size={10} className="shrink-0" />
                            <span className="truncate">implements {file.implementsInterface}</span>
                          </div>
                        )}

                        {file.id === "class-tv-controller" && (
                          <div className="flex items-center gap-1 text-[9px] font-mono text-amber-400 pl-1 border-l-2 border-dashed border-amber-500/40 ml-1">
                            <GitBranch size={10} className="shrink-0" />
                            <span className="truncate">ctor(IRemoteCommand)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
