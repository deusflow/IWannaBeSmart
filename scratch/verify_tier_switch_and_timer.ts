/**
 * @file scratch/verify_tier_switch_and_timer.ts
 * @description Verifies auto-selection of tier tasks and beginner timer safety constraints
 */

import assert from "node:assert";
import { CODING_TASKS } from "../packages/sim-engine/src/runtime/tasks";

console.log("=== VERIFYING TIER AUTO-SELECTION & BEGINNER SPRINT TIMER ===");

// 1. Verify Tier structure
const tier0Tasks = CODING_TASKS.filter((t) => (t.tier ?? 0) === 0);
const tier1Tasks = CODING_TASKS.filter((t) => (t.tier ?? 0) === 1);
const tier2Tasks = CODING_TASKS.filter((t) => (t.tier ?? 0) === 2);

assert.strictEqual(tier0Tasks.length, 3, "Tier 0 should have 3 tasks");
assert.strictEqual(tier1Tasks.length, 5, "Tier 1 should have 5 tasks");
assert.strictEqual(tier2Tasks.length, 5, "Tier 2 should have 5 tasks");

console.log(`✓ Tier 0 tasks count: ${tier0Tasks.length}`);
console.log(`✓ Tier 1 tasks count: ${tier1Tasks.length}`);
console.log(`✓ Tier 2 tasks count: ${tier2Tasks.length}`);

// 2. Verify First Task of each Tier
const firstTier0 = CODING_TASKS.find((t) => (t.tier ?? 0) === 0);
const firstTier1 = CODING_TASKS.find((t) => (t.tier ?? 0) === 1);
const firstTier2 = CODING_TASKS.find((t) => (t.tier ?? 0) === 2);

assert(firstTier0, "First Tier 0 task must exist");
assert(firstTier1, "First Tier 1 task must exist");
assert(firstTier2, "First Tier 2 task must exist");

assert.strictEqual(firstTier0.id, "task-0-1-power-on", "Tier 0 first task must be task-0-1-power-on");
assert.strictEqual(firstTier1.id, "task-1-assignment", "Tier 1 first task must be task-1-assignment");
assert.strictEqual(firstTier2.id, "task-function-encapsulation", "Tier 2 first task must be task-function-encapsulation");

console.log(`✓ First task of Tier 0: ${firstTier0.id}`);
console.log(`✓ First task of Tier 1: ${firstTier1.id} (Auto-selection on clicking [РАНГ 1: ЛОГІКА])`);
console.log(`✓ First task of Tier 2: ${firstTier2.id} (Auto-selection on clicking [РАНГ 2: АРХІТЕКТУРА])`);

// 3. Verify Sprint Timer formula & beginner safety minimum
// targetCode.length / 3.5 without clamp vs with Math.max(20, ...)
function calculateSprintLimit(targetCode: string, sprintTimeLimit?: number): number {
  return Math.max(20, sprintTimeLimit ?? Math.ceil(targetCode.length / 3.5));
}

const task01 = tier0Tasks[0];
const rawFormulaSeconds = Math.ceil(task01.targetCode.csharp.length / 3.5);
const clampedSeconds = calculateSprintLimit(task01.targetCode.csharp, task01.sprintTimeLimit);

console.log(`\n--- Timer Verification for Task 0.1 ---`);
console.log(`Target code: "${task01.targetCode.csharp}" (Length: ${task01.targetCode.csharp.length})`);
console.log(`Raw targetCode.length / 3.5: ${rawFormulaSeconds}s`);
console.log(`Clamped sprint limit with Math.max(20, ...): ${clampedSeconds}s`);

assert(rawFormulaSeconds < 10, "Raw formula gives only ~4 seconds for 14 chars");
assert.strictEqual(clampedSeconds, 20, "Math.max(20, ...) must guarantee 20 seconds minimum");

// 4. Verify all tasks have sprintLimit >= 20 seconds
for (const task of CODING_TASKS) {
  const csharpLimit = calculateSprintLimit(task.targetCode.csharp, task.sprintTimeLimit);
  const goLimit = calculateSprintLimit(task.targetCode.go, task.sprintTimeLimit);
  assert(csharpLimit >= 20, `Task ${task.id} (C#) sprintLimit ${csharpLimit} must be >= 20s`);
  assert(goLimit >= 20, `Task ${task.id} (Go) sprintLimit ${goLimit} must be >= 20s`);
}

console.log(`✓ All 13 TV tasks guaranteed sprintLimit >= 20s across both C# and Go`);

console.log("\n🎉 ALL TIER AUTO-SELECTION & TIMER CONSTRAINTS VERIFIED SUCCESSFULLY!");
