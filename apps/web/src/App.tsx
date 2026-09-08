import React from "react";
import { UI_PACKAGE_NAME, UI_PACKAGE_VERSION } from "@iw/ui";
import {
  initI18n,
  SUPPORTED_LOCALES,
  TECHNICAL_TERMS,
  I18N_PACKAGE_VERSION,
} from "@iw/i18n";
import { SIM_ENGINE_NAME, SIM_ENGINE_VERSION } from "@iw/sim-engine";
import { isSupabaseConfigured } from "./lib/supabase";

// Initialize i18n stub
initI18n();

export const App: React.FC = () => {
  const isBackendReady = isSupabaseConfigured();

  const packagesInfo = [
    {
      name: UI_PACKAGE_NAME,
      version: UI_PACKAGE_VERSION,
      role: "UI Component Library (Stub)",
      status: "Resolved",
    },
    {
      name: "@iw/i18n",
      version: I18N_PACKAGE_VERSION,
      role: `Localization Framework (${SUPPORTED_LOCALES.join(", ")})`,
      status: "Resolved",
    },
    {
      name: SIM_ENGINE_NAME,
      version: SIM_ENGINE_VERSION,
      role: "Physical Simulation Engine (Stub)",
      status: "Resolved",
    },
  ];

  return (
    <main className="min-h-screen bg-paper text-ink p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-6">
        <header className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink">
                Interactive Workbench
              </h1>
              <p className="text-sm text-ink-muted mt-1">
                Monorepo Foundation — Block A (Items 3, 4, 5)
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-accent-ok border border-emerald-200">
              Ready
            </span>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-ink-subtle uppercase tracking-wider">
            Workspace Packages Resolution
          </h2>
          <div className="grid gap-2">
            {packagesInfo.map((pkg) => (
              <div
                key={pkg.name}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50"
              >
                <div>
                  <span className="font-mono text-sm font-semibold text-accent-blue">
                    {pkg.name}
                  </span>
                  <span className="text-xs text-ink-subtle ml-2">
                    v{pkg.version}
                  </span>
                  <p className="text-xs text-ink-muted">{pkg.role}</p>
                </div>
                <span className="text-xs font-mono font-medium text-accent-ok">
                  {pkg.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-ink-subtle uppercase tracking-wider">
            Backend Configuration (Supabase Stub)
          </h2>
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">
                Client Stub Status:{" "}
                <span className="font-mono text-xs">
                  {isBackendReady ? "Configured (Custom)" : "Mock / Local Dev"}
                </span>
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                Targeting environment variables:{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">
                  VITE_SUPABASE_URL
                </code>
                ,{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">
                  VITE_SUPABASE_ANON_KEY
                </code>
              </p>
            </div>
            <span
              className={`text-xs font-mono font-medium ${
                isBackendReady ? "text-accent-ok" : "text-accent-signal"
              }`}
            >
              {isBackendReady ? "Active" : "Stubbed"}
            </span>
          </div>
        </section>

        <section className="space-y-2 pt-2 border-t border-slate-100">
          <h2 className="text-xs font-semibold text-ink-subtle uppercase tracking-wider">
            Untranslated Technical Terms Checklist (Rule 6)
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {TECHNICAL_TERMS.slice(0, 5).map((term) => (
              <span
                key={term}
                className="px-2 py-0.5 text-xs bg-slate-100 text-ink-muted rounded font-mono"
              >
                {term}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};
