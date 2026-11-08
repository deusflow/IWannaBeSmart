/**
 * @file packages/sim-engine/src/__tests__/xrayScenarios.test.ts
 * @description Unit tests for X-Ray execution flow and DI race scenarios
 */

import { describe, it, expect } from "vitest";
import { XRAY_SCENARIOS, DI_RACE_SCENARIOS } from "../runtime/labs/xrayScenarios";

describe("X-Ray & DI Race Scenarios Integrity", () => {
  describe("X-Ray Scenarios", () => {
    it("should have at least one X-Ray scenario configured", () => {
      expect(XRAY_SCENARIOS.length).toBeGreaterThanOrEqual(1);
    });

    it("should have exactly 3 files for every X-Ray scenario", () => {
      for (const scenario of XRAY_SCENARIOS) {
        expect(scenario.files.length).toBe(3);
        const fileIds = new Set(scenario.files.map((f) => f.id));
        expect(fileIds.size).toBe(3);
      }
    });

    it("should have valid steps with existing fileId and in-bounds line index", () => {
      for (const scenario of XRAY_SCENARIOS) {
        expect(scenario.steps.length).toBeGreaterThanOrEqual(6);
        expect(scenario.steps.length).toBeLessThanOrEqual(10);
        expect(scenario.rewardXp).toBeGreaterThan(0);

        const fileMap = new Map(scenario.files.map((f) => [f.id, f]));

        for (const step of scenario.steps) {
          expect(fileMap.has(step.fileId)).toBe(true);
          const file = fileMap.get(step.fileId)!;
          expect(step.line).toBeGreaterThanOrEqual(0);
          expect(step.line).toBeLessThan(file.lines.length);
          expect(step.noteKey).toBeTruthy();
          expect(step.defaultNote).toBeTruthy();
        }
      }
    });

    it("should not contain raw Cyrillic comments in code lines", () => {
      for (const scenario of XRAY_SCENARIOS) {
        for (const file of scenario.files) {
          for (const line of file.lines) {
            // Lines of code must have zero Cyrillic characters
            expect(/[а-яА-ЯіїєґІЇЄҐ]/.test(line)).toBe(false);
          }
        }
      }
    });
  });

  describe("DI Race Scenarios", () => {
    it("should have at least one DI race scenario configured", () => {
      expect(DI_RACE_SCENARIOS.length).toBeGreaterThanOrEqual(1);
    });

    it("should have exactly 5 consumer files and valid parameters", () => {
      for (const scenario of DI_RACE_SCENARIOS) {
        expect(scenario.consumerFiles.length).toBe(5);
        expect(scenario.oldService).toBeTruthy();
        expect(scenario.newService).toBeTruthy();
        expect(scenario.timeLimitSeconds).toBeGreaterThanOrEqual(5);
        expect(scenario.rewardXp).toBeGreaterThan(0);
        expect(scenario.titleKey).toBeTruthy();
        expect(scenario.defaultTitle).toBeTruthy();
      }
    });
  });
});

