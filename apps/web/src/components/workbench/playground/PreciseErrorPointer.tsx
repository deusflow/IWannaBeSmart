/**
 * @file apps/web/src/components/workbench/playground/PreciseErrorPointer.tsx
 * @description Inline error indicator that surfaces the exact offending token
 *   when the user makes a syntax mistake in Trace/Sprint rounds.
 *
 * Analyses: missing semicolons, wrong case, missing parentheses/brackets,
 *   extra spaces before operators, wrong operator ==/=.
 */

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
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

function detectTokenError(
  input: string,
  target: string,
  t: ReturnType<typeof useTranslation>["t"]
): TokenError | null {
  // Find first mismatch position
  let mismatchAt = -1;
  const minLen = Math.min(input.length, target.length);
  for (let i = 0; i < minLen; i++) {
    if (input[i] !== target[i]) { mismatchAt = i; break; }
  }

  if (mismatchAt === -1) return null;

  const expectedChar = target[mismatchAt];
  const gotChar = input[mismatchAt];

  if (expectedChar === ";") {
    return {
      token: "';'",
      description: t("errorPointer.semicolonExpected"),
      term: "Statement Terminator",
    };
  }

  if (expectedChar.toLowerCase() === gotChar?.toLowerCase() && expectedChar !== gotChar) {
    return {
      token: `'${expectedChar}'`,
      description: t("errorPointer.caseMismatch", {
        expected: expectedChar,
        actual: gotChar ?? "∅",
      }),
      term: "Case Sensitivity",
    };
  }

  if (expectedChar === "(") {
    return {
      token: "'('",
      description: t("errorPointer.openParen"),
      term: "Opening Parenthesis",
    };
  }

  if (expectedChar === ")") {
    return {
      token: "')'",
      description: t("errorPointer.closeParen"),
      term: "Closing Parenthesis",
    };
  }

  if (expectedChar === "{") {
    return {
      token: "'{'",
      description: t("errorPointer.openBrace"),
      term: "Opening Block Brace",
    };
  }

  if (expectedChar === "=" && gotChar === "=") {
    return {
      token: "'='",
      description: t("errorPointer.assignmentVsComparison"),
      term: "Assignment Operator",
    };
  }

  if (expectedChar === "." && gotChar !== ".") {
    return {
      token: "'.'",
      description: t("errorPointer.memberAccess"),
      term: "Member Access Operator",
    };
  }

  return {
    token: `'${expectedChar}'`,
    description: t("errorPointer.syntaxMismatch", {
      expected: expectedChar,
      actual: gotChar ?? "∅",
    }),
    term: "Syntax Mismatch",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export const PreciseErrorPointer: React.FC<PreciseErrorPointerProps> = ({
  userInput,
  targetCode,
  hasError,
}) => {
  const { t } = useTranslation();
  const error = useMemo(() => {
    if (!hasError || !userInput) return null;
    return detectTokenError(userInput, targetCode, t);
  }, [hasError, userInput, targetCode, t]);

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
