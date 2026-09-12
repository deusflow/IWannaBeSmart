/**
 * @file scratch/verify_trace_chain.ts
 * @description Acceptance verification script for Trace-Chain Node System (Section 5 acceptance test).
 */

import {
  buildRawTraceGraph,
  computeTraceNodePosition,
  evaluateTraceGraph,
} from "../apps/web/src/components/workbench/architecture/traceGraph";

function runVerification() {
  console.log("==================================================================");
  console.log("TEST SUITE: Trace-Chain Node System (Section 5 Acceptance Test)");
  console.log("==================================================================\n");

  // ── TEST 1: Blueprint Graph Structure for IRemoteCommand ──
  console.log("TEST 1: Verifying IRemoteCommand Blueprint Graph Structure...");
  const rawGraph = buildRawTraceGraph("IRemoteCommand");

  if (!rawGraph || !rawGraph.nodes || !rawGraph.edges) {
    throw new Error("FAIL: Raw trace graph for IRemoteCommand is undefined");
  }

  // Expect nodes for: Declaration, 2 Implementations (Power & Volume), Registration, InjectionPoint, CallSite, Effect
  const declNode = rawGraph.nodes.find((n) => n.type === "Declaration");
  const implNodes = rawGraph.nodes.filter((n) => n.type === "Implementation");
  const regNode = rawGraph.nodes.find((n) => n.type === "Registration");
  const injNode = rawGraph.nodes.find((n) => n.type === "InjectionPoint");
  const callNode = rawGraph.nodes.find((n) => n.type === "CallSite");
  const effectNode = rawGraph.nodes.find((n) => n.type === "Effect");

  if (!declNode) throw new Error("FAIL: Declaration node missing");
  if (implNodes.length < 2) throw new Error(`FAIL: Expected at least 2 implementations (fan-out), got ${implNodes.length}`);
  if (!regNode) throw new Error("FAIL: Registration node missing");
  if (!injNode) throw new Error("FAIL: InjectionPoint node missing");
  if (!callNode) throw new Error("FAIL: CallSite node missing");
  if (!effectNode) throw new Error("FAIL: Effect node missing");

  console.log("  ✓ All 6 logical steps present: Declaration -> Implementation(s) -> Registration -> InjectionPoint -> CallSite -> Effect");
  console.log(`  ✓ Total nodes: ${rawGraph.nodes.length}, total edges: ${rawGraph.edges.length}`);

  // ── TEST 2: Layout Fan-out Coordinates ──
  console.log("\nTEST 2: Verifying Hierarchical Layout & Fan-out coordinates...");
  const powerPos = computeTraceNodePosition(implNodes[0], 40, 200, 280, 160);
  const volPos = computeTraceNodePosition(implNodes[1], 40, 200, 280, 160);

  if (powerPos.x !== volPos.x) {
    throw new Error(`FAIL: Parallel implementations should share rank X. Got ${powerPos.x} vs ${volPos.x}`);
  }
  if (powerPos.y === volPos.y) {
    throw new Error(`FAIL: Parallel implementations must have vertical offset to avoid overlap. Got same Y: ${powerPos.y}`);
  }

  const verticalDelta = Math.abs(volPos.y - powerPos.y);
  console.log(`  ✓ Fan-out horizontal alignment: X = ${powerPos.x}px`);
  console.log(`  ✓ Fan-out vertical spacing: ${verticalDelta}px between branches (No node collision)`);

  // ── TEST 3: Nominal Pipeline (No bypasses) ──
  console.log("\nTEST 3: Evaluating Nominal Pipeline (No bypasses)...");
  const nominal = evaluateTraceGraph("IRemoteCommand", undefined, new Set());
  if (nominal.isBroken) {
    throw new Error(`FAIL: Nominal graph should not be broken! Reason: ${nominal.brokenReason}`);
  }
  const brokenEdges = nominal.edges.filter((e) => e.status === "broken");
  if (brokenEdges.length > 0) {
    throw new Error(`FAIL: Nominal graph has ${brokenEdges.length} broken edges!`);
  }
  console.log("  ✓ All edges active in nominal state");

  // ── TEST 4: Counterfactual Bypass v1 (Bypass Registration) ──
  console.log("\nTEST 4: Evaluating Counterfactual Bypass v1 on DI Registration...");
  const bypassed = evaluateTraceGraph("IRemoteCommand", undefined, new Set(["node-trace-di-reg"]));

  if (!bypassed.isBroken) {
    throw new Error("FAIL: Graph must be marked isBroken = true when DI Registration is bypassed");
  }

  const regAfter = bypassed.nodes.find((n) => n.id === "node-trace-di-reg");
  if (!regAfter?.isBypassed) {
    throw new Error("FAIL: Target node must have isBypassed = true");
  }

  // Downstream edges: edge-reg-inj, edge-inj-call, edge-call-effect must be broken
  const regToInj = bypassed.edges.find((e) => e.id === "edge-reg-inj");
  const injToCall = bypassed.edges.find((e) => e.id === "edge-inj-call");
  const callToEffect = bypassed.edges.find((e) => e.id === "edge-call-effect");

  if (regToInj?.status !== "broken") throw new Error("FAIL: Edge reg->inj must be broken");
  if (injToCall?.status !== "broken") throw new Error("FAIL: Edge inj->call must be broken");
  if (callToEffect?.status !== "broken") throw new Error("FAIL: Edge call->effect must be broken");

  console.log("  ✓ Target node [node-trace-di-reg] marked bypassed");
  console.log("  ✓ Downstream edges marked broken (dashed red lines propagated)");
  console.log(`  ✓ Broken explanation generated: "${bypassed.brokenReason}"`);

  // ── TEST 5: Standalone Function Trace (Mute) ──
  console.log("\nTEST 5: Verifying Standalone Function Trace (Mute)...");
  const muteGraph = buildRawTraceGraph("Mute");
  if (muteGraph.nodes.length !== 3) {
    throw new Error(`FAIL: Function graph should have 3 nodes (Declaration -> CallSite -> Effect), got ${muteGraph.nodes.length}`);
  }
  if (muteGraph.edges.length !== 2) {
    throw new Error(`FAIL: Function graph should have 2 edges, got ${muteGraph.edges.length}`);
  }
  console.log("  ✓ Function trace flexible chain: 3 nodes (no Implementation/Registration needed)");

  console.log("\n==================================================================");
  console.log("ALL 5 TRACE-CHAIN SPECIFICATION TESTS PASSED SUCCESSFULLY! ✓");
  console.log("==================================================================");
}

runVerification();
