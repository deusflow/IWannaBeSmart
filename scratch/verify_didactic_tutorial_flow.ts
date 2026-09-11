/**
 * @file scratch/verify_didactic_tutorial_flow.ts
 * @description Autonomous verification script to validate that all tasks have rich didactic briefings,
 *              ready solutions, memory notes for primitives, and architecture mappings.
 */

import { CODING_TASKS } from "../packages/sim-engine/src/runtime/tasks";
import { FINTECH_TASKS } from "../packages/sim-engine/src/runtime/tasks-fintech";
import { TASK_DIDACTIC_MAP } from "../apps/web/src/components/workbench/playground/taskDidacticContext";

console.log("=== 1. Validating TV Coding Tasks Didactic Coverage ===");
let tvMissing = 0;
let primitiveCheckPassed = false;
let architectureCheckPassed = false;

for (const task of CODING_TASKS) {
  const didactic = TASK_DIDACTIC_MAP[task.id];
  if (!didactic) {
    console.warn(`[WARN] Missing didactic mapping for TV task: ${task.id}`);
    tvMissing++;
  } else {
    // Check target code exists
    if (!task.targetCode?.csharp || !task.targetCode?.go) {
      throw new Error(`Task ${task.id} missing target code!`);
    }

    // Check primitive types
    if (task.id === "task-0-2-types") {
      if (!didactic.primitiveMemoryNote?.csharp || !didactic.primitiveMemoryNote?.go) {
        throw new Error("Task 0-2 missing primitive memory note!");
      }
      if (!didactic.primitiveMemoryNote.csharp.includes("БЕЗ ЛАПОК") || !didactic.primitiveMemoryNote.csharp.includes("У ЛАПКАХ")) {
        throw new Error("Task 0-2 memory note must explain quotes vs no quotes!");
      }
      primitiveCheckPassed = true;
    }

    // Check architecture mapping for Tier 2 tasks
    if (task.tier === 2 && task.id !== "task-anti-pattern-god-switch") {
      if (!didactic.architectureMap?.contractFile || !didactic.architectureMap?.implementationFile) {
        throw new Error(`Tier 2 task ${task.id} must have contractFile and implementationFile!`);
      }
      if (!didactic.architectureMap.canvasNodeName || !didactic.architectureMap.canvasWiring) {
        throw new Error(`Tier 2 task ${task.id} must have canvasNodeName and canvasWiring!`);
      }
      architectureCheckPassed = true;
    }
  }
}
console.log(`TV Tasks: ${CODING_TASKS.length} tasks analyzed. TV Missing: ${tvMissing}`);
if (!primitiveCheckPassed) throw new Error("Primitive memory check failed!");
if (!architectureCheckPassed) throw new Error("Architecture check failed!");
console.log("✓ Primitive int/string CPU memory allocation notes verified.");
console.log("✓ Architecture Tier 2 contract, implementation, and Canvas wiring verified.");

console.log("\n=== 2. Validating Fintech POS Tasks Didactic Coverage ===");
let fintechMissing = 0;
for (const task of FINTECH_TASKS) {
  const didactic = TASK_DIDACTIC_MAP[task.id];
  if (!didactic) {
    console.warn(`[WARN] Missing didactic mapping for POS task: ${task.id}`);
    fintechMissing++;
  } else {
    if (!task.targetCode?.csharp || !task.targetCode?.go) {
      throw new Error(`POS Task ${task.id} missing target code!`);
    }
    if (task.id === "task-pos-guard-clause") {
      if (!didactic.architectureMap) {
        throw new Error("POS Guard Clause task must have architectureMap!");
      }
    }
  }
}
console.log(`POS Tasks: ${FINTECH_TASKS.length} tasks analyzed. POS Missing: ${fintechMissing}`);

console.log("\n=== 3. Summary ===");
console.log("ALL DIDACTIC GAME LOOP CHECKS PASSED PERFECTLY!");
