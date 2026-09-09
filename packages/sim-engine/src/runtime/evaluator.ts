/**
 * @file packages/sim-engine/src/runtime/evaluator.ts
 * @description Execution engine that runs scripts against VirtualTV and returns diagnostic results
 */

import { VirtualTV } from "./tvContext";
import { interpretScript, interpretScriptAsync } from "./parser";
import type { VirtualTvState, RuntimeResult } from "./types";

/**
 * Asynchronously execute a TV script with step-by-step intermediate callbacks
 */
export async function executeTvScriptAsync(
  code: string,
  currentState: VirtualTvState,
  onIntermediateUpdate?: (snapshot: VirtualTvState) => void,
  stepDelayMs = 300
): Promise<RuntimeResult> {
  const tv = new VirtualTV(currentState);

  const parseResult = await interpretScriptAsync(code, tv, {
    onStepMutation: onIntermediateUpdate,
    stepDelayMs,
  });

  if (!parseResult.success) {
    return {
      success: false,
      newState: tv.getSnapshot(),
      mutationsCount: tv.getMutationsCount(),
      logs: [
        ...tv.getLogs(),
        { type: "error", message: parseResult.error || "Помилка виконання коду" },
      ],
      error: parseResult.error,
    };
  }

  const logs = tv.getLogs();
  if (logs.length === 0) {
    logs.push({
      type: "info",
      message: "Код виконано без змін стану. Додайте інструкцію (наприклад, tv.Channel++ або tv.IsOn = true)",
    });
  }

  return {
    success: true,
    newState: tv.getSnapshot(),
    mutationsCount: tv.getMutationsCount(),
    logs,
  };
}

/**
 * Synchronous TV script execution for immediate evaluation and testing
 */
export function executeTvScript(
  code: string,
  currentState: VirtualTvState
): RuntimeResult {
  const tv = new VirtualTV(currentState);

  const parseResult = interpretScript(code, tv);

  if (!parseResult.success) {
    return {
      success: false,
      newState: tv.getSnapshot(),
      mutationsCount: tv.getMutationsCount(),
      logs: [
        ...tv.getLogs(),
        { type: "error", message: parseResult.error || "Помилка виконання коду" },
      ],
      error: parseResult.error,
    };
  }

  const logs = tv.getLogs();
  if (logs.length === 0) {
    logs.push({
      type: "info",
      message: "Код виконано без змін стану. Додайте інструкцію (наприклад, tv.Channel++ або tv.IsOn = true)",
    });
  }

  return {
    success: true,
    newState: tv.getSnapshot(),
    mutationsCount: tv.getMutationsCount(),
    logs,
  };
}
