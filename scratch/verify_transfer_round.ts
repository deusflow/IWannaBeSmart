/**
 * @file scratch/verify_transfer_round.ts
 * @description Comprehensive automated test harness for Sprint 1:
 *  - 16 TV Tasks & Transfer Variants
 *  - 3 Bridge Tasks (Heap Instance, Query Method Return, Null Safety Guard)
 *  - Educational NullReferenceException trigger & handling
 *  - 6 Fintech Tasks & Transfer Variants
 */

import {
  CODING_TASKS,
  executeTvScriptAsync,
  type VirtualTvState,
  FINTECH_TASKS,
  executePosScriptAsync,
  type VirtualPosState,
} from "../packages/sim-engine/src";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function main() {
  console.log("\n=======================================================");
  console.log("  SPRINT 1: DIDACTIC FOUNDATIONS & TRANSFER TEST HARNESS");
  console.log("=======================================================\n");

  // ── 1. Validate All 16 TV Tasks ───────────────────────────
  console.log("--- TEST SUITE 1: 16 TV Tasks Integrity & Transfer Variants ---");
  assert(CODING_TASKS.length === 16, `Expected 16 TV tasks, got ${CODING_TASKS.length}`);

  for (let i = 0; i < CODING_TASKS.length; i++) {
    const task = CODING_TASKS[i];
    assert(task.order === i + 1, `Task ${task.id} order should be ${i + 1}, got ${task.order}`);
    assert(Boolean(task.targetCode?.csharp && task.targetCode?.go), `Task ${task.id} has C# & Go target code`);
    assert(Boolean(task.clozeTemplate?.csharp && task.clozeTemplate?.go), `Task ${task.id} has C# & Go cloze`);
    assert(Boolean(task.transferVariant), `Task ${task.id} has transferVariant defined`);
    assert(Boolean(task.transferVariant?.prompt?.ua && task.transferVariant?.prompt?.en && task.transferVariant?.prompt?.da),
      `Task ${task.id} transfer prompt is translated to UA, EN, DA`);
    assert(Boolean(task.transferVariant?.hint?.ua && task.transferVariant?.hint?.en && task.transferVariant?.hint?.da),
      `Task ${task.id} transfer hint is translated to UA, EN, DA`);
    assert(typeof task.transferVariant?.validate === "function", `Task ${task.id} transfer validator is a function`);
  }

  // ── 2. Bridge Task A: task-class-instance (Heap Blueprint vs Instance) ─────
  console.log("\n--- TEST SUITE 2: Bridge Task A (task-class-instance) ---");
  const taskA = CODING_TASKS.find((t) => t.id === "task-class-instance")!;
  assert(Boolean(taskA), "Found task-class-instance (Task #9)");

  // 2a. Target Code (C#)
  const initialA: VirtualTvState = { isOn: false, channel: 1, volume: 20 };
  const resTargetA = await executeTvScriptAsync(taskA.targetCode.csharp, initialA);
  assert(resTargetA.success, "Target C# code executed successfully");
  assert(resTargetA.newState.isOn === true, "New TV instance turned ON");
  assert(resTargetA.newState.activeInstanceName === "myTv", "activeInstanceName recorded as 'myTv'");
  const valTargetA = taskA.validate(initialA, resTargetA.newState, resTargetA, taskA.targetCode.csharp);
  assert(valTargetA.passed, "Task A target validator passed (3-Star standard)");

  // 2b. Transfer Variant (livingRoomTv instance, tune to channel 3)
  const transferCodeA = "TV livingRoomTv = new TV();\nlivingRoomTv.SetChannel(3);";
  const resTransferA = await executeTvScriptAsync(transferCodeA, initialA);
  assert(resTransferA.success, "Transfer variant C# code executed successfully");
  assert(resTransferA.newState.channel === 3, "livingRoomTv tuned to channel 3");
  assert(resTransferA.newState.activeInstanceName === "livingRoomTv", "activeInstanceName recorded as 'livingRoomTv'");
  const valTransferA = taskA.transferVariant!.validate(initialA, resTransferA.newState, transferCodeA);
  assert(valTransferA === true, "Task A transfer validator passed (4-Star Platinum!)");

  // 2c. Go Target Code
  const resGoA = await executeTvScriptAsync(taskA.targetCode.go, initialA);
  assert(resGoA.success, "Go target code executed successfully");
  const valGoA = taskA.validate(initialA, resGoA.newState, resGoA, taskA.targetCode.go);
  assert(valGoA.passed, "Task A Go target validator passed");

  // ── 3. Bridge Task B: task-method-return (Query Methods vs Mutations) ─────
  console.log("\n--- TEST SUITE 3: Bridge Task B (task-method-return) ---");
  const taskB = CODING_TASKS.find((t) => t.id === "task-method-return")!;
  assert(Boolean(taskB), "Found task-method-return (Task #10)");

  // 3a. Target Code
  const initialB: VirtualTvState = { isOn: true, channel: 1, volume: 25 };
  const resTargetB = await executeTvScriptAsync(taskB.targetCode.csharp, initialB);
  assert(resTargetB.success, "Target C# code executed successfully");
  assert(resTargetB.newState.volume === 35, `Volume incremented from 25 to 35 (got ${resTargetB.newState.volume})`);
  const valTargetB = taskB.validate(initialB, resTargetB.newState, resTargetB, taskB.targetCode.csharp);
  assert(valTargetB.passed, "Task B target validator passed");

  // 3b. Transfer Variant (currentVol - 15 volume decrement)
  const transferCodeB = "int currentVol = tv.GetVolume();\ntv.SetVolume(currentVol - 15);";
  const resTransferB = await executeTvScriptAsync(transferCodeB, initialB);
  assert(resTransferB.success, "Transfer variant C# code executed successfully");
  assert(resTransferB.newState.volume === 10, `Volume reduced from 25 to 10 (got ${resTransferB.newState.volume})`);
  const valTransferB = taskB.transferVariant!.validate(initialB, resTransferB.newState, transferCodeB);
  assert(valTransferB === true, "Task B transfer validator passed (4-Star Platinum!)");

  // ── 4. Bridge Task C: task-null-reference (Null Pointers & Defenses) ──────
  console.log("\n--- TEST SUITE 4: Bridge Task C (task-null-reference) ---");
  const taskC = CODING_TASKS.find((t) => t.id === "task-null-reference")!;
  assert(Boolean(taskC), "Found task-null-reference (Task #11)");

  // 4a. Educational NullReferenceException Simulation
  const crashCode = "TV broken = null;\nbroken.PowerOn();";
  const resCrash = await executeTvScriptAsync(crashCode, { isOn: false, channel: 1, volume: 10 });
  assert(resCrash.success === false, "Null dereference correctly produced runtime failure");
  assert(Boolean(resCrash.error && resCrash.error.includes("NullReferenceException")),
    `Caught educational NullReferenceException: "${resCrash.error}"`);
  console.log(`     Educative Error Message: "${resCrash.error}"`);

  // 4b. Target Code with Null Guard
  const initialC: VirtualTvState = { isOn: false, channel: 1, volume: 10 };
  const resTargetC = await executeTvScriptAsync(taskC.targetCode.csharp, initialC);
  assert(resTargetC.success, "Guarded code executed safely without crash");
  assert(resTargetC.newState.isSafeGuardActive === true, "isSafeGuardActive correctly flagged true");
  const valTargetC = taskC.validate(initialC, resTargetC.newState, resTargetC, taskC.targetCode.csharp);
  assert(valTargetC.passed, "Task C target validator passed");

  // 4c. Transfer Variant (Elvis Operator remote?.PowerOn();)
  const transferCodeC = "TV remote = null;\nremote?.PowerOn();";
  const resTransferC = await executeTvScriptAsync(transferCodeC, initialC);
  assert(resTransferC.success, "Elvis operator code executed safely without crash");
  assert(resTransferC.newState.isSafeGuardActive === true, "Elvis safe guard activated");
  const valTransferC = taskC.transferVariant!.validate(initialC, resTransferC.newState, transferCodeC);
  assert(valTransferC === true, "Task C transfer validator passed (4-Star Platinum!)");

  // ── 5. Validate All 6 Fintech Tasks ───────────────────────────
  console.log("\n--- TEST SUITE 5: 6 Fintech Tasks Integrity & Transfer Variants ---");
  assert(FINTECH_TASKS.length === 6, `Expected 6 Fintech tasks, got ${FINTECH_TASKS.length}`);

  for (let i = 0; i < FINTECH_TASKS.length; i++) {
    const task = FINTECH_TASKS[i];
    assert(task.order === i + 1, `Fintech task ${task.id} order should be ${i + 1}`);
    assert(Boolean(task.transferVariant), `Fintech task ${task.id} has transferVariant`);
    assert(Boolean(task.transferVariant?.prompt?.ua && task.transferVariant?.prompt?.en && task.transferVariant?.prompt?.da),
      `Fintech task ${task.id} prompt has UA, EN, DA`);
  }

  // 5a. Test Fintech Task 1 Transfer (Limit check amount > 500 -> DECLINED)
  const taskF1 = FINTECH_TASKS[0];
  const codeF1 = 'if (amount > 500) {\n  status = "DECLINED";\n  return;\n}';
  const resF1 = await executePosScriptAsync(codeF1, taskF1.initialState);
  assert(resF1.success && resF1.newState.status === "DECLINED", "Fintech Task 1 transfer script executed");
  assert(taskF1.transferVariant!.validate(taskF1.initialState, resF1.newState, codeF1, resF1),
    "Fintech Task 1 transfer validation passed");

  // 5b. Test Fintech Task 2 Transfer (Flat fee 25 -> APPROVED, totalAmount 145)
  const taskF2 = FINTECH_TASKS[1];
  const codeF2 = 'fee = 25;\ntotalAmount = amount + fee;\nbalance -= totalAmount;\nstatus = "APPROVED";';
  const resF2 = await executePosScriptAsync(codeF2, taskF2.initialState);
  assert(resF2.success && resF2.newState.status === "APPROVED" && resF2.newState.totalAmount === 145,
    "Fintech Task 2 transfer script executed");
  assert(taskF2.transferVariant!.validate(taskF2.initialState, resF2.newState, codeF2, resF2),
    "Fintech Task 2 transfer validation passed");

  // 5c. Test Fintech Task 3 Transfer (Strict lockout >= 2)
  const taskF3 = FINTECH_TASKS[2];
  const codeF3 = 'if (pin != enteredPin) {\n  failedAttempts++;\n  if (failedAttempts >= 2) {\n    isLocked = true;\n    status = "BLOCKED";\n  }\n}';
  const resF3 = await executePosScriptAsync(codeF3, taskF3.initialState);
  assert(resF3.success && resF3.newState.isLocked === true && resF3.newState.status === "BLOCKED",
    "Fintech Task 3 transfer script executed");
  assert(taskF3.transferVariant!.validate(taskF3.initialState, resF3.newState, codeF3, resF3),
    "Fintech Task 3 transfer validation passed");

  // 5d. Test Fintech Task 6 Transfer (AddSingleton in DI container)
  const taskF6 = FINTECH_TASKS[5];
  const codeF6 = "services.AddSingleton<IPaymentGateway, DankortGateway>();";
  const resF6 = await executePosScriptAsync(codeF6, taskF6.initialState);
  assert(resF6.success && resF6.newState.isGatewayRegistered === true && resF6.newState.activeGateway === "DankortGateway",
    "Fintech Task 6 AddSingleton executed");
  assert(taskF6.transferVariant!.validate(taskF6.initialState, resF6.newState, codeF6, resF6),
    "Fintech Task 6 transfer validation passed");

  console.log("\n=======================================================");
  console.log("  ALL TESTS PASSED WITH 100% SUCCESS! SPRINT 1 COMPLETE");
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("FATAL TEST HARNESS ERROR:", err);
  process.exit(1);
});
