/**
 * @file packages/sim-engine/src/runtime/labs/labScenarios.ts
 * @description Educational micro-labs & interactive drills:
 * 1. POE (Predict-Observe-Explain) "What will explode?" live simulators
 * 2. Firmware Logic Builder (No-Typing visual pipelines)
 * 3. Station Crash Test Gates (Module completion certification drills)
 */

// ─────────────────────────────────────────────────────────────
// 1. PREDICT-OBSERVE-EXPLAIN (POE) LIVE SIMULATOR
// ─────────────────────────────────────────────────────────────

export interface PoeScenarioOption {
  id: string;
  labelKey: string;
  defaultLabel: string;
  isCorrect: boolean;
  explanationKey: string;
  defaultExplanation: string;
  impactType: "success" | "overdraft" | "crash" | "timeout" | "syntax_error";
}

export interface PoeScenario {
  id: string;
  stationId: "tv" | "pos" | "iot" | "api" | "git" | "bandit" | "vertex" | "fde" | "rag" | "cyber";
  titleKey: string;
  defaultTitle: string;
  premiseKey: string;
  defaultPremise: string;
  codeSnippet: string;
  language: "csharp" | "go" | "python" | "typescript" | "bash";
  options: PoeScenarioOption[];
  rewardXp: number;
}

export const POE_SCENARIOS: PoeScenario[] = [
  // ── POS Terminal 02 ──
  {
    id: "poe-pos-guard-clause",
    stationId: "pos",
    titleKey: "labs.poe.posGuardTitle",
    defaultTitle: "Списання без Guard Clause",
    premiseKey: "labs.poe.posGuardPremise",
    defaultPremise: "Баланс клієнта становить $25. Покупець намагається оплатити товар на $100. Що станеться при виконанні наведеного коду?",
    language: "csharp",
    codeSnippet: `// ПОМИЛКА: Відсутня перевірка балансу!
balance -= amount;
status = "APPROVED";`,
    rewardXp: 25,
    options: [
      {
        id: "opt-overdraft",
        labelKey: "labs.poe.posGuardOpt1",
        defaultLabel: "Баланс стане від'ємним (-$75), а статус транзакції — APPROVED (Катастрофа каси)",
        isCorrect: true,
        explanationKey: "labs.poe.posGuardExpl1",
        defaultExplanation: "Саме так! Без `if (amount > balance) return;` термінал сліпо списує гроші, виникає овердрафт і каса зазнає збитків.",
        impactType: "overdraft",
      },
      {
        id: "opt-smart-terminal",
        labelKey: "labs.poe.posGuardOpt2",
        defaultLabel: "Термінал сам здогадається, що грошей замало, і видасть DECLINED",
        isCorrect: false,
        explanationKey: "labs.poe.posGuardExpl2",
        defaultExplanation: "Комп'ютер робить тільки те, що написано в коді. Якщо перевірки немає — списання відбудеться гарантовано.",
        impactType: "crash",
      },
      {
        id: "opt-syntax-err",
        labelKey: "labs.poe.posGuardOpt3",
        defaultLabel: "Виникне апаратна помилка процесора (Division by Zero)",
        isCorrect: false,
        explanationKey: "labs.poe.posGuardExpl3",
        defaultExplanation: "Операція віднімання цілком валідна для процесора, результат просто піде у від'ємні числа.",
        impactType: "syntax_error",
      },
    ],
  },
  {
    id: "poe-pos-fee-order",
    stationId: "pos",
    titleKey: "labs.poe.posFeeTitle",
    defaultTitle: "Порядок мутацій комісії",
    premiseKey: "labs.poe.posFeePremise",
    defaultPremise: "Баланс = $100, Сума = $50, Комісія = $5. Інженер списав лише суму, а комісію розрахував після. Скільки грошей спишеться з клієнта?",
    language: "csharp",
    codeSnippet: `balance -= amount;
totalAmount = amount + fee;
status = "APPROVED";`,
    rewardXp: 25,
    options: [
      {
        id: "opt-fee-lost",
        labelKey: "labs.poe.posFeeOpt1",
        defaultLabel: "Спишеться лише $50 (комісія $5 порахована у змінну, але НЕ списана з балансу)",
        isCorrect: true,
        explanationKey: "labs.poe.posFeeExpl1",
        defaultExplanation: "Точно! Розрахунок `totalAmount = amount + fee` ніяк не впливає на баланс без виклику `balance -= totalAmount`. Банк втратив $5 комісії.",
        impactType: "overdraft",
      },
      {
        id: "opt-fee-correct",
        labelKey: "labs.poe.posFeeOpt2",
        defaultLabel: "Спишеться $55 автоматично через магію змінних",
        isCorrect: false,
        explanationKey: "labs.poe.posFeeExpl2",
        defaultExplanation: "Змінні в коді не мають двостороннього зв'язку. Зміна однієї змінної не мутує іншу без явної операції присвоєння.",
        impactType: "crash",
      },
    ],
  },

  // ── API Forge 04 ──
  {
    id: "poe-api-cable-drop",
    stationId: "api",
    titleKey: "labs.poe.apiCableTitle",
    defaultTitle: "Обрив зв'язку під час HTTP-запиту",
    premiseKey: "labs.poe.apiCablePremise",
    defaultPremise: "Фізичний мережевий кабель сервера пошкоджено. Клієнт відправляє `POST /api/orders`. Який статус отримає клієнт?",
    language: "typescript",
    codeSnippet: `const res = await fetch("https://api.terminal.internal/api/orders", {
  method: "POST",
  body: JSON.stringify({ deviceId: "dev-01" })
});`,
    rewardXp: 25,
    options: [
      {
        id: "opt-504",
        labelKey: "labs.poe.apiCableOpt1",
        defaultLabel: "504 Gateway Timeout (Шлюз не відповідає за відведений час)",
        isCorrect: true,
        explanationKey: "labs.poe.apiCableExpl1",
        defaultExplanation: "Вірно! При фізичному обриві з'єднання клієнт чекає тайм-аут сокета і отримує статус 504 Gateway Timeout.",
        impactType: "timeout",
      },
      {
        id: "opt-404",
        labelKey: "labs.poe.apiCableOpt2",
        defaultLabel: "404 Not Found (Маршрут не знайдено)",
        isCorrect: false,
        explanationKey: "labs.poe.apiCableExpl2",
        defaultExplanation: "Статус 404 видає живий сервер, який отримав запит, але не знайшов роут. При обриві кабелю сервер навіть не чує запит.",
        impactType: "crash",
      },
      {
        id: "opt-200",
        labelKey: "labs.poe.apiCableOpt3",
        defaultLabel: "200 OK з порожнім замовленням",
        isCorrect: false,
        explanationKey: "labs.poe.apiCableExpl3",
        defaultExplanation: "200 означає успіх. За відсутності зв'язку успішної відповіді бути не може.",
        impactType: "syntax_error",
      },
    ],
  },

  // ── IoT Station 03 ──
  {
    id: "poe-iot-blocking-loop",
    stationId: "iot",
    titleKey: "labs.poe.iotLoopTitle",
    defaultTitle: "Блокуючий виклик в циклі мікроконтролера",
    premiseKey: "labs.poe.iotLoopPremise",
    defaultPremise: "В обробнику воріт гаража розробник поставив `Thread.Sleep(5000)` для затримки відкриття. Що станеться з датчиком безпеки авто під час затримки?",
    language: "csharp",
    codeSnippet: `void OpenGate() {
    isMoving = true;
    Thread.Sleep(5000); // Синхронне очікування
    CheckSafetyObstacle(); // Перевірка датчика
}`,
    rewardXp: 25,
    options: [
      {
        id: "opt-iot-crash",
        labelKey: "labs.poe.iotLoopOpt1",
        defaultLabel: "Датчик не спрацює вчасно, і ворота затиснуть автомобіль під час руху",
        isCorrect: true,
        explanationKey: "labs.poe.iotLoopExpl1",
        defaultExplanation: "Абсолютно точно! Синхронний `Thread.Sleep` блокує весь потік виконання контролера, позбавляючи його змоги опитувати сенсори безпеки.",
        impactType: "crash",
      },
      {
        id: "opt-iot-smooth",
        labelKey: "labs.poe.iotLoopOpt2",
        defaultLabel: "Ворота плавно зачекають і перевірять датчик у фоні",
        isCorrect: false,
        explanationKey: "labs.poe.iotLoopExpl2",
        defaultExplanation: "Вбудовані системи однопотокові за замовчуванням. Без асинхронного таймера або переривань (Interrupt) фонової перевірки немає.",
        impactType: "syntax_error",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// 2. FIRMWARE LOGIC BUILDER (NO-TYPING LOGIC PIPELINE)
// ─────────────────────────────────────────────────────────────

export interface LogicBlock {
  id: string;
  nameKey: string;
  defaultName: string;
  iconName: "ShieldCheck" | "Calculator" | "DollarSign" | "Lock" | "Receipt" | "Network";
  category: "guard" | "computation" | "mutation" | "io";
  descriptionKey: string;
  defaultDescription: string;
  codePreview: string;
}

export interface LogicChallenge {
  id: string;
  stationId: string;
  titleKey: string;
  defaultTitle: string;
  missionKey: string;
  defaultMission: string;
  availableBlockIds: string[];
  expectedSequence: string[];
  rewardXp: number;
}

export const LOGIC_BLOCKS: Record<string, LogicBlock> = {
  "guard-pin": {
    id: "guard-pin",
    nameKey: "labs.logic.guardPinName",
    defaultName: "Захист спроб PIN-коду",
    iconName: "Lock",
    category: "guard",
    descriptionKey: "labs.logic.guardPinDesc",
    defaultDescription: "Перевірка блокування при перевищенні 3 спроб",
    codePreview: "if (pinAttempts >= 3) { isLocked = true; return; }",
  },
  "guard-balance": {
    id: "guard-balance",
    nameKey: "labs.logic.guardBalanceName",
    defaultName: "Guard Clause: Перевірка балансу",
    iconName: "ShieldCheck",
    category: "guard",
    descriptionKey: "labs.logic.guardBalanceDesc",
    defaultDescription: "Раннє відхилення (DECLINED), якщо коштів недостатньо",
    codePreview: "if (amount + fee > balance) { status = 'DECLINED'; return; }",
  },
  "calc-total": {
    id: "calc-total",
    nameKey: "labs.logic.calcTotalName",
    defaultName: "Розрахунок суми з комісією",
    iconName: "Calculator",
    category: "computation",
    descriptionKey: "labs.logic.calcTotalDesc",
    defaultDescription: "Обчислення повної вартості операції",
    codePreview: "totalAmount = amount + fee;",
  },
  "mutate-balance": {
    id: "mutate-balance",
    nameKey: "labs.logic.mutateBalanceName",
    defaultName: "Списання коштів з балансу",
    iconName: "DollarSign",
    category: "mutation",
    descriptionKey: "labs.logic.mutateBalanceDesc",
    defaultDescription: "Зменшення доступного залишку на суму списання",
    codePreview: "balance -= totalAmount;",
  },
  "emit-receipt": {
    id: "emit-receipt",
    nameKey: "labs.logic.emitReceiptName",
    defaultName: "Друк чека та затвердження",
    iconName: "Receipt",
    category: "io",
    descriptionKey: "labs.logic.emitReceiptDesc",
    defaultDescription: "Встановлення статусу APPROVED та генерація чека",
    codePreview: "status = 'APPROVED'; PrintReceipt();",
  },
};

export const LOGIC_CHALLENGES: LogicChallenge[] = [
  {
    id: "logic-pos-safe-checkout",
    stationId: "pos",
    titleKey: "labs.logic.posCheckoutTitle",
    defaultTitle: "Архітектура фінансової транзакції",
    missionKey: "labs.logic.posCheckoutMission",
    defaultMission: "Зберіть модулі в безпечний ланцюжок: спочатку перевірки безпеки, потім розрахунок, списання і фінальний чек.",
    availableBlockIds: ["mutate-balance", "emit-receipt", "guard-pin", "guard-balance", "calc-total"],
    expectedSequence: ["guard-pin", "guard-balance", "calc-total", "mutate-balance", "emit-receipt"],
    rewardXp: 35,
  },
];

// ─────────────────────────────────────────────────────────────
// 3. STATION CRASH TEST GATE (MODULE CERTIFICATION DRILL)
// ─────────────────────────────────────────────────────────────

export interface CrashIncidentAction {
  id: string;
  labelKey: string;
  defaultLabel: string;
  isCorrect: boolean;
  consequenceKey: string;
  defaultConsequence: string;
}

export interface CrashIncident {
  id: string;
  titleKey: string;
  defaultTitle: string;
  descriptionKey: string;
  defaultDescription: string;
  severity: "SEV-1" | "SEV-2";
  actions: CrashIncidentAction[];
}

export interface StationCrashGate {
  stationId: string;
  titleKey: string;
  defaultTitle: string;
  timeLimitSeconds: number;
  rewardXp: number;
  certBadgeTitle: string;
  incidents: CrashIncident[];
}

export const STATION_CRASH_GATES: Record<string, StationCrashGate> = {
  pos: {
    stationId: "pos",
    titleKey: "labs.crash.posGateTitle",
    defaultTitle: "Аттестаційний Краш-Тест: Касовий збій у пікову годину",
    timeLimitSeconds: 75,
    rewardXp: 60,
    certBadgeTitle: "Master of Fintech POS",
    incidents: [
      {
        id: "pos-inc-1",
        titleKey: "labs.crash.posInc1Title",
        defaultTitle: "Інцидент 1: Застрягла спроба з невірним PIN",
        descriptionKey: "labs.crash.posInc1Desc",
        defaultDescription: "Клієнт увів невірний PIN 3 рази. Черга росте, термінал перейшов у стан блокування. Яка дія інженера є коректною?",
        severity: "SEV-2",
        actions: [
          {
            id: "act-reset-pin",
            labelKey: "labs.crash.posAct1Correct",
            defaultLabel: "Викликати ResetPinSecurityState() через безпечний токен адміністратора",
            isCorrect: true,
            consequenceKey: "labs.crash.posAct1CorrectMsg",
            defaultConsequence: "Стан скинуто, лічильник очищено, термінал готовий до роботи.",
          },
          {
            id: "act-bypass",
            labelKey: "labs.crash.posAct1Wrong",
            defaultLabel: "Пропустити оплату без PIN-коду",
            isCorrect: false,
            consequenceKey: "labs.crash.posAct1WrongMsg",
            defaultConsequence: "Грубе порушення PCI-DSS! Картку скомпрометовано.",
          },
        ],
      },
      {
        id: "pos-inc-2",
        titleKey: "labs.crash.posInc2Title",
        defaultTitle: "Інцидент 2: Раптовий обрив живлення під час списання",
        descriptionKey: "labs.crash.posInc2Desc",
        defaultDescription: "Гроші з клієнта списані, але чек не встиг надрукуватися через стрибок напруги. Як уникнути повторного списання?",
        severity: "SEV-1",
        actions: [
          {
            id: "act-idempotency",
            labelKey: "labs.crash.posAct2Correct",
            defaultLabel: "Перевірити Idempotency-Key у журналі та підтвердити статус без повторного списання",
            isCorrect: true,
            consequenceKey: "labs.crash.posAct2CorrectMsg",
            defaultConsequence: "Ідемпотентність спрацювала ідеально: подвійного списання не сталося!",
          },
          {
            id: "act-retry-charge",
            labelKey: "labs.crash.posAct2Wrong",
            defaultLabel: "Повторно списати всю суму з картки",
            isCorrect: false,
            consequenceKey: "labs.crash.posAct2WrongMsg",
            defaultConsequence: "Клієнт отримав подвійне списання коштів! Скарга в банк.",
          },
        ],
      },
    ],
  },
};
