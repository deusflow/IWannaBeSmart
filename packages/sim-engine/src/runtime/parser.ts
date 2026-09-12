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
  instanceScope: Record<string, boolean>;
  nullScope: Record<string, boolean>;
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
 * Resolve numeric literal, binary arithmetic expression, or local variable from scope
 */
function resolveNumValue(expr: string, scope: Record<string, number>, tv?: VirtualTV): number {
  const trimmed = expr.trim();
  if (/^-?\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  if (trimmed in scope) {
    return scope[trimmed];
  }
  if (tv) {
    if (/^tv\s*\.\s*(Channel|channel)$/i.test(trimmed)) return tv.Channel;
    if (/^tv\s*\.\s*(Volume|volume)$/i.test(trimmed)) return tv.Volume;
    if (/^tv\s*\.\s*(Brightness|brightness)$/i.test(trimmed)) return tv.Brightness;
    if (/^tv\s*\.\s*(GetVolume|getVolume)\s*\(\s*\)$/i.test(trimmed)) return tv.GetVolume();
    if (/^tv\s*\.\s*(GetBrightness|getBrightness)\s*\(\s*\)$/i.test(trimmed)) return tv.GetBrightness();
  }
  // Check binary expressions: e.g. vol + 10, vol - 15, 5 + 3
  const binMatch = trimmed.match(/^([a-zA-Z_]\w*|-?\d+)\s*([+-])\s*([a-zA-Z_]\w*|-?\d+)$/);
  if (binMatch) {
    const left = resolveNumValue(binMatch[1], scope, tv);
    const op = binMatch[2];
    const right = resolveNumValue(binMatch[3], scope, tv);
    return op === "+" ? left + right : left - right;
  }
  throw new Error(`Невідома змінна чи число: «${trimmed}»`);
}

/**
 * Evaluate a boolean condition on VirtualTV or local scope
 */
function evaluateCondition(
  condStr: string,
  tv: VirtualTV,
  scope: Record<string, number> = {},
  ctx?: ExecutionContext
): boolean {
  const c = condStr.trim();

  // Null inequality: e.g. broken != null or broken != nil
  const nullNeqMatch = c.match(/^([a-zA-Z_]\w*)\s*!=\s*(null|nil)$/i);
  if (nullNeqMatch) {
    const varName = nullNeqMatch[1];
    const isNull = Boolean(ctx?.nullScope && ctx.nullScope[varName]);
    if (isNull) {
      // Null guard was executed and safely prevented execution
      tv.triggerSafeGuard();
      return false;
    }
    return true;
  }

  // Null equality: e.g. broken == null or broken == nil
  const nullEqMatch = c.match(/^([a-zA-Z_]\w*)\s*==\s*(null|nil)$/i);
  if (nullEqMatch) {
    const varName = nullEqMatch[1];
    return Boolean(ctx?.nullScope && ctx.nullScope[varName]);
  }

  // Negation: !tv.IsOn or !tv.isOn
  if (/^!\s*tv\s*\.\s*(IsOn|isOn)$/i.test(c)) {
    return !tv.IsOn;
  }

  // Direct boolean: tv.IsOn or tv.isOn
  if (/^tv\s*\.\s*(IsOn|isOn)$/i.test(c)) {
    return tv.IsOn;
  }

  // Equality: tv.IsOn == true or tv.IsOn == false
  const eqMatch = c.match(/^tv\s*\.\s*(IsOn|isOn)\s*==\s*(true|false)$/i);
  if (eqMatch) {
    const expected = eqMatch[2].toLowerCase() === "true";
    return tv.IsOn === expected;
  }

  // Inequality: tv.IsOn != true or tv.IsOn != false
  const neqMatch = c.match(/^tv\s*\.\s*(IsOn|isOn)\s*!=\s*(true|false)$/i);
  if (neqMatch) {
    const notExpected = neqMatch[2].toLowerCase() === "true";
    return tv.IsOn !== notExpected;
  }

  // Number comparison for Channel, Volume, or Brightness (e.g. tv.Channel > 4, tv.Volume <= 100, tv.Brightness <= 100)
  const numMatch = c.match(
    /^tv\s*\.\s*(Channel|Volume|Brightness|channel|volume|brightness)\s*(==|!=|>|<|>=|<=)\s*([a-zA-Z_]\w*|-?\d+)$/i
  );
  if (numMatch) {
    const propName = numMatch[1].toLowerCase();
    const prop =
      propName === "channel"
        ? tv.Channel
        : propName === "volume"
        ? tv.Volume
        : tv.Brightness;
    const op = numMatch[2];
    const val = resolveNumValue(numMatch[3], scope, tv);
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

  // Inverted comparison: e.g. 4 < tv.Channel
  const invNumMatch = c.match(
    /^([a-zA-Z_]\w*|-?\d+)\s*(==|!=|>|<|>=|<=)\s*tv\s*\.\s*(Channel|Volume|Brightness|channel|volume|brightness)$/i
  );
  if (invNumMatch) {
    const val = resolveNumValue(invNumMatch[1], scope, tv);
    const op = invNumMatch[2];
    const propName = invNumMatch[3].toLowerCase();
    const prop =
      propName === "channel"
        ? tv.Channel
        : propName === "volume"
        ? tv.Volume
        : tv.Brightness;
    switch (op) {
      case "==":
        return val === prop;
      case "!=":
        return val !== prop;
      case ">":
        return val > prop;
      case "<":
        return val < prop;
      case ">=":
        return val >= prop;
      case "<=":
        return val <= prop;
    }
  }

  // Generic variable / expression comparison: e.g. requestedBrightness <= 100, ch <= 5
  const genNumMatch = c.match(
    /^([a-zA-Z_]\w*|-?\d+)\s*(==|!=|>|<|>=|<=)\s*([a-zA-Z_]\w*|-?\d+)$/i
  );
  if (genNumMatch) {
    const leftVal = resolveNumValue(genNumMatch[1], scope, tv);
    const op = genNumMatch[2];
    const rightVal = resolveNumValue(genNumMatch[3], scope, tv);
    switch (op) {
      case "==":
        return leftVal === rightVal;
      case "!=":
        return leftVal !== rightVal;
      case ">":
        return leftVal > rightVal;
      case "<":
        return leftVal < rightVal;
      case ">=":
        return leftVal >= rightVal;
      case "<=":
        return leftVal <= rightVal;
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

  // 0.1 Class Instantiation (Bridge Task A): TV myTv = new TV(); or var myTv = new TV(); or myTv := TV{} or myTv := &TV{}
  const instMatch = s.match(/^(?:(?:TV|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*(?:new\s+TV\s*\(\s*\)|&?TV\s*\{\s*\})$/i);
  if (instMatch) {
    const varName = instMatch[1];
    ctx.instanceScope[varName] = true;
    delete ctx.nullScope[varName];
    tv.setActiveInstanceName(varName);
    return;
  }

  // 0.2 Null pointer declaration (Bridge Task C): TV broken = null; or var broken = null; or var broken *TV = nil or broken := nil
  const nullDeclMatch = s.match(/^(?:(?:TV|\*TV|var)\s+)?([a-zA-Z_]\w*)(?:\s+\*?TV)?\s*(?::=|=)\s*(?:null|nil|(?:\(\*TV\)\s*\(\s*nil\s*\)))$/i);
  if (nullDeclMatch) {
    const varName = nullDeclMatch[1];
    ctx.nullScope[varName] = true;
    delete ctx.instanceScope[varName];
    return;
  }

  // 0.3 Safe navigation / Elvis operator (Bridge Task C): broken?.PowerOn();
  const safeCallMatch = s.match(/^([a-zA-Z_]\w*)\s*\?\.\s*(PowerOn|powerOn|TogglePower|togglePower|PowerOff|powerOff|SetChannel|setChannel|SetVolume|setVolume)\s*(?:\(\s*([^)]*)\s*\))?$/i);
  if (safeCallMatch) {
    const varName = safeCallMatch[1];
    if (ctx.nullScope[varName]) {
      tv.triggerSafeGuard();
      return;
    }
    const method = safeCallMatch[2].toLowerCase();
    if (method === "poweron") tv.PowerOn();
    else if (method === "poweroff") tv.PowerOff();
    else if (method === "togglepower") tv.TogglePower();
    return;
  }

  // 0.4 Query method assignment (Bridge Task B): int vol = tv.GetVolume(); or vol := tv.GetVolume()
  const queryVolMatch = s.match(/^(?:(?:int|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*(tv|[a-zA-Z_]\w*)\s*\.\s*(?:GetVolume|getVolume)\s*\(\s*\)$/i);
  if (queryVolMatch) {
    const varName = queryVolMatch[1];
    const target = queryVolMatch[2];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    ctx.numScope[varName] = tv.GetVolume();
    return;
  }

  // 0.45 General numeric variable assignment: int requestedBrightness = 101; or requestedBrightness = 100;
  const numVarMatch = s.match(/^(?:(?:int|double|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*(.+)$/i);
  if (numVarMatch && !/^new\s+/i.test(numVarMatch[2]) && !/["']/.test(numVarMatch[2]) && !/\b(?:true|false)\b/i.test(numVarMatch[2])) {
    try {
      const val = resolveNumValue(numVarMatch[2], ctx.numScope, tv);
      ctx.numScope[numVarMatch[1]] = val;
      return;
    } catch {
      // not a simple numeric assignment, pass to next handlers
    }
  }

  // 1. Property Assignment: tv.IsOn = true | false | !tv.IsOn (or on local instance)
  const propBoolMatch = s.match(
    /^(tv|[a-zA-Z_]\w*)\s*\.\s*(IsOn|isOn)\s*=\s*(true|false|!\s*(?:tv|[a-zA-Z_]\w*)\s*\.\s*(?:IsOn|isOn))$/i
  );
  if (propBoolMatch) {
    const target = propBoolMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    const rhs = propBoolMatch[3].trim();
    if (/^!\s*(?:tv|[a-zA-Z_]\w*)\s*\.\s*(?:IsOn|isOn)$/i.test(rhs)) {
      tv.IsOn = !tv.IsOn;
    } else {
      tv.IsOn = rhs.toLowerCase() === "true";
    }
    return;
  }

  // 2. Increment/Decrement: tv.Channel++ / tv.Channel-- / tv.Volume++ / tv.Volume-- (or on local instance)
  const incDecMatch = s.match(/^(tv|[a-zA-Z_]\w*)\s*\.\s*(Channel|channel|Volume|volume)\s*(\+\+|--)$/i);
  if (incDecMatch) {
    const target = incDecMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    const prop = incDecMatch[2].toLowerCase();
    const op = incDecMatch[3];
    if (prop === "channel") {
      tv.Channel = op === "++" ? tv.Channel + 1 : tv.Channel - 1;
    } else {
      tv.Volume = op === "++" ? tv.Volume + 1 : tv.Volume - 1;
    }
    return;
  }

  // 3. Compound Assignment: tv.Channel += <val>, tv.Channel -= <val>
  const compChMatch = s.match(/^(tv|[a-zA-Z_]\w*)\s*\.\s*(Channel|channel)\s*(\+=|-=)\s*(.+)$/i);
  if (compChMatch) {
    const target = compChMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    const op = compChMatch[3];
    const val = resolveNumValue(compChMatch[4], ctx.numScope);
    tv.Channel = op === "+=" ? tv.Channel + val : tv.Channel - val;
    return;
  }

  const compVolMatch = s.match(/^(tv|[a-zA-Z_]\w*)\s*\.\s*(Volume|volume)\s*(\+=|-=)\s*(.+)$/i);
  if (compVolMatch) {
    const target = compVolMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    const op = compVolMatch[3];
    const val = resolveNumValue(compVolMatch[4], ctx.numScope);
    tv.Volume = op === "+=" ? tv.Volume + val : tv.Volume - val;
    return;
  }

  // 4. Arithmetic Assignment: tv.Channel = tv.Channel + 1, tv.Volume = tv.Volume + 5
  const arithChMatch = s.match(
    /^(tv|[a-zA-Z_]\w*)\s*\.\s*(Channel|channel)\s*=\s*(?:tv|[a-zA-Z_]\w*)\s*\.\s*(?:Channel|channel)\s*([+-])\s*(.+)$/i
  );
  if (arithChMatch) {
    const target = arithChMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    const op = arithChMatch[3];
    const val = resolveNumValue(arithChMatch[4], ctx.numScope);
    tv.Channel = op === "+" ? tv.Channel + val : tv.Channel - val;
    return;
  }

  const arithVolMatch = s.match(
    /^(tv|[a-zA-Z_]\w*)\s*\.\s*(Volume|volume)\s*=\s*(?:tv|[a-zA-Z_]\w*)\s*\.\s*(?:Volume|volume)\s*([+-])\s*(.+)$/i
  );
  if (arithVolMatch) {
    const target = arithVolMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    const op = arithVolMatch[3];
    const val = resolveNumValue(arithVolMatch[4], ctx.numScope);
    tv.Volume = op === "+" ? tv.Volume + val : tv.Volume - val;
    return;
  }

  // 5. Property Assignment: tv.Channel = <number | scopeVar>
  const propChMatch = s.match(/^(tv|[a-zA-Z_]\w*)\s*\.\s*(Channel|channel)\s*=\s*(.+)$/i);
  if (propChMatch) {
    const target = propChMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    tv.Channel = resolveNumValue(propChMatch[3], ctx.numScope);
    return;
  }

  // 6. Property Assignment: tv.Volume = <number | scopeVar>
  const propVolMatch = s.match(/^(tv|[a-zA-Z_]\w*)\s*\.\s*(Volume|volume)\s*=\s*(.+)$/i);
  if (propVolMatch) {
    const target = propVolMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    tv.Volume = resolveNumValue(propVolMatch[3], ctx.numScope);
    return;
  }

  // 6.5. Property Assignment: tv.Osd = "CALC_MODE" / tv.OSD = "CALC_MODE"
  const propOsdMatch = s.match(/^(tv|[a-zA-Z_]\w*)\s*\.\s*(Osd|OSD|osd)\s*=\s*["']([^"']*)["']$/i);
  if (propOsdMatch) {
    const target = propOsdMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    tv.Osd = propOsdMatch[3];
    return;
  }

  // 7. Method calls: tv.PowerOn(), tv.PowerOff(), tv.TogglePower() (or on local instance)
  const methodMatch = s.match(/^(tv|[a-zA-Z_]\w*)\s*\.\s*(PowerOn|powerOn|PowerOff|powerOff|TogglePower|togglePower)\s*\(\s*\)$/i);
  if (methodMatch) {
    const target = methodMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    const m = methodMatch[2].toLowerCase();
    if (m === "poweron") tv.PowerOn();
    else if (m === "poweroff") tv.PowerOff();
    else if (m === "togglepower") tv.TogglePower();
    return;
  }

  // 8. Parameterized methods: tv.SetChannel(ch), tv.SetVolume(vol) (or on local instance)
  const setChMatch = s.match(/^(tv|[a-zA-Z_]\w*)\s*\.\s*(SetChannel|setChannel)\s*\(\s*(.+)\s*\)$/i);
  if (setChMatch) {
    const target = setChMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    tv.SetChannel(resolveNumValue(setChMatch[3], ctx.numScope));
    return;
  }

  const setVolMatch = s.match(/^(tv|[a-zA-Z_]\w*)\s*\.\s*(SetVolume|setVolume)\s*\(\s*(.+)\s*\)$/i);
  if (setVolMatch) {
    const target = setVolMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    tv.SetVolume(resolveNumValue(setVolMatch[3], ctx.numScope, tv));
    return;
  }

  const setBrightMatch = s.match(/^(tv|[a-zA-Z_]\w*)\s*\.\s*(SetBrightness|setBrightness)\s*\(\s*(.+)\s*\)$/i);
  if (setBrightMatch) {
    const target = setBrightMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    tv.SetBrightness(resolveNumValue(setBrightMatch[3], ctx.numScope, tv));
    return;
  }

  // Property Assignment: tv.Brightness = <val>
  const propBrightMatch = s.match(/^(tv|[a-zA-Z_]\w*)\s*\.\s*(Brightness|brightness)\s*=\s*(.+)$/i);
  if (propBrightMatch) {
    const target = propBrightMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    tv.Brightness = resolveNumValue(propBrightMatch[3], ctx.numScope, tv);
    return;
  }

  const setModeMatch = s.match(/^(tv|[a-zA-Z_]\w*)\s*\.\s*(SetMode|setMode)\s*\(\s*["']([^"']*)["']\s*\)$/i);
  if (setModeMatch) {
    const target = setModeMatch[1];
    if (ctx.nullScope[target]) {
      throw new Error(`NullReferenceException: Object reference not set to an instance of an object. Variable '${target}' is null!`);
    }
    tv.SetMode(setModeMatch[3]);
    return;
  }

  // 8.5 Method: tv.SetLabel("NEWS") or tv.SetLabel(labelVar)
  const setLabelMatch = s.match(
    /^tv\s*\.\s*(SetLabel|setLabel)\s*\(\s*(?:["']([^"']*)["']|([a-zA-Z_]\w*))\s*\)$/i
  );
  if (setLabelMatch) {
    const literalVal = setLabelMatch[2];
    const varVal = setLabelMatch[3];
    const label = literalVal !== undefined ? literalVal : (ctx.strScope[varVal] ?? varVal);
    tv.SetLabel(label);
    return;
  }

  // 8.6 Property Assignment: tv.Label = "NEWS"
  const propLabelMatch = s.match(/^tv\s*\.\s*(Label|label)\s*=\s*(?:["']([^"']*)["']|([a-zA-Z_]\w*))$/i);
  if (propLabelMatch) {
    const literalVal = propLabelMatch[2];
    const varVal = propLabelMatch[3];
    const label = literalVal !== undefined ? literalVal : (ctx.strScope[varVal] ?? varVal);
    tv.SetLabel(label);
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
  const cmdExecMatch = s.match(/^([a-zA-Z_]\w*)\s*\.\s*Execute\s*\(\s*\)$/i);
  if (cmdExecMatch || /^(?:[a-zA-Z_]\w*\s*\.\s*)?Execute\s*\(\s*\)$/i.test(s)) {
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
  const diCsMatch = s.match(/^services\s*\.\s*(?:AddTransient|AddSingleton|AddScoped)\s*<\s*([a-zA-Z_]\w*)\s*,\s*([a-zA-Z_]\w*)\s*>\s*\(\s*\)$/i);
  if (diCsMatch) {
    const iface = diCsMatch[1];
    const impl = diCsMatch[2];
    ctx.registeredServices[iface] = impl;
    tv.Osd = "CALC_MODE";
    tv.setArchWired(true);
    return;
  }

  // Go: container.Register("calc", NewCalcCommand()) or container.Register("calc", CalcCommand{})
  const diGoMatch = s.match(/^container\s*\.\s*Register\s*\(\s*["']([^"']+)["']\s*,\s*(?:New([a-zA-Z_]\w*)\(\)|([a-zA-Z_]\w*)\s*\{\s*\})\s*\)$/i);
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
        new RegExp(`^${varName}\\s*=\\s*${varName}\\s*([+-])\\s*(\\d+)$`)
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
 * Synchronous block interpreter: handles functions, switches, loops, and if/else blocks recursively
 */
function executeBlock(
  blockStr: string,
  tv: VirtualTV,
  ctx: ExecutionContext
): void {
  let remaining = blockStr.trim();

  while (remaining.length > 0) {
    remaining = remaining.trim();
    if (!remaining) break;

    // 0. Skip stray semicolons or newlines
    if (remaining.startsWith(";") || remaining.startsWith("\n")) {
      remaining = remaining.slice(1).trim();
      continue;
    }

    // 1. Function declaration: void FuncName() { ... } or func FuncName() { ... }
    const funcHeader = remaining.match(/^(?:void|func)\s+([a-zA-Z_]\w*)\s*\(\s*\)\s*\{/i);
    if (funcHeader) {
      const braceResult = extractBalancedBraces(remaining, funcHeader[0].length - 1);
      if (braceResult) {
        const funcName = funcHeader[1];
        ctx.functions[funcName] = braceResult.body;
        remaining = remaining.slice(braceResult.endIdx + 1).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }
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
    const forParenHeader = remaining.match(/^for\s*\(([^)]+)\)\s*\{/i);
    const forNoParenHeader = remaining.match(/^for\s+([^;{]+;[^;{]+;[^{]+)\s*\{/i);
    const forHeader = forParenHeader || forNoParenHeader;
    if (forHeader) {
      const braceResult = extractBalancedBraces(remaining, forHeader[0].length - 1);
      if (braceResult) {
        const headerStr = forHeader[1];
        const bodyStr = braceResult.body;

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

        if (iterCount >= MAX_LOOP_ITERATIONS) {
          throw new Error(
            `InfiniteLoopException: Перевищено ліміт ітерацій циклу (${MAX_LOOP_ITERATIONS}). Watchdog Timer спрацював. Перевірте крок та умову виходу з циклу.`
          );
        }

        remaining = remaining.slice(braceResult.endIdx + 1).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }
    }

    // 4. If statement (C# with () or Go without ()) with balanced braces and optional else
    const ifHeader = remaining.match(/^if\s*(?:\(([^)]+)\)|([^{\s]+(?:[^{]*?[^\s{])?))\s*\{/i);
    if (ifHeader) {
      const braceResult = extractBalancedBraces(remaining, ifHeader[0].length - 1);
      if (braceResult) {
        const conditionStr = ifHeader[1] || ifHeader[2];
        const thenBlock = braceResult.body;
        let elseBlock: string | null = null;
        let endIdx = braceResult.endIdx;

        // Check if followed by else
        const afterThen = remaining.slice(endIdx + 1).trim();
        const elseHeader = afterThen.match(/^else\s*\{/i);
        if (elseHeader) {
          const elseBrace = extractBalancedBraces(afterThen, elseHeader[0].length - 1);
          if (elseBrace) {
            elseBlock = elseBrace.body;
            const elseStartInRemaining = remaining.indexOf(afterThen);
            endIdx = elseStartInRemaining + elseBrace.endIdx;
          }
        }

        const condResult = evaluateCondition(conditionStr, tv, ctx.numScope, ctx);
        if (condResult) {
          executeBlock(thenBlock, tv, ctx);
        } else if (elseBlock !== null) {
          executeBlock(elseBlock, tv, ctx);
        }

        remaining = remaining.slice(endIdx + 1).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }
    }

    // 5. String variable declaration / assignment
    const strVarMatch = remaining.match(/^(?:(?:string|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*["']([^"']*)["']/i);
    if (strVarMatch) {
      ctx.strScope[strVarMatch[1]] = strVarMatch[2];
      remaining = remaining.slice(strVarMatch[0].length).trim();
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
      /^(?:services\s*\.\s*(?:AddTransient|AddSingleton|AddScoped)\s*<\s*([a-zA-Z_]\w*)\s*,\s*([a-zA-Z_]\w*)\s*>\s*\(\s*\)|container\s*\.\s*Register\s*\(\s*["']([^"']+)["']\s*,\s*(?:New([a-zA-Z_]\w*)\(\)|([a-zA-Z_]\w*)\s*\{\s*\})\s*\))/i
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
      if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
      continue;
    }

    throw new Error(`Неочікуваний символ поблизу: «${remaining.slice(0, 20)}»`);
  }
}

/**
 * Asynchronous block interpreter: handles step delays and snapshot events
 */
async function executeBlockAsync(
  blockStr: string,
  tv: VirtualTV,
  ctx: ExecutionContext,
  options?: InterpreterOptions
): Promise<void> {
  let remaining = blockStr.trim();

  while (remaining.length > 0) {
    remaining = remaining.trim();
    if (!remaining) break;

    if (remaining.startsWith(";") || remaining.startsWith("\n")) {
      remaining = remaining.slice(1).trim();
      continue;
    }

    // 1. Function declaration
    const funcHeader = remaining.match(/^(?:void|func)\s+([a-zA-Z_]\w*)\s*\(\s*\)\s*\{/i);
    if (funcHeader) {
      const braceResult = extractBalancedBraces(remaining, funcHeader[0].length - 1);
      if (braceResult) {
        ctx.functions[funcHeader[1]] = braceResult.body;
        remaining = remaining.slice(braceResult.endIdx + 1).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }
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
          await executeBlockAsync(blockToRun, tv, ctx, options);
        }

        remaining = remaining.slice(braceResult.endIdx + 1).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }
    }

    // 3. For-loop with live step mutation callback
    const forParenHeader = remaining.match(/^for\s*\(([^)]+)\)\s*\{/i);
    const forNoParenHeader = remaining.match(/^for\s+([^;{]+;[^;{]+;[^{]+)\s*\{/i);
    const forHeader = forParenHeader || forNoParenHeader;
    if (forHeader) {
      const braceResult = extractBalancedBraces(remaining, forHeader[0].length - 1);
      if (braceResult) {
        const headerStr = forHeader[1];
        const bodyStr = braceResult.body;

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
          await executeBlockAsync(bodyStr, tv, iterCtx, options);

          if (options?.onStepMutation) {
            options.onStepMutation(tv.getSnapshot());
          }

          if (options?.stepDelayMs && options.stepDelayMs > 0) {
            await new Promise((resolve) =>
              setTimeout(resolve, options.stepDelayMs)
            );
          }

          curVal = nextLoopVal(curVal, cfg.stepOp, cfg.stepVal);
        }

        if (iterCount >= MAX_LOOP_ITERATIONS) {
          throw new Error(
            `InfiniteLoopException: Перевищено ліміт ітерацій циклу (${MAX_LOOP_ITERATIONS}). Watchdog Timer спрацював. Перевірте крок та умову виходу з циклу.`
          );
        }

        remaining = remaining.slice(braceResult.endIdx + 1).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }
    }

    // 4. If statement with balanced braces and optional else
    const ifHeader = remaining.match(/^if\s*(?:\(([^)]+)\)|([^{\s]+(?:[^{]*?[^\s{])?))\s*\{/i);
    if (ifHeader) {
      const braceResult = extractBalancedBraces(remaining, ifHeader[0].length - 1);
      if (braceResult) {
        const conditionStr = ifHeader[1] || ifHeader[2];
        const thenBlock = braceResult.body;
        let elseBlock: string | null = null;
        let endIdx = braceResult.endIdx;

        const afterThen = remaining.slice(endIdx + 1).trim();
        const elseHeader = afterThen.match(/^else\s*\{/i);
        if (elseHeader) {
          const elseBrace = extractBalancedBraces(afterThen, elseHeader[0].length - 1);
          if (elseBrace) {
            elseBlock = elseBrace.body;
            const elseStartInRemaining = remaining.indexOf(afterThen);
            endIdx = elseStartInRemaining + elseBrace.endIdx;
          }
        }

        const condResult = evaluateCondition(conditionStr, tv, ctx.numScope, ctx);
        if (condResult) {
          await executeBlockAsync(thenBlock, tv, ctx, options);
        } else if (elseBlock !== null) {
          await executeBlockAsync(elseBlock, tv, ctx, options);
        }

        remaining = remaining.slice(endIdx + 1).trim();
        if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
        continue;
      }
    }

    // 5. String variable declaration / assignment
    const strVarMatch = remaining.match(/^(?:(?:string|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*["']([^"']*)["']/i);
    if (strVarMatch) {
      ctx.strScope[strVarMatch[1]] = strVarMatch[2];
      remaining = remaining.slice(strVarMatch[0].length).trim();
      if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
      continue;
    }

    // 5.5 Command / struct instantiation
    const cmdMatch = remaining.match(/^(?:(?:IRemoteCommand|var)\s+)?([a-zA-Z_]\w*)\s*(?::=|=)\s*(?:new\s+)?([a-zA-Z_]\w*)(?:\(\s*\)|\{\s*\})/i);
    if (cmdMatch) {
      ctx.strScope[cmdMatch[1]] = cmdMatch[2];
      remaining = remaining.slice(cmdMatch[0].length).trim();
      if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
      continue;
    }

    // 5.6 DI Container registration
    const diMatch = remaining.match(
      /^(?:services\s*\.\s*(?:AddTransient|AddSingleton|AddScoped)\s*<\s*([a-zA-Z_]\w*)\s*,\s*([a-zA-Z_]\w*)\s*>\s*\(\s*\)|container\s*\.\s*Register\s*\(\s*["']([^"']+)["']\s*,\s*(?:New([a-zA-Z_]\w*)\(\)|([a-zA-Z_]\w*)\s*\{\s*\})\s*\))/i
    );
    if (diMatch) {
      executeStatement(diMatch[0], tv, ctx);
      remaining = remaining.slice(diMatch[0].length).trim();
      if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
      continue;
    }

    // 5.7 Command Registry matching
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
      if (remaining.startsWith(";")) remaining = remaining.slice(1).trim();
      continue;
    }

    throw new Error(`Неочікуваний символ поблизу: «${remaining.slice(0, 20)}»`);
  }
}

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
    instanceScope: {},
    nullScope: {},
  };

  try {
    await executeBlockAsync(cleaned, tv, ctx, options);
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
    instanceScope: {},
    nullScope: {},
  };

  try {
    executeBlock(cleaned, tv, ctx);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}
