import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  badge?: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "line" | "segmented";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "line",
  className = "",
}) => {
  if (variant === "segmented") {
    return (
      <div
        role="tablist"
        className={`inline-flex p-1 bg-paper-muted rounded-lg border border-paper-border select-none ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer outline-none ${
                isActive
                  ? "bg-paper-subtle text-ink shadow-paper-sm font-semibold border border-paper-border/70"
                  : "text-ink-muted hover:text-ink hover:bg-paper-subtle/50"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-accent-blue-light text-accent-blue"
                      : "bg-paper text-ink-muted border border-paper-border/50"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={`flex border-b border-paper-border gap-6 select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`pb-2.5 text-sm font-medium transition-all duration-150 flex items-center gap-2 relative cursor-pointer outline-none ${
              isActive
                ? "text-accent-blue font-semibold"
                : "text-ink-muted hover:text-ink"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                  isActive
                    ? "bg-accent-blue-light text-accent-blue"
                    : "bg-slate-100 text-ink-subtle"
                }`}
              >
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-accent-signal border border-amber-200 font-mono">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue rounded-full transition-all" />
            )}
          </button>
        );
      })}
    </div>
  );
};
