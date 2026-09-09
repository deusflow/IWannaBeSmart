/**
 * @file apps/web/src/components/workbench/playground/PreciseErrorPointer.tsx
 * @description Inline error indicator that surfaces the exact offending token
 *   when the user makes a syntax mistake in Trace/Sprint rounds.
 *
 * Analyses: missing semicolons, wrong case, missing parentheses/brackets,
 *   extra spaces before operators, wrong operator ==/=.
 */

import React, { useMemo } from "react";
import { AlertTriangle } from "lucide-react";

interface TokenError {
  /** Short label shown in the error chip, e.g. "';'" */
  token: string;
  /** Longer engineering description */
  description: string;
  /** Engineering term (stays in English) */
  term: string;
}

interface PreciseErrorPointerProps {
  /** The string the user has typed so far */
  userInput: string;
  /** The expected (target) code string */
  targetCode: string;
  /** Whether an error state is active */
  hasError: boolean;
}

// ── Token-level detectors ─────────────────────────────────────────────────────

function detectTokenError(input: string, target: string): TokenError | null {
  // Find first mismatch position
  let mismatchAt = -1;
  const minLen = Math.min(input.length, target.length);
  for (let i = 0; i < minLen; i++) {
    if (input[i] !== target[i]) { mismatchAt = i; break; }
  }

  if (mismatchAt === -1) return null;

  const expectedChar = target[mismatchAt];
  const gotChar = input[mismatchAt];

  // ── Rule 1: Semicolon missing / replaced ──
  if (expectedChar === ";") {
    return {
      token: "';'",
      description: "Очікується крапка з комою ';' для завершення інструкції",
      term: "Statement Terminator",
    };
  }

  // ── Rule 2: Case mismatch (same letter, different case) ──
  if (expectedChar.toLowerCase() === gotChar?.toLowerCase() && expectedChar !== gotChar) {
    return {
      token: `'${expectedChar}'`,
      description: `Регістр символу невірний: очікується '${expectedChar}', отримано '${gotChar}'`,
      term: "Case Sensitivity",
    };
  }

  // ── Rule 3: Missing opening parenthesis ──
  if (expectedChar === "(") {
    return {
      token: "'('",
      description: "Очікується відкриваюча дужка '(' для виклику методу або умови",
      term: "Opening Parenthesis",
    };
  }

  // ── Rule 4: Missing closing parenthesis ──
  if (expectedChar === ")") {
    return {
      token: "')'",
      description: "Очікується закриваюча дужка ')' для завершення виразу",
      term: "Closing Parenthesis",
    };
  }

  // ── Rule 5: Missing opening brace ──
  if (expectedChar === "{") {
    return {
      token: "'{'",
      description: "Очікується відкриваюча фігурна дужка '{' для початку блоку",
      term: "Opening Block Brace",
    };
  }

  // ── Rule 6: Assignment vs comparison ──
  if (expectedChar === "=" && gotChar === "=") {
    return {
      token: "'='",
      description: "Очікується оператор присвоєння '=', а не порівняння '=='",
      term: "Assignment Operator",
    };
  }

  // ── Rule 7: Dot accessor missing ──
  if (expectedChar === "." && gotChar !== ".") {
    return {
      token: "'.'",
      description: "Очікується оператор доступу до члену '.' (dot accessor)",
      term: "Member Access Operator",
    };
  }

  // ── Rule 8: Generic wrong character ──
  return {
    token: `'${expectedChar}'`,
    description: `Символ не відповідає трафарету: очікується '${expectedChar}', отримано '${gotChar ?? "∅"}'`,
    term: "Syntax Mismatch",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export const PreciseErrorPointer: React.FC<PreciseErrorPointerProps> = ({
  userInput,
  targetCode,
  hasError,
}) => {
  const error = useMemo(() => {
    if (!hasError || !userInput) return null;
    return detectTokenError(userInput, targetCode);
  }, [hasError, userInput, targetCode]);

  if (!error) return null;

  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-500/8 border border-red-500/20 animate-in fade-in duration-150">
      {/* Triangle marker */}
      <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
        <AlertTriangle size={13} className="text-red-400" />
        <div className="w-0.5 h-3 bg-red-400/30 rounded-full" />
        <span className="text-red-400 text-[10px] font-mono">▲</span>
      </div>

      {/* Error detail */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="error-pointer-label">
            {error.token}
          </span>
          <span className="font-mono text-[10px] font-bold text-red-400/70 uppercase tracking-wider">
            {error.term}
          </span>
        </div>
        <p className="mt-1 text-[11px] font-mono text-red-300/90 leading-snug">
          {error.description}
        </p>
      </div>
    </div>
  );
};
