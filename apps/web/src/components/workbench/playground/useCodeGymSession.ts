/**
 * @file apps/web/src/components/workbench/playground/useCodeGymSession.ts
 * @description Unified hook managing 4-round Code Gym typing session, sprint timers, accuracy & gutter alignment.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { audioFx } from "../../../utils/audioFx";
import type { WorkedExample } from "@iw/sim-engine";
import {
  saveCodeDraft,
  getCodeDraft,
  clearCodeDraft,
  saveStationCheckpoint,
  getStationCheckpoint,
} from "../../../utils/checkpointManager";

export interface CodeGymTaskLike {
  id: string;
  targetCode: Record<string, string>;
  clozeTemplate?: Record<string, string> | string;
  workedExample?: WorkedExample;
  sprintTimeLimit?: number;
  isBugfixTask?: boolean;
  initialCode?: Record<string, string>;
  initialBrokenCode?: Record<string, string>;
  transferVariant?: {
    prompt: Record<string, string>;
    hint?: Record<string, string>;
  };
  descKey: string;
}

interface UseCodeGymSessionOptions<
  TTask extends CodeGymTaskLike,
  TLang extends string = "csharp" | "go"
> {
  currentTask: TTask;
  initialLang?: TLang;
  starsEarned?: number;
  stationId?: string;
  onRoundComplete?: (round: 1 | 2 | 3 | 4, code: string, stats?: { wpm: number; accuracy: number }) => Promise<void> | void;
}

function checkClozeConsistency(input: string, target: string): { isComplete: boolean; isValid: boolean } {
  const normInput = input.trim();
  const normTarget = target.trim();

  if (normInput === normTarget) {
    return { isComplete: true, isValid: true };
  }

  const collapseWs = (s: string) => s.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ");
  if (collapseWs(normInput) === collapseWs(normTarget)) {
    return { isComplete: true, isValid: true };
  }

  // Detect any placeholder format: ___, /* ... */, or [[ ... ]]
  const hasPlaceholders =
    normInput.includes("___") ||
    /\/\*[\s\S]*?\*\//.test(normInput) ||
    /\[\[[\s\S]*?\]\]/.test(normInput);

  if (hasPlaceholders) {
    const placeholderNormalized = normInput
      .replace(/\/\*[\s\S]*?\*\//g, "___")
      .replace(/\[\[[\s\S]*?\]\]/g, "___");

    const escaped = placeholderNormalized
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/(?:\\_\\_\\_)+/g, "[\\s\\S]*?");
    try {
      const re = new RegExp("^" + escaped + "$");
      if (re.test(normTarget) || re.test(collapseWs(normTarget))) {
        return { isComplete: false, isValid: true };
      }
    } catch {
      // Fallback on regex compilation error
    }
    return { isComplete: false, isValid: false };
  }

  if (normTarget.startsWith(normInput) || collapseWs(normTarget).startsWith(collapseWs(normInput))) {
    return { isComplete: false, isValid: true };
  }

  return { isComplete: false, isValid: false };
}


export function useCodeGymSession<
  TTask extends CodeGymTaskLike,
  TLang extends string = "csharp" | "go"
>({
  currentTask,
  initialLang,
  starsEarned = 0,
  stationId,
  onRoundComplete,
}: UseCodeGymSessionOptions<TTask, TLang>) {
  const { t } = useTranslation();

  const savedCheckpoint = useMemo(() => {
    return stationId ? getStationCheckpoint(stationId) : null;
  }, [stationId]);

  const [isTheoryUnlocked, setIsTheoryUnlocked] = useState<boolean>(() => starsEarned > 0);

  useEffect(() => {
    setIsTheoryUnlocked(starsEarned > 0);
  }, [currentTask.id, starsEarned]);

  const unlockPractice = useCallback(() => {
    setIsTheoryUnlocked(true);
    audioFx.playRelayClick();
    setTimeout(() => {
      const cm = document.querySelector(".cm-content") as HTMLElement | null;
      cm?.focus();
    }, 50);
  }, []);

  const [codeLang, setCodeLang] = useState<TLang>(() => {
    if (savedCheckpoint?.lang) {
      return savedCheckpoint.lang as TLang;
    }
    return (initialLang ?? ("csharp" as unknown)) as TLang;
  });

  const [activeRound, setActiveRound] = useState<1 | 2 | 3 | 4>(() => {
    if (
      savedCheckpoint &&
      savedCheckpoint.taskId === currentTask.id &&
      savedCheckpoint.round
    ) {
      return savedCheckpoint.round as 1 | 2 | 3 | 4;
    }
    return 1;
  });

  // Save station checkpoint whenever station, task, round, or language changes
  useEffect(() => {
    if (stationId) {
      saveStationCheckpoint(stationId, {
        taskId: currentTask.id,
        round: activeRound,
        lang: codeLang,
      });
    }
  }, [stationId, currentTask.id, activeRound, codeLang]);

  const [showTransferHint, setShowTransferHint] = useState<boolean>(false);

  const targetCode = currentTask.targetCode[codeLang] ?? "";
  const clozeTemplate = useMemo(() => {
    const workedCloze = currentTask.workedExample?.clozeExercise;
    if (workedCloze) {
      return typeof workedCloze === "string" ? workedCloze : workedCloze[codeLang] ?? "";
    }
    const raw = currentTask.clozeTemplate;
    if (!raw) return "";
    return typeof raw === "string" ? raw : raw[codeLang] ?? "";
  }, [currentTask, codeLang]);

  const sprintLimit = Math.max(
    20,
    currentTask.sprintTimeLimit ?? Math.ceil(targetCode.length / 3.5)
  );

  const [typedCode, setTypedCode] = useState<string>("");
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showTheory, setShowTheory] = useState<boolean>(false);

  // Gutter width measurement
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const [gutterWidth, setGutterWidth] = useState<number>(40);

  const updateGutterWidth = useCallback(() => {
    const node = editorContainerRef.current;
    if (!node) return;
    const gutterEl = node.querySelector(".cm-gutters") as HTMLElement | null;
    setGutterWidth(gutterEl ? gutterEl.getBoundingClientRect().width : 40);
  }, []);

  useEffect(() => {
    updateGutterWidth();
    if (!editorContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => updateGutterWidth());
    resizeObserver.observe(editorContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeRound, codeLang, targetCode, updateGutterWidth]);

  // Sprint timer state
  const [timeLeft, setTimeLeft] = useState<number>(sprintLimit);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // WPM & Typing ergonomics
  const [roundStats, setRoundStats] = useState<{ wpm: number; accuracy: number } | null>(null);
  const roundStartTimeRef = useRef<number | null>(null);
  const lastKeySoundTimeRef = useRef<number>(0);

  const playThrottledKeyClick = useCallback(() => {
    const now = Date.now();
    if (now - lastKeySoundTimeRef.current > 35) {
      audioFx.playKeyClick();
      lastKeySoundTimeRef.current = now;
    }
  }, []);

  // Reset or setup editor when round, language, or task changes
  useEffect(() => {
    setRoundCompleted(false);
    setFeedback(null);
    setHasError(false);
    setIsTimerRunning(false);
    setTimeLeft(sprintLimit);
    setRoundStats(null);
    roundStartTimeRef.current = null;
    setShowTransferHint(false);

    // If user has an in-progress draft saved for this task, language, and round, restore it!
    const savedDraft = getCodeDraft(currentTask.id, codeLang, activeRound);
    if (savedDraft !== null && savedDraft.length > 0) {
      setTypedCode(savedDraft);
      return;
    }

    if (activeRound === 1) {
      if (currentTask.isBugfixTask) {
        setTypedCode(
          currentTask.initialBrokenCode?.[codeLang] ||
            currentTask.initialCode?.[codeLang] ||
            ""
        );
      } else {
        setTypedCode("");
      }
    } else if (activeRound === 2) {
      setTypedCode(clozeTemplate);
    } else if (activeRound === 3) {
      setTypedCode("");
    } else if (activeRound === 4) {
      setTypedCode("");
    }
  }, [activeRound, codeLang, clozeTemplate, currentTask, sprintLimit]);

  // Debounced auto-save for user's typed code draft
  useEffect(() => {
    if (roundCompleted) return;

    const timer = setTimeout(() => {
      if (typedCode !== undefined && typedCode !== null && typedCode.length > 0) {
        saveCodeDraft(currentTask.id, codeLang, activeRound, typedCode);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [typedCode, currentTask.id, codeLang, activeRound, roundCompleted]);

  // Trace character progress
  const traceCharsMatched = useMemo(() => {
    let count = 0;
    const minLen = Math.min(typedCode.length, targetCode.length);
    for (let i = 0; i < minLen; i++) {
      if (typedCode[i] === targetCode[i]) count++;
      else break;
    }
    return count;
  }, [typedCode, targetCode]);

  // Handle trace input mechanics
  const handleTraceChange = useCallback(
    async (input: string) => {
      setTypedCode(input);
      if (!roundStartTimeRef.current) {
        roundStartTimeRef.current = Date.now();
      }
      playThrottledKeyClick();

      if (currentTask.isBugfixTask) {
        setHasError(false);
        setFeedback(null);
        return;
      }

      let mismatch = false;
      const minLen = Math.min(input.length, targetCode.length);

      for (let i = 0; i < minLen; i++) {
        if (input[i] !== targetCode[i]) {
          mismatch = true;
          break;
        }
      }

      if (mismatch) {
        setHasError(true);
        audioFx.playErrorBuzz();
        setFeedback(
          t(
            "codegym.mismatchPrompt",
            "Символ не відповідає трафарету. Використовуйте Backspace."
          )
        );
      } else {
        setHasError(false);
        setFeedback(null);

        if (input.trim() === targetCode.trim()) {
          setRoundCompleted(true);
          clearCodeDraft(currentTask.id, codeLang, 1);
          const elapsedMinutes = Math.max(
            0.04,
            (Date.now() - (roundStartTimeRef.current || Date.now())) / 60000
          );
          const calculatedWpm = Math.round(
            targetCode.length / 5 / elapsedMinutes
          );
          const stats = { wpm: calculatedWpm, accuracy: 100 };
          setRoundStats(stats);
          audioFx.playSuccessFanfare();
          if (onRoundComplete) {
            await onRoundComplete(1, input, stats);
          }
        }
      }
    },
    [targetCode, currentTask.isBugfixTask, playThrottledKeyClick, t, onRoundComplete]
  );

  // Handle cloze input with instant character/token validation
  const handleClozeChange = useCallback(
    async (input: string) => {
      setTypedCode(input);
      if (!roundStartTimeRef.current) {
        roundStartTimeRef.current = Date.now();
      }
      playThrottledKeyClick();

      const { isComplete, isValid } = checkClozeConsistency(input, targetCode);

      if (isComplete) {
        setHasError(false);
        setFeedback(null);
        setRoundCompleted(true);
        clearCodeDraft(currentTask.id, codeLang, 2);
        const elapsedMinutes = Math.max(
          0.04,
          (Date.now() - (roundStartTimeRef.current || Date.now())) / 60000
        );
        const calculatedWpm = Math.round(
          targetCode.length / 5 / elapsedMinutes
        );
        const stats = { wpm: calculatedWpm, accuracy: 100 };
        setRoundStats(stats);
        audioFx.playSuccessFanfare();
        if (onRoundComplete) {
          await onRoundComplete(2, input, stats);
        }
      } else if (!isValid) {
        setHasError(true);
        audioFx.playErrorBuzz();
        setFeedback(
          t(
            "codegym.clozeMismatchPrompt",
            "Невірний токен у пропуску! Звіртеся зі зразком викладацького коду."
          )
        );
      } else {
        setHasError(false);
        setFeedback(null);
      }
    },
    [targetCode, playThrottledKeyClick, t, onRoundComplete, currentTask.id, codeLang]
  );

  // Handle general code input
  const handleCodeChange = useCallback(
    (input: string) => {
      if (activeRound === 1) {
        handleTraceChange(input);
      } else if (activeRound === 2) {
        handleClozeChange(input);
      } else {
        setTypedCode(input);
        playThrottledKeyClick();
        if (activeRound === 3 && !isTimerRunning) {
          setIsTimerRunning(true);
          roundStartTimeRef.current = Date.now();
        }
      }
    },
    [activeRound, handleTraceChange, handleClozeChange, playThrottledKeyClick, isTimerRunning]
  );

  // Sprint timer interval
  useEffect(() => {
    if (activeRound !== 3 || !isTimerRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          setHasError(true);
          audioFx.playErrorBuzz();
          setFeedback(
            t(
              "codegym.timeExpiredPrompt",
              "⏰ Час вичерпано! Натисніть 'Скинути' для нової спроби спринту."
            )
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRound, isTimerRunning, t]);

  const handleStartSprint = useCallback(() => {
    clearCodeDraft(currentTask.id, codeLang, 3);
    setTypedCode("");
    setRoundCompleted(false);
    setFeedback(null);
    setHasError(false);
    setTimeLeft(sprintLimit);
    setIsTimerRunning(true);
    roundStartTimeRef.current = Date.now();
    audioFx.playRelayClick();
    setTimeout(() => {
      const cm = document.querySelector(".cm-content") as HTMLElement | null;
      cm?.focus();
    }, 50);
  }, [currentTask.id, codeLang, sprintLimit]);

  const handleResetRound = useCallback(() => {
    audioFx.playRelayClick();
    clearCodeDraft(currentTask.id, codeLang, activeRound);
    if (currentTask.isBugfixTask && activeRound === 1) {
      setTypedCode(
        currentTask.initialBrokenCode?.[codeLang] ||
          currentTask.initialCode?.[codeLang] ||
          ""
      );
    } else {
      setTypedCode(activeRound === 2 ? clozeTemplate : "");
    }
    setHasError(false);
    setFeedback(null);
    setRoundCompleted(false);
    setIsTimerRunning(false);
    setTimeLeft(sprintLimit);
    setRoundStats(null);
    roundStartTimeRef.current = null;
  }, [currentTask.id, codeLang, activeRound, clozeTemplate, currentTask.isBugfixTask, currentTask.initialBrokenCode, currentTask.initialCode, sprintLimit]);

  return {
    codeLang,
    setCodeLang,
    activeRound,
    setActiveRound,
    typedCode,
    setTypedCode,
    roundCompleted,
    setRoundCompleted,
    feedback,
    setFeedback,
    hasError,
    setHasError,
    showTooltip,
    setShowTooltip,
    showTheory,
    setShowTheory,
    showTransferHint,
    setShowTransferHint,
    timeLeft,
    setTimeLeft,
    isTimerRunning,
    setIsTimerRunning,
    roundStats,
    setRoundStats,
    roundStartTimeRef,
    gutterWidth,
    editorContainerRef,
    targetCode,
    clozeTemplate,
    sprintLimit,
    traceCharsMatched,
    playThrottledKeyClick,
    handleCodeChange,
    handleStartSprint,
    handleResetRound,
    isTheoryUnlocked,
    setIsTheoryUnlocked,
    unlockPractice,
  };
}
