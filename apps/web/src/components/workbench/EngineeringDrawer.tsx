import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { StationLevel } from "@iw/sim-engine";
import { Badge, Tabs, type TabItem } from "@iw/ui";
import { InteractiveCodePlayground } from "./playground/InteractiveCodePlayground";
import { CircuitCanvas } from "./circuit/CircuitCanvas";
import {
  X,
  Terminal,
  Pin,
  PinOff,
  Minimize2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface EngineeringDrawerProps {
  isOpen: boolean;
  isPinned: boolean;
  onTogglePin: () => void;
  onClose: () => void;
  level: StationLevel;
  inline?: boolean;
  onOpenArchitectureStudio?: () => void;
}

export const EngineeringDrawer: React.FC<EngineeringDrawerProps> = ({
  isOpen,
  isPinned,
  onTogglePin,
  onClose,
  level,
  inline = false,
  onOpenArchitectureStudio,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("code");
  const [isObjectiveExpanded, setIsObjectiveExpanded] = useState<boolean>(false);

  const drawerTabs: TabItem[] = React.useMemo(
    () => [
      { id: "code", label: t("workbench.drawerTabs.code", "Код (C# / Go)") },
      { id: "hardware", label: t("workbench.drawerTabs.hardware", "Апаратні вузли") },
    ],
    [t]
  );

  // Handle ESC key
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

  const content = (
    <aside
      style={{
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`bg-white rounded-3xl border border-black/[0.08] shadow-luxury flex flex-col overflow-hidden transition-all duration-300 ${
        inline
          ? "w-full h-full relative"
          : "fixed z-40 top-16 bottom-4 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[640px] lg:w-[55vw] lg:min-w-[640px] lg:max-w-[860px] animate-in slide-in-from-right-4"
      } ${isPinned ? "ring-2 ring-[#252932]/20" : ""}`}
    >
      {/* Drawer Header with Pin & Close Controls */}
      <div className="p-4 sm:p-5 border-b border-black/[0.06] bg-slate-50/70 flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm" className="font-display text-[10px]">
              {t("drawer.levelBadge", { number: level.levelNumber, defaultValue: `Рівень ${level.levelNumber}` })}
            </Badge>
            <span className="text-xs font-display text-slate-500 truncate">
              {t("workbench.stationTitle", { defaultValue: level.stationTitle })}
            </span>
            {isPinned && (
              <span className="text-[10px] font-display px-2 py-0.5 rounded-md bg-[#252932]/10 text-obsidian border border-[#252932]/20 font-bold">
                {t("drawer.pinned", "Закріплено")}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-obsidian font-display truncate">
            {t("level.level1Title", { defaultValue: level.title })}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-2">
            {t("level.level1Briefing", { defaultValue: level.briefing })}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          {/* Pin / Dock Toggle Button */}
          <button
            onClick={onTogglePin}
            title={
              isPinned
                ? t("drawer.unpin", "Unpin Drawer (Floating Overlay)")
                : t("drawer.pin", "Pin Drawer (Side-by-side Dock)")
            }
            className={`p-1.5 rounded-lg border transition-all duration-150 cursor-pointer outline-none ${
              isPinned
                ? "bg-[#252932] text-white border-[#252932] shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:text-obsidian border-black/[0.06] hover:bg-slate-200"
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
            title={t("drawer.close", "Close Drawer (ESC)")}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-obsidian transition-colors cursor-pointer border border-black/[0.06]"
          >
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-5 pt-3 bg-slate-50/70 border-b border-black/[0.06]">
        <Tabs
          tabs={drawerTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="line"
        />
      </div>

      {/* Content Area with Vellum Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-notebook-grid space-y-4">
        {/* Objective Callout with Accordion Disclosure */}
        <div className="rounded-2xl bg-white border border-black/[0.08] shadow-2xs overflow-hidden transition-all duration-200">
          <button
            onClick={() => setIsObjectiveExpanded((p) => !p)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left cursor-pointer hover:bg-slate-50 transition-colors"
            title={isObjectiveExpanded ? t("common.collapse", "Згорнути") : t("common.expand", "Розгорнути")}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-display font-bold text-[#252932] flex items-center gap-1.5 text-xs shrink-0">
                <Terminal size={13} strokeWidth={2} />
                {t("drawer.objectiveTitle", "Інженерне завдання:")}
              </span>
              <span className="text-slate-500 text-xs font-sans truncate">
                {t("level.level1Objective", { defaultValue: level.objective })}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-mono shrink-0">
              <span>{isObjectiveExpanded ? t("common.collapse", "Згорнути") : t("common.details", "Деталі")}</span>
              {isObjectiveExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </div>
          </button>

          {isObjectiveExpanded && (
            <div className="px-3.5 pb-3.5 pt-1 border-t border-black/[0.06] text-xs text-obsidian leading-relaxed font-sans animate-in fade-in space-y-2">
              <p className="font-medium text-obsidian">
                {t("level.level1Objective", { defaultValue: level.objective })}
              </p>
              {level.briefing && (
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-black/[0.06] leading-normal">
                  <span className="font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                    {t("level.briefingLabel", "Брифінг:")}
                  </span>
                  {t("level.level1Briefing", { defaultValue: level.briefing })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* TAB 1: INTERACTIVE LIVE CODING PLAYGROUND */}
        {activeTab === "code" && (
          <InteractiveCodePlayground onOpenArchitectureStudio={onOpenArchitectureStudio} />
        )}

        {/* TAB 2: HARDWARE CIRCUIT SCHEMATIC */}
        {activeTab === "hardware" && (
          <div className="w-full">
            <CircuitCanvas />
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="px-5 py-3 border-t border-black/[0.06] bg-slate-50/70 flex items-center justify-between text-xs font-display text-slate-500">
        <span className="flex items-center gap-1.5">
          <Minimize2 size={12} strokeWidth={1.75} />
          <span>
            {isPinned
              ? t("drawer.footerPinned", "Закріплено на верстаку")
              : t("drawer.footerEsc", "Esc або закрити")}
          </span>
        </span>
        <span className="flex items-center gap-1 text-[#252932] font-bold">
          <span>{t("drawer.footerActive", "Телевізор • Схема активна")}</span>
          <ExternalLink size={12} strokeWidth={1.75} />
        </span>
      </div>
    </aside>
  );

  return content;
};
