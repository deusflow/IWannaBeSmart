/**
 * @file scratch/verify_fintech_tasks.ts
 * @description Comprehensive automated test for Module 2 Fintech Tasks 1-4 & TV Module regression check
 */

import {
  FINTECH_TASKS,
  executePosScript,
  VirtualPOS,
  CODING_TASKS,
  type VirtualPosState,
} from "../packages/sim-engine/src";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${msg}`);
  }
}

console.log("=== VERIFYING FINTECH TASKS & RUNTIME ===");

// 1. Task Count
assert(FINTECH_TASKS.length === 4, `Expected 4 fintech tasks, got ${FINTECH_TASKS.length}`);

// 2. Task 1: Guard Clause
const task1 = FINTECH_TASKS[0];
assert(task1.id === "task-pos-guard-clause", "Task 1 ID matches");

// Task 1: C#
const t1CsRes = executePosScript(task1.targetCode.csharp, task1.initialState);
assert(t1CsRes.success === true, "Task 1 C# execution succeeds");
assert(t1CsRes.newState.status === "DECLINED", "Task 1 C# status is DECLINED");
assert(
  task1.validate(task1.initialState, t1CsRes.newState, t1CsRes, task1.targetCode.csharp).passed,
  "Task 1 C# validator passes"
);

// Task 1: Go
const t1GoRes = executePosScript(task1.targetCode.go, task1.initialState);
assert(t1GoRes.success === true, "Task 1 Go execution succeeds");
assert(t1GoRes.newState.status === "DECLINED", "Task 1 Go status is DECLINED");
assert(
  task1.validate(task1.initialState, t1GoRes.newState, t1GoRes, task1.targetCode.go).passed,
  "Task 1 Go validator passes"
);

// 3. Task 2: Fee Calculation
const task2 = FINTECH_TASKS[1];
assert(task2.id === "task-pos-fee-calculation", "Task 2 ID matches");

// Task 2: C#
const t2CsRes = executePosScript(task2.targetCode.csharp, task2.initialState);
assert(t2CsRes.success === true, "Task 2 C# execution succeeds");
assert(t2CsRes.newState.totalAmount === 135, "Task 2 C# totalAmount is $135");
assert(t2CsRes.newState.balance === 365, "Task 2 C# balance is $365");
assert(t2CsRes.newState.status === "APPROVED", "Task 2 C# status is APPROVED");
assert(
  task2.validate(task2.initialState, t2CsRes.newState, t2CsRes, task2.targetCode.csharp).passed,
  "Task 2 C# validator passes"
);

// Task 2: Go
const t2GoRes = executePosScript(task2.targetCode.go, task2.initialState);
assert(t2GoRes.success === true, "Task 2 Go execution succeeds");
assert(t2GoRes.newState.totalAmount === 135, "Task 2 Go totalAmount is $135");
assert(t2GoRes.newState.balance === 365, "Task 2 Go balance is $365");
assert(t2GoRes.newState.status === "APPROVED", "Task 2 Go status is APPROVED");
assert(
  task2.validate(task2.initialState, t2GoRes.newState, t2GoRes, task2.targetCode.go).passed,
  "Task 2 Go validator passes"
);

// 4. Task 3: PIN Lockout
const task3 = FINTECH_TASKS[2];
assert(task3.id === "task-pos-pin-lockout", "Task 3 ID matches");

// Task 3: C#
const t3CsRes = executePosScript(task3.targetCode.csharp, task3.initialState);
assert(t3CsRes.success === true, "Task 3 C# execution succeeds");
assert(t3CsRes.newState.failedAttempts === 3, "Task 3 C# failedAttempts incremented to 3");
assert(t3CsRes.newState.isLocked === true, "Task 3 C# isLocked is true");
assert(t3CsRes.newState.status === "BLOCKED", "Task 3 C# status is BLOCKED");
assert(
  task3.validate(task3.initialState, t3CsRes.newState, t3CsRes, task3.targetCode.csharp).passed,
  "Task 3 C# validator passes"
);

// Task 3: Go
const t3GoRes = executePosScript(task3.targetCode.go, task3.initialState);
assert(t3GoRes.success === true, "Task 3 Go execution succeeds");
assert(t3GoRes.newState.failedAttempts === 3, "Task 3 Go failedAttempts incremented to 3");
assert(t3GoRes.newState.isLocked === true, "Task 3 Go isLocked is true");
assert(t3GoRes.newState.status === "BLOCKED", "Task 3 Go status is BLOCKED");
assert(
  task3.validate(task3.initialState, t3GoRes.newState, t3GoRes, task3.targetCode.go).passed,
  "Task 3 Go validator passes"
);

// 5. Task 4: Batch Settlement (For loop)
const task4 = FINTECH_TASKS[3];
assert(task4.id === "task-pos-batch-settlement", "Task 4 ID matches");

// Task 4: C#
const t4CsRes = executePosScript(task4.targetCode.csharp, task4.initialState);
assert(t4CsRes.success === true, "Task 4 C# execution succeeds");
assert(t4CsRes.newState.dailyTotal === 550, "Task 4 C# dailyTotal is 550 (120+45+300+85)");
assert(
  Boolean(t4CsRes.newState.receiptLines && t4CsRes.newState.receiptLines.length >= 6),
  "Task 4 C# generated receipt lines"
);
assert(
  task4.validate(task4.initialState, t4CsRes.newState, t4CsRes, task4.targetCode.csharp).passed,
  "Task 4 C# validator passes"
);

// Task 4: Go
const t4GoRes = executePosScript(task4.targetCode.go, task4.initialState);
assert(t4GoRes.success === true, "Task 4 Go execution succeeds");
assert(t4GoRes.newState.dailyTotal === 550, "Task 4 Go dailyTotal is 550");
assert(
  Boolean(t4GoRes.newState.receiptLines && t4GoRes.newState.receiptLines.length >= 6),
  "Task 4 Go generated receipt lines"
);
assert(
  task4.validate(task4.initialState, t4GoRes.newState, t4GoRes, task4.targetCode.go).passed,
  "Task 4 Go validator passes"
);

// 6. Security constraint: Locked terminal rejection
const lockedState: VirtualPosState = {
  ...task1.initialState,
  isLocked: true,
};
const lockedRes = executePosScript(task1.targetCode.csharp, lockedState);
assert(lockedRes.success === false, "Locked terminal rejects execution");
assert(lockedRes.error === "TERMINAL IS LOCKED", "Locked terminal returns TERMINAL IS LOCKED error");

// 7. Regression check: Module 1 (TV)
assert(CODING_TASKS.length === 10, "Module 1 TV tasks are intact (10 tasks)");

console.log("\n🎉 ALL FINTECH POS ENGINE TESTS PASSED 100%!");
