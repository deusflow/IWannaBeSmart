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
    transferVariant: {
      prompt: {
        ua: "Увімкніть живлення телевізора та одразу перемкніть його на 5-й канал: tv.SetChannel(5);",
        en: "Turn on the TV power and immediately switch it to channel 5: tv.SetChannel(5);",
        da: "Tænd for fjernsynet og skift straks til kanal 5: tv.SetChannel(5);",
      },
      hint: {
        ua: "C#: tv.PowerOn(); tv.SetChannel(5); | Go: tv.PowerOn() tv.SetChannel(5)",
        en: "C#: tv.PowerOn(); tv.SetChannel(5); | Go: tv.PowerOn() tv.SetChannel(5)",
        da: "C#: tv.PowerOn(); tv.SetChannel(5); | Go: tv.PowerOn() tv.SetChannel(5)",
      },
      targetSnippetExample: "tv.PowerOn();\ntv.SetChannel(5);",
      validate: (_before, after) => after.isOn && after.channel === 5,
    },
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
    transferVariant: {
      prompt: {
        ua: 'Налаштуйте канал 4 цифрою без лапок та назву "CINEMA" текстом у подвійних лапках.',
        en: 'Configure channel 4 as an integer (no quotes) and label "CINEMA" as string in double quotes.',
        da: 'Konfigurer kanal 4 som heltal (uden anførselstegn) og navnet "CINEMA" i dobbelte anførselstegn.',
      },
      hint: {
        ua: 'C#: tv.SetChannel(4); tv.SetLabel("CINEMA"); | Go: tv.SetChannel(4) tv.SetLabel("CINEMA")',
        en: 'C#: tv.SetChannel(4); tv.SetLabel("CINEMA"); | Go: tv.SetChannel(4) tv.SetLabel("CINEMA")',
        da: 'C#: tv.SetChannel(4); tv.SetLabel("CINEMA"); | Go: tv.SetChannel(4) tv.SetLabel("CINEMA")',
      },
      targetSnippetExample: 'tv.SetChannel(4);\ntv.SetLabel("CINEMA");',
      validate: (_before, after, code) => {
        const hasChannel = after.channel === 4;
        const hasLabel = after.label === "CINEMA" || after.osdMessage === "CINEMA" || (code && /SetLabel\s*\(\s*"CINEMA"\s*\)/i.test(code));
        return Boolean(hasChannel && hasLabel);
      },
    },
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
    transferVariant: {
      prompt: {
        ua: "Увімкніть телевізор першою командою та послідовно налаштуйте 3-й канал другою командою.",
        en: "Turn on the TV first and sequentially tune to channel 3 second.",
        da: "Tænd for fjernsynet først og skift sekventielt til kanal 3 bagefter.",
      },
      hint: {
        ua: "C#: tv.PowerOn(); tv.SetChannel(3); | Go: tv.PowerOn() tv.SetChannel(3)",
        en: "C#: tv.PowerOn(); tv.SetChannel(3); | Go: tv.PowerOn() tv.SetChannel(3)",
        da: "C#: tv.PowerOn(); tv.SetChannel(3); | Go: tv.PowerOn() tv.SetChannel(3)",
      },
      targetSnippetExample: "tv.PowerOn();\ntv.SetChannel(3);",
      validate: (_before, after) => after.isOn && after.channel === 3,
    },
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
    transferVariant: {
      prompt: {
        ua: "Вимкніть живлення телевізора через зміну властивості tv.IsOn = false;",
        en: "Turn off the TV power by setting property tv.IsOn = false;",
        da: "Sluk for tv-strømmen ved at indstille egenskaben tv.IsOn = false;",
      },
      hint: {
        ua: "C#: tv.IsOn = false; | Go: tv.IsOn = false",
        en: "C#: tv.IsOn = false; | Go: tv.IsOn = false",
        da: "C#: tv.IsOn = false; | Go: tv.IsOn = false",
      },
      targetSnippetExample: "tv.IsOn = false;",
      validate: (_before, after) => !after.isOn,
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
    transferVariant: {
      prompt: {
        ua: "Якщо телевізор увімкнений, встановіть гучність на 40, інакше увімкніть його (tv.IsOn = true;)",
        en: "If TV is on, set volume to 40, otherwise turn it on (tv.IsOn = true;)",
        da: "Hvis tv'et er tændt, sæt lydstyrken til 40, ellers tænd det (tv.IsOn = true;)",
      },
      hint: {
        ua: "if (tv.IsOn) { tv.Volume = 40; } else { tv.IsOn = true; }",
        en: "if (tv.IsOn) { tv.Volume = 40; } else { tv.IsOn = true; }",
        da: "if (tv.IsOn) { tv.Volume = 40; } else { tv.IsOn = true; }",
      },
      targetSnippetExample: "if (tv.IsOn) {\n    tv.Volume = 40;\n} else {\n    tv.IsOn = true;\n}",
      validate: (_before, after, code) => (after.volume === 40 || after.isOn) && /if\s*\(?tv\.IsOn/i.test(code),
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
    transferVariant: {
      prompt: {
        ua: "Зменшіть номер поточного каналу на 1 за допомогою декременту: tv.Channel-- (або tv.Channel -= 1)",
        en: "Decrease current channel by 1 using decrement: tv.Channel-- (or tv.Channel -= 1)",
        da: "Reducer den aktuelle kanal med 1 ved brug af dekrementering: tv.Channel-- (eller tv.Channel -= 1)",
      },
      hint: {
        ua: "C#: tv.Channel--; | Go: tv.Channel--",
        en: "C#: tv.Channel--; | Go: tv.Channel--",
        da: "C#: tv.Channel--; | Go: tv.Channel--",
      },
      targetSnippetExample: "tv.Channel--;",
      validate: (before, after, code) =>
        Boolean(/(?:Channel\s*--|Channel\s*-=\s*1)/i.test(code) && (after.channel === before.channel - 1 || after.channel < before.channel)),
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
    transferVariant: {
      prompt: {
        ua: "Якщо гучність більша за 80 — обмежте її значенням 80: if (tv.Volume > 80) { tv.Volume = 80; }",
        en: "If volume is greater than 80, cap it at 80: if (tv.Volume > 80) { tv.Volume = 80; }",
        da: "Hvis lydstyrken er over 80, begræns den til 80: if (tv.Volume > 80) { tv.Volume = 80; }",
      },
      hint: {
        ua: "if (tv.Volume > 80) { tv.Volume = 80; }",
        en: "if (tv.Volume > 80) { tv.Volume = 80; }",
        da: "if (tv.Volume > 80) { tv.Volume = 80; }",
      },
      targetSnippetExample: "if (tv.Volume > 80) {\n    tv.Volume = 80;\n}",
      validate: (_before, _after, code) => {
        if (!/if\s*\(?tv\.Volume\s*>\s*80/i.test(code)) return false;
        const testOver = executeTvScript(code, { isOn: true, channel: 1, volume: 95 });
        const testNormal = executeTvScript(code, { isOn: true, channel: 1, volume: 50 });
        return Boolean(testOver.success && testOver.newState.volume === 80 && testNormal.success && testNormal.newState.volume === 50);
      },
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
    transferVariant: {
      prompt: {
        ua: "Напишіть цикл від 1 до 3, який по черзі перемикає канал: for (int i = 1; i <= 3; i++) { tv.Channel = i; }",
        en: "Write a loop from 1 to 3 that sequentially tunes channels: for (int i = 1; i <= 3; i++) { tv.Channel = i; }",
        da: "Skriv en løkke fra 1 til 3, der sekventielt skifter kanal: for (int i = 1; i <= 3; i++) { tv.Channel = i; }",
      },
      hint: {
        ua: "C#: for (int i = 1; i <= 3; i++) { tv.Channel = i; } | Go: for i := 1; i <= 3; i++ { tv.Channel = i }",
        en: "C#: for (int i = 1; i <= 3; i++) { tv.Channel = i; } | Go: for i := 1; i <= 3; i++ { tv.Channel = i }",
        da: "C#: for (int i = 1; i <= 3; i++) { tv.Channel = i; } | Go: for i := 1; i <= 3; i++ { tv.Channel = i }",
      },
      targetSnippetExample: "for (int i = 1; i <= 3; i++) {\n    tv.Channel = i;\n}",
      validate: (_before, after, code) => Boolean(/for\s/i.test(code) && (after.channel === 3 || /<=\s*3|<\s*4/i.test(code))),
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
    id: "task-class-instance",
    tier: 1,
    order: 9,
    titleKey: "playground.taskBridgeATitle",
    conceptKey: "playground.taskBridgeAConcept",
    descKey: "playground.taskBridgeADesc",
    hintKey: "playground.taskBridgeAHint",
    successKey: "playground.taskBridgeASuccess",
    simpleExplanationKey: "playground.taskBridgeASimple",
    engineeringKey: "playground.taskBridgeAEngineering",
    careerImpactKey: "playground.taskBridgeACareer",
    initialCode: {
      csharp: `// Створіть екземпляр телевізора за кресленням класу TV та увімкніть його
TV myTv = new TV();
myTv.PowerOn();
`,
      go: `// Створіть екземпляр телевізора за кресленням структури TV та увімкніть його
myTv := TV{}
myTv.PowerOn()
`,
    },
    targetCode: {
      csharp: `TV myTv = new TV();
myTv.PowerOn();`,
      go: `myTv := TV{}
myTv.PowerOn()`,
    },
    clozeTemplate: {
      csharp: `TV myTv = ___ TV();
myTv.___();`,
      go: `myTv := TV{}
myTv.___()`,
    },
    sprintTimeLimit: 25,
    transferVariant: {
      prompt: {
        ua: "Створіть екземпляр телевізора з назвою livingRoomTv і перемкніть його на 3-й канал: livingRoomTv.SetChannel(3);",
        en: "Create a TV instance named livingRoomTv and tune it to channel 3: livingRoomTv.SetChannel(3);",
        da: "Opret en TV-forekomst ved navn livingRoomTv og skift til kanal 3: livingRoomTv.SetChannel(3);",
      },
      hint: {
        ua: "C#: TV livingRoomTv = new TV(); livingRoomTv.SetChannel(3); | Go: livingRoomTv := TV{}; livingRoomTv.SetChannel(3)",
        en: "C#: TV livingRoomTv = new TV(); livingRoomTv.SetChannel(3); | Go: livingRoomTv := TV{}; livingRoomTv.SetChannel(3)",
        da: "C#: TV livingRoomTv = new TV(); livingRoomTv.SetChannel(3); | Go: livingRoomTv := TV{}; livingRoomTv.SetChannel(3)",
      },
      targetSnippetExample: "TV livingRoomTv = new TV();\nlivingRoomTv.SetChannel(3);",
      validate: (_before, after, code) => {
        const hasName = /livingRoomTv/i.test(code);
        const hasInst = /(?:new\s+TV\s*\(\s*\)|&?TV\s*\{\s*\})/i.test(code);
        return Boolean(hasName && hasInst && after.channel === 3);
      },
    },
    validate: (_before, after, result, code) => {
      if (!result.success) return { passed: false, messageKey: "playground.errorSyntax" };
      const hasInst = Boolean(code && /(?:new\s+TV\s*\(\s*\)|&?TV\s*\{\s*\})/i.test(code));
      const hasCall = Boolean(code && /(?:myTv|[a-zA-Z_]\w*)\.PowerOn\s*\(\s*\)/i.test(code));
      if (after.isOn && hasInst && hasCall) {
        return { passed: true, messageKey: "playground.taskBridgeASuccess" };
      }
      return { passed: false, messageKey: "playground.taskBridgeAHint" };
    },
  },
  {
    id: "task-method-return",
    tier: 1,
    order: 10,
    titleKey: "playground.taskBridgeBTitle",
    conceptKey: "playground.taskBridgeBConcept",
    descKey: "playground.taskBridgeBDesc",
    hintKey: "playground.taskBridgeBHint",
    successKey: "playground.taskBridgeBSuccess",
    simpleExplanationKey: "playground.taskBridgeBSimple",
    engineeringKey: "playground.taskBridgeBEngineering",
    careerImpactKey: "playground.taskBridgeBCareer",
    initialCode: {
      csharp: `// Зчитайте поточну гучність телевізора і додайте 10 одиниць
int vol = tv.GetVolume();
tv.SetVolume(vol + 10);
`,
      go: `// Зчитайте поточну гучність телевізора і додайте 10 одиниць
vol := tv.GetVolume()
tv.SetVolume(vol + 10)
`,
    },
    targetCode: {
      csharp: `int vol = tv.GetVolume();
tv.SetVolume(vol + 10);`,
      go: `vol := tv.GetVolume()
tv.SetVolume(vol + 10)`,
    },
    clozeTemplate: {
      csharp: `int vol = tv.___();
tv.SetVolume(___ + 10);`,
      go: `vol := tv.___()
tv.SetVolume(___ + 10)`,
    },
    sprintTimeLimit: 25,
    transferVariant: {
      prompt: {
        ua: "Зчитайте гучність у змінну currentVol і зменшіть її на 15 одиниць: tv.SetVolume(currentVol - 15);",
        en: "Read volume into variable currentVol and reduce it by 15: tv.SetVolume(currentVol - 15);",
        da: "Aflæs lydstyrken i variablen currentVol og reducer den med 15: tv.SetVolume(currentVol - 15);",
      },
      hint: {
        ua: "C#: int currentVol = tv.GetVolume(); tv.SetVolume(currentVol - 15); | Go: currentVol := tv.GetVolume(); tv.SetVolume(currentVol - 15)",
        en: "C#: int currentVol = tv.GetVolume(); tv.SetVolume(currentVol - 15); | Go: currentVol := tv.GetVolume(); tv.SetVolume(currentVol - 15)",
        da: "C#: int currentVol = tv.GetVolume(); tv.SetVolume(currentVol - 15); | Go: currentVol := tv.GetVolume(); tv.SetVolume(currentVol - 15)",
      },
      targetSnippetExample: "int currentVol = tv.GetVolume();\ntv.SetVolume(currentVol - 15);",
      validate: (before, after, code) => {
        const hasGet = /GetVolume\s*\(\s*\)/i.test(code);
        const hasVar = /currentVol/i.test(code);
        return Boolean(hasGet && hasVar && after.volume === Math.max(0, before.volume - 15));
      },
    },
    validate: (before, after, result, code) => {
      if (!result.success) return { passed: false, messageKey: "playground.errorSyntax" };
      const hasGet = Boolean(code && /GetVolume\s*\(\s*\)/i.test(code));
      const hasSet = Boolean(code && /SetVolume\s*\(\s*(?:vol|currentVol|[a-zA-Z_]\w*)\s*\+\s*10\s*\)/i.test(code));
      if (hasGet && hasSet && after.volume === before.volume + 10) {
        return { passed: true, messageKey: "playground.taskBridgeBSuccess" };
      }
      return { passed: false, messageKey: "playground.taskBridgeBHint" };
    },
  },
  {
    id: "task-null-reference",
    tier: 1,
    order: 11,
    titleKey: "playground.taskBridgeCTitle",
    conceptKey: "playground.taskBridgeCConcept",
    descKey: "playground.taskBridgeCDesc",
    hintKey: "playground.taskBridgeCHint",
    successKey: "playground.taskBridgeCSuccess",
    simpleExplanationKey: "playground.taskBridgeCSimple",
    engineeringKey: "playground.taskBridgeCEngineering",
    careerImpactKey: "playground.taskBridgeCCareer",
    initialCode: {
      csharp: `// Захистіть порожнє посилання перевіркою if (broken != null), щоб уникнути падіння
TV broken = null;

if (broken != null) {
    broken.PowerOn();
}
`,
      go: `// Захистіть порожній вказівник перевіркою if broken != nil, щоб уникнути паніки
var broken *TV = nil

if broken != nil {
    broken.PowerOn()
}
`,
    },
    targetCode: {
      csharp: `TV broken = null;
if (broken != null) {
    broken.PowerOn();
}`,
      go: `var broken *TV = nil
if broken != nil {
    broken.PowerOn()
}`,
    },
    clozeTemplate: {
      csharp: `TV broken = null;
if (broken != ___) {
    broken.___();
}`,
      go: `var broken *TV = nil
if broken != ___ {
    broken.___()
}`,
    },
    sprintTimeLimit: 30,
    transferVariant: {
      prompt: {
        ua: "Оголосіть порожнє посилання remote = null / nil та безпечно викличте remote.PowerOn() за допомогою if (remote != null) або safe call remote?.PowerOn();",
        en: "Declare null reference remote = null / nil and safely invoke remote.PowerOn() via if (remote != null) or safe call remote?.PowerOn();",
        da: "Erklær null reference remote = null / nil og kald sikkert remote.PowerOn() via if (remote != null) eller remote?.PowerOn();",
      },
      hint: {
        ua: "C#: TV remote = null; if (remote != null) { remote.PowerOn(); } (або TV remote = null; remote?.PowerOn();)",
        en: "C#: TV remote = null; if (remote != null) { remote.PowerOn(); } (or TV remote = null; remote?.PowerOn();)",
        da: "C#: TV remote = null; if (remote != null) { remote.PowerOn(); } (eller TV remote = null; remote?.PowerOn();)",
      },
      targetSnippetExample: "TV remote = null;\nif (remote != null) {\n    remote.PowerOn();\n}",
      validate: (_before, after, code) => {
        const hasRemote = /remote/i.test(code);
        const hasNull = /(?:null|nil)/i.test(code);
        const hasGuard = /(?:!=\s*(?:null|nil)|\?\.\s*PowerOn)/i.test(code);
        return Boolean(hasRemote && hasNull && hasGuard && after.isSafeGuardActive);
      },
    },
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      const hasNull = Boolean(code && /(?:null|nil)/i.test(code));
      const hasGuard = Boolean(code && /(?:!=\s*(?:null|nil)|\?\.\s*PowerOn)/i.test(code));
      if (hasNull && hasGuard && after.isSafeGuardActive) {
        return { passed: true, messageKey: "playground.taskBridgeCSuccess" };
      }
      return { passed: false, messageKey: "playground.taskBridgeCHint" };
    },
  },
  {
    id: "task-function-encapsulation",
    tier: 2,
    order: 12,
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
    transferVariant: {
      prompt: {
        ua: "Оголосіть функцію MaxVolume() { tv.Volume = 100; } і викличте її: MaxVolume();",
        en: "Declare function MaxVolume() { tv.Volume = 100; } and invoke it: MaxVolume();",
        da: "Erklær funktionen MaxVolume() { tv.Volume = 100; } og kald den: MaxVolume();",
      },
      hint: {
        ua: "C#: void MaxVolume() { tv.Volume = 100; } MaxVolume(); | Go: func MaxVolume() { tv.Volume = 100 } MaxVolume()",
        en: "C#: void MaxVolume() { tv.Volume = 100; } MaxVolume(); | Go: func MaxVolume() { tv.Volume = 100 } MaxVolume()",
        da: "C#: void MaxVolume() { tv.Volume = 100; } MaxVolume(); | Go: func MaxVolume() { tv.Volume = 100 } MaxVolume()",
      },
      targetSnippetExample: "void MaxVolume() {\n    tv.Volume = 100;\n}\n\nMaxVolume();",
      validate: (_before, after, code) => Boolean(/MaxVolume\s*\(\s*\)/i.test(code) && after.volume === 100),
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
    tier: 2,
    order: 13,
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
    transferVariant: {
      prompt: {
        ua: "Додайте у switch обробку кнопки 'INFO', яка встановлює режим: case 'INFO': tv.SetMode('INFO_MODE'); break;",
        en: "Add 'INFO' button handling in switch setting mode: case 'INFO': tv.SetMode('INFO_MODE'); break;",
        da: "Tilføj 'INFO' tast-håndtering i switch som sætter tilstand: case 'INFO': tv.SetMode('INFO_MODE'); break;",
      },
      hint: {
        ua: "case \"INFO\": tv.SetMode(\"INFO_MODE\"); break;",
        en: "case \"INFO\": tv.SetMode(\"INFO_MODE\"); break;",
        da: "case \"INFO\": tv.SetMode(\"INFO_MODE\"); break;",
      },
      targetSnippetExample: 'case "INFO":\n    tv.SetMode("INFO_MODE");\n    break;',
      validate: (_before, after, code) => Boolean(/case\s*["']INFO["']/i.test(code) && (after.osdMessage === "INFO_MODE" || /INFO_MODE/i.test(code))),
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
    tier: 2,
    order: 14,
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
    transferVariant: {
      prompt: {
        ua: "Створіть команду InfoCommand та виконайте її через інтерфейс: IRemoteCommand cmd = new InfoCommand(); cmd.Execute(); (або cmd := InfoCommand{}; cmd.Execute())",
        en: "Create InfoCommand and execute it via interface: IRemoteCommand cmd = new InfoCommand(); cmd.Execute(); (or cmd := InfoCommand{}; cmd.Execute())",
        da: "Opret InfoCommand og udfør den via interface: IRemoteCommand cmd = new InfoCommand(); cmd.Execute(); (eller cmd := InfoCommand{}; cmd.Execute())",
      },
      hint: {
        ua: "C#: IRemoteCommand cmd = new InfoCommand(); cmd.Execute(); | Go: cmd := InfoCommand{}; cmd.Execute()",
        en: "C#: IRemoteCommand cmd = new InfoCommand(); cmd.Execute(); | Go: cmd := InfoCommand{}; cmd.Execute()",
        da: "C#: IRemoteCommand cmd = new InfoCommand(); cmd.Execute(); | Go: cmd := InfoCommand{}; cmd.Execute()",
      },
      targetSnippetExample: "IRemoteCommand cmd = new InfoCommand();\ncmd.Execute();",
      validate: (_before, after, code) => Boolean(/cmd\.Execute\s*\(\s*\)/i.test(code) && (after.osdMessage === "INFO_MODE" || /InfoCommand/i.test(code))),
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
    tier: 2,
    order: 15,
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
    transferVariant: {
      prompt: {
        ua: "Зареєструйте InfoCommand у контейнері: services.AddTransient<IRemoteCommand, InfoCommand>(); (або container.Register('info', NewInfoCommand()))",
        en: "Register InfoCommand in container: services.AddTransient<IRemoteCommand, InfoCommand>(); (or container.Register('info', NewInfoCommand()))",
        da: "Registrer InfoCommand i containeren: services.AddTransient<IRemoteCommand, InfoCommand>(); (eller container.Register('info', NewInfoCommand()))",
      },
      hint: {
        ua: 'C#: services.AddTransient<IRemoteCommand, InfoCommand>(); | Go: container.Register("info", NewInfoCommand())',
        en: 'C#: services.AddTransient<IRemoteCommand, InfoCommand>(); | Go: container.Register("info", NewInfoCommand())',
        da: 'C#: services.AddTransient<IRemoteCommand, InfoCommand>(); | Go: container.Register("info", NewInfoCommand())',
      },
      targetSnippetExample: "services.AddTransient<IRemoteCommand, InfoCommand>();",
      validate: (_before, after, code) => {
        const isCs = /services\.(?:AddTransient|AddSingleton|AddScoped)\s*<\s*IRemoteCommand\s*,\s*InfoCommand\s*>\s*\(\s*\)/i.test(code);
        const isGo = /container\.Register\s*\(\s*["']info["']\s*,\s*(?:NewInfoCommand\(\)|InfoCommand\{\})\s*\)/i.test(code);
        return Boolean((isCs || isGo) && (after.osdMessage === "INFO_MODE" || after.osdMessage === "CALC_MODE"));
      },
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
  {
    id: "task-command-registry",
    tier: 2,
    order: 16,
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
    transferVariant: {
      prompt: {
        ua: "Зареєструйте кнопку 'INFO' в реєстрі та виконайте її: registry['INFO'] = new InfoCommand(); registry[button].Execute();",
        en: "Register 'INFO' button in registry and execute it: registry['INFO'] = new InfoCommand(); registry[button].Execute();",
        da: "Registrer 'INFO' tast i registret og udfør den: registry['INFO'] = new InfoCommand(); registry[button].Execute();",
      },
      hint: {
        ua: 'C#: registry["INFO"] = new InfoCommand(); registry[button].Execute(); | Go: registry["INFO"] = InfoCommand{}; registry[button].Execute()',
        en: 'C#: registry["INFO"] = new InfoCommand(); registry[button].Execute(); | Go: registry["INFO"] = InfoCommand{}; registry[button].Execute()',
        da: 'C#: registry["INFO"] = new InfoCommand(); registry[button].Execute(); | Go: registry["INFO"] = InfoCommand{}; registry[button].Execute()',
      },
      targetSnippetExample: 'registry["INFO"] = new InfoCommand();\nregistry[button].Execute();',
      validate: (_before, _after, code) =>
        Boolean(/registry\s*\[\s*["']INFO["']\s*\]/i.test(code) && /registry\s*\[\s*button\s*\]\s*\.\s*Execute\s*\(\s*\)/i.test(code)),
    },
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
  {
    id: "task-debug-runaway-loop",
    tier: 0,
    order: 11,
    titleKey: "playground.taskDebugRunawayTitle",
    conceptKey: "playground.taskDebugRunawayConcept",
    descKey: "playground.taskDebugRunawayDesc",
    hintKey: "playground.taskDebugRunawayHint",
    successKey: "playground.taskDebugRunawaySuccess",
    simpleExplanationKey: "playground.taskDebugRunawaySimple",
    engineeringKey: "playground.taskDebugRunawayEngineering",
    careerImpactKey: "playground.taskDebugRunawayCareer",
    isBugfixTask: true,
    initialBrokenCode: {
      csharp: `// ⚠️ ДЕФЕКТ: Спеціаліст сервісного центру повідомив, що тюнер зависає при скануванні.
// Рантайм повертає помилку InfiniteLoopException від Watchdog Timer.
// Знайдіть та виправте крок циклу, щоб тюнер просканував канали від 1 до 5.

tv.PowerOn();
for (int ch = 1; ch <= 5; ch--)
{
    tv.SetChannel(ch);
}`,
      go: `// ⚠️ ДЕФЕКТ: Тюнер зависає під час автоматичного пошуку каналів.
// Знайдіть та виправте логічну помилку в кроці циклу.

tv.PowerOn()
for ch := 1; ch <= 5; ch-- {
    tv.SetChannel(ch)
}`,
    },
    initialCode: {
      csharp: `// ⚠️ ДЕФЕКТ: Спеціаліст сервісного центру повідомив, що тюнер зависає при скануванні.
// Рантайм повертає помилку InfiniteLoopException від Watchdog Timer.
// Знайдіть та виправте крок циклу, щоб тюнер просканував канали від 1 до 5.

tv.PowerOn();
for (int ch = 1; ch <= 5; ch--)
{
    tv.SetChannel(ch);
}`,
      go: `// ⚠️ ДЕФЕКТ: Тюнер зависає під час автоматичного пошуку каналів.
// Знайдіть та виправте логічну помилку в кроці циклу.

tv.PowerOn()
for ch := 1; ch <= 5; ch-- {
    tv.SetChannel(ch)
}`,
    },
    targetCode: {
      csharp: `tv.PowerOn();
for (int ch = 1; ch <= 5; ch++)
{
    tv.SetChannel(ch);
}`,
      go: `tv.PowerOn()
for ch := 1; ch <= 5; ch++ {
    tv.SetChannel(ch)
}`,
    },
    clozeTemplate: {
      csharp: `tv.PowerOn();
for (int ch = 1; ch <= 5; ___)
{
    tv.SetChannel(ch);
}`,
      go: `tv.PowerOn()
for ch := 1; ch <= 5; ___ {
    tv.SetChannel(ch)
}`,
    },
    sprintTimeLimit: 30,
    defectDescription: {
      ua: "Тюнер зависає під час автоматичного сканування каналів через декремент 'ch--' замість інкременту 'ch++'. Змінна прямує до від'ємних чисел, умова ch <= 5 ніколи не стає false, тому спрацьовує Watchdog Timer.",
      en: "Tuner hangs indefinitely during automated scanning due to decrement 'ch--' instead of increment 'ch++'. Variable decreases toward negative infinity, condition ch <= 5 is never false, triggering Watchdog Timer.",
      da: "Tuner fryser under automatisk scanning pga. dekrement 'ch--' i stedet for inkrement 'ch++'. Variablen bevæger sig mod negative tal, betingelsen ch <= 5 er altid sand, hvilket udløser Watchdog Timeren.",
    },
    diagnosticLogs: [
      "[FAULT] Watchdog: Core thread unresponsive for >500ms",
      "[FAULT] InfiniteLoopException: Iteration limit 50 reached in tuner loop",
      "[DIAGNOSTIC] Variable ch is decreasing (1, 0, -1...) -> (ch <= 5) invariant never breaks",
      "[STATUS] TV Hardware Freeze: REPAIR REQUIRED",
    ],
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      const hasDecreasingLoop = Boolean(code && /ch\s*--/i.test(code));
      if (hasDecreasingLoop) {
        return { passed: false, messageKey: "playground.taskDebugRunawayHint" };
      }
      if (after.isOn && after.channel === 5) {
        return { passed: true, messageKey: "playground.taskDebugRunawaySuccess" };
      }
      return { passed: false, messageKey: "playground.taskDebugRunawayHint" };
    },
    transferVariant: {
      prompt: {
        ua: "Виправте сканування діапазону з 10 до 15 каналу за допомогою інкременту ch++.",
        en: "Fix channel range scan from 10 to 15 using increment ch++.",
        da: "Ret kanalscanning fra 10 til 15 med inkrement ch++.",
      },
      hint: {
        ua: "for (int ch = 10; ch <= 15; ch++) { tv.SetChannel(ch); }",
        en: "for (int ch = 10; ch <= 15; ch++) { tv.SetChannel(ch); }",
        da: "for (int ch = 10; ch <= 15; ch++) { tv.SetChannel(ch); }",
      },
      targetSnippetExample: "tv.PowerOn();\nfor (int ch = 10; ch <= 15; ch++)\n{\n    tv.SetChannel(ch);\n}",
      validate: (_before, after) => after.isOn && after.channel === 15,
    },
  },
  {
    id: "task-debug-off-by-one-overflow",
    tier: 0,
    order: 12,
    titleKey: "playground.taskDebugOverloadTitle",
    conceptKey: "playground.taskDebugOverloadConcept",
    descKey: "playground.taskDebugOverloadDesc",
    hintKey: "playground.taskDebugOverloadHint",
    successKey: "playground.taskDebugOverloadSuccess",
    simpleExplanationKey: "playground.taskDebugOverloadSimple",
    engineeringKey: "playground.taskDebugOverloadEngineering",
    careerImpactKey: "playground.taskDebugOverloadCareer",
    isBugfixTask: true,
    initialBrokenCode: {
      csharp: `// ⚠️ ДЕФЕКТ: Спроба встановити пікову яскравість 101% спалила захисний запобіжник!
// Фізичний ліміт випромінювача: 100%. Будь-яке значення > 100 спричиняє CATHODE_RAY_OVERLOAD.
// Додайте захисну умову (if requestedBrightness <= 100), щоб захистити катодну трубку від перевантаження.

tv.PowerOn();
int requestedBrightness = 101;

// ЗАХИСТ ВІДСУТНІЙ — запобіжник перегорає:
tv.SetBrightness(requestedBrightness);`,
      go: `// ⚠️ ДЕФЕКТ: Спроба встановити пікову яскравість 101% спалила захисний запобіжник!
// Фізичний ліміт: 100%. Будь-яке значення > 100 спричиняє CATHODE_RAY_OVERLOAD.
// Додайте захисну умову (if requestedBrightness <= 100).

tv.PowerOn()
requestedBrightness := 101

// ЗАХИСТ ВІДСУТНІЙ:
tv.SetBrightness(requestedBrightness)`,
    },
    initialCode: {
      csharp: `// ⚠️ ДЕФЕКТ: Спроба встановити пікову яскравість 101% спалила захисний запобіжник!
// Фізичний ліміт випромінювача: 100%. Будь-яке значення > 100 спричиняє CATHODE_RAY_OVERLOAD.
// Додайте захисну умову (if requestedBrightness <= 100), щоб захистити катодну трубку від перевантаження.

tv.PowerOn();
int requestedBrightness = 101;

// ЗАХИСТ ВІДСУТНІЙ — запобіжник перегорає:
tv.SetBrightness(requestedBrightness);`,
      go: `// ⚠️ ДЕФЕКТ: Спроба встановити пікову яскравість 101% спалила захисний запобіжник!
// Фізичний ліміт: 100%. Будь-яке значення > 100 спричиняє CATHODE_RAY_OVERLOAD.
// Додайте захисну умову (if requestedBrightness <= 100).

tv.PowerOn()
requestedBrightness := 101

// ЗАХИСТ ВІДСУТНІЙ:
tv.SetBrightness(requestedBrightness)`,
    },
    targetCode: {
      csharp: `tv.PowerOn();
int requestedBrightness = 101;
if (requestedBrightness <= 100)
{
    tv.SetBrightness(requestedBrightness);
}`,
      go: `tv.PowerOn()
requestedBrightness := 101
if requestedBrightness <= 100 {
    tv.SetBrightness(requestedBrightness)
}`,
    },
    clozeTemplate: {
      csharp: `tv.PowerOn();
int requestedBrightness = 101;
if (___ <= 100)
{
    tv.SetBrightness(requestedBrightness);
}`,
      go: `tv.PowerOn()
requestedBrightness := 101
if ___ <= 100 {
    tv.SetBrightness(requestedBrightness)
}`,
    },
    sprintTimeLimit: 35,
    defectDescription: {
      ua: "Пряме встановлення яскравості понад 100% без перевірки меж (Boundary Check) спалює фізичний запобіжник катодної трубки (CATHODE_RAY_OVERLOAD). Необхідна захисна умова (Guard Clause).",
      en: "Setting brightness above 100% without boundary validation blows the cathode safety fuse (CATHODE_RAY_OVERLOAD). A guard clause is required.",
      da: "Indstilling af lysstyrke over 100% uden grænsekontrol sprænger katoderørets sikring (CATHODE_RAY_OVERLOAD). En sikkerhedsbetingelse er påkrævet.",
    },
    diagnosticLogs: [
      "[HARDWARE ALARM] Overvoltage detected on cathode ray driver!",
      "[FUSE TRIPPED] Critical hardware overload: requested 101% exceeds 100% limit",
      "[ERROR] CATHODE_RAY_OVERLOAD: Safety fuse blown. Display disabled.",
      "[STATUS] Device in FAULT state. Boundary check required before SetBrightness().",
    ],
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "playground.errorSyntax" };
      }
      if (after.isFuseBlown) {
        return { passed: false, messageKey: "playground.taskDebugOverloadFailed" };
      }
      const hasGuard = Boolean(
        code &&
          /if\s*\(?[^)]*(?:requestedBrightness|101|tv\.Brightness)[^)]*(?:<=|<|==)[^)]*\)?/i.test(
            code
          )
      );
      if (after.isOn && !after.isFuseBlown && hasGuard) {
        return { passed: true, messageKey: "playground.taskDebugOverloadSuccess" };
      }
      return { passed: false, messageKey: "playground.taskDebugOverloadHint" };
    },
    transferVariant: {
      prompt: {
        ua: "Перевірте безпечну яскравість 80%: int requestedBrightness = 80; if (requestedBrightness <= 100) { tv.SetBrightness(requestedBrightness); }",
        en: "Verify safe brightness 80%: int requestedBrightness = 80; if (requestedBrightness <= 100) { tv.SetBrightness(requestedBrightness); }",
        da: "Bekræft sikker lysstyrke 80%: int requestedBrightness = 80; if (requestedBrightness <= 100) { tv.SetBrightness(requestedBrightness); }",
      },
      hint: {
        ua: "requestedBrightness = 80; if (requestedBrightness <= 100) { tv.SetBrightness(requestedBrightness); }",
        en: "requestedBrightness = 80; if (requestedBrightness <= 100) { tv.SetBrightness(requestedBrightness); }",
        da: "requestedBrightness = 80; if (requestedBrightness <= 100) { tv.SetBrightness(requestedBrightness); }",
      },
      targetSnippetExample: "tv.PowerOn();\nint requestedBrightness = 80;\nif (requestedBrightness <= 100)\n{\n    tv.SetBrightness(requestedBrightness);\n}",
      validate: (_before, after) => after.isOn && !after.isFuseBlown && after.brightness === 80,
    },
  },
];
