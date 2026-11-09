/**
 * @file apps/web/src/components/__tests__/taskPointerData.test.ts
 * @description Unit tests for didactic task pointer metadata and syntax anatomy across all levels
 */

import { describe, it, expect } from "vitest";
import { CODING_TASKS } from "@iw/sim-engine";
import {
  TASK_POINTER_METADATA,
  getTaskPointerMeta,
  getSyntaxAnatomy,
} from "../workbench/playground/taskPointerData";

describe("taskPointerData - Progressive Guidance & Aha! Celebrations", () => {
  it("should have metadata for all 18 CODING_TASKS of Smart TV", () => {
    expect(CODING_TASKS.length).toBe(18);

    CODING_TASKS.forEach((task) => {
      const meta = TASK_POINTER_METADATA[task.id];
      expect(meta, `Missing pointer metadata for task ${task.id}`).toBeDefined();
      expect(meta.tier).toBe(task.tier ?? 0);

      // Verify all 3 languages have non-empty values
      const locales = ["ua", "en", "da"] as const;
      locales.forEach((loc) => {
        expect(meta.shortLabel[loc].trim().length).toBeGreaterThan(0);
        expect(meta.goal[loc].trim().length).toBeGreaterThan(0);
        expect(meta.ahaTitle[loc].trim().length).toBeGreaterThan(0);
        expect(meta.ahaDesc[loc].trim().length).toBeGreaterThan(0);
      });
    });
  });

  it("should correctly localize task pointer metadata through getTaskPointerMeta", () => {
    const metaUa = getTaskPointerMeta("task-0-1-power-on", "ua");
    expect(metaUa.shortLabel).toBe("1. Увімкнення");
    expect(metaUa.ahaTitle).toContain("Телевізор увімкнувся");

    const metaEn = getTaskPointerMeta("task-0-1-power-on", "en");
    expect(metaEn.shortLabel).toBe("1. Power On");
    expect(metaEn.ahaTitle).toContain("TV turned on");

    const metaDa = getTaskPointerMeta("task-0-1-power-on", "da");
    expect(metaDa.shortLabel).toBe("1. Tænd");
    expect(metaDa.ahaTitle).toContain("Fjernsynet tændte");
  });

  it("should provide safe fallback for unknown task IDs", () => {
    const fallback = getTaskPointerMeta("unknown-task-id", "ua");
    expect(fallback.shortLabel).toBe("#unknown-task-id");
    expect(fallback.goal.length).toBeGreaterThan(0);
    expect(fallback.ahaTitle.length).toBeGreaterThan(0);
  });

  it("should return syntax anatomy tokens for each task in C# and Go", () => {
    CODING_TASKS.forEach((task) => {
      const tokensCs = getSyntaxAnatomy(task.id, "csharp", "ua");
      expect(tokensCs.length).toBeGreaterThan(0);
      tokensCs.forEach((tok) => {
        expect(tok.token.length).toBeGreaterThan(0);
        expect(tok.label.length).toBeGreaterThan(0);
      });

      const tokensGo = getSyntaxAnatomy(task.id, "go", "ua");
      expect(tokensGo.length).toBeGreaterThan(0);
    });
  });
});

