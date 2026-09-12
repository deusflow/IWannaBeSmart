/**
 * @file packages/sim-engine/src/__tests__/posEngine.test.ts
 * @description Vitest suite for Fintech POS Execution Engine & Tasks 1-6
 */

import { describe, it, expect } from "vitest";
import {
  FINTECH_TASKS,
  executePosScript,
  CODING_TASKS,
} from "../index";

describe("Fintech POS Engine & Security Tasks", () => {
  it("should contain all 6+ designed fintech tasks", () => {
    expect(FINTECH_TASKS.length).toBeGreaterThanOrEqual(6);
  });

  describe("Task 1: Guard Clause Validation", () => {
    const task = FINTECH_TASKS[0];

    it("should decline insufficient balance in C#", () => {
      const res = executePosScript(task.targetCode.csharp, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.status).toBe("DECLINED");
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.csharp).passed).toBe(true);
    });

    it("should decline insufficient balance in Go", () => {
      const res = executePosScript(task.targetCode.go, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.status).toBe("DECLINED");
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.go).passed).toBe(true);
    });
  });

  describe("Task 2: Transaction Fee Calculation", () => {
    const task = FINTECH_TASKS[1];

    it("should calculate total amount and remaining balance in C#", () => {
      const res = executePosScript(task.targetCode.csharp, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.totalAmount).toBe(135);
      expect(res.newState.balance).toBe(365);
      expect(res.newState.status).toBe("APPROVED");
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.csharp).passed).toBe(true);
    });

    it("should calculate total amount and remaining balance in Go", () => {
      const res = executePosScript(task.targetCode.go, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.totalAmount).toBe(135);
      expect(res.newState.balance).toBe(365);
      expect(res.newState.status).toBe("APPROVED");
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.go).passed).toBe(true);
    });
  });

  describe("Task 3: PIN Brute-force Lockout Guard", () => {
    const task = FINTECH_TASKS[2];

    it("should lock terminal upon 3 failed attempts in C#", () => {
      const res = executePosScript(task.targetCode.csharp, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.failedAttempts).toBe(3);
      expect(res.newState.isLocked).toBe(true);
      expect(res.newState.status).toBe("BLOCKED");
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.csharp).passed).toBe(true);
    });

    it("should lock terminal upon 3 failed attempts in Go", () => {
      const res = executePosScript(task.targetCode.go, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.failedAttempts).toBe(3);
      expect(res.newState.isLocked).toBe(true);
      expect(res.newState.status).toBe("BLOCKED");
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.go).passed).toBe(true);
    });
  });

  describe("Task 4: Daily Total Summation", () => {
    const task = FINTECH_TASKS[3];

    it("should sum array of transactions in C#", () => {
      const res = executePosScript(task.targetCode.csharp, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.dailyTotal).toBe(550);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.csharp).passed).toBe(true);
    });

    it("should sum array of transactions in Go", () => {
      const res = executePosScript(task.targetCode.go, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.dailyTotal).toBe(550);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.go).passed).toBe(true);
    });
  });

  describe("Task 5 & 6: Polymorphic Payment Gateway DI", () => {
    const task5 = FINTECH_TASKS[4];
    const task6 = FINTECH_TASKS[5];

    it("should execute DankortGateway payment when registered", () => {
      const res = executePosScript(task5.targetCode.csharp, task5.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.status).toBe("APPROVED");
      expect(task5.validate(task5.initialState, res.newState, res, task5.targetCode.csharp).passed).toBe(true);
    });

    it("should configure DankortGateway in IoC container (Task 6)", () => {
      const res = executePosScript(task6.targetCode.csharp, task6.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.activeGateway).toBe("DankortGateway");
      expect(res.newState.isGatewayRegistered).toBe(true);
      expect(task6.validate(task6.initialState, res.newState, res, task6.targetCode.csharp).passed).toBe(true);
    });
  });

  describe("VirtualPOS Terminal Constraints & Regression", () => {
    it("should reject script execution when terminal is locked", () => {
      const lockedState = {
        ...FINTECH_TASKS[0].initialState,
        isLocked: true,
      };
      const res = executePosScript(FINTECH_TASKS[0].targetCode.csharp, lockedState);
      expect(res.success).toBe(false);
      expect(res.error).toContain("TERMINAL IS LOCKED");
    });

    it("should preserve TV Module tasks intact", () => {
      expect(CODING_TASKS.length).toBeGreaterThanOrEqual(13);
    });
  });
});
