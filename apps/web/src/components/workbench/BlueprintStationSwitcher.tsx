import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Tv, Warehouse, Cpu, Lock } from "lucide-react";

interface StationOption {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  status: "ACTIVE BLUEPRINT" | "DRAFT / COMING SOON";
  icon: React.ReactNode;
  isAvailable: boolean;
}

const STATION_OPTIONS: StationOption[] = [
  {
    id: "tv",
    code: "01",
    title: "TV STATION",
    subtitle: "Hardware Signal Flow • Dependency Injection",
    status: "ACTIVE BLUEPRINT",
    icon: <Tv size={16} strokeWidth={1.75} />,
    isAvailable: true,
  },
  {
    id: "garage",
    code: "02",
    title: "GARAGE STATION",
    subtitle: "IoT Ultrasonic Bus • Finite State Machine",
    status: "DRAFT / COMING SOON",
    icon: <Warehouse size={16} strokeWidth={1.75} />,
    isAvailable: false,
  },
  {
    id: "pc",
    code: "03",
    title: "PC WORKSTATION",
    subtitle: "Memory Allocation • CPU Registers & OS",
    status: "DRAFT / COMING SOON",
    icon: <Cpu size={16} strokeWidth={1.75} />,
    isAvailable: false,
  },
];

interface BlueprintStationSwitcherProps {
  currentStationId: string;
  onSelectStation: (id: string) => void;
}

export const BlueprintStationSwitcher: React.FC<BlueprintStationSwitcherProps> = ({
  currentStationId,
  onSelectStation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption =
    STATION_OPTIONS.find((s) => s.id === currentStationId) || STATION_OPTIONS[0];

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative z-40">
      {/* Technical Index Trigger Stamp */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`group flex items-center gap-2.5 px-3 py-1.5 rounded bg-paper-subtle border border-paper-border text-ink font-mono text-xs shadow-paper-sm transition-all duration-150 active:scale-[0.98] cursor-pointer outline-none hover:border-accent-blue/40 ${
          isOpen ? "ring-2 ring-accent-blue/20 border-accent-blue" : ""
        }`}
      >
        <span className="text-accent-blue font-semibold">{activeOption.code}</span>
        <span className="text-ink-subtle">//</span>
        <span className="font-semibold tracking-wide">{activeOption.title}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.75}
          className={`text-ink-muted transition-transform duration-200 ease-out ${
            isOpen ? "rotate-180 text-accent-blue" : ""
          }`}
        />
      </button>

      {/* Spring physics dropdown curtain */}
      <div
        style={{
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={`absolute top-full left-0 mt-2 w-80 sm:w-96 rounded-lg bg-paper-subtle border border-paper-border shadow-paper-lg p-2 transition-all duration-200 origin-top-left ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="px-3 py-2 border-b border-paper-border/70 flex items-center justify-between text-[10px] font-mono text-ink-subtle uppercase">
          <span>Station Index</span>
          <span>Archive Catalog</span>
        </div>

        <div className="py-1 space-y-1">
          {STATION_OPTIONS.map((station) => {
            const isSelected = station.id === currentStationId;
            return (
              <button
                key={station.id}
                disabled={!station.isAvailable}
                onClick={() => {
                  if (station.isAvailable) {
                    onSelectStation(station.id);
                    setIsOpen(false);
                  }
                }}
                className={`w-full text-left p-2.5 rounded-md flex items-start gap-3 transition-all duration-150 select-none outline-none ${
                  isSelected
                    ? "bg-paper border border-accent-blue/30 shadow-paper-sm"
                    : station.isAvailable
                    ? "hover:bg-paper/70 cursor-pointer"
                    : "opacity-45 cursor-not-allowed"
                }`}
              >
                <div
                  className={`mt-0.5 h-7 w-7 rounded border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-accent-blue-light border-accent-blue-border text-accent-blue"
                      : "bg-paper border-paper-border text-ink-muted"
                  }`}
                >
                  {station.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-ink">
                      {station.code} // {station.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                        isSelected
                          ? "bg-accent-ok-light text-accent-ok border-accent-ok-border"
                          : "bg-paper text-ink-subtle border-paper-border"
                      }`}
                    >
                      {station.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted truncate mt-0.5">
                    {station.subtitle}
                  </p>
                </div>

                {!station.isAvailable && (
                  <Lock size={12} strokeWidth={1.75} className="text-ink-subtle mt-1" />
                )}
              </button>
            );
          })}
        </div>

        <div className="px-3 py-1.5 border-t border-paper-border/60 text-[10px] font-mono text-ink-subtle flex justify-between">
          <span>Press ESC to dismiss</span>
          <span>Drafts in dev</span>
        </div>
      </div>
    </div>
  );
};
