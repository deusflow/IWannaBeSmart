import React, { useState } from "react";
import {
  Button,
  Card,
  Badge,
  Tabs,
  ProgressBar,
  type TabItem,
  type ProgressBarVariant,
} from "@iw/ui";
import { TECHNICAL_TERMS } from "@iw/i18n";

const modeTabs: TabItem[] = [
  { id: "overview", label: "Overview", count: 5 },
  { id: "components", label: "Components", count: 12 },
  { id: "grid", label: "Vellum Grid", badge: "16px/8px" },
  { id: "states", label: "Pantone States" },
];

const segmentedTabs: TabItem[] = [
  { id: "normal", label: "Normal" },
  { id: "hardware", label: "Hardware" },
  { id: "architecture", label: "Architecture" },
  { id: "code", label: "Code" },
  { id: "test", label: "Test" },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [segmentedTab, setSegmentedTab] = useState("hardware");
  const [buttonClicks, setButtonClicks] = useState(0);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [progressValue, setProgressValue] = useState(65);
  const [progressVariant, setProgressVariant] =
    useState<ProgressBarVariant>("accent");

  const toggleLoading = () => {
    setIsLoadingDemo(true);
    setTimeout(() => setIsLoadingDemo(false), 1500);
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-accent-blue-light selection:text-accent-blue py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <header className="border-b border-paper-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-ink font-sans">
                Interactive Workbench
              </h1>
              <Badge variant="accent" size="sm" mono>
                Pantone Edition
              </Badge>
            </div>
            <p className="text-sm text-ink-muted mt-1 font-sans">
              Japanese Stationery & Pantone Palette • Warm Cotton Paper & Carbon
              Ink
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="ok" dot pulse size="md">
              Deep Pine Active
            </Badge>
            <Badge variant="neutral" size="md" mono>
              Inter + JetBrains Mono
            </Badge>
          </div>
        </header>

        {/* Navigation Tabs Preview */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs
              tabs={modeTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="line"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-ink-subtle">
                Station Modes:
              </span>
              <Tabs
                tabs={segmentedTabs}
                activeTab={segmentedTab}
                onChange={setSegmentedTab}
                variant="segmented"
              />
            </div>
          </div>
        </section>

        {/* Section 1: Japanese Stationery & Pantone Palette */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle font-mono">
              01 / Japanese Stationery & Pantone Palette
            </h2>
            <span className="text-xs text-ink-subtle font-mono">
              Warm Cotton (#F4F0E8) • Carbon Ink (#1A1D20)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-paper-subtle p-3 rounded-lg border border-paper-border shadow-paper-sm">
              <div className="h-9 w-full rounded bg-paper border border-paper-border mb-2" />
              <p className="text-xs font-semibold text-ink">Warm Cotton</p>
              <p className="text-[11px] font-mono text-ink-subtle">#F4F0E8</p>
            </div>

            <div className="bg-paper-subtle p-3 rounded-lg border border-paper-border shadow-paper-sm">
              <div className="h-9 w-full rounded bg-paper-subtle border border-paper-border mb-2" />
              <p className="text-xs font-semibold text-ink">Paper Subtle</p>
              <p className="text-[11px] font-mono text-ink-subtle">#FAF7F2</p>
            </div>

            <div className="bg-paper-subtle p-3 rounded-lg border border-paper-border shadow-paper-sm">
              <div className="h-9 w-full rounded bg-ink mb-2" />
              <p className="text-xs font-semibold text-ink">Carbon Ink</p>
              <p className="text-[11px] font-mono text-ink-subtle">#1A1D20</p>
            </div>

            <div className="bg-paper-subtle p-3 rounded-lg border border-paper-border shadow-paper-sm">
              <div className="h-9 w-full rounded bg-ink-muted mb-2" />
              <p className="text-xs font-semibold text-ink">Graphite Text</p>
              <p className="text-[11px] font-mono text-ink-subtle">#5A6065</p>
            </div>

            <div className="bg-paper-subtle p-3 rounded-lg border border-paper-border shadow-paper-sm">
              <div className="h-9 w-full rounded bg-accent-blue mb-2" />
              <p className="text-xs font-semibold text-ink">Blueprint Navy</p>
              <p className="text-[11px] font-mono text-ink-subtle">#1E3A8A</p>
            </div>

            <div className="bg-paper-subtle p-3 rounded-lg border border-paper-border shadow-paper-sm">
              <div className="h-9 w-full rounded bg-accent-ok mb-2" />
              <p className="text-xs font-semibold text-ink">Deep Pine</p>
              <p className="text-[11px] font-mono text-ink-subtle">#1D5C42</p>
            </div>

            <div className="bg-paper-subtle p-3 rounded-lg border border-paper-border shadow-paper-sm">
              <div className="h-9 w-full rounded bg-accent-break mb-2" />
              <p className="text-xs font-semibold text-ink">Cinnabar Red</p>
              <p className="text-[11px] font-mono text-ink-subtle">#A82D24</p>
            </div>

            <div className="bg-paper-subtle p-3 rounded-lg border border-paper-border shadow-paper-sm">
              <div className="h-9 w-full rounded bg-accent-signal mb-2" />
              <p className="text-xs font-semibold text-ink">Amber Ochre</p>
              <p className="text-[11px] font-mono text-ink-subtle">#C06A1B</p>
            </div>
          </div>
        </section>

        {/* Section 2: Vellum Notebook Grid (Item 11) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle font-mono">
              02 / Vellum Notebook Grid (16px & 8px Step)
            </h2>
            <span className="text-xs text-ink-subtle font-mono">
              Harmonized grid-line: rgba(29, 32, 35, 0.06)
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Flat Paper Card */}
            <Card
              elevation="flat"
              grid="none"
              title="Cotton Surface"
              subtitle="Smooth document layout on #FAF7F2"
              headerAction={
                <Badge variant="neutral" size="sm" mono>
                  grid: none
                </Badge>
              }
            >
              <p className="text-xs text-ink-muted leading-relaxed">
                Warm ivory surface for theory and descriptive texts. Soft
                contrast with #1A1D20 Carbon Ink ensures zero eye strain during
                long study sessions.
              </p>
              <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between text-xs font-mono text-ink-subtle">
                <span>Surface: #FAF7F2</span>
                <span>Base: #F4F0E8</span>
              </div>
            </Card>

            {/* 16px Notebook Grid Card */}
            <Card
              elevation="paper"
              grid="default"
              title="Architecture Vellum"
              subtitle="16px grid for Architecture & Code panels"
              headerAction={
                <Badge variant="accent" size="sm" mono>
                  16px × 16px
                </Badge>
              }
            >
              <div className="space-y-3">
                <p className="text-xs text-ink-muted leading-relaxed">
                  Subtle graphite grid creating an authentic engineering notepad
                  feel without plastic glare or noise.
                </p>
                <div className="p-2.5 bg-paper/85 rounded border border-paper-border text-xs font-mono text-ink">
                  <span className="text-accent-blue font-semibold">
                    interface
                  </span>{" "}
                  IRemoteCommand {"{"} ... {"}"}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between text-xs font-mono text-ink-subtle">
                <span>Color: rgba(29, 32, 35, 0.06)</span>
                <span>Step: 16px</span>
              </div>
            </Card>

            {/* 8px Dense Grid Card */}
            <Card
              elevation="elevated"
              grid="dense"
              title="Dense Circuit Board"
              subtitle="8px grid for Hardware diagnostics"
              headerAction={
                <Badge variant="signal" size="sm" mono>
                  8px × 8px
                </Badge>
              }
            >
              <div className="space-y-3">
                <p className="text-xs text-ink-muted leading-relaxed">
                  Precision graph matrix for test points, oscilloscope traces,
                  and multimeter probe readings.
                </p>
                <div className="flex items-center justify-between p-2 bg-paper/85 rounded border border-paper-border text-xs font-mono">
                  <span className="text-ink-muted">TP1 (VCC Pin 7):</span>
                  <span className="text-accent-ok font-semibold">5.02 V</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between text-xs font-mono text-ink-subtle">
                <span>Grid: Dense 8px</span>
                <span>Stamp: Deep Pine</span>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 3: Interactive Buttons (Tactile Feedback) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle font-mono">
              03 / Interactive Buttons (Tactile Press: active:scale-98)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted font-mono">
                Click Counter:
              </span>
              <Badge variant="accent" size="sm" mono>
                {buttonClicks}
              </Badge>
            </div>
          </div>

          <Card elevation="paper" padding="lg">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => setButtonClicks((c) => c + 1)}
                >
                  Primary (Blueprint Navy)
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setButtonClicks((c) => c + 1)}
                >
                  Secondary (Cotton Paper)
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setButtonClicks((c) => c + 1)}
                >
                  Ghost Toolbar
                </Button>

                <Button
                  variant="danger"
                  onClick={() => setButtonClicks((c) => c + 1)}
                >
                  Danger (Cinnabar Red)
                </Button>

                <Button
                  variant="secondary"
                  isLoading={isLoadingDemo}
                  onClick={toggleLoading}
                >
                  {isLoadingDemo ? "Simulating..." : "Test Loading"}
                </Button>
              </div>

              <div className="pt-4 border-t border-paper-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-ink-subtle">
                    Sizes:
                  </span>
                  <Button variant="secondary" size="sm">
                    Small
                  </Button>
                  <Button variant="secondary" size="md">
                    Medium
                  </Button>
                  <Button variant="secondary" size="lg">
                    Large
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-ink-subtle">
                    Disabled:
                  </span>
                  <Button variant="primary" disabled size="sm">
                    Inactive
                  </Button>
                  <Button variant="secondary" disabled size="sm">
                    Inactive
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 4: Archive Stamp Semantics & Technical Terms */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle font-mono">
              04 / Archive Stamp Semantics (Deep Pine, Cinnabar, Amber)
            </h2>
            <span className="text-xs text-ink-subtle font-mono">
              Technical Terms in JetBrains Mono
            </span>
          </div>

          <Card elevation="paper" padding="md">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-ink-muted mb-2">
                  Physical Circuit State Stamps:
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="ok" dot size="md">
                    PSU Stable (5.0V Deep Pine)
                  </Badge>
                  <Badge variant="signal" dot pulse size="md">
                    IR Carrier (38 kHz Amber Ochre)
                  </Badge>
                  <Badge variant="broken" dot size="md">
                    MCU → Display Break (Cinnabar)
                  </Badge>
                  <Badge variant="neutral" dot size="md">
                    EEPROM Standby
                  </Badge>
                  <Badge variant="accent" dot size="md">
                    Audio Amp (Blueprint Navy)
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-paper-border">
                <p className="text-xs font-medium text-ink-muted mb-2">
                  Untranslated Technical Terms (Rule 6 • JetBrains Mono):
                </p>
                <div className="flex flex-wrap gap-2">
                  {TECHNICAL_TERMS.map((term) => (
                    <Badge key={term} variant="neutral" mono size="sm">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 5: Gauge & Progress */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle font-mono">
              05 / Instrument Gauge & Meter
            </h2>
            <div className="flex items-center gap-1.5">
              {(["accent", "ok", "signal", "break"] as ProgressBarVariant[]).map(
                (v) => (
                  <button
                    key={v}
                    onClick={() => setProgressVariant(v)}
                    className={`px-2 py-0.5 text-[10px] rounded font-mono uppercase cursor-pointer transition-colors ${
                      progressVariant === v
                        ? "bg-ink text-paper font-bold"
                        : "bg-paper-muted text-ink-muted hover:bg-slate-300/60"
                    }`}
                  >
                    {v}
                  </button>
                )
              )}
            </div>
          </div>

          <Card elevation="paper" padding="lg">
            <div className="space-y-6">
              <ProgressBar
                value={progressValue}
                variant={progressVariant}
                size="md"
                showLabel
                label={`Calibration Meter: ${progressValue}% calibrated`}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <span className="text-[11px] font-mono text-ink-subtle block mb-1">
                    Pine Trace (sm)
                  </span>
                  <ProgressBar value={40} variant="ok" size="sm" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-ink-subtle block mb-1">
                    Ochre Signal (md)
                  </span>
                  <ProgressBar value={75} variant="signal" size="md" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-ink-subtle block mb-1">
                    Navy Bus (lg)
                  </span>
                  <ProgressBar value={100} variant="accent" size="lg" />
                </div>
              </div>

              <div className="pt-4 border-t border-paper-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setProgressValue((v) => Math.max(0, v - 10))
                    }
                  >
                    -10%
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setProgressValue((v) => Math.min(100, v + 10))
                    }
                  >
                    +10%
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProgressValue(50)}
                  >
                    Reset (50%)
                  </Button>
                </div>

                <span className="text-xs font-mono text-ink-subtle">
                  Value: {progressValue} / 100
                </span>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-paper-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-subtle font-mono">
          <span>Interactive Workbench • Japanese Stationery & Pantone</span>
          <span>Next: Block C / Phase 1 Mockups</span>
        </footer>
      </div>
    </div>
  );
};
