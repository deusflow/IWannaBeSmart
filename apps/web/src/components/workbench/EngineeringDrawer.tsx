import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { StationLevel } from "@iw/sim-engine";
import { Badge, Tabs, type TabItem } from "@iw/ui";
import { SyntaxCodeBlock } from "./SyntaxCodeBlock";
import { CircuitCanvas } from "./circuit/CircuitCanvas";
import {
  X,
  Code2,
  GitBranch,
  Terminal,
  Pin,
  PinOff,
  Minimize2,
  ExternalLink,
  Maximize2,
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
  const [codeLang, setCodeLang] = useState<"csharp" | "go">("csharp");

  const drawerTabs: TabItem[] = React.useMemo(
    () => [
      { id: "code", label: t("workbench.drawerTabs.code", "Код (C# / Go)") },
      { id: "hardware", label: t("workbench.drawerTabs.hardware", "Апаратні вузли") },
      { id: "architecture", label: t("workbench.drawerTabs.architecture", "Архітектура") },
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
      className={`bg-paper-subtle rounded-3xl border-2 border-paper-border shadow-paper-lg flex flex-col overflow-hidden transition-all duration-300 ${
        inline
          ? "w-full h-full relative"
          : "fixed z-40 top-16 bottom-4 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[600px] lg:w-[700px] xl:w-[760px] animate-in slide-in-from-top-6"
      } ${isPinned ? "ring-2 ring-accent-blue/30" : ""}`}
    >
      {/* Drawer Header with Pin & Close Controls */}
      <div className="p-4 sm:p-5 border-b border-paper-border/80 bg-paper-subtle flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm" className="font-display text-[10px]">
              {t("drawer.levelBadge", { number: level.levelNumber, defaultValue: `Рівень ${level.levelNumber}` })}
            </Badge>
            <span className="text-xs font-display text-ink-muted truncate">
              {t("workbench.stationTitle", { defaultValue: level.stationTitle })}
            </span>
            {isPinned && (
              <span className="text-[10px] font-display px-2 py-0.5 rounded-md bg-accent-blue-light text-accent-blue border border-accent-blue-border">
                {t("drawer.pinned", "Закріплено")}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink font-display truncate">
            {t("level.level1Title", { defaultValue: level.title })}
          </h2>
          <p className="text-xs text-ink-muted leading-relaxed font-sans line-clamp-2">
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
                ? "bg-accent-blue-light text-accent-blue border-accent-blue-border shadow-xs"
                : "bg-paper text-ink-muted hover:text-ink border-paper-border hover:bg-paper-muted"
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
            className="p-1.5 rounded-lg bg-paper hover:bg-paper-muted text-ink-muted hover:text-ink transition-colors cursor-pointer border border-paper-border"
          >
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-5 pt-3 bg-paper-subtle border-b border-paper-border">
        <Tabs
          tabs={drawerTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="line"
        />
      </div>

      {/* Content Area with Vellum Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-notebook-grid space-y-4">
        {/* Objective Callout */}
        <div className="p-3.5 rounded-2xl bg-paper border border-paper-border shadow-paper-sm text-xs space-y-1.5">
          <span className="font-display font-bold text-accent-blue flex items-center gap-1.5 text-xs">
            <Terminal size={13} strokeWidth={2} />
            {t("drawer.objectiveTitle", "Інженерне завдання:")}
          </span>
          <p className="text-ink leading-relaxed font-sans">
            {t("level.level1Objective", { defaultValue: level.objective })}
          </p>
        </div>

        {/* TAB 1: CODE (C# & Go) */}
        {activeTab === "code" && (
          <div className="space-y-3.5">
            {/* Language Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-paper p-1 rounded-xl border border-paper-border">
                <button
                  onClick={() => setCodeLang("csharp")}
                  className={`px-3 py-1.5 text-xs font-display font-bold rounded-lg transition-all cursor-pointer ${
                    codeLang === "csharp"
                      ? "bg-paper-subtle text-accent-blue shadow-paper-sm border border-paper-border/60"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  C# (.NET)
                </button>
                <button
                  onClick={() => setCodeLang("go")}
                  className={`px-3 py-1.5 text-xs font-display font-bold rounded-lg transition-all cursor-pointer ${
                    codeLang === "go"
                      ? "bg-paper-subtle text-accent-blue shadow-paper-sm border border-paper-border/60"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Go (Інтерфейси)
                </button>
              </div>

              <Badge variant="neutral" size="sm" className="font-display text-[10px]">
                {t("drawer.syntaxVerified", "Синтаксис перевірено")}
              </Badge>
            </div>

            {/* Syntax Highlighted Code Box */}
            <SyntaxCodeBlock
              code={
                codeLang === "csharp"
                  ? level.codeSnippet.csharp
                  : level.codeSnippet.go
              }
              language={codeLang}
            />

            {/* Architecture Explanation */}
            <div className="p-4 rounded-2xl bg-paper-subtle border border-paper-border space-y-1.5">
              <span className="text-xs font-display font-bold text-ink flex items-center gap-1.5">
                <Code2 size={14} strokeWidth={2} className="text-accent-blue" />
                {t("drawer.signalArchitectureLink", "Зв'язок фізичного сигналу з архітектурою програми")}
              </span>
              <p className="text-xs text-ink-muted leading-relaxed font-sans">
                {t("level.level1Explanation", { defaultValue: level.codeSnippet.explanation })}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: HARDWARE CIRCUIT SCHEMATIC (Block G, Items 59-64) */}
        {activeTab === "hardware" && (
          <div className="w-full">
            <CircuitCanvas />
          </div>
        )}

        {/* TAB 3: ARCHITECTURE */}
        {activeTab === "architecture" && (
          <div className="space-y-4">
            {/* Fullscreen Studio Launcher Hero Card */}
            <div className="p-4 rounded-2xl bg-paper border border-accent-blue/40 shadow-paper-sm space-y-3">
              <div className="flex items-center gap-2 text-ink font-display text-sm font-bold">
                <div className="h-7 w-7 rounded-lg bg-accent-blue-light text-accent-blue flex items-center justify-center">
                  <Maximize2 size={16} strokeWidth={2} />
                </div>
                <span>Architecture Studio</span>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed font-sans">
                {t("architecture.fullscreenCardDesc")}
              </p>

              <button
                onClick={() => {
                  onClose();
                  onOpenArchitectureStudio?.();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-white font-balsamiq font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Maximize2 size={14} />
                <span>{t("architecture.openFullscreen")}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-paper-subtle border border-paper-border space-y-2.5">
              <div className="flex items-center gap-2 text-ink font-display text-sm font-bold">
                <GitBranch size={15} strokeWidth={2} className="text-accent-blue" />
                <span>{t("drawer.iocTitle", "Інверсія керування (IoC & DI контракт)")}</span>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed font-sans">
                {t(
                  "drawer.iocDescription",
                  "Телевізійний приймач не створює команди вручну. Він приймає абстракції, що реалізують контракт IRemoteCommand. Метод Execute передається у вхідний порт контролера телевізора через Dependency Injection."
                )}
              </p>

              <div className="p-3 bg-paper rounded-xl border border-paper-border font-sans text-xs text-ink-muted space-y-2">
                <div className="flex items-center justify-between text-xs text-ink">
                  <span>{t("drawer.commandContractLabel", "Контракт команди")}</span>
                  <span className="text-accent-ok font-bold">✓ IRemoteCommand</span>
                </div>
                <div className="flex items-center justify-between text-xs text-ink">
                  <span>{t("drawer.commandRegistryLabel", "Реєстр команд")}</span>
                  <span className="text-accent-blue font-bold">
                    {t("drawer.diInjectionLabel", "✓ Впровадження через DI")}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Glossary */}
            <div className="p-4 rounded-xl bg-paper-subtle border border-paper-border space-y-2">
              <span className="text-xs font-display font-bold text-ink-muted">
                {t("drawer.keyTermsTitle", "Ключові терміни (Без перекладу)")}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {level.untranslatedTerms.map((term) => (
                  <span
                    key={term}
                    className="px-2 py-0.5 rounded bg-paper text-ink font-sans text-xs font-medium border border-paper-border"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="px-5 py-3 border-t border-paper-border bg-paper-subtle flex items-center justify-between text-xs font-display text-ink-muted">
        <span className="flex items-center gap-1.5">
          <Minimize2 size={12} strokeWidth={1.75} />
          <span>
            {isPinned
              ? t("drawer.footerPinned", "Закріплено на верстаку")
              : t("drawer.footerEsc", "Esc або закрити")}
          </span>
        </span>
        <span className="flex items-center gap-1 text-accent-blue font-bold">
          <span>{t("drawer.footerActive", "Телевізор • Схема активна")}</span>
          <ExternalLink size={12} strokeWidth={1.75} />
        </span>
      </div>
    </aside>
  );

  return content;
};
