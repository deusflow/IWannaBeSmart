/**
 * @file packages/sim-engine/src/__tests__/localeCompleteness.test.ts
 * @description Vitest test suite to enforce 100% localization parity across UA, EN, DA:
 * 1. Root and nested locale keys match perfectly between English, Ukrainian, and Danish.
 * 2. All Worked Examples provide authentic localized English and Danish translations.
 * 3. All Task Didactics provide authentic localized English and Danish translations.
 */

import { describe, it, expect } from "vitest";
import { WORKED_EXAMPLES } from "../runtime";
import {
  enTranslation,
  uaTranslation,
  daTranslation,
  getLocalizedWorkedExample,
  getLocalizedTaskDidactic,
  TASK_DIDACTIC_EN,
  TASK_DIDACTIC_DA,
} from "@iw/i18n";

function flattenKeys(obj: Record<string, any>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      keys = keys.concat(flattenKeys(val, newPrefix));
    } else {
      keys.push(newPrefix);
    }
  }
  return keys;
}

describe("Localization Parity & Completeness (UA, EN, DA)", () => {
  const enFlat = flattenKeys(enTranslation).sort();
  const uaFlat = flattenKeys(uaTranslation).sort();
  const daFlat = flattenKeys(daTranslation).sort();

  it("should have identical key counts across all three locales", () => {
    expect(enFlat.length).toBeGreaterThan(1100);
    expect(enFlat.length).toBe(uaFlat.length);
    expect(enFlat.length).toBe(daFlat.length);
  });

  it("should have 0 missing keys between EN and UA", () => {
    const missingInUa = enFlat.filter((k) => !uaFlat.includes(k));
    const missingInEn = uaFlat.filter((k) => !enFlat.includes(k));
    expect(missingInUa).toEqual([]);
    expect(missingInEn).toEqual([]);
  });

  it("should have 0 missing keys between EN and DA", () => {
    const missingInDa = enFlat.filter((k) => !daFlat.includes(k));
    const missingInEn = daFlat.filter((k) => !enFlat.includes(k));
    expect(missingInDa).toEqual([]);
    expect(missingInEn).toEqual([]);
  });

  it("should have valid, non-empty localized worked examples in EN and DA for every task", () => {
    const taskIds = Object.keys(WORKED_EXAMPLES);
    expect(taskIds.length).toBeGreaterThanOrEqual(43);

    for (const taskId of taskIds) {
      const baseEx = WORKED_EXAMPLES[taskId];
      const enEx = getLocalizedWorkedExample(baseEx, taskId, "en");
      const daEx = getLocalizedWorkedExample(baseEx, taskId, "da");

      expect(enEx).toBeDefined();
      expect(daEx).toBeDefined();

      // Check hardwareEffect
      const enHardware = typeof enEx!.demonstrationLog.hardwareEffect === "string"
        ? enEx!.demonstrationLog.hardwareEffect
        : enEx!.demonstrationLog.hardwareEffect.en;
      const daHardware = typeof daEx!.demonstrationLog.hardwareEffect === "string"
        ? daEx!.demonstrationLog.hardwareEffect
        : daEx!.demonstrationLog.hardwareEffect.da;
      expect(enHardware.length).toBeGreaterThan(0);
      expect(daHardware.length).toBeGreaterThan(0);

      // Check explanation
      const enExp = typeof enEx!.explanation === "string"
        ? enEx!.explanation
        : enEx!.explanation.en;
      const daExp = typeof daEx!.explanation === "string"
        ? daEx!.explanation
        : daEx!.explanation.da;
      expect(enExp.length).toBeGreaterThan(0);
      expect(daExp.length).toBeGreaterThan(0);

      // Check final challenge prompt
      const enPrompt = typeof enEx!.finalChallenge.prompt === "string"
        ? enEx!.finalChallenge.prompt
        : enEx!.finalChallenge.prompt.en;
      const daPrompt = typeof daEx!.finalChallenge.prompt === "string"
        ? daEx!.finalChallenge.prompt
        : daEx!.finalChallenge.prompt.da;
      expect(enPrompt.length).toBeGreaterThan(0);
      expect(daPrompt.length).toBeGreaterThan(0);

      // Check terminal log entries
      expect(enEx!.demonstrationLog.terminal.length).toBeGreaterThan(0);
      expect(daEx!.demonstrationLog.terminal.length).toBeGreaterThan(0);
    }
  });

  it("should have comprehensive didactics translations in EN and DA for all covered tasks", () => {
    const didacticsEnKeys = Object.keys(TASK_DIDACTIC_EN);
    const didacticsDaKeys = Object.keys(TASK_DIDACTIC_DA);

    expect(didacticsEnKeys.length).toBeGreaterThanOrEqual(33);
    expect(didacticsDaKeys.length).toBeGreaterThanOrEqual(33);
    expect(didacticsEnKeys.sort()).toEqual(didacticsDaKeys.sort());

    for (const taskId of didacticsEnKeys) {
      const enD = TASK_DIDACTIC_EN[taskId];
      const daD = TASK_DIDACTIC_DA[taskId];

      if (enD.whyThisCode) {
        expect(enD.whyThisCode.csharp.length).toBeGreaterThan(0);
        expect(daD.whyThisCode?.csharp.length).toBeGreaterThan(0);
      }
      if (enD.primitiveMemoryNote) {
        expect(enD.primitiveMemoryNote.csharp.length).toBeGreaterThan(0);
        expect(daD.primitiveMemoryNote?.csharp.length).toBeGreaterThan(0);
      }
      if (enD.architectureMap) {
        expect(enD.architectureMap.canvasWiring.length).toBeGreaterThan(0);
        expect(daD.architectureMap?.canvasWiring.length).toBeGreaterThan(0);
      }
    }
  });
});
