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
  activeGateway?: string | null;
  isGatewayRegistered?: boolean;
  gatewayApproved?: boolean;
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
  private _activeGateway: string | null;
  private _isGatewayRegistered: boolean;
  private _gatewayApproved: boolean;
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
    this._activeGateway = initial.activeGateway ?? null;
    this._isGatewayRegistered = initial.isGatewayRegistered ?? false;
    this._gatewayApproved = initial.gatewayApproved ?? true;
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

  // ── Property: Active Gateway ────────────────────────────────
  get ActiveGateway(): string | null {
    return this._activeGateway;
  }
  set ActiveGateway(val: string | null) {
    this._activeGateway = val;
    this._mutationsCount++;
    this._logs.push({
      type: "mutation",
      message: `activeGateway = ${this._activeGateway ? `"${this._activeGateway}"` : "null"}`,
    });
  }
  get activeGateway(): string | null {
    return this.ActiveGateway;
  }
  set activeGateway(val: string | null) {
    this.ActiveGateway = val;
  }

  // ── Property: Is Gateway Registered ─────────────────────────
  get IsGatewayRegistered(): boolean {
    return this._isGatewayRegistered;
  }
  set IsGatewayRegistered(val: boolean) {
    this._isGatewayRegistered = Boolean(val);
    this._mutationsCount++;
    this._logs.push({
      type: "mutation",
      message: `isGatewayRegistered = ${this._isGatewayRegistered}`,
    });
  }
  get isGatewayRegistered(): boolean {
    return this.IsGatewayRegistered;
  }
  set isGatewayRegistered(val: boolean) {
    this.IsGatewayRegistered = val;
  }

  // ── Property: Gateway Approved Response ─────────────────────
  get GatewayApproved(): boolean {
    return this._gatewayApproved;
  }
  set GatewayApproved(val: boolean) {
    this._gatewayApproved = Boolean(val);
  }
  get gatewayApproved(): boolean {
    return this.GatewayApproved;
  }
  set gatewayApproved(val: boolean) {
    this.GatewayApproved = val;
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
      activeGateway: this._activeGateway,
      isGatewayRegistered: this._isGatewayRegistered,
      gatewayApproved: this._gatewayApproved,
    };
  }

  public getLogs(): PosLogEntry[] {
    return [...this._logs];
  }

  public getMutationsCount(): number {
    return this._mutationsCount;
  }
}

function stripComments(code: string): string {
  const noBlock = code.replace(/\/\*[\s\S]*?\*\//g, "");
  const noLine = noBlock.replace(/\/\/.*$/gm, "");
  return noLine;
}

/**
 * Execute script against VirtualPOS with support for:
 * 1. Guard Clauses and Early Returns (Task 1)
 * 2. State Mutation & Fee Calculation (Task 2)
 * 3. PIN Lockout & Guard Counter (Task 3)
 * 4. For-Loop Batch Settlement (Task 4)
 * 5. Interface Polymorphism & Gateway Invocation (Task 5)
 * 6. IoC Container & Dependency Injection (Task 6)
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

    const cleanCode = stripComments(code);
    const rawLines = cleanCode
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const normalized = rawLines.join(" ");

    // ── Task 6: IoC Container & Dependency Injection ──────────
    // C#: services.AddScoped<IPaymentGateway, DankortGateway>();
    // Go: container.Register("payment_gateway", NewDankortGateway())
    const csharpDiMatch = normalized.match(
      /services\s*\.\s*(?:AddScoped|AddSingleton|AddTransient)\s*<\s*IPaymentGateway\s*,\s*([a-zA-Z_]\w*)\s*>\s*\(\s*\)/i
    );
    const goDiMatch = normalized.match(
      /container\s*\.\s*(?:Register|RegisterSingleton)\s*\(\s*["']payment_gateway["']\s*,\s*New([a-zA-Z_]\w*)\s*\(\s*\)\s*\)/i
    );
    if (csharpDiMatch || goDiMatch) {
      const gatewayName = csharpDiMatch ? csharpDiMatch[1] : goDiMatch![1];
      pos.activeGateway = gatewayName;
      pos.isGatewayRegistered = true;
      pos.status = "APPROVED";
      logs.push({
        type: "mutation",
        message: `DI Container: Зареєстровано залежність IPaymentGateway -> ${gatewayName}`,
      });
      return {
        success: true,
        newState: pos.getSnapshot(),
        logs: [...pos.getLogs(), ...logs],
      };
    }

    // ── Task 5: Interface Polymorphism & Gateway Invocation ───
    // C#: bool approved = gateway.Charge(totalAmount); if (!approved) { status = "DECLINED"; return; } status = "APPROVED";
    // Go: approved := gateway.Charge(totalAmount) \n if !approved { status = "DECLINED" \n return } \n status = "APPROVED"
    const gatewayCallPattern = /gateway\s*\.\s*Charge\s*\(\s*([a-zA-Z_]\w*)\s*\)/i;
    const gatewayCallMatch = normalized.match(gatewayCallPattern);
    if (gatewayCallMatch) {
      if (!pos.isGatewayRegistered || !pos.activeGateway) {
        return {
          success: false,
          newState: pos.getSnapshot(),
          logs: [
            ...pos.getLogs(),
            {
              type: "error",
              message:
                "PaymentGatewayNotFoundException: No payment gateway registered in IoC container",
            },
          ],
          error:
            "PaymentGatewayNotFoundException: No payment gateway registered in IoC container",
        };
      }

      const isChargeApproved = pos.gatewayApproved !== false;
      logs.push({
        type: "info",
        message: `Поліморфний виклик шлюзу: ${pos.activeGateway}.Charge($${pos.totalAmount.toFixed(2)}) -> ${
          isChargeApproved ? "true" : "false"
        }`,
      });

      const hasDeclinedGuard = /if\s*\(?\s*!approved\s*\)?/i.test(normalized);
      if (hasDeclinedGuard && !isChargeApproved) {
        pos.status = "DECLINED";
        logs.push({
          type: "security",
          message: "Шлюз повернув false: статус встановлено у DECLINED",
        });
        return {
          success: true,
          newState: pos.getSnapshot(),
          logs: [...pos.getLogs(), ...logs],
          earlyReturn: true,
        };
      }

      if (/status\s*=\s*["']APPROVED["']/i.test(normalized)) {
        pos.status = "APPROVED";
      }

      return {
        success: true,
        newState: pos.getSnapshot(),
        logs: [...pos.getLogs(), ...logs],
      };
    }

    // ── Task 4: For Loop / Batch Settlement ───────────────────
    // C# standard: for (int i = 0; i < transactions.Length; i++) { dailyTotal += transactions[i]; }
    //              for (var i = 0; i < transactions.Length; ++i) { dailyTotal += transactions[i]; }
    // C# foreach:  foreach (var tx in transactions) { dailyTotal += tx; }
    // Go standard: for i := 0; i < len(transactions); i++ { dailyTotal += transactions[i] }
    // Go range:    for _, tx := range transactions { dailyTotal += tx }
    //              for i, tx := range transactions { dailyTotal += tx }
    const csharpForPattern = /for\s*\(\s*(?:int|var)\s+([a-zA-Z_]\w*)\s*=\s*0\s*;\s*\1\s*<\s*transactions\.Length\s*;\s*(?:\1\+\+|\+\+\1|\1\s*\+=\s*1|\1\s*=\s*\1\s*\+\s*1)\s*\)\s*\{([^}]*)\}/i;
    const goForPattern = /for\s+([a-zA-Z_]\w*)\s*:=\s*0\s*;\s*\1\s*<\s*len\s*\(\s*transactions\s*\)\s*;\s*(?:\1\+\+|\+\+\1|\1\s*\+=\s*1|\1\s*=\s*\1\s*\+\s*1)\s*\{([^}]*)\}/i;
    const csharpForeachPattern = /foreach\s*\(\s*(?:var|int|double|decimal|float)\s+([a-zA-Z_]\w*)\s+in\s+transactions\s*\)\s*\{([^}]*)\}/i;
    const goRangePattern = /for\s+(?:([a-zA-Z_]\w*|_)\s*,\s*)?([a-zA-Z_]\w*)\s*:=\s*range\s+transactions\s*\{([^}]*)\}/i;

    const forIndexedMatch = normalized.match(csharpForPattern) || normalized.match(goForPattern);
    const foreachMatch = normalized.match(csharpForeachPattern);
    const goRangeMatch = normalized.match(goRangePattern);

    let loopValid = false;

    if (forIndexedMatch) {
      const loopVar = forIndexedMatch[1];
      const body = forIndexedMatch[2];
      const accumulatePattern = new RegExp(
        `dailyTotal\\s*\\+=\\s*transactions\\[${loopVar}\\]|dailyTotal\\s*=\\s*dailyTotal\\s*\\+\\s*transactions\\[${loopVar}\\]`,
        "i"
      );
      if (accumulatePattern.test(body)) {
        loopValid = true;
      }
    } else if (foreachMatch) {
      const elemVar = foreachMatch[1];
      const body = foreachMatch[2];
      const accumulatePattern = new RegExp(
        `dailyTotal\\s*\\+=\\s*${elemVar}|dailyTotal\\s*=\\s*dailyTotal\\s*\\+\\s*${elemVar}`,
        "i"
      );
      if (accumulatePattern.test(body)) {
        loopValid = true;
      }
    } else if (goRangeMatch) {
      const elemVar = goRangeMatch[2];
      const body = goRangeMatch[3];
      const accumulatePattern = new RegExp(
        `dailyTotal\\s*\\+=\\s*${elemVar}|dailyTotal\\s*=\\s*dailyTotal\\s*\\+\\s*${elemVar}`,
        "i"
      );
      if (accumulatePattern.test(body)) {
        loopValid = true;
      }
    }

    if (loopValid) {
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
        message: `Цикл for/foreach підсумував ${pos.transactions.length} транзакцій: dailyTotal = $${pos.dailyTotal.toFixed(2)}`,
      });

      return {
        success: true,
        newState: pos.getSnapshot(),
        logs: [...pos.getLogs(), ...logs],
      };
    }

    // Diagnostic if student attempted a loop that failed validation
    if (/\b(?:for|foreach)\b/i.test(normalized)) {
      logs.push({
        type: "error",
        message: "Синтаксична помилка циклу: перевірте структуру (for/foreach/range) та підсумовування dailyTotal += ...",
      });
      return {
        success: false,
        newState: pos.getSnapshot(),
        logs: [...pos.getLogs(), ...logs],
        error: "Loop syntax error: failed to match valid for/foreach loop summing transactions into dailyTotal",
      };
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

        const limitMatch = normalized.match(/if\s*\(?\s*failedAttempts\s*>=\s*([0-9]+)\s*\)?/i);
        if (limitMatch) {
          const threshold = parseInt(limitMatch[1], 10);
          if (pos.failedAttempts >= threshold) {
            if (/isLocked\s*=\s*true/i.test(normalized)) {
              pos.isLocked = true;
            }
            if (/status\s*=\s*["']BLOCKED["']/i.test(normalized)) {
              pos.status = "BLOCKED";
            }
            logs.push({
              type: "security",
              message: `ТЕРМІНАЛ ЗАБЛОКОВАНО: перевищено ліміт ${threshold} спроб введення PIN!`,
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
    const feeNumericMatch = normalized.match(/(?:decimal|float|int|var)?\s*fee\s*(?:=|:=)\s*([0-9]+(?:\.[0-9]+)?)/i);
    const feeFormulaMatch = normalized.match(/(?:decimal|float|int|var)?\s*fee\s*(?:=|:=)\s*amount\s*\*\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (feeFormulaMatch) {
      pos.fee = Math.round(pos.amount * parseFloat(feeFormulaMatch[1]) * 100) / 100;
    } else if (feeNumericMatch) {
      pos.fee = parseFloat(feeNumericMatch[1]);
    }

    const totalAmountAssign = /(?:decimal|float|int|var)?\s*totalAmount\s*(?:=|:=)\s*(amount\s*\+\s*fee|fee\s*\+\s*amount)/i;
    const balanceDeduct = /balance\s*-=\s*totalAmount|balance\s*=\s*balance\s*-\s*totalAmount/i;
    const feeDirectDeduct = /balance\s*-=\s*fee|balance\s*=\s*balance\s*-\s*fee/i;

    let feeExecuted = false;
    if (totalAmountAssign.test(normalized)) {
      pos.totalAmount = pos.amount + pos.fee;
      feeExecuted = true;
      logs.push({
        type: "mutation",
        message: `totalAmount = $${pos.totalAmount.toFixed(2)} (Сума: $${pos.amount.toFixed(2)} + Комісія: $${pos.fee.toFixed(2)})`,
      });
    }

    if (feeDirectDeduct.test(normalized)) {
      pos.balance = Math.max(0, pos.balance - pos.fee);
      feeExecuted = true;
      logs.push({
        type: "mutation",
        message: `balance -= fee: списано комісію $${pos.fee.toFixed(2)}, проміжний залишок $${pos.balance.toFixed(2)}`,
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
