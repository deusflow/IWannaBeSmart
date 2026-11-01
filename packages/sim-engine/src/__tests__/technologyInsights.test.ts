/**
 * @file packages/sim-engine/src/__tests__/technologyInsights.test.ts
 * @description Unit tests verifying that every task in the curriculum provides
 * authentic, complete real-world technology insights across UA, EN, DA.
 */

import { describe, it, expect } from "vitest";
import {
  ALL_CURRICULUM_TASKS,
  getTechnologyInsight,
  TECHNOLOGY_INSIGHTS,
} from "../runtime";

describe("Technology Insights & Industry Context", () => {
  it("has dedicated curated insights for key primary station tasks", () => {
    const keys = Object.keys(TECHNOLOGY_INSIGHTS);
    expect(keys.length).toBeGreaterThanOrEqual(25);

    // Verify key stations are explicitly covered with curated insights
    expect(TECHNOLOGY_INSIGHTS["task-0-1-power-on"]).toBeDefined();
    expect(TECHNOLOGY_INSIGHTS["task-pos-guard-clause"]).toBeDefined();
    expect(TECHNOLOGY_INSIGHTS["task-iot-1-motion-stop"]).toBeDefined();
    expect(TECHNOLOGY_INSIGHTS["task-api-1-heartbeat"]).toBeDefined();
    expect(TECHNOLOGY_INSIGHTS["task-git-1-genesis"]).toBeDefined();
    expect(TECHNOLOGY_INSIGHTS["task-bandit-1-hidden-key"]).toBeDefined();
    expect(TECHNOLOGY_INSIGHTS["task-vertex-3-pipeline-yaml"]).toBeDefined();
    expect(TECHNOLOGY_INSIGHTS["task-fde-7-agent-architecture"]).toBeDefined();
    expect(TECHNOLOGY_INSIGHTS["task-rag-1-chunking-overlap"]).toBeDefined();
    expect(TECHNOLOGY_INSIGHTS["task-cyber-4-syn-flood-detector"]).toBeDefined();
  });

  it("provides complete technology insight with all multilingual fields for 100% of curriculum tasks", () => {
    expect(ALL_CURRICULUM_TASKS.length).toBeGreaterThanOrEqual(90);

    for (const task of ALL_CURRICULUM_TASKS) {
      const insight = getTechnologyInsight(task.id);
      expect(insight).toBeDefined();
      expect(insight.primaryTech).toBeTruthy();
      expect(insight.category).toMatch(
        /^(protocol|pattern|architecture|security|database|cloud|hardware|network)$/
      );

      // What it is (working principle)
      expect(insight.whatIsIt.ua).toBeTruthy();
      expect(insight.whatIsIt.en).toBeTruthy();
      expect(insight.whatIsIt.da).toBeTruthy();

      // Why here (rationale in production)
      expect(insight.whyHere.ua).toBeTruthy();
      expect(insight.whyHere.en).toBeTruthy();
      expect(insight.whyHere.da).toBeTruthy();

      // Alternative & Trade-off
      expect(insight.alternative.name).toBeTruthy();
      expect(insight.alternative.tradeoff.ua).toBeTruthy();
      expect(insight.alternative.tradeoff.en).toBeTruthy();
      expect(insight.alternative.tradeoff.da).toBeTruthy();

      // Advantages list
      expect(insight.advantages.ua.length).toBeGreaterThanOrEqual(2);
      expect(insight.advantages.en.length).toBeGreaterThanOrEqual(2);
      expect(insight.advantages.da.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("supports fallback resolution for arbitrary station prefixes", () => {
    const unknownIot = getTechnologyInsight("task-iot-999-new-sensor");
    expect(unknownIot.primaryTech).toContain("MQTT");

    const unknownPos = getTechnologyInsight("task-pos-999-crypto-check");
    expect(unknownPos.primaryTech).toContain("ISO 8583");

    const unknownApi = getTechnologyInsight("task-api-999-stream");
    expect(unknownApi.primaryTech).toContain("HTTP/2");

    const unknownGit = getTechnologyInsight("task-git-999-cherry-pick");
    expect(unknownGit.primaryTech).toContain("Merkle");

    const unknownRag = getTechnologyInsight("task-rag-999-reranker");
    expect(unknownRag.primaryTech).toContain("Hybrid RRF");
  });
});
