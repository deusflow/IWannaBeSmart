/**
 * @file apps/web/src/components/ui/ErrorBoundary.tsx
 * @description Production React Error Boundary with engineering fault diagnostics & recovery actions
 */

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RotateCcw, Home, Trash2, ChevronDown, ShieldCheck } from "lucide-react";
import { i18n } from "@iw/i18n";
import { audioFx } from "../../utils/audioFx";
import { useWorkbenchStore } from "../../store/workbenchStore";
import {
  saveCrashSnapshot,
  clearSafeTransientCaches,
  getGlobalSession,
} from "../../utils/checkpointManager";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[Hardware Fault] Uncaught React exception in simulation workbench:", error, errorInfo);
    try {
      const state = useWorkbenchStore.getState();
      saveCrashSnapshot(error, {
        stationId: state.currentStationId,
        currentView: state.currentView,
      });
    } catch {
      // Safe fallback
    }
    this.setState({ errorInfo });
  }

  private handleTryAgain = (): void => {
    audioFx.playRelayClick();
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleRestoreSavedState = (): void => {
    audioFx.playSuccessFanfare();
    try {
      const session = getGlobalSession();
      if (session) {
        useWorkbenchStore.getState().setCurrentStationId(session.currentStationId);
        useWorkbenchStore.getState().setCurrentView(session.currentView);
      }
    } catch {
      // Safe fallback
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReturnToHub = (): void => {
    audioFx.playRelayClick();
    try {
      useWorkbenchStore.getState().setCurrentView("HUB");
    } catch {
      // Safe fallback if store is corrupted
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleHardReset = (): void => {
    const confirmMsg = i18n.t(
      "errorBoundary.resetConfirm",
      "Очистити тимчасовий кеш інтерфейсу? Ваш основний прогрес (XP, зірки, виконані завдання) буде збережено."
    );
    if (typeof window !== "undefined" && window.confirm(confirmMsg)) {
      audioFx.playRelayClick();
      clearSafeTransientCaches();
      window.location.reload();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const title = i18n.t("errorBoundary.title", "Аварійний стан стенда");
      const subtitle = i18n.t(
        "errorBoundary.subtitle",
        "Виникла непередбачена помилка виконання в симуляторі"
      );
      const tryAgainText = i18n.t("errorBoundary.tryAgain", "Спробувати знову");
      const returnToHubText = i18n.t("errorBoundary.returnToHub", "Повернутися до Хабу");
      const resetCacheText = i18n.t(
        "errorBoundary.resetCache",
        "Скинути кеш стану та перезапустити"
      );
      const errorDetailsText = i18n.t("errorBoundary.errorDetails", "Технічна телеметрія помилки");

      return (
        <div
          role="alert"
          className="min-h-screen w-full bg-[#F8F9FA] text-[#0F141C] flex items-center justify-center p-4 sm:p-6"
        >
          <div className="relative w-full max-w-2xl bg-white border border-rose-500/30 rounded-2xl shadow-luxury p-6 sm:p-8 overflow-hidden space-y-6">
            {/* Ambient Danger Glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Badge & Title */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-mono text-xs font-bold tracking-wider uppercase">
                <AlertTriangle size={14} className="shrink-0" />
                <span>SYSTEM FAULT • TELEMETRY INTERRUPT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#0F141C] tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-[#525866] leading-relaxed font-sans">
                {subtitle}
              </p>
            </div>

            {/* Error Message Box */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 font-mono text-xs text-rose-800 space-y-1">
              <div className="font-bold text-rose-900">
                {this.state.error?.name || "Error"}: {this.state.error?.message || "Unknown error"}
              </div>
            </div>

            {/* Technical Stack Details (Collapsible) */}
            {this.state.errorInfo?.componentStack && (
              <details className="group p-3 rounded-xl bg-[#252932] border border-[#323846] text-xs font-mono text-[#F8F9FA]">
                <summary className="cursor-pointer text-slate-300 hover:text-white flex items-center justify-between select-none">
                  <span>{errorDetailsText}</span>
                  <ChevronDown
                    size={14}
                    className="transition-transform group-open:rotate-180 text-slate-400"
                  />
                </summary>
                <pre className="mt-3 p-3 rounded-lg bg-[#1A1D24] text-[11px] text-slate-200 overflow-x-auto max-h-56 leading-relaxed whitespace-pre-wrap">
                  {this.state.error?.stack}
                  {"\n\nComponent Stack:"}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Progress Safety Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="leading-relaxed">
                <strong className="block text-emerald-950 font-bold">
                  {i18n.t("errorBoundary.progressSafeTitle", "Ваш навчальний прогрес у повній безпеці!")}
                </strong>
                <span>
                  {i18n.t(
                    "errorBoundary.progressSafeDesc",
                    "Усі зароблені XP, зірки майстерності та сейви завдань зафіксовані в локальній пам'яті. Нічого не втрачено."
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-[#E4E7EC] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={this.handleRestoreSavedState}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <ShieldCheck size={14} />
                  <span>{i18n.t("errorBoundary.restoreSaved", "Відновити з останнього сейву")}</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleTryAgain}
                  className="px-4 py-2 rounded-xl bg-accent-blue hover:bg-blue-600 text-white font-mono font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>{tryAgainText}</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleReturnToHub}
                  className="px-4 py-2 rounded-xl bg-[#F8F9FA] hover:bg-[#F1F3F5] text-[#0F141C] font-mono font-bold text-xs flex items-center gap-2 border border-[#E4E7EC] transition-colors cursor-pointer"
                >
                  <Home size={14} />
                  <span>{returnToHubText}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={this.handleHardReset}
                className="px-3 py-2 rounded-xl text-xs font-mono font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                title="Очистити тимчасовий кеш інтерфейсу"
              >
                <Trash2 size={13} />
                <span>{resetCacheText}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
