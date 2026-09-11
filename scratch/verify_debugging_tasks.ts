/**
 * Automated Verification Script for Sprint 2: Reverse Debugging & Engineering Context
 * Validates all 3 failure and repair scenarios across C# and Go syntaxes.
 */

import {
  CODING_TASKS,
  FINTECH_TASKS,
  executeTvScriptAsync,
  executePosScriptAsync,
  type VirtualTvState,
  type VirtualPosState,
} from "../packages/sim-engine/src/index";

async function runVerification() {
  console.log("================================================================================");
  console.log("🛠️ SPRINT 2: REVERSE DEBUGGING & FAILURE SCENARIOS VERIFICATION");
  console.log("================================================================================\n");

  let allPassed = true;

  // ──────────────────────────────────────────────────────────────────────────
  // SCENARIO 1: Runaway Tuning (task-debug-runaway-loop)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("--- [Scenario 1] Runaway Tuning (task-debug-runaway-loop) ---");
  const task1 = CODING_TASKS.find((t) => t.id === "task-debug-runaway-loop")!;
  if (!task1) throw new Error("task-debug-runaway-loop not found!");

  // 1A: Broken code execution (should fail / timeout)
  const tvInitial: VirtualTvState = { isOn: false, channel: 1, volume: 50 };
  const brokenRes1 = await executeTvScriptAsync(task1.initialBrokenCode!.csharp, tvInitial);
  console.log("1A. Broken code execution result:", {
    success: brokenRes1.success,
    error: brokenRes1.error,
  });
  if (brokenRes1.success || !brokenRes1.error?.includes("InfiniteLoopException")) {
    console.error("❌ Scenario 1A FAILED: Broken code did not trigger InfiniteLoopException!");
    allPassed = false;
  } else {
    console.log("✅ Scenario 1A PASSED: InfiniteLoopException caught by Watchdog timer.");
  }

  // 1B: Fixed code execution
  const fixedRes1 = await executeTvScriptAsync(task1.targetCode.csharp, tvInitial);
  const validation1 = task1.validate(tvInitial, fixedRes1.newState, fixedRes1, task1.targetCode.csharp);
  console.log("1B. Fixed code execution result:", {
    success: fixedRes1.success,
    channel: fixedRes1.newState.channel,
    passed: validation1.passed,
  });
  if (!fixedRes1.success || !validation1.passed || fixedRes1.newState.channel !== 5) {
    console.error("❌ Scenario 1B FAILED: Fixed code did not validate successfully!");
    allPassed = false;
  } else {
    console.log("✅ Scenario 1B PASSED: Tuner reaches channel 5; state restored to OPERATIONAL.");
  }

  // 1C: Go language verification
  const fixedGoRes1 = await executeTvScriptAsync(task1.targetCode.go, tvInitial);
  const validationGo1 = task1.validate(tvInitial, fixedGoRes1.newState, fixedGoRes1, task1.targetCode.go);
  if (!fixedGoRes1.success || !validationGo1.passed) {
    console.error("❌ Scenario 1C FAILED: Go fixed code did not validate!");
    allPassed = false;
  } else {
    console.log("✅ Scenario 1C PASSED: Go implementation validated.");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCENARIO 2: Cathode Ray Overload (task-debug-off-by-one-overflow)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n--- [Scenario 2] Cathode Ray Overload (task-debug-off-by-one-overflow) ---");
  const task2 = CODING_TASKS.find((t) => t.id === "task-debug-off-by-one-overflow")!;
  if (!task2) throw new Error("task-debug-off-by-one-overflow not found!");

  // 2A: Broken code execution (should blow fuse)
  const tvInitial2: VirtualTvState = { isOn: false, channel: 1, volume: 50, brightness: 50, isFuseBlown: false };
  const brokenRes2 = await executeTvScriptAsync(task2.initialBrokenCode!.csharp, tvInitial2);
  const brokenValidation2 = task2.validate(tvInitial2, brokenRes2.newState, brokenRes2, task2.initialBrokenCode!.csharp);
  console.log("2A. Broken code execution result:", {
    isFuseBlown: brokenRes2.newState.isFuseBlown,
    osdMessage: brokenRes2.newState.osdMessage,
    passed: brokenValidation2.passed,
  });
  if (!brokenRes2.newState.isFuseBlown || brokenValidation2.passed) {
    console.error("❌ Scenario 2A FAILED: Broken code did not trip cathode ray fuse!");
    allPassed = false;
  } else {
    console.log("✅ Scenario 2A PASSED: Fuse blown on requestedBrightness = 101 (> 100 limit).");
  }

  // 2B: Fixed guarded code execution
  const fixedRes2 = await executeTvScriptAsync(task2.targetCode.csharp, tvInitial2);
  const validation2 = task2.validate(tvInitial2, fixedRes2.newState, fixedRes2, task2.targetCode.csharp);
  console.log("2B. Guarded code execution result:", {
    isFuseBlown: fixedRes2.newState.isFuseBlown,
    passed: validation2.passed,
  });
  if (fixedRes2.newState.isFuseBlown || !validation2.passed) {
    console.error("❌ Scenario 2B FAILED: Guarded code did not protect fuse or failed validation!");
    allPassed = false;
  } else {
    console.log("✅ Scenario 2B PASSED: Boundary guard prevented overload; fuse remained intact.");
  }

  // 2C: Transfer task verification (brightness 80%)
  const transferCode2 = "tv.PowerOn();\nint requestedBrightness = 80;\nif (requestedBrightness <= 100)\n{\n    tv.SetBrightness(requestedBrightness);\n}";
  const transferRes2 = await executeTvScriptAsync(transferCode2, tvInitial2);
  const transferPassed2 = task2.transferVariant?.validate(tvInitial2, transferRes2.newState, transferCode2, transferRes2);
  if (!transferPassed2 || transferRes2.newState.brightness !== 80) {
    console.error("❌ Scenario 2C FAILED: Transfer variant failed!");
    allPassed = false;
  } else {
    console.log("✅ Scenario 2C PASSED: Transfer variation (80% brightness guard) verified.");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCENARIO 3: POS Double Deduction (task-pos-double-deduction-bug)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n--- [Scenario 3] POS Double Deduction (task-pos-double-deduction-bug) ---");
  const task3 = FINTECH_TASKS.find((t) => t.id === "task-pos-double-deduction-bug")!;
  if (!task3) throw new Error("task-pos-double-deduction-bug not found!");

  // 3A: Broken code execution (double fee mutation -> 780 instead of 790)
  const posInitial3: VirtualPosState = { ...task3.initialState };
  const brokenRes3 = await executePosScriptAsync(task3.initialBrokenCode!.csharp, posInitial3);
  const brokenValidation3 = task3.validate(posInitial3, brokenRes3.newState, brokenRes3, task3.initialBrokenCode!.csharp);
  console.log("3A. Broken code ledger result:", {
    balance: brokenRes3.newState.balance,
    fee: brokenRes3.newState.fee,
    totalAmount: brokenRes3.newState.totalAmount,
    passed: brokenValidation3.passed,
  });
  if (brokenRes3.newState.balance !== 780 || brokenValidation3.passed) {
    console.error("❌ Scenario 3A FAILED: Double deduction did not yield 780 or validation wrongly passed!");
    allPassed = false;
  } else {
    console.log("✅ Scenario 3A PASSED: Double deduction detected in ledger (balance = 780 instead of 790).");
  }

  // 3B: Fixed code execution (balance -= totalAmount -> 790)
  const fixedRes3 = await executePosScriptAsync(task3.targetCode.csharp, posInitial3);
  const validation3 = task3.validate(posInitial3, fixedRes3.newState, fixedRes3, task3.targetCode.csharp);
  console.log("3B. Fixed code ledger result:", {
    balance: fixedRes3.newState.balance,
    totalAmount: fixedRes3.newState.totalAmount,
    status: fixedRes3.newState.status,
    passed: validation3.passed,
  });
  if (fixedRes3.newState.balance !== 790 || !validation3.passed) {
    console.error("❌ Scenario 3B FAILED: Fixed code did not yield 790 or validator rejected!");
    allPassed = false;
  } else {
    console.log("✅ Scenario 3B PASSED: Audit reconciled (balance = 790, totalAmount = 210, APPROVED).");
  }

  // 3C: Transfer task verification (25 UAH fee -> 775 balance)
  const transferCode3 = "decimal fee = 25;\ndecimal totalAmount = amount + fee;\nbalance -= totalAmount;\nstatus = \"APPROVED\";";
  const transferRes3 = await executePosScriptAsync(transferCode3, posInitial3);
  const transferPassed3 = task3.transferVariant?.validate(posInitial3, transferRes3.newState, transferCode3, transferRes3);
  if (!transferPassed3 || transferRes3.newState.balance !== 775) {
    console.error("❌ Scenario 3C FAILED: Transfer variant failed!");
    allPassed = false;
  } else {
    console.log("✅ Scenario 3C PASSED: Transfer variation (25 UAH fee, balance = 775) verified.");
  }

  console.log("\n================================================================================");
  if (allPassed) {
    console.log("🎉 ALL 3 SPRINT 2 REVERSE DEBUGGING FAILURE SCENARIOS VERIFIED SUCCESSFULLY!");
  } else {
    console.error("❌ ONE OR MORE VERIFICATION SCENARIOS FAILED.");
    process.exit(1);
  }
  console.log("================================================================================");
}

runVerification().catch((err) => {
  console.error("Unhandled error during verification:", err);
  process.exit(1);
});
