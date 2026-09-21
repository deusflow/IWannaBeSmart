/**
 * @file apps/web/src/components/workbench/CommandPaletteModal.tsx
 * @description Command Palette (Cmd + K / Ctrl + K) for rapid search, task jumping, and station actions.
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Tv,
  CreditCard,
  Radio,
  Network,
  GitBranch,
  ShieldCheck,
  Cloud,
  Briefcase,
  Volume2,
  VolumeX,
  Languages,
  User,
  LayoutGrid,
  CornerDownLeft,
  X,
  Star,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import {
  CODING_TASKS,
  FINTECH_TASKS,
  API_FORGE_TASKS,
  GIT_TASKS,
  BANDIT_TASKS,
  VERTEX_TASKS,
  FDE_TASKS,
} from "@iw/sim-engine";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../utils/audioFx";
import { toast } from "../../store/toastStore";

interface PaletteItem {
  id: string;
  type: "station" | "task" | "action";
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: string;
  stars?: number;
  onSelect: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onOpenProfile,
}) => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    setCurrentStationId,
    setCurrentView,
    setTargetTaskId,
    taskMasteryStars,
  } = useWorkbenchStore(
    useShallow((s) => ({
      setCurrentStationId: s.setCurrentStationId,
      setCurrentView: s.setCurrentView,
      setTargetTaskId: s.setTargetTaskId,
      taskMasteryStars: s.taskMasteryStars,
    }))
  );

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle station jump
  const handleJumpStation = useCallback(
    (stationId: string) => {
      if (stationId === "iot") {
        audioFx.playRelayClick();
        toast.info(
          t("hub.stations.iot.badge", "НЕЗАБАРОМ: EventBus & Async I/O"),
          t("hub.unlockCondition", "Потрібно 200+ XP або Модулі 1 та 2")
        );
        onClose();
        return;
      }
      audioFx.playRelayClick();
      setCurrentStationId(stationId);
      setCurrentView("STATION");
      onClose();
    },
    [setCurrentStationId, setCurrentView, onClose, t]
  );

  // Handle task jump
  const handleJumpTask = useCallback(
    (stationId: string, taskId: string) => {
      audioFx.playSuccessFanfare();
      setCurrentStationId(stationId);
      setCurrentView("STATION");
      setTargetTaskId(taskId);
      onClose();
    },
    [setCurrentStationId, setCurrentView, setTargetTaskId, onClose]
  );

  // Stations dictionary
  const stations = useMemo(
    () => [
      {
        id: "tv",
        title: t("hub.stations.tv.title", "Station 01: TV Station"),
        subtitle: t("hub.stations.tv.specs", "18 tasks • Smart TV • C# / Go"),
        icon: Tv,
        color: "text-blue-400",
        badge: "STATION",
      },
      {
        id: "pos",
        title: t("hub.stations.pos.title", "Station 02: Fintech POS Terminal"),
        subtitle: t("hub.stations.pos.specs", "7 tasks • Code Gym • C# / Go"),
        icon: CreditCard,
        color: "text-emerald-400",
        badge: "STATION",
      },
      {
        id: "iot",
        title: t("hub.stations.iot.title", "Station 03: Embedded Hardware & IoT"),
        subtitle: t("hub.stations.iot.specs", "EventBus • Async I/O • C# / Go"),
        icon: Radio,
        color: "text-amber-400",
        badge: t("hub.stationLocked", "НЕЗАБАРОМ"),
      },
      {
        id: "api",
        title: t("hub.stations.api.title", "Station 04: API Forge"),
        subtitle: t("hub.stations.api.specs", "6 tasks • HTTP Client & Server"),
        icon: Network,
        color: "text-cyan-400",
        badge: "STATION",
      },
      {
        id: "git",
        title: t("hub.stations.git.title", "Station 05: Git Time Machine"),
        subtitle: t("hub.stations.git.specs", "6 tasks • Visual DAG & Merges"),
        icon: GitBranch,
        color: "text-orange-400",
      },
      {
        id: "bandit",
        title: t("hub.stations.bandit.title", "Station 06: Cyber Bandit Lab"),
        subtitle: t("hub.stations.bandit.specs", "6 tasks • Blue Team Defense"),
        icon: ShieldCheck,
        color: "text-emerald-300",
      },
      {
        id: "vertex",
        title: t("hub.stations.vertex.title", "Station 07: Vertex AI Architect"),
        subtitle: t("hub.stations.vertex.specs", "15 tasks • Cloud MLOps & TPU"),
        icon: Cloud,
        color: "text-sky-400",
      },
      {
        id: "fde",
        title: t("hub.stations.fde.title", "Station 08: Field AI Deployer"),
        subtitle: t("hub.stations.fde.specs", "15 tasks • Enterprise Multi-Agent"),
        icon: Briefcase,
        color: "text-purple-400",
      },
    ],
    [t]
  );

  // All 73 tasks aggregated with station metadata
  const allTasks = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      stationId: string;
      stationName: string;
      order: number;
    }> = [];

    CODING_TASKS.forEach((tk) =>
      list.push({ id: tk.id, title: t(tk.titleKey, tk.id), stationId: "tv", stationName: "Smart TV", order: tk.order })
    );
    FINTECH_TASKS.forEach((tk) =>
      list.push({ id: tk.id, title: t(tk.titleKey, tk.id), stationId: "pos", stationName: "POS Terminal", order: tk.order })
    );
    API_FORGE_TASKS.forEach((tk) =>
      list.push({ id: tk.id, title: t(tk.titleKey, tk.id), stationId: "api", stationName: "API Forge", order: tk.order })
    );
    GIT_TASKS.forEach((tk) =>
      list.push({ id: tk.id, title: t(tk.titleKey, tk.id), stationId: "git", stationName: "Git Time Machine", order: tk.order })
    );
    BANDIT_TASKS.forEach((tk) =>
      list.push({ id: tk.id, title: t(tk.titleKey, tk.id), stationId: "bandit", stationName: "Cyber Bandit", order: tk.order })
    );
    VERTEX_TASKS.forEach((tk) =>
      list.push({ id: tk.id, title: t(tk.titleKey, tk.id), stationId: "vertex", stationName: "Vertex AI", order: tk.order })
    );
    FDE_TASKS.forEach((tk) =>
      list.push({ id: tk.id, title: t(tk.titleKey, tk.id), stationId: "fde", stationName: "Field AI", order: tk.order })
    );

    return list;
  }, [t]);

  // Quick actions
  const actions: PaletteItem[] = useMemo(
    () => [
      {
        id: "action-hub",
        type: "action",
        title: t("hub.backToHub", "Workbench / Hub"),
        subtitle: t("hub.subtitle", "Select hardware device"),
        icon: LayoutGrid,
        iconColor: "text-amber-400",
        onSelect: () => {
          audioFx.playRelayClick();
          setCurrentView("HUB");
          onClose();
        },
      },
      {
        id: "action-profile",
        type: "action",
        title: t("profile.modalTitle", "Engineering Credentials & Analytics"),
        subtitle: t("profile.growthAreasSubtitle", "Review telemetry & strengths"),
        icon: User,
        iconColor: "text-blue-400",
        onSelect: () => {
          onClose();
          onOpenProfile?.();
        },
      },
      {
        id: "action-sound",
        type: "action",
        title: audioFx.isMuted() ? t("workbench.soundOn", "Turn Sound ON") : t("workbench.soundOff", "Mute Sound"),
        subtitle: "Toggle Web Audio tactile haptics",
        icon: audioFx.isMuted() ? Volume2 : VolumeX,
        iconColor: audioFx.isMuted() ? "text-emerald-400" : "text-slate-400",
        onSelect: () => {
          audioFx.toggleMute();
          onClose();
        },
      },
      {
        id: "action-lang-ua",
        type: "action",
        title: "Змінити мову: Українська",
        subtitle: "Switch interface to Ukrainian",
        icon: Languages,
        iconColor: "text-yellow-400",
        onSelect: () => {
          i18n.changeLanguage("ua");
          onClose();
        },
      },
      {
        id: "action-lang-en",
        type: "action",
        title: "Change Language: English",
        subtitle: "Switch interface to English",
        icon: Languages,
        iconColor: "text-cyan-400",
        onSelect: () => {
          i18n.changeLanguage("en");
          onClose();
        },
      },
      {
        id: "action-lang-da",
        type: "action",
        title: "Skift sprog: Dansk",
        subtitle: "Switch interface to Danish",
        icon: Languages,
        iconColor: "text-red-400",
        onSelect: () => {
          i18n.changeLanguage("da");
          onClose();
        },
      },
    ],
    [t, i18n, onClose, onOpenProfile, setCurrentView]
  );

  // Filter items based on query
  const filteredItems = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();

    // 1. Matched Stations
    const matchedStations: PaletteItem[] = stations
      .filter((s) => !q || s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q) || s.id.includes(q))
      .map((s) => ({
        id: `station-${s.id}`,
        type: "station",
        title: s.title,
        subtitle: s.subtitle,
        icon: s.icon,
        iconColor: s.color,
        badge: s.badge || "STATION",
        onSelect: () => handleJumpStation(s.id),
      }));

    // 2. Matched Tasks (cap to 20 for instant rendering)
    const matchedTasks: PaletteItem[] = allTasks
      .filter(
        (tk) =>
          !q ||
          tk.title.toLowerCase().includes(q) ||
          tk.id.toLowerCase().includes(q) ||
          tk.stationName.toLowerCase().includes(q) ||
          `t${tk.order}` === q
      )
      .slice(0, 20)
      .map((tk) => {
        const stars = taskMasteryStars[tk.id] || 0;
        return {
          id: `task-${tk.id}`,
          type: "task",
          title: tk.title,
          subtitle: `${tk.stationName} • Task ${tk.order}`,
          icon: Terminal,
          iconColor: "text-slate-300",
          badge: tk.stationName.toUpperCase(),
          stars,
          onSelect: () => handleJumpTask(tk.stationId, tk.id),
        };
      });

    // 3. Matched Actions
    const matchedActions = actions.filter(
      (a) => !q || a.title.toLowerCase().includes(q) || (a.subtitle && a.subtitle.toLowerCase().includes(q))
    );

    return [...matchedStations, ...matchedTasks, ...matchedActions];
  }, [query, stations, allTasks, actions, taskMasteryStars, handleJumpStation, handleJumpTask]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].onSelect();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Keep active item scrolled into view
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const activeEl = listEl.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#090D16] border border-slate-700/70 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(59,130,246,0.15)] flex flex-col overflow-hidden text-slate-100 font-sans">
        {/* Subtle grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* ── Search Input ── */}
        <div className="relative z-10 flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-[#0E1422]/90">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={t("cmdPalette.searchPlaceholder", "Search 73 tasks, stations, shortcuts... (e.g. 'git', 'rag', 'sql')")}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-hidden font-sans"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* ── Results List ── */}
        <div ref={listRef} className="relative z-10 max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComp = item.icon;

              return (
                <div
                  key={item.id}
                  data-index={idx}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? "bg-blue-600/20 border border-blue-500/50 text-white shadow-sm"
                      : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-blue-500/20" : "bg-slate-800/80"
                      }`}
                    >
                      <IconComp className={item.iconColor || "text-slate-300"} size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-400 border border-slate-700 uppercase">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.stars !== undefined && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4].map((s) => (
                          <Star
                            key={s}
                            size={11}
                            className={`${
                              s <= item.stars!
                                ? s === 4
                                  ? "text-cyan-400 fill-cyan-400"
                                  : "text-amber-400 fill-amber-400"
                                : "text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    {isSelected && (
                      <CornerDownLeft size={13} className="text-blue-400" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              {t("cmdPalette.noResults", "No results found for")} "{query}"
            </div>
          )}
        </div>

        {/* ── Footer / Shortcuts Hint ── */}
        <div className="relative z-10 flex items-center justify-between px-4 py-2.5 border-t border-slate-800/80 bg-[#0E1422]/90 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] text-slate-300">↑↓</kbd>
              <span>{t("cmdPalette.hintNavigate", "Navigate")}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] text-slate-300">↵</kbd>
              <span>{t("cmdPalette.hintSelect", "Select")}</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <span>IWannaBeSmart</span>
            <span>•</span>
            <span>73 Tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
