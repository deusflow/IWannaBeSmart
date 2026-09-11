/**
 * @file packages/sim-engine/src/runtime/tasks.ts
 * @description Interactive coding tasks for beginner programming in C# and Go with 3-Star Code Gym configuration
 */

import type { CodingTask } from "./types";
import { executeTvScript } from "./evaluator";

export const CODING_TASKS: CodingTask[] = [
  {
    id: "task-0-1-power-on",
    tier: 0,
    order: 1,
    titleKey: "playground.task01Title",
    conceptKey: "playground.task01Concept",
    descKey: "playground.task01Desc",
    hintKey: "playground.task01Hint",
    successKey: "playground.task01Success",
    simpleExplanationKey: "playground.task01Simple",
    engineeringKey: "playground.task01Engineering",
    careerImpactKey: "playground.task01Career",
    initialCode: {
      csharp: "// Подаємо команду увімкнення\ntv.PowerOn();\n",
      go: "// Подаємо команду увімкнення\ntv.PowerOn()\n",
    },
    targetCode: {
      csharp: "tv.PowerOn();",
      go: "tv.PowerOn()",
    },
    clozeTemplate: {
      csharp: "tv.___();",
      go: "tv.___()",
    },
    sprintTimeLimit: 20,
    validate: (_before, after, result) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      if (after.isOn) {
        return { passed: true, messageKey: "playground.task01Success" };
      }
      return { passed: false, messageKey: "playground.task01Hint" };
    },
  },
  {
    id: "task-0-2-types",
    tier: 0,
    order: 2,
    titleKey: "playground.task02Title",
    conceptKey: "playground.task02Concept",
    descKey: "playground.task02Desc",
    hintKey: "playground.task02Hint",
    successKey: "playground.task02Success",
    simpleExplanationKey: "playground.task02Simple",
    engineeringKey: "playground.task02Engineering",
    careerImpactKey: "playground.task02Career",
    initialCode: {
      csharp: '// Встановіть канал 1 цифрою та назву "NEWS" текстом\ntv.SetChannel(1);\ntv.SetLabel("NEWS");\n',
      go: '// Встановіть канал 1 цифрою та назву "NEWS" текстом\ntv.SetChannel(1)\ntv.SetLabel("NEWS")\n',
    },
    targetCode: {
      csharp: 'tv.SetChannel(1);\ntv.SetLabel("NEWS");',
      go: 'tv.SetChannel(1)\ntv.SetLabel("NEWS")',
    },
    clozeTemplate: {
      csharp: 'tv.SetChannel(___);\ntv.SetLabel("___");',
      go: 'tv.SetChannel(___)\ntv.SetLabel("___")',
    },
    sprintTimeLimit: 25,
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      const hasChannel = after.channel === 1;
      const hasLabel =
        after.label === "NEWS" ||
        after.osdMessage === "NEWS" ||
        (code && /SetLabel\s*\(\s*"NEWS"\s*\)/i.test(code));
      if (hasChannel && hasLabel) {
        return { passed: true, messageKey: "playground.task02Success" };
      }
      return { passed: false, messageKey: "playground.task02Hint" };
    },
  },
  {
    id: "task-0-3-sequential",
    tier: 0,
    order: 3,
    titleKey: "playground.task03Title",
    conceptKey: "playground.task03Concept",
    descKey: "playground.task03Desc",
    hintKey: "playground.task03Hint",
    successKey: "playground.task03Success",
    simpleExplanationKey: "playground.task03Simple",
    engineeringKey: "playground.task03Engineering",
    careerImpactKey: "playground.task03Career",
    initialCode: {
      csharp: "// Команди читаються зверху вниз\ntv.PowerOn();\ntv.SetChannel(2);\n",
      go: "// Команди читаються зверху вниз\ntv.PowerOn()\ntv.SetChannel(2)\n",
    },
    targetCode: {
      csharp: "tv.PowerOn();\ntv.SetChannel(2);",
      go: "tv.PowerOn()\ntv.SetChannel(2)",
    },
    clozeTemplate: {
      csharp: "tv.___();\ntv.___(2);",
      go: "tv.___()\ntv.___(2)",
    },
    sprintTimeLimit: 20,
    validate: (_before, after, result) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      if (after.isOn && after.channel === 2) {
        return { passed: true, messageKey: "playground.task03Success" };
      }
      return { passed: false, messageKey: "playground.task03Hint" };
    },
  },
  {
    id: "task-1-assignment",
    tier: 1,
    order: 4,
    titleKey: "playground.task1Title",
    conceptKey: "playground.task1Concept",
    descKey: "playground.task1Desc",
    hintKey: "playground.task1Hint",
    successKey: "playground.task1Success",
    simpleExplanationKey: "playground.task1Simple",
    engineeringKey: "playground.task1Engineering",
    careerImpactKey: "playground.task1Career",
    initialCode: {
      csharp: "// Увімкніть живлення телевізора\ntv.IsOn = true;\n",
      go: "// Увімкніть живлення телевізора\ntv.IsOn = true\n",
    },
    targetCode: {
      csharp: "tv.IsOn = true;",
      go: "tv.IsOn = true",
    },
    clozeTemplate: {
      csharp: "tv.___ = ___;",
      go: "tv.___ = ___",
    },
    sprintTimeLimit: 20,
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
    tier: 1,
    order: 5,
    titleKey: "playground.task2Title",
    conceptKey: "playground.task2Concept",
    descKey: "playground.task2Desc",
    hintKey: "playground.task2Hint",
    successKey: "playground.task2Success",
    simpleExplanationKey: "playground.task2Simple",
    engineeringKey: "playground.task2Engineering",
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
    targetCode: {
      csharp: `if (tv.IsOn) {
    tv.IsOn = false;
} else {
    tv.IsOn = true;
}`,
      go: `if tv.IsOn {
    tv.IsOn = false
} else {
    tv.IsOn = true
}`,
    },
    clozeTemplate: {
      csharp: `if (tv.___) {
    tv.IsOn = ___;
} else {
    tv.IsOn = ___;
}`,
      go: `if tv.___ {
    tv.IsOn = ___
} else {
    tv.IsOn = ___
}`,
    },
    sprintTimeLimit: 30,
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
    tier: 1,
    order: 6,
    titleKey: "playground.task3Title",
    conceptKey: "playground.task3Concept",
    descKey: "playground.task3Desc",
    hintKey: "playground.task3Hint",
    successKey: "playground.task3Success",
    simpleExplanationKey: "playground.task3Simple",
    engineeringKey: "playground.task3Engineering",
    careerImpactKey: "playground.task3Career",
    initialCode: {
      csharp: `// Збільшіть номер поточного каналу на 1 (tv.Channel++ або tv.Channel += 1)
tv.Channel++;
`,
      go: `// Збільшіть номер поточного каналу на 1 (tv.Channel++ або tv.Channel += 1)
tv.Channel++
`,
    },
    targetCode: {
      csharp: "tv.Channel++;",
      go: "tv.Channel++",
    },
    clozeTemplate: {
      csharp: "tv.___++;",
      go: "tv.___++",
    },
    sprintTimeLimit: 20,
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
    tier: 1,
    order: 7,
    titleKey: "playground.task4Title",
    conceptKey: "playground.task4Concept",
    descKey: "playground.task4Desc",
    hintKey: "playground.task4Hint",
    successKey: "playground.task4Success",
    simpleExplanationKey: "playground.task4Simple",
    engineeringKey: "playground.task4Engineering",
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
    targetCode: {
      csharp: `if (tv.Channel > 4) {
    tv.Channel = 1;
}`,
      go: `if tv.Channel > 4 {
    tv.Channel = 1
}`,
    },
    clozeTemplate: {
      csharp: `if (tv.Channel > ___) {
    tv.Channel = ___;
}`,
      go: `if tv.Channel > ___ {
    tv.Channel = ___
}`,
    },
    sprintTimeLimit: 25,
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
    tier: 1,
    order: 8,
    titleKey: "playground.task5Title",
    conceptKey: "playground.task5Concept",
    descKey: "playground.task5Desc",
    hintKey: "playground.task5Hint",
    successKey: "playground.task5Success",
    simpleExplanationKey: "playground.task5Simple",
    engineeringKey: "playground.task5Engineering",
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
    targetCode: {
      csharp: `for (int i = 1; i <= 4; i++) {
    tv.Channel = i;
}`,
      go: `for i := 1; i <= 4; i++ {
    tv.Channel = i
}`,
    },
    clozeTemplate: {
      csharp: `for (int ___ = 1; ___ <= 4; ___++) {
    tv.Channel = ___;
}`,
      go: `for ___ := 1; ___ <= 4; ___++ {
    tv.Channel = ___
}`,
    },
    sprintTimeLimit: 25,
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
    tier: 2,
    order: 9,
    titleKey: "playground.task6Title",
    conceptKey: "playground.task6Concept",
    descKey: "playground.task6Desc",
    hintKey: "playground.task6Hint",
    successKey: "playground.task6Success",
    simpleExplanationKey: "playground.task6Simple",
    engineeringKey: "playground.task6Engineering",
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
    targetCode: {
      csharp: `void Mute() {
    tv.Volume = 0;
}

Mute();`,
      go: `func Mute() {
    tv.Volume = 0
}

Mute()`,
    },
    clozeTemplate: {
      csharp: `void ___() {
    tv.Volume = ___;
}

___();`,
      go: `func ___() {
    tv.Volume = ___
}

___()`,
    },
    sprintTimeLimit: 25,
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
    tier: 2,
    order: 10,
    titleKey: "playground.task7Title",
    conceptKey: "playground.task7Concept",
    descKey: "playground.task7Desc",
    hintKey: "playground.task7Hint",
    successKey: "playground.task7Success",
    simpleExplanationKey: "playground.task7Simple",
    engineeringKey: "playground.task7Engineering",
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
    targetCode: {
      csharp: `string button = "CALC";

switch (button) {
    case "POWER":
        tv.TogglePower();
        break;
    case "CALC":
        tv.SetMode("CALC_MODE");
        break;
}`,
      go: `button := "CALC"

switch button {
case "POWER":
    tv.TogglePower()
case "CALC":
    tv.SetMode("CALC_MODE")
}`,
    },
    clozeTemplate: {
      csharp: `string button = "CALC";

switch (___) {
    case "POWER":
        tv.TogglePower();
        break;
    case "___":
        tv.SetMode("___");
        break;
}`,
      go: `button := "CALC"

switch ___ {
case "POWER":
    tv.TogglePower()
case "___":
    tv.SetMode("___")
}`,
    },
    sprintTimeLimit: 40,
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
    tier: 2,
    order: 11,
    titleKey: "playground.task8Title",
    conceptKey: "playground.task8Concept",
    descKey: "playground.task8Desc",
    hintKey: "playground.task8Hint",
    successKey: "playground.task8Success",
    simpleExplanationKey: "playground.task8Simple",
    engineeringKey: "playground.task8Engineering",
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
    targetCode: {
      csharp: `IRemoteCommand command = new CalcCommand();
command.Execute();`,
      go: `command := CalcCommand{}
command.Execute()`,
    },
    clozeTemplate: {
      csharp: `IRemoteCommand command = new ___();
command.___();`,
      go: `command := ___
command.___()`,
    },
    sprintTimeLimit: 30,
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
    tier: 2,
    order: 12,
    titleKey: "playground.task9Title",
    conceptKey: "playground.task9Concept",
    descKey: "playground.task9Desc",
    hintKey: "playground.task9Hint",
    successKey: "playground.task9Success",
    simpleExplanationKey: "playground.task9Simple",
    engineeringKey: "playground.task9Engineering",
    careerImpactKey: "playground.task9Career",
    initialCode: {
      csharp: `// Реєстрація розетки в DI-контейнері: зв'язуємо контракт з реалізацією
services.AddTransient<IRemoteCommand, CalcCommand>();
`,
      go: `// Реєстрація розетки в DI-контейнері: зв'язуємо контракт з реалізацією
container.Register("calc", NewCalcCommand())
`,
    },
    targetCode: {
      csharp: "services.AddTransient<IRemoteCommand, CalcCommand>();",
      go: 'container.Register("calc", NewCalcCommand())',
    },
    clozeTemplate: {
      csharp: "services.AddTransient<___, ___>();",
      go: 'container.Register("___", ___())',
    },
    sprintTimeLimit: 25,
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
  {
    id: "task-command-registry",
    tier: 2,
    order: 13,
    titleKey: "playground.task10Title",
    conceptKey: "playground.task10Concept",
    descKey: "playground.task10Desc",
    hintKey: "playground.task10Hint",
    successKey: "playground.task10Success",
    simpleExplanationKey: "playground.task10Simple",
    engineeringKey: "playground.task10Engineering",
    careerImpactKey: "playground.task10Career",
    initialCode: {
      csharp: `// Реєстр команд: заміна switch на гнучкий Dictionary
string button = "CALC";
var registry = new Dictionary<string, IRemoteCommand>();
registry["PWR"] = new PowerCommand();
registry["CALC"] = new CalcCommand();

registry[button].Execute();
`,
      go: `// Реєстр команд: заміна switch на гнучку map
button := "CALC"
registry := make(map[string]IRemoteCommand)
registry["PWR"] = PowerCommand{}
registry["CALC"] = CalcCommand{}

registry[button].Execute()
`,
    },
    targetCode: {
      csharp: `string button = "CALC";
var registry = new Dictionary<string, IRemoteCommand>();
registry["CALC"] = new CalcCommand();
registry[button].Execute();`,
      go: `button := "CALC"
registry := make(map[string]IRemoteCommand)
registry["CALC"] = CalcCommand{}
registry[button].Execute()`,
    },
    clozeTemplate: {
      csharp: `string button = "CALC";
var registry = new Dictionary<string, ___>();
registry["CALC"] = new ___();
registry[___].Execute();`,
      go: `button := "CALC"
registry := make(map[string]___)
registry["CALC"] = ___
registry[___].Execute()`,
    },
    sprintTimeLimit: 45,
    validate: (before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      const hasRegistry = code && /registry\s*\[[^\]]+\]\s*\.\s*Execute\s*\(\s*\)/i.test(code);
      const isCs = code && /Dictionary<string,\s*IRemoteCommand>/i.test(code);
      const isGo = code && /make\s*\(\s*map\[string\]IRemoteCommand\s*\)/i.test(code);

      if (hasRegistry && (isCs || isGo || code?.includes("registry")) && (after.osdMessage === "CALC_MODE" || after.isOn !== before.isOn)) {
        return { passed: true, messageKey: "playground.task10Success" };
      }
      return { passed: false, messageKey: "playground.task10Failed" };
    },
  },
];
