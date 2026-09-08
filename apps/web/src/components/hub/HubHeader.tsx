import React from "react";
import { Badge, Button } from "@iw/ui";
import { Sparkles, User, Globe, Wrench } from "lucide-react";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@iw/i18n";

interface HubHeaderProps {
  currentLocale: SupportedLocale;
  onLocaleChange: (locale: SupportedLocale) => void;
  xp?: number;
  onAuthClick?: () => void;
}

export const HubHeader: React.FC<HubHeaderProps> = ({
  currentLocale,
  onLocaleChange,
  xp = 0,
  onAuthClick,
}) => {
  return (
    <header className="border-b border-paper-border/80 bg-paper-subtle/80 backdrop-blur-xs sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Version */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-accent-blue-light border border-accent-blue-border flex items-center justify-center text-accent-blue shadow-paper-sm">
            <Wrench size={18} strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-ink">
                Interactive Workbench
              </span>
              <Badge variant="neutral" size="sm" mono className="text-[10px]">
                v0.1-alpha
              </Badge>
            </div>
            <p className="text-[11px] text-ink-muted hidden sm:block">
              Physical Metaphors & Systems Architecture
            </p>
          </div>
        </div>

        {/* Right side: Language + Guest Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Switcher */}
          <div className="flex items-center bg-paper rounded-md border border-paper-border p-0.5 text-xs font-mono select-none">
            <Globe size={13} strokeWidth={1.75} className="ml-1.5 mr-1 text-ink-subtle" />
            {SUPPORTED_LOCALES.map((locale) => {
              const isActive = locale === currentLocale;
              return (
                <button
                  key={locale}
                  onClick={() => onLocaleChange(locale)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase transition-all duration-150 cursor-pointer outline-none ${
                    isActive
                      ? "bg-paper-subtle text-accent-blue font-bold shadow-paper-sm border border-paper-border/60"
                      : "text-ink-muted hover:text-ink hover:bg-paper-subtle/60"
                  }`}
                  aria-label={`Switch language to ${locale}`}
                >
                  {locale}
                </button>
              );
            })}
          </div>

          {/* XP Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-paper border border-paper-border text-xs font-mono text-ink">
            <Sparkles size={13} strokeWidth={1.75} className="text-accent-signal" />
            <span className="font-semibold text-accent-signal">{xp}</span>
            <span className="text-ink-subtle text-[11px]">XP</span>
          </div>

          {/* Guest Profile Bar */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-paper-border/80">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-medium text-ink flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-ok" />
                Guest Mode
              </span>
              <span className="text-[10px] text-ink-subtle font-mono">
                Local progress
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={onAuthClick}
              leftIcon={<User size={13} strokeWidth={1.75} />}
              className="text-xs"
            >
              Login / Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
