/**
 * @file packages/sim-engine/src/runtime/tasterEngine.ts
 * @description Pure deterministic simulation and validation engine for Career Speed-Dating.
 * No regex comparison for code verification; utilizes safe expression evaluation.
 * Deterministic multi-seed fight simulations for game design balance.
 */

// ═════════════════════════════════════════════════════════════════════
// 1. BACKEND VALIDATORS (C# / Go logic tasting)
// ═════════════════════════════════════════════════════════════════════

import { evaluateCondition } from "./parser";

/**
 * Safely evaluates an arithmetic/comparison expression for a single numeric variable using parser.ts.
 * Supports operators: >, >=, <, <=, ==, !=
 * Reversible variable positioning: e.g. "purchasesCount >= 5" or "5 <= purchasesCount"
 */
export function evaluateNumericCondition(
  expression: string,
  varName: string,
  val: number
): boolean {
  const clean = expression.trim().replace(/;+$/, "").replace(/^{|}$/g, "").trim();
  return evaluateCondition(clean, undefined, { [varName]: val });
}

export interface BackendTasterResult {
  passed: boolean;
  boundaryTestsPassed: boolean;
  conditionCorrect: boolean;
  error?: string;
  logs: string[];
}

/**
 * Validates step 3 "We Do" for Backend: Free shipping threshold starting at 500.
 * Expected rule: cartTotal >= 500 (or 500 <= cartTotal, etc.)
 */
export function validateBackendWeDo(
  conditionExpr: string,
  assertChecked: boolean
): BackendTasterResult {
  const logs: string[] = [];
  logs.push("[BACKEND_RUNNER] Evaluating free shipping threshold rule...");

  if (!assertChecked) {
    return {
      passed: false,
      boundaryTestsPassed: false,
      conditionCorrect: false,
      error: "Verification test assertion was not executed",
      logs: [...logs, "[FAIL] You must run the verification assertion to prove the logic."],
    };
  }

  // Support operator-only input (e.g. ">=" or "<=") or full expression ("cartTotal >= 500")
  const trimmed = conditionExpr.trim();
  const cleanExpr = /^(>=|<=|>|<|==|!=)$/.test(trimmed)
    ? `cartTotal ${trimmed} 500`
    : trimmed;

  try {
    const at499 = evaluateNumericCondition(cleanExpr, "cartTotal", 499);
    const at500 = evaluateNumericCondition(cleanExpr, "cartTotal", 500);
    const at501 = evaluateNumericCondition(cleanExpr, "cartTotal", 501);

    if (at499 === false && at500 === true && at501 === true) {
      logs.push("[PASS] cartTotal = 499 -> false (no free shipping)");
      logs.push("[PASS] cartTotal = 500 -> true (free shipping applies)");
      logs.push("[PASS] cartTotal = 501 -> true (free shipping applies)");
      logs.push("[PASS] Assertion Assert.Equal(true, hasFreeShipping(500)) verified.");
      return {
        passed: true,
        boundaryTestsPassed: true,
        conditionCorrect: true,
        logs,
      };
    } else {
      logs.push(`[FAIL] Boundary check mismatch: 499=${at499}, 500=${at500}, 501=${at501}`);
      return {
        passed: false,
        boundaryTestsPassed: false,
        conditionCorrect: false,
        error: "Condition does not satisfy free shipping starting from 500 inclusive",
        logs,
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      passed: false,
      boundaryTestsPassed: false,
      conditionCorrect: false,
      error: msg,
      logs: [...logs, `[SYNTAX_ERROR] ${msg}`],
    };
  }
}

/**
 * Validates step 4 "You Do" (Сам) for Backend:
 * Requirement: "Начиная с 5-й покупки включительно" -> purchasesCount >= 5.
 * User must provide the condition AND choose boundary values.
 * Validator checks:
 * 1. userBoundaryValues contains at least 4, 5, 6 (n-1, n, n+1).
 * 2. condition evaluates to false at 4, true at 5, true at 6.
 */
export function validateBackendYouDo(
  conditionExpr: string,
  userBoundaryValues: number[]
): BackendTasterResult {
  const logs: string[] = [];
  logs.push("[BACKEND_RUNNER] Running unit test suite with boundary value analysis...");

  // Check boundary test suite coverage
  const has4 = userBoundaryValues.includes(4);
  const has5 = userBoundaryValues.includes(5);
  const has6 = userBoundaryValues.includes(6);

  if (!has4 || !has5 || !has6) {
    logs.push(
      `[COVERAGE_FAIL] Boundary test suite is incomplete. Missing essential edge values (needs n-1, n, n+1 -> 4, 5, 6). Provided: [${userBoundaryValues.join(", ")}]`
    );
    return {
      passed: false,
      boundaryTestsPassed: false,
      conditionCorrect: false,
      error: "Boundary values must include 4, 5, and 6 to thoroughly test boundary behavior",
      logs,
    };
  }
  logs.push("[COVERAGE_PASS] Boundary test set contains critical triplet: [4, 5, 6].");

  try {
    const at4 = evaluateNumericCondition(conditionExpr, "purchasesCount", 4);
    const at5 = evaluateNumericCondition(conditionExpr, "purchasesCount", 5);
    const at6 = evaluateNumericCondition(conditionExpr, "purchasesCount", 6);

    logs.push(`[TEST] purchasesCount = 4 -> Result: ${at4} (Expected: false)`);
    logs.push(`[TEST] purchasesCount = 5 -> Result: ${at5} (Expected: true)`);
    logs.push(`[TEST] purchasesCount = 6 -> Result: ${at6} (Expected: true)`);

    const conditionCorrect = at4 === false && at5 === true && at6 === true;

    if (conditionCorrect) {
      logs.push("[ALL_TESTS_PASS] Edge cases validated! Logic correctly handles 5th purchase onwards.");
      return {
        passed: true,
        boundaryTestsPassed: true,
        conditionCorrect: true,
        logs,
      };
    } else {
      logs.push("[TEST_FAIL] Condition failed on one or more boundary tests.");
      return {
        passed: false,
        boundaryTestsPassed: true, // inputs were provided, but evaluation failed
        conditionCorrect: false,
        error: "Condition evaluation failed on boundary values (expected false at 4, true at 5, true at 6)",
        logs,
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      passed: false,
      boundaryTestsPassed: false,
      conditionCorrect: false,
      error: msg,
      logs: [...logs, `[SYNTAX_ERROR] ${msg}`],
    };
  }
}

// ═════════════════════════════════════════════════════════════════════
// 2. CYBERSECURITY VALIDATORS (SOC Log & Incident Analysis)
// ═════════════════════════════════════════════════════════════════════

export interface RawLogLine {
  id: string;
  timestamp: string;
  sourceIp: string;
  method: "GET" | "POST";
  uri: string;
  statusCode: number;
}

/**
 * Dataset for "We Do" (Повтори) step:
 * Simple log without traps. Malicious attacker is 203.0.113.77 hammering /login with 401.
 */
export const CYBER_WE_DO_LOGS: RawLogLine[] = [
  { id: "w1", timestamp: "08:12:01", sourceIp: "10.0.0.15", method: "GET", uri: "/index.html", statusCode: 200 },
  { id: "w2", timestamp: "08:12:02", sourceIp: "10.0.0.15", method: "GET", uri: "/styles.css", statusCode: 200 },
  { id: "w3", timestamp: "08:12:05", sourceIp: "203.0.113.77", method: "POST", uri: "/login", statusCode: 401 },
  { id: "w4", timestamp: "08:12:06", sourceIp: "203.0.113.77", method: "POST", uri: "/login", statusCode: 401 },
  { id: "w5", timestamp: "08:12:07", sourceIp: "203.0.113.77", method: "POST", uri: "/login", statusCode: 401 },
  { id: "w6", timestamp: "08:12:08", sourceIp: "198.51.100.12", method: "POST", uri: "/login", statusCode: 200 },
  { id: "w7", timestamp: "08:12:09", sourceIp: "203.0.113.77", method: "POST", uri: "/login", statusCode: 401 },
  { id: "w8", timestamp: "08:12:10", sourceIp: "10.0.0.15", method: "GET", uri: "/dashboard", statusCode: 200 },
  { id: "w9", timestamp: "08:12:11", sourceIp: "203.0.113.77", method: "POST", uri: "/login", statusCode: 401 },
  { id: "w10", timestamp: "08:12:12", sourceIp: "10.0.0.22", method: "GET", uri: "/api/health", statusCode: 200 },
];

/**
 * Dataset for "You Do" (Сам) step:
 * TRAP: Legitimate client 198.51.100.88 is the MOST FREQUENT IP (12 requests), all 200 OK!
 * Attacker 192.0.2.144 has 7 requests, but ALL are 401 Unauthorized brute-force on /login.
 * Banning 198.51.100.88 is a critical FALSE POSITIVE penalty.
 */
export const CYBER_YOU_DO_LOGS: RawLogLine[] = [
  { id: "l1", timestamp: "09:00:01", sourceIp: "198.51.100.88", method: "GET", uri: "/api/v1/feed", statusCode: 200 },
  { id: "l2", timestamp: "09:00:02", sourceIp: "198.51.100.88", method: "GET", uri: "/api/v1/feed", statusCode: 200 },
  { id: "l3", timestamp: "09:00:03", sourceIp: "192.0.2.144", method: "POST", uri: "/login", statusCode: 401 },
  { id: "l4", timestamp: "09:00:04", sourceIp: "198.51.100.88", method: "GET", uri: "/api/v1/feed", statusCode: 200 },
  { id: "l5", timestamp: "09:00:05", sourceIp: "192.0.2.144", method: "POST", uri: "/login", statusCode: 401 },
  { id: "l6", timestamp: "09:00:06", sourceIp: "10.0.1.5", method: "GET", uri: "/healthz", statusCode: 200 },
  { id: "l7", timestamp: "09:00:07", sourceIp: "198.51.100.88", method: "GET", uri: "/api/v1/feed", statusCode: 200 },
  { id: "l8", timestamp: "09:00:08", sourceIp: "192.0.2.144", method: "POST", uri: "/login", statusCode: 401 },
  { id: "l9", timestamp: "09:00:09", sourceIp: "198.51.100.88", method: "GET", uri: "/api/v1/feed", statusCode: 200 },
  { id: "l10", timestamp: "09:00:10", sourceIp: "198.51.100.88", method: "GET", uri: "/api/v1/feed", statusCode: 200 },
  { id: "l11", timestamp: "09:00:11", sourceIp: "192.0.2.144", method: "POST", uri: "/login", statusCode: 401 },
  { id: "l12", timestamp: "09:00:12", sourceIp: "10.0.1.5", method: "GET", uri: "/healthz", statusCode: 200 },
  { id: "l13", timestamp: "09:00:13", sourceIp: "198.51.100.88", method: "GET", uri: "/api/v1/feed", statusCode: 200 },
  { id: "l14", timestamp: "09:00:14", sourceIp: "192.0.2.144", method: "POST", uri: "/login", statusCode: 401 },
  { id: "l15", timestamp: "09:00:15", sourceIp: "198.51.100.88", method: "GET", uri: "/api/v1/feed", statusCode: 200 },
  { id: "l16", timestamp: "09:00:16", sourceIp: "192.0.2.144", method: "POST", uri: "/login", statusCode: 401 },
  { id: "l17", timestamp: "09:00:17", sourceIp: "198.51.100.88", method: "GET", uri: "/api/v1/feed", statusCode: 200 },
  { id: "l18", timestamp: "09:00:18", sourceIp: "10.0.1.5", method: "GET", uri: "/healthz", statusCode: 200 },
  { id: "l19", timestamp: "09:00:19", sourceIp: "192.0.2.144", method: "POST", uri: "/login", statusCode: 401 },
  { id: "l20", timestamp: "09:00:20", sourceIp: "198.51.100.88", method: "GET", uri: "/api/v1/feed", statusCode: 200 },
  { id: "l21", timestamp: "09:00:21", sourceIp: "198.51.100.88", method: "GET", uri: "/api/v1/feed", statusCode: 200 },
  { id: "l22", timestamp: "09:00:22", sourceIp: "198.51.100.88", method: "GET", uri: "/api/v1/feed", statusCode: 200 },
];

export interface CyberTasterResult {
  passed: boolean;
  blockedIp: string;
  isFalsePositive: boolean;
  error?: string;
  logs: string[];
}

/**
 * Validates step 3 "We Do" for Cybersecurity.
 */
export function validateCyberWeDo(
  selectedIp: string,
  verifyLegitTraffic: boolean
): CyberTasterResult {
  const cleanIp = selectedIp.trim();
  const logs: string[] = [];
  logs.push(`[SOC_FIREWALL] Processing containment order for IP: ${cleanIp}`);

  if (!verifyLegitTraffic) {
    return {
      passed: false,
      blockedIp: cleanIp,
      isFalsePositive: false,
      error: "Verification check was not confirmed",
      logs: [...logs, "[FAIL] You must verify that legitimate 200 OK traffic is unharmed."],
    };
  }

  if (cleanIp === "203.0.113.77") {
    logs.push("[PASS] Attacking brute-force bot IP 203.0.113.77 neutralized.");
    logs.push("[PASS] Legitimate traffic (10.0.0.15, 10.0.0.22) continues receiving 200 OK.");
    return {
      passed: true,
      blockedIp: cleanIp,
      isFalsePositive: false,
      logs,
    };
  }

  return {
    passed: false,
    blockedIp: cleanIp,
    isFalsePositive: false,
    error: `Incorrect IP. Target 203.0.113.77 was responsible for 401 authentication storm.`,
    logs: [...logs, `[FAIL] IP ${cleanIp} is not the attacking actor.`],
  };
}

/**
 * Validates step 4 "You Do" (Сам) for Cybersecurity with FALSE POSITIVE TRAP.
 */
export function validateCyberYouDo(selectedIp: string): CyberTasterResult {
  const cleanIp = selectedIp.trim();
  const logs: string[] = [];
  logs.push(`[SOC_FIREWALL] Analyzing incident evidence for containment of ${cleanIp}...`);

  // Trap check: Most frequent IP is innocent
  if (cleanIp === "198.51.100.88") {
    logs.push("[CRITICAL_ALERT] FALSE POSITIVE! Banned legitimate client 198.51.100.88!");
    logs.push("[SLA_BREACH] This IP generated the highest volume of traffic, but 100% of its requests were 200 OK.");
    logs.push("[POST_MORTEM] High traffic volume alone does NOT equal malicious activity.");
    return {
      passed: false,
      blockedIp: cleanIp,
      isFalsePositive: true,
      error: "False positive! You banned a legitimate heavy-usage customer (100% 200 OK). Look for 401 Unauthorized errors.",
      logs,
    };
  }

  // Correct attacker check
  if (cleanIp === "192.0.2.144") {
    logs.push("[PASS] Correct threat actor isolated: 192.0.2.144.");
    logs.push("[PASS] Evidence: 7 consecutive 401 Unauthorized failures on /login (Credential Stuffing).");
    logs.push("[PASS] Legitimate client 198.51.100.88 remains unblocked and active.");
    return {
      passed: true,
      blockedIp: cleanIp,
      isFalsePositive: false,
      logs,
    };
  }

  return {
    passed: false,
    blockedIp: cleanIp,
    isFalsePositive: false,
    error: `Target IP ${cleanIp} has no association with the attack.`,
    logs: [...logs, `[FAIL] Banning ${cleanIp} does not mitigate the incident.`],
  };
}

// ═════════════════════════════════════════════════════════════════════
// 3. GAME DESIGN VALIDATORS (Deterministic Multi-Seed Combat Simulator)
// ═════════════════════════════════════════════════════════════════════

export interface DuelParams {
  bossDamage: number;
  bossCooldownSec: number;
  potionHeal: number;
  potionCount: number;
  playerArmor?: number;
}

export interface DuelSimulationSummary {
  passed: boolean;
  totalBattles: number;
  winRate: number;              // 0.0 - 1.0 (Target: 0.45 - 0.55)
  avgBattleDurationSec: number; // Target: 10.0s - 15.0s
  failedCriteria: ("winRateTooHigh" | "winRateTooLow" | "battleTooFast" | "battleTooSlow")[];
  logs: string[];
}

/**
 * Linear Congruential Generator (LCG) for 100% deterministic pseudo-randomness across platforms.
 */
function createLcgRng(seed: number) {
  let s = seed >>> 0;
  return function nextFloat(): number {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Simulates a single duel between Player and Boss.
 * Player stats: HP = 150, Damage = 25 (cooldown 1.0s), Critical hit chance = 15% (x1.5).
 */
export function simulateSingleDuel(params: DuelParams, rng: () => number): { won: boolean; durationSec: number } {
  let playerHp = 150;
  let bossHp = 300;
  let potionsRemaining = params.potionCount;
  const playerArmor = params.playerArmor ?? 0;

  let timeSec = 0;
  let nextPlayerAttack = 1.0;
  let nextBossAttack = params.bossCooldownSec;

  const maxTimeLimitSec = 60; // Prevent infinite battles

  while (playerHp > 0 && bossHp > 0 && timeSec < maxTimeLimitSec) {
    const nextEventTime = Math.min(nextPlayerAttack, nextBossAttack);
    timeSec = nextEventTime;

    // Player action
    if (Math.abs(timeSec - nextPlayerAttack) < 0.001) {
      const isCrit = rng() < 0.15;
      const dmg = isCrit ? 25 * 1.5 : 25;
      bossHp -= dmg;
      nextPlayerAttack += 1.0;

      // Potion usage logic: drink when HP drops below 40% and have potions
      if (playerHp < 60 && potionsRemaining > 0) {
        playerHp = Math.min(150, playerHp + params.potionHeal);
        potionsRemaining--;
      }
    }

    if (bossHp <= 0) break;

    // Boss action
    if (Math.abs(timeSec - nextBossAttack) < 0.001) {
      // Variance in boss damage +/- 10%
      const variance = 0.9 + rng() * 0.2;
      const rawDmg = params.bossDamage * variance;
      const netDmg = Math.max(5, rawDmg - playerArmor);
      playerHp -= netDmg;
      nextBossAttack += params.bossCooldownSec;
    }
  }

  return {
    won: bossHp <= 0 && playerHp > 0,
    durationSec: Math.round(timeSec * 10) / 10,
  };
}

/**
 * Runs 500 battles with deterministic seed and evaluates metrics.
 */
export function simulateBossFights(
  params: DuelParams,
  seed: number = 42,
  battlesCount: number = 500
): DuelSimulationSummary {
  const rng = createLcgRng(seed);
  let playerWins = 0;
  let totalDuration = 0;

  for (let i = 0; i < battlesCount; i++) {
    const result = simulateSingleDuel(params, rng);
    if (result.won) playerWins++;
    totalDuration += result.durationSec;
  }

  const winRate = playerWins / battlesCount;
  const avgDuration = Math.round((totalDuration / battlesCount) * 10) / 10;
  const failedCriteria: DuelSimulationSummary["failedCriteria"] = [];
  const logs: string[] = [];

  logs.push(`[COMBAT_SIM] Executed ${battlesCount} deterministic encounters with seed=${seed}.`);
  logs.push(`[METRICS] Win Rate: ${(winRate * 100).toFixed(1)}% | Avg Duration: ${avgDuration}s`);

  // Target: Win Rate 45% - 55%
  if (winRate < 0.45) {
    failedCriteria.push("winRateTooLow");
    logs.push(`[BALANCE_FAIL] Win rate ${(winRate * 100).toFixed(1)}% is too punishing (Target: 45% - 55%).`);
  } else if (winRate > 0.55) {
    failedCriteria.push("winRateTooHigh");
    logs.push(`[BALANCE_FAIL] Win rate ${(winRate * 100).toFixed(1)}% is too easy (Target: 45% - 55%).`);
  } else {
    logs.push(`[BALANCE_PASS] Win rate ${(winRate * 100).toFixed(1)}% satisfies golden ratio.`);
  }

  // Target: Duration 10.0s - 15.0s
  if (avgDuration < 10.0) {
    failedCriteria.push("battleTooFast");
    logs.push(`[DURATION_FAIL] Average fight (${avgDuration}s) is too fast / bursty (Target: 10s - 15s).`);
  } else if (avgDuration > 15.0) {
    failedCriteria.push("battleTooSlow");
    logs.push(`[DURATION_FAIL] Average fight (${avgDuration}s) is tedious / dragging (Target: 10s - 15s).`);
  } else {
    logs.push(`[DURATION_PASS] Average fight (${avgDuration}s) provides optimal tension.`);
  }

  const passed = failedCriteria.length === 0;
  return {
    passed,
    totalBattles: battlesCount,
    winRate,
    avgBattleDurationSec: avgDuration,
    failedCriteria,
    logs,
  };
}

/**
 * Validates step 3 "We Do" for Game Design.
 * Armor test: playerArmor = 15, expected avg duration 10 - 12s.
 */
export function validateGameDesignWeDo(
  playerArmor: number,
  runSimulationChecked: boolean
): { passed: boolean; avgDuration: number; error?: string; logs: string[] } {
  const logs: string[] = [];
  logs.push("[GAME_DESIGN_RUNNER] Testing armor mitigation on boss encounter...");

  if (!runSimulationChecked) {
    return {
      passed: false,
      avgDuration: 0,
      error: "Simulation run was not triggered",
      logs: [...logs, "[FAIL] You must run the 100-battle simulation to observe TTK."],
    };
  }

  // Standard params for step 2: bossDamage = 45, bossCooldownSec = 1.8, potionHeal = 0, potionCount = 0
  const sim = simulateBossFights(
    { bossDamage: 45, bossCooldownSec: 1.8, potionHeal: 0, potionCount: 0, playerArmor },
    12345,
    100
  );

  logs.push(...sim.logs);

  if (sim.avgBattleDurationSec >= 10.0 && sim.avgBattleDurationSec <= 12.0) {
    logs.push("[PASS] Player armor setting yields target 10-12s battle duration.");
    return {
      passed: true,
      avgDuration: sim.avgBattleDurationSec,
      logs,
    };
  }

  return {
    passed: false,
    avgDuration: sim.avgBattleDurationSec,
    error: `Average duration ${sim.avgBattleDurationSec}s is outside target 10.0s - 12.0s range. Adjust armor value.`,
    logs,
  };
}

/**
 * Validates step 4 "You Do" (Сам) for Game Design across multiple seeds.
 */
export function validateGameDesignYouDo(
  params: DuelParams,
  seeds: number[] = [42, 99, 1337]
): DuelSimulationSummary {
  const allLogs: string[] = [];
  let allPassed = true;
  let combinedWinRate = 0;
  let combinedDuration = 0;
  const combinedFailedCriteria = new Set<DuelSimulationSummary["failedCriteria"][number]>();

  for (const seed of seeds) {
    const res = simulateBossFights(params, seed, 500);
    allLogs.push(`--- Seed ${seed} ---`);
    allLogs.push(...res.logs);
    combinedWinRate += res.winRate;
    combinedDuration += res.avgBattleDurationSec;
    if (!res.passed) {
      allPassed = false;
      res.failedCriteria.forEach((c) => combinedFailedCriteria.add(c));
    }
  }

  return {
    passed: allPassed,
    totalBattles: 500 * seeds.length,
    winRate: Math.round((combinedWinRate / seeds.length) * 1000) / 1000,
    avgBattleDurationSec: Math.round((combinedDuration / seeds.length) * 10) / 10,
    failedCriteria: Array.from(combinedFailedCriteria),
    logs: allLogs,
  };
}
