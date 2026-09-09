/**
 * @file packages/sim-engine/src/runtime/tasks-fintech.ts
 * @description Fintech POS terminal curriculum tasks with 3-round mastery requirements
 */

import type { VirtualPosState, PosRuntimeResult } from "./terminalContext";

export interface FintechTask {
  id: string;
  order: number;
  titleKey: string;
  conceptKey: string;
  descKey: string;
  hintKey: string;
  successKey: string;
  targetCode: {
    csharp: string;
    go: string;
  };
  clozeTemplate: {
    csharp: string;
    go: string;
  };
  initialState: VirtualPosState;
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
  },
  {
    id: "task-pos-fee-calculation",
    order: 2,
    titleKey: "fintechTask2.title",
    conceptKey: "fintechTask2.concept",
    descKey: "fintechTask2.desc",
    hintKey: "fintechTask2.hint",
    successKey: "fintechTask2.success",
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
  },
  {
    id: "task-pos-pin-lockout",
    order: 3,
    titleKey: "fintechTask3.title",
    conceptKey: "fintechTask3.concept",
    descKey: "fintechTask3.desc",
    hintKey: "fintechTask3.hint",
    successKey: "fintechTask3.success",
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
  },
  {
    id: "task-pos-batch-settlement",
    order: 4,
    titleKey: "fintechTask4.title",
    conceptKey: "fintechTask4.concept",
    descKey: "fintechTask4.desc",
    hintKey: "fintechTask4.hint",
    successKey: "fintechTask4.success",
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
          /for\s*\(\s*int\s+([a-zA-Z_]\w*)\s*=\s*0\s*;\s*\1\s*<\s*transactions\.Length\s*;\s*\1\+\+\s*\)/i.test(
            code
          )
      );
      const hasGoFor = Boolean(
        code &&
          /for\s+([a-zA-Z_]\w*)\s*:=\s*0\s*;\s*\1\s*<\s*len\s*\(\s*transactions\s*\)\s*;\s*\1\+\+/i.test(
            code
          )
      );
      const hasSum = Boolean(code && /dailyTotal\s*\+=\s*transactions\[/i.test(code));

      if (
        (hasCsharpFor || hasGoFor) &&
        hasSum &&
        after.dailyTotal === 550 &&
        after.receiptLines &&
        after.receiptLines.length > 0
      ) {
        return { passed: true, messageKey: "fintechTask4.success" };
      }

      return { passed: false, messageKey: "fintechTask4.failed" };
    },
  },
];
