/**
 * @file apps/web/src/components/workbench/trace/SyncedProjectFolderTree.tsx
 * @description Hierarchical project tree synced with Execution Flow Visualizer.
 *              Implements Mayer's Signaling Principle by automatically expanding active
 *              folders and illuminating executing files with pulsating cues.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileCode,
  Box,
  Cpu,
  HelpCircle,
} from "lucide-react";
import type { ProjectFile } from "../playground/stationProjectData";

interface SyncedProjectFolderTreeProps {
  files: ProjectFile[];
  activeFileId: string;
  activeFolderId?: string;
  isWaitingForPoe?: boolean;
  onSelectFile?: (file: ProjectFile) => void;
  onPoeTargetSelect?: (fileId: string) => void;
  className?: string;
}

export const SyncedProjectFolderTree: React.FC<SyncedProjectFolderTreeProps> = ({
  files,
  activeFileId,
  activeFolderId,
  isWaitingForPoe = false,
  onSelectFile,
  onPoeTargetSelect,
  className = "",
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.startsWith("da")
    ? "da"
    : i18n.language?.startsWith("en")
    ? "en"
    : "ua") as "ua" | "en" | "da";

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    "solution-root": true,
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
    "folder-middleware": true,
    "folder-cmd": true,
    "folder-storage": true,
    "folder-refs": true,
    client: true,
  });

  const [prevActiveFile, setPrevActiveFile] = useState(activeFileId);
  const [prevActiveFolder, setPrevActiveFolder] = useState(activeFolderId);

  // Auto-expand folder when activeFolderId or activeFileId changes
  if (activeFileId !== prevActiveFile || activeFolderId !== prevActiveFolder) {
    setPrevActiveFile(activeFileId);
    setPrevActiveFolder(activeFolderId);

    if (activeFileId || activeFolderId) {
      setExpandedFolders((prev) => {
        const next = { ...prev };
        if (activeFolderId) {
          next[activeFolderId] = true;
          next[activeFolderId.toLowerCase()] = true;
        }
        if (activeFileId) {
          const expandAncestors = (items: ProjectFile[]): boolean => {
            for (const item of items) {
              if (item.type === "folder" && item.children) {
                const hasChild = item.children.some(
                  (c) =>
                    c.id.toLowerCase() === activeFileId.toLowerCase() ||
                    (activeFileId.length > 2 && c.id.toLowerCase().includes(activeFileId.toLowerCase()))
                );
                if (hasChild || expandAncestors(item.children)) {
                  next[item.id] = true;
                  next[item.id.toLowerCase()] = true;
                  return true;
                }
              }
            }
            return false;
          };
          expandAncestors(files);
        }
        return next;
      });
    }
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const renderItem = (item: ProjectFile, depth = 0) => {
    if (item.type === "folder") {
      const isExpanded = expandedFolders[item.id] ?? true;
      const isCurrentFolder =
        activeFolderId &&
        (item.id.toLowerCase() === activeFolderId.toLowerCase() ||
          item.name.toLowerCase() === activeFolderId.toLowerCase());

      return (
        <div key={item.id} className="select-none">
          <button
            onClick={() => toggleFolder(item.id)}
            className={`w-full flex items-center gap-1.5 py-1.5 px-2 rounded-md transition-colors text-left text-xs font-mono ${
              isCurrentFolder
                ? "bg-[#252932] text-[#F8F9FA] font-semibold border-l-2 border-[#C5A059]"
                : "text-[#525866] hover:text-[#0F141C] hover:bg-[#F1F3F5]"
            }`}
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
            <span className="truncate">{item.name}</span>
          </button>

          {isExpanded && item.children && (
            <div className="space-y-0.5 mt-0.5">
              {item.children.map((child) => renderItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File item: safely check non-empty activeFileId to prevent matching all files
    const isActive =
      Boolean(activeFileId) &&
      (item.id.toLowerCase() === activeFileId.toLowerCase() ||
        (activeFileId.length > 2 && item.id.toLowerCase().includes(activeFileId.toLowerCase())));

    return (
      <div key={item.id} className="relative">
        <button
          onClick={() => {
            onSelectFile?.(item);
            if (isWaitingForPoe && onPoeTargetSelect) {
              onPoeTargetSelect(item.id);
            }
          }}
          className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md transition-all text-left text-xs font-mono group cursor-pointer ${
            isActive
              ? "bg-[#252932] text-[#F8F9FA] border border-[#252932] shadow-sm font-semibold"
              : isWaitingForPoe
              ? "text-[#0F141C] hover:bg-amber-50 hover:border hover:border-amber-300 hover:text-amber-900"
              : "text-[#525866] hover:bg-[#F1F3F5] hover:text-[#0F141C]"
          }`}
          style={{ paddingLeft: `${Math.max(16, depth * 14 + 16)}px` }}
        >
          <div className="flex items-center gap-1.5 truncate">
            {item.icon === "interface" ? (
              <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-purple-300" : "text-purple-600"}`} />
            ) : item.icon === "driver" ? (
              <Cpu className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-rose-300" : "text-rose-600"}`} />
            ) : (
              <Box className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-blue-300" : "text-blue-600"}`} />
            )}
            <span className="truncate">{item.name}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {isActive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            )}
            {item.badge && (
              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                isActive ? "bg-white/15 text-white" : "bg-[#E4E7EC] text-[#525866] border border-[#D0D5DD]"
              }`}>
                {item.badge}
              </span>
            )}
          </div>
        </button>
      </div>
    );
  };

  const poePromptText =
    currentLang === "en"
      ? "POE: Select file"
      : currentLang === "da"
      ? "POE: Vælg fil"
      : "POE: Виберіть файл";

  return (
    <div
      className={`p-2 bg-[#F8F9FA] border border-[#E4E7EC] rounded-xl flex flex-col ${className}`}
      data-testid="synced-project-folder-tree"
    >
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-[#E4E7EC] px-2 text-[11px] font-mono text-[#525866] uppercase tracking-wider">
        <span>Solution Explorer</span>
        {isWaitingForPoe && (
          <span className="flex items-center gap-1 text-amber-700 font-semibold animate-pulse">
            <HelpCircle className="w-3 h-3" />
            <span>{poePromptText}</span>
          </span>
        )}
      </div>
      <div className="space-y-0.5 overflow-y-auto max-h-[380px] scrollbar-thin">
        {files.map((file) => renderItem(file))}
      </div>
    </div>
  );
};
