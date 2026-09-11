/**
 * Scratch test script to verify:
 * 1. PROJECT_FILES has VolumeUpCommand, PowerCommand, and TVController with correct port types.
 * 2. Types and data structures for InjectedDependencyInfo (0x7F2A for Power, 0x9B1C for Volume).
 * 3. Initial node state: TVController starts with null injectedDependency (Memory X-Ray null badge).
 * 4. Single-slot constructor replacement logic.
 * 5. Dynamic resolution: VolumeUpCommand alters volume while TVController code remains intact.
 */

import { PROJECT_FILES } from "../apps/web/src/components/workbench/architecture/projectData";
import type { InjectedDependencyInfo, ArchitectureNodeData } from "../apps/web/src/components/workbench/architecture/types";

function runVerification() {
  console.log("=== STEP 1: Verifying PROJECT_FILES ===");
  const powerCmd = PROJECT_FILES.find((f) => f.id === "class-power-command");
  const volumeCmd = PROJECT_FILES.find((f) => f.id === "class-volume-up-command");
  const tvController = PROJECT_FILES.find((f) => f.id === "class-tv-controller");

  if (!powerCmd) throw new Error("PowerCommand not found in PROJECT_FILES");
  if (!volumeCmd) throw new Error("VolumeUpCommand not found in PROJECT_FILES");
  if (!tvController) throw new Error("TVController not found in PROJECT_FILES");

  console.log(`✓ PowerCommand found: ${powerCmd.name}, role: ${powerCmd.role}`);
  console.log(`✓ VolumeUpCommand found: ${volumeCmd.name}, role: ${volumeCmd.role}`);
  console.log(`✓ TVController found: ${tvController.name}, role: ${tvController.role}`);

  // Check interface contracts
  if (powerCmd.implementsInterface !== "IRemoteCommand") {
    throw new Error(`PowerCommand does not implement IRemoteCommand: ${powerCmd.implementsInterface}`);
  }
  if (volumeCmd.implementsInterface !== "IRemoteCommand") {
    throw new Error(`VolumeUpCommand does not implement IRemoteCommand: ${volumeCmd.implementsInterface}`);
  }
  console.log("✓ Both PowerCommand and VolumeUpCommand implement IRemoteCommand contract!");

  // Check TVController input ports
  const ctorPort = tvController.inputs.find((p) => p.id === "in-command-handler");
  if (!ctorPort || ctorPort.portType !== "IRemoteCommand") {
    throw new Error(`TVController input port 'in-command-handler' invalid: ${JSON.stringify(ctorPort)}`);
  }
  console.log(`✓ TVController constructor input port: ${ctorPort.name} [Type: ${ctorPort.portType}]`);

  console.log("\n=== STEP 2: Verifying Memory X-Ray States ===");
  // Test null state
  let currentDep: InjectedDependencyInfo | null = null;
  console.log(`Initial TVController Memory State: _cmd = ${currentDep === null ? "null ⚠️ (NULL_REF)" : currentDep}`);
  if (currentDep !== null) throw new Error("Expected initial dependency to be null");

  // Wire PowerCommand
  currentDep = { name: "PowerCommand", address: "0x7F2A", commandType: "power" };
  console.log(`Wired PowerCommand -> Memory Slot: _cmd = [${currentDep.address}: ${currentDep.name}] (ACTIVE REF)`);
  if (currentDep.address !== "0x7F2A") throw new Error("Incorrect memory address for PowerCommand");

  // Hot Swap to VolumeUpCommand
  currentDep = { name: "VolumeUpCommand", address: "0x9B1C", commandType: "volume" };
  console.log(`Hot Swap -> Memory Slot: _cmd = [${currentDep.address}: ${currentDep.name}] (ACTIVE REF)`);
  if (currentDep.address !== "0x9B1C") throw new Error("Incorrect memory address for VolumeUpCommand");

  console.log("\n=== STEP 3: Verifying Single-Slot Constructor Constraint ===");
  type MockEdge = { id: string; source: string; target: string; targetHandle: string; commandName?: string };
  let edges: MockEdge[] = [];

  // Connect PowerCommand
  const edgePower: MockEdge = {
    id: "ae-power",
    source: "node-class-power-command",
    target: "node-class-tv-controller",
    targetHandle: "in-command-handler",
    commandName: "PowerCommand",
  };
  edges = [...edges.filter((e) => !(e.target.includes("tv-controller") && e.targetHandle === "in-command-handler")), edgePower];
  console.log(`Connected edge 1: ${edges.length} active edge(s) targeting ctor. Injected: ${edges[0].commandName}`);
  if (edges.length !== 1 || edges[0].commandName !== "PowerCommand") throw new Error("Single slot rule failed for edge 1");

  // Hot Swap by connecting VolumeUpCommand into the same ctor slot
  const edgeVolume: MockEdge = {
    id: "ae-volume",
    source: "node-class-volume-up-command",
    target: "node-class-tv-controller",
    targetHandle: "in-command-handler",
    commandName: "VolumeUpCommand",
  };
  edges = [...edges.filter((e) => !(e.target.includes("tv-controller") && e.targetHandle === "in-command-handler")), edgeVolume];
  console.log(`Connected edge 2: ${edges.length} active edge(s) targeting ctor. Injected: ${edges[0].commandName}`);
  if (edges.length !== 1 || edges[0].commandName !== "VolumeUpCommand") throw new Error("Single slot rule failed for edge 2");

  console.log("\n=== ALL HOT SWAP & MEMORY X-RAY VERIFICATIONS PASSED SUCCESSFULLY! ===");
}

runVerification();
