/**
 * @file packages/sim-engine/src/__tests__/codeGymTasks.test.ts
 * @description Vitest suite for TV Module Code Gym (3-Star Mastery) Tasks & Execution Engine
 */

import { describe, it, expect } from "vitest";
import {
  CODING_TASKS,
  executeTvScript,
  type VirtualTvState,
} from "../index";

describe("TV Code Gym (3-Star Mastery) Tasks & Engine", () => {
  it("should contain at least 13 TV tasks", () => {
    expect(CODING_TASKS.length).toBeGreaterThanOrEqual(13);
  });

  describe.each(CODING_TASKS)("Task $order: $id (Tier $tier)", (task) => {
    it("should possess valid cloze templates and sprint time limit", () => {
      expect(task.targetCode?.csharp).toBeTruthy();
      expect(task.targetCode?.go).toBeTruthy();
      expect(task.clozeTemplate?.csharp).toContain("___");
      expect(task.clozeTemplate?.go).toContain("___");
      expect(task.sprintTimeLimit).toBeGreaterThanOrEqual(15);
    });

    it("should execute and validate targetCode in C#", () => {
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
      expect(resultCs.success).toBe(true);

      const valCs = task.validate(beforeStateCs, resultCs.newState, resultCs, task.targetCode.csharp);
      expect(valCs.passed).toBe(true);
    });

    it("should execute and validate targetCode in Go", () => {
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
      expect(resultGo.success).toBe(true);

      const valGo = task.validate(beforeStateGo, resultGo.newState, resultGo, task.targetCode.go);
      expect(valGo.passed).toBe(true);
    });
  });

  describe("Architecture Studio Broken Wire Bridge", () => {
    const unWiredState: VirtualTvState = {
      isOn: false,
      channel: 1,
      volume: 45,
      isArchitectureWired: false,
    };

    it("should throw NullReferenceException when hardware wire is broken", () => {
      const result = executeTvScript("command.Execute();", unWiredState);
      expect(result.success).toBe(false);
      expect(result.error).toContain("NullReferenceException");
    });

    it("should restore hardware wire when DI registration is applied", () => {
      const result = executeTvScript(
        "services.AddTransient<IRemoteCommand, CalcCommand>();",
        unWiredState
      );
      expect(result.success).toBe(true);
      expect(result.newState.isArchitectureWired).toBe(true);
    });

    it("should throw NullReferenceException when an unregistered key is requested", () => {
      const result = executeTvScript('registry["UNKNOWN"].Execute();', unWiredState);
      expect(result.success).toBe(false);
      expect(result.error).toContain("NullReferenceException");
    });
  });

  describe("Cyber Bandit Lab Code Gym (Station 06)", () => {
    it("should contain 6 Bandit tasks with valid target codes and cloze templates", async () => {
      const { BANDIT_TASKS, executeBanditScript } = await import("../index");
      expect(BANDIT_TASKS.length).toBe(6);

      for (const task of BANDIT_TASKS) {
        expect(task.targetCode.csharp).toBeTruthy();
        expect(task.targetCode.go).toBeTruthy();
        expect(task.clozeTemplate.csharp).toContain("[[");
        expect(task.clozeTemplate.go).toContain("[[");

        // Validate C#
        const resCs = executeBanditScript(task.targetCode.csharp, "csharp", task.id);
        expect(resCs.success, `Task ${task.id} C# failed: ${resCs.output}`).toBe(true);

        const valCs = task.validate(task.initialState, task.initialState, resCs, task.targetCode.csharp);
        expect(valCs.passed).toBe(true);

        // Validate Go
        const resGo = executeBanditScript(task.targetCode.go, "go", task.id);
        expect(resGo.success, `Task ${task.id} Go failed: ${resGo.output}`).toBe(true);

        const valGo = task.validate(task.initialState, task.initialState, resGo, task.targetCode.go);
        expect(valGo.passed).toBe(true);
      }
    });
  });
});
