/**
 * @file packages/sim-engine/src/runtime/parser.ts
 * @description Safe lexical scanner and statement interpreter for C# and Go TV scripts
 */

import type { VirtualTV } from "./tvContext";

export interface ParseResult {
  success: boolean;
  error?: string;
}

/**
 * Remove line and block comments from code
 */
function stripComments(rawCode: string): string {
  return rawCode
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .trim();
}

/**
 * Evaluate a boolean condition on VirtualTV
 */
function evaluateCondition(condStr: string, tv: VirtualTV): boolean {
  const c = condStr.trim();

  // Negation: !tv.IsOn or !tv.isOn
  if (/^!\s*tv\.(IsOn|isOn)$/i.test(c)) {
    return !tv.IsOn;
  }

  // Direct boolean: tv.IsOn or tv.isOn
  if (/^tv\.(IsOn|isOn)$/i.test(c)) {
    return tv.IsOn;
  }

  // Equality: tv.IsOn == true or tv.IsOn == false
  const eqMatch = c.match(/^tv\.(IsOn|isOn)\s*==\s*(true|false)$/i);
  if (eqMatch) {
    const expected = eqMatch[2].toLowerCase() === "true";
    return tv.IsOn === expected;
  }

  // Inequality: tv.IsOn != true or tv.IsOn != false
  const neqMatch = c.match(/^tv\.(IsOn|isOn)\s*!=\s*(true|false)$/i);
  if (neqMatch) {
    const notExpected = neqMatch[2].toLowerCase() === "true";
    return tv.IsOn !== notExpected;
  }

  // Number comparison for Channel or Volume (e.g., tv.Volume > 0, tv.Channel == 1)
  const numMatch = c.match(/^tv\.(Channel|Volume|channel|volume)\s*(==|!=|>|<|>=|<=)\s*(\d+)$/i);
  if (numMatch) {
    const prop = numMatch[1].toLowerCase() === "channel" ? tv.Channel : tv.Volume;
    const op = numMatch[2];
    const val = parseInt(numMatch[3], 10);
    switch (op) {
      case "==": return prop === val;
      case "!=": return prop !== val;
      case ">": return prop > val;
      case "<": return prop < val;
      case ">=": return prop >= val;
      case "<=": return prop <= val;
    }
  }

  // Literal boolean: true / false
  if (c.toLowerCase() === "true") return true;
  if (c.toLowerCase() === "false") return false;

  throw new Error(`Невідомий умовний вираз: «${c}». Використовуйте tv.IsOn, !tv.IsOn або tv.IsOn == true`);
}

/**
 * Execute a single statement
 */
function executeStatement(statement: string, tv: VirtualTV): void {
  const s = statement.trim().replace(/;+$/, "").trim();
  if (!s) return;

  // 1. Property Assignment: tv.IsOn = true | false | !tv.IsOn
  const propBoolMatch = s.match(/^tv\.(IsOn|isOn)\s*=\s*(true|false|!\s*tv\.(?:IsOn|isOn))$/i);
  if (propBoolMatch) {
    const rhs = propBoolMatch[2].trim();
    if (/^!\s*tv\.(?:IsOn|isOn)$/i.test(rhs)) {
      tv.IsOn = !tv.IsOn;
    } else {
      tv.IsOn = rhs.toLowerCase() === "true";
    }
    return;
  }

  // 2. Property Assignment: tv.Channel = <number>
  const propChMatch = s.match(/^tv\.(Channel|channel)\s*=\s*(\d+)$/i);
  if (propChMatch) {
    tv.Channel = parseInt(propChMatch[2], 10);
    return;
  }

  // 3. Property Assignment: tv.Volume = <number>
  const propVolMatch = s.match(/^tv\.(Volume|volume)\s*=\s*(\d+)$/i);
  if (propVolMatch) {
    tv.Volume = parseInt(propVolMatch[2], 10);
    return;
  }

  // 4. Increment/Decrement: tv.Volume++ / tv.Volume-- / tv.Channel++ / tv.Channel--
  if (/^tv\.(Volume|volume)\+\+$/i.test(s)) {
    tv.Volume = tv.Volume + 1;
    return;
  }
  if (/^tv\.(Volume|volume)--$/i.test(s)) {
    tv.Volume = tv.Volume - 1;
    return;
  }
  if (/^tv\.(Channel|channel)\+\+$/i.test(s)) {
    tv.Channel = tv.Channel + 1;
    return;
  }
  if (/^tv\.(Channel|channel)--$/i.test(s)) {
    tv.Channel = tv.Channel - 1;
    return;
  }

  // 5. Method calls: tv.PowerOn(), tv.PowerOff(), tv.TogglePower()
  if (/^tv\.(PowerOn|powerOn)\(\s*\)$/i.test(s)) {
    tv.PowerOn();
    return;
  }
  if (/^tv\.(PowerOff|powerOff)\(\s*\)$/i.test(s)) {
    tv.PowerOff();
    return;
  }
  if (/^tv\.(TogglePower|togglePower)\(\s*\)$/i.test(s)) {
    tv.TogglePower();
    return;
  }

  // 6. Parameterized methods: tv.SetChannel(ch), tv.SetVolume(vol)
  const setChMatch = s.match(/^tv\.(SetChannel|setChannel)\(\s*(\d+)\s*\)$/i);
  if (setChMatch) {
    tv.SetChannel(parseInt(setChMatch[2], 10));
    return;
  }

  const setVolMatch = s.match(/^tv\.(SetVolume|setVolume)\(\s*(\d+)\s*\)$/i);
  if (setVolMatch) {
    tv.SetVolume(parseInt(setVolMatch[2], 10));
    return;
  }

  throw new Error(`Синтаксична помилка: невідома команда «${s}». Перевірте назви методів або властивостей (tv.IsOn, tv.PowerOn(), tv.SetChannel())`);
}

/**
 * Execute a block of statements (separated by ; or newlines)
 */
function executeBlock(blockStr: string, tv: VirtualTV): void {
  // Split statements by semicolon or newline
  const rawParts = blockStr.split(/[\n;]+/);
  for (const part of rawParts) {
    const stmt = part.trim();
    if (stmt) {
      executeStatement(stmt, tv);
    }
  }
}

/**
 * Main parser: processes if/else statements and simple statements
 */
export function interpretScript(rawCode: string, tv: VirtualTV): ParseResult {
  const cleaned = stripComments(rawCode);
  if (!cleaned) {
    return { success: true };
  }

  try {
    let remaining = cleaned;

    while (remaining.trim().length > 0) {
      remaining = remaining.trim();

      // Check for if statement (supports both C# with () and Go without ())
      // e.g.: if (tv.IsOn) { ... } else { ... } OR if tv.IsOn { ... } else { ... }
      const ifRegex = /^if\s*(?:\(([^)]+)\)|([^{\s]+(?:[^{]*?[^\\s{])?))\s*\{([^}]*)\}(?:\s*else\s*\{([^}]*)\})?/i;
      const ifMatch = remaining.match(ifRegex);

      if (ifMatch) {
        const fullMatch = ifMatch[0];
        const conditionStr = ifMatch[1] || ifMatch[2];
        const thenBlock = ifMatch[3];
        const elseBlock = ifMatch[4] || "";

        const condResult = evaluateCondition(conditionStr, tv);
        if (condResult) {
          executeBlock(thenBlock, tv);
        } else if (elseBlock) {
          executeBlock(elseBlock, tv);
        }

        remaining = remaining.slice(fullMatch.length).trim();
        // Consume optional trailing semicolon
        if (remaining.startsWith(";")) {
          remaining = remaining.slice(1).trim();
        }
        continue;
      }

      // Check for regular statement up to next ; or newline or end
      const stmtMatch = remaining.match(/^[^;{}\n]+/);
      if (stmtMatch) {
        const stmt = stmtMatch[0].trim();
        executeStatement(stmt, tv);
        remaining = remaining.slice(stmtMatch[0].length).trim();
        if (remaining.startsWith(";")) {
          remaining = remaining.slice(1).trim();
        }
        continue;
      }

      // If we got here and couldn't match, syntax error
      throw new Error(`Неочікуваний символ поблизу: «${remaining.slice(0, 20)}»`);
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}
