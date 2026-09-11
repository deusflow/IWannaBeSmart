/**
 * @file scratch/verify_theory_data.ts
 * @description Validates theory curriculum coverage across all 16 tasks for UA, EN, and DA locales
 */

import { theoryUa, theoryEn, theoryDa } from "../packages/i18n/src";

const REQUIRED_TASKS = [
  "task-0-1-power-on",
  "task-0-2-types",
  "task-0-3-sequential",
  "task-1-assignment",
  "task-2-branching",
  "task-variable-mutation",
  "task-boundary-guard",
  "task-for-loop",
  "task-function-encapsulation",
  "task-antipattern-god-object",
  "task-interface-polymorphism",
  "task-di-container",
  "task-command-registry",
  "task-pos-guard-clause",
  "task-pos-fee-calculation",
  "task-pos-pin-lockout",
  "task-pos-batch-settlement",
  "task-pos-interface-polymorphism",
  "task-pos-dependency-injection",
];

const LOCALES = [
  { name: "Ukrainian (UA)", dict: theoryUa },
  { name: "English (EN)", dict: theoryEn },
  { name: "Danish (DA)", dict: theoryDa },
];

console.log("=== VERIFYING CODE ANATOMY & SYNTAX THEORY CURRICULUM ===");

for (const loc of LOCALES) {
  console.log(`\nChecking locale: ${loc.name}`);
  for (const taskId of REQUIRED_TASKS) {
    const taskTheory = loc.dict.tasks[taskId];
    if (!taskTheory) {
      console.error(`❌ Missing theory for task: ${taskId} in ${loc.name}`);
      process.exit(1);
    }

    if (!taskTheory.concept || taskTheory.concept.trim().length < 15) {
      console.error(`❌ Concept too short or missing for ${taskId} in ${loc.name}`);
      process.exit(1);
    }

    if (!Array.isArray(taskTheory.tokens) || taskTheory.tokens.length === 0) {
      console.error(`❌ No tokens provided for ${taskId} in ${loc.name}`);
      process.exit(1);
    }

    for (const tokenItem of taskTheory.tokens) {
      if (!tokenItem.token || !tokenItem.role || !tokenItem.explanation) {
        console.error(`❌ Incomplete token item in ${taskId} in ${loc.name}:`, tokenItem);
        process.exit(1);
      }
    }

    if (!taskTheory.notes || taskTheory.notes.trim().length < 10) {
      console.error(`❌ Notes missing for ${taskId} in ${loc.name}`);
      process.exit(1);
    }

    if (!taskTheory.diff || taskTheory.diff.trim().length < 10) {
      console.error(`❌ Diff missing for ${taskId} in ${loc.name}`);
      process.exit(1);
    }

    console.log(`✓ [${loc.name}] ${taskId}: ${taskTheory.tokens.length} tokens verified`);
  }
}

console.log("\n🎉 ALL 16 TASKS HAVE COMPLETE SYNTAX ANATOMY & THEORY IN UA, EN, DA (100% COVERAGE)!");
