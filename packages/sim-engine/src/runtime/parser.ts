/**
 * @file packages/sim-engine/src/runtime/parser.ts
 * @description Safe lexical scanner and statement interpreter for C# and Go TV scripts with async loop, function, and switch support
 */

import type { VirtualTV } from "./tvContext";
import type { VirtualTvState } from "./types";

export interface ParseResult {
  success: boolean;
  error?: string;
}

export interface InterpreterOptions {
  onStepMutation?: (snapshot: VirtualTvState) => void;
  stepDelayMs?: number;
}

export interface ExecutionContext {
  numScope: Record<string, number>;
  strScope: Record<string, string>;
  functions: Record<string, string>;
  registeredServices: Record<string, string>;
  commandRegistry: Record<string, string>;
}

/**
 * Remove line and block comments from code
 */
export function stripComments(rawCode: string): string {
  return rawCode
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .trim();
}

/**
 * Resolve numeric literal or local variable from scope
 */
function resolveNumValue(expr: string, scope: Record<string, number>): number {
  const trimmed = expr.trim();
  if (/^-?\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  if (trimmed in scope) {
    return scope[trimmed];
  }
  throw new Error(`Невідома змінна чи число: «${trimmed}»`);
}

/**
 * Evaluate a boolean condition on VirtualTV or local scope
 */
function evaluateCondition(
  condStr: string,
  tv: VirtualTV,
  scope: Record<string, number> = {}
): boolean {
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

  // Number comparison for Channel or Volume (e.g. tv.Channel > 4, tv.Volume <= 100)
  const numMatch = c.match(
    /^tv\.(Channel|Volume|channel|volume)\s*(==|!=|>|<|>=|<=)\s*([a-zA-Z_]\w*|-?\d+)$/i
  );
  if (numMatch) {
    const prop =
      numMatch[1].toLowerCase() === "channel" ? tv.Channel : tv.Volume;
    const op = numMatch[2];
    const val = resolveNumValue(numMatch[3], scope);
    switch (op) {
      case "==":
        return prop === val;
      case "!=":
        return prop !== val;
      case ">":
        return prop > val;
      case "<":
        return prop < val;
      case ">=":
        return prop >= val;
      case "<=":
        return prop <= val;
    }
  }

  // Literal boolean: true / false
  if (c.toLowerCase() === "true") return true;
  if (c.toLowerCase() === "false") return false;

  throw new Error(
    `Невідомий умовний вираз: «${c}». Використовуйте tv.IsOn, tv.Channel > 4 тощо.`
  );
}

/**
 * Execute a single statement
 */
function executeStatement(
  statement: string,
  tv: VirtualTV,
  ctx: ExecutionContext
): void {
  const s = statement.trim().replace(/;+$/, "").trim();
  if (!s) return;

  // 0. Ignore break statements (used inside switch/case)
  if (/^break$/i.test(s)) {
    return;
  }

  // 1. Property Assignment: tv.IsOn = true | false | !tv.IsOn
  const propBoolMatch = s.match(
    /^tv\.(IsOn|isOn)\s*=\s*(true|false|!\s*tv\.(?:IsOn|isOn))$/i
  );
  if (propBoolMatch) {
    const rhs = propBoolMatch[2].trim();
    if (/^!\s*tv\.(?:IsOn|isOn)$/i.test(rhs)) {
      tv.IsOn = !tv.IsOn;
    } else {
      tv.IsOn = rhs.toLowerCase() === "true";
    }
    return;
  }

  // 2. Increment/Decrement: tv.Channel++ / tv.Channel-- / tv.Volume++ / tv.Volume--
  if (/^tv\.(Channel|channel)\+\+$/i.test(s) || /^\+\+tv\.(Channel|channel)$/i.test(s)) {
    tv.Channel = tv.Channel + 1;
    return;
  }
  if (/^tv\.(Channel|channel)--$/i.test(s) || /^--tv\.(Channel|channel)$/i.test(s)) {
    tv.Channel = tv.Channel - 1;
    return;
  }
  if (/^tv\.(Volume|volume)\+\+$/i.test(s) || /^\+\+tv\.(Volume|volume)$/i.test(s)) {
    tv.Volume = tv.Volume + 1;
    return;
  }
  if (/^tv\.(Volume|volume)--$/i.test(s) || /^--tv\.(Volume|volume)$/i.test(s)) {
    tv.Volume = tv.Volume - 1;
    return;
  }

  // 3. Compound Assignment: tv.Channel += <val>, tv.Channel -= <val>
  const compChMatch = s.match(/^tv\.(Channel|channel)\s*(\+=|-=)\s*([a-zA-Z_]\w*|\d+)$/i);
  if (compChMatch) {
    const op = compChMatch[2];
    const val = resolveNumValue(compChMatch[3], ctx.numScope);
    tv.Channel = op === "+=" ? tv.Channel + val : tv.Channel - val;
    return;
  }

  const compVolMatch = s.match(/^tv\.(Volume|volume)\s*(\+=|-=)\s*([a-zA-Z_]\w*|\d+)$/i);
  if (compVolMatch) {
    const op = compVolMatch[2];
    const val = resolveNumValue(compVolMatch[3], ctx.numScope);
    tv.Volume = op === "+=" ? tv.Volume + val : tv.Volume - val;
    return;
  }

  // 4. Arithmetic Assignment: tv.Channel = tv.Channel + 1, tv.Volume = tv.Volume + 5
  const arithChMatch = s.match(
    /^tv\.(Channel|channel)\s*=\s*tv\.(?:Channel|channel)\s*([+-])\s*([a-zA-Z_]\w*|\d+)$/i
  );
  if (arithChMatch) {
    const op = arithChMatch[2];
    const val = resolveNumValue(arithChMatch[3], ctx.numScope);
    tv.Channel = op === "+" ? tv.Channel + val : tv.Channel - val;
    return;
  }

  const arithVolMatch = s.match(
    /^tv\.(Volume|volume)\s*=\s*tv\.(?:Volume|volume)\s*([+-])\s*([a-zA-Z_]\w*|\d+)$/i
  );
  if (arithVolMatch) {
    const op = arithVolMatch[2];
    const val = resolveNumValue(arithVolMatch[3], ctx.numScope);
    tv.Volume = op === "+" ? tv.Volume + val : tv.Volume - val;
    return;
  }

  // 5. Property Assignment: tv.Channel = <number | scopeVar>
  const propChMatch = s.match(/^tv\.(Channel|channel)\s*=\s*([a-zA-Z_]\w*|\d+)$/i);
  if (propChMatch) {
    tv.Channel = resolveNumValue(propChMatch[2], ctx.numScope);
    return;
  }

  // 6. Property Assignment: tv.Volume = <number | scopeVar>
  const propVolMatch = s.match(/^tv\.(Volume|volume)\s*=\s*([a-zA-Z_]\w*|\d+)$/i);
  if (propVolMatch) {
    tv.Volume = resolveNumValue(propVolMatch[2], ctx.numScope);
    return;
  }

  // 6.5. Property Assignment: tv.Osd = "CALC_MODE" / tv.OSD = "CALC_MODE"
  const propOsdMatch = s.match(/^tv\.(Osd|OSD|osd)\s*=\s*["']([^"']*)["']$/i);
  if (propOsdMatch) {
    tv.Osd = propOsdMatch[2];
    return;
  }

  // 7. Method calls: tv.PowerOn(), tv.PowerOff(), tv.TogglePower()
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

  // 8. Parameterized methods: tv.SetChannel(ch), tv.SetVolume(vol)
  const setChMatch = s.match(/^tv\.(SetChannel|setChannel)\(\s*([a-zA-Z_]\w*|\d+)\s*\)$/i);
  if (setChMatch) {
    tv.SetChannel(resolveNumValue(setChMatch[2], ctx.numScope));
    return;
  }

  const setVolMatch = s.match(/^tv\.(SetVolume|setVolume)\(\s*([a-zA-Z_]\w*|\d+)\s*\)$/i);
  if (setVolMatch) {
    tv.SetVolume(resolveNumValue(setVolMatch[2], ctx.numScope));
    return;
  }

  const setModeMatch = s.match(/^tv\.(SetMode|setMode)\(\s*["']([^"']*)["']\s*\)$/i);
  if (setModeMatch) {
    tv.SetMode(setModeMatch[2]);
    return;
  }

  // 9. String variable assignment: string button = "CALC" / button := "CALC"
  const strVarMatch = s.match(/^(?:(?:string|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*["']([^"']*)["']$/i);
  if (strVarMatch) {
    ctx.strScope[strVarMatch[1]] = strVarMatch[2];
    return;
  }

  // 9.5 Interface/Command declaration: IRemoteCommand command = new CalcCommand(); / command := CalcCommand{}
  const cmdDeclMatch = s.match(/^(?:(?:IRemoteCommand|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*(?:new\s+)?([a-zA-Z_]\w*)(?:\(\s*\)|\{\s*\})?$/i);
  if (cmdDeclMatch) {
    ctx.strScope[cmdDeclMatch[1]] = cmdDeclMatch[2];
    return;
  }

  // 9.6 Interface/Command invocation: command.Execute() or command.Execute();
  const cmdExecMatch = s.match(/^([a-zA-Z_]\w*)\.Execute\(\s*\)$/i);
  if (cmdExecMatch || /^(?:[a-zA-Z_]\w*\.)?Execute\(\s*\)$/i.test(s)) {
    const varName = cmdExecMatch ? cmdExecMatch[1] : "command";
    const hasInstantiated = Boolean(ctx.strScope[varName]) || Object.keys(ctx.strScope).some(k => ctx.strScope[k].toLowerCase().includes("command"));
    if (tv.isArchWired() === false && !hasInstantiated) {
      throw new Error("NullReferenceException: No implementation registered for IRemoteCommand");
    }
    tv.setArchWired(true);
    tv.Osd = "CALC_MODE";
    return;
  }

  // 9.7 DI Container Registration (C# and Go)
  // C#: services.AddTransient<IRemoteCommand, CalcCommand>();
  const diCsMatch = s.match(/^services\.(?:AddTransient|AddSingleton|AddScoped)<([a-zA-Z_]\w*),\s*([a-zA-Z_]\w*)>\s*\(\s*\)$/i);
  if (diCsMatch) {
    const iface = diCsMatch[1];
    const impl = diCsMatch[2];
    ctx.registeredServices[iface] = impl;
    tv.Osd = "CALC_MODE";
    tv.setArchWired(true);
    return;
  }

  // Go: container.Register("calc", NewCalcCommand()) or container.Register("calc", CalcCommand{})
  const diGoMatch = s.match(/^container\.Register\s*\(\s*["']([^"']+)["']\s*,\s*(?:New([a-zA-Z_]\w*)\(\)|([a-zA-Z_]\w*)\s*\{\s*\})\s*\)$/i);
  if (diGoMatch) {
    const key = diGoMatch[1];
    const impl = diGoMatch[2] || diGoMatch[3];
    ctx.registeredServices[key] = impl;
    ctx.registeredServices["IRemoteCommand"] = impl;
    tv.Osd = "CALC_MODE";
    tv.setArchWired(true);
    return;
  }

  // 9.8 Command Registry (Dictionary / map)
  // 9.8.1 Initialization: var registry = new Dictionary<string, IRemoteCommand>(); / registry := make(map[string]IRemoteCommand)
  if (/^(?:(?:var|Dictionary<[^>]+>)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*(?:new\s+Dictionary<[^>]+>\s*\(\s*\)|make\s*\(\s*map\[string\][a-zA-Z_]\w*\s*\))$/i.test(s)) {
    return;
  }

  // 9.8.2 Item assignment: registry["PWR"] = new PowerCommand(); / registry["CALC"] = CalcCommand{}
  const regAssignMatch = s.match(/^([a-zA-Z_]\w*)\s*\[\s*["']([^"']+)["']\s*\]\s*(?::=|=)\s*(?:new\s+)?([a-zA-Z_]\w*)(?:\(\s*\)|\{\s*\})?$/i);
  if (regAssignMatch) {
    const regKey = regAssignMatch[2];
    const cmdName = regAssignMatch[3];
    ctx.commandRegistry[regKey] = cmdName;
    return;
  }

  // 9.8.3 Dynamic execution: registry[button].Execute(); or registry["CALC"].Execute()
  const regExecMatch = s.match(/^([a-zA-Z_]\w*)\s*\[\s*(?:["']([^"']+)["']|([a-zA-Z_]\w*))\s*\]\s*\.\s*Execute\s*\(\s*\)$/i);
  if (regExecMatch) {
    const literalKey = regExecMatch[2];
    const varKey = regExecMatch[3];
    let resolvedKey = literalKey || "";
    if (!resolvedKey && varKey) {
      resolvedKey = ctx.strScope[varKey] || varKey;
    }

    const upperKey = resolvedKey.toUpperCase();
    const registeredCmd = ctx.commandRegistry[resolvedKey] || ctx.commandRegistry[upperKey];

    if (!registeredCmd && tv.isArchWired() === false) {
      throw new Error(`NullReferenceException: No implementation registered for key '${resolvedKey}' in Command Registry`);
    }

    tv.setArchWired(true);

    if (upperKey === "CALC" || registeredCmd?.toLowerCase().includes("calc")) {
      tv.Osd = "CALC_MODE";
      return;
    }
    if (upperKey === "PWR" || registeredCmd?.toLowerCase().includes("power")) {
      tv.TogglePower();
      return;
    }

    tv.Osd = "CALC_MODE";
    return;
  }

  // 10. User-defined function call: Mute() or Mute();
  const funcCallMatch = s.match(/^([a-zA-Z_]\w*)\s*\(\s*\)$/);
  if (funcCallMatch) {
    const funcName = funcCallMatch[1];
    if (funcName in ctx.functions) {
      executeBlock(ctx.functions[funcName], tv, ctx);
      return;
    }
  }

  throw new Error(
    `Синтаксична помилка: невідома команда «${s}». Перевірте назви методів або властивостей (tv.Channel, tv.Volume, tv.IsOn, Mute(), command.Execute())`
  );
}

/**
 * Extracts balanced braces content from a starting brace index
 */
function extractBalancedBraces(
  str: string,
  openBraceIdx: number
): { body: string; endIdx: number } | null {
  let depth = 0;
  for (let i = openBraceIdx; i < str.length; i++) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) {
        return {
          body: str.slice(openBraceIdx + 1, i),
          endIdx: i,
        };
      }
    }
  }
  return null;
}

/**
 * Execute a block of statements (separated by ; or newlines)
 */
function executeBlock(
  blockStr: string,
  tv: VirtualTV,
  ctx: ExecutionContext
): void {
  const rawParts = blockStr.split(/[\n;]+/);
  for (const part of rawParts) {
    const stmt = part.trim();
    if (stmt) {
      executeStatement(stmt, tv, ctx);
    }
  }
}

/**
 * For-loop configuration details
 */
interface ForLoopConfig {
  varName: string;
  initVal: number;
  condOp: "<=" | "<" | ">=" | ">" | "==" | "!=";
  limitVal: number;
  stepOp: "++" | "--" | "+=" | "-=";
  stepVal: number;
}

/**
 * Parse header of a for-loop: (int i = 1; i <= 4; i++) or i := 1; i <= 4; i++
 */
function parseForHeader(headerStr: string): ForLoopConfig {
  const parts = headerStr.split(";").map((p) => p.trim());
  if (parts.length !== 3) {
    throw new Error(
      `Некоректний заголовок циклу for: «${headerStr}». Очікується 3 секції через «;» (наприклад: int i = 1; i <= 4; i++)`
    );
  }

  const [initPart, condPart, stepPart] = parts;

  // 1. Init part: int i = 1 | var i = 1 | i := 1 | i = 1
  const initMatch = initPart.match(
    /^(?:(?:int|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*(\d+)$/
  );
  if (!initMatch) {
    throw new Error(
      `Некоректна ініціалізація циклу: «${initPart}». Приклад: int i = 1 або i := 1`
    );
  }
  const varName = initMatch[1];
  const initVal = parseInt(initMatch[2], 10);

  // 2. Condition part: i <= 4 | i < 5 | i >= 1
  const condMatch = condPart.match(
    new RegExp(`^${varName}\\s*(<=|<|>=|>|==|!=)\\s*(\\d+)$`)
  );
  if (!condMatch) {
    throw new Error(
      `Некоректна умова циклу: «${condPart}». Приклад: ${varName} <= 4`
    );
  }
  const condOp = condMatch[1] as ForLoopConfig["condOp"];
  const limitVal = parseInt(condMatch[2], 10);

  // 3. Step part: i++ | ++i | i-- | --i | i += 1 | i -= 1 | i = i + 1
  let stepOp: ForLoopConfig["stepOp"] = "++";
  let stepVal = 1;

  if (
    new RegExp(`^${varName}\\+\\+$`).test(stepPart) ||
    new RegExp(`^\\+\\+${varName}$`).test(stepPart)
  ) {
    stepOp = "++";
    stepVal = 1;
  } else if (
    new RegExp(`^${varName}--$`).test(stepPart) ||
    new RegExp(`^--${varName}$`).test(stepPart)
  ) {
    stepOp = "--";
    stepVal = 1;
  } else {
    const compMatch = stepPart.match(
      new RegExp(`^${varName}\\s*(\\+=|-=)\\s*(\\d+)$`)
    );
    if (compMatch) {
      stepOp = compMatch[1] as "+=" | "-=";
      stepVal = parseInt(compMatch[2], 10);
    } else {
      const explicitMatch = stepPart.match(
        new RegExp(`^${varName}\\s*=\\s*${varName}\\s*([+-])\s*(\\d+)$`)
      );
      if (explicitMatch) {
        stepOp = explicitMatch[1] === "+" ? "+=" : "-=";
        stepVal = parseInt(explicitMatch[2], 10);
      } else {
        throw new Error(
          `Некоректний крок циклу: «${stepPart}». Приклад: ${varName}++ або ${varName} += 1`
        );
      }
    }
  }

  return { varName, initVal, condOp, limitVal, stepOp, stepVal };
}

function checkLoopCondition(
  val: number,
  op: ForLoopConfig["condOp"],
  limit: number
): boolean {
  switch (op) {
    case "<=":
      return val <= limit;
    case "<":
      return val < limit;
    case ">=":
      return val >= limit;
    case ">":
      return val > limit;
    case "==":
      return val === limit;
    case "!=":
      return val !== limit;
  }
}

function nextLoopVal(
  val: number,
  op: ForLoopConfig["stepOp"],
  stepVal: number
): number {
  switch (op) {
    case "++":
      return val + 1;
    case "--":
      return val - 1;
    case "+=":
      return val + stepVal;
    case "-=":
      return val - stepVal;
  }
}

const MAX_LOOP_ITERATIONS = 50;

/**
 * Asynchronous parser: handles loops, functions, and switch statements with non-blocking step delays
 */
export async function interpretScriptAsync(
  rawCode: string,
  tv: VirtualTV,
  options?: InterpreterOptions
): Promise<ParseResult> {
  const cleaned = stripComments(rawCode);
  if (!cleaned) {
    return { success: true };
  }

  const ctx: ExecutionContext = {
    numScope: {},
    strScope: {},
    functions: {},
    registeredServices: {},
    commandRegistry: {},
  };

  try {
    let remaining = cleaned;

    while (remaining.trim().length > 0) {
      remaining = remaining.trim();

      // 1. Function declaration: void FuncName() { ... } or func FuncName() { ... }
      const funcMatch = remaining.match(/^(?:void|func)\s+([a-zA-Z_]\w*)\s*\(\s*\)\s*\{([^}]*)\}/i);
      if (funcMatch) {
        const fullMatch = funcMatch[0];
        const funcName = funcMatch[1];
        const funcBody = funcMatch[2];
        ctx.functions[funcName] = funcBody;
        remaining = remaining.slice(fullMatch.length).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }

      // 2. Switch statement: switch (button) { ... } or switch button { ... }
      const switchHeader = remaining.match(/^switch\s*(?:\(([^)]+)\)|([^{\s]+))\s*\{/i);
      if (switchHeader) {
        const braceResult = extractBalancedBraces(remaining, switchHeader[0].length - 1);
        if (braceResult) {
          const switchExpr = (switchHeader[1] || switchHeader[2]).trim();
          const switchBody = braceResult.body;

          let switchVal = switchExpr.replace(/^["']|["']$/g, "");
          if (switchExpr in ctx.strScope) {
            switchVal = ctx.strScope[switchExpr];
          }

          // Parse case and default sections
          const caseRegex = /(?:case\s+([^:]+):|default\s*:)([\s\S]*?)(?=(?:case\s+[^:]+:|default\s*:|$))/gi;
          let matchedBlock: string | null = null;
          let defaultBlock: string | null = null;

          let cMatch: RegExpExecArray | null;
          while ((cMatch = caseRegex.exec(switchBody)) !== null) {
            const caseLabel = cMatch[1] ? cMatch[1].trim() : null;
            const caseCode = cMatch[2];

            if (caseLabel !== null) {
              const expectedVal = caseLabel.replace(/^["']|["']$/g, "").trim();
              if (expectedVal.toLowerCase() === switchVal.toLowerCase()) {
                matchedBlock = caseCode;
                break;
              }
            } else {
              defaultBlock = caseCode;
            }
          }

          const blockToRun = matchedBlock !== null ? matchedBlock : defaultBlock;
          if (blockToRun) {
            executeBlock(blockToRun, tv, ctx);
          }

          remaining = remaining.slice(braceResult.endIdx + 1).trim();
          if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
          continue;
        }
      }

      // 3. For-loop: for (int i = 1; i <= 4; i++) { ... } or for i := 1; i <= 4; i++ { ... }
      const forParenMatch = remaining.match(/^for\s*\(([^)]+)\)\s*\{([^}]*)\}/i);
      const forNoParenMatch = remaining.match(
        /^for\s+([^;{]+;[^;{]+;[^{]+)\s*\{([^}]*)\}/i
      );

      const forMatch = forParenMatch || forNoParenMatch;
      if (forMatch) {
        const fullMatch = forMatch[0];
        const headerStr = forMatch[1];
        const bodyStr = forMatch[2];

        const cfg = parseForHeader(headerStr);
        let curVal = cfg.initVal;
        let iterCount = 0;

        while (
          checkLoopCondition(curVal, cfg.condOp, cfg.limitVal) &&
          iterCount < MAX_LOOP_ITERATIONS
        ) {
          iterCount++;
          const iterCtx: ExecutionContext = {
            ...ctx,
            numScope: { ...ctx.numScope, [cfg.varName]: curVal },
          };
          executeBlock(bodyStr, tv, iterCtx);

          // Trigger live snapshot callback for TV rendering
          if (options?.onStepMutation) {
            options.onStepMutation(tv.getSnapshot());
          }

          // Non-blocking step pause (e.g. 300ms)
          if (options?.stepDelayMs && options.stepDelayMs > 0) {
            await new Promise((resolve) =>
              setTimeout(resolve, options.stepDelayMs)
            );
          }

          curVal = nextLoopVal(curVal, cfg.stepOp, cfg.stepVal);
        }

        if (iterCount >= MAX_LOOP_ITERATIONS) {
          throw new Error(
            `Перевищено ліміт ітерацій циклу (${MAX_LOOP_ITERATIONS}). Перевірте умову виходу з циклу.`
          );
        }

        remaining = remaining.slice(fullMatch.length).trim();
        if (remaining.startsWith(";")) {
          remaining = remaining.slice(1).trim();
        }
        continue;
      }

      // 4. If statement (C# with () or Go without ())
      const ifRegex =
        /^if\s*(?:\(([^)]+)\)|([^{\s]+(?:[^{]*?[^\\s{])?))\s*\{([^}]*)\}(?:\s*else\s*\{([^}]*)\})?/i;
      const ifMatch = remaining.match(ifRegex);

      if (ifMatch) {
        const fullMatch = ifMatch[0];
        const conditionStr = ifMatch[1] || ifMatch[2];
        const thenBlock = ifMatch[3];
        const elseBlock = ifMatch[4] || "";

        const condResult = evaluateCondition(conditionStr, tv, ctx.numScope);
        if (condResult) {
          executeBlock(thenBlock, tv, ctx);
        } else if (elseBlock) {
          executeBlock(elseBlock, tv, ctx);
        }

        remaining = remaining.slice(fullMatch.length).trim();
        if (remaining.startsWith(";")) {
          remaining = remaining.slice(1).trim();
        }
        continue;
      }

      // 5. String variable declaration / assignment
      const strVarMatch = remaining.match(/^(?:(?:string|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*["']([^"']*)["']/i);
      if (strVarMatch) {
        const fullMatch = strVarMatch[0];
        ctx.strScope[strVarMatch[1]] = strVarMatch[2];
        remaining = remaining.slice(fullMatch.length).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }

      // 5.5 Command / struct instantiation: command := CalcCommand{} or IRemoteCommand command = new CalcCommand()
      const cmdMatch = remaining.match(/^(?:(?:IRemoteCommand|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*(?:new\s+)?([a-zA-Z_]\w*)(?:\(\s*\)|\{\s*\})/i);
      if (cmdMatch) {
        ctx.strScope[cmdMatch[1]] = cmdMatch[2];
        remaining = remaining.slice(cmdMatch[0].length).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }

      // 5.6 DI Container registration (C# & Go)
      const diMatch = remaining.match(
        /^(?:services\.(?:AddTransient|AddSingleton|AddScoped)<([a-zA-Z_]\w*),\s*([a-zA-Z_]\w*)>\s*\(\s*\)|container\.Register\s*\(\s*["']([^"']+)["']\s*,\s*(?:New([a-zA-Z_]\w*)\(\)|([a-zA-Z_]\w*)\s*\{\s*\})\s*\))/i
      );
      if (diMatch) {
        executeStatement(diMatch[0], tv, ctx);
        remaining = remaining.slice(diMatch[0].length).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }

      // 5.7 Command Registry matching (C# & Go)
      const regMatch = remaining.match(
        /^(?:(?:(?:var|Dictionary<[^>]+>)\s+)?[a-zA-Z_]\w*\s*(?::=|=)\s*(?:new\s+Dictionary<[^>]+>\s*\(\s*\)|make\s*\(\s*map\[string\][a-zA-Z_]\w*\s*\))|[a-zA-Z_]\w*\s*\[\s*["']?[^\]]+["']?\s*\]\s*(?::=|=)\s*(?:new\s+)?[a-zA-Z_]\w*(?:\(\s*\)|\{\s*\})?|[a-zA-Z_]\w*\s*\[\s*["']?[^\]]+["']?\s*\]\s*\.\s*Execute\s*\(\s*\))/i
      );
      if (regMatch) {
        executeStatement(regMatch[0], tv, ctx);
        remaining = remaining.slice(regMatch[0].length).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }

      // 6. Regular statement
      const stmtMatch = remaining.match(/^[^;{}\n]+/);
      if (stmtMatch) {
        const stmt = stmtMatch[0].trim();
        executeStatement(stmt, tv, ctx);
        remaining = remaining.slice(stmtMatch[0].length).trim();
        if (remaining.startsWith(";")) {
          remaining = remaining.slice(1).trim();
        }
        continue;
      }

      throw new Error(`Неочікуваний символ поблизу: «${remaining.slice(0, 20)}»`);
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Synchronous parser wrapper for fast evaluations and unit tests
 */
export function interpretScript(rawCode: string, tv: VirtualTV): ParseResult {
  const cleaned = stripComments(rawCode);
  if (!cleaned) {
    return { success: true };
  }

  const ctx: ExecutionContext = {
    numScope: {},
    strScope: {},
    functions: {},
    registeredServices: {},
    commandRegistry: {},
  };

  try {
    let remaining = cleaned;

    while (remaining.trim().length > 0) {
      remaining = remaining.trim();

      // 1. Function declaration
      const funcMatch = remaining.match(/^(?:void|func)\s+([a-zA-Z_]\w*)\s*\(\s*\)\s*\{([^}]*)\}/i);
      if (funcMatch) {
        const fullMatch = funcMatch[0];
        ctx.functions[funcMatch[1]] = funcMatch[2];
        remaining = remaining.slice(fullMatch.length).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }

      // 2. Switch statement
      const switchHeader = remaining.match(/^switch\s*(?:\(([^)]+)\)|([^{\s]+))\s*\{/i);
      if (switchHeader) {
        const braceResult = extractBalancedBraces(remaining, switchHeader[0].length - 1);
        if (braceResult) {
          const switchExpr = (switchHeader[1] || switchHeader[2]).trim();
          const switchBody = braceResult.body;

          let switchVal = switchExpr.replace(/^["']|["']$/g, "");
          if (switchExpr in ctx.strScope) {
            switchVal = ctx.strScope[switchExpr];
          }

          const caseRegex = /(?:case\s+([^:]+):|default\s*:)([\s\S]*?)(?=(?:case\s+[^:]+:|default\s*:|$))/gi;
          let matchedBlock: string | null = null;
          let defaultBlock: string | null = null;

          let cMatch: RegExpExecArray | null;
          while ((cMatch = caseRegex.exec(switchBody)) !== null) {
            const caseLabel = cMatch[1] ? cMatch[1].trim() : null;
            const caseCode = cMatch[2];

            if (caseLabel !== null) {
              const expectedVal = caseLabel.replace(/^["']|["']$/g, "").trim();
              if (expectedVal.toLowerCase() === switchVal.toLowerCase()) {
                matchedBlock = caseCode;
                break;
              }
            } else {
              defaultBlock = caseCode;
            }
          }

          const blockToRun = matchedBlock !== null ? matchedBlock : defaultBlock;
          if (blockToRun) {
            executeBlock(blockToRun, tv, ctx);
          }

          remaining = remaining.slice(braceResult.endIdx + 1).trim();
          if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
          continue;
        }
      }

      // 3. For-loop
      const forParenMatch = remaining.match(/^for\s*\(([^)]+)\)\s*\{([^}]*)\}/i);
      const forNoParenMatch = remaining.match(
        /^for\s+([^;{]+;[^;{]+;[^{]+)\s*\{([^}]*)\}/i
      );

      const forMatch = forParenMatch || forNoParenMatch;
      if (forMatch) {
        const fullMatch = forMatch[0];
        const headerStr = forMatch[1];
        const bodyStr = forMatch[2];

        const cfg = parseForHeader(headerStr);
        let curVal = cfg.initVal;
        let iterCount = 0;

        while (
          checkLoopCondition(curVal, cfg.condOp, cfg.limitVal) &&
          iterCount < MAX_LOOP_ITERATIONS
        ) {
          iterCount++;
          const iterCtx: ExecutionContext = {
            ...ctx,
            numScope: { ...ctx.numScope, [cfg.varName]: curVal },
          };
          executeBlock(bodyStr, tv, iterCtx);
          curVal = nextLoopVal(curVal, cfg.stepOp, cfg.stepVal);
        }

        remaining = remaining.slice(fullMatch.length).trim();
        if (remaining.startsWith(";")) {
          remaining = remaining.slice(1).trim();
        }
        continue;
      }

      // 4. If statement
      const ifRegex =
        /^if\s*(?:\(([^)]+)\)|([^{\s]+(?:[^{]*?[^\\s{])?))\s*\{([^}]*)\}(?:\s*else\s*\{([^}]*)\})?/i;
      const ifMatch = remaining.match(ifRegex);

      if (ifMatch) {
        const fullMatch = ifMatch[0];
        const conditionStr = ifMatch[1] || ifMatch[2];
        const thenBlock = ifMatch[3];
        const elseBlock = ifMatch[4] || "";

        const condResult = evaluateCondition(conditionStr, tv, ctx.numScope);
        if (condResult) {
          executeBlock(thenBlock, tv, ctx);
        } else if (elseBlock) {
          executeBlock(elseBlock, tv, ctx);
        }

        remaining = remaining.slice(fullMatch.length).trim();
        if (remaining.startsWith(";")) {
          remaining = remaining.slice(1).trim();
        }
        continue;
      }

      // 5. String variable declaration
      const strVarMatch = remaining.match(/^(?:(?:string|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*["']([^"']*)["']/i);
      if (strVarMatch) {
        const fullMatch = strVarMatch[0];
        ctx.strScope[strVarMatch[1]] = strVarMatch[2];
        remaining = remaining.slice(fullMatch.length).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }

      // 5.5 Command / struct instantiation: command := CalcCommand{} or IRemoteCommand command = new CalcCommand()
      const cmdMatch = remaining.match(/^(?:(?:IRemoteCommand|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*(?:new\s+)?([a-zA-Z_]\w*)(?:\(\s*\)|\{\s*\})/i);
      if (cmdMatch) {
        ctx.strScope[cmdMatch[1]] = cmdMatch[2];
        remaining = remaining.slice(cmdMatch[0].length).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }

      // 5.6 DI Container registration (C# & Go)
      const diMatch = remaining.match(
        /^(?:services\.(?:AddTransient|AddSingleton|AddScoped)<([a-zA-Z_]\w*),\s*([a-zA-Z_]\w*)>\s*\(\s*\)|container\.Register\s*\(\s*["']([^"']+)["']\s*,\s*(?:New([a-zA-Z_]\w*)\(\)|([a-zA-Z_]\w*)\s*\{\s*\})\s*\))/i
      );
      if (diMatch) {
        executeStatement(diMatch[0], tv, ctx);
        remaining = remaining.slice(diMatch[0].length).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }

      // 5.7 Command Registry matching (C# & Go)
      const regMatch = remaining.match(
        /^(?:(?:(?:var|Dictionary<[^>]+>)\s+)?[a-zA-Z_]\w*\s*(?::=|=)\s*(?:new\s+Dictionary<[^>]+>\s*\(\s*\)|make\s*\(\s*map\[string\][a-zA-Z_]\w*\s*\))|[a-zA-Z_]\w*\s*\[\s*["']?[^\]]+["']?\s*\]\s*(?::=|=)\s*(?:new\s+)?[a-zA-Z_]\w*(?:\(\s*\)|\{\s*\})?|[a-zA-Z_]\w*\s*\[\s*["']?[^\]]+["']?\s*\]\s*\.\s*Execute\s*\(\s*\))/i
      );
      if (regMatch) {
        executeStatement(regMatch[0], tv, ctx);
        remaining = remaining.slice(regMatch[0].length).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }

      // 6. Regular statement
      const stmtMatch = remaining.match(/^[^;{}\n]+/);
      if (stmtMatch) {
        const stmt = stmtMatch[0].trim();
        executeStatement(stmt, tv, ctx);
        remaining = remaining.slice(stmtMatch[0].length).trim();
        if (remaining.startsWith(";")) {
          remaining = remaining.slice(1).trim();
        }
        continue;
      }

      throw new Error(`Неочікуваний символ поблизу: «${remaining.slice(0, 20)}»`);
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}
