import { CODING_TASKS, executeTvScript, type VirtualTvState } from "../packages/sim-engine/src";
import { useWorkbenchStore } from "../apps/web/src/store/workbenchStore";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log("=== VERIFYING TV CODE GYM (3-STAR MASTERY) TASKS & ENGINE ===");

assert(CODING_TASKS.length >= 13, `Expected at least 13 TV tasks, got ${CODING_TASKS.length}`);

for (const task of CODING_TASKS) {
  console.log(`\n--- Testing Task ${task.order}: ${task.id} (Tier ${task.tier ?? 0}) ---`);

  // 1. Structure assertions
  assert(Boolean(task.targetCode?.csharp), `Task ${task.id} missing targetCode.csharp`);
  assert(Boolean(task.targetCode?.go), `Task ${task.id} missing targetCode.go`);
  assert(Boolean(task.clozeTemplate?.csharp), `Task ${task.id} missing clozeTemplate.csharp`);
  assert(Boolean(task.clozeTemplate?.go), `Task ${task.id} missing clozeTemplate.go`);
  assert(task.clozeTemplate.csharp.includes("___"), `Task ${task.id} C# clozeTemplate missing '___'`);
  assert(task.clozeTemplate.go.includes("___"), `Task ${task.id} Go clozeTemplate missing '___'`);
  assert(typeof task.sprintTimeLimit === "number" && task.sprintTimeLimit >= 15, `Task ${task.id} invalid sprintTimeLimit`);
  console.log(`✓ Structure & cloze templates verified`);

  // 2. Test C# execution & validation with targetCode
  const beforeStateCs: VirtualTvState = {
    isOn:
      task.id === "task-0-1-power-on" ||
      task.id === "task-0-3-sequential" ||
      task.id === "task-1-assignment"
        ? false
        : true,
    channel: task.id === "task-boundary-guard" ? 5 : task.id === "task-0-2-types" ? 3 : 1,
    volume: task.id === "task-function-encapsulation" ? 50 : 20,
    isArchitectureWired: true,
  };

  const resultCs = executeTvScript(task.targetCode.csharp, beforeStateCs);
  assert(resultCs.success, `Task ${task.id} C# execution failed: ${resultCs.error}`);
  const valCs = task.validate(beforeStateCs, resultCs.newState, resultCs, task.targetCode.csharp);
  assert(valCs.passed, `Task ${task.id} C# targetCode failed validation: ${valCs.messageKey}`);
  console.log(`✓ C# targetCode execution & validation passed`);

  // 3. Test Go execution & validation with targetCode
  const beforeStateGo: VirtualTvState = {
    isOn:
      task.id === "task-0-1-power-on" ||
      task.id === "task-0-3-sequential" ||
      task.id === "task-1-assignment"
        ? false
        : true,
    channel: task.id === "task-boundary-guard" ? 5 : task.id === "task-0-2-types" ? 3 : 1,
    volume: task.id === "task-function-encapsulation" ? 50 : 20,
    isArchitectureWired: true,
  };

  const resultGo = executeTvScript(task.targetCode.go, beforeStateGo);
  assert(resultGo.success, `Task ${task.id} Go execution failed: ${resultGo.error}`);
  const valGo = task.validate(beforeStateGo, resultGo.newState, resultGo, task.targetCode.go);
  assert(valGo.passed, `Task ${task.id} Go targetCode failed validation: ${valGo.messageKey}`);
  console.log(`✓ Go targetCode execution & validation passed`);
}

// 4. Test Architecture Studio wire breakage for Task 9 & 10
console.log("\n--- Testing Architecture Studio Broken Wire Bridge ---");
const unWiredState: VirtualTvState = {
  isOn: true,
  channel: 1,
  volume: 20,
  isArchitectureWired: false,
};

// 4.1 Invoking command without wiring/registration throws NullReferenceException
const resultUnWiredCmd = executeTvScript("command.Execute();", unWiredState);
assert(resultUnWiredCmd.success === false, "command.Execute() should fail when wire is broken");
assert(
  Boolean(resultUnWiredCmd.error && resultUnWiredCmd.error.includes("NullReferenceException")),
  `Should throw NullReferenceException when wire is broken, got: ${resultUnWiredCmd.error}`
);
console.log("✓ command.Execute() correctly throws NullReferenceException when hardware wire is broken");

// 4.2 Task 9 DI registration code restores the broken wire in Architecture Studio
const resultWired = executeTvScript("services.AddTransient<IRemoteCommand, CalcCommand>();", unWiredState);
assert(resultWired.success === true, "services.AddTransient should succeed and register service");
assert(resultWired.newState.isArchitectureWired === true, "services.AddTransient should restore isArchitectureWired to true");
console.log("✓ services.AddTransient restores hardware wire in Architecture Studio");

// 4.3 Task 10 Command Registry: executing an unregistered key with broken wire throws NullReferenceException
const resultUnWired10 = executeTvScript('registry["UNKNOWN"].Execute();', unWiredState);
assert(resultUnWired10.success === false, "Task 10 should fail execution when key is unregistered and wire is broken");
assert(
  Boolean(resultUnWired10.error && resultUnWired10.error.includes("NullReferenceException")),
  `Task 10 should throw NullReferenceException, got: ${resultUnWired10.error}`
);
console.log("✓ Task 10 correctly throws NullReferenceException when hardware wire is broken");

// 5. Test Workbench Store mastery calculations
console.log("\n--- Testing Workbench Store Mastery Stars (39 ★ for TV) ---");
const store = useWorkbenchStore.getState();
store.setTaskMastery("task-0-1-power-on", 3);
store.setTaskMastery("task-1-assignment", 3);
assert(useWorkbenchStore.getState().taskMasteryStars["task-1-assignment"] === 3, "Mastery stars should equal 3");

// Verify TV stars sum calculation
const totalTvStars = CODING_TASKS.reduce(
  (sum, task) => sum + (useWorkbenchStore.getState().taskMasteryStars[task.id] || 0),
  0
);
assert(totalTvStars >= 6, `Expected at least 6 TV stars, got ${totalTvStars}`);
console.log(`✓ Store mastery stars verified (current TV stars: ${totalTvStars}/39 ★)`);

console.log("\n🎉 ALL 13 TV TASKS & 3-STAR CODE GYM VERIFICATIONS PASSED 100%!");
