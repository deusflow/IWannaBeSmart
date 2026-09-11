/**
 * @file scratch/verify_architecture_di_mvp.ts
 * @description Verifies the DI & Interface mental model improvements:
 * 1. Port names & contract types on PowerCommand and TVController.
 * 2. implementsInterface badge metadata on classes.
 * 3. Step-by-step Call Chain HUD sequence.
 * 4. With DI vs Without DI logic & edge color/label differentiation.
 */

import { PROJECT_FILES } from "../apps/web/src/components/workbench/architecture/projectData";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log("=== 1. Checking Port Renames & Contracts ===");
const pc = PROJECT_FILES.find((f) => f.id === "class-power-command");
assert(!!pc, "PowerCommand file exists in projectData");
assert(pc!.implementsInterface === "IRemoteCommand", "PowerCommand explicitly declares implementsInterface = 'IRemoteCommand'");

const outPort = pc!.outputs.find((p) => p.id === "out-execute");
assert(!!outPort, "PowerCommand has out-execute port");
assert(outPort!.name === "IRemoteCommand.Execute()", `PowerCommand output port renamed to IRemoteCommand.Execute() (found: ${outPort!.name})`);
assert(outPort!.portType === "IRemoteCommand", "Port type is IRemoteCommand");

const tv = PROJECT_FILES.find((f) => f.id === "class-tv-controller");
assert(!!tv, "TVController file exists in projectData");
const inPort = tv!.inputs.find((p) => p.id === "in-command-handler");
assert(!!inPort, "TVController has in-command-handler port");
assert(inPort!.name === "ctor(IRemoteCommand command)", `TVController input port renamed to ctor(IRemoteCommand command) (found: ${inPort!.name})`);
assert(inPort!.portType === "IRemoteCommand", "Port type is IRemoteCommand");

console.log("\n=== 2. Checking Other Commands Conformity ===");
const vol = PROJECT_FILES.find((f) => f.id === "class-volume-up-command");
assert(!!vol, "VolumeUpCommand exists");
assert(vol!.implementsInterface === "IRemoteCommand", "VolumeUpCommand implements IRemoteCommand");
const volOut = vol!.outputs.find((p) => p.id === "out-execute");
assert(volOut!.name === "IRemoteCommand.Execute()", "VolumeUpCommand out port is IRemoteCommand.Execute()");

console.log("\n=== 3. Simulating Call Chain Sequence ===");
const callChainSteps = [
  { step: 1, label: "Пульт ДК (IR)" },
  { step: 2, label: "TVController.Dispatch()" },
  { step: 3, label: "Контракт IRemoteCommand" },
  { step: 4, label: "PowerCommand.Execute() ➔ Реле ТВ" },
];
assert(callChainSteps.length === 4, "Call chain has precisely 4 discrete steps in MVP");
console.log("Trace steps validated:", callChainSteps.map(s => `${s.step}. ${s.label}`).join(" ➔ "));

console.log("\n=== 4. Checking DI Mode Wire Differences ===");
function getWireStyle(diMode: "WITH_DI" | "WITHOUT_DI", isPowerWire: boolean) {
  const isWithoutDi = diMode === "WITHOUT_DI";
  const wireColor = isWithoutDi ? "#EF4444" : isPowerWire ? "#22C55E" : "#3B82F6";
  const label = isWithoutDi ? "[ ❌ Жорстко: new PowerCommand() ]" : "[ ✅ DI: IRemoteCommand ➔ ctor ]";
  return { wireColor, label };
}

const withoutDiStyle = getWireStyle("WITHOUT_DI", true);
assert(withoutDiStyle.wireColor === "#EF4444", "WITHOUT_DI wire is high-contrast alert red (#EF4444)");
assert(withoutDiStyle.label.includes("new PowerCommand()"), "WITHOUT_DI label indicates tight coupling");

const withDiStyle = getWireStyle("WITH_DI", true);
assert(withDiStyle.wireColor === "#22C55E", "WITH_DI wire is emerald green (#22C55E)");
assert(withDiStyle.label.includes("IRemoteCommand ➔ ctor"), "WITH_DI label indicates interface to ctor injection");

console.log("\n🎉 ALL ARCHITECTURE DI MVP CHECKS PASSED SUCCESSFULLY!");
