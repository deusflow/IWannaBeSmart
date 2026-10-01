/**
 * @file packages/sim-engine/src/__tests__/tasterEngine.test.ts
 * @description Comprehensive unit tests for Career Speed-Dating verification engine.
 */

import { describe, it, expect } from "vitest";
import {
  evaluateNumericCondition,
  validateBackendWeDo,
  validateBackendYouDo,
  validateCyberWeDo,
  validateCyberYouDo,
  validateGameDesignWeDo,
  validateGameDesignYouDo,
  ROLE_TASTER_REGISTRY,
} from "../runtime";

describe("Career Speed-Dating Simulation Engine", () => {
  // ─────────────────────────────────────────────────────────────────
  // Role Registry Integrity
  // ─────────────────────────────────────────────────────────────────
  describe("ROLE_TASTER_REGISTRY", () => {
    it("should register 3 core roles with complete didactic fields", () => {
      expect(ROLE_TASTER_REGISTRY.length).toBe(3);
      for (const role of ROLE_TASTER_REGISTRY) {
        expect(role.id).toBeDefined();
        expect(role.roleTitleKey).toBeDefined();
        expect(role.routineFactKey).toBeDefined();
        expect(role.iDoStep.explanationKey).toBeDefined();
        expect(role.weDoStep.verificationKey).toBeDefined();
        expect(role.youDoStep.requirementTextKey).toBeDefined();
        expect(role.youDoStep.hintsKeys.length).toBe(3);
      }
    });

    it("should have valid targetStationId and targetTrack without ambiguous values", () => {
      const validStationIds = ["tv", "pos", "iot", "api", "git", "bandit", "vertex", "fde", "rag", "cyber", null];
      const validTracks = ["backend", "ai", "security", "explorer"];

      for (const role of ROLE_TASTER_REGISTRY) {
        expect(validStationIds).toContain(role.targetStationId);
        expect(validTracks).toContain(role.targetTrack);
        if (role.targetStationId === null) {
          expect(role.isComingSoon).toBe(true);
        }
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // Backend Role Testing
  // ─────────────────────────────────────────────────────────────────
  describe("Backend: Logic and Boundary Values", () => {
    describe("evaluateNumericCondition", () => {
      it("evaluates standard >= condition accurately", () => {
        expect(evaluateNumericCondition("purchasesCount >= 5", "purchasesCount", 4)).toBe(false);
        expect(evaluateNumericCondition("purchasesCount >= 5", "purchasesCount", 5)).toBe(true);
        expect(evaluateNumericCondition("purchasesCount >= 5", "purchasesCount", 6)).toBe(true);
      });

      it("evaluates reversed format: 5 <= purchasesCount", () => {
        expect(evaluateNumericCondition("5 <= purchasesCount", "purchasesCount", 4)).toBe(false);
        expect(evaluateNumericCondition("5 <= purchasesCount", "purchasesCount", 5)).toBe(true);
        expect(evaluateNumericCondition("5 <= purchasesCount", "purchasesCount", 6)).toBe(true);
      });

      it("rejects invalid syntax or unknown variables", () => {
        expect(() => evaluateNumericCondition("x = 5", "purchasesCount", 5)).toThrow();
        expect(() => evaluateNumericCondition("randomVar >= 5", "purchasesCount", 5)).toThrow();
      });
    });

    describe("validateBackendWeDo (Free shipping threshold)", () => {
      it("passes when rule is cartTotal >= 500 and assert is checked", () => {
        const res = validateBackendWeDo("cartTotal >= 500", true);
        expect(res.passed).toBe(true);
        expect(res.boundaryTestsPassed).toBe(true);
      });

      it("fails if assert was not executed", () => {
        const res = validateBackendWeDo("cartTotal >= 500", false);
        expect(res.passed).toBe(false);
        expect(res.error).toMatch(/assertion was not executed/i);
      });

      it("fails on strict inequality cartTotal > 500", () => {
        const res = validateBackendWeDo("cartTotal > 500", true);
        expect(res.passed).toBe(false);
        expect(res.error).toBeDefined();
      });
    });

    describe("validateBackendYouDo (5th purchase onwards rule)", () => {
      it("passes when condition is purchasesCount >= 5 and boundary tests include [4, 5, 6]", () => {
        const res = validateBackendYouDo("purchasesCount >= 5", [4, 5, 6]);
        expect(res.passed).toBe(true);
        expect(res.conditionCorrect).toBe(true);
        expect(res.boundaryTestsPassed).toBe(true);
      });

      it("passes with reversed condition 5 <= purchasesCount", () => {
        const res = validateBackendYouDo("5 <= purchasesCount", [4, 5, 6]);
        expect(res.passed).toBe(true);
      });

      it("rejects incomplete boundary tests missing edge value 4 or 6", () => {
        const resMissing4 = validateBackendYouDo("purchasesCount >= 5", [5, 6, 10]);
        expect(resMissing4.passed).toBe(false);
        expect(resMissing4.error).toMatch(/must include 4, 5, and 6/i);

        const resMissing6 = validateBackendYouDo("purchasesCount >= 5", [4, 5]);
        expect(resMissing6.passed).toBe(false);
      });

      it("rejects erroneous strictly-greater-than condition purchasesCount > 5 even with full boundary set", () => {
        const res = validateBackendYouDo("purchasesCount > 5", [4, 5, 6]);
        expect(res.passed).toBe(false);
        expect(res.conditionCorrect).toBe(false);
        expect(res.boundaryTestsPassed).toBe(true);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // Cybersecurity Role Testing
  // ─────────────────────────────────────────────────────────────────
  describe("Cybersecurity: SOC Threat Analysis & False Positive Trap", () => {
    describe("validateCyberWeDo", () => {
      it("passes when attacker IP 203.0.113.77 is blocked and legit verification is confirmed", () => {
        const res = validateCyberWeDo("203.0.113.77", true);
        expect(res.passed).toBe(true);
        expect(res.isFalsePositive).toBe(false);
      });

      it("fails if legit traffic check is unconfirmed", () => {
        const res = validateCyberWeDo("203.0.113.77", false);
        expect(res.passed).toBe(false);
        expect(res.error).toMatch(/verification check was not confirmed/i);
      });

      it("fails if wrong IP is selected", () => {
        const res = validateCyberWeDo("10.0.0.15", true);
        expect(res.passed).toBe(false);
      });
    });

    describe("validateCyberYouDo (The Trap)", () => {
      it("detects false positive penalty when user bans the most frequent innocent IP 198.51.100.88", () => {
        const res = validateCyberYouDo("198.51.100.88");
        expect(res.passed).toBe(false);
        expect(res.isFalsePositive).toBe(true);
        expect(res.error).toMatch(/False positive/i);
      });

      it("passes when real attacker 192.0.2.144 (401 spammer) is blocked", () => {
        const res = validateCyberYouDo("192.0.2.144");
        expect(res.passed).toBe(true);
        expect(res.isFalsePositive).toBe(false);
      });

      it("rejects unrelated IP", () => {
        const res = validateCyberYouDo("10.0.1.5");
        expect(res.passed).toBe(false);
        expect(res.isFalsePositive).toBe(false);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // Game Design Role Testing
  // ─────────────────────────────────────────────────────────────────
  describe("Game Design: Deterministic Combat Balancing", () => {
    describe("validateGameDesignWeDo", () => {
      it("passes when armor is set to 20 resulting in 10-12s battle duration", () => {
        const res = validateGameDesignWeDo(20, true);
        expect(res.passed).toBe(true);
        expect(res.avgDuration).toBeGreaterThanOrEqual(10.0);
        expect(res.avgDuration).toBeLessThanOrEqual(12.0);
      });

      it("fails if simulation was not run", () => {
        const res = validateGameDesignWeDo(20, false);
        expect(res.passed).toBe(false);
      });

      it("fails when armor is 0 (fight too fast)", () => {
        const res = validateGameDesignWeDo(0, true);
        expect(res.passed).toBe(false);
        expect(res.avgDuration).toBeLessThan(10.0);
      });
    });

    describe("validateGameDesignYouDo (Multi-seed validation)", () => {
      it("passes across all seeds when balanced: bossDamage=40, potionHeal=45, potionCount=2", () => {
        const balancedParams = {
          bossDamage: 40,
          bossCooldownSec: 1.8,
          potionHeal: 45,
          potionCount: 2,
        };
        const res = validateGameDesignYouDo(balancedParams, [42, 99, 1337]);
        expect(res.passed).toBe(true);
        expect(res.winRate).toBeGreaterThanOrEqual(0.45);
        expect(res.winRate).toBeLessThanOrEqual(0.55);
        expect(res.avgBattleDurationSec).toBeGreaterThanOrEqual(10.0);
        expect(res.avgBattleDurationSec).toBeLessThanOrEqual(15.0);
      });

      it("fails when boss damage is overpowered (bossDamage=80): winRate too low", () => {
        const overpoweredBoss = {
          bossDamage: 80,
          bossCooldownSec: 1.0,
          potionHeal: 20,
          potionCount: 1,
        };
        const res = validateGameDesignYouDo(overpoweredBoss, [42, 99]);
        expect(res.passed).toBe(false);
        expect(res.failedCriteria).toContain("winRateTooLow");
      });

      it("fails when boss is underpowered (bossDamage=15): winRate too high and fight too slow", () => {
        const underpoweredBoss = {
          bossDamage: 15,
          bossCooldownSec: 2.5,
          potionHeal: 50,
          potionCount: 3,
        };
        const res = validateGameDesignYouDo(underpoweredBoss, [42, 99]);
        expect(res.passed).toBe(false);
        expect(res.winRate).toBeGreaterThan(0.55);
      });
    });
  });
});
