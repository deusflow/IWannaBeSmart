/**
 * @file packages/sim-engine/src/__tests__/labScenarios.test.ts
 * @description Unit tests validating POE scenarios, firmware logic challenges, and crash test gates
 */

import { describe, it, expect } from "vitest";
import {
  POE_SCENARIOS,
  LOGIC_BLOCKS,
  LOGIC_CHALLENGES,
  STATION_CRASH_GATES,
} from "../runtime/labs/labScenarios";

describe("Educational Micro-Labs Scenarios", () => {
  describe("Predict-Observe-Explain (POE) Scenarios", () => {
    it("has at least one scenario per primary station with valid structure", () => {
      expect(POE_SCENARIOS.length).toBeGreaterThanOrEqual(10);
      const coveredStations = new Set(POE_SCENARIOS.map((s) => s.stationId));
      const expectedStations = ["tv", "pos", "iot", "api", "git", "bandit", "vertex", "fde", "rag", "cyber"] as const;
      for (const st of expectedStations) {
        expect(coveredStations.has(st)).toBe(true);
      }

      for (const scenario of POE_SCENARIOS) {
        expect(scenario.id).toBeTruthy();
        expect(scenario.stationId).toBeTruthy();
        expect(scenario.codeSnippet).toBeTruthy();
        expect(scenario.options.length).toBeGreaterThanOrEqual(2);
        expect(scenario.rewardXp).toBeGreaterThan(0);

        // Exactly one option should be correct
        const correctOpts = scenario.options.filter((o) => o.isCorrect);
        expect(correctOpts.length).toBe(1);
        expect(correctOpts[0].explanationKey).toBeTruthy();
      }
    });
  });

  describe("Firmware Logic Builder", () => {
    it("has valid logic blocks with unique IDs and categories", () => {
      const blockEntries = Object.entries(LOGIC_BLOCKS);
      expect(blockEntries.length).toBeGreaterThanOrEqual(5);

      for (const [id, block] of blockEntries) {
        expect(block.id).toBe(id);
        expect(block.nameKey).toBeTruthy();
        expect(block.category).toMatch(/^(guard|computation|mutation|io)$/);
        expect(block.codePreview).toBeTruthy();
      }
    });

    it("has solvable logic challenges whose expected sequence uses available blocks", () => {
      expect(LOGIC_CHALLENGES.length).toBeGreaterThanOrEqual(3);

      for (const challenge of LOGIC_CHALLENGES) {
        expect(challenge.availableBlockIds.length).toBeGreaterThanOrEqual(3);
        expect(challenge.expectedSequence.length).toBeGreaterThanOrEqual(3);

        // Every expected block must be available
        for (const blockId of challenge.expectedSequence) {
          expect(challenge.availableBlockIds).toContain(blockId);
          expect(LOGIC_BLOCKS[blockId]).toBeDefined();
        }
      }
    });
  });

  describe("Station Crash Test Gates", () => {
    it("configures valid crash gates with timeout and incidents", () => {
      const gates = Object.values(STATION_CRASH_GATES);
      expect(gates.length).toBeGreaterThanOrEqual(10);
      const expectedStations = ["tv", "pos", "iot", "api", "git", "bandit", "vertex", "fde", "rag", "cyber"];
      for (const st of expectedStations) {
        expect(STATION_CRASH_GATES[st]).toBeDefined();
      }

      for (const gate of gates) {
        expect(gate.stationId).toBeTruthy();
        expect(gate.timeLimitSeconds).toBeGreaterThan(30);
        expect(gate.rewardXp).toBeGreaterThanOrEqual(50);
        expect(gate.incidents.length).toBeGreaterThanOrEqual(1);

        for (const inc of gate.incidents) {
          expect(inc.severity).toMatch(/^(SEV-1|SEV-2)$/);
          expect(inc.actions.length).toBeGreaterThanOrEqual(2);

          const correctActions = inc.actions.filter((a) => a.isCorrect);
          expect(correctActions.length).toBe(1);
        }
      }
    });
  });
});

