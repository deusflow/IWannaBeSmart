/**
 * @file packages/sim-engine/src/runtime/tasks.ts
 * @description Interactive coding tasks for beginner programming in C# and Go
 */

import type { CodingTask } from "./types";
import { executeTvScript } from "./evaluator";

export const CODING_TASKS: CodingTask[] = [
  {
    id: "task-1-assignment",
    order: 1,
    titleKey: "playground.task1Title",
    conceptKey: "playground.task1Concept",
    descKey: "playground.task1Desc",
    hintKey: "playground.task1Hint",
    successKey: "playground.task1Success",
    initialCode: {
      csharp: "// Увімкніть живлення телевізора\ntv.IsOn = true;\n",
      go: "// Увімкніть живлення телевізора\ntv.IsOn = true\n",
    },
    validate: (_before, after, result) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      if (after.isOn) {
        return { passed: true, messageKey: "playground.task1Success" };
      }
      return { passed: false, messageKey: "playground.task1NotPowered" };
    },
  },
  {
    id: "task-2-branching",
    order: 2,
    titleKey: "playground.task2Title",
    conceptKey: "playground.task2Concept",
    descKey: "playground.task2Desc",
    hintKey: "playground.task2Hint",
    successKey: "playground.task2Success",
    initialCode: {
      csharp: `// Перемикач живлення через if / else
if (tv.IsOn) {
    tv.IsOn = false;
} else {
    tv.IsOn = true;
}
`,
      go: `// Перемикач живлення через if / else
if tv.IsOn {
    tv.IsOn = false
} else {
    tv.IsOn = true
}
`,
    },
    validate: (before, after, result) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      if (after.isOn !== before.isOn || result.mutationsCount > 0) {
        return { passed: true, messageKey: "playground.task2Success" };
      }
      return { passed: false, messageKey: "playground.task2NoToggle" };
    },
  },
  {
    id: "task-variable-mutation",
    order: 3,
    titleKey: "playground.task3Title",
    conceptKey: "playground.task3Concept",
    descKey: "playground.task3Desc",
    hintKey: "playground.task3Hint",
    successKey: "playground.task3Success",
    initialCode: {
      csharp: `// Збільшіть номер поточного каналу на 1 (tv.Channel++ або tv.Channel += 1)
tv.Channel++;
`,
      go: `// Збільшіть номер поточного каналу на 1 (tv.Channel++ або tv.Channel += 1)
tv.Channel++
`,
    },
    validate: (before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      // Check physical increment on current TV
      if (after.channel === before.channel + 1 || (after.channel > before.channel && result.mutationsCount > 0)) {
        return { passed: true, messageKey: "playground.task3Success" };
      }
      // Verify against standard reference test state
      if (code) {
        const testRes = executeTvScript(code, { isOn: true, channel: 1, volume: 20 });
        if (testRes.success && testRes.newState.channel === 2) {
          return { passed: true, messageKey: "playground.task3Success" };
        }
      }
      return { passed: false, messageKey: "playground.task3NoIncrement" };
    },
  },
  {
    id: "task-boundary-guard",
    order: 4,
    titleKey: "playground.task4Title",
    conceptKey: "playground.task4Concept",
    descKey: "playground.task4Desc",
    hintKey: "playground.task4Hint",
    successKey: "playground.task4Success",
    initialCode: {
      csharp: `// Якщо номер каналу більший за 4 — скиньте його на 1
if (tv.Channel > 4) {
    tv.Channel = 1;
}
`,
      go: `// Якщо номер каналу більший за 4 — скиньте його на 1
if tv.Channel > 4 {
    tv.Channel = 1
}
`,
    },
    validate: (before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      // If run on an over-limit channel (e.g. channel 5) and reset to 1
      if (before.channel > 4 && after.channel === 1) {
        return { passed: true, messageKey: "playground.task4Success" };
      }
      // Test the Guard Clause behavior against edge cases
      if (code) {
        const testOver = executeTvScript(code, { isOn: true, channel: 5, volume: 20 });
        const testNormal = executeTvScript(code, { isOn: true, channel: 2, volume: 20 });
        if (
          testOver.success &&
          testOver.newState.channel === 1 &&
          testNormal.success &&
          testNormal.newState.channel === 2
        ) {
          return { passed: true, messageKey: "playground.task4Success" };
        }
      }
      return { passed: false, messageKey: "playground.task4GuardFailed" };
    },
  },
  {
    id: "task-for-loop",
    order: 5,
    titleKey: "playground.task5Title",
    conceptKey: "playground.task5Concept",
    descKey: "playground.task5Desc",
    hintKey: "playground.task5Hint",
    successKey: "playground.task5Success",
    initialCode: {
      csharp: `// Цикл автопошуку по каналах від 1 до 4
for (int i = 1; i <= 4; i++) {
    tv.Channel = i;
}
`,
      go: `// Цикл автопошуку по каналах від 1 до 4
for i := 1; i <= 4; i++ {
    tv.Channel = i
}
`,
    },
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      // Must have traversed channels up to 4
      if (after.channel === 4 && result.mutationsCount >= 3) {
        return { passed: true, messageKey: "playground.task5Success" };
      }
      if (code && /for\s/i.test(code) && after.channel === 4) {
        return { passed: true, messageKey: "playground.task5Success" };
      }
      return { passed: false, messageKey: "playground.task5LoopFailed" };
    },
  },
];
