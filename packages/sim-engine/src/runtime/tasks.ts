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
    simpleExplanationKey: "playground.task1Simple",
    careerImpactKey: "playground.task1Career",
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
    simpleExplanationKey: "playground.task2Simple",
    careerImpactKey: "playground.task2Career",
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
    simpleExplanationKey: "playground.task3Simple",
    careerImpactKey: "playground.task3Career",
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
    simpleExplanationKey: "playground.task4Simple",
    careerImpactKey: "playground.task4Career",
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
    simpleExplanationKey: "playground.task5Simple",
    careerImpactKey: "playground.task5Career",
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
  {
    id: "task-function-encapsulation",
    order: 6,
    titleKey: "playground.task6Title",
    conceptKey: "playground.task6Concept",
    descKey: "playground.task6Desc",
    hintKey: "playground.task6Hint",
    successKey: "playground.task6Success",
    simpleExplanationKey: "playground.task6Simple",
    careerImpactKey: "playground.task6Career",
    initialCode: {
      csharp: `// Оголосіть функцію Mute() і викличте її
void Mute() {
    tv.Volume = 0;
}

Mute();
`,
      go: `// Оголосіть функцію Mute() і викличте її
func Mute() {
    tv.Volume = 0
}

Mute()
`,
    },
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      if (after.volume === 0 && code && /Mute\s*\(\s*\)/i.test(code)) {
        return { passed: true, messageKey: "playground.task6Success" };
      }
      if (code) {
        const testRes = executeTvScript(code, { isOn: true, channel: 1, volume: 50 });
        if (testRes.success && testRes.newState.volume === 0) {
          return { passed: true, messageKey: "playground.task6Success" };
        }
      }
      return { passed: false, messageKey: "playground.task6Failed" };
    },
  },
  {
    id: "task-antipattern-god-object",
    order: 7,
    titleKey: "playground.task7Title",
    conceptKey: "playground.task7Concept",
    descKey: "playground.task7Desc",
    hintKey: "playground.task7Hint",
    successKey: "playground.task7Success",
    simpleExplanationKey: "playground.task7Simple",
    careerImpactKey: "playground.task7Career",
    initialCode: {
      csharp: `// Додайте обробку кнопки "CALC" у цей громіздкий switch
string button = "CALC";

switch (button) {
    case "POWER":
        tv.TogglePower();
        break;
    case "CH_UP":
        tv.Channel++;
        break;
    case "CH_DOWN":
        tv.Channel--;
        break;
    case "VOL_UP":
        tv.Volume += 5;
        break;
    case "MUTE":
        tv.Volume = 0;
        break;
    default:
        break;
}
`,
      go: `// Додайте обробку кнопки "CALC" у цей громіздкий switch
button := "CALC"

switch button {
case "POWER":
    tv.TogglePower()
case "CH_UP":
    tv.Channel++
case "CH_DOWN":
    tv.Channel--
case "VOL_UP":
    tv.Volume += 5
case "MUTE":
    tv.Volume = 0
default:
}
`,
    },
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      if (
        code &&
        /case\s*["']CALC["']/i.test(code) &&
        (after.osdMessage === "CALC_MODE" || after.channel === 1 || /CALC_MODE/i.test(code))
      ) {
        return { passed: true, messageKey: "playground.task7Success" };
      }
      return { passed: false, messageKey: "playground.task7Failed" };
    },
  },
  {
    id: "task-interface-polymorphism",
    order: 8,
    titleKey: "playground.task8Title",
    conceptKey: "playground.task8Concept",
    descKey: "playground.task8Desc",
    hintKey: "playground.task8Hint",
    successKey: "playground.task8Success",
    simpleExplanationKey: "playground.task8Simple",
    careerImpactKey: "playground.task8Career",
    initialCode: {
      csharp: `// Інтерфейс як стандартна розетка: контролер просто викликає Execute()
IRemoteCommand command = new CalcCommand();

command.Execute();
`,
      go: `// Інтерфейс як стандартна розетка: контролер просто викликає Execute()
command := CalcCommand{}

command.Execute()
`,
    },
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      if (
        code &&
        /(?:command|cmd)\.Execute\s*\(\s*\)/i.test(code) &&
        (after.osdMessage === "CALC_MODE" || /Execute/i.test(code))
      ) {
        return { passed: true, messageKey: "playground.task8Success" };
      }
      return { passed: false, messageKey: "playground.task8Failed" };
    },
  },
  {
    id: "task-di-container",
    order: 9,
    titleKey: "playground.task9Title",
    conceptKey: "playground.task9Concept",
    descKey: "playground.task9Desc",
    hintKey: "playground.task9Hint",
    successKey: "playground.task9Success",
    simpleExplanationKey: "playground.task9Simple",
    careerImpactKey: "playground.task9Career",
    initialCode: {
      csharp: `// Реєстрація розетки в DI-контейнері: зв'язуємо контракт з реалізацією
services.AddTransient<IRemoteCommand, CalcCommand>();
`,
      go: `// Реєстрація розетки в DI-контейнері: зв'язуємо контракт з реалізацією
container.Register("calc", NewCalcCommand())
`,
    },
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      const isCsValid =
        code &&
        /services\.(?:AddTransient|AddSingleton|AddScoped)\s*<\s*IRemoteCommand\s*,\s*CalcCommand\s*>\s*\(\s*\)/i.test(
          code
        );
      const isGoValid =
        code &&
        /container\.Register\s*\(\s*["']calc["']\s*,\s*(?:NewCalcCommand\(\)|CalcCommand\{\})\s*\)/i.test(
          code
        );
      if ((isCsValid || isGoValid) && after.osdMessage === "CALC_MODE") {
        return { passed: true, messageKey: "playground.task9Success" };
      }
      return { passed: false, messageKey: "playground.task9Failed" };
    },
  },
];
