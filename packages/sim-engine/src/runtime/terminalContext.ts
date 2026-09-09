/**
 * @file packages/sim-engine/src/runtime/terminalContext.ts
 * @description Virtual POS Terminal execution environment with balance protection, fee calculation, PIN locking, and batch settlement
 */

export type PosStatus = "IDLE" | "APPROVED" | "DECLINED" | "BLOCKED" | "SETTLED";

export interface VirtualPosState {
  balance: number;
  transactionAmount: number;
  status: PosStatus;
  terminalId?: string;
  accountHolder?: string;
  totalAmount?: number;
  fee?: number;
  failedAttempts?: number;
  isLocked?: boolean;
  pin?: number;
  enteredPin?: number;
  transactions?: number[];
  dailyTotal?: number;
  receiptLines?: string[];
}

export interface PosLogEntry {
  type: "info" | "mutation" | "error" | "security";
  message: string;
}

export interface PosRuntimeResult {
  success: boolean;
  newState: VirtualPosState;
  logs: PosLogEntry[];
  error?: string;
  earlyReturn?: boolean;
}

export class VirtualPOS {
  private _balance: number;
  private _amount: number;
  private _status: PosStatus;
  private _terminalId: string;
  private _accountHolder: string;
  private _totalAmount: number;
  private _fee: number;
  private _failedAttempts: number;
  private _isLocked: boolean;
  private _pin: number;
  private _enteredPin: number;
  private _transactions: number[];
  private _dailyTotal: number;
  private _receiptLines: string[];
  private _logs: PosLogEntry[] = [];
  private _mutationsCount = 0;

  constructor(initial: VirtualPosState) {
    this._balance = initial.balance ?? 500;
    this._amount = initial.transactionAmount ?? 0;
    this._status = initial.status ?? "IDLE";
    this._terminalId = initial.terminalId || "POS-7402-PRO";
    this._accountHolder = initial.accountHolder || "Alex Rivera";
    this._totalAmount = initial.totalAmount ?? 0;
    this._fee = initial.fee ?? 0;
    this._failedAttempts = initial.failedAttempts ?? 0;
    this._isLocked = initial.isLocked ?? false;
    this._pin = initial.pin ?? 1234;
    this._enteredPin = initial.enteredPin ?? 1234;
    this._transactions = initial.transactions ? [...initial.transactions] : [120, 45, 300, 85];
    this._dailyTotal = initial.dailyTotal ?? 0;
    this._receiptLines = initial.receiptLines ? [...initial.receiptLines] : [];
  }

  // ── Property: Balance ───────────────────────────────────────
  get Balance(): number {
    return this._balance;
  }
  set Balance(val: number) {
    this._balance = Math.max(0, Math.round(Number(val) * 100) / 100);
    this._mutationsCount++;
    this._logs.push({
      type: "mutation",
      message: `balance = $${this._balance.toFixed(2)}`,
    });
  }
  get balance(): number {
    return this.Balance;
  }
  set balance(val: number) {
    this.Balance = val;
  }

  // ── Property: Transaction Amount ────────────────────────────
  get Amount(): number {
    return this._amount;
  }
  set Amount(val: number) {
    this._amount = Math.max(0, Math.round(Number(val) * 100) / 100);
    this._mutationsCount++;
    this._logs.push({
      type: "mutation",
      message: `amount = $${this._amount.toFixed(2)}`,
    });
  }
  get amount(): number {
    return this.Amount;
  }
  set amount(val: number) {
    this.Amount = val;
  }

  // ── Property: Total Amount ──────────────────────────────────
  get TotalAmount(): number {
    return this._totalAmount;
  }
  set TotalAmount(val: number) {
    this._totalAmount = Math.max(0, Math.round(Number(val) * 100) / 100);
    this._mutationsCount++;
    this._logs.push({
      type: "mutation",
      message: `totalAmount = $${this._totalAmount.toFixed(2)}`,
    });
  }
  get totalAmount(): number {
    return this.TotalAmount;
  }
  set totalAmount(val: number) {
    this.TotalAmount = val;
  }

  // ── Property: Fee ───────────────────────────────────────────
  get Fee(): number {
    return this._fee;
  }
  set Fee(val: number) {
    this._fee = Math.max(0, Math.round(Number(val) * 100) / 100);
    this._mutationsCount++;
    this._logs.push({
      type: "mutation",
      message: `fee = $${this._fee.toFixed(2)}`,
    });
  }
  get fee(): number {
    return this.Fee;
  }
  set fee(val: number) {
    this.Fee = val;
  }

  // ── Property: Failed Attempts ───────────────────────────────
  get FailedAttempts(): number {
    return this._failedAttempts;
  }
  set FailedAttempts(val: number) {
    this._failedAttempts = Math.max(0, Math.floor(Number(val)));
    this._mutationsCount++;
    this._logs.push({
      type: "security",
      message: `failedAttempts = ${this._failedAttempts}`,
    });
  }
  get failedAttempts(): number {
    return this.FailedAttempts;
  }
  set failedAttempts(val: number) {
    this.FailedAttempts = val;
  }

  // ── Property: Is Locked ─────────────────────────────────────
  get IsLocked(): boolean {
    return this._isLocked;
  }
  set IsLocked(val: boolean) {
    this._isLocked = Boolean(val);
    this._mutationsCount++;
    this._logs.push({
      type: "security",
      message: `isLocked = ${this._isLocked}`,
    });
  }
  get isLocked(): boolean {
    return this.IsLocked;
  }
  set isLocked(val: boolean) {
    this.IsLocked = val;
  }

  // ── Property: PIN & Entered PIN ─────────────────────────────
  get Pin(): number {
    return this._pin;
  }
  set Pin(val: number) {
    this._pin = Number(val);
  }
  get pin(): number {
    return this.Pin;
  }
  set pin(val: number) {
    this.Pin = val;
  }

  get EnteredPin(): number {
    return this._enteredPin;
  }
  set EnteredPin(val: number) {
    this._enteredPin = Number(val);
  }
  get enteredPin(): number {
    return this.EnteredPin;
  }
  set enteredPin(val: number) {
    this.EnteredPin = val;
  }

  // ── Property: Transactions Array ────────────────────────────
  get Transactions(): number[] {
    return this._transactions;
  }
  set Transactions(val: number[]) {
    this._transactions = Array.isArray(val) ? [...val] : [];
  }
  get transactions(): number[] {
    return this.Transactions;
  }
  set transactions(val: number[]) {
    this.Transactions = val;
  }

  // ── Property: Daily Total ───────────────────────────────────
  get DailyTotal(): number {
    return this._dailyTotal;
  }
  set DailyTotal(val: number) {
    this._dailyTotal = Math.max(0, Math.round(Number(val) * 100) / 100);
    this._mutationsCount++;
    this._logs.push({
      type: "mutation",
      message: `dailyTotal = $${this._dailyTotal.toFixed(2)}`,
    });
  }
  get dailyTotal(): number {
    return this.DailyTotal;
  }
  set dailyTotal(val: number) {
    this.DailyTotal = val;
  }

  // ── Property: Receipt Lines ─────────────────────────────────
  get ReceiptLines(): string[] {
    return this._receiptLines;
  }
  set ReceiptLines(val: string[]) {
    this._receiptLines = Array.isArray(val) ? [...val] : [];
    this._mutationsCount++;
    this._logs.push({
      type: "info",
      message: `Друк чека: ${this._receiptLines.length} рядків сформовано`,
    });
  }
  get receiptLines(): string[] {
    return this.ReceiptLines;
  }
  set receiptLines(val: string[]) {
    this.ReceiptLines = val;
  }

  // ── Property: Status ────────────────────────────────────────
  get Status(): PosStatus {
    return this._status;
  }
  set Status(val: string) {
    const clean = String(val).replace(/["';\s]/g, "").toUpperCase();
    if (
      clean === "APPROVED" ||
      clean === "DECLINED" ||
      clean === "IDLE" ||
      clean === "BLOCKED" ||
      clean === "SETTLED"
    ) {
      this._status = clean as PosStatus;
      this._mutationsCount++;
      this._logs.push({
        type:
          clean === "APPROVED" || clean === "SETTLED"
            ? "mutation"
            : clean === "BLOCKED" || clean === "DECLINED"
            ? "security"
            : "info",
        message: `status = "${this._status}"`,
      });
    }
  }
  get status(): PosStatus {
    return this.Status;
  }
  set status(val: string) {
    this.Status = val;
  }

  get terminalId(): string {
    return this._terminalId;
  }
  get accountHolder(): string {
    return this._accountHolder;
  }

  public getSnapshot(): VirtualPosState {
    return {
      balance: this._balance,
      transactionAmount: this._amount,
      status: this._status,
      terminalId: this._terminalId,
      accountHolder: this._accountHolder,
      totalAmount: this._totalAmount,
      fee: this._fee,
      failedAttempts: this._failedAttempts,
      isLocked: this._isLocked,
      pin: this._pin,
      enteredPin: this._enteredPin,
      transactions: [...this._transactions],
      dailyTotal: this._dailyTotal,
      receiptLines: [...this._receiptLines],
    };
  }

  public getLogs(): PosLogEntry[] {
    return [...this._logs];
  }

  public getMutationsCount(): number {
    return this._mutationsCount;
  }
}

/**
 * Execute script against VirtualPOS with support for:
 * 1. Guard Clauses and Early Returns (Task 1)
 * 2. State Mutation & Fee Calculation (Task 2)
 * 3. PIN Lockout & Guard Counter (Task 3)
 * 4. For-Loop Batch Settlement (Task 4)
 */
export function executePosScript(
  code: string,
  currentState: VirtualPosState
): PosRuntimeResult {
  const pos = new VirtualPOS(currentState);
  const logs: PosLogEntry[] = [];

  try {
    // Hardware security constraint: If terminal is already locked, block all operations
    if (currentState.isLocked) {
      return {
        success: false,
        newState: pos.getSnapshot(),
        logs: [
          ...pos.getLogs(),
          {
            type: "security",
            message: "ТЕРМІНАЛ ЗАБЛОКОВАНО: Будь-які операції заборонено!",
          },
        ],
        error: "TERMINAL IS LOCKED",
      };
    }

    const rawLines = code
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("//") && !l.startsWith("/*"));

    const normalized = rawLines.join(" ");

    // ── Task 4: For Loop / Batch Settlement ───────────────────
    // C#: for (int i = 0; i < transactions.Length; i++) { dailyTotal += transactions[i]; }
    // Go: for i := 0; i < len(transactions); i++ { dailyTotal += transactions[i] }
    const csharpForPattern = /for\s*\(\s*int\s+([a-zA-Z_]\w*)\s*=\s*0\s*;\s*\1\s*<\s*transactions\.Length\s*;\s*\1\+\+\s*\)\s*\{([^}]*)\}/i;
    const goForPattern = /for\s+([a-zA-Z_]\w*)\s*:=\s*0\s*;\s*\1\s*<\s*len\s*\(\s*transactions\s*\)\s*;\s*\1\+\+\s*\{([^}]*)\}/i;

    const forMatch = normalized.match(csharpForPattern) || normalized.match(goForPattern);
    if (forMatch) {
      const loopVar = forMatch[1];
      const body = forMatch[2];

      const accumulatePattern = new RegExp(
        `dailyTotal\\s*\\+=\\s*transactions\\[${loopVar}\\]|dailyTotal\\s*=\\s*dailyTotal\\s*\\+\\s*transactions\\[${loopVar}\\]`,
        "i"
      );

      if (accumulatePattern.test(body)) {
        let sum = 0;
        for (let i = 0; i < pos.transactions.length; i++) {
          sum += pos.transactions[i];
        }
        pos.dailyTotal += sum;
        pos.status = "SETTLED";

        pos.receiptLines = [
          "=== Z-REPORT: BATCH SETTLEMENT ===",
          `TERMINAL: ${pos.terminalId}`,
          `DATE: ${new Date().toISOString().slice(0, 10)} 18:00`,
          "BATCH: #0042 • EMV BATCH CLOSED",
          "--------------------------------",
          ...pos.transactions.map(
            (tx, idx) => `TX #${String(idx + 1).padStart(2, "0")}: $${tx.toFixed(2)}`
          ),
          "--------------------------------",
          `DAILY TOTAL: $${pos.dailyTotal.toFixed(2)}`,
          "STATUS: BATCH SETTLED & CLOSED",
          "================================",
        ];

        logs.push({
          type: "mutation",
          message: `Цикл for підсумував ${pos.transactions.length} транзакцій: dailyTotal = $${pos.dailyTotal.toFixed(2)}`,
        });

        return {
          success: true,
          newState: pos.getSnapshot(),
          logs: [...pos.getLogs(), ...logs],
        };
      }
    }

    // ── Task 3: PIN Protection & Lockout Counter ─────────────
    // if (pin != enteredPin) { failedAttempts++; if (failedAttempts >= 3) { isLocked = true; status = "BLOCKED"; } }
    // if pin != enteredPin { failedAttempts++ \n if failedAttempts >= 3 { isLocked = true \n status = "BLOCKED" } }
    const pinCheckPattern = /if\s*\(?\s*pin\s*!=\s*enteredPin\s*\)?\s*\{/i;
    if (pinCheckPattern.test(normalized)) {
      if (pos.pin !== pos.enteredPin) {
        logs.push({
          type: "security",
          message: `PIN-код не збігається (pin: ${pos.pin}, enteredPin: ${pos.enteredPin})`,
        });

        if (
          /failedAttempts\+\+/i.test(normalized) ||
          /failedAttempts\s*=\s*failedAttempts\s*\+\s*1/i.test(normalized)
        ) {
          pos.failedAttempts++;
        }

        if (/if\s*\(?\s*failedAttempts\s*>=\s*3\s*\)?/i.test(normalized)) {
          if (pos.failedAttempts >= 3) {
            if (/isLocked\s*=\s*true/i.test(normalized)) {
              pos.isLocked = true;
            }
            if (/status\s*=\s*["']BLOCKED["']/i.test(normalized)) {
              pos.status = "BLOCKED";
            }
            logs.push({
              type: "security",
              message: "ТЕРМІНАЛ ЗАБЛОКОВАНО: перевищено ліміт 3 спроб введення PIN!",
            });
          }
        }
      }

      return {
        success: true,
        newState: pos.getSnapshot(),
        logs: [...pos.getLogs(), ...logs],
      };
    }

    // ── Task 2: State Mutation & Fee Calculation ──────────────
    // totalAmount = amount + fee; balance -= totalAmount; status = "APPROVED";
    const totalAmountAssign = /totalAmount\s*=\s*(amount\s*\+\s*fee|fee\s*\+\s*amount)/i;
    const balanceDeduct = /balance\s*-=\s*totalAmount|balance\s*=\s*balance\s*-\s*totalAmount/i;

    let feeExecuted = false;
    if (totalAmountAssign.test(normalized)) {
      pos.totalAmount = pos.amount + pos.fee;
      feeExecuted = true;
      logs.push({
        type: "mutation",
        message: `totalAmount = $${pos.totalAmount.toFixed(2)} (Сума: $${pos.amount.toFixed(2)} + Комісія: $${pos.fee.toFixed(2)})`,
      });
    }

    if (balanceDeduct.test(normalized)) {
      pos.balance = Math.max(0, pos.balance - pos.totalAmount);
      feeExecuted = true;
      logs.push({
        type: "mutation",
        message: `balance -= totalAmount: новий залишок $${pos.balance.toFixed(2)}`,
      });
    }

    const approvedMatch = normalized.match(/status\s*=\s*["']APPROVED["']/i);
    if (approvedMatch && feeExecuted) {
      pos.status = "APPROVED";
      return {
        success: true,
        newState: pos.getSnapshot(),
        logs: [...pos.getLogs(), ...logs],
      };
    }

    // ── Task 1: Guard Clause with Early Return (C# and Go) ────
    // if (amount > balance) { status = "DECLINED"; return; }
    // if amount > balance { status = "DECLINED" \n return }
    const guardPattern = /if\s*\(?\s*([a-zA-Z_]\w*)\s*(>|<|>=|<=|==|!=)\s*([a-zA-Z_]\w*)\s*\)?\s*\{([^}]*)\}/i;
    const match = normalized.match(guardPattern);

    if (match) {
      const leftVar = match[1];
      const op = match[2];
      const rightVar = match[3];
      const body = match[4];

      const getVal = (v: string): number => {
        if (v.toLowerCase() === "amount" || v.toLowerCase() === "transactionamount")
          return pos.amount;
        if (v.toLowerCase() === "balance") return pos.balance;
        if (v.toLowerCase() === "totalamount") return pos.totalAmount;
        if (v.toLowerCase() === "fee") return pos.fee;
        const num = parseFloat(v);
        return isNaN(num) ? 0 : num;
      };

      const lVal = getVal(leftVar);
      const rVal = getVal(rightVar);

      let conditionMet = false;
      switch (op) {
        case ">": conditionMet = lVal > rVal; break;
        case "<": conditionMet = lVal < rVal; break;
        case ">=": conditionMet = lVal >= rVal; break;
        case "<=": conditionMet = lVal <= rVal; break;
        case "==": conditionMet = lVal === rVal; break;
        case "!=": conditionMet = lVal !== rVal; break;
      }

      if (conditionMet) {
        logs.push({
          type: "security",
          message: `Умова перевірки спрацювала: ${leftVar} (${lVal}) ${op} ${rightVar} (${rVal})`,
        });

        const statusMatch = body.match(/status\s*=\s*["']([^"']+)["']/i);
        if (statusMatch) {
          pos.status = statusMatch[1];
        }

        const hasReturn = /\breturn\b/i.test(body);
        if (hasReturn) {
          logs.push({
            type: "info",
            message: "Early Return активовано: подальші транзакції заблоковано",
          });
          return {
            success: true,
            newState: pos.getSnapshot(),
            logs: [...pos.getLogs(), ...logs],
            earlyReturn: true,
          };
        }
      }
    }

    // Process standalone status assignment (if any)
    const directStatus = normalized.match(/status\s*=\s*["']([^"']+)["']/i);
    if (directStatus && !match) {
      pos.status = directStatus[1];
    }

    return {
      success: true,
      newState: pos.getSnapshot(),
      logs: [...pos.getLogs(), ...logs],
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      newState: pos.getSnapshot(),
      logs: [...pos.getLogs(), { type: "error", message: errorMsg }],
      error: errorMsg,
    };
  }
}

/**
 * Async wrapper for smooth animation pacing in the UI
 */
export async function executePosScriptAsync(
  code: string,
  currentState: VirtualPosState,
  onIntermediateUpdate?: (snapshot: VirtualPosState) => void,
  stepDelayMs = 250
): Promise<PosRuntimeResult> {
  if (stepDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, stepDelayMs));
  }
  const result = executePosScript(code, currentState);
  if (onIntermediateUpdate) {
    onIntermediateUpdate(result.newState);
  }
  return result;
}
