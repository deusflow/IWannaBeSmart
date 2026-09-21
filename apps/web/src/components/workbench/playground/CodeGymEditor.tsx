/**
 * @file apps/web/src/components/workbench/playground/CodeGymEditor.tsx
 * @description Unified Code Gym CodeMirror Editor with ghost text overlay, sprint timer, diagnostics & actions.
 */

import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
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
  BookOpen,
  HelpCircle,
  Wrench,
  Copy,
  Lightbulb,
} from "lucide-react";
import { PreciseErrorPointer } from "./PreciseErrorPointer";
import type { CodeGymTaskLike } from "./useCodeGymSession";
import { audioFx } from "../../../utils/audioFx";
import { toast } from "../../../store/toastStore";

interface CodeGymEditorProps<
  TTask extends CodeGymTaskLike,
  TLang extends string = "csharp" | "go"
> {
  currentTask: TTask;
  codeLang: TLang;
  onChangeLang: (lang: TLang) => void;
  availableLangs?: { id: TLang; label: string }[];
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
  editorContainerRef: React.RefObject<HTMLDivElement>;
  showTransferHint: boolean;
  onToggleTransferHint: () => void;
  onResetRound: () => void;
  onStartSprint: () => void;
  onVerify: () => void;
  onAdvanceRound: () => void;
  onNextTask?: () => void;
  nextTaskAvailable: boolean;
  isTheoryUnlocked?: boolean;
  onOpenTheory?: () => void;
  onUnlockPractice?: () => void;
}

export function CodeGymEditor<
  TTask extends CodeGymTaskLike,
  TLang extends string = "csharp" | "go"
>({
  currentTask,
  codeLang,
  onChangeLang,
  availableLangs,
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
  isTheoryUnlocked = true,
  onOpenTheory,
  onUnlockPractice,
}: CodeGymEditorProps<TTask, TLang>) {
  const { t, i18n } = useTranslation();

  const handleCopyCode = () => {
    const codeToCopy = typedCode || targetCode;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(codeToCopy).then(() => {
        audioFx.playKeyClick();
        toast.success(
          t("common.copied", "Скопійовано!"),
          `${codeToCopy.length} ${t("codegym.charsShort", "симв.")}`
        );
      });
    }
  };

  // Flow State Keyboard Navigation: When a round is completed, Enter or Tab automatically advances
  useEffect(() => {
    if (!roundCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing with Ctrl, Meta, or Alt modifiers
      if ((e.key === "Enter" || e.key === "Tab") && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (activeRound < 4) {
          onAdvanceRound();
        } else if (nextTaskAvailable && onNextTask) {
          onNextTask();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [roundCompleted, activeRound, nextTaskAvailable, onAdvanceRound, onNextTask]);

  const actionDescription = useMemo(() => {
    if (currentTask.isBugfixTask) {
      return t(
        "playground.defectBrief",
        "Знайдіть та виправте логічну помилку в коді нижче, щоб відновити роботу приладу."
      );
    }
    if (activeRound === 1) {
      return t(
        "codegym.round1Instruction",
        "Надрукуйте наведений нижче еталонний код у редакторі. Кожен правильний символ миттєво фіксується системою для вироблення м'язової пам'яті синтаксису."
      );
    }
    if (activeRound === 2) {
      return t(
        "codegym.round2Instruction",
        "Відновіть пропущені фрагменти коду (позначені `___`), спираючись на вивчену логіку та ключові конструкції."
      );
    }
    if (activeRound === 3) {
      return t(
        "codegym.round3Instruction",
        "Надрукуйте весь код по пам'яті без помилок до вичерпання таймера. Це закріплює впевненість та автономність розробника."
      );
    }
    const langKey = (i18n.language?.startsWith("da")
      ? "da"
      : i18n.language?.startsWith("en")
      ? "en"
      : "ua") as "ua" | "en" | "da";
    return (
      currentTask.transferVariant?.prompt[langKey] ||
      currentTask.transferVariant?.prompt.ua ||
      t(currentTask.descKey)
    );
  }, [currentTask, activeRound, i18n.language, t]);

  const eli5Hint = useMemo(() => {
    if (!hasError) return null;
    if (targetCode.toLowerCase() === typedCode.toLowerCase() && targetCode !== typedCode) {
      return t("eli5.caseSensitive");
    }
    if (targetCode.includes(";") && (!typedCode.includes(";") || (feedback && feedback.includes(";")))) {
      return t("eli5.semicolon");
    }
    if ((targetCode.includes("{") || targetCode.includes("}")) && (!typedCode.includes("{") || !typedCode.includes("}"))) {
      return t("eli5.braces");
    }
    if (targetCode.includes('"') && !typedCode.includes('"')) {
      return t("eli5.quotes");
    }
    return null;
  }, [hasError, targetCode, typedCode, feedback, t]);

  const [fontSize, setFontSize] = useState<number>(13);
  const [isWordWrap, setIsWordWrap] = useState<boolean>(true);

  const extensions = useMemo(() => {
    const langExt = codeLang === "go" ? go() : cpp();
    const exts: Extension[] = [langExt];

    if (isWordWrap) {
      exts.push(EditorView.lineWrapping);
    }

    const dynamicTheme = EditorView.theme({
      "&": {
        fontSize: `${fontSize}px !important`,
        backgroundColor: activeRound === 1 && !currentTask.isBugfixTask ? "transparent !important" : null,
      },
      ".cm-gutters": {
        backgroundColor: "#18191C !important",
        borderRight: "1px solid #2B2D33",
        fontSize: `${fontSize}px !important`,
      },
      ".cm-content": {
        caretColor: "#38bdf8",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace !important",
      },
      ".cm-line": {
        lineHeight: "1.6",
      },
    });
    exts.push(dynamicTheme);

    return exts;
  }, [codeLang, isWordWrap, fontSize, activeRound, currentTask.isBugfixTask]);

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
            {(
              availableLangs ??
              ([
                { id: "csharp", label: "C#" },
                { id: "go", label: "Go" },
              ] as unknown as { id: TLang; label: string }[])
            ).map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => onChangeLang(lang.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  codeLang === lang.id
                    ? "bg-accent-blue text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-gray-400 font-bold ml-1">
            {fileName}
          </span>

          {/* Editor QoL: Font Size & Word Wrap */}
          <div className="ml-2 flex items-center gap-1 bg-[#23252B] p-0.5 rounded-lg border border-[#343842] text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setFontSize((f) => Math.max(11, f - 1))}
              disabled={fontSize <= 11}
              className="px-1.5 py-0.5 rounded text-gray-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              title="Decrease Font Size (A-)"
            >
              A-
            </button>
            <span className="text-gray-400 font-bold px-0.5">{fontSize}px</span>
            <button
              type="button"
              onClick={() => setFontSize((f) => Math.min(18, f + 1))}
              disabled={fontSize >= 18}
              className="px-1.5 py-0.5 rounded text-gray-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              title="Increase Font Size (A+)"
            >
              A+
            </button>
            <div className="w-px h-3 bg-[#343842]" />
            <button
              type="button"
              onClick={() => setIsWordWrap((w) => !w)}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                isWordWrap ? "text-cyan-400 font-bold bg-cyan-950/50" : "text-gray-400 hover:text-white"
              }`}
              title={isWordWrap ? "Disable Line Wrap" : "Enable Line Wrap"}
            >
              Wrap
            </button>
            <div className="w-px h-3 bg-[#343842]" />
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-1.5 py-0.5 rounded text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              title={t("common.copy", "Копіювати код")}
            >
              <Copy size={11} />
              <span>Copy</span>
            </button>
          </div>
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

      {/* ── Mission Brief Card (Goal & Action) ── */}
      <div className="px-4 py-2.5 bg-[#17191E] border-b border-[#2B2D33] text-xs font-mono space-y-1 select-none">
        <div className="flex items-start gap-2">
          <span className="text-amber-400 font-bold shrink-0">
            {t("guide.missionGoalLabel", "🎯 Мета:")}
          </span>
          <span className="text-gray-200 font-medium leading-relaxed">
            {t(currentTask.descKey)}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-cyan-400 font-bold shrink-0">
            {t("guide.missionActionLabel", "✍️ Дія:")}
          </span>
          <span className="text-gray-300 leading-relaxed">
            {actionDescription}
          </span>
        </div>
      </div>

      {/* ── Round 1: TRACE Didactic Banner & Reference Card (GRR Tact 1) ── */}
      {activeRound === 1 && !currentTask.isBugfixTask && (
        <div className="px-4 py-3 bg-[#141820] border-b border-[#2B2D33] text-ink-light space-y-2.5 select-none">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                {t("codegym.round1Badge", "1. Повтори за зразком")}
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                ★ {t("codegym.star1Title", "1-ша зірка м'язової пам'яті")}
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              {t("codegym.traceHintHotkey", "Друкуйте в редакторі символ у символ")}
            </span>
          </div>
          {/* Reference Code Card */}
          <div className="rounded-xl bg-[#0F1115] border border-amber-500/30 p-2.5 shadow-inner">
            <div className="text-[10px] font-mono font-bold uppercase text-amber-400/90 mb-1 flex items-center justify-between">
              <span>{t("codegym.referenceTitle", "Еталонний зразок для набору:")}</span>
              <span className="text-gray-500 text-[9px]">
                {codeLang === "csharp" ? "C# (.NET)" : "Go (Golang)"}
              </span>
            </div>
            <pre className="text-xs font-mono text-emerald-300 font-bold whitespace-pre-wrap leading-relaxed select-text overflow-x-auto">
              <code>{targetCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ── Round 2: CLOZE Didactic Banner (GRR Tact 2) ── */}
      {activeRound === 2 && (
        <div className="px-4 py-2.5 bg-[#121824] border-b border-[#2B2D33] text-ink-light space-y-1 select-none">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                {t("codegym.round2Badge", "2. Заповни пропуски")}
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                ★ {t("codegym.star2Title", "2-га зірка розуміння")}
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              {t("codegym.clozeHintHotkey", "Ctrl+Enter — Перевірити")}
            </span>
          </div>
        </div>
      )}

      {/* ── Round 3: SPRINT Didactic Banner (GRR Tact 3) ── */}
      {activeRound === 3 && (
        <div className="px-4 py-2.5 bg-[#1C1608] border-b border-[#2B2D33] text-ink-light space-y-1 select-none">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                {t("codegym.round3Badge", "3. Напиши по пам'яті")}
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                ★ {t("codegym.star3Title", "3-тя зірка швидкості")}
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              {t("codegym.sprintHintHotkey", "Натисніть 'Старт' або почніть друкувати")}
            </span>
          </div>
        </div>
      )}

      {/* ── Round 4: Transfer Mission Prompt Banner (GRR Tact 3+) ── */}
      {activeRound === 4 && (
        <div className="px-4 py-3 bg-[#161B22] border-b border-[#2B2D33] text-ink-light space-y-2 select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                {t("codegym.round4Badge", "4. Задача із зірочкою")}
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

      {/* ── Editor Container with Ghost Overlay & Theory Gating ── */}
      <div ref={editorContainerRef} className="relative min-h-[160px] bg-[#1E2024]">
        {/* Theory Locked Overlay */}
        {!isTheoryUnlocked && (
          <div className="absolute inset-0 z-20 backdrop-blur-[3px] bg-[#14161B]/90 flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400 shadow-lg shadow-amber-500/10">
              <BookOpen size={24} className="animate-pulse" />
            </div>
            <h4 className="text-sm font-bold font-mono text-amber-300 mb-1.5">
              {t("codegym.theoryLockedTitle", "Практику заблоковано до ознайомлення з теорією")}
            </h4>
            <p className="text-xs font-mono text-gray-300 max-w-md leading-relaxed mb-4">
              {t(
                "codegym.theoryLockedDesc",
                "Подивіться зразок вчителя та життєву аналогію вгорі, щоб зрозуміти сенс команди перед набором."
              )}
            </p>
            <div className="flex items-center gap-2.5 flex-wrap justify-center">
              {onOpenTheory && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenTheory();
                    onUnlockPractice?.();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-extrabold text-xs shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <BookOpen size={14} />
                  <span>{t("codegym.openTheoryBtn", "📖 Відкрити пояснення вчителя")}</span>
                </button>
              )}
              {onUnlockPractice && (
                <button
                  type="button"
                  onClick={onUnlockPractice}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A2E35] hover:bg-[#343A43] text-gray-200 font-mono font-bold text-xs border border-gray-600 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <span>{t("codegym.skipToPractice", "Одразу до коду →")}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Ghost Stencil Overlay for Round 1 (when not bugfix) */}
        {activeRound === 1 && !currentTask.isBugfixTask && (
          <div
            className="absolute inset-0 pointer-events-none select-none font-mono text-[13px] leading-relaxed p-4 text-slate-400/50 whitespace-pre overflow-hidden z-0"
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
          editable={isTheoryUnlocked}
          height="auto"
          minHeight="160px"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLineGutter: false,
            autocompletion: false,
            highlightActiveLine: false,
          }}
          className="text-[13px] font-mono leading-relaxed relative z-10"
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
          <div className="flex-1 space-y-1">
            <div className="font-semibold">{feedback}</div>
            {hasError && eli5Hint && (
              <div className="pt-1.5 border-t border-red-800/40 text-[11px] text-red-200/90 font-sans flex items-start gap-1.5">
                <Lightbulb size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 mr-1">
                    {t("eli5.tipTitle", "Простими словами (ELI5):")}
                  </span>
                  <span>{eli5Hint}</span>
                </div>
              </div>
            )}
          </div>
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
                    {(activeRound === 1
                      ? t("codegym.nextRound2", "Раунд 2: Прогалини →")
                      : activeRound === 2
                      ? t("codegym.nextRound3", "Раунд 3: Спринт →")
                      : t("codegym.nextRound4", "Раунд 4: Варіація →")) +
                      " " +
                      t("codegym.advanceHotkeyHint", "(Enter ↵)")}
                  </span>
                  <ArrowRight size={14} />
                </button>
              ) : nextTaskAvailable && onNextTask ? (
                <button
                  type="button"
                  onClick={onNextTask}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-mono font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>
                    {t("codegym.nextTaskBtn", "Наступне завдання →") +
                      " " +
                      t("codegym.advanceHotkeyHint", "(Enter ↵)")}
                  </span>
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
                  disabled={!isTheoryUnlocked}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-mono font-bold text-xs shadow-md transition-all ${
                    !isTheoryUnlocked
                      ? "bg-red-900/40 text-red-300/40 border border-red-900/30 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                  }`}
                >
                  <Wrench size={14} />
                  <span>{t("playground.runVerificationBtn", "Виправити дефект (Ctrl+Enter)")}</span>
                </button>
              ) : activeRound === 2 ? (
                <button
                  type="button"
                  onClick={onVerify}
                  disabled={!isTheoryUnlocked}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-mono font-bold text-xs shadow-md transition-all ${
                    !isTheoryUnlocked
                      ? "bg-accent-blue/30 text-white/40 cursor-not-allowed"
                      : "bg-accent-blue hover:bg-accent-blue/80 text-white cursor-pointer"
                  }`}
                >
                  <Play size={13} className="fill-white" />
                  <span>{t("codegym.verifyClozeBtn", "Перевірити прогалини (Ctrl+Enter)")}</span>
                </button>
              ) : activeRound === 3 ? (
                !isTimerRunning ? (
                  <button
                    type="button"
                    onClick={onStartSprint}
                    disabled={!isTheoryUnlocked}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-mono font-extrabold text-xs shadow-md transition-all ${
                      !isTheoryUnlocked
                        ? "bg-amber-500/30 text-stone-900/40 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-400 text-stone-900 cursor-pointer"
                    }`}
                  >
                    <Timer size={14} />
                    <span>{t("codegym.startSprintBtn", "Старт спринту")}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onVerify}
                    disabled={!isTheoryUnlocked}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-mono font-extrabold text-xs shadow-md transition-all ${
                      !isTheoryUnlocked
                        ? "bg-amber-500/30 text-stone-900/40 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-400 text-stone-900 cursor-pointer"
                    }`}
                  >
                    <Play size={13} className="fill-stone-900" />
                    <span>{t("codegym.finishSprintBtn", "Фініш спринту (Ctrl+Enter)")}</span>
                  </button>
                )
              ) : activeRound === 4 ? (
                <button
                  type="button"
                  onClick={onVerify}
                  disabled={!isTheoryUnlocked}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-mono font-extrabold text-xs shadow-md transition-all ${
                    !isTheoryUnlocked
                      ? "bg-cyan-500/30 text-stone-900/40 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-400 text-stone-900 cursor-pointer"
                  }`}
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
