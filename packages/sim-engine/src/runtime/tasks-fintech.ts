/**
 * @file packages/sim-engine/src/runtime/tasks-fintech.ts
 * @description Fintech POS terminal curriculum tasks with 3-round mastery requirements
 */

import type { VirtualPosState, PosRuntimeResult } from "./terminalContext";
export interface PosTransferVariant {
  prompt: Record<"ua" | "en" | "da", string>;
  hint: Record<"ua" | "en" | "da", string>;
  targetSnippetExample?: string;
  validate: (
    before: VirtualPosState,
    after: VirtualPosState,
    code: string,
    result?: PosRuntimeResult
  ) => boolean;
}

export interface FintechTask {
  id: string;
  order: number;
  titleKey: string;
  conceptKey: string;
  descKey: string;
  hintKey: string;
  successKey: string;
  /** i18n key for plain-language analogy explanation */
  simpleExplanationKey?: string;
  /** i18n key for engineering-precision explanation with English CS terms */
  engineeringKey?: string;
  targetCode: {
    csharp: string;
    go: string;
  };
  clozeTemplate: {
    csharp: string;
    go: string;
  };
  initialState: VirtualPosState;
  transferVariant?: PosTransferVariant;
  isBugfixTask?: boolean;
  initialBrokenCode?: {
    csharp: string;
    go: string;
  };
  defectDescription?: Record<"ua" | "en" | "da", string>;
  diagnosticLogs?: string[];
  validate: (
    before: VirtualPosState,
    after: VirtualPosState,
    result: PosRuntimeResult,
    code?: string
  ) => { passed: boolean; messageKey?: string };
}

export const FINTECH_TASKS: FintechTask[] = [
  {
    id: "task-pos-guard-clause",
    order: 1,
    titleKey: "fintechTask1.title",
    conceptKey: "fintechTask1.concept",
    descKey: "fintechTask1.desc",
    hintKey: "fintechTask1.hint",
    successKey: "fintechTask1.success",
    simpleExplanationKey: "fintechTask1.simple",
    engineeringKey: "fintechTask1.engineering",
    initialState: {
      balance: 500.0,
      transactionAmount: 750.0,
      status: "IDLE",
      terminalId: "POS-MAIN-01",
      accountHolder: "Олена Коваль",
    },
    targetCode: {
      csharp: `if (amount > balance) {
    status = "DECLINED";
    return;
}`,
      go: `if amount > balance {
    status = "DECLINED"
    return
}`,
    },
    clozeTemplate: {
      csharp: `if (___ > ___) {
    status = "___";
    return;
}`,
      go: `if ___ > ___ {
    status = "___"
    return
}`,
    },
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "fintechTask1.syntaxError" };
      }

      const hasGuard = Boolean(code && /if\s*\(?\s*amount\s*>\s*balance\s*\)?/i.test(code));
      const hasDeclined = Boolean(code && /status\s*=\s*["']DECLINED["']/i.test(code));
      const hasReturn = Boolean(code && /\breturn\b/i.test(code));

      if (hasGuard && hasDeclined && hasReturn && after.status === "DECLINED") {
        return { passed: true, messageKey: "fintechTask1.success" };
      }

      return { passed: false, messageKey: "fintechTask1.failed" };
    },
    transferVariant: {
      prompt: {
        ua: "Перевірка ліміту: додайте умову, що якщо сума транзакції перевищує 500 (amount > 500), статус встановлюється в \"DECLINED\" і виконання завершується (return;).",
        en: "Limit check: add a condition where if transaction amount exceeds 500 (amount > 500), status is set to \"DECLINED\" and execution returns (return;).",
        da: "Grænsekontrol: tilføj en betingelse om, at hvis transaktionsbeløbet overstiger 500 (amount > 500), sættes status til \"DECLINED\", og udførelsen stopper (return;).",
      },
      hint: {
        ua: "if (amount > 500) { status = \"DECLINED\"; return; }",
        en: "if (amount > 500) { status = \"DECLINED\"; return; }",
        da: "if (amount > 500) { status = \"DECLINED\"; return; }",
      },
      targetSnippetExample: "if (amount > 500) {\n    status = \"DECLINED\";\n    return;\n}",
      validate: (_before, after, code) =>
        after.status === "DECLINED" &&
        Boolean(code && /500/.test(code) && /return/i.test(code)),
    },
  },
  {
    id: "task-pos-fee-calculation",
    order: 2,
    titleKey: "fintechTask2.title",
    conceptKey: "fintechTask2.concept",
    descKey: "fintechTask2.desc",
    hintKey: "fintechTask2.hint",
    successKey: "fintechTask2.success",
    simpleExplanationKey: "fintechTask2.simple",
    engineeringKey: "fintechTask2.engineering",
    initialState: {
      balance: 500.0,
      transactionAmount: 120.0,
      fee: 15.0,
      totalAmount: 0.0,
      status: "IDLE",
      terminalId: "POS-MAIN-01",
      accountHolder: "Олена Коваль",
    },
    targetCode: {
      csharp: `totalAmount = amount + fee;
balance -= totalAmount;
status = "APPROVED";`,
      go: `totalAmount = amount + fee
balance -= totalAmount
status = "APPROVED"`,
    },
    clozeTemplate: {
      csharp: `totalAmount = ___ + ___;
balance -= ___;
status = "___";`,
      go: `totalAmount = ___ + ___
balance -= ___
status = "___"`,
    },
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "fintechTask2.syntaxError" };
      }

      const hasTotal = Boolean(
        code && /totalAmount\s*=\s*(amount\s*\+\s*fee|fee\s*\+\s*amount)/i.test(code)
      );
      const hasDeduct = Boolean(
        code && /(balance\s*-=\s*totalAmount|balance\s*=\s*balance\s*-\s*totalAmount)/i.test(code)
      );
      const hasApproved = Boolean(code && /status\s*=\s*["']APPROVED["']/i.test(code));

      if (
        hasTotal &&
        hasDeduct &&
        hasApproved &&
        after.totalAmount === 135 &&
        after.balance === 365 &&
        after.status === "APPROVED"
      ) {
        return { passed: true, messageKey: "fintechTask2.success" };
      }

      return { passed: false, messageKey: "fintechTask2.failed" };
    },
    transferVariant: {
      prompt: {
        ua: "Фіксована комісія: встановіть комісію в 25 (fee = 25;), оновіть totalAmount = amount + fee; та спишіть суму з балансу (balance -= totalAmount;) зі статусом \"APPROVED\".",
        en: "Flat fee calculation: set fee to 25 (fee = 25;), calculate totalAmount = amount + fee;, and deduct from balance (balance -= totalAmount;) with status \"APPROVED\".",
        da: "Fast gebyrberegning: sæt gebyr til 25 (fee = 25;), beregn totalAmount = amount + fee;, og træk fra saldoen (balance -= totalAmount;) med status \"APPROVED\".",
      },
      hint: {
        ua: "fee = 25; totalAmount = amount + fee; balance -= totalAmount; status = \"APPROVED\";",
        en: "fee = 25; totalAmount = amount + fee; balance -= totalAmount; status = \"APPROVED\";",
        da: "fee = 25; totalAmount = amount + fee; balance -= totalAmount; status = \"APPROVED\";",
      },
      targetSnippetExample: "fee = 25;\ntotalAmount = amount + fee;\nbalance -= totalAmount;\nstatus = \"APPROVED\";",
      validate: (_before, after) =>
        after.status === "APPROVED" &&
        after.totalAmount === 145 &&
        after.balance === 355,
    },
  },
  {
    id: "task-pos-pin-lockout",
    order: 3,
    titleKey: "fintechTask3.title",
    conceptKey: "fintechTask3.concept",
    descKey: "fintechTask3.desc",
    hintKey: "fintechTask3.hint",
    successKey: "fintechTask3.success",
    simpleExplanationKey: "fintechTask3.simple",
    engineeringKey: "fintechTask3.engineering",
    initialState: {
      balance: 500.0,
      transactionAmount: 50.0,
      status: "IDLE",
      pin: 1234,
      enteredPin: 9999,
      failedAttempts: 2,
      isLocked: false,
      terminalId: "POS-MAIN-01",
      accountHolder: "Олена Коваль",
    },
    targetCode: {
      csharp: `if (pin != enteredPin) {
    failedAttempts++;
    if (failedAttempts >= 3) {
        isLocked = true;
        status = "BLOCKED";
    }
}`,
      go: `if pin != enteredPin {
    failedAttempts++
    if failedAttempts >= 3 {
        isLocked = true
        status = "BLOCKED"
    }
}`,
    },
    clozeTemplate: {
      csharp: `if (pin != ___) {
    ___++;
    if (failedAttempts >= ___) {
        isLocked = ___;
        status = "___";
    }
}`,
      go: `if pin != ___ {
    ___++
    if failedAttempts >= ___ {
        isLocked = ___
        status = "___"
    }
}`,
    },
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "fintechTask3.syntaxError" };
      }

      const hasPinCheck = Boolean(code && /if\s*\(?\s*pin\s*!=\s*enteredPin\s*\)?/i.test(code));
      const hasAttemptsInc = Boolean(
        code && /(failedAttempts\+\+|failedAttempts\s*=\s*failedAttempts\s*\+\s*1)/i.test(code)
      );
      const hasLimitCheck = Boolean(
        code && /if\s*\(?\s*failedAttempts\s*>=\s*3\s*\)?/i.test(code)
      );
      const hasLocked = Boolean(code && /isLocked\s*=\s*true/i.test(code));
      const hasBlocked = Boolean(code && /status\s*=\s*["']BLOCKED["']/i.test(code));

      if (
        hasPinCheck &&
        hasAttemptsInc &&
        hasLimitCheck &&
        hasLocked &&
        hasBlocked &&
        after.isLocked === true &&
        after.status === "BLOCKED" &&
        (after.failedAttempts ?? 0) >= 3
      ) {
        return { passed: true, messageKey: "fintechTask3.success" };
      }

      return { passed: false, messageKey: "fintechTask3.failed" };
    },
    transferVariant: {
      prompt: {
        ua: "Строгий ліміт безпеки: змініть умову так, щоб термінал блокувався вже після 2 помилкових спроб (failedAttempts >= 2), встановлюючи isLocked = true; та status = \"BLOCKED\";.",
        en: "Strict security lockout: change condition to lock the terminal after 2 failed attempts (failedAttempts >= 2), setting isLocked = true; and status = \"BLOCKED\";.",
        da: "Streng sikkerhedslås: ændr betingelsen til at låse terminalen efter 2 mislykkede forsøg (failedAttempts >= 2), og sæt isLocked = true; samt status = \"BLOCKED\";.",
      },
      hint: {
        ua: "if (pin != enteredPin) { failedAttempts++; if (failedAttempts >= 2) { isLocked = true; status = \"BLOCKED\"; } }",
        en: "if (pin != enteredPin) { failedAttempts++; if (failedAttempts >= 2) { isLocked = true; status = \"BLOCKED\"; } }",
        da: "if (pin != enteredPin) { failedAttempts++; if (failedAttempts >= 2) { isLocked = true; status = \"BLOCKED\"; } }",
      },
      targetSnippetExample: "if (pin != enteredPin) {\n    failedAttempts++;\n    if (failedAttempts >= 2) {\n        isLocked = true;\n        status = \"BLOCKED\";\n    }\n}",
      validate: (_before, after, code) =>
        after.isLocked === true &&
        after.status === "BLOCKED" &&
        Boolean(code && /(?:>=|>)\s*2/.test(code)),
    },
  },
  {
    id: "task-pos-batch-settlement",
    order: 4,
    titleKey: "fintechTask4.title",
    conceptKey: "fintechTask4.concept",
    descKey: "fintechTask4.desc",
    hintKey: "fintechTask4.hint",
    successKey: "fintechTask4.success",
    simpleExplanationKey: "fintechTask4.simple",
    engineeringKey: "fintechTask4.engineering",
    initialState: {
      balance: 1200.0,
      transactionAmount: 0.0,
      status: "IDLE",
      transactions: [120, 45, 300, 85],
      dailyTotal: 0.0,
      receiptLines: [],
      terminalId: "POS-MAIN-01",
      accountHolder: "Олена Коваль",
    },
    targetCode: {
      csharp: `for (int i = 0; i < transactions.Length; i++) {
    dailyTotal += transactions[i];
}`,
      go: `for i := 0; i < len(transactions); i++ {
    dailyTotal += transactions[i]
}`,
    },
    clozeTemplate: {
      csharp: `for (int i = 0; i < transactions.___; i++) {
    dailyTotal += ___[i];
}`,
      go: `for i := 0; i < len(___); i++ {
    dailyTotal += ___[i]
}`,
    },
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "fintechTask4.syntaxError" };
      }

      const hasCsharpFor = Boolean(
        code &&
          /for\s*\(\s*(?:int|var)\s+([a-zA-Z_]\w*)\s*=\s*0\s*;\s*\1\s*<\s*transactions\.Length\s*;\s*(?:\1\+\+|\+\+\1|\1\s*\+=\s*1|\1\s*=\s*\1\s*\+\s*1)\s*\)/i.test(
            code
          )
      );
      const hasCsharpForeach = Boolean(
        code &&
          /foreach\s*\(\s*(?:var|int|double|decimal|float)\s+([a-zA-Z_]\w*)\s+in\s+transactions\s*\)/i.test(
            code
          )
      );
      const hasGoFor = Boolean(
        code &&
          /for\s+([a-zA-Z_]\w*)\s*:=\s*0\s*;\s*\1\s*<\s*len\s*\(\s*transactions\s*\)\s*;\s*(?:\1\+\+|\+\+\1|\1\s*\+=\s*1|\1\s*=\s*\1\s*\+\s*1)/i.test(
            code
          )
      );
      const hasGoRange = Boolean(
        code &&
          /for\s+(?:([a-zA-Z_]\w*|_)\s*,\s*)?([a-zA-Z_]\w*)\s*:=\s*range\s+transactions/i.test(
            code
          )
      );
      const hasSum = Boolean(
        code &&
          /dailyTotal\s*(?:\+=|=.*dailyTotal\s*\+)\s*(?:transactions\[|[a-zA-Z_]\w*)/i.test(code)
      );

      if (
        (hasCsharpFor || hasCsharpForeach || hasGoFor || hasGoRange) &&
        hasSum &&
        after.dailyTotal === 550 &&
        after.receiptLines &&
        after.receiptLines.length > 0
      ) {
        return { passed: true, messageKey: "fintechTask4.success" };
      }

      return { passed: false, messageKey: "fintechTask4.failed" };
    },
    transferVariant: {
      prompt: {
        ua: "Фіналізація звіту каси: після циклу підрахунку dailyTotal додайте фіксацію статусу касового дня status = \"SETTLED\";.",
        en: "Register reconciliation: after the dailyTotal loop, finalize the register batch status: status = \"SETTLED\";.",
        da: "Kasseafstemning: efter dailyTotal-løkken, afslut kassebunkens status: status = \"SETTLED\";.",
      },
      hint: {
        ua: "Після циклу for додайте команду status = \"SETTLED\";",
        en: "After the for loop, add statement status = \"SETTLED\";",
        da: "Efter for-løkken, tilføj status = \"SETTLED\";",
      },
      targetSnippetExample: "for (int i = 0; i < transactions.Length; i++) {\n    dailyTotal += transactions[i];\n}\nstatus = \"SETTLED\";",
      validate: (_before, after) =>
        after.dailyTotal === 550 && after.status === "SETTLED",
    },
  },
  {
    id: "task-pos-interface-polymorphism",
    order: 5,
    titleKey: "fintechTask5.title",
    conceptKey: "fintechTask5.concept",
    descKey: "fintechTask5.desc",
    hintKey: "fintechTask5.hint",
    successKey: "fintechTask5.success",
    simpleExplanationKey: "fintechTask5.simple",
    engineeringKey: "fintechTask5.engineering",
    initialState: {
      balance: 500.0,
      transactionAmount: 150.0,
      totalAmount: 150.0,
      fee: 0.0,
      status: "IDLE",
      terminalId: "POS-MAIN-01",
      accountHolder: "Олена Коваль",
      activeGateway: "DankortGateway",
      isGatewayRegistered: true,
      gatewayApproved: true,
    },
    targetCode: {
      csharp: `bool approved = gateway.Charge(totalAmount);
if (!approved) {
    status = "DECLINED";
    return;
}
status = "APPROVED";`,
      go: `approved := gateway.Charge(totalAmount)
if !approved {
    status = "DECLINED"
    return
}
status = "APPROVED"`,
    },
    clozeTemplate: {
      csharp: `bool approved = gateway.Charge(___);
if (!___) {
    status = "DECLINED";
    return;
}
status = "___";`,
      go: `approved := gateway.Charge(___)
if !___ {
    status = "DECLINED"
    return
}
status = "___"`,
    },
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "fintechTask5.syntaxError" };
      }

      const hasCharge = Boolean(
        code && /gateway\s*\.\s*Charge\s*\(\s*totalAmount\s*\)/i.test(code)
      );
      const hasGuard = Boolean(code && /if\s*\(?\s*!approved\s*\)?/i.test(code));
      const hasDeclined = Boolean(code && /status\s*=\s*["']DECLINED["']/i.test(code));
      const hasApproved = Boolean(code && /status\s*=\s*["']APPROVED["']/i.test(code));

      if (hasCharge && hasGuard && hasDeclined && hasApproved && after.status === "APPROVED") {
        return { passed: true, messageKey: "fintechTask5.success" };
      }

      return { passed: false, messageKey: "fintechTask5.failed" };
    },
    transferVariant: {
      prompt: {
        ua: "Захист ліміту операцій: перед списанням коштів gateway.Charge(totalAmount) перевірте, чи totalAmount <= 500. Якщо ліміт перевищено — встановіть status = \"DECLINED\"; та поверніть керування (return;).",
        en: "Transaction limit guard: before calling gateway.Charge(totalAmount), ensure totalAmount <= 500. If exceeded, set status = \"DECLINED\"; and return;.",
        da: "Transaktionsgrænsekontrol: før kald af gateway.Charge(totalAmount), sørg for totalAmount <= 500. Hvis overskredet, sæt status = \"DECLINED\"; og return;.",
      },
      hint: {
        ua: "if (totalAmount > 500) { status = \"DECLINED\"; return; } bool approved = gateway.Charge(totalAmount);",
        en: "if (totalAmount > 500) { status = \"DECLINED\"; return; } bool approved = gateway.Charge(totalAmount);",
        da: "if (totalAmount > 500) { status = \"DECLINED\"; return; } bool approved = gateway.Charge(totalAmount);",
      },
      targetSnippetExample: "if (totalAmount > 500) {\n    status = \"DECLINED\";\n    return;\n}\nbool approved = gateway.Charge(totalAmount);\nstatus = \"APPROVED\";",
      validate: (_before, after, code) =>
        after.status === "APPROVED" &&
        Boolean(code && /500/.test(code) && /Charge/i.test(code)),
    },
  },
  {
    id: "task-pos-dependency-injection",
    order: 6,
    titleKey: "fintechTask6.title",
    conceptKey: "fintechTask6.concept",
    descKey: "fintechTask6.desc",
    hintKey: "fintechTask6.hint",
    successKey: "fintechTask6.success",
    simpleExplanationKey: "fintechTask6.simple",
    engineeringKey: "fintechTask6.engineering",
    initialState: {
      balance: 500.0,
      transactionAmount: 200.0,
      totalAmount: 200.0,
      fee: 0.0,
      status: "IDLE",
      terminalId: "POS-MAIN-01",
      accountHolder: "Олена Коваль",
      activeGateway: null,
      isGatewayRegistered: false,
    },
    targetCode: {
      csharp: `services.AddScoped<IPaymentGateway, DankortGateway>();`,
      go: `container.Register("payment_gateway", NewDankortGateway())`,
    },
    clozeTemplate: {
      csharp: `services.AddScoped<___, DankortGateway>();`,
      go: `container.Register("___", NewDankortGateway())`,
    },
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "fintechTask6.syntaxError" };
      }

      const hasCsharpDi = Boolean(
        code &&
          /services\s*\.\s*AddScoped\s*<\s*IPaymentGateway\s*,\s*DankortGateway\s*>\s*\(\s*\)/i.test(
            code
          )
      );
      const hasGoDi = Boolean(
        code &&
          /container\s*\.\s*Register\s*\(\s*["']payment_gateway["']\s*,\s*NewDankortGateway\s*\(\s*\)\s*\)/i.test(
            code
          )
      );

      if (
        (hasCsharpDi || hasGoDi) &&
        after.isGatewayRegistered === true &&
        after.activeGateway === "DankortGateway"
      ) {
        return { passed: true, messageKey: "fintechTask6.success" };
      }

      return { passed: false, messageKey: "fintechTask6.failed" };
    },
    transferVariant: {
      prompt: {
        ua: "Реєстрація Singleton: зареєструйте платіжний шлюз як Singleton через services.AddSingleton<IPaymentGateway, DankortGateway>(); (або Go: container.RegisterSingleton(\"payment_gateway\", NewDankortGateway())).",
        en: "Singleton Registration: register the gateway as a Singleton via services.AddSingleton<IPaymentGateway, DankortGateway>(); (or Go: container.RegisterSingleton(\"payment_gateway\", NewDankortGateway())).",
        da: "Singleton registrering: registrer gatewayen som Singleton via services.AddSingleton<IPaymentGateway, DankortGateway>(); (eller Go: container.RegisterSingleton(\"payment_gateway\", NewDankortGateway())).",
      },
      hint: {
        ua: "Замініть AddScoped на AddSingleton",
        en: "Replace AddScoped with AddSingleton",
        da: "Erstat AddScoped med AddSingleton",
      },
      targetSnippetExample: "services.AddSingleton<IPaymentGateway, DankortGateway>();",
      validate: (_before, after, code) =>
        after.isGatewayRegistered === true &&
        Boolean(code && /AddSingleton|RegisterSingleton/i.test(code)),
    },
  },
  {
    id: "task-pos-double-deduction-bug",
    order: 7,
    titleKey: "fintechTask7.title",
    conceptKey: "fintechTask7.concept",
    descKey: "fintechTask7.desc",
    hintKey: "fintechTask7.hint",
    successKey: "fintechTask7.success",
    simpleExplanationKey: "fintechTask7.simple",
    engineeringKey: "fintechTask7.engineering",
    isBugfixTask: true,
    initialState: {
      balance: 1000.0,
      transactionAmount: 200.0,
      status: "IDLE",
      terminalId: "POS-AUDIT-09",
      accountHolder: "Олена Коваль",
      fee: 10.0,
      totalAmount: 0,
    },
    initialBrokenCode: {
      csharp: `// ⚠️ ДЕФЕКТ: Фінансовий аудит виявив розбіжність каси!
// Комісія списується двічі: окремо (balance -= fee) та в складі totalAmount (balance -= totalAmount).
// Виправте подвійну мутацію балансу, видаливши зайве списання комісії.

decimal fee = 10;
decimal totalAmount = amount + fee;
balance -= fee;
balance -= totalAmount;
status = "APPROVED";`,
      go: `// ⚠️ ДЕФЕКТ: Фінансовий аудит виявив розбіжність каси!
// Комісія списується двічі: окремо (balance -= fee) та в складі totalAmount.
// Виправте подвійну мутацію балансу, видаливши зайве списання.

fee := 10
totalAmount := amount + fee
balance -= fee
balance -= totalAmount
status = "APPROVED"`,
    },
    targetCode: {
      csharp: `decimal fee = 10;
decimal totalAmount = amount + fee;
balance -= totalAmount;
status = "APPROVED";`,
      go: `fee := 10
totalAmount := amount + fee
balance -= totalAmount
status = "APPROVED"`,
    },
    clozeTemplate: {
      csharp: `decimal fee = 10;
decimal totalAmount = amount + fee;
balance -= ___;
status = "APPROVED";`,
      go: `fee := 10
totalAmount := amount + fee
balance -= ___
status = "APPROVED"`,
    },
    defectDescription: {
      ua: "Подвійне списання комісії: стан balance модифікується двічі (спочатку balance -= fee, а потім balance -= totalAmount, де fee вже враховано). Баланс зменшується на 220 замість 210.",
      en: "Double fee mutation: state variable balance is subtracted twice (once via balance -= fee, and again via balance -= totalAmount where fee is already aggregated). Balance reduces by 220 instead of 210.",
      da: "Dobbelt gebyrfradrag: saldovariablen trækkes to gange (balance -= fee og balance -= totalAmount, hvor gebyret allerede er inkluderet). Saldoen reduceres med 220 i stedet for 210.",
    },
    diagnosticLogs: [
      "[AUDIT ALERT] Reconciliation failure on terminal POS-AUDIT-09",
      "[LEDGER MISMATCH] Expected Balance: $790.00 | Actual Ledger Balance: $780.00",
      "[MUTATION TRACE] balance mutated 2 times in single transaction sequence (Double deduction detected)",
      "[STATUS] POS IN FAULT: Redundant mutation must be eliminated.",
    ],
    validate: (_before, after, result, code) => {
      if (!result.success) {
        return { passed: false, messageKey: "fintechTask7.syntaxError" };
      }
      const hasDoubleFee = Boolean(
        code &&
          /balance\s*-=\s*fee/i.test(code) &&
          /balance\s*-=\s*totalAmount/i.test(code)
      );
      if (hasDoubleFee) {
        return { passed: false, messageKey: "fintechTask7.doubleDeductionFailed" };
      }
      if (after.status === "APPROVED" && after.balance === 790 && after.totalAmount === 210) {
        return { passed: true, messageKey: "fintechTask7.success" };
      }
      return { passed: false, messageKey: "fintechTask7.failed" };
    },
    transferVariant: {
      prompt: {
        ua: "Аудит комісії 25 грн: обчисліть комісію 25 грн, скомпонуйте totalAmount = amount + fee та спишіть лише totalAmount.",
        en: "Audit 25 UAH fee: compute fee 25, compose totalAmount = amount + fee, and subtract only totalAmount.",
        da: "Audit 25 DKK gebyr: beregn gebyr 25, sammensæt totalAmount = amount + fee, og fratræk kun totalAmount.",
      },
      hint: {
        ua: "fee = 25; totalAmount = amount + fee; balance -= totalAmount;",
        en: "fee = 25; totalAmount = amount + fee; balance -= totalAmount;",
        da: "fee = 25; totalAmount = amount + fee; balance -= totalAmount;",
      },
      targetSnippetExample: "decimal fee = 25;\ndecimal totalAmount = amount + fee;\nbalance -= totalAmount;\nstatus = \"APPROVED\";",
      validate: (_before, after, code) =>
        Boolean(
          code &&
            !/balance\s*-=\s*fee/i.test(code) &&
            after.status === "APPROVED" &&
            after.balance === 775
        ),
    },
  },
];
