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
    defaultPremise: "В обробнику воріт гаража розробник поставив блокуючу затримку `delay(5000)` у циклі опитування. Що станеться з датчиком безпеки авто під час затримки?",
    language: "csharp",
    codeSnippet: `void OpenGate() {
    isMoving = true;
    delay(5000); // Блокуюча затримка в циклі
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
        defaultExplanation: "Абсолютно точно! Блокуючий `delay(5000)` зупиняє виконання головного циклу мікроконтролера, унеможливлюючи своєчасне опитування сенсорів безпеки. Необхідно використовувати неблокуючий таймер або апаратні переривання.",
        impactType: "crash",
      },
      {
        id: "opt-iot-smooth",
        labelKey: "labs.poe.iotLoopOpt2",
        defaultLabel: "Ворота плавно зачекають і перевірять датчик у фоні",
        isCorrect: false,
        explanationKey: "labs.poe.iotLoopExpl2",
        defaultExplanation: "Вбудовані системи однопотокові за замовчуванням. Без неблокуючого опитування або переривань фонової перевірки немає.",
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
  api: {
    stationId: "api",
    titleKey: "labs.crash.apiGateTitle",
    defaultTitle: "Атестаційний Краш-Тест: Каскадний збій API мікросервісів",
    timeLimitSeconds: 75,
    rewardXp: 60,
    certBadgeTitle: "Master of API Architecture",
    incidents: [
      {
        id: "api-inc-1",
        titleKey: "labs.crash.apiInc1Title",
        defaultTitle: "Інцидент 1: Низхідний платіжний сервіс завис (Connection Exhaustion)",
        descriptionKey: "labs.crash.apiInc1Desc",
        defaultDescription: "Шлюз отримує 1000 запитів/сек, а зовнішній платіжний шлюз завис без відповіді. Потоки воркерів стрімко вичерпуються. Дія архітектора?",
        severity: "SEV-1",
        actions: [
          {
            id: "act-circuit-breaker",
            labelKey: "labs.crash.apiAct1Correct",
            defaultLabel: "Активувати Circuit Breaker (Fast Fail 503) та увімкнути кешовану чергу",
            isCorrect: true,
            consequenceKey: "labs.crash.apiAct1CorrectMsg",
            defaultConsequence: "Circuit Breaker розірвав ланцюг, врятувавши пул з'єднань шлюзу від каскадного краху!",
          },
          {
            id: "act-increase-timeout",
            labelKey: "labs.crash.apiAct1Wrong",
            defaultLabel: "Збільшити timeout запиту з 5с до 60с для кожного клієнта",
            isCorrect: false,
            consequenceKey: "labs.crash.apiAct1WrongMsg",
            defaultConsequence: "Катастрофа! Усі потоки зависли в очікуванні, весь кластер шлюзу впав з OOM.",
          },
        ],
      },
      {
        id: "api-inc-2",
        titleKey: "labs.crash.apiInc2Title",
        defaultTitle: "Інцидент 2: Хвиля неавторизованих запитів без токенів",
        descriptionKey: "labs.crash.apiInc2Desc",
        defaultDescription: "Ботнет здійснює 50,000 запитів/сек до захищених маршрутів без заголовка Authorization. База даних перевантажена запитами перевірки користувачів.",
        severity: "SEV-2",
        actions: [
          {
            id: "act-edge-ratelimit",
            labelKey: "labs.crash.apiAct2Correct",
            defaultLabel: "Відхиляти запити без Bearer на рівні шлюзу (401) та увімкнути Token Bucket Rate Limiting",
            isCorrect: true,
            consequenceKey: "labs.crash.apiAct2CorrectMsg",
            defaultConsequence: "Шлюз зрізав паразитарний трафік на вході, розвантаживши базу даних до норми.",
          },
          {
            id: "act-query-db",
            labelKey: "labs.crash.apiAct2Wrong",
            defaultLabel: "Пропускати запити до бекенду, записуючи детальний аудит кожного клієнта в базу даних",
            isCorrect: false,
            consequenceKey: "labs.crash.apiAct2WrongMsg",
            defaultConsequence: "База даних упала під лавиною запитів запису логів! Сервіс повністю недоступний.",
          },
        ],
      },
    ],
  },
  iot: {
    stationId: "iot",
    titleKey: "labs.crash.iotGateTitle",
    defaultTitle: "Атестаційний Краш-Тест: Аварія розумного будинку при збої сенсорів",
    timeLimitSeconds: 75,
    rewardXp: 60,
    certBadgeTitle: "Master of Embedded & IoT",
    incidents: [
      {
        id: "iot-inc-1",
        titleKey: "labs.crash.iotInc1Title",
        defaultTitle: "Інцидент 1: Заблоковано оптичний датчик під час руху воріт",
        descriptionKey: "labs.crash.iotInc1Desc",
        defaultDescription: "Ворота зачиняються, і промінь оптичного бар'єра фіксує перешкоду (автомобіль). Яка дія контролера є безпечною?",
        severity: "SEV-1",
        actions: [
          {
            id: "act-estop-reverse",
            labelKey: "labs.crash.iotAct1Correct",
            defaultLabel: "Миттєвий апаратний E-Stop двигуна та перехід у стан реверсу (повне відкриття)",
            isCorrect: true,
            consequenceKey: "labs.crash.iotAct1CorrectMsg",
            defaultConsequence: "Ворота негайно зупинилися і відкотилися назад! Автомобіль врятовано без жодної подряпини.",
          },
          {
            id: "act-force-close",
            labelKey: "labs.crash.iotAct1Wrong",
            defaultLabel: "Збільшити струм на реле двигуна для подолання опору",
            isCorrect: false,
            consequenceKey: "labs.crash.iotAct1WrongMsg",
            defaultConsequence: "Аварія! Двигун затиснув перешкоду, пошкодивши кузов авто та перегрівши обмотку мотора.",
          },
        ],
      },
      {
        id: "iot-inc-2",
        titleKey: "labs.crash.iotInc2Title",
        defaultTitle: "Інцидент 2: Обрив живлення під час оновлення прошивки (OTA)",
        descriptionKey: "labs.crash.iotInc2Desc",
        defaultDescription: "Під час перезапису секторів Flash-пам'яті мікроконтролера стрибнула напруга. Контролер перезавантажується. Дія завантажувача (Bootloader)?",
        severity: "SEV-1",
        actions: [
          {
            id: "act-dual-boot",
            labelKey: "labs.crash.iotAct2Correct",
            defaultLabel: "Перевірити CRC32 контрольної суми та виконати відкат до образу Dual-Boot у секторі B",
            isCorrect: true,
            consequenceKey: "labs.crash.iotAct2CorrectMsg",
            defaultConsequence: "Bootloader виявив битий сектор і за 100 мс підняв стабільну прошивку! Контролер збережено.",
          },
          {
            id: "act-boot-corrupted",
            labelKey: "labs.crash.iotAct2Wrong",
            defaultLabel: "Спробувати запустити пошкоджений бінарний код із нульової адреси Flash",
            isCorrect: false,
            consequenceKey: "labs.crash.iotAct2WrongMsg",
            defaultConsequence: "Kernel Panic! Мікроконтролер завис у нескінченному BootLoop ('Оцеглився').",
          },
        ],
      },
    ],
  },
};
