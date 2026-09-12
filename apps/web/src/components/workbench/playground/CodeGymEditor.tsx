/**
 * @file apps/web/src/components/workbench/playground/CodeGymEditor.tsx
 * @description Unified Code Gym CodeMirror Editor with ghost text overlay, sprint timer, diagnostics & actions.
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { cpp } from "@codemirror/lang-cpp";
import { go } from "@codemirror/lang-go";
import {
  Play,
  RotateCcw,
  ArrowRight,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Wrench,
} from "lucide-react";
import { PreciseErrorPointer } from "./PreciseErrorPointer";
import type { CodeGymTaskLike } from "./useCodeGymSession";

interface CodeGymEditorProps<TTask extends CodeGymTaskLike> {
  currentTask: TTask;
  codeLang: "csharp" | "go";
  onChangeLang: (lang: "csharp" | "go") => void;
  activeRound: 1 | 2 | 3 | 4;
  fileName: string;
  typedCode: string;
  onChangeCode: (code: string) => void;
  targetCode: string;
  clozeTemplate: string;
  roundCompleted: boolean;
  hasError: boolean;
  feedback: string | null;
  timeLeft: number;
  isTimerRunning: boolean;
  roundStats: { wpm: number; accuracy: number } | null;
  traceCharsMatched: number;
  gutterWidth: number;
  editorContainerRef: any;
  showTransferHint: boolean;
  onToggleTransferHint: () => void;
  onResetRound: () => void;
  onStartSprint: () => void;
  onVerify: () => void;
  onAdvanceRound: () => void;
  onNextTask?: () => void;
  nextTaskAvailable: boolean;
}

export function CodeGymEditor<TTask extends CodeGymTaskLike>({
  currentTask,
  codeLang,
  onChangeLang,
  activeRound,
  fileName,
  typedCode,
  onChangeCode,
  targetCode,
  roundCompleted,
  hasError,
  feedback,
  timeLeft,
  isTimerRunning,
  roundStats,
  traceCharsMatched,
  gutterWidth,
  editorContainerRef,
  showTransferHint,
  onToggleTransferHint,
  onResetRound,
  onStartSprint,
  onVerify,
  onAdvanceRound,
  onNextTask,
  nextTaskAvailable,
}: CodeGymEditorProps<TTask>) {
  const { t, i18n } = useTranslation();

  const extensions = useMemo(() => {
    return codeLang === "go" ? [go()] : [cpp()];
  }, [codeLang]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[#2B2D33] shadow-lg bg-[#1E1E22] flex flex-col">
      {/* ── Editor Top Bar ── */}
      <div className="px-3.5 py-2 bg-[#18191C] border-b border-[#2B2D33] flex items-center justify-between flex-wrap gap-2 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />

          {/* Language Switcher */}
          <div className="ml-2 flex items-center gap-1 bg-[#23252B] p-0.5 rounded-lg border border-[#343842]">
            <button
              type="button"
              onClick={() => onChangeLang("csharp")}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                codeLang === "csharp"
                  ? "bg-accent-blue text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              C#
            </button>
            <button
              type="button"
              onClick={() => onChangeLang("go")}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                codeLang === "go"
                  ? "bg-accent-blue text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Go
            </button>
          </div>

          <span className="text-[11px] font-mono text-gray-400 font-bold ml-1">
            {fileName}
          </span>
        </div>

        {/* Round-specific status display & stats */}
        <div className="flex items-center gap-2">
          {roundStats && roundStats.wpm > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
              ⚡ {roundStats.wpm} WPM
            </span>
          )}
          {roundStats && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
              {roundStats.accuracy}% {t("codegym.accuracy", "точність")}
            </span>
          )}

          {activeRound === 1 && (
            <span className="text-[11px] font-mono text-amber-300 font-bold">
              {t("codegym.typingLabel", "Тайпінг")}: {traceCharsMatched} / {targetCode.length} {t("codegym.charsShort", "симв.")}
            </span>
          )}

          {activeRound === 3 && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
              <Timer size={13} className={isTimerRunning ? "animate-spin" : ""} />
              <span>{timeLeft}s</span>
            </div>
          )}

          {activeRound === 4 && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
              <Sparkles size={13} />
              <span>{t("codegym.variationBadge", "Варіація")}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Round 4: Transfer Mission Prompt Banner ── */}
      {activeRound === 4 && (
        <div className="px-4 py-3 bg-[#161B22] border-b border-[#2B2D33] text-ink-light space-y-2 select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                {t("codegym.transferCardTitle", "Місія варіації (Transfer Task)")}
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                ★ {t("codegym.star4Title", "4-та зірка майстра")}
              </span>
            </div>
            {currentTask.transferVariant?.hint && (
              <button
                type="button"
                onClick={onToggleTransferHint}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer flex items-center gap-1"
              >
                <HelpCircle size={12} />
                <span>
                  {showTransferHint
                    ? t("codegym.hideHint", "Сховати підказку")
                    : t("codegym.showHint", "Підказка")}
                </span>
              </button>
            )}
          </div>
          <p className="text-xs font-mono text-gray-200 leading-relaxed font-semibold">
            {currentTask.transferVariant?.prompt[
              (i18n.language?.startsWith("da")
                ? "da"
                : i18n.language?.startsWith("en")
                ? "en"
                : "ua") as "ua" | "en" | "da"
            ] ||
              currentTask.transferVariant?.prompt.ua ||
              t(currentTask.descKey)}
          </p>
          {showTransferHint && currentTask.transferVariant?.hint && (
            <div className="p-2.5 rounded-lg bg-[#0D1117] border border-cyan-500/30 text-[11px] font-mono text-cyan-200 animate-in fade-in duration-200">
              <span className="text-cyan-400 font-bold">Hint: </span>
              {currentTask.transferVariant.hint[
                (i18n.language?.startsWith("da")
                  ? "da"
                  : i18n.language?.startsWith("en")
                  ? "en"
                  : "ua") as "ua" | "en" | "da"
              ] || currentTask.transferVariant.hint.ua}
            </div>
          )}
        </div>
      )}

      {/* ── Reverse Debugging: Hardware Defect & Diagnostics Panel ── */}
      {currentTask.isBugfixTask && (
        <div className="px-4 py-3 bg-[#1A1215] border-b border-red-900/40 text-ink-light space-y-2 select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  roundCompleted
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                }`}
              >
                {roundCompleted ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                {roundCompleted
                  ? t("playground.repairStatusOperational", "СПРАВНИЙ")
                  : t("playground.repairStatusFault", "НЕСПРАВНИЙ")}
              </span>
              <span className="text-[11px] font-mono text-amber-300 font-bold">
                {t("playground.debugBannerTitle", "РЕЖИМ РЕМОНТУ ТА ДІАГНОСТИКИ (REVERSE DEBUGGING)")}
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              {t("playground.hotkeyTip", "Ctrl+Enter — Перевірити")}
            </span>
          </div>

          <p className="text-xs font-mono text-gray-300 leading-relaxed">
            {t("playground.defectBrief", "Знайдіть та виправте логічну помилку в коді нижче, щоб відновити роботу приладу.")}
          </p>
        </div>
      )}

      {/* ── Editor Container with Ghost Overlay ── */}
      <div ref={editorContainerRef} className="relative min-h-[160px] bg-[#1E2024]">
        {/* Ghost Stencil Overlay for Round 1 (when not bugfix) */}
        {activeRound === 1 && !currentTask.isBugfixTask && (
          <div
            className="absolute inset-0 pointer-events-none select-none font-mono text-[13px] leading-[19px] p-4 text-gray-500/30 whitespace-pre overflow-hidden"
            style={{ paddingLeft: `${gutterWidth + 16}px` }}
          >
            {targetCode}
          </div>
        )}

        <CodeMirror
          value={typedCode}
          theme={oneDark}
          extensions={extensions}
          onChange={onChangeCode}
          height="auto"
          minHeight="160px"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLineGutter: false,
            autocompletion: false,
            highlightActiveLine: false,
          }}
          className="text-[13px] font-mono leading-relaxed"
        />
      </div>

      {/* ── Precise Error Pointer ── */}
      {hasError && (
        <PreciseErrorPointer
          userInput={typedCode}
          targetCode={targetCode}
          hasError={hasError}
        />
      )}

      {/* ── Feedback Banner ── */}
      {feedback && (
        <div
          className={`p-3 border-t text-xs font-mono flex items-start gap-2 select-none ${
            roundCompleted
              ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
              : hasError
              ? "bg-red-950/40 border-red-800/60 text-red-300"
              : "bg-amber-950/40 border-amber-800/60 text-amber-300"
          }`}
        >
          {roundCompleted ? (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          ) : hasError ? (
            <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
          ) : (
            <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-semibold">{feedback}</div>
        </div>
      )}

      {/* ── Action Buttons Footer ── */}
      <div className="p-3 bg-[#18191C] border-t border-[#2B2D33] flex items-center justify-between select-none">
        <button
          type="button"
          onClick={onResetRound}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800/60 hover:bg-gray-800 text-gray-300 font-mono text-xs cursor-pointer transition-colors"
          title={t("codegym.resetPrompt", "Скинути введений код (Esc)")}
        >
          <RotateCcw size={13} />
          <span>{t("codegym.resetBtn", "Скинути (Esc)")}</span>
        </button>

        <div className="flex items-center gap-2">
          {roundCompleted ? (
            <>
              {activeRound < 4 ? (
                <button
                  type="button"
                  onClick={onAdvanceRound}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer animate-pulse"
                >
                  <span>
                    {activeRound === 1
                      ? t("codegym.nextRound2", "Раунд 2: Прогалини →")
                      : activeRound === 2
                      ? t("codegym.nextRound3", "Раунд 3: Спринт →")
                      : t("codegym.nextRound4", "Раунд 4: Варіація →")}
                  </span>
                  <ArrowRight size={14} />
                </button>
              ) : nextTaskAvailable && onNextTask ? (
                <button
                  type="button"
                  onClick={onNextTask}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-mono font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>{t("codegym.nextTaskBtn", "Наступне завдання →")}</span>
                  <ArrowRight size={14} />
                </button>
              ) : null}
            </>
          ) : (
            <>
              {currentTask.isBugfixTask && activeRound === 1 ? (
                <button
                  type="button"
                  onClick={onVerify}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Wrench size={14} />
                  <span>{t("playground.runVerificationBtn", "Виправити дефект (Ctrl+Enter)")}</span>
                </button>
              ) : activeRound === 2 ? (
                <button
                  type="button"
                  onClick={onVerify}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent-blue hover:bg-accent-blue/80 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Play size={13} className="fill-white" />
                  <span>{t("codegym.verifyClozeBtn", "Перевірити прогалини (Ctrl+Enter)")}</span>
                </button>
              ) : activeRound === 3 ? (
                !isTimerRunning ? (
                  <button
                    type="button"
                    onClick={onStartSprint}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-mono font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Timer size={14} />
                    <span>{t("codegym.startSprintBtn", "Старт спринту")}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onVerify}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-mono font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Play size={13} className="fill-stone-900" />
                    <span>{t("codegym.finishSprintBtn", "Фініш спринту (Ctrl+Enter)")}</span>
                  </button>
                )
              ) : activeRound === 4 ? (
                <button
                  type="button"
                  onClick={onVerify}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-stone-900 font-mono font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>{t("codegym.verifyVariationBtn", "Перевірити варіацію (Ctrl+Enter)")}</span>
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
