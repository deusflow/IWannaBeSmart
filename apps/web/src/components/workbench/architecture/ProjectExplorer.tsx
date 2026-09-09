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
  interface: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
  class: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  controller: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  service: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
};

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  onAddNode,
  activeFileIds,
}) => {
  const { t } = useTranslation();
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
      <div className="w-10 bg-paper border-r border-paper-border flex flex-col items-center py-3 select-none shrink-0 h-full">
        <button
          onClick={() => setIsCollapsed(false)}
          title={t("architecture.projectTree")}
          className="p-1.5 rounded-lg hover:bg-paper-muted text-ink-muted hover:text-ink cursor-pointer border border-paper-border"
        >
          <PanelLeftOpen size={16} />
        </button>
        <div className="mt-4 [writing-mode:vertical-rl] rotate-180 text-[11px] font-display font-bold text-ink-muted tracking-wider">
          {t("architecture.projectTree")}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 sm:w-72 bg-paper border-r border-paper-border flex flex-col select-none shrink-0 overflow-hidden h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-paper-border flex items-center justify-between gap-2 bg-paper-subtle">
        <div className="flex items-center gap-1.5 min-w-0">
          <FolderTree size={15} className="text-accent-blue shrink-0" />
          <span className="font-display font-bold text-xs text-ink truncate">
            {t("architecture.projectTree")}
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          title="Згорнути панель"
          className="p-1 rounded-md hover:bg-paper text-ink-subtle hover:text-ink cursor-pointer"
        >
          <PanelLeftClose size={14} />
        </button>
      </div>

      {/* Quick Search Input */}
      <div className="p-2 border-b border-paper-border bg-paper">
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-ink-subtle pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("architecture.searchPlaceholder")}
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-paper-muted text-xs font-mono text-ink placeholder:text-ink-subtle border border-paper-border focus:border-accent-blue focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-ink-subtle hover:text-ink cursor-pointer p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Subtitle / Drag hint */}
      <div className="px-3 py-1.5 bg-paper-muted/40 border-b border-paper-border/60">
        <p className="font-balsamiq text-[10px] text-ink-muted leading-tight">
          {t("architecture.dragHint")}
        </p>
      </div>

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {folders.map((folderKey) => {
          const filesInFolder = filteredFiles.filter((f) => f.folder === folderKey);
          if (searchQuery && filesInFolder.length === 0) return null;

          // If searching, force folder open
          const isOpen = searchQuery ? true : openFolders[folderKey];

          return (
            <div key={folderKey} className="space-y-0.5">
              {/* Folder Header */}
              <button
                onClick={() => toggleFolder(folderKey)}
                className="w-full px-1.5 py-1 rounded-md hover:bg-paper-muted flex items-center gap-1 text-left text-xs font-mono font-bold text-ink transition-colors cursor-pointer"
              >
                {isOpen ? (
                  <ChevronDown size={12} className="text-ink-subtle shrink-0" />
                ) : (
                  <ChevronRight size={12} className="text-ink-subtle shrink-0" />
                )}
                {isOpen ? (
                  <FolderOpen size={13} className="text-amber-500 shrink-0" />
                ) : (
                  <Folder size={13} className="text-amber-500 shrink-0" />
                )}
                <span className="truncate">{FOLDER_LABELS[folderKey]}</span>
                <span className="ml-auto font-mono text-[9px] text-ink-subtle font-normal">
                  {filesInFolder.length}
                </span>
              </button>

              {/* Folder Content */}
              {isOpen && (
                <div className="pl-3.5 space-y-0.5 border-l border-paper-border/70 ml-2.5">
                  {filesInFolder.map((file) => {
                    const Icon = ICON_MAP[file.entityType] || Box;
                    const colorClass = COLOR_MAP[file.entityType];
                    const isOnBoard = activeFileIds.has(file.id);

                    return (
                      <div
                        key={file.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, file)}
                        onClick={() => onAddNode(file.id)}
                        title={`${file.name}\n${file.role}\n(${t("architecture.dragHint")})`}
                        className={`group px-2 py-1.5 rounded-lg flex items-center justify-between gap-1.5 transition-all duration-150 cursor-grab active:cursor-grabbing border ${
                          isOnBoard
                            ? "bg-paper-subtle border-accent-blue/30 text-ink shadow-xs"
                            : "bg-paper hover:bg-paper-muted border-transparent hover:border-paper-border text-ink-muted hover:text-ink"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`p-1 rounded shrink-0 ${colorClass}`}>
                            <Icon size={12} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-mono text-[11.5px] font-medium block truncate leading-tight">
                              {file.name}
                            </span>
                            <span className="font-balsamiq text-[9.5px] text-ink-subtle block truncate">
                              {file.role}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center pl-1">
                          {isOnBoard ? (
                            <span
                              className="h-2 w-2 rounded-full bg-accent-blue shadow-xs"
                              title="Розміщено на дошці"
                            />
                          ) : (
                            <Plus
                              size={13}
                              className="opacity-0 group-hover:opacity-100 text-accent-blue transition-opacity"
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
          <div className="p-4 text-center text-xs font-balsamiq text-ink-subtle">
            Файлів не знайдено
          </div>
        )}
      </div>
    </div>
  );
};
