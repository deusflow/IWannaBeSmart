/**
 * @file packages/sim-engine/src/runtime/tasks.ts
 * @description Interactive coding tasks for beginner programming in C# and Go
 */

import type { CodingTask } from "./types";

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
];
