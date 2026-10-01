/**
 * @file apps/web/src/components/__tests__/guidedWalkthrough.test.ts
 * @description Comprehensive unit tests for Guided Walkthrough State Machine and Didactic Rules.
 */

import { describe, it, expect } from "vitest";
import { GUIDED_STEPS_BY_ROLE } from "../workbench/express/guided/walkthroughStateMachine";
import {
  ROLE_TASTER_REGISTRY,
  validateBackendWeDo,
  validateBackendYouDo,
  validateCyberWeDo,
  validateCyberYouDo,
  validateGameDesignWeDo,
  validateGameDesignYouDo,
} from "@iw/sim-engine";

describe("Guided Walkthrough State Machine Integrity", () => {
  it("should have steps defined for every role in the taster registry", () => {
    ROLE_TASTER_REGISTRY.forEach((role) => {
      const steps = GUIDED_STEPS_BY_ROLE[role.id as keyof typeof GUIDED_STEPS_BY_ROLE];
      expect(steps).toBeDefined();
      expect(steps.length).toBeGreaterThanOrEqual(5);
    });
  });

  it("should enforce atomic focus targetId on every step", () => {
    Object.values(GUIDED_STEPS_BY_ROLE).forEach((steps) => {
      steps.forEach((step) => {
        expect(step.targetId).toBeDefined();
        expect(step.targetId.trim().length).toBeGreaterThan(0);
        expect(step.actionType).toMatch(/^(next|type|run|multi-run|select)$/);
      });
    });
  });

  it("should validate Backend follow-along and atomic you-do steps", () => {
    // We Do
    expect(validateBackendWeDo(">=", true).passed).toBe(true);
    expect(validateBackendWeDo(">", true).passed).toBe(false);
    expect(validateBackendWeDo(">=", false).passed).toBe(false);

    // You Do Condition + Boundaries
    expect(validateBackendYouDo("purchasesCount >= 5", [4, 5, 6]).passed).toBe(true);
    expect(validateBackendYouDo("5 <= purchasesCount", [4, 5, 6]).passed).toBe(true);
    // Strict > fails boundary 5
    expect(validateBackendYouDo("purchasesCount > 5", [4, 5, 6]).passed).toBe(false);
    // Missing boundary fails test
    expect(validateBackendYouDo("purchasesCount >= 5", [5, 6]).passed).toBe(false);
  });

  it("should validate Cyber follow-along and honest log analysis", () => {
    // We Do
    expect(validateCyberWeDo("203.0.113.77", true).passed).toBe(true);
    expect(validateCyberWeDo("10.0.0.15", true).passed).toBe(false);

    // You Do
    const correctRes = validateCyberYouDo("192.0.2.144");
    expect(correctRes.passed).toBe(true);
    expect(correctRes.isFalsePositive).toBe(false);

    // False positive innocent client
    const innocentRes = validateCyberYouDo("198.51.100.88");
    expect(innocentRes.passed).toBe(false);
    expect(innocentRes.isFalsePositive).toBe(true);
  });

  it("should validate Game Design follow-along and multi-seed balance", () => {
    // We Do Armor
    expect(validateGameDesignWeDo(20, true).passed).toBe(true);
    expect(validateGameDesignWeDo(10, true).passed).toBe(false);

    // You Do Multi-Seed Balance
    const balancedRes = validateGameDesignYouDo(
      {
        bossDamage: 40,
        bossCooldownSec: 1.8,
        potionHeal: 45,
        potionCount: 2,
      },
      [42, 99, 1337]
    );
    expect(balancedRes.passed).toBe(true);
    expect(balancedRes.avgBattleDurationSec).toBeGreaterThanOrEqual(10);
    expect(balancedRes.avgBattleDurationSec).toBeLessThanOrEqual(15);
    expect(balancedRes.winRate).toBeGreaterThanOrEqual(0.45);
    expect(balancedRes.winRate).toBeLessThanOrEqual(0.55);
  });
});
