import React, { useState } from "react";
import { HubHeader } from "../components/hub/HubHeader";
import { StationCard, type StationData } from "../components/hub/StationCard";
import { Badge, Card } from "@iw/ui";
import { Tv, Warehouse, Cpu, Compass, Info } from "lucide-react";
import type { SupportedLocale } from "@iw/i18n";

const STATIONS: StationData[] = [
  {
    id: "tv",
    title: "TV Station",
    metaphor: "Hardware to Code",
    description:
      "Embedded signal flow, physical wiring faults, and Dependency Injection on an interactive television circuit board.",
    icon: <Tv size={22} strokeWidth={1.75} />,
    technologies: ["C#", "Go", "Embedded", "DI"],
    difficulty: "Beginner",
    estimatedTime: "8 Levels • ~45m",
    totalLevels: 8,
    completedLevels: 0,
    isLocked: false,
    statusText: "Ready",
  },
  {
    id: "garage",
    title: "Garage Station",
    metaphor: "IoT & State Machine",
    description:
      "Ultrasonic distance sensors, safety interlocks, finite state machines, and asynchronous event buses.",
    icon: <Warehouse size={22} strokeWidth={1.75} />,
    technologies: ["Go", "FSM", "Sensors", "Goroutines"],
    difficulty: "Intermediate",
    estimatedTime: "10 Levels • ~60m",
    totalLevels: 10,
    completedLevels: 0,
    isLocked: true,
    statusText: "Coming Soon",
  },
  {
    id: "pc",
    title: "PC Station",
    metaphor: "Memory, CPU & OS",
    description:
      "Register allocation, virtual memory paging, cache invalidation, and fintech transaction ledger processing.",
    icon: <Cpu size={22} strokeWidth={1.75} />,
    technologies: ["C#", "Go", "Memory", "Pointers"],
    difficulty: "Advanced",
    estimatedTime: "12 Levels • ~90m",
    totalLevels: 12,
    completedLevels: 0,
    isLocked: true,
    statusText: "Coming Soon",
  },
];

export const HubScreen: React.FC = () => {
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>("en");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const handleEnterStation = (stationId: string) => {
    if (stationId === "tv") {
      showToast(
        "TV Station workspace selected. Layout & circuit elements will be enabled in Phase 1 (Block E)."
      );
    }
  };

  const handleAuthClick = () => {
    showToast(
      "Guest Mode: Your level progress is saved in localStorage. Supabase cloud sync is configured."
    );
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-accent-blue-light selection:text-accent-blue">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-paper-subtle border border-accent-blue-border shadow-paper-lg text-ink">
            <Info
              size={18}
              strokeWidth={1.75}
              className="text-accent-blue mt-0.5 shrink-0"
            />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-ink">Engineering Console</p>
              <p className="text-ink-muted leading-relaxed">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-ink-subtle hover:text-ink text-xs font-mono ml-auto cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <HubHeader
        currentLocale={currentLocale}
        onLocaleChange={setCurrentLocale}
        xp={0}
        onAuthClick={handleAuthClick}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero Section */}
        <section className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-paper-subtle border border-paper-border text-xs font-mono text-ink-muted shadow-paper-sm">
            <Compass size={13} strokeWidth={1.75} className="text-accent-blue" />
            <span>Interactive Learning Lab • Master Plan Item 20 / 39 / 40</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-sans">
            Software Architecture through Physical Metaphors
          </h1>

          <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-sans">
            Explore software engineering foundations — Dependency Injection,
            event handling, interfaces, and state machines — by diagnosing
            broken physical devices and writing clean C# and Go code.
          </p>
        </section>

        {/* Station Selection Grid */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-paper-border pb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink font-mono flex items-center gap-2">
                <span>Workstation Modules</span>
                <span className="text-xs text-ink-subtle font-normal">
                  (1 Active • 2 Backlog)
                </span>
              </h2>
            </div>
            <Badge variant="accent" size="sm" mono>
              World 01: The Television
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STATIONS.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                onEnter={handleEnterStation}
              />
            ))}
          </div>
        </section>

        {/* Engineering Station Blueprint / Overview Panel */}
        <section className="pt-4">
          <Card
            elevation="paper"
            grid="default"
            padding="lg"
            title="Station 01: Television Diagnostic Blueprint"
            subtitle="Embedded & Hardware to Software Inversion (Items 89–92)"
            headerAction={
              <Badge variant="ok" size="sm" dot mono>
                Board Ready
              </Badge>
            }
          >
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-ink-subtle uppercase">
                  Hardware Domain
                </span>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Power supply unit, ATmega328 MCU, IR receiver, Display driver,
                  and test points for digital logic probing.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-mono text-ink-subtle uppercase">
                  Software Domain
                </span>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Loose coupling via <code className="text-ink font-mono font-semibold">IRemoteCommand</code>,
                  DI-swap simulations, and synchronous C# / Go syntax mapping.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-mono text-ink-subtle uppercase">
                  Fintech Application
                </span>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Underlying ledger transactions and idempotent command handling
                  mirrored onto hardware remote signals.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-paper-border/80 bg-paper-subtle/50 py-6 mt-12 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-ink-subtle">
          <div className="flex items-center gap-3">
            <span>Interactive Workbench</span>
            <span>•</span>
            <span>Design Tokens v1.1 (Pantone Edition)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-ink-muted">English (EN)</span>
            <span>Dansk (DA)</span>
            <span>Українська (UK)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
