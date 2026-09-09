import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Tv, CreditCard, Warehouse, Cpu, Lock } from "lucide-react";

interface StationOption {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  status: "Доступно" | "Незабаром";
  icon: React.ReactNode;
  isAvailable: boolean;
}

const STATION_OPTIONS: StationOption[] = [
  {
    id: "tv",
    code: "Модуль 1",
    title: "Телевізор",
    subtitle: "Апаратний сигнал та архітектурні патерни C# / Go",
    status: "Доступно",
    icon: <Tv size={16} strokeWidth={2} />,
    isAvailable: true,
  },
  {
    id: "pos",
    code: "Модуль 2",
    title: "Фінтех POS-термінал",
    subtitle: "Code Gym: Захист балансу, Guard Clauses та 3-Star Mastery",
    status: "Доступно",
    icon: <CreditCard size={16} strokeWidth={2} />,
    isAvailable: true,
  },
  {
    id: "garage",
    code: "Модуль 3",
    title: "Гаражні ворота",
    subtitle: "Ультразвуковий датчик та кінцеві автомати",
    status: "Незабаром",
    icon: <Warehouse size={16} strokeWidth={2} />,
    isAvailable: false,
  },
  {
    id: "pc",
    code: "Модуль 4",
    title: "Робоча станція",
    subtitle: "Регістри CPU, пам'ять та ОС",
    status: "Незабаром",
    icon: <Cpu size={16} strokeWidth={2} />,
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
      {/* Station Trigger Button in Sniglet Font */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-paper-subtle border border-paper-border text-ink font-display text-sm shadow-paper-sm transition-all duration-150 active:scale-[0.98] cursor-pointer outline-none hover:border-accent-blue/40 ${
          isOpen ? "ring-2 ring-accent-blue/20 border-accent-blue" : ""
        }`}
      >
        <span className="text-accent-blue flex items-center">{activeOption.icon}</span>
        <span className="font-bold text-ink">{activeOption.title}</span>
        <span className="text-[11px] px-2 py-0.5 rounded-md bg-paper border border-paper-border text-ink-muted">
          {activeOption.code}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`text-ink-muted transition-transform duration-200 ease-out ${
            isOpen ? "rotate-180 text-accent-blue" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        style={{
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={`absolute top-full left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-paper-subtle border border-paper-border shadow-paper-lg p-2.5 transition-all duration-200 origin-top-left ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="px-3 py-1.5 border-b border-paper-border/70 flex items-center justify-between text-[11px] font-display text-ink-subtle">
          <span>Вибір світу</span>
          <span>Каталог станцій</span>
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
                className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-all duration-150 select-none outline-none ${
                  isSelected
                    ? "bg-paper border border-accent-blue/30 shadow-paper-sm"
                    : station.isAvailable
                    ? "hover:bg-paper/70 cursor-pointer"
                    : "opacity-45 cursor-not-allowed"
                }`}
              >
                <div
                  className={`mt-0.5 h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-accent-blue-light border-accent-blue-border text-accent-blue"
                      : "bg-paper border-paper-border text-ink-muted"
                  }`}
                >
                  {station.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-display font-bold text-ink">
                      {station.title}
                    </span>
                    <span
                      className={`text-[10px] font-display px-2 py-0.5 rounded-md border ${
                        isSelected
                          ? "bg-accent-ok-light text-accent-ok border-accent-ok-border font-bold"
                          : "bg-paper text-ink-subtle border-paper-border"
                      }`}
                    >
                      {station.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted truncate mt-0.5 font-sans">
                    {station.subtitle}
                  </p>
                </div>

                {!station.isAvailable && (
                  <Lock size={13} strokeWidth={2} className="text-ink-subtle mt-1.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
